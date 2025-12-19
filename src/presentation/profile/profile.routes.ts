import {
  DeleteUserAvatarUseCase,
  GetProfileUseCase,
  UpdateProfileUseCase,
  UpdateUserAvatarUseCase,
  UploadImageUseCase,
} from '@/domain/index';
import { CloudinaryImageUploaderAdapter } from '@/infraestructure/adapters/cloudinary-image-uploader.adapter';
import { UsersDatasourceImpl } from '@/infraestructure/datasources/users.datasource.impl';
import { UsersRepositoryImpl } from '@/infraestructure/repositories';
import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { AuthMiddleware, upload } from '../middlewares';
import { JwtTokenProviderAdapter } from '@/infraestructure/adapters';

export class ProfileRoutes {
  static get routes(): Router {
    const router = Router();
    // adapters
    const tokenProvider = new JwtTokenProviderAdapter();
    const uploadFileService = new CloudinaryImageUploaderAdapter();
    // middleware
    const authMiddleware = new AuthMiddleware(tokenProvider);
    // datasources
    const datasource = new UsersDatasourceImpl();
    // repositories
    const usersRepository = new UsersRepositoryImpl(datasource);
    // use cases
    const getUserProfileUseCase = new GetProfileUseCase(usersRepository);
    const updateProfileUseCase = new UpdateProfileUseCase(usersRepository);
    const updateUserAvatarUseCase = new UpdateUserAvatarUseCase(
      usersRepository
    );
    const deleteUserAvatarUseCase = new DeleteUserAvatarUseCase(
      usersRepository
    );
    const uploadImageUseCase = new UploadImageUseCase(uploadFileService);

    const controller = new ProfileController(
      getUserProfileUseCase,
      updateProfileUseCase,
      updateUserAvatarUseCase,
      deleteUserAvatarUseCase,
      uploadImageUseCase
    );

    router.get('/me', authMiddleware.authenticate, controller.getUserProfile);
    router.patch('/me', authMiddleware.authenticate, controller.updateProfile);
    router.patch(
      '/avatar',
      [authMiddleware.authenticate, upload.single('avatar')],
      controller.updateAvatar
    );
    router.delete(
      '/avatar',
      authMiddleware.authenticate,
      controller.deleteAvatar
    );

    return router;
  }
}
