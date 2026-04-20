import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { ResponseFormatter } from '@/infraestructure/utils';

const storage = multer.memoryStorage();
const middleware = multer({
  fileFilter: (req, file, callback) => {
    if (!/\.(jpg|jpeg|png|gif)$/.exec(file.originalname)) {
      callback(new Error('Please upload a valid image'));
      return;
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  storage,
});

const uploadMiddleware = middleware.single('image');

export const upload = (req: Request, res: Response, next: NextFunction) => {
  uploadMiddleware(req, res, err => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return res.status(400).json(
        ResponseFormatter.error({
          message,
          statusCode: 400,
        })
      );
    }
    next();
  });
};
