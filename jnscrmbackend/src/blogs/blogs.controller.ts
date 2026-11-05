import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BlogsService } from './blogs.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { BlogQueryDto } from './dto/blog-query.dto.js';
import { CreateBlogDto } from './dto/create-blog.dto.js';
import { UpdateBlogDto } from './dto/update-blog.dto.js';
import { UpdateBlogStatusDto } from './dto/update-blog-status.dto.js';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto.js';

@Controller('admin/blogs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super-Admin', 'Manager')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get('categories')
  async getCategories() {
    return this.blogsService.getAllCategories();
  }

  @Post('categories')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createCategory(@Body() body: CreateCategoryDto) {
    return this.blogsService.createCategory(body.name, body.slug);
  }

  @Put('categories/:id')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.blogsService.updateCategory(Number(id), body.name, body.slug);
  }

  @Delete('categories/:id')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async deleteCategory(@Param('id') id: string) {
    return this.blogsService.deleteCategory(Number(id));
  }

  @Get()
  async getBlogs(@Query() query: BlogQueryDto) {
    return this.blogsService.getAllBlogs(
      query.page ?? 1,
      query.limit ?? 10,
      query.search || '',
      query.status || '',
    );
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createBlog(@Body() body: CreateBlogDto, @Req() req: Request & { user: { id: number; full_name: string; role: string } }) {
    return this.blogsService.createBlog(body, req.user);
  }

  @Put(':id')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogDto, @Req() req: Request & { user: { id: number; full_name: string; role: string } }) {
    return this.blogsService.updateBlog(Number(id), body, req.user);
  }

  @Patch(':id/status')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateBlogStatus(
    @Param('id') id: string,
    @Body() body: UpdateBlogStatusDto,
  ) {
    return this.blogsService.updateBlogStatus(Number(id), body.status);
  }

  @Delete(':id')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async deleteBlog(@Param('id') id: string) {
    return this.blogsService.deleteBlog(Number(id));
  }
}
