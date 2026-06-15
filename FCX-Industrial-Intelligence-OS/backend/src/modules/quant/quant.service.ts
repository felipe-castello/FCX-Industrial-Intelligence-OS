import { BadRequestException, Injectable } from '@nestjs/common';
import {
  QuantAnalyzeRequest,
  QuantAnalyzeResponse,
  QuantDecision,
} from './quant.types';
import { FEATURE_FLAGS, isFeatureEnabled } from '../feature-flags';

const REQUIRED_PROVIDER_KEYS = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_API_KEY',
];

const QUANT_AGENTS = [
  'Market Scanner',
  'Technical Analyst',
  'Sentiment Analyst',
  'News Analyst',
  'Risk Manager',
  'Portfolio Manager',
  'Decision Logger',
];

@Injectable()
export class QuantService {
  analyze(input: QuantAnalyzeRequest): QuantAnalyzeResponse {
    const request = this.normalizeInput(input);

    this.assertProviderKey();
    this.assertResearchOnlyMode(request.mode);

    const warnings = this.generateWarnings();
    const riskScore = this.generateRiskScore(request);
    const confidence = this.generateConfidence(request);
    const preliminaryDecision = this.generatePortfolioDecision(request, confidence);
    const decision = this.applyRiskManagerDecisionRules(
      preliminaryDecision,
      riskScore,
      confidence,
    );

    if (riskScore > 70) {
      warnings.push('Operacao bloqueada pelo Risk Manager: risco acima de 70.');
    }

    if (confidence < 60 && riskScore <= 70) {
      warnings.push('Decisao enviada para revisao: confianca abaixo de 60.');
    }

    return {
      decision,
      confidence,
      riskScore,
      summary: this.buildSummary(request, decision, confidence, riskScore),
      agents: QUANT_AGENTS,
      warnings,
    };
  }

  private normalizeInput(input: QuantAnalyzeRequest): Required<QuantAnalyzeRequest> {
    const symbol = input?.symbol?.trim().toUpperCase();

    if (!symbol) {
      throw new BadRequestException('symbol is required.');
    }

    return {
      symbol,
      market: input.market || 'stocks',
      timeframe: input.timeframe || '1d',
      mode: input.mode || process.env.TRADING_AGENTS_MODE || 'research',
      mockSignals: input.mockSignals || {},
    };
  }

  private assertProviderKey(): void {
    const hasProviderKey = REQUIRED_PROVIDER_KEYS.some((key) =>
      Boolean(process.env[key]),
    );

    if (!hasProviderKey) {
      throw new BadRequestException(
        'Missing LLM provider API key. Configure OPENAI_API_KEY, ANTHROPIC_API_KEY or GOOGLE_API_KEY.',
      );
    }
  }

  private assertResearchOnlyMode(mode: string): void {
    const allowedModes = ['research', 'simulation', 'dashboard'];

    if (!allowedModes.includes(mode)) {
      throw new BadRequestException(
        'Quant module supports only research, simulation and dashboard modes.',
      );
    }
  }

  private generateWarnings(): string[] {
    const warnings: string[] = [
      'Modo inicial sem execucao de ordens reais.',
      'Saida para pesquisa e simulacao; nao e recomendacao financeira direta.',
    ];

    if (!isFeatureEnabled(FEATURE_FLAGS.quantDinger)) {
      console.error('[FCX_MODULE_FALLBACK] quantdinger: ENABLE_QUANTDINGER=false');
      warnings.push('QuantDinger externo desabilitado por feature flag; usando decisao segura interna.');
    }

    if (!process.env.FINNHUB_API_KEY) {
      warnings.push('FINNHUB_API_KEY ausente; sinais de mercado devem ser simulados.');
    }

    if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
      warnings.push('Credenciais Reddit ausentes; sentimento social limitado.');
    }

    return warnings;
  }

  private generateRiskScore(input: Required<QuantAnalyzeRequest>): number {
    const suppliedRisk = input.mockSignals?.riskScore;

    if (typeof suppliedRisk === 'number') {
      return this.clamp(suppliedRisk, 0, 100);
    }

    return process.env.FCX_RISK_MODE === 'conservative' ? 45 : 35;
  }

  private generateConfidence(input: Required<QuantAnalyzeRequest>): number {
    const suppliedConfidence = input.mockSignals?.confidence;

    if (typeof suppliedConfidence === 'number') {
      return this.clamp(suppliedConfidence, 0, 100);
    }

    return 65;
  }

  private generatePortfolioDecision(
    input: Required<QuantAnalyzeRequest>,
    confidence: number,
  ): QuantDecision {
    const edge = input.mockSignals?.edge || 0;

    if (confidence < 60) {
      return 'REVIEW';
    }

    if (edge > 0.08 && confidence >= 70) {
      return 'BUY';
    }

    if (edge < -0.08 && confidence >= 70) {
      return 'SELL';
    }

    return 'HOLD';
  }

  private applyRiskManagerDecisionRules(
    decision: QuantDecision,
    riskScore: number,
    confidence: number,
  ): QuantDecision {
    if (riskScore > 70) {
      return 'BLOCK';
    }

    if (confidence < 60) {
      return 'REVIEW';
    }

    return decision;
  }

  private buildSummary(
    input: Required<QuantAnalyzeRequest>,
    decision: QuantDecision,
    confidence: number,
    riskScore: number,
  ): string {
    return `FCX Quant Intelligence analisou ${input.symbol} em ${input.market}/${input.timeframe}. Decisao ${decision}, confianca ${confidence}, risco ${riskScore}.`;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.round(value)));
  }
}
