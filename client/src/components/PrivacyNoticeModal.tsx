import React from 'react';
import { Shield, Lock, EyeOff, FileText, CheckCircle, X } from 'lucide-react';
import { useLanguage } from '../translations/index.js';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-shield-teal/40 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-shield-card/60 transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-shield-teal/20 border border-shield-teal/40 flex items-center justify-center text-shield-teal">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Privacy-First Data Architecture</h3>
            <p className="text-xs text-shield-cyan">Zero-Retention & Client-Side Redaction</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-shield-navy/60 border border-shield-border">
            <EyeOff className="w-5 h-5 text-shield-teal shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">1. Pre-Processing Masking on Device</strong>
              Your phone replaces OTP numbers, 16-digit debit/credit cards, and Aadhaar numbers with placeholders (e.g. <code>[REDACTED-OTP]</code>) before data is transmitted.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-shield-navy/60 border border-shield-border">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">2. No Permanent Storage of User Messages</strong>
              We do not persist the raw text of your submitted SMS messages, transaction details, or URLs in server databases.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-shield-navy/60 border border-shield-border">
            <FileText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">3. Local Metadata Only</strong>
              Scan history logs are saved exclusively in your browser's private local storage. They record only the timestamp and risk category — never the original message content.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-shield-navy/60 border border-shield-border">
            <CheckCircle className="w-5 h-5 text-shield-cyan shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">4. No Intrusive Android Permissions</strong>
              ScamShield runs as a clean Web app or minimal Share Receiver. It does not demand accessibility services, cannot monitor background keystrokes, and cannot read other apps' private data.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-bold text-shield-navy bg-gradient-to-r from-shield-teal to-shield-emerald hover:opacity-90 transition-opacity shadow-lg shadow-shield-teal/20"
        >
          I Understand & Acknowledge
        </button>
      </div>
    </div>
  );
};
