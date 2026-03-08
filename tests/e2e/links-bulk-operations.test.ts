import request from 'supertest';
import prismadb from '@/infraestructure/prismadb';
import { mockLinksArrays, userOne, userTwo } from '../__mocks__';
import { getCsrfAgent } from './helpers';

import Server from '@/presentation/server';
import AppRoutes from '@/presentation/routes';
import { ENV } from '@/config/index';
import { App } from 'supertest/types';


describe('Links Bulk Operations', () => {
  let server: Server;
  let app: App;
  let agent: any;
  let csrfToken: string;

  let accessTokenUserOne: string;
  let accessTokenUserTwo: string;
  let userIdOne: string;
  let userIdTwo: string;

  beforeAll(async () => {
    server = new Server({ port: ENV.PORT, routes: AppRoutes.routes });
    app = server.serverApp;
    await server.init();

    const csrfData = await getCsrfAgent(app);
    agent = csrfData.agent;
    csrfToken = csrfData.csrfToken;



    // Clean up
    await prismadb.link.deleteMany({
      where: {
        user: {
          email: { in: [userOne.email, userTwo.email] },
        },
      },
    });

    await prismadb.user.deleteMany({
      where: {
        email: { in: [userOne.email, userTwo.email] },
      },
    });

    // Register users
    const userOneResponse = await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send(userOne);

    
    userIdOne = userOneResponse.body.data.user.id;
    accessTokenUserOne = userOneResponse.headers['set-cookie'][0]
      .split(';')[0]
      .split('=')[1];

    const userTwoResponse = await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send(userTwo);

    
    userIdTwo = userTwoResponse.body.data.user.id;
    accessTokenUserTwo = userTwoResponse.headers['set-cookie'][0]
      .split(';')[0]
      .split('=')[1];
  });

  afterAll(async () => {
    await prismadb.link.deleteMany({
      where: {
        user_id: { in: [userIdOne, userIdTwo] },
      },
    });
    await prismadb.user.deleteMany({
      where: {
        id: { in: [userIdOne, userIdTwo] },
      },
    });
    await prismadb.$disconnect();
  });

  describe('PATCH /api/links/update/reorder', () => {
    let linkId1: string;
    let linkId2: string;

    beforeEach(async () => {
      await prismadb.link.deleteMany({ where: { user_id: userIdOne } });
      
      const link1 = await prismadb.link.create({
        data: {
          ...mockLinksArrays[0][0],
          id: undefined,
          user_id: userIdOne,
          display_order: 1,
        },
      });
      const link2 = await prismadb.link.create({
        data: {
          ...mockLinksArrays[0][1],
          id: undefined,
          user_id: userIdOne,
          display_order: 2,
        },
      });
      linkId1 = link1.id;
      linkId2 = link2.id;
    });

    it('should reorder links successfully', async () => {
      const { agent: authAgent, csrfToken: authCsrfToken } = await getCsrfAgent(app);
      const reorderData = {
        links: [
          { id: linkId1, display_order: 2 },
          { id: linkId2, display_order: 1 },
        ],
      };

      const response = await authAgent
        .patch('/api/links/update/reorder')
        .set('x-csrf-token', authCsrfToken)
        .set('Cookie', `accessToken=${accessTokenUserOne}`)
        .send(reorderData)
        .expect(200);



      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Links reordered successfully');

      const updatedLink1 = await prismadb.link.findUnique({ where: { id: linkId1 } });
      const updatedLink2 = await prismadb.link.findUnique({ where: { id: linkId2 } });

      expect(updatedLink1?.display_order).toBe(2);
      expect(updatedLink2?.display_order).toBe(1);
    });

    it('should fail if links belong to another user', async () => {
      const { agent: failAgent, csrfToken: failCsrfToken } = await getCsrfAgent(app);
      const reorderData = {
        links: [
          { id: linkId1, display_order: 2 },
          { id: linkId2, display_order: 1 },
        ],
      };

      const response = await failAgent
        .patch('/api/links/update/reorder')
        .set('x-csrf-token', failCsrfToken)
        .set('Cookie', `accessToken=${accessTokenUserTwo}`)
        .send(reorderData)
        .expect(400); // AuthorizeBulkLinksMiddleware returns 400 if IDs don't belong to user



      expect(response.body.message).toContain('Some link IDs are not valid or do not belong to the user');
    });

    it('should fail if no links are provided', async () => {
      const { agent: authAgent, csrfToken: authCsrfToken } = await getCsrfAgent(app);
      const response = await authAgent
        .patch('/api/links/update/reorder')
        .set('x-csrf-token', authCsrfToken)
        .set('Cookie', `accessToken=${accessTokenUserOne}`)
        .send({ links: [] })
        .expect(400);



      expect(response.body.message).toBe('No link IDs provided');
    });

    it('should fail if link IDs are invalid', async () => {
      const { agent: authAgent, csrfToken: authCsrfToken } = await getCsrfAgent(app);
      const response = await authAgent
        .patch('/api/links/update/reorder')
        .set('x-csrf-token', authCsrfToken)
        .set('Cookie', `accessToken=${accessTokenUserOne}`)
        .send({ links: [{ id: 'non-existent', display_order: 1 }] })
        .expect(400);



      expect(response.body.message).toContain('Some link IDs are not valid or do not belong to the user');
    });
  });
});
