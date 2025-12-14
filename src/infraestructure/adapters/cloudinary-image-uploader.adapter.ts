import { v2 as cloudinary } from 'cloudinary';
import { UploadFileService } from '@/domain/interfaces';

export class CloudinaryImageUploaderAdapter implements UploadFileService {
  async uploadImage(
    filePath: string | Buffer
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error || !result) {
            return reject(error);
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );

      if (Buffer.isBuffer(filePath)) {
        uploadStream.end(filePath);
      } else {
        cloudinary.uploader.upload(filePath as string, (error, result) => {
          if (error || !result) {
            return reject(error);
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        });
      }
    });
  }
}
