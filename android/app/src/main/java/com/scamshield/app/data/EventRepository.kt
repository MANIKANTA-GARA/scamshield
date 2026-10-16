package com.scamshield.app.data

import android.content.Context
import android.content.SharedPreferences
import com.scamshield.app.engine.RiskLevel
import com.scamshield.app.engine.ThreatAssessment
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject

/**
 * EventRepository
 *
 * Stores minimal, privacy-safe security event records locally in device storage.
 * Strictly adheres to privacy principles: raw sensitive credentials (OTPs, PINs) are NEVER persisted.
 */
class EventRepository private constructor(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("scamshield_security_events_v2", Context.MODE_PRIVATE)

    private val _eventsFlow = MutableStateFlow<List<ThreatAssessment>>(loadEvents())
    val eventsFlow: StateFlow<List<ThreatAssessment>> = _eventsFlow.asStateFlow()

    companion object {
        @Volatile
        private var INSTANCE: EventRepository? = null

        fun getInstance(context: Context): EventRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: EventRepository(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    @Synchronized
    fun saveThreatEvent(event: ThreatAssessment) {
        val current = _eventsFlow.value.toMutableList()
        current.add(0, event) // latest first

        // Keep at most 50 events locally
        val trimmed = if (current.size > 50) current.subList(0, 50) else current
        _eventsFlow.value = trimmed
        persistEvents(trimmed)
    }

    @Synchronized
    fun clearEvents() {
        _eventsFlow.value = emptyList()
        prefs.edit().remove("saved_events_json").apply()
    }

    @Synchronized
    fun clearAllAppData() {
        _eventsFlow.value = emptyList()
        prefs.edit().clear().apply()
    }

    fun isSmsProtectionEnabled(): Boolean {
        return prefs.getBoolean("sms_protection_enabled", true)
    }

    fun setSmsProtectionEnabled(enabled: Boolean) {
        prefs.edit().putBoolean("sms_protection_enabled", enabled).apply()
    }

    fun isLocalLlamaEnabled(): Boolean {
        return prefs.getBoolean("local_llama_enabled", true)
    }

    fun setLocalLlamaEnabled(enabled: Boolean) {
        prefs.edit().putBoolean("local_llama_enabled", enabled).apply()
    }

    fun isPackageMonitored(packageName: String): Boolean {
        val defaultMonitored = setOf(
            "com.google.android.apps.messaging",
            "com.whatsapp",
            "org.telegram.messenger",
            "com.google.android.gm"
        )
        val saved = prefs.getStringSet("monitored_packages", defaultMonitored) ?: defaultMonitored
        return saved.contains(packageName) || saved.contains("*")
    }

    fun setPackageMonitored(packageName: String, isMonitored: Boolean) {
        val defaultMonitored = setOf(
            "com.google.android.apps.messaging",
            "com.whatsapp",
            "org.telegram.messenger",
            "com.google.android.gm"
        )
        val current = (prefs.getStringSet("monitored_packages", defaultMonitored) ?: defaultMonitored).toMutableSet()
        if (isMonitored) {
            current.add(packageName)
        } else {
            current.remove(packageName)
        }
        prefs.edit().putStringSet("monitored_packages", current).apply()
    }

    private fun persistEvents(events: List<ThreatAssessment>) {
        val array = JSONArray()
        for (event in events) {
            val obj = JSONObject().apply {
                put("riskLevel", event.riskLevel.name)
                put("confidenceScore", event.confidenceScore)
                put("category", event.category)
                put("detectionReasons", JSONArray(event.detectionReasons))
                put("recommendedAction", event.recommendedAction)
                put("sourcePackage", event.sourcePackage)
                put("timestamp", event.timestamp)
                put("redactedContent", event.redactedContent)
                put("isVerified", event.isVerifiedThreatSource)
                put("aiAssisted", event.aiAssisted)
                put("aiModelName", event.aiModelName ?: "")
                put("aiExplanation", event.aiExplanation ?: "")
            }
            array.put(obj)
        }
        prefs.edit().putString("saved_events_json", array.toString()).apply()
    }

    private fun loadEvents(): List<ThreatAssessment> {
        val raw = prefs.getString("saved_events_json", null) ?: return emptyList()
        val list = mutableListOf<ThreatAssessment>()
        try {
            val array = JSONArray(raw)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val reasonsArray = obj.getJSONArray("detectionReasons")
                val reasons = mutableListOf<String>()
                for (j in 0 until reasonsArray.length()) {
                    reasons.add(reasonsArray.getString(j))
                }

                list.add(
                    ThreatAssessment(
                        riskLevel = RiskLevel.valueOf(obj.getString("riskLevel")),
                        confidenceScore = obj.getInt("confidenceScore"),
                        category = obj.getString("category"),
                        detectionReasons = reasons,
                        recommendedAction = obj.getString("recommendedAction"),
                        sourcePackage = obj.getString("sourcePackage"),
                        timestamp = obj.getLong("timestamp"),
                        redactedContent = obj.optString("redactedContent", ""),
                        isVerifiedThreatSource = obj.optBoolean("isVerified", false),
                        aiAssisted = obj.optBoolean("aiAssisted", false),
                        aiModelName = obj.optString("aiModelName").ifEmpty { null },
                        aiExplanation = obj.optString("aiExplanation").ifEmpty { null }
                    )
                )
            }
        } catch (_: Exception) {}
        return list
    }
}
