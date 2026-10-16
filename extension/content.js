/**
 * ScamShield AI Extension - Content Script
 * Passively observes pages for deceptive forms and displays on-page alerts if threats are found.
 */

(function () {
  // Check for deceptive forms requesting sensitive credentials
  function inspectPageSecurity() {
    const hostname = window.location.hostname.toLowerCase();

    // Skip inspection on legitimate bank domains
    if (hostname.endsWith('.sbi') || hostname.endsWith('hdfcbank.com') || hostname.endsWith('icicibank.com') || hostname.endsWith('axisbank.com')) {
      return;
    }

    const bodyText = document.body ? document.body.innerText.toLowerCase() : '';
    const forms = document.querySelectorAll('form');

    let hasSensitivePrompt = false;
    const sensitiveTerms = ['atm pin', 'upi pin', 'mpin', 'net banking password', 'card expiry', 'cvv'];

    for (const term of sensitiveTerms) {
      if (bodyText.includes(term)) {
        hasSensitivePrompt = true;
        break;
      }
    }

    // Check if input fields ask for PIN or CVV
    const suspiciousInputs = document.querySelectorAll('input[type="password"], input[name*="pin"], input[name*="cvv"], input[placeholder*="pin"]');

    if (hasSensitivePrompt && suspiciousInputs.length > 0) {
      // Notify background worker
      chrome.runtime.sendMessage({
        action: 'FORM_CREDENTIAL_WARNING',
        hostname: window.location.hostname
      }).catch(() => {});

      // Render top warning banner
      renderWarningBanner('CRITICAL WARNING: This unverified website is requesting banking credentials or PINs. Legitimate banks never solicit PINs outside official portals.');
    }
  }

  function renderWarningBanner(message) {
    if (document.getElementById('scamshield-warning-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'scamshield-warning-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: #EF476F;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 700;
      padding: 12px 20px;
      z-index: 2147483647;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    `;

    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:18px;">🛡️</span>
        <span><strong>SCAMSHIELD AI:</strong> ${message}</span>
      </div>
      <button id="scamshield-banner-close" style="background:#0B132B;color:#FFF;border:none;padding:5px 12px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:700;">
        Dismiss
      </button>
    `;

    document.body.prepend(banner);

    document.getElementById('scamshield-banner-close')?.addEventListener('click', () => {
      banner.remove();
    });
  }

  // Listen for warnings from background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'SHOW_SECURITY_WARNING' && message.assessment) {
      renderWarningBanner(`High-risk phishing link detected (${message.assessment.hostname}). ${message.assessment.reasons[0] || 'Do not submit credentials.'}`);
    }
  });

  // Run initial passive check after DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inspectPageSecurity);
  } else {
    inspectPageSecurity();
  }
})();
