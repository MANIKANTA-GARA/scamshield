import React from 'react';
import { AlertOctagon, ShieldAlert, ArrowRight, X, ExternalLink, Info } from 'lucide-react';
import { useLanguage } from '../translations/index.js';
import { SecurityEventItem } from '../utils/api.js';

interface ImmediateAlertModalProps {
  event: SecurityEventItem | null;
  onClose: () => void;
}

export const ImmediateAlertModal: React.FC<ImmediateAlertModalProps> = ({ event, onClose }) => {
  const { language, t } = useLanguage();

  if (!event) return null;

  const isCritical = event.riskLevel === 'CRITICAL';
  const isHigh = event.riskLevel === 'HIGH';

  const riskBadgeStyle = isCritical
    ? 'bg-rose-950/80 border-rose-500 text-rose-300 glow-rose'
    : isHigh
    ? 'bg-rose-950/70 border-rose-500/60 text-rose-300'
    : 'bg-amber-950/70 border-amber-500/60 text-amber-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel-elevated rounded-2xl p-6 sm:p-8 border-2 border-rose-500/80 shadow-2xl space-y-5">
        {/* Top Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-shield-card/60 transition-colors"
          aria-label="Dismiss Alert"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Alert Header */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
            <AlertOctagon className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400 block">
              SCAMSHIELD AI — IMMEDIATE SECURITY ALERT
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Potentially Harmful Content Intercepted
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Automatically analyzed in background from: <strong className="text-shield-cyan">{event.source}</strong>
            </p>
          </div>
        </div>

        {/* Risk & Confidence Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskBadgeStyle}`}>
            Risk: {event.riskLevel}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-shield-navy border border-shield-border text-slate-300">
            Confidence: {event.confidenceScore}/100
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-shield-card text-shield-teal border border-shield-border">
            {event.isVerifiedThreatSource ? 'Verified Threat Signature' : 'Heuristic Pattern Match'}
          </span>
        </div>

        {/* Threat Category */}
        <div className="p-3.5 rounded-xl bg-shield-navy/90 border border-shield-border">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
            Detected Threat Category:
          </span>
          <h3 className="text-sm font-bold text-white">
            {event.category}
          </h3>
          <p className="font-mono text-[11px] text-slate-400 mt-1.5 break-words bg-black/40 p-2 rounded-lg">
            {event.redactedPreview}
          </p>
        </div>

        {/* Reasons */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Detection Reasons:
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-200">
            {event.detectionReasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-shield-navy/60 p-2.5 rounded-lg border border-shield-border/60">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Action */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/60 to-shield-navy border border-rose-500/40 text-xs sm:text-sm text-rose-100">
          <strong className="block text-rose-300 font-bold mb-1 uppercase tracking-wider text-[11px]">
            Recommended Safety Action:
          </strong>
          <span>{event.recommendedAction}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-shield-navy bg-gradient-to-r from-shield-teal to-shield-emerald hover:opacity-95 shadow-lg shadow-shield-teal/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Acknowledge Warning & Close</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
