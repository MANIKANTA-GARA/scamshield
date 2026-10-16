import React from 'react';
import { Shield, Radio, Activity, Cpu, Database } from 'lucide-react';

interface TacticalRadarProps {
  isScanning: boolean;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  threatCount: number;
  ollamaAvailable: boolean;
  ollamaModel: string;
}

export const TacticalRadar: React.FC<TacticalRadarProps> = ({
  isScanning,
  threatLevel,
  threatCount,
  ollamaAvailable,
  ollamaModel,
}) => {
  const radarColor =
    threatLevel === 'CRITICAL'
      ? '#EF476F'
      : threatLevel === 'HIGH'
      ? '#F78C6B'
      : threatLevel === 'MEDIUM'
      ? '#FFD166'
      : '#00B4D8';

  return (
    <div className="relative p-4 rounded-2xl hud-panel hud-corners overflow-hidden border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left: Radar Visualizer */}
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/30"></div>
          {/* Middle Ring */}
          <div className="absolute inset-3 rounded-full border border-cyan-500/20"></div>
          {/* Inner Ring */}
          <div className="absolute inset-6 rounded-full border border-cyan-500/40"></div>
          {/* Crosshairs */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/20"></div>
          <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/20"></div>

          {/* Sweeping Radar Beam */}
          <div
            className={`absolute inset-0 rounded-full ${
              isScanning ? 'animate-radar' : 'opacity-30'
            }`}
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${radarColor}44 340deg, ${radarColor} 360deg)`,
            }}
          ></div>

          {/* Center Target Dot */}
          <div
            className="w-2.5 h-2.5 rounded-full z-10 animate-ping"
            style={{ backgroundColor: radarColor }}
          ></div>
          <div
            className="absolute w-2 h-2 rounded-full z-10"
            style={{ backgroundColor: radarColor }}
          ></div>

          {/* Target Blips */}
          {threatCount > 0 && (
            <>
              <div
                className="absolute w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"
                style={{ top: '25%', left: '65%' }}
                title="Threat Indicator 1"
              ></div>
              {threatCount > 1 && (
                <div
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
                  style={{ bottom: '30%', left: '28%' }}
                  title="Threat Indicator 2"
                ></div>
              )}
            </>
          )}
        </div>

        {/* Telemetry Readout */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Tactical Threat Radar
            </span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                isScanning
                  ? 'bg-amber-950 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {isScanning ? 'SWEEPING' : 'ACTIVE LISTEN'}
            </span>
          </div>

          <p className="text-[11px] font-mono text-slate-400">
            Grid: <span className="text-cyan-300">SECTOR-01</span> • Targets Tracked: <strong className="text-white">{threatCount}</strong>
          </p>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono pt-1 text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Rules Core: 100% Offline
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${ollamaAvailable ? 'bg-cyan-400' : 'bg-slate-500'}`}></span>
              Neural Core: {ollamaAvailable ? ollamaModel : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Live Diagnostics Strip */}
      <div className="flex items-center gap-2.5 self-stretch sm:self-center bg-shield-darkest/80 p-2.5 rounded-xl border border-cyan-500/20 text-[11px] font-mono">
        <div className="px-2.5 py-1 rounded bg-shield-navy/60 border border-shield-border">
          <span className="text-slate-400 block text-[9px]">VRAM STATUS</span>
          <span className="text-cyan-300 font-bold">RTX 3050 (4GB)</span>
        </div>
        <div className="px-2.5 py-1 rounded bg-shield-navy/60 border border-shield-border">
          <span className="text-slate-400 block text-[9px]">INFERENCE BUS</span>
          <span className="text-emerald-400 font-bold">CUDA / INT4</span>
        </div>
        <div className="px-2.5 py-1 rounded bg-shield-navy/60 border border-shield-border">
          <span className="text-slate-400 block text-[9px]">DATA PRIVACY</span>
          <span className="text-emerald-400 font-bold">100% AIRGAPPED</span>
        </div>
      </div>
    </div>
  );
};
