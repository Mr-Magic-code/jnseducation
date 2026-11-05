import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  event_name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  day_date!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  event_time!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  venue!: string;

  @IsOptional()
  @IsString()
  cover_image?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  target_page!: string;

  @IsIn(['Live', 'Coming Soon', 'Past Event'])
  status!: 'Live' | 'Coming Soon' | 'Past Event';
}

export class UpdateEventDto extends CreateEventDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id!: number;
}
