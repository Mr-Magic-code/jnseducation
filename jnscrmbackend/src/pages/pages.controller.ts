import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PagesService } from './pages.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { GetPagesQueryDto } from './dto/get-pages-query.dto.js';
import { PageItemDto } from './dto/page-item.dto.js';
import { PagesScanDto } from './dto/pages-scan.dto.js';

@Controller('admin/pages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super-Admin', 'Manager')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  async getPages(@Query() query: GetPagesQueryDto) {
    return this.pagesService.getPagesFromDb(query);
  }

  @Post('scan')
  @Roles('Super-Admin')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async scanGitHub(@Body() dto: PagesScanDto) {
    return this.pagesService.scanGitHubPages(
      dto.mode ?? 'preview',
      dto.removeMissing ?? false,
      dto.confirmDestructive ?? false,
    );
  }

  @Post('save')
  @Roles('Super-Admin')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async savePages(
    @Body(new ParseArrayPipe({ items: PageItemDto, whitelist: true }))
    pages: PageItemDto[],
  ) {
    return this.pagesService.savePagesToDb(pages);
  }
}
