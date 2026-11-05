import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLeadDto {
  @IsString({ message: 'Form type must be a valid string' })
  @IsNotEmpty({ message: 'Form type is required' })
  @MaxLength(100, { message: 'Form type is too long' })
  form_type!: string;

  @IsObject({ message: 'Form data must be a valid object' })
  @IsNotEmpty({ message: 'Form data cannot be empty' })
  form_data!: Record<string, unknown>;

  @IsString({ message: 'Source URL must be a valid string' })
  @IsOptional()
  @MaxLength(2000, { message: 'Source URL is too long' })
  source_url?: string;
}
