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

    /**
     * @swagger
     * components:
     *   schemas:
     *     Link:
     *       type: object
     *       properties:
     *         id:
     *           type: string
     *         title:
     *           type: string
     *         url:
     *           type: string
     *         description:
     *           type: string
     *         visibility:
     *           type: string
     *         user_id:
     *           type: string
     *         created_at:
     *           type: string
     *         updated_at:
     *           type: string
     *     LinksResponse:
     *       type: array
     *       items:
     *         $ref: '#/components/schemas/Link'
     *     CreateLinkDto:
     *       type: object
     *       properties:
     *         title:
     *           type: string
     *         url:
     *           type: string
     *         description:
     *           type: string
     *         visibility:
     *           type: string
     *     ChangeVisibilityDto:
     *       type: object
     *       properties:
     *         visibility:
     *           type: string
     *     ReorderLinksDto:
     *       type: object
     *       properties:
     *         links:
     *           type: array
     *           items:
     *             $ref: '#/components/schemas/Link'
     *     UpdateLinkDto:
     *       type: object
     *       properties:
     *         title:
     *           type: string
     *         url:
     *           type: string
     *         platform:
     *           type: string
     *         is_active:
     *           type: boolean
     *
     *     Platform:
     *       type: object
     *       properties:
     *         id:
     *           type: string
     *         name:
     *           type: string
     *         display_name:
     *           type: string
     *         url_pattern:
     *           type: string
     *         icon_url:
     *           type: string
     *         base_url:
     *           type: string
     *         is_active:
     *           type: boolean
     *         created_at:
     *           type: string
     *         updated_at:
     *           type: string
     *
     *     UserLinksResponse:
     *       allOf:
     *         - $ref: '#/components/schemas/BaseResponse'
     *         - type: object
     *           properties:
     *             data:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Link'
     *
     *     CreatedLinkResponse:
     *       allOf:
     *         - $ref: '#/components/schemas/BaseResponse'
     *         - type: object
     *           properties:
     *             data:
     *               $ref: '#/components/schemas/Link'
     *
     *     UpdatedLinkResponse:
     *       allOf:
     *         - $ref: '#/components/schemas/BaseResponse'
     *         - type: object
     *           properties:
     *             data:
     *               $ref: '#/components/schemas/Link'
     *
     *     ReorderedLinksResponse:
     *       allOf:
     *         - $ref: '#/components/schemas/BaseResponse'
     *         - type: object
     *           properties:
     *             data:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Link'
     *
     *     ChangedVisibilityResponse:
     *       allOf:
     *         - $ref: '#/components/schemas/BaseResponse'
     *         - type: object
     *           properties:
     *             data:
     *               $ref: '#/components/schemas/Link'
     *
     */

    /**
     * @swagger
     * /api/links:
     *   get:
     *     tags:
     *       - Links
     *     summary: Get all links
     *     responses:
     *       200:
     *         description: A list of links
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserLinksResponse'
     *
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UnauthorizedResponse'
     *
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InternalServerErrorResponse'
     */

    router.get('/', controller.getLinks);

    /**
     * @swagger
     * /api/links:
     *   post:
     *     tags:
     *       - Links
     *     summary: Create a new link
     *     headers:
     *       Set-Cookie:
     *         description: >
     *           Sets the access and refresh tokens.
     *           Note: Multiple Set-Cookie headers are sent.
     *         schema:
     *           type: string
     *           example: "accessToken=...; Path=/; HttpOnly; Secure; SameSite=Lax, refreshToken=...; Path=/; HttpOnly; Secure; SameSite=Lax"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateLinkDto'
     *     responses:
     *       201:
     *         description: Link created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CreatedLinkResponse'
     *
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UnauthorizedResponse'
     *
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InternalServerErrorResponse'
     */

    router.post('/', authMiddleware.authenticate, controller.createLink);

    /**
     * @swagger
     * /api/links/visibility/{id}:
     *   patch:
     *     tags:
     *       - Links
     *     summary: Change link visibility
     *     headers:
     *       Set-Cookie:
     *         description: >
     *           Sets the access and refresh tokens.
     *           Note: Multiple Set-Cookie headers are sent.
     *         schema:
     *           type: string
     *           example: "accessToken=...; Path=/; HttpOnly; Secure; SameSite=Lax, refreshToken=...; Path=/; HttpOnly; Secure; SameSite=Lax"
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Link visibility changed successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ChangedVisibilityResponse'
     *
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UnauthorizedResponse'
     *
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InternalServerErrorResponse'
     */

    router.patch(
      '/visibility/:id',
      [authMiddleware.authenticate, authorizeLinkOwnerResource.authorize],
      controller.changeVisibility
    );

    /**
     * @swagger
     * /api/links/update/reorder:
     *   patch:
     *     tags:
     *       - Links
     *     summary: Reorder links
     *     headers:
     *       Set-Cookie:
     *         description: >
     *           Sets the access and refresh tokens.
     *           Note: Multiple Set-Cookie headers are sent.
     *         schema:
     *           type: string
     *           example: "accessToken=...; Path=/; HttpOnly; Secure; SameSite=Lax, refreshToken=...; Path=/; HttpOnly; Secure; SameSite=Lax"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ReorderLinksDto'
     *     responses:
     *       200:
     *         description: Links reordered successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ReorderedLinksResponse'
     *
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UnauthorizedResponse'
     *
     *       403:
     *         description: Forbidden
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ForbiddenResponse'
     *
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InternalServerErrorResponse'
     */

    router.patch(
      '/update/reorder',
      [authMiddleware.authenticate, authorizeBulkLinksMiddleware.authorize],
      controller.reorderLinks
    );

    /**
     * @swagger
     * /api/links/:id:
     *   patch:
     *     tags:
     *       - Links
     *     summary: Update link
     *     headers:
     *       Set-Cookie:
     *         description: >
     *           Sets the access and refresh tokens.
     *           Note: Multiple Set-Cookie headers are sent.
     *         schema:
     *           type: string
     *           example: "accessToken=...; Path=/; HttpOnly; Secure; SameSite=Lax, refreshToken=...; Path=/; HttpOnly; Secure; SameSite=Lax"
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateLinkDto'
     *     responses:
     *       200:
     *         description: Link updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UpdatedLinkResponse'
     *
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UnauthorizedResponse'
     *
     *       403:
     *         description: Forbidden
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ForbiddenResponse'
     *
     *       500:
     *         description: Internal Server Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/InternalServerErrorResponse'
     */

    router.patch(
      '/:id',
      [authMiddleware.authenticate, authorizeLinkOwnerResource.authorize],
      controller.updateLink
    );

    return router;
  }
}
