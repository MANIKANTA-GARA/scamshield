/**
 * ScamShield AI Extension - Background Service Worker
 * Automatically intercepts navigation events before page load with zero user input.
 */

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'buzz', 'icu', 'fit', 'club', 'rest', 'stream', 'work',
  'loan', 'bar', 'click', 'link', 'gq', 'cf', 'ml', 'tk', 'ga', 'space'
]);

const TARGETED_BRANDS = [
  'sbi', 'onlinesbi', 'hdfc', 'hdfcbank', 'icici', 'icicibank', 'axis', 'axisbank',
  'pnb', 'paytm', 'phonepe', 'gpay', 'uidai', 'incometax', 'cybercrime'
];

const LEGITIMATE_BRAND_DOMAINS = {
  'sbi': ['sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com'],
  'hdfc': ['hdfcbank.com'],
  'icici': ['icicibank.com'],
  'axis': ['axisbank.com'],
  'paytm': ['paytm.com'],
  'phonepe': ['phonepe.com'],
  'gpay': ['pay.google.com', 'google.com'],
  'uidai': ['uidai.gov.in'],
  'incometax': ['incometax.gov.in'],
  'cybercrime': ['cybercrime.gov.in']
};

// Deduplication map to avoid spamming the user on repeated requests
const alertCooldowns = new Map();

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only inspect top-level navigation (frameId === 0)
  if (details.frameId !== 0) return;

  const urlString = details.url;
  if (!urlString || urlString.startsWith('chrome://') || urlString.startsWith('about:')) return;

  const assessment = evaluateUrl(urlString);

  if (assessment.isThreat) {
    handleThreatDetected(urlString, assessment, details.tabId);
  }
});

function evaluateUrl(urlString) {
  try {
    const urlObj = new URL(urlString);
    const hostname = urlObj.hostname.toLowerCase();
    const reasons = [];
    let score = 0;

    // 1. IP address as host
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      score += 50;
      reasons.push(`Direct IP address host (${hostname}) without verified domain`);
    }

    // 2. Punycode / Homoglyph
    if (hostname.includes('xn--')) {
      score += 45;
      reasons.push('Punycode domain (possible homoglyph visual impersonation)');
    }

    // 3. High-risk TLD
    const parts = hostname.split('.');
    const tld = parts[parts.length - 1];
    if (SUSPICIOUS_TLDS.has(tld)) {
      score += 30;
      reasons.push(`High-risk abused top-level domain (.${tld})`);
    }

    // 4. Deceptive Brand Impersonation
    for (const brand of TARGETED_BRANDS) {
      if (hostname.includes(brand)) {
        const authorized = LEGITIMATE_BRAND_DOMAINS[brand] || [];
        const isLegit = authorized.some(legit => hostname === legit || hostname.endsWith('.' + legit));
        if (!isLegit) {
          score += 50;
          reasons.push(`Brand impersonation heuristic: contains '${brand.toUpperCase()}' but root domain is unauthorized`);
          break;
        }
      }
    }

    // 5. Insecure HTTP on banking/credential keywords
    if (urlObj.protocol === 'http:' && (urlObj.pathname.includes('login') || urlObj.pathname.includes('kyc') || urlObj.pathname.includes('bank'))) {
      score += 35;
      reasons.push('Unencrypted HTTP protocol used on sensitive login/KYC path');
    }

    const isThreat = score >= 50;
    return {
      isThreat,
      score,
      reasons,
      hostname,
      riskLevel: score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW'
    };
  } catch (e) {
    return { isThreat: false, score: 0, reasons: [] };
  }
}

function handleThreatDetected(url, assessment, tabId) {
  const now = Date.now();
  const lastAlert = alertCooldowns.get(assessment.hostname) || 0;
  if (now - lastAlert < 60000) return; // 1 min cooldown per hostname
  alertCooldowns.set(assessment.hostname, now);

  // 1. Dispatch Immediate Browser Notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-48.png',
    title: `⚠️ SCAMSHIELD ALERT: [${assessment.riskLevel} RISK]`,
    message: `Suspicious destination detected: ${assessment.hostname}. ${assessment.reasons[0] || 'Phishing indicators detected.'}`,
    priority: 2
  });

  // 2. Persist to local extension storage
  chrome.storage.local.get(['threatHistory'], (result) => {
    const history = result.threatHistory || [];
    history.unshift({
      url,
      hostname: assessment.hostname,
      riskLevel: assessment.riskLevel,
      score: assessment.score,
      reasons: assessment.reasons,
      timestamp: new Date().toLocaleTimeString()
    });
    chrome.storage.local.set({ threatHistory: history.slice(0, 50) });
  });

  // 3. Inject warning banner into tab
  if (tabId) {
    chrome.tabs.sendMessage(tabId, {
      action: 'SHOW_SECURITY_WARNING',
      assessment
    }).catch(() => {});
  }
}

// Listen for reports from content.js regarding credential harvesting forms
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'FORM_CREDENTIAL_WARNING') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: '🚨 DANGEROUS FORM DETECTED',
      message: `The website at ${sender.tab?.url || 'this page'} is requesting banking credentials or PINs on an unverified domain.`,
      priority: 2
    });
    sendResponse({ received: true });
  }
});
