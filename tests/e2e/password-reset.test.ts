import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';

import { ENV } from '@/config/index';
import prismadb from '@/infraestructure/prismadb';
import AppRoutes from '@/presentation/routes';
import Server from '@/presentation/server';

import { userOne } from '../__mocks__';
import { getCsrfAgent } from './helpers';

describe('Password Reset Flow', () => {
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

    // Clean up
    await prismadb.passwordResetToken.deleteMany({
      where: { user: { email: userOne.email } },
    });
    await prismadb.user.deleteMany({
      where: { email: userOne.email },
    });

    // Register user
    await agent
      .post('/api/auth/register')
      .set('x-csrf-token', csrfToken)
      .send(userOne);

    // Ensure email is verified for login (the database usually has it false by default)
    await prismadb.user.update({
      data: { email_verified: true },
      where: { email: userOne.email },
    });
  });

  afterAll(async () => {
    await prismadb.passwordResetToken.deleteMany({
      where: { user: { email: userOne.email } },
    });
    await prismadb.user.deleteMany({
      where: { email: userOne.email },
    });
    await prismadb.$disconnect();
  });

  it('should complete the full password reset flow', async () => {
    // 1. Request password reset
    await agent
      .post('/api/auth/forgot-password')
      .set('x-csrf-token', csrfToken)
      .send({ email: userOne.email })
      .expect(200);

    // 2. Get the token from DB
    const user = await prismadb.user.findUnique({
      where: { email: userOne.email },
    });
    const resetTokenRecord = await prismadb.passwordResetToken.findFirst({
      orderBy: { created_at: 'desc' },
      where: { user_id: user?.id },
    });

    expect(resetTokenRecord).toBeDefined();
    const token = resetTokenRecord?.token;

    // 3. Validate the token
    const validateResponse = await agent
      .post('/api/auth/validate-token')
      .set('x-csrf-token', csrfToken)
      .send({ token })
      .expect(200);

    const validateBody = validateResponse.body as { status: string };
    expect(validateBody.status).toBe('success');

    // 4. Reset the password
    const newPassword = 'NewPassword123!';
    await agent
      .post('/api/auth/reset-password')
      .set('x-csrf-token', csrfToken)
      .send({
        password: newPassword,
        password_confirmation: newPassword,
        token,
      })
      .expect(200);

    // 5. Try to login with new password
    const loginResponse = await agent
      .post('/api/auth/login')
      .set('x-csrf-token', csrfToken)
      .send({
        email: userOne.email,
        password: newPassword,
      })
      .expect(200);

    const loginBody = loginResponse.body as { status: string };
    expect(loginBody.status).toBe('success');
    expect(loginResponse.headers['set-cookie']).toBeDefined();
  });

  it('should fail with an invalid token', async () => {
    const { agent: failAgent, csrfToken: failCsrfToken } =
      await getCsrfAgent(app);
    await failAgent
      .post('/api/auth/validate-token')
      .set('x-csrf-token', failCsrfToken)
      .send({ token: 'invalid-token' })
      .expect(400);
  });

  it('should fail to reset with mismatched passwords', async () => {
    const { agent: failAgent, csrfToken: failCsrfToken } =
      await getCsrfAgent(app);
    // Request reset again to get a new token - using failAgent to keep it clean
    await failAgent
      .post('/api/auth/forgot-password')
      .set('x-csrf-token', failCsrfToken)
      .send({ email: userOne.email })
      .expect(200);

    const user = await prismadb.user.findUnique({
      where: { email: userOne.email },
    });
    const resetTokenRecord = await prismadb.passwordResetToken.findFirst({
      orderBy: { created_at: 'desc' },
      where: { user_id: user?.id },
    });
    const token = resetTokenRecord?.token;

    await failAgent
      .post('/api/auth/reset-password')
      .set('x-csrf-token', failCsrfToken)
      .send({
        password: 'NewPassword123!',
        password_confirmation: 'Mismatched123!',
        token,
      })
      .expect(400);
  });
});
