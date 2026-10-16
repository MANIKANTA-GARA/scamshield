import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Globe, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ExternalLink,
  Lock,
  EyeOff
} from 'lucide-react';
import { useLanguage } from '../translations/index.js';
import { fetchProtectionSources, toggleProtectionSource, ProtectionSourceItem } from '../utils/api.js';

export const SourcesManager: React.FC = () => {
  const { language, t } = useLanguage();
  const [sources, setSources] = useState<ProtectionSourceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    try {
      const data = await fetchProtectionSources();
      setSources(data.sources || []);
    } catch (e) {
      console.warn('Failed to load sources', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (sourceId: string, currentStatus: boolean) => {
    try {
      await toggleProtectionSource(sourceId, !currentStatus);
      setSources(prev => prev.map(s => s.id === sourceId ? { ...s, enabled: !currentStatus } : s));
    } catch (e) {
      console.warn('Failed to toggle source', e);
    }
  };

  const getSourceIcon = (type: ProtectionSourceItem['type']) => {
    switch (type) {
      case 'android_notification': return Smartphone;
      case 'browser_extension': return Globe;
      case 'authorized_api': return Mail;
      case 'package_safety': return ShieldCheck;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-shield-teal/20 text-shield-teal flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.sources.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          {t.sources.subtitle}
        </p>
      </div>

      {/* Privacy & Technical Boundary Statement */}
      <div className="p-5 rounded-2xl glass-panel-elevated border border-shield-teal/40 space-y-3">
        <div className="flex items-center gap-2 text-shield-teal font-bold text-xs uppercase tracking-wider">
          <Lock className="w-4 h-4" />
          <span>{t.sources.boundaryNoticeTitle}</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          {t.sources.boundaryNoticeDesc}
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-slate-400 border-t border-shield-border/40">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            No Accessibility Spying
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zero Raw Chat Storage
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Consent-Based Only
          </span>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {sources.map((src) => {
          const Icon = getSourceIcon(src.type);
          return (
            <div
              key={src.id}
              className={`p-6 rounded-2xl glass-panel border transition-all ${src.enabled ? 'border-shield-border hover:border-shield-teal/50' : 'border-shield-border/40 opacity-70'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-shield-card border border-shield-border flex items-center justify-center text-shield-teal shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">{src.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${src.enabled ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                        {src.enabled ? 'ACTIVE MONITOR' : 'DISABLED'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {src.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
                      <span className="text-slate-400">
                        Permission: <strong className="text-slate-200">{src.permissionRequired}</strong>
                      </span>
                      <span>•</span>
                      <span className={src.permissionGranted ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                        {src.permissionGranted ? '✓ Granted' : '⚠️ Action Required'}
                      </span>
                    </div>

                    {src.supportedPackages && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {src.supportedPackages.map((pkg, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-shield-navy text-slate-300 font-mono text-[10px] border border-shield-border">
                            {pkg.substring(pkg.lastIndexOf('.') + 1)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Explicit Technical Limitations Notice */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-black/40 border border-shield-border/50 text-[11px] text-slate-400 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-shield-teal shrink-0 mt-0.5" />
                      <span><strong>Technical Scope:</strong> {src.limitations}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:self-center shrink-0">
                  <button
                    onClick={() => handleToggle(src.id, src.enabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      src.enabled
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                    }`}
                  >
                    {src.enabled ? 'Disable' : 'Enable Source'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Setup Guide */}
      <div className="p-6 rounded-2xl glass-panel border border-shield-border space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Integration Setup & Troubleshooting Guide
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-shield-navy border border-shield-border space-y-1.5">
            <strong className="text-shield-teal block font-bold">1. Android Notification Listener</strong>
            <p>On Android, open <strong>Settings &gt; Apps &gt; Special App Access &gt; Notification Access</strong> and enable <strong>ScamShield AI</strong>. This allows the system service to inspect notifications automatically in the background without reading private chat archives.</p>
          </div>

          <div className="p-4 rounded-xl bg-shield-navy border border-shield-border space-y-1.5">
            <strong className="text-shield-teal block font-bold">2. Chromium Browser Extension</strong>
            <p>Open <code>chrome://extensions</code> in Chrome or Edge, turn on Developer Mode, click <strong>"Load unpacked"</strong>, and select the <code>extension/</code> folder in this project to enable zero-input pre-navigation URL defense.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
