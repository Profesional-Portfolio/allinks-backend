import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthDatasourceImpl } from '@/infraestructure/datasources/auth.datasource.impl';
import { AuthRepositoryImpl } from '@/infraestructure/repositories';

export default class AuthRoutes {
  static get routes(): Router {
    const datasource = new AuthDatasourceImpl();
    const authRepository = new AuthRepositoryImpl(datasource);
    const controller = new AuthController(authRepository);
    const router = Router();

    router.post('/register', controller.registerUser);

    return router;
  }
}
