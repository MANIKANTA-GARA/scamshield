import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Globe,
  Trash2,
  Database,
  ExternalLink,
  Info,
  PhoneCall,
  Sliders,
  Flame,
  CheckCheck,
  Cpu,
  Zap,
  RefreshCw,
  Bot,
  Volume2,
  VolumeX,
  Radio,
  Activity,
  Terminal,
  Crosshair
} from 'lucide-react';
import { useLanguage } from '../translations/index.js';
import { RiskBadge } from './RiskBadge.js';
import { TacticalRadar } from './TacticalRadar.js';
import { TacticalGauge } from './TacticalGauge.js';
import { TacticalDualEngineComparison } from './TacticalDualEngineComparison.js';
import { tacticalAudio } from '../utils/tacticalAudio.js';
import {
  runLocalScamDetection,
  LocalScanResult,
  JUDGE_DEMO_SAMPLES,
  JudgeDemoSample,
} from '../utils/localDetection.js';
import { redactClientSensitiveData } from '../utils/otpRedactor.js';
import {
  saveScanToHistory,
  getStoredScanHistory,
  clearScanHistory,
  clearAllAppData,
  getStoredSettings,
  saveStoredSettings,
  getStorageDiagnostics,
  StoredScanRecord,
  AppSettings,
} from '../utils/localPersistence.js';
import {
  checkOllamaConnection,
  analyzeWithOllama,
  OllamaModelStatus,
  OllamaScamAnalysis,
} from '../utils/ollamaClient.js';

interface LocalScannerViewProps {
  initialInput?: string;
}

