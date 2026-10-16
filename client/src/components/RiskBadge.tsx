import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import { useLanguage } from '../translations/index.js';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'inconclusive';
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  const { t } = useLanguage();

  const config = {
    low: {
      label: t.common.riskLevels.low,
      bg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300',
      glow: 'glow-emerald',
      icon: ShieldCheck,
      color: 'text-emerald-400',
    },
    medium: {
      label: t.common.riskLevels.medium,
      bg: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
      glow: 'glow-amber',
      icon: AlertTriangle,
      color: 'text-amber-400',
    },
    high: {
      label: t.common.riskLevels.high,
      bg: 'bg-rose-950/70 border-rose-500/50 text-rose-300',
      glow: 'glow-rose',
      icon: AlertOctagon,
      color: 'text-rose-400',
    },
    inconclusive: {
      label: t.common.riskLevels.inconclusive,
      bg: 'bg-slate-900/80 border-slate-600 text-slate-300',
      glow: '',
      icon: HelpCircle,
      color: 'text-slate-400',
    },
  }[level] || {
    label: t.common.riskLevels.inconclusive,
    bg: 'bg-slate-900/80 border-slate-600 text-slate-300',
    glow: '',
    icon: HelpCircle,
    color: 'text-slate-400',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5 font-semibold',
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full border shadow-sm ${config.bg} ${config.glow} ${sizeClasses} transition-all duration-300`}
    >
      <Icon className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${config.color} shrink-0`} />
      <span>{config.label}</span>
      {typeof score === 'number' && (
        <span className="ml-1 opacity-75 font-mono text-xs">({score}/100)</span>
      )}
    </div>
  );
};
