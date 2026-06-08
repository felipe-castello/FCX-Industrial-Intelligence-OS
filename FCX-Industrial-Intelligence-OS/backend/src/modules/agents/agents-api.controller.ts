import { Body, Controller, Post } from '@nestjs/common';
import { AgentsService } from './agents.service';

@Controller('api/agents')
export class AgentsApiController {
  constructor(private readonly service: AgentsService) {}

  @Post('run-skill')
  runSkill(@Body() payload: Record<string, unknown>) {
    return this.service.runSkill(payload);
  }
}
