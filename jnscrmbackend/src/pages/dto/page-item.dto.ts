import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PageItemDto {
  @IsString({ message: 'Page name must be a string.' })
  @IsNotEmpty({ message: 'Page name is required.' })
  @MaxLength(200, { message: 'Page name is too long.' })
  name!: string;

  @IsString({ message: 'Page path must be a string.' })
  @IsNotEmpty({ message: 'Page path is required.' })
  @MaxLength(500, { message: 'Page path is too long.' })
  path!: string;
}
