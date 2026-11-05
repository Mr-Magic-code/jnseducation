import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';

const normalizeStatus = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export class UpdateLeadStatusDto {
  @Transform(normalizeStatus)
  @IsIn(['Unread', 'Read', 'Trashed'])
  status!: 'Unread' | 'Read' | 'Trashed';
}
