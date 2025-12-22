import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthDatasourceImpl } from '@/infraestructure/datasources/auth.datasource.impl';
import { AuthRepositoryImpl } from '@/infraestructure/repositories';
import prismadb from '@/infraestructure/prismadb';
import {
  JwtTokenProviderAdapter,
  BcryptPasswordHasherAdapter,
  getEmailAdapter,
} from '@/infraestructure/adapters';

import {
  RegisterUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  SendWelcomeEmailUseCase,
  VerifyEmailUseCase,
  ResetPasswordUseCase,
  ForgotPasswordUseCase,
  ResendVerificationEmailUseCase,
  ValidateResetTokenUseCase,
} from '@/domain/use-cases/auth';
import { AuthMiddleware, upload } from '../middlewares';
import { UploadImageUseCase } from '@/domain/index';
import { CloudinaryImageUploaderAdapter } from '@/infraestructure/adapters/cloudinary-image-uploader.adapter';

export class AuthRoutes {
  static get routes(): Router {
    // Adapters
    const tokenProvider = new JwtTokenProviderAdapter();
    const passwordHasher = new BcryptPasswordHasherAdapter();
    const emailService = getEmailAdapter();
    const uploadFileService = new CloudinaryImageUploaderAdapter();

    // Data layer
    const datasource = new AuthDatasourceImpl(passwordHasher, prismadb);
    const authRepository = new AuthRepositoryImpl(datasource);

    // Use cases
    const sendWelcomeEmailUseCase = new SendWelcomeEmailUseCase(
      authRepository,
      emailService
    );

    const verifyEmailUseCase = new VerifyEmailUseCase(authRepository);

    const resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
      authRepository,
      sendWelcomeEmailUseCase
    );

    const forgotPasswordUseCase = new ForgotPasswordUseCase(
      authRepository,
      emailService
    );

    const validateResetTokenUseCase = new ValidateResetTokenUseCase(
      authRepository
    );

    const resetPasswordUseCase = new ResetPasswordUseCase(
      authRepository,
      passwordHasher,
      emailService
    );

    const registerUserUseCase = new RegisterUserUseCase(
      authRepository, // Use cases

      tokenProvider
    );

    const loginUserUseCase = new LoginUserUseCase(
      authRepository,
      tokenProvider
    );

    const refreshTokenUseCase = new RefreshTokenUseCase(tokenProvider);
    const uploadImageUseCase = new UploadImageUseCase(uploadFileService);

    // Controller & Middleware
    const controller = new AuthController(
      registerUserUseCase,
      loginUserUseCase,
      refreshTokenUseCase,
      sendWelcomeEmailUseCase,
      verifyEmailUseCase,
      resetPasswordUseCase,
      forgotPasswordUseCase,
      resendVerificationEmailUseCase,
      validateResetTokenUseCase,
      uploadImageUseCase
    );
    const authMiddleware = new AuthMiddleware(tokenProvider);

    // Routes
    const router = Router();

