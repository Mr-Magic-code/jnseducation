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

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  category_id?: number | null;

  @IsOptional()
  @IsString()
  cover_image?: string | null;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsIn(['published', 'draft', 'trashed'])
  status?: 'published' | 'draft' | 'trashed';

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  author_name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  author_role!: string;
}
