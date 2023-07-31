import { Request } from 'express';

export const filterFile = (
  req: Express.Request,
  file: Express.Multer.File,
  //   * callback allows me to accept or deny file:
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
  const validExtensions = ['jpg', 'jpeg', 'gif', 'png'];
  if (validExtensions.includes(fileExtension)) {
    return cb(
      null,
      // * accepted:
      true,
    );
  } else {
    cb(
      null,
      // * denied:
      false,
    );
  }

  console.log({ file });
};
