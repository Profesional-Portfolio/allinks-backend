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
import {
  AuthMiddleware,
  AuthorizeBulkLinksMiddleware,
  AuthorizeLinkOwnerMiddleware,
} from '../middlewares';
import { JwtTokenProviderAdapter } from '@/infraestructure/adapters';
import { LinksRepositoryImpl } from '@/infraestructure/repositories';

export class LinksRoutes {
  static get routes(): Router {
    const router = Router();

    const datasource = new LinksDataSourceImpl(prismadb);
    const linksRepository = new LinksRepositoryImpl(datasource);
    const tokenProvider = new JwtTokenProviderAdapter();

    const getLinksUseCase = new GetLinksUseCase(linksRepository);
    const changeVisibilityUseCase = new ChangeVisibilityUseCase(
      linksRepository
    );
    const createLinkUseCase = new CreateLinkUseCase(linksRepository);
    const updateLinkUseCase = new UpdateLinkUseCase(linksRepository);
    const reorderLinksUseCase = new ReorderLinksUseCase(linksRepository);

    const controller = new LinksController(
      getLinksUseCase,
      changeVisibilityUseCase,
      createLinkUseCase,
      updateLinkUseCase,
      reorderLinksUseCase
    );

    const authMiddleware = new AuthMiddleware(tokenProvider);
    const authorizeLinkOwnerResource = new AuthorizeLinkOwnerMiddleware(
      linksRepository
    );
    const authorizeBulkLinksMiddleware = new AuthorizeBulkLinksMiddleware(
      linksRepository
    );

    // router.get('/', controller.getLinks);
    router.post('/', authMiddleware.authenticate, controller.createLink);
    router.patch(
      '/visibility/:id',
      [authMiddleware.authenticate, authorizeLinkOwnerResource.authorize],
      controller.changeVisibility
    );
    router.patch(
      '/update/reorder',
      [authMiddleware.authenticate, authorizeBulkLinksMiddleware.authorize],
      controller.reorderLinks
    );
    router.patch(
      '/:id',
      [authMiddleware.authenticate, authorizeLinkOwnerResource.authorize],
      controller.updateLink
    );

    return router;
  }
}
