package com.scamshield.app.engine

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * ThreatIndicatorDatabase
 *
 * Fully offline, configurable threat indicators database.
 * Holds keywords, regex patterns, deceptive TLDs, and targeted institution lists.
 * Can be updated or restored manually from a trusted local file without internet.
 */
object ThreatIndicatorDatabase {

    // Configurable high-risk TLDs
    val suspiciousTlds = mutableSetOf(
        "xyz", "top", "buzz", "icu", "fit", "club", "rest", "stream", "work",
        "loan", "bar", "click", "link", "gq", "cf", "ml", "tk", "ga", "space",
        "online", "site", "live", "website", "support", "bid", "monster", "vip"
    )

    // Configurable URL Shortener Services
    val shortenedDomains = mutableSetOf(
        "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly",
        "cutt.ly", "rb.gy", "shorturl.at", "bl.ink", "rebrand.ly"
    )

    // Legitimate institutional root domain suffixes
    val legitimateRootSuffixes = listOf(
        ".sbi", "onlinesbi.sbi", ".gov.in", "gov.in", ".nic.in", "nic.in",
        "hdfcbank.com", "icicibank.com", "axisbank.com", "pnbindia.in",
        "paytm.com", "phonepe.com", "google.com", "amazon.in", "amazon.com",
        "flipkart.com", "indiapost.gov.in", "apple.com", "microsoft.com"
    )

    // Targeted Institutions and Brands
    val targetedBrands = mutableListOf(
        "sbi", "onlinesbi", "hdfc", "hdfcbank", "icici", "icicibank", "axis", "axisbank",
        "pnb", "punjabnational", "canara", "bankofbaroda", "paytm", "phonepe", "gpay",
        "googlepay", "bharatpe", "bhim", "uidai", "incometax", "epfindia", "cybercrime",
        "amazon", "flipkart", "indiapost", "netflix", "paypal", "apple", "microsoft"
    )

    // Deceptive Security / Verification Hostname Keywords
    val deceptiveHostKeywords = listOf(
        "bank-verify", "secure-verify", "kyc-update", "login-alert",
        "account-update", "parcels-update", "lucky-draw", "claim-reward"
    )

    /**
     * Export threat indicators to a JSON string for local backup
     */
    fun exportToJson(): String {
        val root = JSONObject().apply {
            put("version", 2)
            put("timestamp", System.currentTimeMillis())
            put("suspiciousTlds", JSONArray(suspiciousTlds))
            put("shortenedDomains", JSONArray(shortenedDomains))
            put("targetedBrands", JSONArray(targetedBrands))
        }
        return root.toString(2)
    }

    /**
     * Import threat indicators from a trusted local file (Offline update)
     */
    fun importFromJson(jsonString: String): Boolean {
        return try {
            val root = JSONObject(jsonString)
            if (root.has("suspiciousTlds")) {
                val array = root.getJSONArray("suspiciousTlds")
                suspiciousTlds.clear()
                for (i in 0 until array.length()) {
                    suspiciousTlds.add(array.getString(i).lowercase().trim())
                }
            }
            if (root.has("targetedBrands")) {
                val array = root.getJSONArray("targetedBrands")
                targetedBrands.clear()
                for (i in 0 until array.length()) {
                    targetedBrands.add(array.getString(i).lowercase().trim())
                }
            }
            true
        } catch (_: Exception) {
            false
        }
    }
}
