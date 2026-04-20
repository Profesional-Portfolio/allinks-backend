import { v2 as cloudinary } from 'cloudinary';

import { UploadFileService } from '@/domain/interfaces';

export class CloudinaryImageUploaderAdapter implements UploadFileService {
  async uploadImage(
    filePath: Buffer | string
  ): Promise<{ publicId: string; url: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error || !result) {
            reject(new Error('Error al subir la imagen'));
          }
          resolve({
            publicId: result?.public_id ?? '',
            url: result?.secure_url ?? '',
          });
        }
      );

      if (Buffer.isBuffer(filePath)) {
        uploadStream.end(filePath);
      } else {
        void cloudinary.uploader.upload(filePath, (error, result) => {
          if (error || !result) {
            reject(new Error('Error al subir la imagen'));
          }
          resolve({
            publicId: result?.public_id ?? '',
            url: result?.secure_url ?? '',
          });
        });
      }
    });
  }
}
