import { Body, Controller, Post } from '@nestjs/common';
import { QuantService } from './quant.service';
import { QuantAnalyzeRequest, QuantAnalyzeResponse } from './quant.types';

@Controller('api/quant')
export class QuantController {
  constructor(private readonly quantService: QuantService) {}

  @Post('analyze')
  analyze(@Body() payload: QuantAnalyzeRequest): QuantAnalyzeResponse {
    return this.quantService.analyze(payload);
  }
}
