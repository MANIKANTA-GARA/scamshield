package com.scamshield.app.engine

import java.net.URI
import java.util.regex.Pattern

enum class RiskLevel {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

data class ThreatAssessment(
    val riskLevel: RiskLevel,
    val confidenceScore: Int, // 0 - 100
    val category: String,
    val detectionReasons: List<String>,
    val recommendedAction: String,
    val sourcePackage: String,
    val timestamp: Long = System.currentTimeMillis(),
    val redactedContent: String,
    val extractedUrls: List<String> = emptyList(),
    val isVerifiedThreatSource: Boolean = false,
    val aiAssisted: Boolean = false,
    val aiModelName: String? = null,
    val aiExplanation: String? = null
)

object LocalDetectionEngine {

    fun analyze(content: String, sourcePackage: String, isSms: Boolean = false): ThreatAssessment {
        val trimmed = content.trim()
        if (trimmed.isEmpty()) {
            return ThreatAssessment(
                riskLevel = RiskLevel.LOW,
                confidenceScore = 0,
                category = "Empty or Invalid Input",
                detectionReasons = listOf("No content provided for inspection."),
                recommendedAction = "Enter or paste message content to begin on-device inspection.",
                sourcePackage = sourcePackage,
                redactedContent = ""
            )
        }

        val lower = trimmed.lowercase()
        val reasons = mutableListOf<String>()
        var score = 0
        var category = "Routine Communication"

        // Redact OTPs, Aadhaar, and card numbers before any evaluation or logging
        val redacted = redactSensitiveData(trimmed)

        // Extract any URLs
        val extractedUrls = extractUrls(trimmed)

        // -------------------------------------------------------------
        // A. URL & Hostname Analysis
        // -------------------------------------------------------------
        for (url in extractedUrls) {
            try {
                val normalized = if (!url.startsWith("http://") && !url.startsWith("https://")) "http://$url" else url
                val uri = URI(normalized)
                val host = uri.host?.lowercase() ?: ""

                // 1. Direct IP Address Host
                if (Pattern.matches("^(\\d{1,3}\\.){3}\\d{1,3}$", host)) {
                    score += 55
                    reasons.add("Direct IP address host ($host) used instead of a registered domain.")
                }

                // 2. Punycode Homoglyph Domain
                if (host.contains("xn--")) {
                    score += 50
                    reasons.add("Punycode domain detected (potential homoglyph visual spoofing).")
                }

                // 3. High-Risk / Disposable TLD
                val tld = host.substringAfterLast(".", "")
                if (ThreatIndicatorDatabase.suspiciousTlds.contains(tld)) {
                    score += 35
                    reasons.add("Domain uses high-risk, disposable top-level domain (.$tld).")
                }

                // 4. URL Shortener Service
                if (ThreatIndicatorDatabase.shortenedDomains.contains(host)) {
                    score += 25
                    reasons.add("URL shortener ($host) hides the true final destination link.")
                }

                // 5. Deceptive Verification Keywords in Host
                for (keyword in ThreatIndicatorDatabase.deceptiveHostKeywords) {
                    if (host.contains(keyword)) {
                        score += 45
                        reasons.add("Deceptive hostname pattern detected: '$host' mimics a verification portal.")
                        break
                    }
                }

                // 6. Brand Impersonation on Unauthorized Domain
                for (brand in ThreatIndicatorDatabase.targetedBrands) {
                    if (host.contains(brand)) {
                        val isLegit = ThreatIndicatorDatabase.legitimateRootSuffixes.any { host == it || host.endsWith(it) }
                        if (!isLegit) {
                            score += 45
                            reasons.add("Brand impersonation detected: '$brand' referenced in unauthorized domain ($host).")
                            break
                        }
                    }
                }

                // 7. Insecure HTTP on Login/KYC/Pay paths
                if (normalized.startsWith("http://") && (normalized.contains("login") || normalized.contains("kyc") || normalized.contains("pay") || normalized.contains("verify"))) {
                    score += 20
                    reasons.add("Unencrypted HTTP protocol used on sensitive verification/login path.")
                }
            } catch (_: Exception) {
                score += 25
                reasons.add("Malformed or unparseable URL syntax detected.")
            }
        }

        // -------------------------------------------------------------
        // B. Fake Bank & KYC Suspension Panic
        // -------------------------------------------------------------
        val hasUrgency = lower.contains("urgent") || lower.contains("immediately") || lower.contains("suspended today") ||
                lower.contains("will be suspended") || lower.contains("account blocked") || lower.contains("permanently deactivated") ||
                lower.contains("avoid closure") || lower.contains("within 24 hours") || lower.contains("tonight at")

        val hasBankingTerms = lower.contains("kyc") || lower.contains("pan") || lower.contains("aadhaar") ||
                lower.contains("bank") || lower.contains("sbi") || lower.contains("yono") || lower.contains("hdfc") ||
                lower.contains("icici") || lower.contains("axis") || lower.contains("pnb") || lower.contains("debit card")

        if (hasUrgency && hasBankingTerms) {
            category = "Fake Bank / KYC Deactivation Phishing"
            score += 55
            reasons.add("Fabricated urgency: Threatens imminent account deactivation or KYC suspension.")
            reasons.add("Coercion to submit identity or banking credentials outside official banking applications.")
        }

        // -------------------------------------------------------------
        // C. OTP & Credential Harvesting Theft
        // -------------------------------------------------------------
        val mentionsOtp = lower.contains("otp") || lower.contains("one-time password") || lower.contains("6-digit code") || lower.contains("verification code")
        val asksForOtp = lower.contains("share otp") || lower.contains("tell me the otp") || lower.contains("share the 6-digit") ||
                lower.contains("provide otp") || lower.contains("quote otp") || lower.contains("reversal otp") ||
                lower.contains("unblock your account") || lower.contains("cancel this debit") || lower.contains("fraud prevention")

        if (mentionsOtp && asksForOtp) {
            category = "Impersonation & OTP Harvesting"
            score += 85
            reasons.add("Critical Threat: Senders claiming to be support or bank staff soliciting confidential OTPs.")
            reasons.add("Golden Rule: Bank managers and fraud desks NEVER ask for OTPs, MPINs, or passwords.")
        } else if (mentionsOtp && (lower.contains("forward") || lower.contains("send to this number"))) {
            category = "OTP Forwarding Scam"
            score += 65
            reasons.add("Request to forward a confidential security code to an unverified contact.")
        }

        // -------------------------------------------------------------
        // D. Delivery-Fee & Postal Impersonation
        // -------------------------------------------------------------
        val hasCourierBrand = lower.contains("india post") || lower.contains("parcel") || lower.contains("package") ||
                lower.contains("delivery") || lower.contains("courier") || lower.contains("customs") || lower.contains("fedex") || lower.contains("dhl")

        val hasDeliveryHooks = lower.contains("on hold") || lower.contains("held at") || lower.contains("redelivery fee") ||
                lower.contains("delivery fee") || lower.contains("incorrect address") || lower.contains("update your delivery")

        if (hasCourierBrand && hasDeliveryHooks) {
            category = "Delivery-Fee / Courier Scam"
            score += 55
            reasons.add("Fake delivery hook: Claims parcel is detained and demands redelivery fee.")
            reasons.add("Directs victim to pay fees via unofficial tracking link.")
        }

        // -------------------------------------------------------------
        // E. Fake Prizes & Advance-Fee Lottery Fraud
        // -------------------------------------------------------------
        val hasPrize = lower.contains("congratulations") || lower.contains("winner") || lower.contains("won") ||
                lower.contains("lucky draw") || lower.contains("lottery") || lower.contains("1st prize") || lower.contains("cash prize")

        val hasAdvanceFee = lower.contains("processing fee") || lower.contains("advance fee") || lower.contains("deposit") ||
                lower.contains("registration fee") || lower.contains("customs charge") || lower.contains("to claim")

        if (hasPrize && hasAdvanceFee) {
            category = "Fake Prize / Advance-Fee Lottery Fraud"
            score += 60
            reasons.add("Advance-fee fraud: Claims prize won but demands upfront fee to release winnings.")
        }

        // -------------------------------------------------------------
        // F. Work From Home / Prepaid Task Scams
        // -------------------------------------------------------------
        val hasJobHooks = lower.contains("part-time") || lower.contains("work from home") || lower.contains("youtube") ||
                lower.contains("rating hotels") || lower.contains("daily income") || lower.contains("like videos")

        val hasJobRedirection = lower.contains("telegram") || lower.contains("per day") || lower.contains("daily") ||
                lower.contains("₹") || lower.contains("rs.") || lower.contains("earn")

        if (hasJobHooks && hasJobRedirection) {
            category = "Prepaid Task / Job Offer Scam"
            score += 55
            reasons.add("Unrealistic earnings promised for trivial tasks (e.g. video liking or fake reviews).")
            reasons.add("Directs communication to unmonitored Telegram/WhatsApp recruiter groups.")
        }

        // -------------------------------------------------------------
        // G. Electricity Disconnection Hoaxes
        // -------------------------------------------------------------
        if (
            (lower.contains("electricity") || lower.contains("power") || lower.contains("bijli")) &&
            (lower.contains("disconnect") || lower.contains("tonight") || lower.contains("bill unpaid"))
        ) {
            category = "Electricity / Utility Disconnection Scam"
            score += 65
            reasons.add("Fabricated utility disconnection urgency: Threats of power shut-off tonight.")
            reasons.add("Directs user to unofficial personal phone helpline.")
        }

        // -------------------------------------------------------------
        // H. UPI MPIN Reversal Deceptions
        // -------------------------------------------------------------
        if (
            (lower.contains("upi") || lower.contains("qr") || lower.contains("gpay") || lower.contains("phonepe") || lower.contains("paytm")) &&
            (lower.contains("pin to receive") || lower.contains("scan to receive") || lower.contains("receive money") || lower.contains("claim cashback"))
        ) {
            category = "UPI MPIN Reversal Fraud"
            score += 70
            reasons.add("Deceptive UPI instruction: Claims entering your UPI PIN is needed to receive money.")
            reasons.add("Fundamental UPI rule: Entering MPIN always debits funds, never credits them.")
        }

        // -------------------------------------------------------------
        // I. Digital Arrest / Law Enforcement Impersonation
        // -------------------------------------------------------------
        if (
            (lower.contains("cbi") || lower.contains("police") || lower.contains("narcotics") || lower.contains("court") || lower.contains("customs")) &&
            (lower.contains("arrest") || lower.contains("detained") || lower.contains("illegal package") || lower.contains("money laundering"))
        ) {
            category = "Digital Arrest / Law Enforcement Impersonation"
            score += 85
            reasons.add("High-pressure extortion claiming user is subject to immediate arrest.")
            reasons.add("Official law enforcement agencies never conduct investigations or demand settlements via phone/chat.")
        }

        // -------------------------------------------------------------
        // J. False-Positive Suppression
        // -------------------------------------------------------------
        val isHarmlessContext =
            (lower.contains("meeting") || lower.contains("class") || lower.contains("assignment") || lower.contains("presentation") || lower.contains("room") || lower.contains("notes") || lower.contains("slides") || lower.contains("rescheduled")) &&
                    !mentionsOtp && !hasUrgency && !hasAdvanceFee && extractedUrls.isEmpty()

        val isRoutineBankAlert =
            lower.contains("debited") && (lower.contains("bal") || lower.contains("balance") || lower.contains("inr") || lower.contains("via upi")) &&
                    !hasUrgency && extractedUrls.isEmpty() && !lower.contains("click") && !lower.contains("update kyc")

        if (isHarmlessContext) {
            score = 0
            reasons.clear()
            category = "Routine Communication"
            reasons.add("No urgent financial threats, credential solicitations, or deceptive links detected.")
        } else if (isRoutineBankAlert) {
            score = 5
            reasons.clear()
            category = "Legitimate Bank Transaction Alert"
            reasons.add("Standard transactional notification without urgent calls to action or suspicious external links.")
        } else if (reasons.isEmpty()) {
            score = 5
            category = "Routine Communication"
            reasons.add("No typical urgent fraud patterns, fake links, or credential harvesting requests detected.")
        }

        val finalScore = score.coerceIn(0, 100)

        // Exact Thresholds:
        // LOW: 0–24
        // MEDIUM: 25–49
        // HIGH: 50–79
        // CRITICAL: 80–100
        val riskLevel = when {
            finalScore >= 80 -> RiskLevel.CRITICAL
            finalScore >= 50 -> RiskLevel.HIGH
            finalScore >= 25 -> RiskLevel.MEDIUM
            else -> RiskLevel.LOW
        }

        val recommendedAction = when (riskLevel) {
            RiskLevel.CRITICAL -> "DO NOT open any link, call numbers in the message, or share OTPs. If money was debited, call 1930 immediately."
            RiskLevel.HIGH -> "Do not interact with links or phone numbers in this message. Verify directly in your official banking application."
            RiskLevel.MEDIUM -> "Exercise caution. Confirm the sender's identity through official channels before taking action."
            RiskLevel.LOW -> "No immediate threat indicators found. Continue standard cybersecurity hygiene."
        }

        return ThreatAssessment(
            riskLevel = riskLevel,
            confidenceScore = finalScore,
            category = category,
            detectionReasons = reasons,
            recommendedAction = recommendedAction,
            sourcePackage = sourcePackage,
            redactedContent = redacted,
            extractedUrls = extractedUrls,
            isVerifiedThreatSource = riskLevel == RiskLevel.CRITICAL || riskLevel == RiskLevel.HIGH
        )
    }

