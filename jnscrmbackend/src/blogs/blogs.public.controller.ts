import { Controller, Get, Param, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BlogsService } from './blogs.service.js';

/**
 * Public, read-only blog endpoints. Only published content is ever exposed.
 */
@Controller('blogs/public')
export class BlogsPublicController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  getPublishedBlogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blogsService.getPublishedBlogs(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(':slug')
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  getPublishedBlog(@Param('slug') slug: string) {
    return this.blogsService.getPublishedBlogBySlug(slug);
  }
}
