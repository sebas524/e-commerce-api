import { SetMetadata } from '@nestjs/common';
import { PermittedRoles } from '../interfaces/permitted-roles.enum';

export const META_ROLES = 'roles';
export const ProtectedRole = (...args: PermittedRoles[]) => {
  return SetMetadata(META_ROLES, args);
};
