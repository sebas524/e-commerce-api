import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jtw-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class jwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      // * where do i want to place the token (ex:postman headers, or Auth bearer token?):
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  // * when i get a jwt that is valid in terms of expery date  and the signature with payload match, then we can receive the payload and validate it as i please:
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    const foundUser = await this.userRepository.findOneBy(
      { id },
      // * remember you dont need password because user is already identified(that's why he's receiving token)
    );

    if (!foundUser) {
      throw new UnauthorizedException('Invalid token...');
    }

    if (!foundUser.isActive) {
      throw new UnauthorizedException('Inactive user...');
    }

    console.log({ foundUser });

    return foundUser;
    // * this will be added to the request.
  }
}
