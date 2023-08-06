import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { AuthDeco } from '../users/decorators/authDeco.decorator';
import { PermittedRoles } from 'src/users/interfaces/permitted-roles.enum';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  // @AuthDeco(PermittedRoles.admin)
  executeSeed() {
    return this.seedService.executeSeed();
  }
}
