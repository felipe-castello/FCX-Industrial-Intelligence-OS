import { Module } from '@nestjs/common';
import { AgentsApiController } from './agents-api.controller';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';

@Module({ controllers: [AgentsController, AgentsApiController], providers: [AgentsService], exports: [AgentsService] })
export class AgentsModule {}
