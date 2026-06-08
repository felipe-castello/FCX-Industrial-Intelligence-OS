import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../database/prisma.service';

type DependencyStatus = 'connected' | 'disconnected';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    return {
      status: database === 'connected' && redis === 'connected' ? 'ok' : 'degraded',
      version: '6.0',
      database,
      redis,
    };
  }

  private async checkDatabase(): Promise<DependencyStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'connected';
    } catch {
      return 'disconnected';
    }
  }

  private async checkRedis(): Promise<DependencyStatus> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redis = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
    });

    try {
      await redis.connect();
      await redis.ping();
      return 'connected';
    } catch {
      return 'disconnected';
    } finally {
      redis.disconnect();
    }
  }
}
