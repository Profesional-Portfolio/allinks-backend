import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';

import { ENV } from '@/config/index';
import prismadb from '@/infraestructure/prismadb';
import AppRoutes from '@/presentation/routes';
import Server from '@/presentation/server';

import { mockLinksArrays, userOne, userTwo } from '../__mocks__';
import { getCsrfAgent } from './helpers';

describe('Links Authorization', () => {
  let server: Server;
  let app: App;
  let agent: TestAgent;
  let csrfToken: string;

  beforeAll(async () => {
    server = new Server({ port: ENV.PORT, routes: AppRoutes.routes });
    app = server.serverApp;
    await server.init();

    const csrfData = await getCsrfAgent(app);
    agent = csrfData.agent;
    csrfToken = csrfData.csrfToken;

    await prismadb.link.deleteMany({
      where: {
        user: {
          email: {
            in: [userOne.email, userTwo.email],
          },
        },
      },
    });

    await prismadb.user.deleteMany({
      where: {
        email: {
          in: [userOne.email, userTwo.email],
        },
      },
    });

    await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send(userOne);

    await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send(userTwo);
  });

  afterAll(async () => {
    await prismadb.link.deleteMany({
      where: {
        user: {
          email: {
            in: [userOne.email, userTwo.email],
          },
        },
      },
    });

    await prismadb.user.deleteMany({
      where: {
        email: {
          in: [userOne.email, userTwo.email],
        },
      },
    });

    await prismadb.$disconnect();
  });

  // user must be logged in to create a link
  describe('POST /api/links', () => {
    it('should fail to create a link without authentication', async () => {
      const { agent: failAgent, csrfToken: failCsrfToken } =
        await getCsrfAgent(app);
      const response = await failAgent
        .post('/api/links')
        .set('x-csrf-token', failCsrfToken)
        .send(mockLinksArrays[0])
        .expect(401);

      const body = response.body as { status: string; statusCode: number };
      const statusCode = body.statusCode;
      const status = body.status;

      expect(statusCode).toBe(401);
      expect(status).toBe('error');
    });

    it('should create a link successfully with authentication', async () => {
      const response = await agent
        .post('/api/links')
        .set('x-csrf-token', csrfToken)
        .send(mockLinksArrays[0])
        .expect(201);

      const body = response.body as { status: string; statusCode: number };
      const statusCode = body.statusCode;
      const status = body.status;

      expect(statusCode).toBe(201);
      expect(status).toBe('success');
    });
  });
});
