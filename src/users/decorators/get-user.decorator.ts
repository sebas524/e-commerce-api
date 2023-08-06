import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const UserDeco = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException(
        'User has not been found in request.',
      );
    }

    return !data ? user : user[data];
  },
);
