import { GetPublicProfileUseCase } from '@/domain/index';
import { UsersDatasourceImpl } from '@/infraestructure/datasources/users.datasource.impl';
import { UsersRepositoryImpl } from '@/infraestructure/repositories';
import { Router } from 'express';
import { PublicController } from './public.controller';

export class PublicRoutes {
  static get routes(): Router {
    const router = Router();
    const datasource = new UsersDatasourceImpl();
    const usersRepository = new UsersRepositoryImpl(datasource);
    const getUserProfileUseCase = new GetPublicProfileUseCase(usersRepository);

    const controller = new PublicController(getUserProfileUseCase);

    router.get('/', (req, res) => {
      return res.status(200).json({ message: 'Public routes' });
    });
    router.get('/:username', controller.getPublicProfile);

    return router;
  }
}
