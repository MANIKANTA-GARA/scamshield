import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Trash2, 
  ShieldCheck, 
  EyeOff, 
  Database, 
  Smartphone, 
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';
import { useLanguage } from '../translations/index.js';
import { RiskBadge } from '../components/RiskBadge.js';
import { getLocalScanHistory, clearLocalScanHistory, AnonymousScanRecord } from '../utils/localHistory.js';

interface PrivacyHistoryProps {
  onOpenPrivacyNotice: () => void;
}

export const PrivacyHistory: React.FC<PrivacyHistoryProps> = ({ onOpenPrivacyNotice }) => {
  const { t } = useLanguage();
  const [history, setHistory] = useState<AnonymousScanRecord[]>([]);

  useEffect(() => {
    setHistory(getLocalScanHistory());
  }, []);

  const handleClear = () => {
    clearLocalScanHistory();
    setHistory([]);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-shield-teal/20 text-shield-teal flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.privacy.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          {t.privacy.subtitle}
        </p>
      </div>

      {/* Privacy Guarantees Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {t.privacy.guaranteesTitle}
          </h2>
          <button
            onClick={onOpenPrivacyNotice}
            className="text-xs text-shield-teal hover:underline font-medium"
          >
            Read Full Privacy Notice
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl glass-panel border border-shield-border space-y-1.5">
            <div className="flex items-center gap-2 text-shield-teal font-bold text-xs">
              <Database className="w-4 h-4" />
              <span>{t.privacy.g1Title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.privacy.g1Desc}
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-shield-border space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Clock className="w-4 h-4" />
              <span>{t.privacy.g2Title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.privacy.g2Desc}
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-shield-border space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <EyeOff className="w-4 h-4" />
              <span>{t.privacy.g3Title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.privacy.g3Desc}
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-shield-border space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Smartphone className="w-4 h-4" />
              <span>{t.privacy.g4Title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.privacy.g4Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Local Anonymous Scan Log */}
      <div className="rounded-2xl glass-panel p-6 border border-shield-border shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-shield-border/60">
          <div>
            <h3 className="text-sm font-bold text-white">{t.privacy.historyTitle}</h3>
            <span className="text-[11px] text-slate-400">Stores anonymous metadata only in local browser memory</span>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-500/40 hover:bg-rose-900/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.privacy.clearHistoryBtn}</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-400" />
            <p>{t.privacy.noHistory}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-shield-navy/60 border border-shield-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-shield-card text-shield-cyan border border-shield-border">
                      {item.module}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                  <strong className="text-slate-200 block text-xs">
                    {item.category}
                  </strong>
                </div>

                <div className="shrink-0">
                  <RiskBadge level={item.riskLevel} score={item.score} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
