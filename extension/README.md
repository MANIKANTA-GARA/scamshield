# ScamShield AI — Automatic Browser Protection Extension

This Chromium Manifest V3 browser extension provides **continuous, automated website protection with zero manual user input**.

---

## 🔒 Automated Protection Capabilities

1. **Pre-Navigation URL Inspection**:
   - Automatically intercepts top-level navigation requests via `chrome.webNavigation.onBeforeNavigate`.
   - Inspects hostnames for:
     - Direct IP addresses (`http://192.168.1.1/login`)
     - Punycode homoglyphs (`xn--...`)
     - Deceptive brand subdomains (`sbi.bank-login-secure.top`)
     - High-risk abused TLDs (`.top`, `.xyz`, `.buzz`, `.icu`, etc.)
     - Insecure HTTP protocol on banking/KYC paths
2. **Immediate Warning Notifications**:
   - Automatically triggers a native desktop notification (`chrome.notifications.create`) when a threat is identified.
3. **Passive DOM Credential Harvesting Detection**:
   - The content script (`content.js`) monitors loaded pages for forms soliciting ATM PINs, UPI MPINs, or NetBanking passwords on unverified domains and displays an immediate on-page warning banner.
4. **Zero User Input Required**:
   - The user does not paste links, upload screenshots, or press scan buttons. Protection runs passively.

---

## 🚀 How to Install in Chrome, Edge, or Brave

1. Open **Google Chrome**, **Microsoft Edge**, or **Brave**.
2. Navigate to `chrome://extensions/` (or `edge://extensions/`).
3. Enable **"Developer mode"** in the top-right corner.
4. Click **"Load unpacked"**.
5. Select the `extension/` folder:
   `c:\Users\asus\OneDrive\Desktop\scanshield ai\extension`
6. The ScamShield shield icon will appear in your browser toolbar!

---

## 🧪 Testing the Extension

1. Try navigating to an IP address link: `http://192.168.1.100/login`
   - Notice the immediate desktop notification: `⚠️ SCAMSHIELD ALERT: [HIGH RISK] Direct IP address host`.
2. Try navigating to a brand impersonation link: `https://sbi.bank-login-secure.top/kyc`
   - Notice the threat is immediately logged and an alert appears.
3. Click the ScamShield extension icon in the toolbar to see the list of automatically blocked threats.
