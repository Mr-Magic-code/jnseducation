import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class GetPagesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer.' })
  @Min(1, { message: 'Page must be at least 1.' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer.' })
  @Min(1, { message: 'Limit must be at least 1.' })
  limit?: number;

  @IsOptional()
  @IsString({ message: 'Search must be a string.' })
  @MaxLength(200, { message: 'Search query is too long.' })
  search?: string;

  @IsOptional()
  @IsIn(['events'], { message: 'Unsupported filter.' })
  filter?: 'events';
}