    /**
     * @swagger
     * components:
     *   schemas:
     *     User:
     *       type: object
     *       properties:
     *         id:
     *           type: string
     *         email:
     *           type: string
     *         username:
     *           type: string
     *         first_name:
     *           type: string
     *         last_name:
     *           type: string
     *         bio:
     *           type: string
     *         avatar_url:
     *           type: string
     *         is_active:
     *           type: boolean
     *         email_verified:
     *           type: boolean
     *         password_hash:
     *           type: string
     *         created_at:
     *           type: string
     *         updated_at:
     *           type: string
     *         last_login_at:
     *           type: string
     *     UserWithoutPassword:
     *       type: object
     *       properties:
     *         id:
     *           type: string
     *         email:
     *           type: string
     *         username:
     *           type: string
     *         first_name:
     *           type: string
     *         last_name:
     *           type: string
     *         bio:
     *           type: string
     *         avatar_url:
     *           type: string
     *         is_active:
     *           type: boolean
     *         email_verified:
     *           type: boolean
     *         created_at:
     *           type: string
     *         updated_at:
     *           type: string
     *         last_login_at:
     *           type: string
     *     TokenPair:
     *       type: object
     *       properties:
     *         accessToken:
     *           type: string
     *         refreshToken:
     *           type: string
     *     TokenPayload:
     *       type: object
     *       properties:
     *         userId:
     *           type: string
     *         email:
     *           type: string
     *     RegisterUserDto:
     *       type: object
     *       properties:
     *         email:
     *           type: string
     *           example: "user@example.com"
     *         password:
     *           type: string
     *           example: "Password123!"
     *         username:
     *           type: string
     *           example: "usertest"
     *         first_name:
     *           type: string
     *           example: "John"
     *         last_name:
     *           type: string
     *           example: "Doe"
     *         bio:
     *           type: string
     *           example: "This is a bio"
     *         avatar_url:
     *           type: string
     *           example: "https://example.com/avatar.jpg"
     *         is_active:
     *           type: boolean
     *         email_verified:
     *           type: boolean
     *     LoginUserDto:
     *       type: object
     *       properties:
     *         email:
     *           type: string
     *         password:
     *           type: string
     *     ResetPasswordDto:
     *       type: object
     *       properties:
     *         password:
     *           type: string
     *         password_confirmation:
     *           type: string
     *     ForgotPasswordDto:
     *       type: object
     *       properties:
     *         email:
     *           type: string
     *     ResendVerificationEmailDto:
     *       type: object
     *       properties:
     *         email:
     *           type: string
     *     VerifyEmailDto:
     *       type: object
     *       properties:
     *         token:
     *           type: string
     *     RefreshTokenDto:
     *       type: object
     *       properties:
     *         refreshToken:
     *           type: string
     *     ValidateTokenDto:
     *       type: object
     *       properties:
     *         token:
     *           type: string
     *     BaseResponse:
     *       type: object
     *       properties:
     *         status:
     *           type: string
     *         message:
     *           type: string
     *         statusCode:
     *           type: number
     *         timestamp:
     *           type: string
     *           format: date-time
     *         meta:
     *           type: object
     *     AuthResponse:
     *       allOf:
     *         - $ref: '#/components/schemas/BaseResponse'
     *         - type: object
     *           properties:
     *             data:
     *               type: object
     *               properties:
     *                 user:
     *                   $ref: '#/components/schemas/UserWithoutPassword'
     *
     *     RefreshTokenResponse:
     *       allOf:
     *         - $ref: '#/components/schemas/BaseResponse'
     *         - type: object
     *           properties:
     *             data:
     *               type: object
     *               properties:
     *                 tokens:
     *                   $ref: '#/components/schemas/TokenPair'
     *
     *     ResendVerificationResponse:
     *       allOf:
     *         - $ref: '#/components/schemas/BaseResponse'
     *         - type: object
     *           properties:
     *             data:
     *               type: object
     *
     *     VerifyEmailResponse:
     *       allOf:
     *         - $ref: '#/components/schemas/BaseResponse'
     *         - type: object
     *           properties:
     *             data:
     *               type: object
     *
     *
     *     UnauthorizedResponse:
     *       type: object
     *       properties:
     *         status:
     *           type: string
     *         message:
     *           type: string
     *         statusCode:
     *           type: number
     *         timestamp:
     *           type: string
     *           format: date-time
     *         meta:
     *           type: object
     *     NotFoundResponse:
     *       type: object
     *       properties:
     *         status:
     *           type: string
     *         message:
     *           type: string
     *         statusCode:
     *           type: number
     *         timestamp:
     *           type: string
     *           format: date-time
     *         meta:
     *           type: object
     *
     *     ForbiddenResponse:
     *       type: object
     *       properties:
     *         status:
     *           type: string
     *         message:
     *           type: string
     *         statusCode:
     *           type: number
     *         timestamp:
     *           type: string
     *           format: date-time
     *         meta:
     *           type: object
     *
     *     BadRequestResponse:
     *       type: object
     *       properties:
     *         status:
     *           type: string
     *         message:
     *           type: string
     *         statusCode:
     *           type: number
     *         timestamp:
     *           type: string
     *           format: date-time
     *         meta:
     *           type: object
     *
     *     ConflictResponse:
     *       type: object
     *       properties:
     *         status:
     *           type: string
     *         message:
     *           type: string
     *         statusCode:
     *           type: number
     *         timestamp:
     *           type: string
     *           format: date-time
     *         meta:
     *           type: object
     *
     *     InternalServerErrorResponse:
     *       type: object
     *       properties:
     *         status:
     *           type: string
     *         message:
     *           type: string
     *         statusCode:
     *           type: number
     *         timestamp:
     *           type: string
     *           format: date-time
     *         meta:
     *           type: object
     */

    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RegisterUserDto'
     *     responses:
     *       201:
     *         description: User registered successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     *       409:
     *         description: User already exists
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     */

