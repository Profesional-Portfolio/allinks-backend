import multer from 'multer';
import { ResponseFormatter } from '@/infraestructure/utils';
import { NextFunction, Request, Response } from 'express';

const storage = multer.memoryStorage();
const middleware = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Please upload a valid image'));
    }
    callback(null, true);
  },
});

const uploadMiddleware = middleware.single('image');

export const upload = (req: Request, res: Response, next: NextFunction) => {
  uploadMiddleware(req, res, err => {
    if (err) {
      return res.status(400).json(
        ResponseFormatter.error({
          message: err.message,
          statusCode: 400,
        })
      );
    }
    next();
  });
};
