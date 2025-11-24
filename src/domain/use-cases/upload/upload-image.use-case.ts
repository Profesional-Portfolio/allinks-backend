import { UploadFileService } from '@/domain/interfaces';

export class UploadImageUseCase {
  constructor(private readonly uploadFileService: UploadFileService) {}

  async execute(file: Buffer | string) {
    const result = await this.uploadFileService.uploadImage(file);
    return result;
  }
}
