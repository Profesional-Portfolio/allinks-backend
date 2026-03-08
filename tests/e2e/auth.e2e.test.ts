import request from 'supertest';
import Server from '@/presentation/server';
import AppRoutes from '@/presentation/routes';
import { ENV } from '@/config/index';
import { validRegisterPayload, validLoginPayload } from '../payloads';
import { COOKIE_NAMES } from '@/infraestructure/utils';
import prismadb from '@/infraestructure/prismadb';
import { App } from 'supertest/types';
import { getCsrfAgent } from './helpers';
import TestAgent from 'supertest/lib/agent';

describe('Auth E2E Tests', () => {
  let server: Server;
  let app: App;
  let agent: any;

  let accessToken: string;
  let refreshToken: string;

  let csrfToken: string;

  beforeAll(async () => {
    server = new Server({ port: ENV.PORT, routes: AppRoutes.routes });
    app = server.serverApp;
    await server.init();
    await prismadb.user.deleteMany({
      where: {
        email: validRegisterPayload.email,
      },
    });

    const csrfData = await getCsrfAgent(app);
    agent = csrfData.agent;
    csrfToken = csrfData.csrfToken;
  });

  afterAll(async () => {
    await prismadb.user.deleteMany({
      where: {
        email: validRegisterPayload.email,
      },
    });
    await prismadb.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await agent
        .post('/api/auth/register')
        .set('x-csrf-token', csrfToken)
        .send(validRegisterPayload)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(validRegisterPayload.email);
      expect(response.body.data.user.username).toBe(
        validRegisterPayload.username
      );
      expect(response.body.data.user).not.toHaveProperty('password_hash');

      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) =>
          cookie.includes(COOKIE_NAMES.ACCESS_TOKEN)
        )
      ).toBe(true);
      expect(
        cookies.some((cookie: string) =>
          cookie.includes(COOKIE_NAMES.REFRESH_TOKEN)
        )
      ).toBe(true);

      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.includes(COOKIE_NAMES.ACCESS_TOKEN)
      );
      const refreshTokenCookie = cookies.find((cookie: string) =>
        cookie.includes(COOKIE_NAMES.REFRESH_TOKEN)
      );

      if (accessTokenCookie) {
        accessToken = accessTokenCookie.split(';')[0].split('=')[1];
      }
      if (refreshTokenCookie) {
        refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
      }
    });

    it('should fail to register with duplicate email', async () => {
      const response = await agent
        .post('/api/auth/register')
        .set('x-csrf-token', csrfToken)
        .send(validRegisterPayload)
        .expect(400);

      const status = response.body.statusCode;
      const message = response.body.message;

      expect(status).toBe(400);
      expect(message).toBe('User already exists');
    });

    it('should fail to register with invalid data', async () => {
      const invalidPayload = {
        email: 'invalid-email',
        password: '123', // Too short
        username: '',
      };

      const response = await agent
        .post('/api/auth/register')
        .set('x-csrf-token', csrfToken)
        .send(invalidPayload)
        .expect(400);

      const status = response.body.statusCode;
      const message = response.body.message;

      expect(status).toBe(400);
    });

    it('should fail to register without required fields', async () => {
      const response = await agent
        .post('/api/auth/register')
        .set('x-csrf-token', csrfToken)
        .send({})
        .expect(400);

      const status = response.body.statusCode;

      expect(status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send(validLoginPayload)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(validLoginPayload.email);
      expect(response.body.data.user).not.toHaveProperty('password_hash');

      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) =>
          cookie.includes(COOKIE_NAMES.ACCESS_TOKEN)
        )
      ).toBe(true);
      expect(
        cookies.some((cookie: string) =>
          cookie.includes(COOKIE_NAMES.REFRESH_TOKEN)
        )
      ).toBe(true);

      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.includes(COOKIE_NAMES.ACCESS_TOKEN)
      );
      const refreshTokenCookie = cookies.find((cookie: string) =>
        cookie.includes(COOKIE_NAMES.REFRESH_TOKEN)
      );

      if (accessTokenCookie) {
        accessToken = accessTokenCookie.split(';')[0].split('=')[1];
      }
      if (refreshTokenCookie) {
        refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
      }
    });

    it('should fail to login with invalid password', async () => {
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: validLoginPayload.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      const status = response.body.statusCode;
      const message = response.body.message;

      expect(status).toBe(401);
      expect(message).toBe('Invalid credentials');
    });

    it('should fail to login with non-existent user', async () => {
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123!',
        })
        .expect(401);

      const status = response.body.statusCode;

      expect(status).toBe(401);
    });

    it('should fail to login with invalid email format', async () => {
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(400);

      const status = response.body.statusCode;

      expect(status).toBe(400);
    });

    it('should fail to login without credentials', async () => {
      const response = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send({})
        .expect(400);

      const status = response.body.statusCode;

      expect(status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      const response = await agent
        .post('/api/auth/refresh')
        .set('x-csrf-token', csrfToken)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Tokens refreshed successfully');

      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) =>
          cookie.includes(COOKIE_NAMES.ACCESS_TOKEN)
        )
      ).toBe(true);
      expect(
        cookies.some((cookie: string) =>
          cookie.includes(COOKIE_NAMES.REFRESH_TOKEN)
        )
      ).toBe(true);

      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.includes(COOKIE_NAMES.ACCESS_TOKEN)
      );
      const refreshTokenCookie = cookies.find((cookie: string) =>
        cookie.includes(COOKIE_NAMES.REFRESH_TOKEN)
      );

      if (accessTokenCookie) {
        accessToken = accessTokenCookie.split(';')[0].split('=')[1];
      }
      if (refreshTokenCookie) {
        refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
      }
    });

    it('should fail to refresh without refresh token cookie', async () => {
      const { agent: failAgent, csrfToken: failCsrfToken } =
        await getCsrfAgent(app);
      const response = await failAgent
        .post('/api/auth/refresh')
        .set('x-csrf-token', failCsrfToken)
        .expect(400);

      const status = response.body.statusCode;

      expect(status).toBe(400);
    });

    it('should fail to refresh with invalid refresh token', async () => {
      const { agent: failAgent, csrfToken: failCsrfToken } =
        await getCsrfAgent(app);
      const response = await failAgent
        .post('/api/auth/refresh')
        .set('x-csrf-token', failCsrfToken)
        .set('Cookie', `${COOKIE_NAMES.REFRESH_TOKEN}=invalid-token`)
        .expect(401);

      const status = response.body.statusCode;

      expect(status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid access token', async () => {
      const response = await agent.get('/api/auth/profile').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data.email).toBe(validLoginPayload.email);
      expect(response.body.data).not.toHaveProperty('password_hash');
    });

    it('should fail to get profile without access token', async () => {
      const response = await request(app).get('/api/auth/profile').expect(401);

      const status = response.body.statusCode;

      expect(status).toBe(401);
    });

    it('should fail to get profile with invalid access token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Cookie', `${COOKIE_NAMES.ACCESS_TOKEN}=invalid-token`)
        .expect(401);

      const status = response.body.statusCode;

      expect(status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await agent
        .post('/api/auth/logout')
        .set('x-csrf-token', csrfToken)
        .expect(200);

      const status = response.body.statusCode;
      const message = response.body.message;

      expect(status).toBe(200);
      expect(message).toBe('Logged out successfully');

      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();

      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.includes(COOKIE_NAMES.ACCESS_TOKEN)
      );
      const refreshTokenCookie = cookies.find((cookie: string) =>
        cookie.includes(COOKIE_NAMES.REFRESH_TOKEN)
      );

      expect(accessTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toBeDefined();
    });

    it('should fail to logout without access token', async () => {
      const { agent: failAgent, csrfToken: failCsrfToken } =
        await getCsrfAgent(app);
      const response = await failAgent
        .post('/api/auth/logout')
        .set('x-csrf-token', failCsrfToken)
        .expect(401);

      const status = response.body.statusCode;

      expect(status).toBe(401);
    });
  });

  describe('Protected Routes - Authorization', () => {
    it('should deny access to profile after logout', async () => {
      const response = await agent.get('/api/auth/profile').expect(401);

      const status = response.body.statusCode;

      expect(status).toBe(401);
    });

    it('should allow access after fresh login', async () => {
      const loginResponse = await agent
        .post('/api/auth/login')
        .set('x-csrf-token', csrfToken)
        .send(validLoginPayload)
        .expect(200);

      const cookies = loginResponse.headers[
        'set-cookie'
      ] as unknown as string[];
      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.includes(COOKIE_NAMES.ACCESS_TOKEN)
      );
      const newAccessToken = accessTokenCookie?.split(';')[0].split('=')[1];

      const profileResponse = await agent.get('/api/auth/profile').expect(200);

      const status = profileResponse.body.statusCode;

      expect(status).toBe(200);
    });
  });
});
