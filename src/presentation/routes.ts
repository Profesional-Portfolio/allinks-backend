import { Router } from 'express';
import { AuthRoutes } from './auth';
import { LinksRoutes } from './links';
import { PublicRoutes } from './public';
import { ProfileRoutes } from './profile';

export default class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use('/api/auth', AuthRoutes.routes);
    router.use('/api/links', LinksRoutes.routes);
    router.use('/api/public', PublicRoutes.routes);
    router.use('/api/profile', ProfileRoutes.routes);

    return router;
  }
}
