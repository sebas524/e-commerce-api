import { Request } from 'express';
import { v4 as uuid } from 'uuid';

export const renameFile = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: Function,
) => {
  if (!file) {
    return cb(
      new Error('No file has been uploaded.'),
      // * False indicates that file is not accepted:
      false,
    );
  }

  const fileExtension = file.mimetype.split('/')[1];
  const fileName = `${uuid()}.${fileExtension}`;

  cb(null, fileName);
};
