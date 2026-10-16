import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  Search, 
  RotateCcw, 
  Copy, 
  Check, 
  AlertOctagon, 
  ShieldCheck, 
  AlertTriangle, 
  Shield, 
  Info, 
  ExternalLink,
  Lock,
  Globe
} from 'lucide-react';
import { useLanguage } from '../translations/index.js';
import { RiskBadge } from '../components/RiskBadge.js';
import { scanUrl, UrlScanResult } from '../utils/api.js';
import { addScanToHistory } from '../utils/localHistory.js';

interface UrlAnalyzerProps {
  initialUrl?: string;
}

export const UrlAnalyzer: React.FC<UrlAnalyzerProps> = ({ initialUrl = '' }) => {
  const { language, t } = useLanguage();
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setInputUrl(initialUrl);
    }
  }, [initialUrl]);

  const samples = [
    {
      label: t.urlScan.sampleDeceptiveSubdomain,
      url: "https://sbi.bank-login-secure.top/kyc/update-pan",
    },
    {
      label: t.urlScan.sampleIp,
      url: "http://192.168.1.150/ebanking/auth",
    },
    {
      label: t.urlScan.sampleHomoglyph,
      url: "http://xn--sbi-9ja.com/portal/online",
    },
    {
      label: t.urlScan.sampleShortener,
      url: "https://bit.ly/sbi-urgent-reward-claim",
    },
    {
      label: t.urlScan.sampleSafe,
      url: "https://www.onlinesbi.sbi",
    },
  ];

  const handleScan = async (overrideUrl?: string) => {
    const urlToScan = overrideUrl !== undefined ? overrideUrl : inputUrl;
    if (!urlToScan.trim()) {
      setError('Please enter a URL to inspect.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await scanUrl(urlToScan);
      setResult(data);

      addScanToHistory({
        module: 'url',
        category: `URL: ${data.parsedDomain}`,
        riskLevel: data.riskLevel,
        score: data.heuristicScore,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to inspect link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `[ScamShield AI URL Report]
Inspected Host: ${result.parsedDomain}
Risk Status: ${result.riskLevel.toUpperCase()} (Score: ${result.heuristicScore}/100)
Protocol: ${result.protocol}

Indicators:
${result.indicators.map(i => `[${i.type.toUpperCase()}] ${i.title}: ${i.description}`).join('\n')}

Explanation:
${language === 'te' ? result.explanation.te : result.explanation.en}

Safe Advice:
${(language === 'te' ? result.safeNextSteps.te : result.safeNextSteps.en).map(s => `• ${s}`).join('\n')}

Helpline: 1930 | cybercrime.gov.in`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-shield-teal/20 text-shield-cyan flex items-center justify-center">
            <Link2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.urlScan.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          {t.urlScan.subtitle}
        </p>
      </div>

      {/* Input Box */}
      <div className="rounded-2xl glass-panel p-5 border border-shield-border shadow-xl">
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Target Link (Inspected Offline without Fetching)
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder={t.urlScan.placeholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-shield-navy/90 border border-shield-border text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-shield-teal/80 focus:ring-1 focus:ring-shield-teal font-mono transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setInputUrl('');
                setResult(null);
                setError(null);
              }}
              disabled={loading || !inputUrl}
              className="px-3.5 py-3 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-shield-navy border border-shield-border/50 disabled:opacity-40 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleScan()}
              disabled={loading || !inputUrl.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-shield-navy bg-gradient-to-r from-shield-teal to-shield-emerald hover:opacity-95 disabled:opacity-40 shadow-lg shadow-shield-teal/20 transition-all"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-shield-navy border-t-transparent rounded-full animate-spin"></span>
                  <span>{t.common.scanning}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Inspect Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Samples Bar */}
        <div className="mt-5 pt-4 border-t border-shield-border/50">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            {t.common.trySample}
          </span>
          <div className="flex flex-wrap gap-2">
            {samples.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputUrl(s.url);
                  handleScan(s.url);
                }}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-shield-card hover:bg-shield-navy border border-shield-border hover:border-shield-teal/50 text-slate-300 hover:text-white transition-all text-left"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-fade-in">
          <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">
            <strong className="block mb-0.5 font-semibold">Inspection Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="rounded-2xl glass-panel-elevated p-6 border border-shield-teal/40 shadow-2xl space-y-6 animate-fade-in">
          {/* Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-shield-border/60">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                {t.urlScan.resultTitle}
              </span>
              <h2 className="text-lg sm:text-xl font-mono font-bold text-white mt-1 break-all">
                {result.parsedDomain}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <RiskBadge level={result.riskLevel} score={result.heuristicScore} size="lg" />
              <button
                onClick={handleCopyReport}
                className="p-2.5 rounded-xl bg-shield-card border border-shield-border hover:border-shield-teal/60 text-slate-300 hover:text-white transition-all"
                title="Copy Analysis Report"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* HTTPS Caveat Alert Banner */}
          <div className="p-3.5 rounded-xl bg-shield-navy/90 border border-shield-teal/30 flex items-start gap-3 text-xs">
            <Lock className="w-4 h-4 text-shield-teal shrink-0 mt-0.5" />
            <p className="text-slate-300">
              <strong className="text-white">Security Principle: </strong>
              {t.urlScan.httpsNote}
            </p>
          </div>

          {/* Indicators List */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              {t.urlScan.indicatorsTitle}
            </h3>
            <div className="space-y-2.5">
              {result.indicators.map((ind, idx) => {
                const badgeColor = {
                  danger: 'bg-rose-950/70 border-rose-500/40 text-rose-300',
                  warning: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
                  info: 'bg-blue-950/70 border-blue-500/40 text-blue-300',
                  safe: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
                }[ind.type];

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${badgeColor} text-xs`}
                  >
                    <div className="font-semibold text-white mb-1 flex items-center justify-between">
                      <span>{ind.title}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40">
                        {ind.type}
                      </span>
                    </div>
                    <p className="opacity-90 leading-relaxed">{ind.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Threat Intelligence Feed Status */}
          <div className="p-4 rounded-xl bg-shield-card/60 border border-shield-border text-xs">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-shield-teal" />
              {t.urlScan.threatIntelTitle}
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-300">
              <span>Source: <strong className="text-white">{result.threatIntelResult.source}</strong></span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${result.threatIntelResult.flagged ? 'bg-rose-900/60 text-rose-300 border border-rose-500/40' : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'}`}>
                {result.threatIntelResult.details}
              </span>
            </div>
          </div>

          {/* Bilingual Explanation */}
          <div className="p-4 rounded-xl bg-shield-navy border border-shield-border text-xs sm:text-sm">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
              Assessment Summary:
            </h4>
            <p className="text-slate-100 leading-relaxed">
              {language === 'te' ? result.explanation.te : result.explanation.en}
            </p>
          </div>

          {/* Safe Next Steps */}
          <div>
            <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-xs mb-2">
              Safe Protective Measures:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(language === 'te' ? result.safeNextSteps.te : result.safeNextSteps.en).map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200"
                >
                  • {step}
                </div>
              ))}
            </div>
          </div>

          {/* Limitation & Disclaimer */}
          <div className="pt-4 border-t border-shield-border/50 text-[11px] text-slate-400 space-y-1">
            <p><Info className="w-3.5 h-3.5 inline mr-1 text-slate-500" /><strong>Heuristic Boundary:</strong> {result.uncertaintyNotes}</p>
            <p className="text-slate-500 italic">{result.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
};
