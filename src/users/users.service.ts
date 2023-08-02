import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jtw-payload.interface';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // ! error handler:
  private errorHandler(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException(
      'Error, check server logs for more info.',
    );
  }
  // ! ---

  private getJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...restOfUserData } = createUserDto;

      // * create:
      const newUser = this.userRepository.create({
        password: bcrypt.hashSync(password, 10),
        ...restOfUserData,
      });
      // * save:
      const savedUser = await this.userRepository.save(newUser);
      // * now, so we dont return a password:
      delete savedUser.password;
      return { ...savedUser, token: this.getJwt({ email: savedUser.email }) };
      // todo: JSON ACCESS WEB TOKEN
    } catch (error) {
      this.errorHandler(error);
    }
  }
  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const foundUser = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        // * so password appears:
        password: true,
      },
    });

    if (!foundUser) {
      throw new UnauthorizedException('User not found.');
    }

    // * check if passwords match:
    if (!bcrypt.compareSync(password, foundUser.password)) {
      throw new UnauthorizedException('Invalid password credential.');
    }

    return { ...foundUser, token: this.getJwt({ email: foundUser.email }) };
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
