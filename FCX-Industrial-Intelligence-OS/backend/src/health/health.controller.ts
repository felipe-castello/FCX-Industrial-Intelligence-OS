import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'FCX Industrial Intelligence OS API',
      timestamp: new Date().toISOString(),
    };
  }
}
