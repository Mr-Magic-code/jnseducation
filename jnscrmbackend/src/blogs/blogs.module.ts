import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller.js';
import { BlogsPublicController } from './blogs.public.controller.js';
import { BlogsService } from './blogs.service.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [BlogsController, BlogsPublicController],
  providers: [BlogsService],
})
export class BlogsModule {}
