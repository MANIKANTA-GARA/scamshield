import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Smartphone, 
  Globe, 
  Info,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../translations/index.js';
import { simulateBackgroundEvent, SecurityEventItem } from '../utils/api.js';
import { ImmediateAlertModal } from '../components/ImmediateAlertModal.js';

export const SimulatorStudio: React.FC = () => {
  const { language, t } = useLanguage();

  const [scenario, setScenario] = useState<'electricity_scam' | 'kyc_phishing' | 'task_job_scam' | 'qr_upi_scam' | 'malicious_url' | 'legitimate_bank'>('electricity_scam');
  const [sourceApp, setSourceApp] = useState<'WhatsApp' | 'SMS' | 'Telegram' | 'Gmail' | 'Chrome'>('WhatsApp');
  const [loading, setLoading] = useState(false);
  const [lastDispatchedEvent, setLastDispatchedEvent] = useState<SecurityEventItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const scenarioDescriptions = {
    electricity_scam: "Urgent electricity disconnection notice threatening power cut-off tonight at 9:30 PM with an unofficial mobile helpline.",
    kyc_phishing: "Fake SBI YONO deactivation SMS coercing the user to click an unauthorized .top link to submit PAN and Aadhaar.",
    task_job_scam: "Prepaid part-time YouTube video liking job promising ₹4,000/day and redirecting to a Telegram VIP channel.",
    qr_upi_scam: "QR code cashback reward message falsely claiming that entering a UPI PIN will receive money.",
    malicious_url: "Direct navigation to lookalike domain 'sbi.bank-login-secure.top/kyc' attempting credential harvesting.",
    legitimate_bank: "Standard bank debit notification alert (₹500 debited at pharmacy). Safe; verified to suppress false alarms.",
  };

  const handleDispatch = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await simulateBackgroundEvent(scenario, sourceApp);
      setStatusMessage(res.message);
      // Immediately open alert modal if threat is not low risk
      if (res.event.riskLevel !== 'LOW') {
        setLastDispatchedEvent(res.event);
      }
    } catch (e: any) {
      setStatusMessage(e.message || 'Simulation dispatch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-shield-teal/20 text-shield-teal flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.simulator.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          {t.simulator.subtitle}
        </p>
      </div>

      {/* Simulator Control Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-shield-teal/40 shadow-2xl space-y-6">
        {/* Step 1: Scenario Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            1. {t.simulator.selectScenario}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'electricity_scam', label: t.simulator.scenarioElectricity, risk: 'CRITICAL' },
              { id: 'kyc_phishing', label: t.simulator.scenarioKyc, risk: 'HIGH' },
              { id: 'task_job_scam', label: t.simulator.scenarioTask, risk: 'HIGH' },
              { id: 'qr_upi_scam', label: t.simulator.scenarioQr, risk: 'HIGH' },
              { id: 'malicious_url', label: t.simulator.scenarioUrl, risk: 'HIGH' },
              { id: 'legitimate_bank', label: t.simulator.scenarioSafe, risk: 'LOW' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setScenario(s.id as any)}
                className={`p-3.5 rounded-xl border text-xs text-left transition-all ${
                  scenario === s.id
                    ? 'bg-shield-teal/20 border-shield-teal text-white font-bold shadow-md'
                    : 'bg-shield-navy/60 border-shield-border text-slate-300 hover:bg-shield-card hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>{s.label}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${s.risk === 'LOW' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                    {s.risk}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 mt-2 italic bg-black/40 p-2.5 rounded-xl border border-shield-border/40">
            <strong>Scenario Details:</strong> {scenarioDescriptions[scenario]}
          </p>
        </div>

        {/* Step 2: Channel Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            2. {t.simulator.selectApp}
          </label>
          <div className="flex flex-wrap gap-2">
            {(['WhatsApp', 'SMS', 'Telegram', 'Gmail', 'Chrome'] as const).map((app) => (
              <button
                key={app}
                onClick={() => setSourceApp(app)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  sourceApp === app
                    ? 'bg-shield-cyan text-shield-navy font-bold border-shield-cyan shadow-sm'
                    : 'bg-shield-navy text-slate-300 border-shield-border hover:bg-shield-card hover:text-white'
                }`}
              >
                {app}
              </button>
            ))}
          </div>
        </div>

        {/* Dispatch Button */}
        <div className="pt-4 border-t border-shield-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-shield-teal shrink-0" />
            <span>Zero manual pasting required. Event arrives passively in the background.</span>
          </div>

          <button
            onClick={handleDispatch}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-shield-navy bg-gradient-to-r from-shield-teal to-shield-emerald hover:opacity-95 shadow-lg shadow-shield-teal/30 transition-all"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-shield-navy border-t-transparent rounded-full animate-spin"></span>
                <span>Intercepting & Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{t.simulator.triggerBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="p-3.5 rounded-xl bg-shield-card border border-shield-border text-xs text-white flex items-center justify-between animate-fade-in">
            <span className="font-medium">{statusMessage}</span>
            {lastDispatchedEvent && (
              <button
                onClick={() => setLastDispatchedEvent(lastDispatchedEvent)}
                className="text-xs text-shield-teal font-bold hover:underline"
              >
                Re-open Alert Modal →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Immediate Alert Modal */}
      <ImmediateAlertModal
        event={lastDispatchedEvent}
        onClose={() => setLastDispatchedEvent(null)}
      />
    </div>
  );
};
