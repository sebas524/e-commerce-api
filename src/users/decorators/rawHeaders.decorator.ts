import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const RawHeaders = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const rawHeaders = req.rawHeaders;

    return rawHeaders;
  },
);
