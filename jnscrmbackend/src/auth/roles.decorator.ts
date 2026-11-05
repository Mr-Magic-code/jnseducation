import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type AppRole = 'Super-Admin' | 'Manager';

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
