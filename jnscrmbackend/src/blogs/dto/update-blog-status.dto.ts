import { IsIn } from 'class-validator';

export class UpdateBlogStatusDto {
  @IsIn(['published', 'draft', 'trashed'])
  status!: 'published' | 'draft' | 'trashed';
}
