# ScamShield AI — Completely Offline Android App with Local LLaMA 🛡️

A native, genuinely offline Android cyber-defense application built with Kotlin, Jetpack Compose, and an on-device local LLaMA engine.

**NON-NEGOTIABLE GUARANTEE: After initial installation and model setup, every core feature operates 100% offline without internet access. Zero cloud API calls. Zero external servers. Zero telemetry.**

---

## 🌟 1. Core Native Capabilities

1. **Automatic Incoming SMS Detection:**
   - Detects incoming SMS messages via `Telephony.SMS_RECEIVED` (`SmsReceiver.kt`).
   - Runs fast local heuristics immediately, followed by deeper evaluation using on-device Local LLaMA when loaded.
   - Dispatches high-priority heads-up security warnings via `AlertManager.kt`.
   - Never automatically replies to, deletes, forwards, or blocks SMS messages.
2. **Local LLaMA Model Integration (`LocalLlamaEngine.kt`):**
   - Runs quantized GGUF weights on-device (e.g. `Llama-3.2-1B-Instruct-Q4_K_M.gguf` ~780 MB or `Llama-3.2-3B-Instruct-Q4_K_M.gguf` ~1.8 GB).
   - Pre-checks device available RAM before context allocation (>1.2 GB free RAM threshold) to prevent OS out-of-memory kills.
   - If model is not loaded or memory is low, seamlessly falls back to the deterministic local rules engine.
3. **Comprehensive Offline Rules Engine (`LocalDetectionEngine.kt`):**
   - Weighted multi-indicator scoring (0–100) across:
     - Banking and UPI fraud
     - OTP, PIN, and password theft attempts
     - Phishing links and deceptive domains
     - Fake prizes and advance-fee lottery claims
     - Fraudulent job offers and prepaid task schemes
     - Impersonation of banks, electricity boards, and law enforcement
     - Urgent payment demands and fake delivery fees
     - Suspicious shortened URLs and IP hosts
4. **Offline Multimodal Content Scanning (`OfflineMultimodalScanner.kt`):**
   - Pasted text and SMS messages
   - URLs evaluated via lexical structure analysis without network visits
   - Screenshots and photos via on-device OCR
   - QR codes via offline matrix pattern decoding
5. **Local Storage & Zero Network Permissions:**
   - Saved locally in device storage (`EventRepository.kt`).
   - `android.permission.INTERNET` is **completely omitted** from `AndroidManifest.xml`.
   - On-device redaction replaces OTPs with `[REDACTED-OTP]` and 16-digit cards with `[CARD-XXXX-6789]` prior to storage.

---

## 🏗️ 2. Architectural Dataflow

```
Incoming SMS Broadcast (Telephony.SMS_RECEIVED)
       │
       ▼ (Asynchronous goAsync() Execution)
SmsReceiver.kt
  ├── 1. Pre-processes text & redacts sensitive digits on-device
  ├── 2. Runs Fast Local Rules Baseline (LocalDetectionEngine.kt)
  ├── 3. Invokes Local LLaMA AI Engine asynchronously (LocalLlamaEngine.kt)
  │      └── Memory check: Requires >1.2GB free RAM (otherwise falls back to rules)
  ├── 4. Evaluates Combined Score (0-100) & Risk Level:
  │      ├── LOW (0-24)      -> Normal alert (Alert suppressed to avoid fatigue)
  │      ├── MEDIUM (25-49)  -> Caution advised
  │      ├── HIGH (50-79)    -> Potential scam alert triggered
  │      └── CRITICAL (80-100)-> Direct threat alarm triggered
  └── 5. AlertManager.kt: Deduplicates & dispatches high-priority Android warning
```

---

## 📦 3. LLaMA Model Installation & Setup

### Recommended Models
| Model | Format | File Size | Recommended Min RAM | Target Processor |
| :--- | :--- | :---: | :---: | :--- |
| **Llama-3.2-1B-Instruct** *(Recommended)* | Q4_K_M GGUF | ~780 MB | 3 GB RAM | Snapdragon 680+ / MediaTek G99+ |
| **Llama-3.2-3B-Instruct** | Q4_K_M GGUF | ~1.8 GB | 6 GB RAM | Snapdragon 7+ / 8 Gen 1+ |
| **SmolLM2-1.7B-Instruct** | Q4_K_M GGUF | ~1.0 GB | 4 GB RAM | Mid-range ARM64 devices |

### One-Time Setup Instructions
1. Download your preferred GGUF quantized model (e.g., `Llama-3.2-1B-Instruct-Q4_K_M.gguf`).
2. Transfer the `.gguf` file to your Android device's internal storage (`/sdcard/Download/` or `/data/data/com.scamshield.app/files/models/`).
3. Open ScamShield AI -> Navigate to **Local Llama** tab.
4. Tap **Load Llama 3.2 Q4 into RAM**.
5. Once loaded, the engine status changes to:
   `🟢 Local Llama 3.2 AI Active • Q4_K_M • Zero Cloud Calls`

---

## 📋 4. Android Distribution & Permission Guidance

### 1. `RECEIVE_SMS` Permission
- **Functionality:** Allows `SmsReceiver` to inspect incoming SMS messages automatically upon arrival.
- **Google Play Distribution Note:** Google Play restricts apps using `RECEIVE_SMS` unless declared as the default SMS handler or qualifying under an approved enterprise/security exception.
- **Sideloading / Direct APK:** For direct APK installation, the user grants permission directly via the standard Android runtime permission prompt:
  ```kotlin
  smsPermissionLauncher.launch(Manifest.permission.RECEIVE_SMS)
  ```
- **Alternative (Google Play Safe):** If `RECEIVE_SMS` is not granted, ScamShield automatically switches to its `NotificationListenerService` companion or manual scanner, allowing users to inspect notifications without `RECEIVE_SMS`.

### 2. Zero `INTERNET` Permission
- To provide indisputable proof of privacy to hackathon judges and users, `android.permission.INTERNET` is **not declared** in `AndroidManifest.xml`.
- The operating system strictly enforces that ScamShield cannot establish sockets, HTTP connections, or upload data.

---

## 🧪 5. Testing the 10 Core Acceptance Criteria

Run the automated test suite from the project root:
```bash
npm test
# Or: node tests/android-offline-tests.cjs
```

The test runner validates all 10 non-negotiable scenarios:
1. **Suspicious Bank SMS:** `HIGH/CRITICAL` risk, detects KYC deactivation panic.
2. **Urgent OTP Request:** `CRITICAL` risk, catches direct OTP theft attempt.
3. **Phishing URL:** `HIGH` risk, flags deceptive brand subdomains and high-risk TLDs.
4. **Fraudulent Job Offer:** `HIGH` risk, detects prepaid task schemes with Telegram redirection.
5. **Legitimate Bank Notification:** `LOW` risk (score <= 24), verifies false-positive suppression.
6. **Suspicious Image / QR Code:** Successfully decoded and flagged as suspicious payment request.
7. **Llama Unavailable:** Validates seamless fallback to deterministic rules.
8. **Internet Disconnected:** 100% offline verification; zero network calls.
9. **SMS Permissions Denied:** Graceful UI fallback with manual scanning operational.
10. **Low-Memory Device:** Memory guard suppresses heavy AI allocation and falls back to rules.
