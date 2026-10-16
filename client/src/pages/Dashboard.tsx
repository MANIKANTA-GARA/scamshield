import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Play, 
  Trash2, 
  Smartphone, 
  Globe, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  RefreshCw,
  Info,
  PhoneCall
} from 'lucide-react';
import { useLanguage } from '../translations/index.js';
import { 
  fetchAutomatedEvents, 
  clearAutomatedEvents, 
  simulateBackgroundEvent, 
  SecurityEventItem 
} from '../utils/api.js';
import { ImmediateAlertModal } from '../components/ImmediateAlertModal.js';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenPrivacyNotice: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab, onOpenPrivacyNotice }) => {
  const { language, t } = useLanguage();
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SecurityEventItem | null>(null);

  const loadEvents = async () => {
    try {
      const data = await fetchAutomatedEvents();
      setEvents(data.events || []);
    } catch (e) {
      console.warn('Failed to fetch events', e);
    }
  };

  useEffect(() => {
    loadEvents();
    // Poll for new automated events every 4 seconds
    const interval = setInterval(loadEvents, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = async () => {
    try {
      await clearAutomatedEvents();
      setEvents([]);
    } catch (e) {
      console.warn('Failed to clear events', e);
    }
  };

  const handleQuickSimulate = async (scenario: 'electricity_scam' | 'kyc_phishing' | 'malicious_url', app: 'WhatsApp' | 'SMS' | 'Chrome') => {
    setSimulating(true);
    try {
      const res = await simulateBackgroundEvent(scenario, app);
      // Immediately open the alert modal to demonstrate zero-input alerting
      setSelectedAlert(res.event);
      await loadEvents();
    } catch (e) {
      console.warn('Simulation failed', e);
    } finally {
      setSimulating(false);
    }
  };

  const criticalAndHighCount = events.filter(e => e.riskLevel === 'CRITICAL' || e.riskLevel === 'HIGH').length;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Hero Protection Banner */}
      <section className="relative overflow-hidden rounded-3xl glass-panel-elevated p-6 sm:p-10 border border-shield-teal/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-shield-teal/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{t.dashboard.quickStatus}</span>
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-shield-navy text-shield-cyan border border-shield-border">
              {t.common.zeroInputBadge}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {t.dashboard.heroTitle}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            {t.dashboard.heroSubtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('sources')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-shield-navy bg-gradient-to-r from-shield-teal to-shield-emerald hover:opacity-95 shadow-lg shadow-shield-teal/20 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Manage Monitored Sources</span>
            </button>

            <button
              onClick={() => onNavigateTab('simulator')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-200 bg-shield-card border border-shield-border hover:border-shield-teal/60 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current text-shield-teal" />
              <span>Live Test Simulator</span>
            </button>
          </div>
        </div>

        {/* 4 Key Metrics Bar */}
        <div className="mt-8 pt-6 border-t border-shield-border/40 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-2xl bg-shield-navy/60 border border-shield-border/60">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              {t.dashboard.statActiveSources}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-white font-mono">3 / 4</span>
              <span className="text-[10px] font-semibold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">Active</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-shield-navy/60 border border-shield-border/60">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              {t.dashboard.statThreatsBlocked}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-shield-cyan font-mono">{events.length}</span>
              <span className="text-[10px] text-slate-400">Total</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-shield-navy/60 border border-shield-border/60">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              {t.dashboard.statCriticalAlerts}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-rose-400 font-mono">{criticalAndHighCount}</span>
              <span className="text-[10px] font-semibold text-rose-300 px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30">Immediate Alert</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-shield-navy/60 border border-shield-border/60">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Privacy Guarantee
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">100%</span>
              <span className="text-[10px] text-slate-400">On-Device Redacted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Zero-Input Demonstration Studio Bar */}
      <section className="p-5 rounded-2xl glass-panel border border-shield-border shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-shield-teal" />
              <span>Simulate Background Arrival (Zero User Input Test)</span>
            </h3>
            <p className="text-xs text-slate-300">
              Click a scenario below to simulate an incoming message or URL. ScamShield automatically evaluates it in the background and raises an immediate warning without any manual copy-pasting.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('simulator')}
            className="text-xs font-semibold text-shield-teal hover:underline self-start sm:self-center shrink-0"
          >
            Open Full Simulator Studio →
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            onClick={() => handleQuickSimulate('electricity_scam', 'SMS')}
            disabled={simulating}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-shield-card hover:bg-shield-navy border border-shield-border hover:border-shield-teal text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Simulate Electricity Power Cut SMS</span>
          </button>

          <button
            onClick={() => handleQuickSimulate('kyc_phishing', 'WhatsApp')}
            disabled={simulating}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-shield-card hover:bg-shield-navy border border-shield-border hover:border-shield-teal text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Simulate SBI KYC WhatsApp Scam</span>
          </button>

          <button
            onClick={() => handleQuickSimulate('malicious_url', 'Chrome')}
            disabled={simulating}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-shield-card hover:bg-shield-navy border border-shield-border hover:border-shield-teal text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-shield-teal"></span>
            <span>Simulate Deceptive URL Navigation</span>
          </button>
        </div>
      </section>

      {/* Main Threat Stream Feed */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-shield-border/60">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-shield-teal" />
              <span>{t.dashboard.feedTitle}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {t.dashboard.feedSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadEvents}
              className="p-2 rounded-lg bg-shield-card border border-shield-border text-slate-300 hover:text-white transition-colors"
              title="Refresh Stream"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {events.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-500/40 hover:bg-rose-900/60 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.dashboard.clearFeedBtn}</span>
              </button>
            )}
          </div>
        </div>

        {events.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel border border-shield-border space-y-3">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 opacity-60" />
            <h3 className="text-base font-bold text-white">{t.dashboard.noThreatsTitle}</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {t.dashboard.noThreatsDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {events.map((evt) => {
              const isCritical = evt.riskLevel === 'CRITICAL';
              const isHigh = evt.riskLevel === 'HIGH';
              const borderAccent = isCritical
                ? 'border-l-4 border-l-rose-500 border-shield-border'
                : isHigh
                ? 'border-l-4 border-l-rose-400 border-shield-border'
                : 'border-l-4 border-l-amber-400 border-shield-border';

              const riskBadgeColor = isCritical
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/60'
                : isHigh
                ? 'bg-rose-950/70 text-rose-300 border-rose-500/50'
                : 'bg-amber-950/70 text-amber-300 border-amber-500/50';

              return (
                <div
                  key={evt.id}
                  className={`p-5 rounded-2xl glass-panel-elevated border ${borderAccent} shadow-xl hover:border-shield-teal/40 transition-all space-y-3`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${riskBadgeColor}`}>
                        {evt.riskLevel} ({evt.confidenceScore}/100)
                      </span>
                      <span className="text-xs font-bold text-white">
                        {evt.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-shield-card font-mono text-[10px] text-shield-cyan border border-shield-border">
                        {evt.source}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{evt.timestamp}</span>
                    </div>
                  </div>

                  {/* Redacted Preview */}
                  <div className="p-2.5 rounded-xl bg-shield-navy border border-shield-border font-mono text-xs text-slate-300 break-words">
                    {evt.redactedPreview}
                  </div>

                  {/* Detection Reasons */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Detection Indicators:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {evt.detectionReasons.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Action & CTA */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-shield-border/40">
                    <div className="text-xs text-rose-200">
                      <strong className="text-white">Recommended Safety Action: </strong>
                      {evt.recommendedAction}
                    </div>

                    <button
                      onClick={() => setSelectedAlert(evt)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-shield-navy bg-shield-teal hover:bg-shield-cyan transition-colors self-end sm:self-auto shrink-0"
                    >
                      View Threat Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Emergency Guidance Strip */}
      <section className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 to-shield-navy border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Emergency Financial Cybercrime Helpline (India)</h4>
            <p className="text-xs text-slate-300">
              If an unauthorized transaction was initiated, call <strong>1930</strong> immediately to freeze account fund flows.
            </p>
          </div>
        </div>
        <a
          href="tel:1930"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white self-start sm:self-center transition-colors shadow-md"
        >
          Call 1930
        </a>
      </section>

      {/* Alert Detail Modal */}
      <ImmediateAlertModal
        event={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />
    </div>
  );
};
