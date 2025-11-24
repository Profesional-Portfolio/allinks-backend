export interface UploadFileService {
  uploadImage(
    filePath: string | Buffer
  ): Promise<{ url: string; publicId: string }>;
}
