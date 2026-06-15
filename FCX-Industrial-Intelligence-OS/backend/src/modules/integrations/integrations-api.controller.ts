import { Body, Controller, Post } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';

@Controller('api/integrations')
export class IntegrationsApiController {
  constructor(private readonly service: IntegrationsService) {}

  @Post('sync')
  sync(@Body() payload: Record<string, unknown>) {
    return this.service.syncExternal(payload);
  }
}
