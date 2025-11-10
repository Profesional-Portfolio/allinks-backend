import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthDatasourceImpl } from '@/infraestructure/datasources/auth.datasource.impl';
import { AuthRepositoryImpl } from '@/infraestructure/repositories';
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

export default class AuthRoutes {
  static get routes(): Router {
    // Adapters
    const tokenProvider = new JwtTokenProviderAdapter();
    const passwordHasher = new BcryptPasswordHasherAdapter();

    // Data layer
    const datasource = new AuthDatasourceImpl(passwordHasher);
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

    router.post('/register', controller.registerUser);
    router.post('/login', controller.loginUser);
    router.post('/refresh', controller.refreshToken);
    router.post('/logout', authMiddleware.authenticate, controller.logout);
    router.get('/profile', authMiddleware.authenticate, controller.getProfile);

    return router;
  }
}
