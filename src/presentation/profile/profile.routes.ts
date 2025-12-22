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

    /**
     * @swagger
     * components:
     *   schemas:
     *     ProfileResponse:
     *       allOf:
     *         - $ref: '#/components/schemas/BaseResponse'
     *         - type: object
     *           properties:
     *             data:
     *               $ref: '#/components/schemas/User'
     */

    /**
     * @swagger
     * /api/profile/me:
     *   get:
     *     summary: Get profile
     *     tags: [Profile]
     *     headers:
     *       Set-Cookie:
     *         description: >
     *           Sets the access and refresh tokens.
     *           Note: Multiple Set-Cookie headers are sent.
     *         schema:
     *           type: string
     *           example: "accessToken=...; Path=/; HttpOnly; Secure; SameSite=Lax, refreshToken=...; Path=/; HttpOnly; Secure; SameSite=Lax"
     *     responses:
     *       200:
     *         description: Profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ProfileResponse'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UnauthorizedResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InternalServerErrorResponse'
     */

    router.get('/me', authMiddleware.authenticate, controller.getUserProfile);

    /**
     * @swagger
     * /api/profile/me:
     *   patch:
     *     summary: Update profile
     *     tags: [Profile]
     *     headers:
     *       Set-Cookie:
     *         description: >
     *           Sets the access and refresh tokens.
     *           Note: Multiple Set-Cookie headers are sent.
     *         schema:
     *           type: string
     *           example: "accessToken=...; Path=/; HttpOnly; Secure; SameSite=Lax, refreshToken=...; Path=/; HttpOnly; Secure; SameSite=Lax"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateProfileRequest'
     *     responses:
     *       200:
     *         description: Profile updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ProfileResponse'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UnauthorizedResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InternalServerErrorResponse'
     */

    router.patch('/me', authMiddleware.authenticate, controller.updateProfile);

    /**
     * @swagger
     * /api/profile/avatar:
     *   patch:
     *     summary: Update avatar
     *     tags: [Profile]
     *     headers:
     *       Set-Cookie:
     *         description: >
     *           Sets the access and refresh tokens.
     *           Note: Multiple Set-Cookie headers are sent.
     *         schema:
     *           type: string
     *           example: "accessToken=...; Path=/; HttpOnly; Secure; SameSite=Lax, refreshToken=...; Path=/; HttpOnly; Secure; SameSite=Lax"
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             $ref: '#/components/schemas/UpdateAvatarRequest'
     *     responses:
     *       200:
     *         description: Avatar updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ProfileResponse'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UnauthorizedResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InternalServerErrorResponse'
     */

    router.patch(
      '/avatar',
      [authMiddleware.authenticate, upload],
      controller.updateAvatar
    );

    /**
     * @swagger
     * /api/profile/avatar:
     *   delete:
     *     summary: Delete avatar
     *     tags: [Profile]
     *     headers:
     *       Set-Cookie:
     *         description: >
     *           Sets the access and refresh tokens.
     *           Note: Multiple Set-Cookie headers are sent.
     *         schema:
     *           type: string
     *           example: "accessToken=...; Path=/; HttpOnly; Secure; SameSite=Lax, refreshToken=...; Path=/; HttpOnly; Secure; SameSite=Lax"
     *     responses:
     *       200:
     *         description: Avatar deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ProfileResponse'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UnauthorizedResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InternalServerErrorResponse'
     */

    router.delete(
      '/avatar',
      authMiddleware.authenticate,
      controller.deleteAvatar
    );

    return router;
  }
}
