import React from 'react';
import { Share2, ArrowRight, X, ExternalLink, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../translations/index.js';

interface ShareTargetBannerProps {
  sharedText?: string;
  sharedUrl?: string;
  onScanNow: (text: string, isUrl: boolean) => void;
  onDismiss: () => void;
}

export const ShareTargetBanner: React.FC<ShareTargetBannerProps> = ({
  sharedText,
  sharedUrl,
  onScanNow,
  onDismiss,
}) => {
  const { t } = useLanguage();

  if (!sharedText && !sharedUrl) return null;

  const contentToScan = sharedUrl || sharedText || '';
  const isUrl = Boolean(sharedUrl) || /^https?:\/\//i.test(sharedText || '');

  return (
    <div className="mb-6 p-4 sm:p-5 rounded-2xl glass-panel-elevated border-2 border-shield-teal/50 shadow-xl glow-teal animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-shield-teal/20 border border-shield-teal flex items-center justify-center text-shield-teal shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{t.shareBanner.title}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-shield-teal/20 text-shield-cyan border border-shield-teal/30">
                Android Share Target
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {t.shareBanner.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-shield-card/80 transition-colors"
          aria-label="Dismiss shared preview"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Box */}
      <div className="mt-3 p-3 rounded-xl bg-shield-navy/90 border border-shield-border font-mono text-xs text-slate-200 break-words max-h-32 overflow-y-auto">
        <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
          {isUrl ? 'Shared URL (Unopened):' : 'Shared Message Text:'}
        </span>
        {contentToScan}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] text-amber-300 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Safety Notice: ScamShield never opens target links or initiates network requests to submitted URLs.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-shield-card hover:bg-shield-card/80 transition-colors"
          >
            {t.shareBanner.dismissBtn}
          </button>
          <button
            onClick={() => onScanNow(contentToScan, isUrl)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-shield-navy bg-gradient-to-r from-shield-teal to-shield-emerald hover:opacity-95 shadow-md shadow-shield-teal/30 transition-all"
          >
            <span>{t.shareBanner.scanBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
