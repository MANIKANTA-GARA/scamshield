import React from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  AlertOctagon, 
  PhoneCall, 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../translations/index.js';

export const SafetyGuide: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.safetyGuide.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          {t.safetyGuide.subtitle}
        </p>
      </div>

      {/* Emergency Immediate Action Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-950/80 via-shield-navy to-shield-dark border-2 border-rose-500/50 p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 text-rose-300">
          <AlertOctagon className="w-6 h-6 animate-pulse" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            {t.safetyGuide.emergencyStepsTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-200">
          <div className="p-3.5 rounded-xl bg-black/40 border border-rose-500/30">
            <strong className="text-rose-300 block mb-1">Step 1: Call 1930 Immediately</strong>
            <span>{t.safetyGuide.step1}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-black/40 border border-rose-500/30">
            <strong className="text-rose-300 block mb-1">Step 2: Freeze Cards & NetBanking</strong>
            <span>{t.safetyGuide.step2}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-black/40 border border-rose-500/30">
            <strong className="text-rose-300 block mb-1">Step 3: File Official Cybercrime Complaint</strong>
            <span>{t.safetyGuide.step3}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-black/40 border border-rose-500/30">
            <strong className="text-rose-300 block mb-1">Step 4: Notify Bank Branch Manager</strong>
            <span>{t.safetyGuide.step4}</span>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-rose-200/80 border-t border-rose-500/30 flex items-center justify-between">
          <span>Disclaimer: ScamShield AI does not file police reports on your behalf. You must call 1930 or visit cybercrime.gov.in.</span>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-white underline font-semibold"
          >
            cybercrime.gov.in <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Core Security Rules */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Non-Negotiable Defensive Principles</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Rule 1 */}
          <div className="p-5 rounded-2xl glass-panel border border-shield-border space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <KeyRound className="w-4 h-4" />
              <h3>{t.safetyGuide.rule1Title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.safetyGuide.rule1Desc}
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-5 rounded-2xl glass-panel border border-shield-border space-y-2">
            <div className="flex items-center gap-2 text-shield-teal font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <h3>{t.safetyGuide.rule2Title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.safetyGuide.rule2Desc}
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-5 rounded-2xl glass-panel border border-shield-border space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Smartphone className="w-4 h-4" />
              <h3>{t.safetyGuide.rule3Title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.safetyGuide.rule3Desc}
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-5 rounded-2xl glass-panel border border-shield-border space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <HelpCircle className="w-4 h-4" />
              <h3>{t.safetyGuide.rule4Title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.safetyGuide.rule4Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Common Modus Operandi in India */}
      <div className="rounded-2xl glass-panel p-6 border border-shield-border space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Anatomy of Dominant Indian Cyber Financial Scams
        </h3>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-shield-navy border border-shield-border">
            <strong className="text-white block mb-0.5">1. The "Digital Arrest" Trap</strong>
            Fraudsters impersonate CBI, Mumbai Police, or Telecom authorities via Skype or WhatsApp video calls. They claim your Aadhaar was used in money laundering or narcotics, and command you to transfer money to a "Supreme Court Verification Escrow account". <em>Truth: Police, courts, and RBI never conduct digital arrests or demand money over video calls.</em>
          </div>

          <div className="p-3 rounded-xl bg-shield-navy border border-shield-border">
            <strong className="text-white block mb-0.5">2. Electricity Bill Disconnection Panic</strong>
            SMS claims power will be cut tonight at 9:30 PM. Victims call the number in the SMS; the attacker convinces them to download a ₹10 recharge app (which is actually AnyDesk) and drains their account. <em>Truth: Never call numbers listed inside suspicious SMS messages.</em>
          </div>

          <div className="p-3 rounded-xl bg-shield-navy border border-shield-border">
            <strong className="text-white block mb-0.5">3. Work-from-Home YouTube Like Task Scams</strong>
            Victims are paid ₹150 for liking videos initially, then added to Telegram VIP groups and coerced to deposit ₹50,000 for "crypto doubling". They can never withdraw their deposits. <em>Truth: Legitimate companies never charge fees to give you work.</em>
          </div>
        </div>
      </div>
    </div>
  );
};