    fun extractUrls(text: String): List<String> {
        val urls = mutableListOf<String>()
        val pattern = Pattern.compile("(?i)\\b(https?://|www\\.)[a-z0-9.\\-]+(?:/[^\\s]*)?")
        val matcher = pattern.matcher(text)
        while (matcher.find()) {
            urls.add(matcher.group())
        }
        return urls
    }

    fun redactSensitiveData(input: String): String {
        var text = input

        // 1. Redact credit/debit card numbers (13-19 continuous or spaced digits)
        text = text.replace("\\b(?:\\d[ -]*?){13,19}\\b".toRegex()) { match ->
            val digits = match.value.filter { it.isDigit() }
            if (digits.length in 13..19) {
                "[CARD-XXXX-${digits.takeLast(4)}]"
            } else {
                match.value
            }
        }

        // 2. Redact Aadhaar 12-digit numbers
        text = text.replace("\\b\\d{4}\\s\\d{4}\\s\\d{4}\\b".toRegex(), "[AADHAAR-XXXX]")

        // 3. Redact Contextual OTPs
        text = text.replace("(?i)(otp|code|pin|secret|verification|one[- ]time[- ]password|auth)\\s*(?:is|:|-|=)\\s*([0-9]{4,8})\\b".toRegex()) { match ->
            val prefix = match.groups[1]?.value ?: "OTP"
            "$prefix: [REDACTED-OTP]"
        }

        // 4. Redact standalone digit sequences in banking/auth context
        if (text.contains("otp", ignoreCase = true) || text.contains("verification", ignoreCase = true) || text.contains("login", ignoreCase = true)) {
            text = text.replace("\\b([0-9]{4,8})\\b".toRegex()) { match ->
                if (listOf("2023", "2024", "2025", "2026", "2027").contains(match.value)) {
                    match.value
                } else {
                    "[REDACTED-CODE]"
                }
            }
        }

        return text
    }
}
