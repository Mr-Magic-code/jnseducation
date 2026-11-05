import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto.js';

interface EventRow {
  id: number;
  event_name: string;
  day_and_date?: string;
  day_date?: string;
  event_time: string;
  venue: string;
  cover_image: string | null;
  target_page: string;
  event_status?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

interface WriteResult {
  affectedRows: number;
  insertId: number;
}

@Injectable()
export class EventsService {
  constructor(private readonly dbService: DatabaseService) {}

  async getEvents(status?: string) {
    try {
      let sql = 'SELECT * FROM events';
      const params: unknown[] = [];

      if (status) {
        sql += ' WHERE event_status = ?';
        params.push(status);
      }

      sql += ' ORDER BY id DESC';

      const rows = await this.dbService.query<EventRow[]>(sql, params);

      const formattedEvents = (Array.isArray(rows) ? rows : []).map((ev) => ({
        id: ev.id,
        event_name: ev.event_name,
        day_date: ev.day_and_date || ev.day_date,
        event_time: ev.event_time,
        venue: ev.venue,
        cover_image: ev.cover_image,
        target_page: ev.target_page,
        status: ev.event_status || ev.status,
        created_at: ev.created_at,
        updated_at: ev.updated_at,
      }));

      return {
        success: true,
        events: formattedEvents,
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new InternalServerErrorException('Failed to fetch events.');
    }
  }

  async createEvent(body: CreateEventDto) {
    try {
      const {
        event_name,
        day_date,
        event_time,
        venue,
        cover_image,
        target_page,
        status,
      } = body;

      const result = await this.dbService.query<WriteResult>(
        `INSERT INTO events (event_name, day_and_date, event_time, venue, cover_image, target_page, event_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          event_name,
          day_date,
          event_time,
          venue,
          cover_image || null,
          target_page,
          status,
        ],
      );

      return {
        success: true,
        message: 'Event created successfully!',
        id: result.insertId,
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw new InternalServerErrorException('Failed to create event.');
    }
  }

  async updateEvent(body: UpdateEventDto) {
    try {
      const {
        id,
        event_name,
        day_date,
        event_time,
        venue,
        cover_image,
        target_page,
        status,
      } = body;

      const result = await this.dbService.query<WriteResult>(
        `UPDATE events
         SET event_name = ?, day_and_date = ?, event_time = ?, venue = ?, cover_image = ?, target_page = ?, event_status = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          event_name,
          day_date,
          event_time,
          venue,
          cover_image || null,
          target_page,
          status,
          id,
        ],
      );

      if (result.affectedRows === 0) {
        throw new NotFoundException('Event not found.');
      }

      return {
        success: true,
        message: 'Event updated successfully!',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating event:', error);
      throw new InternalServerErrorException('Failed to update event.');
    }
  }

  async deleteEvent(id: number) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        throw new NotFoundException('A valid event ID is required.');
      }

      const result = await this.dbService.query<WriteResult>(
        'DELETE FROM events WHERE id = ?',
        [id],
      );

      if (result.affectedRows === 0) {
        throw new NotFoundException('Event not found.');
      }

      return {
        success: true,
        message: 'Event deleted successfully!',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting event:', error);
      throw new InternalServerErrorException('Failed to delete event.');
    }
  }
}
