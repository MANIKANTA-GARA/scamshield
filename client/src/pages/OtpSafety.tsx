import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldAlert, 
  RotateCcw, 
  Send, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Info,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../translations/index.js';
import { RiskBadge } from '../components/RiskBadge.js';
import { redactClientSensitiveData } from '../utils/otpRedactor.js';
import { scanOtp, OtpScanResult } from '../utils/api.js';
import { addScanToHistory } from '../utils/localHistory.js';

export const OtpSafety: React.FC = () => {
  const { language, t } = useLanguage();
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OtpScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = redactClientSensitiveData(inputMsg);

  const samples = [
    {
      label: t.otpScan.sampleLogin,
      text: "847291 is your confidential OTP to log into HDFC NetBanking on a new device. Valid for 5 mins. NEVER share this code with anyone including bank employees.",
    },
    {
      label: t.otpScan.sampleDebit,
      text: "OTP is 591024 for transaction of INR 24,999.00 at ELECTRONICS HUB on your ICICI Bank Credit Card ending 9012. Do not disclose to anyone.",
    },
    {
      label: t.otpScan.sampleUrgentCancel,
      text: "URGENT: Your Axis account has been debited INR 32,500.00. If this was NOT done by you, immediately call our fraud cancellation desk at 9123456789 and provide reversal OTP: 739201.",
    },
  ];

  const handleScan = async (overrideText?: string) => {
    const textToScan = overrideText !== undefined ? overrideText : inputMsg;
    if (!textToScan.trim()) {
      setError('Please paste an OTP notification message.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await scanOtp(textToScan, language);
      setResult(data);

      addScanToHistory({
        module: 'otp',
        category: `OTP: ${data.suspectedContext}`,
        riskLevel: data.riskLevel,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to analyze OTP message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.otpScan.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          {t.otpScan.subtitle}
        </p>
      </div>

      {/* Golden Rule Highlight Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-shield-dark to-shield-navy border-2 border-amber-500/50 shadow-xl glow-amber">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              {t.otpScan.criticalWarningTitle}
            </h3>
            <p className="text-xs text-amber-100 leading-relaxed font-medium">
              Bank managers, police officers, and customer care executives will <strong>NEVER</strong> ask for your One-Time Password (OTP) or PIN. Anyone asking for your OTP over phone or chat is attempting fraud.
            </p>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="rounded-2xl glass-panel p-5 border border-shield-border shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-shield-teal" />
            <span>Paste OTP SMS (Digits Masked Automatically)</span>
          </label>
        </div>

        <textarea
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder={t.otpScan.placeholder}
          rows={4}
          className="w-full rounded-xl bg-shield-navy/90 border border-shield-border p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-shield-teal/80 focus:ring-1 focus:ring-shield-teal font-sans transition-all resize-y"
        />

        {/* Live Redaction Display */}
        {inputMsg.trim() && (
          <div className="mt-3 p-3 rounded-xl bg-shield-darkest/90 border border-shield-border/60 text-[11px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium text-shield-cyan">
                <Eye className="w-3 h-3" />
                <span>Masked text transmitted to analyzer:</span>
              </span>
              <span className="text-emerald-400 font-mono">
                {preview.hasRedactedOtp ? '✓ OTP digits redacted on your device' : 'No 4-8 digit OTP code detected'}
              </span>
            </div>
            <p className="font-mono text-slate-300 break-words">
              {preview.redactedText}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              setInputMsg('');
              setResult(null);
              setError(null);
            }}
            disabled={loading || !inputMsg}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-shield-navy border border-shield-border/50 disabled:opacity-40 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.common.clearInput}</span>
          </button>

          <button
            onClick={() => handleScan()}
            disabled={loading || !inputMsg.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-shield-navy bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 disabled:opacity-40 shadow-lg shadow-amber-500/20 transition-all ml-auto"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-shield-navy border-t-transparent rounded-full animate-spin"></span>
                <span>{t.common.scanning}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analyze OTP Context</span>
              </>
            )}
          </button>
        </div>

        {/* Samples */}
        <div className="mt-5 pt-4 border-t border-shield-border/50">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            {t.common.trySample}
          </span>
          <div className="flex flex-wrap gap-2">
            {samples.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputMsg(s.text);
                  handleScan(s.text);
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
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs sm:text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="rounded-2xl glass-panel-elevated p-6 border border-amber-500/40 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-shield-border/60">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                {t.otpScan.resultTitle}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                {result.suspectedContext}
              </h2>
            </div>
            <RiskBadge level={result.riskLevel} size="lg" />
          </div>

          {/* Social Engineering Warning If High */}
          {result.riskLevel === 'high' && (
            <div className="p-4 rounded-xl bg-rose-950/80 border-2 border-rose-500/60 text-xs text-rose-200">
              <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Active Social Engineering Attack Detected</span>
              </div>
              <p>
                This message prompts you to call a fake number to "cancel" a charge or "reverse" a fee. Scammers use fake cancellation numbers to panic victims into reading out the real login or transaction OTP.
              </p>
            </div>
          )}

          {/* Explanation */}
          <div className="p-4 rounded-xl bg-shield-navy border border-shield-border text-xs sm:text-sm">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
              Contextual Analysis:
            </h4>
            <p className="text-slate-100 leading-relaxed">
              {language === 'te' ? result.explanation.te : result.explanation.en}
            </p>
          </div>

          {/* Why unexpected OTPs happen */}
          <div className="p-4 rounded-xl bg-shield-card/60 border border-shield-border text-xs">
            <h4 className="font-bold text-shield-cyan uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              {t.otpScan.officialCheckTitle}
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {language === 'te' ? result.officialCheckGuidance.te : result.officialCheckGuidance.en}
            </p>
          </div>

          {/* Safe Next Steps */}
          <div>
            <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-xs mb-2">
              Recommended Protective Protocol:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(language === 'te' ? result.safeNextSteps.te : result.safeNextSteps.en).map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200"
                >
                  ✓ {step}
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="pt-4 border-t border-shield-border/50 text-[11px] text-slate-500 italic">
            <Info className="w-3.5 h-3.5 inline mr-1" />
            {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
