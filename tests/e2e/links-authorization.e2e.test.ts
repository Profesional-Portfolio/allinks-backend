import request from 'supertest';
import Server from '@/presentation/server';
import AppRoutes from '@/presentation/routes';
import { ENV } from '@/config/index';
import { App } from 'supertest/types';
import { COOKIE_NAMES } from '@/infraestructure/utils';
import prismadb from '@/infraestructure/prismadb';
import { mockLinksArrays, userOne, userTwo } from '../__mocks__';
import { getCsrfAgent } from './helpers';

describe('Links Authorization', () => {
  let server: Server;
  let app: App;
  let agent: any;
  let csrfToken: string;
  let userIdOne: string;

  let accessTokenUserOne: string;
  let refreshTokenUserOne: string;
  let accessTokenUserTwo: string;
  let refreshTokenUserTwo: string;
  let userIdTwo: string;

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

    const userOneResponse = await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send(userOne);

    userIdOne = userOneResponse.body.data.user.id;
    accessTokenUserOne = userOneResponse.headers['set-cookie'][0]
      .split(';')[0]
      .split('=')[1];
    refreshTokenUserOne = userOneResponse.headers['set-cookie'][1]
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
    refreshTokenUserTwo = userTwoResponse.headers['set-cookie'][1]
      .split(';')[0]
      .split('=')[1];
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

      const statusCode = response.body.statusCode;
      const status = response.body.status;

      expect(statusCode).toBe(401);
      expect(status).toBe('error');
    });

    it('should create a link successfully with authentication', async () => {
      const response = await agent
        .post('/api/links')
        .set('x-csrf-token', csrfToken)
        .send(mockLinksArrays[0])
        .expect(201);

      const statusCode = response.body.statusCode;
      const status = response.body.status;

      expect(statusCode).toBe(201);
      expect(status).toBe('success');
    });
  });
});
