import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class PagesScanDto {
  @IsOptional()
  @IsIn(['preview', 'sync'], { message: 'Mode must be preview or sync.' })
  mode?: 'preview' | 'sync';

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean({ message: 'removeMissing must be a boolean.' })
  removeMissing?: boolean;

  // Destructive deletions require an explicit second confirmation.
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean({ message: 'confirmDestructive must be a boolean.' })
  confirmDestructive?: boolean;
}
