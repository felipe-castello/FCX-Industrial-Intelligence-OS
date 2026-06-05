import { Injectable } from '@nestjs/common';

@Injectable()
export class AgentsService {
  findAll() {
    return { module: 'agents', status: 'ready', data: [] };
  }
}
