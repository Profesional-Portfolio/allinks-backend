import { Router } from 'express';
import { LinksController } from './links.controller';
import {
  CreateLinkUseCase,
  ChangeVisibilityUseCase,
  GetLinksUseCase,
  ReorderLinksUseCase,
  UpdateLinkUseCase,
} from '@/domain/use-cases/links';
import { LinksDataSourceImpl } from '@/infraestructure/datasources/links.datasource.impl';
import prismadb from '@/infraestructure/prismadb';
import { AuthMiddleware } from '../middlewares';
import { JwtTokenProviderAdapter } from '@/infraestructure/adapters';

export class LinksRoutes {
  static get routes(): Router {
    const router = Router();
    const datasource = new LinksDataSourceImpl(prismadb);
    const tokenProvider = new JwtTokenProviderAdapter();

    const getLinksUseCase = new GetLinksUseCase(datasource);
    const changeVisibilityUseCase = new ChangeVisibilityUseCase(datasource);
    const createLinkUseCase = new CreateLinkUseCase(datasource);
    const updateLinkUseCase = new UpdateLinkUseCase(datasource);
    const reorderLinksUseCase = new ReorderLinksUseCase(datasource);

    const controller = new LinksController(
      getLinksUseCase,
      changeVisibilityUseCase,
      createLinkUseCase,
      updateLinkUseCase,
      reorderLinksUseCase
    );

    const authMiddleware = new AuthMiddleware(tokenProvider);

    router.get('/', authMiddleware.authenticate, controller.getLinks);
    router.post('/', authMiddleware.authenticate, controller.createLink);
    router.patch(
      '/visibility/:id',
      authMiddleware.authenticate,
      controller.changeVisibility
    );
    router.patch(
      '/update/reorder',
      authMiddleware.authenticate,
      controller.reorderLinks
    );
    router.patch('/:id', authMiddleware.authenticate, controller.updateLink);

    return router;
  }
}
