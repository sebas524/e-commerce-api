import { UseGuards, applyDecorators } from '@nestjs/common';
import { PermittedRoles } from '../interfaces/permitted-roles.enum';
import { ProtectedRole } from './protected-role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';

export function AuthDeco(...roles: PermittedRoles[]) {
  return applyDecorators(
    ProtectedRole(...roles),

    UseGuards(AuthGuard(), RolesGuard),
  );
}