    router.post('/register', upload, controller.registerUser);

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Login a user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginUserDto'
     *     security:
     *       - cookieAccessToken: []
     *       - cookieRefreshToken: []
     *     responses:
     *       200:
     *         description: User logged in successfully
     *         headers:
     *           Set-Cookie:
     *             description: >
     *               Sets the access and refresh tokens.
     *               Note: Multiple Set-Cookie headers are sent (accessToken and refreshToken).
     *             schema:
     *               type: string
     *               example: "accessToken=...; Path=/; HttpOnly; Secure; SameSite=Lax, refreshToken=...; Path=/; HttpOnly; Secure; SameSite=Lax"
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     *       401:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     */

    router.post('/login', controller.loginUser);

    /**
     * @swagger
     * /api/auth/refresh:
     *   post:
     *     summary: Refresh a user's access token
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: User logged in successfully
     *         headers:
     *           Set-Cookie:
     *             description: >
     *               Sets the access and refresh tokens.
     *               Note: Multiple Set-Cookie headers are sent.
     *             schema:
     *               type: string
     *               example: "accessToken=...; Path=/; HttpOnly; Secure; SameSite=Lax, refreshToken=...; Path=/; HttpOnly; Secure; SameSite=Lax"
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/RefreshTokenResponse'
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     *       401:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     */

    router.post('/refresh', controller.refreshToken);

    /**
     * @swagger
     * /api/auth/logout:
     *   post:
     *     summary: Logout a user
     *     tags: [Auth]
     *     security:
     *       - cookieAccessToken: []
     *       - cookieRefreshToken: []
     *     responses:
     *       200:
     *         description: User logged out successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     *       401:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     */
    router.post('/logout', authMiddleware.authenticate, controller.logout);

    /**
     * @swagger
     * /api/auth/profile:
     *   get:
     *     summary: Get user profile
     *     tags: [Auth]
     *     security:
     *       - cookieAccessToken: []
     *       - cookieRefreshToken: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     *       401:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     */
    router.get('/profile', authMiddleware.authenticate, controller.getProfile);

    /**
     * @swagger
     * /api/auth/verify-email:
     *   post:
     *     summary: Verify user email
     *     tags: [Auth]
     *     parameters:
     *       - in: query
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *           example: "faa96266dc3df2c68e150d510d2f683610da98a668a7281382fb675f3eefce54"
     *     responses:
     *       200:
     *         description: User email verified successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     *       401:
     *         description: Invalid token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     */
    router.post('/verify-email', controller.verifyEmail);

    /**
     * @swagger
     * /api/auth/resend-verification:
     *   post:
     *     summary: Resend verification email
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ResendVerificationEmailDto'
     *     responses:
     *       200:
     *         description: Verification email sent successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     *       401:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     */
    router.post('/resend-verification', controller.resendVerificationEmail);

    /**
     * @swagger
     *   /api/auth/forgot-password:
     *   post:
     *     summary: Forgot password
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ForgotPasswordDto'
     *     responses:
     *       200:
     *         description: Password reset email sent successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     *       401:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     */
    router.post('/forgot-password', controller.forgotPassword);

    /**
     * @swagger
     *   /api/auth/reset-password:
     *   post:
     *     summary: Reset password
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ResetPasswordDto'
     *     responses:
     *       200:
     *         description: Password reset successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     *       401:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     */
    router.post('/reset-password', controller.resetPassword);

    /**
     * @swagger
     *   /api/auth/validate-token:
     *   post:
     *     summary: Validate reset password token
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ValidateTokenDto'
     *     responses:
     *       200:
     *         description: Token is valid
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     *       400:
     *         description: Invalid token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BaseResponse'
     */
    router.post('/validate-token', controller.validateToken);

    return router;
  }
}
