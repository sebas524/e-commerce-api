import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators/protected-role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    // * reflector allows you to see info from decorators and other metadata.
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const permittedRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!permittedRoles) {
      return true;
    }
    if (permittedRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
    if (!user) {
      throw new BadRequestException('User has not been found.');
    }
    console.log({ userRoles: user.roles });

    for (const role of user.roles) {
      if (permittedRoles.includes(role)) {
        return true;
      }
    }
    throw new ForbiddenException(
      `User ${user.name} does not have the proper authorization (${permittedRoles})`,
    );
  }
}
