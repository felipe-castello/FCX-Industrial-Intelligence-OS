export type QuantDecision = 'BUY' | 'SELL' | 'HOLD' | 'REVIEW' | 'BLOCK';

export interface QuantAnalyzeRequest {
  symbol: string;
  market?: string;
  timeframe?: string;
  mode?: string;
  mockSignals?: {
    riskScore?: number;
    confidence?: number;
    edge?: number;
  };
}

export interface QuantAnalyzeResponse {
  decision: QuantDecision;
  confidence: number;
  riskScore: number;
  summary: string;
  agents: string[];
  warnings: string[];
}
