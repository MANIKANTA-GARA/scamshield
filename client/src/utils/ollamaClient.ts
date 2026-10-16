/**
 * ScamShield AI — Local Ollama Integration Client
 * Model Target: gemma4:e4b
 * 100% On-Device / Localhost | Zero Cloud API Calls | Full Privacy
 *
 * Communicates with the local Ollama instance running on http://localhost:11434
 * (proxied via Vite at /ollama) to provide deep LLM scam reasoning.
 */

export interface OllamaModelStatus {
  available: boolean;
  model: string;
  endpoint: string;
  error?: string;
  modelsFound?: string[];
  vramInfo?: string;
}

export interface OllamaScamAnalysis {
  isScam: boolean;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  verdict: 'Potential Scam' | 'Suspicious' | 'No strong scam indicators detected';
  category: string;
  reasons: string[];
  recommendedAction: string;
  explanation: {
    en: string;
    te?: string;
  };
  model: string;
  latencyMs: number;
}

const DEFAULT_MODEL = 'gemma4:e4b';
const OLLAMA_PROXY_BASE = '/ollama';
const OLLAMA_DIRECT_BASE = 'http://localhost:11434';

/**
 * Test connectivity to the local Ollama instance and confirm model availability.
 */
export async function checkOllamaConnection(targetModel = DEFAULT_MODEL): Promise<OllamaModelStatus> {
  const endpoints = [OLLAMA_PROXY_BASE, OLLAMA_DIRECT_BASE];

  for (const base of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${base}/api/tags`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const models: string[] = (data.models || []).map((m: any) => m.name || m.model || '');
        const hasTarget = models.some(m => m.toLowerCase().includes(targetModel.toLowerCase()));

        return {
          available: hasTarget || models.length > 0,
          model: hasTarget ? targetModel : (models[0] || targetModel),
          endpoint: base,
          modelsFound: models,
        };
      }
    } catch {
      // Continue to next endpoint
    }
  }

  return {
    available: false,
    model: targetModel,
    endpoint: OLLAMA_PROXY_BASE,
    error: `Ollama is unreachable on localhost:11434. Ensure Ollama is running with '${targetModel}'.`,
  };
}

/**
 * Execute deep scam analysis using local gemma4:e4b via Ollama.
 */
export async function analyzeWithOllama(
  content: string,
  targetModel = DEFAULT_MODEL,
  timeoutMs = 90000
): Promise<OllamaScamAnalysis> {
  const startTime = Date.now();
  const endpoints = [OLLAMA_PROXY_BASE, OLLAMA_DIRECT_BASE];

  const systemPrompt = `You are ScamShield AI, an advanced on-device cybersecurity assistant running locally.
Analyze the following user-submitted message, SMS, URL, or communication for fraud, financial phishing, identity theft, or impersonation scams.

Message to inspect:
"""
${content.slice(0, 3000)}
"""

Respond ONLY in valid, parseable JSON conforming to this schema (do NOT include markdown code blocks or extra text):
{
  "isScam": boolean,
  "riskScore": integer (0 to 100),
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "category": string (e.g. "Banking Phishing", "Job Scam", "Lottery/Prize Fraud", "Electricity/Bill Scam", "Government Impersonation", "Safe"),
  "reasons": [ "key red flag 1", "key red flag 2" ],
  "recommendedAction": "Immediate clear user advice",
  "explanationEn": "1-2 sentence concise security summary",
  "explanationTe": "ఒక సరళమైన తెలుగు వివరణ (1-2 వాక్యాలు)"
}`;

  let lastError: any = null;

  for (const base of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${base}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: targetModel,
          prompt: systemPrompt,
          stream: false,
          format: 'json',
          options: {
            num_ctx: 4096, // Keep context compact for RTX GPU VRAM stability
            temperature: 0.1,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const latencyMs = Date.now() - startTime;

      if (!data.response) {
        throw new Error('Ollama returned empty response');
      }

      // Parse JSON from response, stripping any residual markdown wrapper if present
      let cleaned = data.response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleaned);

      const riskScore = Math.min(100, Math.max(0, Number(parsed.riskScore) || (parsed.isScam ? 85 : 10)));
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (riskScore >= 80) riskLevel = 'CRITICAL';
      else if (riskScore >= 60) riskLevel = 'HIGH';
      else if (riskScore >= 35) riskLevel = 'MEDIUM';

      let verdict: 'Potential Scam' | 'Suspicious' | 'No strong scam indicators detected' = 'No strong scam indicators detected';
      if (riskScore >= 60) verdict = 'Potential Scam';
      else if (riskScore >= 35) verdict = 'Suspicious';

      return {
        isScam: Boolean(parsed.isScam ?? (riskScore >= 50)),
        riskScore,
        riskLevel,
        verdict,
        category: parsed.category || (parsed.isScam ? 'Suspicious Threat' : 'Legitimate / Safe'),
        reasons: Array.isArray(parsed.reasons) && parsed.reasons.length > 0
          ? parsed.reasons
          : ['Heuristic red flags identified by on-device Gemma4 intelligence.'],
        recommendedAction: parsed.recommendedAction || 'Do not click links or share confidential banking OTPs.',
        explanation: {
          en: parsed.explanationEn || parsed.explanation || 'Analyzed on-device by local Ollama Gemma4 neural model.',
          te: parsed.explanationTe || 'ఈ సందేశం స్థానిక ఆన్-డివైస్ AI ద్వారా విశ్లేషించబడింది.',
        },
        model: targetModel,
        latencyMs,
      };
    } catch (err: any) {
      lastError = err;
      // Try next endpoint if any
    }
  }

  throw lastError || new Error('Failed to communicate with Ollama');
}
