# ScamShield AI 🛡️
### *Fully Local, Offline-Capable Hackathon Web Application*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React%2018-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Local Offline](https://img.shields.io/badge/Architecture-100%25%20Local%20Offline-success?style=flat-square)](https://github.com/)
[![No Cloud DB](https://img.shields.io/badge/Database-Zero%20Cloud%20DB-blue?style=flat-square)](https://github.com/)
[![Bilingual](https://img.shields.io/badge/Languages-English%20%7C%20%E0%B0%A4%E0%B1%86%E0%B0%B2%E0%B1%81%E0%B0%97%E0%B1%81-teal)](https://github.com/)

---

## 🌟 1. Core Architecture: 100% Local, Offline & Privacy-First

ScamShield AI operates **entirely within the user's browser profile**:
- **No Backend Server Required at Runtime:** The entire heuristic scanning engine, redaction pipeline, and decision tree execute locally via TypeScript in browser memory.
- **No Cloud Database:** All scan history and user preferences reside exclusively in browser `localStorage` (with graceful in-memory quota fallbacks).
- **No Paid APIs or API Keys:** Evaluates scams deterministically using weighted multi-indicator heuristic rules and lexical URL parsing.
- **No Mandatory Internet Connection:** Full scanning, redaction, scoring, and explanation features function seamlessly without Wi-Fi or cellular connectivity.
- **Zero Network Transmission:** User messages, OTPs, card digits, and URLs are never uploaded to any remote server or external LLM.

---

## 🚀 2. Quickstart & Local Execution

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the Development Server
```bash
npm run dev
# Or: npm run client
```
The application will launch immediately at **`http://localhost:5173/`**. No backend server or environment variables are required.

### Step 3: Run the Automated Test Suite
```bash
npm test
# Or: npm run test:local
```
Executes all **39 local offline unit assertions** validating scoring thresholds, judge test scenarios, redaction, and prompt injection defense.

### Step 4: Build for Static Web Deployment
```bash
npm run build
```
Generates a static web bundle in `client/dist` ready for static hosting (GitHub Pages, Vercel, Netlify, Cloudflare Pages, S3).

---

## ⚖️ 3. Feature Matrix: Offline vs. Optional Integrations

| Feature | Execution Environment | Internet Required? | Backend Required? | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **Local Scanner & Judge Mode** | Browser Memory | ❌ No | ❌ No | Analyzes submitted text & URLs on-device |
| **Local Ollama Gemma4 AI** | Localhost:11434 (RTX GPU) | ❌ No | ❌ No | 100% On-device deep neural reasoning with `gemma4:e4b` |
| **8 Rubric Demo Samples** | Browser Memory | ❌ No | ❌ No | One-click instant judge evaluation |
| **On-Device Data Redaction** | Browser Memory | ❌ No | ❌ No | Masks OTPs, card digits & Aadhaar |
| **Strict 0–100 Risk Scoring** | Browser Memory | ❌ No | ❌ No | Weighted multi-indicator scoring |
| **Local History & Settings** | Browser `localStorage` | ❌ No | ❌ No | Profile-scoped persistence with quota guard |
| **Offline Scenario Simulator** | Browser Memory | ❌ No | ❌ No | Simulates incoming event interception |
| **Cyber Safety Guide & Quiz** | Browser Client | ❌ No | ❌ No | Fully localized (English + Telugu) |
| **Web Share Target (PWA)** | Browser Service Worker | ❌ No | ❌ No | Receives shared links directly from Android |
| *Android Companion Service (Optional)* | Native Android APK | ❌ No | Optional API | Requires `NotificationListenerService` consent |
| *Chrome Extension (Optional)* | Chromium Browser MV3 | ❌ No | Optional API | Intercepts `webNavigation.onBeforeNavigate` |

---

## 🧠 4. Local Ollama Integration (`gemma4:e4b` On-Device AI)

ScamShield AI seamlessly connects to your locally running **Ollama** instance to deliver deep generative AI reasoning while preserving 100% offline data privacy:

- **Target Model:** `gemma4:e4b` (7.5B parameter, Q4_K_M quantization).
- **Endpoint:** `http://localhost:11434` (proxied via `/ollama` in Vite to eliminate browser CORS).
- **GPU Acceleration:** Executes locally on your system's NVIDIA GPU (RTX 3050 Laptop GPU tested) with optimized memory fitting (`num_ctx: 4096`).
- **Hybrid Architecture:**
  1. **Instant Heuristic Classification (<5ms):** Immediate client-side evaluation so the user never experiences interface lag.
  2. **Deep Neural Assessment:** Gemma4 generates structured threat analysis, key red flag citations, and bilingual security explanations in real-time.
- **Graceful Fallback:** If Ollama is paused or stopped, the system automatically falls back to 100% deterministic local rules with zero downtime.

### Connecting to Ollama:
```bash
# 1. Start Ollama with the target Gemma4 model
ollama run gemma4:e4b

# 2. Run ScamShield AI verification test suite
node tests/ollama-integration-tests.cjs
```

---

## 🎯 4. Local Scam Detection & Weighted Multi-Indicator Rules

ScamShield evaluates submitted content across multiple weighted heuristic dimensions rather than relying on brittle single-keyword triggers:

1. **Suspicious URLs & Misleading Hostnames:**
   - Direct IP address hosts (e.g., `http://192.168.1.150/ebanking/auth`)
   - Punycode homoglyph visual spoofing (e.g., `http://xn--sbi-9ja.com`)
   - High-risk / disposable TLDs (`.top`, `.xyz`, `.icu`, `.buzz`, `.club`, `.fit`, `.rest`, `.loan`, `.click`)
   - Deceptive verification subdomains & brand impersonation (`sbi.bank-login-secure.top`, `hdfc-update.xyz`)
   - Shortened URL services (`bit.ly`, `tinyurl.com`, `t.co`, `cutt.ly`, `is.gd`)
   - Insecure HTTP on credential/auth paths
2. **Fake Banking & Account-Suspension Panic:**
   - Fabricated urgency (threats of imminent blockage, KYC suspension, PAN deactivation).
3. **OTP, PIN & Credential Theft:**
   - Senders claiming to be "customer support" or "bank staff" asking for OTPs or PINs.
   - Golden Rule: Bank staff NEVER ask for OTPs or MPINs.
4. **Delivery-Fee & Courier Scams:**
   - Parcel detention hooks demanding small redelivery fees on unverified tracking links.
5. **Fake Prizes & Advance-Fee Lottery Claims:**
   - Large prize claims conditional on paying upfront processing, customs, or registration fees.
6. **Prepaid Task & Advance-Payment Job Offers:**
   - Unrealistic daily income (₹3,000–₹8,000) for liking YouTube videos or rating hotels, redirecting to unmonitored Telegram recruiters.
7. **UPI MPIN Reversal Deceptions:**
   - Misleading instructions to scan QR codes or enter UPI PINs to "receive money".
8. **False-Positive Suppression:**
   - Clean, routine academic, meeting, and standard banking debit SMS notifications score strictly in the **LOW** bracket (0–24), preventing alert fatigue.

### Strict Scoring Thresholds
- **LOW (0–24):** Routine communication; no high-pressure fraud tactics or deceptive links.
- **MEDIUM (25–49):** Elements warranting caution (shortened links, unverified contacts).
- **HIGH (50–79):** Strong markers of financial scam, brand spoofing, or advance-fee requests.
- **CRITICAL (80–100):** High-confidence threat (direct OTP theft attempt, banking credentials harvesting).

---

## 🧑‍⚖️ 5. Judge Testing Mode (8 One-Click Test Cases)

Click any sample button on the scanner interface to evaluate actual offline rules in real-time:

1. **Fake Bank Verification:**
   > *"Dear SBI Customer, Your YONO Account has been suspended today due to pending KYC verification. Click `http://sbi.bank-verify.top/login` to update your PAN & Aadhaar immediately to avoid permanent closure."*
   > **Result:** `HIGH RISK` (Score: 75/100) — Flags deceptive subdomain, urgency, and brand impersonation.
2. **OTP Theft Attempt:**
   > *"Hello, this is Senior Executive Rajesh from Customer Support. We detected an unauthorized login attempt on your account. Please share the 6-digit OTP code sent to your mobile right now to cancel this debit and unblock your account."*
   > **Result:** `CRITICAL RISK` (Score: 85/100) — Direct OTP solicitation caught and highlighted.
3. **Fake Delivery-Fee Message:**
   > *"India Post Notice: Your parcel package #IN89219 is on hold at our distribution center due to an incorrect address. Pay ₹48 redelivery fee via `http://indiapost-parcels.xyz/update` to resume dispatch."*
   > **Result:** `HIGH RISK` (Score: 55/100) — Flags postal parcel detention & redelivery fee scam.
4. **Fake Prize Claim:**
   > *"CONGRATULATIONS! Your mobile number won the 1st prize of ₹25,00,000 in the All India Mega Lucky Draw! To claim your cash prize, deposit ₹2,500 government processing fee via `http://lucky-draw-reward.click`."*
   > **Result:** `HIGH RISK` (Score: 60/100) — Detects classic advance-fee lottery fraud.
5. **Suspicious Job Offer:**
   > *"Exclusive Part-Time Opportunity! Earn ₹4,000 - ₹8,000 daily from home just by liking YouTube videos and rating hotels on Google Maps. No experience needed. Contact HR Manager on Telegram: `@daily_income_portal`."*
   > **Result:** `HIGH RISK` (Score: 55/100) — Detects prepaid task job scam & Telegram redirection.
6. **Harmless Class-Meeting Message:**
   > *"Hi everyone, our project team meeting for the cyber ethics assignment is rescheduled to Thursday at 3:30 PM in Room 402. Please bring your notes and finalized slides."*
   > **Result:** `LOW RISK` (Score: 0/100) — Demonstrates false-positive suppression.
7. **Suspicious URL:**
   > *"https://sbi.bank-login-secure.top/kyc/update-pan"*
   > **Result:** `HIGH RISK` (Score: 80/100) — Flags unauthorized root domain, brand spoofing, and high-risk TLD.
8. **Empty or Invalid Input:**
   > *"" (Empty string)*
   > **Result:** `LOW RISK` (Score: 0/100) — Safely handled with informative instructions and zero crashes.

---

## 🔒 6. Privacy & Security Guarantees

1. **Pre-Processing Masking on Device:** Sensitive OTP digits, 16-digit payment card numbers, and 12-digit Aadhaar numbers are masked into tokens like `[REDACTED-OTP]` and `[CARD-XXXX-6789]` in browser memory before evaluation.
2. **Zero Link Execution:** The engine performs purely lexical pattern matching on URL strings. It **never fetches, opens, or follows submitted links**.
3. **Local Storage Boundaries:** Scan history and preferences reside in this browser profile and are not synchronized across devices.
4. **Wipe All Data Support:** One-click "Wipe all local app data" button allows users to purge all history and preferences from storage.
5. **Heuristic Disclaimers:** Clearly advises users that scores are heuristic assessments and that automated tools cannot guarantee 100% safety.

---

## ⚠️ Ethical & Technical Boundaries
- ScamShield AI does **not** claim to bypass the Android sandbox or read private encrypted message archives.
- Web app scans **only content explicitly submitted by the user** or shared via supported client integrations.
- ScamShield does **not** claim live threat-intel feeds in offline mode.
- Users who have been defrauded are guided to call the National Cyber Crime Helpline at **1930** or report on **`cybercrime.gov.in`**.
