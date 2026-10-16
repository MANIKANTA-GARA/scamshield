package com.scamshield.app.alert

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.scamshield.app.MainActivity
import com.scamshield.app.engine.RiskLevel
import com.scamshield.app.engine.ThreatAssessment
import java.util.concurrent.ConcurrentHashMap

/**
 * AlertManager
 * Dispatches immediate Android security notifications for detected threats.
 * Implements deduplication, rate-limiting, and lock screen privacy safeguards.
 */
object AlertManager {

    const val CHANNEL_ID = "scamshield_security_alerts"
    private const val CHANNEL_NAME = "ScamShield Security Alerts"
    private const val CHANNEL_DESC = "Instant notifications when high-risk scams or phishing are automatically detected"

    // Deduplication cache: stores hash -> timestamp
    private val alertHistory = ConcurrentHashMap<String, Long>()
    private const val DEDUP_COOLDOWN_MS = 120_000L // 2 minutes cooldown per unique threat signature

    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance).apply {
                description = CHANNEL_DESC
                enableVibration(true)
                enableLights(true)
                setShowBadge(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PRIVATE
            }
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    fun dispatchSecurityAlert(context: Context, threat: ThreatAssessment) {
        // Only notify for MEDIUM, HIGH, or CRITICAL threats
        if (threat.riskLevel == RiskLevel.LOW) {
            return
        }

        // Deduplication Check
        val dedupKey = "${threat.sourcePackage}:${threat.category}:${threat.confidenceScore}"
        val now = System.currentTimeMillis()
        val lastSent = alertHistory[dedupKey] ?: 0L

        if (now - lastSent < DEDUP_COOLDOWN_MS) {
            // Suppress duplicate alert within cooldown period
            return
        }
        alertHistory[dedupKey] = now

        // Clean up old deduplication entries
        if (alertHistory.size > 100) {
            alertHistory.entries.removeIf { now - it.value > DEDUP_COOLDOWN_MS }
        }

        // Create intent to open dashboard with threat details
        val openIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_THREAT_CATEGORY", threat.category)
            putExtra("EXTRA_THREAT_RISK", threat.riskLevel.name)
            putExtra("EXTRA_THREAT_REASONS", ArrayList(threat.detectionReasons))
            putExtra("EXTRA_THREAT_SOURCE", threat.sourcePackage)
            putExtra("EXTRA_THREAT_ACTION", threat.recommendedAction)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            threat.timestamp.toInt(),
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val appLabel = formatPackageName(threat.sourcePackage)
        val alertTitle = "⚠️ SCAMSHIELD SECURITY ALERT [${threat.riskLevel}]"
        val alertContent = "Potential ${threat.category} detected in $appLabel. Tap to inspect safety actions."

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_warning)
            .setContentTitle(alertTitle)
            .setContentText(alertContent)
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("$alertContent\n\nRecommended Action: ${threat.recommendedAction}")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE) // Hide sensitive content from lockscreen
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .addAction(
                android.R.drawable.ic_menu_view,
                "Review Alert",
                pendingIntent
            )
            .build()

        try {
            val notificationId = (threat.timestamp % 100000).toInt()
            NotificationManagerCompat.from(context).notify(notificationId, notification)
        } catch (_: SecurityException) {
            // Notification permission might be revoked on Android 13+
        }
    }

    private fun formatPackageName(packageName: String): String {
        return when (packageName) {
            "com.whatsapp" -> "WhatsApp"
            "org.telegram.messenger" -> "Telegram"
            "com.google.android.apps.messaging" -> "SMS / Messages"
            "com.google.android.gm" -> "Gmail"
            else -> packageName.substringAfterLast(".")
        }
    }
}
