import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { filterFile } from './helpers/filter.helper';
import { diskStorage } from 'multer';
import { renameFile } from './helpers/rename.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findOne(@Res() res: Response, @Param('imageName') imageName: string) {
    const path = this.filesService.getImage(imageName);

    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('myFile', {
      fileFilter: filterFile,
      // * where to save files uploades?:
      storage: diskStorage({
        destination: './images/uploads/products',
        // * apply rename helper:
        filename: renameFile,
      }),
    }),
  )
  uploadImage(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    console.log({
      fileInController: file,
    });

    if (!file) {
      throw new BadRequestException('File has to be an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${
      file.filename
    }`;

    return { secureUrl: secureUrl };
  }
}
