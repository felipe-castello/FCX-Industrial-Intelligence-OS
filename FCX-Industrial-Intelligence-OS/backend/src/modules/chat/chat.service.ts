import { Injectable } from '@nestjs/common';
import { FEATURE_FLAGS, isFeatureEnabled, safeModuleFallback } from '../feature-flags';

@Injectable()
export class ChatService {
  createSession(payload: Record<string, unknown>) {
    if (!isFeatureEnabled(FEATURE_FLAGS.libreChat)) {
      return {
        ...safeModuleFallback('librechat', 'ENABLE_LIBRECHAT=false'),
        session: {
          status: 'disabled',
          route: 'apps/fcx-agent-console',
          message: 'LibreChat e opcional e nao substitui o dashboard principal.',
        },
      };
    }

    try {
      return {
        module: 'librechat',
        status: 'ready',
        session: {
          id: `fcx-chat-${Date.now()}`,
          user: payload?.user || 'fcx-user',
          route: 'apps/fcx-agent-console',
          mode: 'agent-console',
        },
      };
    } catch (error) {
      return safeModuleFallback('librechat', error instanceof Error ? error.message : 'unknown error');
    }
  }
}
