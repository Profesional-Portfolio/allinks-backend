export interface UploadFileService {
  uploadImage(
    filePath: Buffer | string
  ): Promise<{ publicId: string; url: string }>;
}
