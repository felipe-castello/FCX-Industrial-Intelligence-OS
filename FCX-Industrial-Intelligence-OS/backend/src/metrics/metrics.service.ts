import { Injectable } from '@nestjs/common';

type RequestKey = `${string} ${string} ${number}`;

@Injectable()
export class MetricsService {
  private readonly startedAt = Date.now();
  private readonly httpRequests = new Map<RequestKey, number>();
  private readonly httpDurations = new Map<string, { count: number; sum: number }>();

  recordHttpRequest(method: string, route: string, statusCode: number, durationSeconds: number) {
    const normalizedRoute = this.normalizeRoute(route);
    const requestKey: RequestKey = `${method} ${normalizedRoute} ${statusCode}`;
    const durationKey = `${method} ${normalizedRoute}`;
    const duration = this.httpDurations.get(durationKey) || { count: 0, sum: 0 };

    this.httpRequests.set(requestKey, (this.httpRequests.get(requestKey) || 0) + 1);
    this.httpDurations.set(durationKey, {
      count: duration.count + 1,
      sum: duration.sum + durationSeconds,
    });
  }

  render() {
    const memory = process.memoryUsage();
    const uptime = Math.floor((Date.now() - this.startedAt) / 1000);
    const lines = [
      '# HELP fcx_api_up API process availability.',
      '# TYPE fcx_api_up gauge',
      'fcx_api_up 1',
      '# HELP fcx_api_uptime_seconds API process uptime in seconds.',
      '# TYPE fcx_api_uptime_seconds gauge',
      `fcx_api_uptime_seconds ${uptime}`,
      '# HELP fcx_api_memory_rss_bytes Resident memory used by the API process.',
      '# TYPE fcx_api_memory_rss_bytes gauge',
      `fcx_api_memory_rss_bytes ${memory.rss}`,
      '# HELP fcx_api_memory_heap_used_bytes Heap memory used by the API process.',
      '# TYPE fcx_api_memory_heap_used_bytes gauge',
      `fcx_api_memory_heap_used_bytes ${memory.heapUsed}`,
      '# HELP fcx_api_http_requests_total Total HTTP requests handled by the API.',
      '# TYPE fcx_api_http_requests_total counter',
    ];

    for (const [key, count] of this.httpRequests.entries()) {
      const [method, route, status] = key.split(' ');
      lines.push(`fcx_api_http_requests_total{method="${method}",route="${route}",status="${status}"} ${count}`);
    }

    lines.push(
      '# HELP fcx_api_http_request_duration_seconds_sum Sum of HTTP request durations.',
      '# TYPE fcx_api_http_request_duration_seconds_sum counter',
    );

    for (const [key, duration] of this.httpDurations.entries()) {
      const [method, route] = key.split(' ');
      lines.push(`fcx_api_http_request_duration_seconds_sum{method="${method}",route="${route}"} ${duration.sum.toFixed(6)}`);
      lines.push(`fcx_api_http_request_duration_seconds_count{method="${method}",route="${route}"} ${duration.count}`);
    }

    return `${lines.join('\n')}\n`;
  }

  private normalizeRoute(route: string) {
    return (route || '/')
      .split('?')[0]
      .replace(/[0-9a-fA-F-]{24,36}/g, ':id')
      .replace(/\d+/g, ':number');
  }
}
