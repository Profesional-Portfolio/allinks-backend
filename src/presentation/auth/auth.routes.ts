import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthDatasourceImpl } from '@/infraestructure/datasources/auth.datasource.impl';
import { AuthRepositoryImpl } from '@/infraestructure/repositories';
import prismadb from '@/infraestructure/prismadb';
import {
  JwtTokenProviderAdapter,
  BcryptPasswordHasherAdapter,
} from '@/infraestructure/adapters';
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
} from '@/domain/index';

import { AuthMiddleware } from '../middlewares';

export class AuthRoutes {
  static get routes(): Router {
    // Adapters
    const tokenProvider = new JwtTokenProviderAdapter();
    const passwordHasher = new BcryptPasswordHasherAdapter();

    // Data layer
    const datasource = new AuthDatasourceImpl(passwordHasher, prismadb);
    const authRepository = new AuthRepositoryImpl(datasource);

    // Use cases
    const registerUserUseCase = new RegisterUserUseCase(
      authRepository,
      tokenProvider
    );
    const loginUserUseCase = new LoginUserUseCase(
      authRepository,
      tokenProvider
    );
    const refreshTokenUseCase = new RefreshTokenUseCase(tokenProvider);

    // Controller & Middleware
    const controller = new AuthController(
      registerUserUseCase,
      loginUserUseCase,
      refreshTokenUseCase
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
     *         password:
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
     *     LoginUserDto:
     *       type: object
     *       properties:
     *         email:
     *           type: string
     *         password:
     *           type: string
     *
     */

    router.post('/register', controller.registerUser);
    router.post('/login', controller.loginUser);
    router.post('/refresh', controller.refreshToken);
    router.post('/logout', authMiddleware.authenticate, controller.logout);
    router.get('/profile', authMiddleware.authenticate, controller.getProfile);

    return router;
  }
}
