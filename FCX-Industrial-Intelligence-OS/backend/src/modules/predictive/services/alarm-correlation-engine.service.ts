import { Injectable } from '@nestjs/common';

type AlarmLike = {
  severidade: string;
  status: string;
  timestamp: Date;
};

@Injectable()
export class AlarmCorrelationEngineService {
  correlate(alarms: AlarmLike[]) {
    const active = alarms.filter((alarm) => alarm.status === 'ACTIVE');
    const critical = active.filter((alarm) => alarm.severidade === 'CRITICAL');
    const warning = active.filter((alarm) => alarm.severidade === 'WARNING');
    const recent = active.filter((alarm) => Date.now() - alarm.timestamp.getTime() < 24 * 60 * 60 * 1000);

    return {
      active: active.length,
      critical: critical.length,
      warning: warning.length,
      recent: recent.length,
      correlationScore: Math.min(critical.length * 18 + warning.length * 8 + recent.length * 5, 100),
      pattern:
        critical.length >= 3
          ? 'critical-cluster'
          : recent.length >= 4
            ? 'recurring-recent-alarms'
            : active.length > 0
              ? 'isolated-active-alarms'
              : 'no-active-correlation',
    };
  }
}
