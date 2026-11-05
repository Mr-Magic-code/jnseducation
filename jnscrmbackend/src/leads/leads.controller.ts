import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LeadsService } from './leads.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get('form-types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super-Admin', 'Manager')
  getFormTypes() {
    return this.leadsService.getFormTypes();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super-Admin', 'Manager')
  findAll(
    @Query('formType') formType?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('dateFilter') dateFilter?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leadsService.findAll(
      formType,
      status,
      search,
      dateFilter,
      startDate,
      endDate,
      page ? Number(page) : 1,
      limit ? Number(limit) : 100,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super-Admin', 'Manager')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateLeadStatusDto,
  ) {
    return this.leadsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super-Admin', 'Manager')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.remove(id);
  }
}
