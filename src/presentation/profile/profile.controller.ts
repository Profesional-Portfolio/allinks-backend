import { Request, Response } from 'express';
import {
  DeleteUserAvatarUseCase,
  GetProfileUseCase,
  UpdateProfileUseCase,
  UpdateUserAvatarUseCase,
  UploadImageUseCase,
  updateProfileUserDto,
} from '@/domain/index';
import { ResponseFormatter } from '@/infraestructure/utils';
import { StatusCode } from '@/domain/enums';
import { validate } from '../middlewares';

export class ProfileController {
  constructor(
    private readonly getUserProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly updateUserAvatarUseCase: UpdateUserAvatarUseCase,
    private readonly deleteUserAvatarUseCase: DeleteUserAvatarUseCase,
    private readonly uploadImageUseCase: UploadImageUseCase
  ) {}

  getUserProfile = async (req: Request, res: Response) => {
    const id = req.user?.id as string;
    const [error, user] = await this.getUserProfileUseCase.execute(id);
    if (error) {
      return res.status(error.statusCode).json(ResponseFormatter.error(error));
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: user,
        message: 'User profile retrieved successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  updateProfile = async (req: Request, res: Response) => {
    const id = req.user?.id as string;
    const data = validate(updateProfileUserDto, req.body);
    const [error, user] = await this.updateProfileUseCase.execute(id, data);
    if (error) {
      return res.status(error.statusCode).json(ResponseFormatter.error(error));
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: user,
        message: 'User profile updated successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  updateAvatar = async (req: Request, res: Response) => {
    const id = req.user?.id as string;
    if (!req.file) {
      return res.status(StatusCode.BAD_REQUEST).json(
        ResponseFormatter.error({
          statusCode: StatusCode.BAD_REQUEST,
          message: 'No file uploaded',
        })
      );
    }

    const { url } = await this.uploadImageUseCase.execute(req.file.buffer);

    if (!url) {
      return res.status(StatusCode.BAD_REQUEST).json(
        ResponseFormatter.error({
          statusCode: StatusCode.BAD_REQUEST,
          message: 'No file uploaded',
        })
      );
    }

    const [error, user] = await this.updateUserAvatarUseCase.execute(id, url);

    if (error) {
      return res.status(error.statusCode).json(ResponseFormatter.error(error));
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: user,
        message: 'User avatar updated successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  deleteAvatar = async (req: Request, res: Response) => {
    const id = req.user?.id as string;
    const [error] = await this.deleteUserAvatarUseCase.execute(id);
    if (error) {
      return res.status(error.statusCode).json(ResponseFormatter.error(error));
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: null,
        message: 'User avatar deleted successfully',
        statusCode: StatusCode.OK,
      })
    );
  };
}
