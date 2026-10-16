import React, { useState } from 'react';
import { 
  Activity, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  IndianRupee, 
  User, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../translations/index.js';
import { RiskBadge } from '../components/RiskBadge.js';
import { scanTransaction, TransactionScanResult } from '../utils/api.js';
import { addScanToHistory } from '../utils/localHistory.js';

export const TransactionDemo: React.FC = () => {
  const { language, t } = useLanguage();

  // Form State
  const [amount, setAmount] = useState<number>(35000);
  const [baselineAverage, setBaselineAverage] = useState<number>(2500);
  const [timeOfDay, setTimeOfDay] = useState<string>('02:45');
  const [recipientHandle, setRecipientHandle] = useState<string>('win-cashback-refund@fakebank');
  const [recentCount24h, setRecentCount24h] = useState<number>(6);
  const [category, setCategory] = useState<string>('Crypto/Gift Card');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransactionScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const samples = [
    {
      label: t.txnDemo.sampleSpike,
      data: {
        amount: 45000,
        baseline: 2000,
        time: '02:30',
        recipient: 'lottery-win-fastpay@okaxis',
        velocity: 7,
        cat: 'Crypto/Gift Card',
      },
    },
    {
      label: t.txnDemo.sampleNormal,
      data: {
        amount: 1450,
        baseline: 2000,
        time: '17:15',
        recipient: 'freshmart.supermarket@hdfcbank',
        velocity: 1,
        cat: 'Daily Groceries / Supermarket',
      },
    },
    {
      label: t.txnDemo.samplePrize,
      data: {
        amount: 15000,
        baseline: 3000,
        time: '14:20',
        recipient: 'refund-cashback-desk@upi',
        velocity: 4,
        cat: 'Urgent Investment / Trading',
      },
    },
  ];

  const applySample = (s: typeof samples[0]['data']) => {
    setAmount(s.amount);
    setBaselineAverage(s.baseline);
    setTimeOfDay(s.time);
    setRecipientHandle(s.recipient);
    setRecentCount24h(s.velocity);
    setCategory(s.cat);
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanTransaction({
        amount,
        baselineAverage,
        timeOfDay,
        recipientHandle,
        recentCount24h,
        category,
      });
      setResult(data);

      addScanToHistory({
        module: 'transaction',
        category: `Simulated: ₹${amount.toLocaleString()}`,
        riskLevel: data.riskLevel,
        score: data.anomalyScore,
      });
    } catch (err: any) {
      setError(err.message || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.txnDemo.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          {t.txnDemo.subtitle}
        </p>
      </div>

      {/* Simulator Notice */}
      <div className="p-4 rounded-xl bg-shield-card border border-shield-border text-xs flex items-start gap-3 text-slate-300">
        <Info className="w-4 h-4 text-shield-teal shrink-0 mt-0.5" />
        <p>
          <strong>Educational Simulator:</strong> {t.txnDemo.demoDisclaimer}
        </p>
      </div>

      {/* Interactive Form */}
      <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-shield-border shadow-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-shield-teal" />
              <span>{t.txnDemo.amountLabel}</span>
            </label>
            <input
              type="number"
              min={1}
              max={10000000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-shield-navy border border-shield-border text-sm text-white font-mono focus:outline-none focus:border-shield-teal"
            />
          </div>

          {/* Baseline Average */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-shield-teal" />
              <span>{t.txnDemo.baselineLabel}</span>
            </label>
            <input
              type="number"
              min={1}
              value={baselineAverage}
              onChange={(e) => setBaselineAverage(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-shield-navy border border-shield-border text-sm text-white font-mono focus:outline-none focus:border-shield-teal"
            />
          </div>

          {/* Time of Day */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-shield-teal" />
              <span>{t.txnDemo.timeLabel}</span>
            </label>
            <input
              type="text"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              placeholder="02:30"
              className="w-full px-3.5 py-2.5 rounded-xl bg-shield-navy border border-shield-border text-sm text-white font-mono focus:outline-none focus:border-shield-teal"
            />
          </div>

          {/* Recipient Handle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-shield-teal" />
              <span>{t.txnDemo.recipientLabel}</span>
            </label>
            <input
              type="text"
              value={recipientHandle}
              onChange={(e) => setRecipientHandle(e.target.value)}
              placeholder="name@okaxis or 9876543210"
              className="w-full px-3.5 py-2.5 rounded-xl bg-shield-navy border border-shield-border text-sm text-white font-mono focus:outline-none focus:border-shield-teal"
            />
          </div>

          {/* Velocity in 24h */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.txnDemo.velocityLabel}
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={recentCount24h}
              onChange={(e) => setRecentCount24h(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-shield-navy border border-shield-border text-sm text-white font-mono focus:outline-none focus:border-shield-teal"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.txnDemo.categoryLabel}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-shield-navy border border-shield-border text-sm text-white focus:outline-none focus:border-shield-teal"
            >
              <option value="P2P Transfer to Individual">P2P Transfer to Individual</option>
              <option value="Daily Groceries / Supermarket">Daily Groceries / Supermarket</option>
              <option value="Utility Bill / Recharge">Utility Bill / Recharge</option>
              <option value="Urgent Investment / Trading">Urgent Investment / Trading</option>
              <option value="Crypto/Gift Card">Crypto / Gift Card Purchase</option>
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-shield-border/50">
          <button
            onClick={() => {
              setAmount(2000);
              setBaselineAverage(2000);
              setTimeOfDay('14:00');
              setRecipientHandle('merchant@upi');
              setRecentCount24h(1);
              setCategory('Daily Groceries / Supermarket');
              setResult(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-shield-navy border border-shield-border/50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-shield-navy bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all ml-auto"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-shield-navy border-t-transparent rounded-full animate-spin"></span>
                <span>Evaluating Rules...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Evaluate Heuristic Rules</span>
              </>
            )}
          </button>
        </div>

        {/* Samples */}
        <div className="pt-3 border-t border-shield-border/40">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Load Predefined Fictional Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {samples.map((s, idx) => (
              <button
                key={idx}
                onClick={() => applySample(s.data)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-shield-card hover:bg-shield-navy border border-shield-border text-slate-300 hover:text-white transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="rounded-2xl glass-panel-elevated p-6 border border-emerald-500/40 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-shield-border/60">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                {t.txnDemo.resultTitle}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Anomaly Score: {result.anomalyScore}/100
              </h2>
            </div>
            <RiskBadge level={result.riskLevel} score={result.anomalyScore} size="lg" />
          </div>

          {/* Triggered Rules */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              {t.txnDemo.rulesTriggeredTitle}
            </h3>
            <div className="space-y-2">
              {result.flags.map((flag, idx) => {
                const colors = {
                  high: 'bg-rose-950/60 border-rose-500/40 text-rose-200',
                  medium: 'bg-amber-950/60 border-amber-500/40 text-amber-200',
                  low: 'bg-blue-950/60 border-blue-500/40 text-blue-200',
                  info: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200',
                }[flag.severity];

                return (
                  <div key={idx} className={`p-3.5 rounded-xl border ${colors} text-xs`}>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>{flag.title}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40">
                        {flag.severity}
                      </span>
                    </div>
                    <p className="opacity-90 leading-relaxed">{flag.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-shield-navy border border-shield-border text-xs sm:text-sm">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
              Assessment Summary:
            </h4>
            <p className="text-slate-100">
              {language === 'te' ? result.evaluationSummary.te : result.evaluationSummary.en}
            </p>
          </div>

          {/* Protective Recommendations */}
          <div>
            <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-xs mb-2">
              {t.txnDemo.recommendationsTitle}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(language === 'te' ? result.recommendations.te : result.recommendations.en).map((rec, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200">
                  ✓ {rec}
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="pt-4 border-t border-shield-border/50 text-[11px] text-slate-500 italic">
            {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
