import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Post('session')
  createSession(@Body() payload: Record<string, unknown>) {
    return this.service.createSession(payload);
  }
}
