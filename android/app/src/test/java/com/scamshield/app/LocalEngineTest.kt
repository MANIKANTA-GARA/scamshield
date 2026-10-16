package com.scamshield.app

import com.scamshield.app.engine.LocalDetectionEngine
import com.scamshield.app.engine.RiskLevel
import org.junit.Assert.*
import org.junit.Test

/**
 * LocalEngineTest
 *
 * Validates on-device detection rules across the 10 hackathon test scenarios.
 */
class LocalEngineTest {

    // 1. Suspicious Bank SMS
    @Test
    fun testSuspiciousBankSms() {
        val message = "Dear SBI Customer, Your account is suspended today due to KYC. Click http://sbi.bank-verify.top/login to update PAN immediately."
        val result = LocalDetectionEngine.analyze(message, "SMS")

        assertTrue(result.riskLevel == RiskLevel.HIGH || result.riskLevel == RiskLevel.CRITICAL)
        assertTrue(result.confidenceScore >= 50)
        assertTrue(result.detectionReasons.isNotEmpty())
        assertTrue(result.category.contains("Bank", ignoreCase = true) || result.category.contains("KYC", ignoreCase = true))
    }

    // 2. Urgent OTP Request
    @Test
    fun testUrgentOtpRequest() {
        val message = "Axis Fraud Prevention: Please share 6-digit OTP code sent to your phone immediately to unblock your card."
        val result = LocalDetectionEngine.analyze(message, "SMS")

        assertEquals(RiskLevel.CRITICAL, result.riskLevel)
        assertTrue(result.confidenceScore >= 80)
        assertTrue(result.category.contains("OTP", ignoreCase = true))
    }

    // 3. Phishing URL
    @Test
    fun testPhishingUrl() {
        val url = "https://sbi.bank-login-secure.top/kyc/update-pan"
        val result = LocalDetectionEngine.analyze(url, "Browser")

        assertTrue(result.riskLevel == RiskLevel.HIGH || result.riskLevel == RiskLevel.CRITICAL)
        assertTrue(result.extractedUrls.isNotEmpty())
        assertTrue(result.detectionReasons.any { it.contains("brand", ignoreCase = true) || it.contains("TLD", ignoreCase = true) })
    }

    // 4. Fraudulent Job Offer
    @Test
    fun testFraudulentJobOffer() {
        val message = "Earn ₹5,000 daily from home liking YouTube videos. Contact HR on Telegram @daily_task_portal."
        val result = LocalDetectionEngine.analyze(message, "WhatsApp")

        assertTrue(result.riskLevel == RiskLevel.HIGH || result.riskLevel == RiskLevel.CRITICAL)
        assertTrue(result.category.contains("Job", ignoreCase = true) || result.category.contains("Task", ignoreCase = true))
    }

    // 5. Legitimate Bank Notification (False-Positive Suppression)
    @Test
    fun testLegitimateBankNotification() {
        val message = "INR 500.00 debited from A/c XX4821 at Apollo Pharmacy. Bal: INR 12,450.00."
        val result = LocalDetectionEngine.analyze(message, "SMS")

        assertEquals(RiskLevel.LOW, result.riskLevel)
        assertTrue(result.confidenceScore <= 24)
        assertEquals("Legitimate Bank Transaction Alert", result.category)
    }

    // 6. Sensitive Data Redaction
    @Test
    fun testSensitiveDataRedaction() {
        val textWithOtp = "Your confidential OTP is 948201 for transaction. Card 4532 8901 2345 6789."
        val redacted = LocalDetectionEngine.redactSensitiveData(textWithOtp)

        assertFalse(redacted.contains("948201"))
        assertFalse(redacted.contains("4532 8901 2345 6789"))
        assertTrue(redacted.contains("[REDACTED-OTP]") || redacted.contains("[REDACTED-CODE]"))
        assertTrue(redacted.contains("[CARD-XXXX-6789]"))
    }

    // 7. Empty or Invalid Input
    @Test
    fun testEmptyInput() {
        val result = LocalDetectionEngine.analyze("", "SMS")
        assertEquals(RiskLevel.LOW, result.riskLevel)
        assertEquals(0, result.confidenceScore)
    }
}
