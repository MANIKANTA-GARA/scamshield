/**
 * ScamShield AI — Automated Detection & Alerting System Test Suite
 * Validates zero-input background processing, false-positive suppression,
 * event reporting, simulation pipeline, redaction, and sources configuration.
 */

const SERVER_URL = 'http://localhost:3001';

async function postJson(path, payload, headers = {}) {
  const url = `${SERVER_URL}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => null);
  return { status: response.status, body: json };
}

async function getJson(path) {
  const url = `${SERVER_URL}${path}`;
  const response = await fetch(url);
  const json = await response.json().catch(() => null);
  return { status: response.status, body: json };
}

async function deleteJson(path) {
  const url = `${SERVER_URL}${path}`;
  const response = await fetch(url, { method: 'DELETE' });
  const json = await response.json().catch(() => null);
  return { status: response.status, body: json };
}

async function runAutomaticDetectionTests() {
  console.log('\n================================================================');
  console.log('🤖 SCAMSHIELD AI — AUTOMATIC DETECTION & ALERTING TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  // 1. Protection Sources Status Endpoint
  try {
    const res = await getJson('/api/sources');
    assert(res.status === 200, 'GET /api/sources returns HTTP 200');
    assert(Array.isArray(res.body.sources), 'Returns sources array');
    assert(res.body.sources.length >= 4, 'Includes 4 configured sources (Android, Browser, API, App Safety)', `Found: ${res.body.sources.length}`);
    const androidSrc = res.body.sources.find(s => s.type === 'android_notification');
    assert(Boolean(androidSrc && androidSrc.enabled), 'Android Notification Listener is active by default');
    assert(Boolean(androidSrc.limitations), 'States technical boundaries and scope clearly');
  } catch (e) {
    assert(false, 'Sources Status Endpoint', e.message);
  }

  // 2. Toggle Protection Source Endpoint
  try {
    const res = await postJson('/api/sources/toggle', {
      sourceId: 'src-authorized-apis',
      enabled: true,
    });
    assert(res.status === 200, 'POST /api/sources/toggle returns HTTP 200');
    assert(res.body.source.enabled === true, 'Successfully toggled source state');
  } catch (e) {
    assert(false, 'Toggle Protection Source', e.message);
  }

  // 3. Automated Ingestion Endpoint (POST /api/events/report)
  try {
    const res = await postJson('/api/events/report', {
      source: 'Android Notification (WhatsApp)',
      sourcePackage: 'com.whatsapp',
      category: 'Fake Bank / KYC Deactivation Phishing',
      riskLevel: 'HIGH',
      confidenceScore: 88,
      detectionReasons: [
        'Impersonates leading bank claiming account blocked',
        'Directs user to unverified external portal'
      ],
      recommendedAction: 'Do not click the link. Verify in official YONO app.',
      rawContent: 'Your account is blocked. Update KYC with OTP 584920 immediately.',
      isVerified: false,
    });
    assert(res.status === 201, 'POST /api/events/report returns HTTP 201 Created');
    assert(res.body.success === true, 'Report ingestion succeeded');
    assert(!res.body.event.redactedPreview.includes('584920'), 'OTP digits 584920 are REDACTED on ingestion', `Got: ${res.body.event.redactedPreview}`);
    assert(res.body.event.redactedPreview.includes('[REDACTED-OTP]'), 'Contains [REDACTED-OTP] token');
  } catch (e) {
    assert(false, 'Automated Ingestion Endpoint', e.message);
  }

  // 4. Background Simulator: Electricity Disconnection Scam (High Risk Alert)
  try {
    const res = await postJson('/api/events/simulate', {
      scenario: 'electricity_scam',
      sourceApp: 'SMS',
    });
    assert(res.status === 201, 'Simulate Electricity Scam returns HTTP 201');
    assert(res.body.event.riskLevel === 'HIGH' || res.body.event.riskLevel === 'CRITICAL', 'Electricity scam flagged as HIGH/CRITICAL threat', `Got: ${res.body.event.riskLevel}`);
    assert(res.body.event.detectionReasons.length > 0, 'Includes concrete detection reasons');
    assert(res.body.message.includes('Immediate Security Alert triggered'), 'Triggered immediate security alert');
  } catch (e) {
    assert(false, 'Simulator: Electricity Scam', e.message);
  }

  // 5. Background Simulator: Deceptive URL Navigation in Browser
  try {
    const res = await postJson('/api/events/simulate', {
      scenario: 'malicious_url',
      sourceApp: 'Chrome',
    });
    assert(res.status === 201, 'Simulate Malicious URL returns HTTP 201');
    assert(res.body.event.source.includes('Chrome Extension'), 'Source identified as Chrome Extension');
    assert(res.body.event.riskLevel === 'HIGH', 'Malicious URL flagged as HIGH risk');
  } catch (e) {
    assert(false, 'Simulator: Malicious URL', e.message);
  }

  // 6. False-Positive Suppression: Routine Bank Debit Notification
  try {
    const res = await postJson('/api/events/simulate', {
      scenario: 'legitimate_bank',
      sourceApp: 'SMS',
    });
    assert(res.status === 201, 'Simulate Legitimate Bank returns HTTP 201');
    assert(res.body.event.riskLevel === 'LOW', 'Routine bank debit recognized as LOW risk (safe)', `Got: ${res.body.event.riskLevel}`);
    assert(res.body.message.includes('Safe notification processed; no alert dispatched'), 'Safe event suppressed from alarming user');
  } catch (e) {
    assert(false, 'Simulator: False Positive Suppression', e.message);
  }

  // 7. Event Feed Retrieval & Audit Log
  try {
    const res = await getJson('/api/events');
    assert(res.status === 200, 'GET /api/events returns HTTP 200');
    assert(res.body.events.length >= 3, 'Feed contains intercepted security events', `Count: ${res.body.events.length}`);
    assert(res.body.activeMonitoringStatus === 'AUTOMATIC_ACTIVE', 'Reports active monitoring status');
  } catch (e) {
    assert(false, 'Event Feed Retrieval', e.message);
  }

  // 8. Event Feed Clearing
  try {
    const res = await deleteJson('/api/events');
    assert(res.status === 200, 'DELETE /api/events returns HTTP 200');
    const verifyRes = await getJson('/api/events');
    assert(verifyRes.body.events.length === 0, 'Audit log emptied successfully');
  } catch (e) {
    assert(false, 'Event Feed Clearing', e.message);
  }

  console.log('\n================================================================');
  console.log(`🏁 AUTOMATIC DETECTION TESTS FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAutomaticDetectionTests();