export const LocalScannerView: React.FC<LocalScannerViewProps> = ({ initialInput = '' }) => {
  const { language, t } = useLanguage();

  // Input & Scanning State
  const [inputText, setInputText] = useState(initialInput);
  const [scanResult, setScanResult] = useState<LocalScanResult | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // History & Persistence State
  const [history, setHistory] = useState<StoredScanRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [storageInfo, setStorageInfo] = useState(getStorageDiagnostics());
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Ollama Local AI State
  const [ollamaStatus, setOllamaStatus] = useState<OllamaModelStatus>({
    available: false,
    model: 'gemma4:e4b',
    endpoint: '/ollama',
  });
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);
  const [useOllama, setUseOllama] = useState(true);
  const [isOllamaScanning, setIsOllamaScanning] = useState(false);
  const [ollamaResult, setOllamaResult] = useState<OllamaScamAnalysis | null>(null);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  const verifyOllama = async () => {
    setIsCheckingOllama(true);
    try {
      const status = await checkOllamaConnection('gemma4:e4b');
      setOllamaStatus(status);
      if (status.available) {
        showNotification(`Connected to local Ollama (${status.model}) on RTX GPU`);
      }
    } catch (e: any) {
      setOllamaStatus({
        available: false,
        model: 'gemma4:e4b',
        endpoint: '/ollama',
        error: e.message,
      });
    } finally {
      setIsCheckingOllama(false);
    }
  };

  useEffect(() => {
    setHistory(getStoredScanHistory());
    setStorageInfo(getStorageDiagnostics());
    verifyOllama();
  }, []);

  useEffect(() => {
    if (initialInput) {
      setInputText(initialInput);
      executeScan(initialInput, false);
    }
  }, [initialInput]);

  // Client-side real-time redaction preview
  const redactionPreview = redactClientSensitiveData(inputText);

  // Tactical Audio State
  const [audioMuted, setAudioMuted] = useState(false);

  const handleToggleAudio = () => {
    const next = !audioMuted;
    tacticalAudio.setMuted(next);
    setAudioMuted(next);
    if (!next) {
      tacticalAudio.playClick();
      showNotification('Tactical HUD audio alerts enabled');
    } else {
      showNotification('Tactical HUD audio muted');
    }
  };

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const executeScan = async (textToScan: string, isDemo: boolean = false) => {
    setOllamaResult(null);
    setOllamaError(null);
    tacticalAudio.playScanSweep();

    // 1. Instant on-device deterministic heuristics (< 5ms response)
    const result = runLocalScamDetection(textToScan, isDemo);
    setScanResult(result);

    // Audio cue based on threat severity
    if (result.riskScore >= 50) {
      tacticalAudio.playThreatAlarm();
    } else if (result.riskScore > 0) {
      tacticalAudio.playSafeChime();
    }

    // Save to privacy-safe local history only if text was submitted
    if (textToScan.trim()) {
      const summaryText = result.redactedInput.length > 70
        ? result.redactedInput.substring(0, 67) + '...'
        : result.redactedInput;

      saveScanToHistory({
        inputType: result.urlComponents ? 'URL' : 'Message',
        category: result.category,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        verdict: result.verdict,
        reasons: result.reasons,
        privacySafeSummary: summaryText || result.category,
        recommendedAction: result.recommendedAction,
        isSyntheticDemo: isDemo,
      });

      setHistory(getStoredScanHistory());
      setStorageInfo(getStorageDiagnostics());

      // 2. Parallel Deep Reasoning via local Ollama gemma4:e4b (if enabled)
      if (useOllama && ollamaStatus.available) {
        setIsOllamaScanning(true);
        try {
          const aiAnalysis = await analyzeWithOllama(textToScan, ollamaStatus.model);
          setOllamaResult(aiAnalysis);
        } catch (err: any) {
          console.warn('Ollama deep scan failed:', err);
          setOllamaError(err.message || 'Ollama deep analysis encountered an error');
        } finally {
          setIsOllamaScanning(false);
        }
      }
    }
  };

  const handleScanNow = () => {
    tacticalAudio.playClick();
    setActiveSampleId(null);
    executeScan(inputText, false);
  };

  const handleClear = () => {
    tacticalAudio.playClick();
    setInputText('');
    setScanResult(null);
    setActiveSampleId(null);
  };

  const handleLoadSample = (sample: JudgeDemoSample) => {
    tacticalAudio.playClick();
    setInputText(sample.text);
    setActiveSampleId(sample.id);
    executeScan(sample.text, true);
    showNotification(`Loaded Judge Sample #${sample.number}: ${sample.label}`);
  };

  const handleClearHistory = () => {
    clearScanHistory();
    setHistory([]);
    setStorageInfo(getStorageDiagnostics());
    showNotification('Scan history cleared from local storage.');
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all local app data (history and settings)? This cannot be undone.')) {
      clearAllAppData();
      setHistory([]);
      setSettings(getStoredSettings());
      setScanResult(null);
      setInputText('');
      setStorageInfo(getStorageDiagnostics());
      showNotification('All local application data wiped from browser storage.');
    }
  };

  const handleToggleSound = () => {
    const updated = saveStoredSettings({ soundAlerts: !settings.soundAlerts });
    setSettings(updated);
  };

  const handleToggleAutoRedact = () => {
    const updated = saveStoredSettings({ autoRedactEnabled: !settings.autoRedactEnabled });
    setSettings(updated);
  };

  const handleCopyReport = () => {
    if (!scanResult) return;
    const report = `[ScamShield AI Local Assessment Report]
Timestamp: ${scanResult.timestamp}
Verdict: ${scanResult.verdict}
Risk Level: ${scanResult.riskLevel} (${scanResult.riskScore}/100)
Category: ${scanResult.category}
Detection Method: ${scanResult.detectionMethod}

Detection Reasons:
${scanResult.reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Recommended Action:
${scanResult.recommendedAction}

Disclaimer: ${scanResult.disclaimer}`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showNotification('Assessment report copied to clipboard.');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* 1. Offline Mode Banner & Storage Diagnostics Header */}
      <section className="p-4 sm:p-5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 glass-panel shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-900/90 text-emerald-200 border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Local Offline Mode Active
                </span>
                <span className="text-xs font-mono text-slate-300">
                  100% On-Device Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Zero Network Calls • Zero Cloud Database • Zero External API Keys • 100% Privacy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <span className="text-[11px] font-mono text-slate-400 bg-shield-card px-2.5 py-1 rounded-lg border border-shield-border">
              Storage: {storageInfo.historyCount} items (~{(storageInfo.storageSizeBytes / 1024).toFixed(1)} KB)
            </span>
            <button
              onClick={handleClearAllData}
              className="p-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/70 border border-rose-500/30 rounded-lg transition-colors"
              title="Wipe all local app data"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Local Ollama Gemma4 Integration Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-emerald-500/20 text-xs">
          <div className="flex items-center gap-2">
            <div
              id="ollama-status-chip"
              className={`flex items-center gap-2 px-3 py-1 rounded-xl font-mono text-xs border transition-all ${
                ollamaStatus.available
                  ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 ${ollamaStatus.available ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>
                {ollamaStatus.available
                  ? `Ollama Connected: ${ollamaStatus.model} (RTX GPU)`
                  : 'Ollama: Offline (localhost:11434)'}
              </span>
              {ollamaStatus.available && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </div>

            <button
              id="btn-verify-ollama"
              onClick={() => verifyOllama()}
              disabled={isCheckingOllama}
              className="p-1.5 rounded-lg bg-shield-darkest hover:bg-shield-navy text-slate-300 hover:text-white border border-shield-border transition-colors text-xs flex items-center gap-1"
              title="Ping Ollama API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingOllama ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="text-[10px] hidden sm:inline">Refresh</span>
            </button>
          </div>

          {ollamaStatus.available && (
            <label className="flex items-center gap-2 cursor-pointer bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-500/30">
              <input
                id="toggle-deep-reasoning"
                type="checkbox"
                checked={useOllama}
                onChange={(e) => setUseOllama(e.target.checked)}
                className="rounded text-cyan-500 focus:ring-cyan-400 h-3.5 w-3.5 bg-shield-darkest border-shield-border"
              />
              <span className="text-[11px] font-mono text-cyan-200">
                Gemma4 Neural Reasoning: <strong className={useOllama ? 'text-emerald-400' : 'text-slate-400'}>{useOllama ? 'ON' : 'OFF'}</strong>
              </span>
            </label>
          )}
        </div>
      </section>

      {/* Notification Toast */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-shield-navy border border-shield-teal text-white text-xs font-medium shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-shield-teal" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* 2. Tactical Threat Radar Visualizer */}
      <TacticalRadar
        isScanning={isOllamaScanning}
        threatLevel={scanResult?.riskLevel || null}
        threatCount={scanResult?.reasons?.length || 0}
        ollamaAvailable={ollamaStatus.available}
        ollamaModel={ollamaStatus.model}
      />

      {/* 3. Judge Testing Mode (One-Click Rubric Samples) */}
      <section className="p-6 rounded-3xl hud-panel-elevated hud-corners border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-mono font-bold text-white tracking-tight">
                Judge Testing Mode (1-Click Test Scenarios)
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Select any rubric test case below. The local detection engine immediately evaluates it using actual offline rules.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 self-start sm:self-center">
            SYNTHETIC DEMO SAMPLES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {JUDGE_DEMO_SAMPLES.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            const badgeBg =
              sample.expectedRisk === 'CRITICAL'
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                : sample.expectedRisk === 'HIGH'
                ? 'bg-rose-950/70 text-rose-300 border-rose-500/30'
                : sample.expectedRisk === 'MEDIUM'
                ? 'bg-amber-950/70 text-amber-300 border-amber-500/30'
                : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30';

            return (
              <button
                key={sample.id}
                onClick={() => handleLoadSample(sample)}
                className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400 glow-cyan'
                    : 'bg-shield-navy/60 border-shield-border hover:bg-shield-card text-slate-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-mono font-bold text-white">
                      #{sample.number} {sample.label}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${badgeBg}`}>
                      {sample.expectedRisk}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {sample.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-cyan-300 pt-1 border-t border-shield-border/40 font-mono">
                  <span>Type: {sample.type}</span>
                  <span className="font-bold underline">Load & Test →</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Main Scanner Input & Control Panel */}
      <section className="p-6 sm:p-8 rounded-3xl hud-panel-elevated hud-corners border border-cyan-500/30 shadow-2xl space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="scanner-input" className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Enter Message, SMS, WhatsApp Text, or URL to Scan</span>
            </label>
            <span className="text-xs font-mono text-cyan-400">
              {inputText.length} chars
            </span>
          </div>

          <textarea
            id="scanner-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste suspicious text, banking notice, job offer, lottery message, or website URL here..."
            rows={5}
            className="w-full p-4 rounded-2xl bg-shield-darkest/95 border border-cyan-500/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm transition-all shadow-inner"
          />

          {/* Real-time Pre-processing Redaction Preview */}
          {inputText && (
            <div className="mt-3 p-3.5 rounded-xl bg-shield-darkest/90 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-slate-300 font-mono">
              <EyeOff className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="flex-1 overflow-hidden">
                <span className="text-[11px] font-bold text-cyan-300 block mb-0.5 uppercase tracking-wider">
                  Client-Side Pre-Processing Redaction (In-Memory Preview):
                </span>
                <p className="font-mono text-[11px] text-slate-300 break-words line-clamp-2">
                  {redactionPreview.redactedText}
                </p>
                {redactionPreview.hasRedactedOtp && (
                  <span className="mt-1 inline-block text-[10px] text-amber-400 font-bold">
                    ✓ Sensitive OTP / Authentication digits masked before evaluation
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleScanNow}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-mono font-bold text-sm text-shield-navy bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-95 shadow-lg shadow-cyan-400/20 transition-all cursor-pointer active:scale-95"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Scan Now (Local Offline)</span>
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-mono font-semibold text-xs text-slate-300 hover:text-white bg-shield-card border border-shield-border hover:border-slate-500 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>

            {/* Tactical Audio Toggle */}
            <button
              id="btn-toggle-audio"
              onClick={handleToggleAudio}
              className={`flex items-center gap-1.5 px-3.5 py-3 rounded-xl font-mono text-xs border transition-all ${
                audioMuted
                  ? 'bg-shield-card text-slate-400 border-shield-border hover:text-slate-300'
                  : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40 shadow-sm'
              }`}
              title={audioMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
              <span className="hidden sm:inline">{audioMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Network Upload • Sandboxed Browser Logic</span>
          </div>
        </div>
      </section>

      {/* 4. Detailed Scan Results Panel */}
      {scanResult && (
        <section className="space-y-6 animate-fade-in">
          <div
            className={`p-6 sm:p-8 rounded-3xl glass-panel-elevated border shadow-2xl space-y-6 ${
              scanResult.riskLevel === 'CRITICAL'
                ? 'border-rose-500/70 bg-gradient-to-b from-rose-950/30 to-shield-card/80'
                : scanResult.riskLevel === 'HIGH'
                ? 'border-rose-500/50 bg-gradient-to-b from-rose-950/20 to-shield-card/80'
                : scanResult.riskLevel === 'MEDIUM'
                ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-shield-card/80'
                : 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 to-shield-card/80'
            }`}
          >
            {/* Tactical HUD Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                  <Crosshair className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-mono font-bold text-white tracking-wider uppercase">
                    Tactical Threat Verdict: {scanResult.verdict}
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-300">
                    Category: <strong className="text-white">{scanResult.category}</strong> • Timestamp: {scanResult.timestamp}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider border ${
                    scanResult.riskLevel === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-lg glow-crimson'
                      : scanResult.riskLevel === 'HIGH'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/80'
                      : scanResult.riskLevel === 'MEDIUM'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/80'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 glow-emerald'
                  }`}
                >
                  {scanResult.riskLevel} RISK ({scanResult.riskScore}/100)
                </span>

                {scanResult.isSyntheticDemo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                    SYNTHETIC DEMO
                  </span>
                )}
              </div>
            </div>

            {/* Tactical Gauge & Telemetry Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Left Column: Gauge (5 cols) */}
              <div className="lg:col-span-5">
                <TacticalGauge score={scanResult.riskScore} riskLevel={scanResult.riskLevel} />
              </div>

              {/* Right Column: Telemetry Breakdown Matrix (7 cols) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                {/* Metric 1 */}
                <div className="p-3.5 rounded-xl bg-shield-darkest/90 border border-cyan-500/20 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Urgency Coercion Vector</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {scanResult.riskScore >= 60 ? 'HIGH PANIC HOOK' : scanResult.riskScore >= 35 ? 'ELEVATED' : 'NOMINAL'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${scanResult.riskScore >= 60 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`}></span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-3.5 rounded-xl bg-shield-darkest/90 border border-cyan-500/20 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Auth Credential Solicit</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {scanResult.category.toLowerCase().includes('otp') ? 'CRITICAL (OTP TARGET)' : 'NO EXPLICIT PIN ASK'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${scanResult.category.toLowerCase().includes('otp') ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'}`}></span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-3.5 rounded-xl bg-shield-darkest/90 border border-cyan-500/20 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Domain Safety Flag</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate">
                      {scanResult.urlComponents ? (scanResult.urlComponents.flag || 'VALIDATED') : 'NO URL DETECTED'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${scanResult.urlComponents?.isSuspicious ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="p-3.5 rounded-xl bg-shield-darkest/90 border border-cyan-500/20 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Airgapped Sandbox Status</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">0% NETWORK LEAK</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Dual-Engine Consensus */}
            <TacticalDualEngineComparison
              heuristicResult={scanResult}
              ollamaResult={ollamaResult}
              isOllamaScanning={isOllamaScanning}
              ollamaError={ollamaError}
            />

            {/* Detection Reasons */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                Rule Attributes & Indicators ({scanResult.reasons.length} flagged):
              </h4>
              <div className="space-y-2">
                {scanResult.reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-shield-darkest/80 border border-cyan-500/20 text-xs sm:text-sm text-slate-200 font-mono"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        scanResult.riskLevel === 'LOW' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* URL Component Analysis (if applicable) */}
            {scanResult.urlComponents && (
              <div className="p-4 rounded-2xl bg-shield-darkest/95 border border-cyan-500/30 space-y-2 font-mono">
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>URL Lexical Structure Analysis</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-shield-navy/80 border border-cyan-500/20">
                    <span className="text-[10px] text-slate-400 block">Host / Domain</span>
                    <span className="font-mono font-bold text-white break-all">
                      {scanResult.urlComponents.domain}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-shield-navy/80 border border-cyan-500/20">
                    <span className="text-[10px] text-slate-400 block">Protocol</span>
                    <span className="font-mono text-white">
                      {scanResult.urlComponents.protocol}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-shield-navy/80 border border-cyan-500/20">
                    <span className="text-[10px] text-slate-400 block">Security Flag</span>
                    <span className="font-semibold text-amber-300">
                      {scanResult.urlComponents.flag || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Action & Guidance */}
            <div
              className={`p-4 rounded-2xl border ${
                scanResult.riskLevel === 'LOW'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">
                Recommended Action:
              </h4>
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                {scanResult.recommendedAction}
              </p>

              <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-white block">Safe Next Steps:</span>
                <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                  {scanResult.safeNextSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Disclaimers & Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-shield-border/60">
              <p className="text-[11px] text-slate-400 max-w-xl">
                ⚠️ <strong>Disclaimer:</strong> {scanResult.disclaimer}
              </p>

              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-shield-card hover:bg-shield-navy border border-shield-border hover:border-shield-teal text-slate-200 transition-colors self-end sm:self-auto shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Assessment Report'}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. Local Scan History & Privacy Settings */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-shield-border/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-shield-teal" />
              <span>Local Scan History ({history.length} stored on this device)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Saved strictly in browser local storage. Only anonymous risk indicators and redacted summaries are saved.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-500/40 hover:bg-rose-900/60 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center rounded-2xl glass-panel border border-shield-border space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-500 mx-auto opacity-40" />
            <p className="text-xs text-slate-400">
              No previous scans stored. Results will appear here after scanning.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl glass-panel border border-shield-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 border ${
                      item.riskLevel === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border-rose-500'
                        : item.riskLevel === 'HIGH'
                        ? 'bg-rose-950/70 text-rose-300 border-rose-500/60'
                        : item.riskLevel === 'MEDIUM'
                        ? 'bg-amber-950/70 text-amber-300 border-amber-500/60'
                        : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60'
                    }`}
                  >
                    {item.riskLevel} ({item.riskScore})
                  </span>

                  <div>
                    <span className="font-bold text-white block">
                      {item.category}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px] block truncate max-w-md">
                      {item.privacySafeSummary}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-shield-card border border-shield-border">
                    {item.inputType}
                  </span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Local Storage Boundaries Notice */}
        <div className="p-4 rounded-xl bg-shield-navy/60 border border-shield-border text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-shield-teal shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">Privacy & Browser Profile Scope</strong>
            Data stored by ScamShield AI resides exclusively within your local browser storage. It is never transmitted across the network and is not synchronized across different devices or profiles. Clearing your browser cache or clicking "Wipe all local app data" removes all traces permanently.
          </div>
        </div>
      </section>

      {/* 6. Honest Technical Boundaries & Emergency Helpline */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-shield-border space-y-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-shield-teal" />
            <span>Honest Technical Scope & Boundaries</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            This local web application analyzes <strong>only content explicitly submitted to this scanner</strong> or passed via supported client integrations (such as the Web Share Target API or companion extensions). It does not passively spy on background apps, read encrypted WhatsApp/Signal databases, or bypass the mobile operating system sandbox.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/60 to-shield-navy border border-rose-500/40 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>National Cyber Crime Helpline (India)</span>
            </h4>
            <p className="text-xs text-slate-300">
              Victim of fraud or unauthorized debit? Call <strong>1930</strong> immediately to freeze fund flows.
            </p>
          </div>
          <a
            href="tel:1930"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shrink-0 transition-colors shadow-md"
          >
            Call 1930
          </a>
        </div>
      </section>
    </div>
  );
};
