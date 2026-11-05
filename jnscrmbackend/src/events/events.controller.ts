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
  async createEvent(@Body() body: CreateEventDto) {
    return this.eventsService.createEvent(body);
  }

  @Put()
  async updateEvent(@Body() body: UpdateEventDto) {
    return this.eventsService.updateEvent(body);
  }

  @Delete()
  async deleteEvent(@Query('id') id: string) {
    return this.eventsService.deleteEvent(Number(id));
  }
}
