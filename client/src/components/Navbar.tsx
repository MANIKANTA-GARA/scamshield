import React, { useState } from 'react';
import { Shield, PhoneCall, Globe, Menu, X, CheckCircle2, Search } from 'lucide-react';
import { useLanguage } from '../translations/index.js';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenPrivacyNotice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenPrivacyNotice }) => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'scanner', label: 'Local Scanner & Judge Mode', icon: Search },
    { id: 'dashboard', label: t.common.navDashboard },
    { id: 'sources', label: t.common.navSources },
    { id: 'simulator', label: t.common.navSimulator },
    { id: 'guide', label: t.common.navSafetyGuide },
    { id: 'quiz', label: t.common.navQuiz },
    { id: 'privacy', label: t.common.navPrivacy },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full hud-panel border-b border-cyan-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('scanner')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-400/20 glow-cyan">
              <Shield className="w-6 h-6 text-shield-navy stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-lg tracking-wider text-white">
                  SCAMSHIELD <span className="text-cyan-400">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/90 border border-cyan-400/40 text-cyan-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  TACTICAL HUD
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
                100% On-Device Engine • Gemma4 RTX GPU Core • Zero Cloud DB
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1.5 font-mono">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  currentTab === item.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold shadow-sm glow-cyan'
                    : 'text-slate-300 hover:text-white hover:bg-shield-navy/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Controls: Language Switcher + 1930 Helpline */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-shield-card border border-shield-border hover:border-shield-teal/60 text-slate-200 hover:text-shield-cyan transition-all"
              title="Toggle English / తెలుగు"
            >
              <Globe className="w-3.5 h-3.5 text-shield-teal" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Emergency 1930 quick action */}
            <a
              href="tel:1930"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 hover:border-rose-400 transition-all shadow-sm"
              title="National Cyber Crime Helpline 1930"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="hidden md:inline">Helpline</span>
              <span>1930</span>
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-shield-card border border-shield-border text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-shield-border/60 bg-shield-darkest/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between py-2 border-b border-shield-border/40 text-xs text-slate-400">
            <span>Engine Status:</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Local Offline Engine Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center p-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                  currentTab === item.id
                    ? 'bg-shield-teal/20 text-shield-cyan border border-shield-teal/40 font-bold'
                    : 'bg-shield-card/60 text-slate-300 hover:bg-shield-card hover:text-white border border-transparent'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-shield-border/40 flex justify-between items-center text-xs">
            <button
              onClick={() => {
                onOpenPrivacyNotice();
                setMobileMenuOpen(false);
              }}
              className="text-shield-teal hover:underline"
            >
              Privacy & Redaction Notice
            </button>
            <span className="text-slate-500 text-[11px]">Local Hackathon Edition</span>
          </div>
        </div>
      )}
    </header>
  );
};
