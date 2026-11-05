import { Type } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';

export class ManagerRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id!: number;

  @IsIn(['approve', 'reject'])
  action!: 'approve' | 'reject';
}
