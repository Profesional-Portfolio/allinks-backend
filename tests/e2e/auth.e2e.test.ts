import request from 'supertest';
import Server from '@/presentation/server';
import AppRoutes from '@/presentation/routes';
import { ENV } from '@/config/index';
import { validRegisterPayload, validLoginPayload } from '../payloads';
import { COOKIE_NAMES } from '@/infraestructure/utils';
import prismadb from '@/infraestructure/prismadb';
import { App } from 'supertest/types';

describe('Auth E2E Tests', () => {
  let server: Server;
  let app: App;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    server = new Server({ port: ENV.PORT, routes: AppRoutes.routes });
    app = server.serverApp;
    await server.init();
    await prismadb.user.deleteMany({
      where: {
        email: validRegisterPayload.email,
      },
    });
  });

  afterAll(async () => {
    // Clean up any resources if needed
    await prismadb.user.deleteMany({
      where: {
        email: validRegisterPayload.email,
      },
    });
    await prismadb.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
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

      // Verify cookies are set
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

      // Extract tokens for later use
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
      const response = await request(app)
        .post('/api/auth/register')
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

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidPayload)
        .expect(400);

      const status = response.body.statusCode;
      const message = response.body.message;

      expect(status).toBe(400);
    });

    it('should fail to register without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      const status = response.body.statusCode;

      expect(status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginPayload)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(validLoginPayload.email);
      expect(response.body.data.user).not.toHaveProperty('password_hash');

      // Verify cookies are set
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

      // Update tokens
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
      const response = await request(app)
        .post('/api/auth/login')
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
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123!',
        })
        .expect(401);

      const status = response.body.statusCode;

      expect(status).toBe(401);
    });

    it('should fail to login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(400);

      const status = response.body.statusCode;

      expect(status).toBe(400);
    });

    it('should fail to login without credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      const status = response.body.statusCode;

      expect(status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`${COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`])
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Tokens refreshed successfully');

      // Verify new cookies are set
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

      // Update tokens
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
      const response = await request(app).post('/api/auth/refresh').expect(400);

      const status = response.body.statusCode;

      expect(status).toBe(400);
    });

    it('should fail to refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`${COOKIE_NAMES.REFRESH_TOKEN}=invalid-token`])
        .expect(401);

      const status = response.body.statusCode;

      expect(status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid access token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Cookie', [`${COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}`])
        .expect(200);

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
        .set('Cookie', [`${COOKIE_NAMES.ACCESS_TOKEN}=invalid-token`])
        .expect(401);

      const status = response.body.statusCode;

      expect(status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`${COOKIE_NAMES.ACCESS_TOKEN}=${accessToken}`])
        .expect(200);

      const status = response.body.statusCode;
      const message = response.body.message;

      expect(status).toBe(200);
      expect(message).toBe('Logged out successfully');

      // Verify cookies are cleared
      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();

      // Check that cookies are being cleared (they should have Max-Age=0 or similar)
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
      const response = await request(app).post('/api/auth/logout').expect(401);

      const status = response.body.statusCode;

      expect(status).toBe(401);
    });
  });

  describe('Protected Routes - Authorization', () => {
    it('should deny access to profile after logout', async () => {
      const response = await request(app).get('/api/auth/profile').expect(401);

      const status = response.body.statusCode;

      expect(status).toBe(401);
    });

    it('should allow access after fresh login', async () => {
      // Login again
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(validLoginPayload)
        .expect(200);

      const cookies = loginResponse.headers[
        'set-cookie'
      ] as unknown as string[];
      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.includes(COOKIE_NAMES.ACCESS_TOKEN)
      );
      const newAccessToken = accessTokenCookie?.split(';')[0].split('=')[1];

      // Access profile
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Cookie', [`${COOKIE_NAMES.ACCESS_TOKEN}=${newAccessToken}`])
        .expect(200);

      const status = profileResponse.body.statusCode;

      expect(status).toBe(200);
    });
  });
});
