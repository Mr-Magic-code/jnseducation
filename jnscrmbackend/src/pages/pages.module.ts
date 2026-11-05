import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller.js';
import { PagesService } from './pages.service.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}