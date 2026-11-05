import { Controller, Get } from '@nestjs/common';
import { EventsService } from './events.service.js';

@Controller('events')
export class EventsPublicController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('public')
  async getPublicEvents() {
    return this.eventsService.getEvents('Live');
  }
}
