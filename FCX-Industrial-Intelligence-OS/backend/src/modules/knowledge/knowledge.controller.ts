import { Body, Controller, Post } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('api/knowledge')
export class KnowledgeController {
  constructor(private readonly service: KnowledgeService) {}

  @Post('ingest')
  ingest(@Body() payload: Record<string, unknown>) {
    return this.service.ingest(payload);
  }
}
