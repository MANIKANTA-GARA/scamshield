package com.scamshield.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

/**
 * ScamShield Native Android Share Receiver
 * Handles Intent.ACTION_SEND (text/plain) safely without:
 * 1. Background secret exfiltration
 * 2. Automatic URL navigation / visiting
 * 3. Logging sensitive OTPs or card numbers
 */
class ShareReceiverActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val sharedText = extractSharedText(intent)

        setContent {
            MaterialTheme {
                ShareReceiverDialog(
                    rawSharedText = sharedText,
                    onDismiss = { finish() },
                    onConfirmScan = { textToScan ->
                        openScamShieldWebApp(textToScan)
                        finish()
                    }
                )
            }
        }
    }

    private fun extractSharedText(intent: Intent?): String {
        if (intent == null || intent.action != Intent.ACTION_SEND) {
            return ""
        }
        val type = intent.type ?: ""
        if (!type.startsWith("text/")) {
            return ""
        }
        return intent.getStringExtra(Intent.EXTRA_TEXT)
            ?: intent.getStringExtra(Intent.EXTRA_SUBJECT)
            ?: ""
    }

    private fun openScamShieldWebApp(sanitizedText: String) {
        // Redact OTPs before putting in query parameters
        val maskedText = redactOtpLocally(sanitizedText)
        val encoded = URLEncoder.encode(maskedText, StandardCharsets.UTF_8.toString())
        
        // Configurable host: defaults to local Vite dev server on Android emulator (10.0.2.2:5173) or production URL
        val targetUrl = "http://10.0.2.2:5173/?shared_text=$encoded&source=android_native_share"

        val customTabsIntent = CustomTabsIntent.Builder()
            .setShowTitle(true)
            .build()

        customTabsIntent.launchUrl(this, Uri.parse(targetUrl))
    }

    private fun redactOtpLocally(text: String): String {
        // Simple fast local regex redacting 4-8 continuous digits near OTP or bank keywords
        val otpPattern = "(?i)(otp|code|pin|secret|verification)[\\s:=#-]*([0-9]{4,8})".toRegex()
        return text.replace(otpPattern) { matchResult ->
            val keyword = matchResult.groups[1]?.value ?: ""
            "$keyword [REDACTED-OTP]"
        }
    }
}

@Composable
fun ShareReceiverDialog(
    rawSharedText: String,
    onDismiss: () => Unit,
    onConfirmScan: (String) => Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(24.dp),
        color = Color(0xFF0B132B),
        tonalElevation = 8.dp
    ) {
        Column(
            modifier = Modifier
                .padding(24.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = "ScamShield AI",
                color = Color(0xFF00B4D8),
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Inspect Shared Content Before Opening",
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(12.dp))

            // Safety Warning Notice
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1C2541), RoundedCornerShape(12.dp))
                    .padding(12.dp)
            ) {
                Column {
                    Text(
                        text = "SAFETY PROTOCOL:",
                        color = Color(0xFFFFD166),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "ScamShield never executes or visits unverified target links automatically.",
                        color = Color(0xFF90E0EF),
                        fontSize = 11.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Content Preview:",
                color = Color.LightGray,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
            Spacer(modifier = Modifier.height(4.dp))

            // Text Preview Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 60.dp, max = 140.dp)
                    .background(Color(0xFF151D33), RoundedCornerShape(12.dp))
                    .padding(12.dp)
            ) {
                Text(
                    text = if (rawSharedText.isBlank()) "No text found in share intent." else rawSharedText,
                    color = Color.White,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = onDismiss) {
                    Text("Discard", color = Color.LightGray)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = { onConfirmScan(rawSharedText) },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00B4D8)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Scan in ScamShield", color = Color(0xFF0B132B), fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
