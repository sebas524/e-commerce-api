import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  SetMetadata,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserDeco } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/rawHeaders.decorator';
import { IncomingHttpHeaders } from 'http';
import { RolesGuard } from './guards/roles.guard';
import { ProtectedRole } from './decorators/protected-role.decorator';
import { PermittedRoles } from './interfaces/permitted-roles.enum';
import { AuthDeco } from './decorators/authDeco.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

  // ! PRIVATE ROUTE
  @Get('private')
  @UseGuards(AuthGuard())
  privateRouteTest(
    @Req() request: Request,
    @Headers() headers: IncomingHttpHeaders,
    @UserDeco() user: User,
    @UserDeco('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'hello world private',
      user: user,
      userEmail: userEmail,
      rawHeaders: rawHeaders,
      normalHeaders: headers,
    };
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @ProtectedRole(PermittedRoles.superUser, PermittedRoles.admin)
  @UseGuards(AuthGuard(), RolesGuard)
  privateRouteTest2(@UserDeco() user: User) {
    return {
      ok: true,
      user: user,
    };
  }

  @Get('private3')
  @AuthDeco(PermittedRoles.admin)
  privateRouteTest3(@UserDeco() user: User) {
    return {
      ok: true,
      user: user,
    };
  }
}
