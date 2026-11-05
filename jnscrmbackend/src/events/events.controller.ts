import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { EventsService } from './events.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto.js';

@Controller('admin/events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super-Admin', 'Manager')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async getEvents() {
    return this.eventsService.getEvents();
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createEvent(@Body() body: CreateEventDto) {
    return this.eventsService.createEvent(body);
  }

  @Put()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateEvent(@Body() body: UpdateEventDto) {
    return this.eventsService.updateEvent(body);
  }

  @Delete()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async deleteEvent(@Query('id') id: string) {
    return this.eventsService.deleteEvent(Number(id));
  }
}
