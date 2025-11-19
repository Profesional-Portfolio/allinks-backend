import { Router } from 'express';
import { AuthRoutes } from './auth';
import { LinksRoutes } from './links';

export default class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);
    router.use('/api/links', LinksRoutes.routes);

    return router;
  }
}
