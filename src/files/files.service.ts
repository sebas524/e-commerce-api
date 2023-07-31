import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  getImage(imageName: string) {
    // * physical path where image is located
    const path = join(__dirname, '../../images/uploads/products', imageName);
    if (!existsSync(path)) {
      throw new BadRequestException(
        `No product has been found with name: ${imageName}`,
      );
    }
    return path;
  }
}
