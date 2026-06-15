import { Injectable } from '@nestjs/common';
import { FEATURE_FLAGS, isFeatureEnabled, safeModuleFallback } from '../feature-flags';

@Injectable()
export class KnowledgeService {
  ingest(payload: Record<string, unknown>) {
    if (!isFeatureEnabled(FEATURE_FLAGS.understandAnything)) {
      return {
        ...safeModuleFallback('understand-anything', 'ENABLE_UNDERSTAND_ANYTHING=false'),
        ingestion: {
          status: 'accepted-for-manual-pipeline',
          source: payload?.source || 'unknown',
          supportedTypes: ['pdf', 'manual', 'technical-report', 'contract', 'pmoc', 'nbr', 'nr10'],
        },
      };
    }

    try {
      return {
        module: 'understand-anything',
        status: 'ready',
        ingestion: {
          status: 'queued',
          source: payload?.source || 'unknown',
          pipeline: ['document-understanding', 'chunking', 'metadata', 'rag-index'],
        },
      };
    } catch (error) {
      return safeModuleFallback('understand-anything', error instanceof Error ? error.message : 'unknown error');
    }
  }
}
