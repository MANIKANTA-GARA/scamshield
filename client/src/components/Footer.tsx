import React from 'react';
import { Shield, PhoneCall, ExternalLink, Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../translations/index.js';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-shield-border/60 bg-shield-navy/60 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Mission */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-shield-teal" />
              <span className="font-bold text-white text-sm">ScamShield AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-3">
              {t.common.tagline}. Dedicated to protecting Indian citizens from digital arrest scams, UPI fraud, fake KYC threats, and malicious URLs.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-knowledge client redaction active</span>
            </div>
          </div>

          {/* Emergency Government Contacts */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              Official Cybercrime Helplines (India)
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="tel:1930"
                  className="flex items-center gap-2 text-rose-300 font-bold hover:underline"
                >
                  <span>1930</span>
                  <span className="text-[11px] font-normal text-slate-400">(Toll-free National Cyber Financial Fraud)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-shield-cyan hover:underline"
                >
                  <span>cybercrime.gov.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://sancharsaathi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-shield-cyan hover:underline"
                >
                  <span>Sanchar Saathi (Chakshu Portal)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Limitations & Ethical AI Notice */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Scope & Ethical AI Boundaries
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              ScamShield AI is an independent awareness and educational detection tool. It does <strong>NOT</strong> file official police reports, verify live banking databases, or automatically halt bank transactions. Undetected content is never guaranteed safe. Always verify questionable requests directly through your bank's official application.
            </p>
          </div>
        </div>

        <div className="border-t border-shield-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ScamShield AI — Hackathon MVP. Designed with privacy, security, and bilingual accessibility.</p>
          <div className="flex items-center gap-4">
            <span>Powered by Gemini & Heuristic Safety Engine</span>
            <span>•</span>
            <span>English & తెలుగు</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
