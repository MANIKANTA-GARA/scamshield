import React from 'react';
import { AlertTriangle, AlertOctagon, ShieldCheck, ShieldAlert } from 'lucide-react';

interface TacticalGaugeProps {
  score: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const TacticalGauge: React.FC<TacticalGaugeProps> = ({ score, riskLevel }) => {
  // SVG gauge geometry
  const radius = 68;
  const strokeWidth = 10;
  const circumference = Math.PI * radius; // Half-circle
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const color =
    riskLevel === 'CRITICAL'
      ? '#EF476F'
      : riskLevel === 'HIGH'
      ? '#F78C6B'
      : riskLevel === 'MEDIUM'
      ? '#FFD166'
      : '#06D6A0';

  const glowClass =
    riskLevel === 'CRITICAL'
      ? 'glow-crimson'
      : riskLevel === 'HIGH'
      ? 'glow-amber'
      : riskLevel === 'MEDIUM'
      ? 'glow-amber'
      : 'glow-emerald';

  return (
    <div className={`p-4 rounded-2xl hud-panel hud-corners border border-cyan-500/30 flex flex-col items-center justify-center relative ${glowClass}`}>
      {/* HUD Header Tag */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-cyan-500/20 pb-2 mb-2">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
          TACTICAL THREAT INDEX
        </span>
        <span className="font-bold text-white tracking-widest uppercase">HUD-GAUGE</span>
      </div>

      {/* Semi-Circular SVG Gauge */}
      <div className="relative w-44 h-28 flex items-end justify-center">
        <svg className="w-44 h-44 -rotate-180" viewBox="0 0 160 160">
          {/* Background Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />

          {/* Segment Markers */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.4s ease',
              filter: `drop-shadow(0 0 8px ${color}88)`,
            }}
          />
        </svg>

        {/* Center Readout & Icon */}
        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center text-center">
          <div className="mb-0.5">
            {riskLevel === 'CRITICAL' && <AlertOctagon className="w-6 h-6 text-rose-500 animate-bounce" />}
            {riskLevel === 'HIGH' && <AlertTriangle className="w-6 h-6 text-rose-400 animate-pulse" />}
            {riskLevel === 'MEDIUM' && <ShieldAlert className="w-6 h-6 text-amber-400" />}
            {riskLevel === 'LOW' && <ShieldCheck className="w-6 h-6 text-emerald-400" />}
          </div>
          <span className="text-3xl font-mono font-black text-white tracking-tighter leading-none">
            {score}
            <span className="text-xs font-mono text-slate-400 font-normal">/100</span>
          </span>
          <span
            className="text-[10px] font-mono font-extrabold uppercase tracking-wider mt-1 px-2 py-0.5 rounded border"
            style={{
              color: color,
              borderColor: `${color}66`,
              backgroundColor: `${color}18`,
            }}
          >
            {riskLevel} THREAT
          </span>
        </div>
      </div>

      {/* Threat Bracket Legend */}
      <div className="w-full grid grid-cols-4 gap-1 text-[9px] font-mono text-center text-slate-400 pt-3 border-t border-cyan-500/20 mt-2">
        <div className={`py-0.5 rounded ${riskLevel === 'LOW' ? 'bg-emerald-950 text-emerald-300 font-bold' : ''}`}>
          0-24 SAFE
        </div>
        <div className={`py-0.5 rounded ${riskLevel === 'MEDIUM' ? 'bg-amber-950 text-amber-300 font-bold' : ''}`}>
          25-49 WARN
        </div>
        <div className={`py-0.5 rounded ${riskLevel === 'HIGH' ? 'bg-rose-950 text-rose-300 font-bold' : ''}`}>
          50-79 HIGH
        </div>
        <div className={`py-0.5 rounded ${riskLevel === 'CRITICAL' ? 'bg-rose-900 text-rose-200 font-extrabold' : ''}`}>
          80-100 CRIT
        </div>
      </div>
    </div>
  );
};
