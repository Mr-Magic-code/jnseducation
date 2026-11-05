import { Module } from '@nestjs/common';
import { EventsController } from './events.controller.js';
import { EventsPublicController } from './events.public.controller.js';
import { EventsService } from './events.service.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [EventsController, EventsPublicController],
  providers: [EventsService],
})
export class EventsModule {}
