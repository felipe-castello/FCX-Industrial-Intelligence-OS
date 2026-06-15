import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DecisionLogEntry } from './agent.types';

@Injectable()
export class DecisionLogService {
  private readonly entries: DecisionLogEntry[] = [];
  private readonly maxEntries = 500;

  record(entry: Omit<DecisionLogEntry, 'id' | 'timestamp'>) {
    const stored: DecisionLogEntry = {
      ...entry,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    this.entries.unshift(stored);
    this.entries.splice(this.maxEntries);
    return stored;
  }

  findAll(taskId?: string) {
    return taskId ? this.entries.filter((entry) => entry.taskId === taskId) : [...this.entries];
  }
}
