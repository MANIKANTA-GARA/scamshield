package com.scamshield.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.telephony.SmsMessage
import android.util.Log
import com.scamshield.app.ai.LocalLlamaEngine
import com.scamshield.app.alert.AlertManager
import com.scamshield.app.data.EventRepository
import com.scamshield.app.engine.LocalDetectionEngine
import com.scamshield.app.engine.RiskLevel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * SmsReceiver
 *
 * Automatically intercepts incoming SMS broadcasts on-device via Telephony.SMS_RECEIVED.
 *
 * STRICT OPERATIONAL RULES:
 * 1. Analyzes messages locally on-device.
 * 2. Runs fast local heuristics first, followed by on-device Local Llama AI when loaded.
 * 3. Never automatically replies to, deletes, forwards, or blocks SMS messages.
 * 4. Deduplicates notifications to prevent spam.
 * 5. Uses goAsync() to survive Android background execution limits safely.
 */
class SmsReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "ScamShieldSmsReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val pendingResult = goAsync()
        val repository = EventRepository.getInstance(context)

        // Launch in background scope to avoid blocking the main broadcast thread
        CoroutineScope(Dispatchers.Default).launch {
            try {
                val messages: Array<SmsMessage> = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return@launch
                if (messages.isEmpty()) return@launch

                // Reassemble multi-part SMS messages from the same sender
                val senderAddress = messages[0].displayOriginatingAddress ?: "Unknown Sender"
                val fullBody = messages.joinToString("") { it.displayMessageBody ?: "" }.trim()

                if (fullBody.isBlank()) return@launch

                Log.d(TAG, "Incoming SMS received from $senderAddress. Running on-device security inspection...")

                // 1. Run Fast Local Rules Baseline immediately
                val ruleAssessment = LocalDetectionEngine.analyze(
                    content = fullBody,
                    sourcePackage = "SMS: $senderAddress",
                    isSms = true
                )

                // 2. Perform deeper evaluation via Local Llama if model is ready in RAM
                val finalAssessment = LocalLlamaEngine.analyzeText(
                    context = context,
                    rawText = fullBody,
                    sourcePackage = "SMS: $senderAddress"
                )

                // 3. If suspicious (MEDIUM, HIGH, or CRITICAL):
                if (finalAssessment.riskLevel != RiskLevel.LOW) {
                    Log.w(TAG, "Scam indicator detected in SMS! Risk: ${finalAssessment.riskLevel}, Category: ${finalAssessment.category}")

                    // Save to local privacy-safe history (redacted, no raw OTPs/cards)
                    repository.saveThreatEvent(finalAssessment)

                    // Dispatch high-priority Android heads-up notification with safety instructions
                    AlertManager.dispatchSecurityAlert(context, finalAssessment)
                } else {
                    Log.d(TAG, "SMS classified as LOW risk (${finalAssessment.category}). Suppressing alert.")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error evaluating incoming SMS: ${e.message}", e)
            } finally {
                pendingResult.finish()
            }
        }
    }
}
