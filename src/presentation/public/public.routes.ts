import {
  CheckAvailabilityUsernameUseCase,
  GetPublicProfileUseCase,
} from '@/domain/index';
import { UsersDatasourceImpl } from '@/infraestructure/datasources/users.datasource.impl';
import { UsersRepositoryImpl } from '@/infraestructure/repositories';
import { CacheRedisAdapter } from '@/infraestructure/adapters';
import { CacheService } from '@/infraestructure/services';
import { Router } from 'express';
import { PublicController } from './public.controller';

export class PublicRoutes {
  static get routes(): Router {
    const router = Router();
    const datasource = new UsersDatasourceImpl();
    const usersRepository = new UsersRepositoryImpl(datasource);

    // Cache dependencies
    const cacheAdapter = new CacheRedisAdapter();
    const cacheService = new CacheService(cacheAdapter);

    const getUserProfileUseCase = new GetPublicProfileUseCase(
      usersRepository,
      cacheService
    );
    const checkAvailabilityUsernameUseCase =
      new CheckAvailabilityUsernameUseCase(usersRepository);

    const controller = new PublicController(
      getUserProfileUseCase,
      checkAvailabilityUsernameUseCase
    );

    /**
     * @swagger
     * components:
     *   schemas:
     *     UserWithLinks:
     *       allOf:
     *         - $ref: '#/components/schemas/User'
     *         - type: object
     *           properties:
     *             links:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Link'
     *     PublicProfileResponse:
     *       allOf:
     *         - $ref: '#/components/schemas/BaseResponse'
     *         - type: object
     *           properties:
     *             data:
     *               $ref: '#/components/schemas/UserWithLinks'
     */

    /**
     * @swagger
     * /api/public/:username:
     *   get:
     *     summary: Get public profile
     *     tags: [Public]
     *     parameters:
     *       - in: path
     *         name: username
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Public profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PublicProfileResponse'
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/NotFoundResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InternalServerErrorResponse'
     */

    router.get('/:username', controller.getPublicProfile);

    /**
     * @swagger
     * /api/public/check-availability/:username:
     *   get:
     *     summary: Check availability of username
     *     tags: [Public]
     *     parameters:
     *       - in: path
     *         name: username
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Username is available
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UsernameAvailabilityResponse'
     *       409:
     *         description: Username not available
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ConflictResponse'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InternalServerErrorResponse'
     */

    router.get(
      '/check-availability/:username',
      controller.checkUsernameAvailability
    );

    return router;
  }
}
