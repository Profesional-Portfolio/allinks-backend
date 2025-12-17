import request from 'supertest';
import Server from '@/presentation/server';
import AppRoutes from '@/presentation/routes';
import { ENV } from '@/config/index';
import { App } from 'supertest/types';
import { COOKIE_NAMES } from '@/infraestructure/utils';
import prismadb from '@/infraestructure/prismadb';
import { mockLinksArrays, userOne, userTwo } from '../__mocks__';

describe('Links Authorization', () => {
  let server: Server;
  let app: App;
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

    const userOneResponse = await request(app)
      .post('/api/auth/register')
      .send(userOne);

    userIdOne = userOneResponse.body.data.user.id;
    accessTokenUserOne = userOneResponse.headers['set-cookie'][0]
      .split(';')[0]
      .split('=')[1];
    refreshTokenUserOne = userOneResponse.headers['set-cookie'][1]
      .split(';')[0]
      .split('=')[1];

    const userTwoResponse = await request(app)
      .post('/api/auth/register')
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
      const response = await request(app)
        .post('/api/links')
        .send(mockLinksArrays[0])
        .expect(401);

      const statusCode = response.body.statusCode;
      const status = response.body.status;

      expect(statusCode).toBe(401);
      expect(status).toBe('error');
    });
  });
});
