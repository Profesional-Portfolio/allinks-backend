import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';

import { ENV } from '@/config/index';
import prismadb from '@/infraestructure/prismadb';
import AppRoutes from '@/presentation/routes';
import Server from '@/presentation/server';

import { mockLinksArrays, userOne, userTwo } from '../__mocks__';
import { getCsrfAgent } from './helpers';

describe('Links Bulk Operations', () => {
  let server: Server;
  let app: App;
  let agent: TestAgent;
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

    const userOneBody = userOneResponse.body as {
      data: { user: { id: string } };
    };
    userIdOne = userOneBody.data.user.id;
    accessTokenUserOne = (
      userOneResponse.headers['set-cookie'] as unknown as string[]
    )[0]
      .split(';')[0]
      .split('=')[1];

    const userTwoResponse = await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send(userTwo);

    const userTwoBody = userTwoResponse.body as {
      data: { user: { id: string } };
    };
    userIdTwo = userTwoBody.data.user.id;
    accessTokenUserTwo = (
      userTwoResponse.headers['set-cookie'] as unknown as string[]
    )[0]
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
    await server.close();
  });

  describe('PATCH /api/links/update/reorder', () => {
    let linkId1: string;
    let linkId2: string;

    beforeEach(async () => {
      await prismadb.link.deleteMany({ where: { user_id: userIdOne } });

      const link1 = await prismadb.link.create({
        data: {
          ...(mockLinksArrays[0][0] as any),
          display_order: 1,
          id: undefined,
          user_id: userIdOne,
        },
      });
      const link2 = await prismadb.link.create({
        data: {
          ...(mockLinksArrays[0][1] as any),
          display_order: 2,
          id: undefined,
          user_id: userIdOne,
        },
      });
      linkId1 = link1.id;
      linkId2 = link2.id;
    });

    it('should reorder links successfully', async () => {
      const { agent: authAgent, csrfToken: authCsrfToken } =
        await getCsrfAgent(app);
      const reorderData = {
        links: [
          { display_order: 2, id: linkId1 },
          { display_order: 1, id: linkId2 },
        ],
      };

      const response = await authAgent
        .patch('/api/links/update/reorder')
        .set('x-csrf-token', authCsrfToken)
        .set('Cookie', `accessToken=${accessTokenUserOne}`)
        .send(reorderData)
        .expect(200);

      const body = response.body as { message: string; status: string };
      expect(body.status).toBe('success');
      expect(body.message).toBe('Links reordered successfully');

      const updatedLink1 = await prismadb.link.findUnique({
        where: { id: linkId1 },
      });
      const updatedLink2 = await prismadb.link.findUnique({
        where: { id: linkId2 },
      });

      expect(updatedLink1?.display_order).toBe(2);
      expect(updatedLink2?.display_order).toBe(1);
    });

    it('should fail if links belong to another user', async () => {
      const { agent: failAgent, csrfToken: failCsrfToken } =
        await getCsrfAgent(app);
      const reorderData = {
        links: [
          { display_order: 2, id: linkId1 },
          { display_order: 1, id: linkId2 },
        ],
      };

      const response = await failAgent
        .patch('/api/links/update/reorder')
        .set('x-csrf-token', failCsrfToken)
        .set('Cookie', `accessToken=${accessTokenUserTwo}`)
        .send(reorderData)
        .expect(400); // AuthorizeBulkLinksMiddleware returns 400 if IDs don't belong to user

      const body = response.body as { message: string };
      expect(body.message).toContain(
        'Some link IDs are not valid or do not belong to the user'
      );
    });

    it('should fail if no links are provided', async () => {
      const { agent: authAgent, csrfToken: authCsrfToken } =
        await getCsrfAgent(app);
      const response = await authAgent
        .patch('/api/links/update/reorder')
        .set('x-csrf-token', authCsrfToken)
        .set('Cookie', `accessToken=${accessTokenUserOne}`)
        .send({ links: [] })
        .expect(400);

      const body = response.body as { message: string };
      expect(body.message).toBe('No link IDs provided');
    });

    it('should fail if link IDs are invalid', async () => {
      const { agent: authAgent, csrfToken: authCsrfToken } =
        await getCsrfAgent(app);
      const response = await authAgent
        .patch('/api/links/update/reorder')
        .set('x-csrf-token', authCsrfToken)
        .set('Cookie', `accessToken=${accessTokenUserOne}`)
        .send({ links: [{ display_order: 1, id: 'non-existent' }] })
        .expect(400);

      const body = response.body as { message: string };
      expect(body.message).toContain(
        'Some link IDs are not valid or do not belong to the user'
      );
    });
  });
});
