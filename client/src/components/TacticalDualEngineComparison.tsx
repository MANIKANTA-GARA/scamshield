import React from 'react';
import { Cpu, ShieldCheck, Zap, Bot, ArrowRight, CheckCheck, AlertOctagon } from 'lucide-react';
import { LocalScanResult } from '../utils/localDetection.js';
import { OllamaScamAnalysis } from '../utils/ollamaClient.js';

interface TacticalDualEngineComparisonProps {
  heuristicResult: LocalScanResult;
  ollamaResult: OllamaScamAnalysis | null;
  isOllamaScanning: boolean;
  ollamaError: string | null;
}

export const TacticalDualEngineComparison: React.FC<TacticalDualEngineComparisonProps> = ({
  heuristicResult,
  ollamaResult,
  isOllamaScanning,
  ollamaError,
}) => {
  // Compute consensus agreement
  const isAgree =
    ollamaResult &&
    ((heuristicResult.riskScore >= 50 && ollamaResult.isScam) ||
      (heuristicResult.riskScore < 50 && !ollamaResult.isScam));

  return (
    <div className="space-y-4">
      {/* Consensus Synergy Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-shield-darkest/90 border border-cyan-500/40 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-white font-bold tracking-wider uppercase">
            Dual-Engine Tactical Consensus Matrix
          </span>
        </div>

        {ollamaResult ? (
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                isAgree
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  : 'bg-amber-950 text-amber-300 border-amber-500/50'
              }`}
            >
              <CheckCheck className="w-3 h-3" />
              {isAgree ? 'DUAL-ENGINE CONSENSUS: HIGH CONFIDENCE' : 'DIVERGENCE: DEFENSIVE BIAS'}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400">
            {isOllamaScanning
              ? 'Awaiting Neural Core response...'
              : 'Deterministic Core active (Zero latency)'}
          </span>
        )}
      </div>

      {/* Side-by-Side Dual Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Column 1: Deterministic Heuristic Engine */}
        <div className="p-5 rounded-2xl hud-panel hud-corners border border-cyan-500/30 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase">
                    Deterministic Heuristic Core
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-300 block">
                    Zero-Latency In-Memory Rules
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                &lt; 2ms
              </span>
            </div>

            {/* Score & Verdict */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-shield-darkest/70 border border-shield-border font-mono text-xs">
              <span className="text-slate-400">Heuristic Risk:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  heuristicResult.riskScore >= 80
                    ? 'text-rose-400 bg-rose-950/60'
                    : heuristicResult.riskScore >= 50
                    ? 'text-rose-300 bg-rose-950/40'
                    : heuristicResult.riskScore >= 25
                    ? 'text-amber-300 bg-amber-950/40'
                    : 'text-emerald-300 bg-emerald-950/40'
                }`}
              >
                {heuristicResult.riskScore}/100 ({heuristicResult.riskLevel})
              </span>
            </div>

            {/* Reasons / Rules Triggered */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Rule Attributes ({heuristicResult.reasons.length}):
              </span>
              <ul className="space-y-1 text-xs text-slate-300 font-mono">
                {heuristicResult.reasons.slice(0, 4).map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                    <span className="text-cyan-400 shrink-0">▸</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-cyan-500/10 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>METHOD: LEXICAL & PATTERN MATCH</span>
            <span className="text-emerald-400">AIRGAPPED</span>
          </div>
        </div>

        {/* Column 2: Local Neural Core (Gemma4 on RTX GPU) */}
        <div className="p-5 rounded-2xl hud-panel hud-corners border border-cyan-500/30 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase">
                    On-Device Neural Core
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-300 block">
                    Gemma4 7.5B Q4 • RTX GPU
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {ollamaResult ? `${(ollamaResult.latencyMs / 1000).toFixed(1)}s` : isOllamaScanning ? 'INFERRING...' : 'READY'}
              </span>
            </div>

            {/* Content Body based on inference state */}
            {isOllamaScanning ? (
              <div className="p-6 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-center space-y-2 animate-pulse">
                <Cpu className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-cyan-300">
                  Synthesizing neural fraud patterns in RTX VRAM...
                </p>
                <div className="w-3/4 mx-auto h-1.5 rounded-full bg-cyan-950 overflow-hidden">
                  <div className="h-full bg-cyan-400 animate-pulse w-full"></div>
                </div>
              </div>
            ) : ollamaResult ? (
              <>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-shield-darkest/70 border border-shield-border font-mono text-xs">
                  <span className="text-slate-400">Neural Assessment:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      ollamaResult.riskScore >= 80
                        ? 'text-rose-400 bg-rose-950/60'
                        : ollamaResult.riskScore >= 50
                        ? 'text-rose-300 bg-rose-950/40'
                        : ollamaResult.riskScore >= 25
                        ? 'text-amber-300 bg-amber-950/40'
                        : 'text-emerald-300 bg-emerald-950/40'
                    }`}
                  >
                    {ollamaResult.riskScore}/100 ({ollamaResult.riskLevel})
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Semantic Reason Summary:
                  </span>
                  <p className="text-[11px] font-mono text-slate-300 bg-shield-darkest/50 p-2.5 rounded-lg border border-shield-border/60 line-clamp-3">
                    {ollamaResult.explanation.en}
                  </p>
                  {ollamaResult.explanation.te && (
                    <p className="text-[11px] font-telugu text-cyan-300 bg-shield-navy/40 p-2 rounded-lg border border-cyan-500/20 line-clamp-2">
                      {ollamaResult.explanation.te}
                    </p>
                  )}
                </div>
              </>
            ) : ollamaError ? (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs font-mono text-amber-300">
                Neural reasoning bypassed ({ollamaError}). Deterministic rules active.
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-shield-darkest/50 border border-shield-border/50 text-center font-mono text-xs text-slate-400">
                Awaiting input scan to engage Gemma4 neural evaluation.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-cyan-500/10 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>MODEL: GEMMA4:E4B</span>
            <span className="text-cyan-300">CUDA ACCELERATED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
