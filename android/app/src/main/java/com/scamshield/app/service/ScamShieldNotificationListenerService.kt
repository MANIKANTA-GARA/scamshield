package com.scamshield.app.service

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.scamshield.app.alert.AlertManager
import com.scamshield.app.data.EventRepository
import com.scamshield.app.engine.LocalDetectionEngine
import com.scamshield.app.engine.RiskLevel

/**
 * ScamShieldNotificationListenerService
 *
 * Automatically inspects accessible incoming notifications from user-selected apps
 * (SMS, WhatsApp, Telegram, Gmail, etc.) in the background.
 *
 * ZERO USER INPUT: Operates passively without requiring the user to copy/paste or submit content.
 */
class ScamShieldNotificationListenerService : NotificationListenerService() {

    private lateinit var repository: EventRepository

    override fun onCreate() {
        super.onCreate()
        repository = EventRepository.getInstance(applicationContext)
        AlertManager.createNotificationChannel(applicationContext)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName ?: return

        // Skip our own notifications to prevent recursion loops
        if (packageName == applicationContext.packageName) return

        // Check if the user has enabled monitoring for this package
        if (!repository.isPackageMonitored(packageName)) return

        val notification = sbn.notification ?: return

        // Ignore ongoing background system/media playback notifications
        if ((notification.flags and Notification.FLAG_ONGOING_EVENT) != 0) return

        // Extract text content from notification extras safely
        val extras = notification.extras ?: return
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: ""

        val fullContent = listOf(title, text, bigText)
            .filter { it.isNotBlank() }
            .distinct()
            .joinToString(". ")

        if (fullContent.isBlank()) return

        // Automatically run on-device detection engine
        val assessment = LocalDetectionEngine.analyze(fullContent, packageName)

        // If a threat (MEDIUM, HIGH, or CRITICAL) is detected:
        if (assessment.riskLevel != RiskLevel.LOW) {
            // 1. Save minimal event metadata in local privacy-safe repository
            repository.saveThreatEvent(assessment)

            // 2. Immediately dispatch a high-priority heads-up warning notification to the user
            AlertManager.dispatchSecurityAlert(applicationContext, assessment)
        }
    }
}
