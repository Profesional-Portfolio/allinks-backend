import { toBeEmpty } from 'jest-extended';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

import prismadb from '@/infraestructure/prismadb';
import { PrismaClient } from '@/prisma/client';

expect.extend({ toBeEmpty });

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

// Helpers globales
global.console = {
  ...console,
  error: jest.fn(), // Mock console.error para evitar logs en tests
  warn: jest.fn(),
};

jest.mock('@/infraestructure/prismadb', () => {
  return {
    __esModule: true,
    default: mockDeep<PrismaClient>(),
  };
});

export const prismaMock = prismadb as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

// Mock environment variables so they aren't validated as missing by Zod during tests
jest.mock('@/config/env', () => ({
  ENV: {
    CLOUDINARY_API_KEY: 'test',
    CLOUDINARY_API_SECRET: 'test',
    CLOUDINARY_CLOUD_NAME: 'test',
    COOKIE_DOMAIN: 'localhost',
    CSRF_SECRET: 'test-csrf-secret',
    JWT_ACCESS_EXPIRES_IN: 900,
    JWT_ACCESS_SECRET: 'test-access-secret',
    JWT_REFRESH_EXPIRES_IN: 604800,
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    MAIN_FRONTEND_HOST: 'http://localhost:5173',
    NODE_ENV: 'test',
    PORT: 3000,
    REDIS_SERVER_URL: 'redis://localhost:6379',
    SMTP_FROM_EMAIL: 'test@example.com',
    SMTP_FROM_NAME: 'Test User',
    SMTP_HOST: 'smtp.mailtrap.io',
    SMTP_PASSWORD: 'test-password',
    SMTP_PORT: '2525',
    SMTP_SECURE: 'false',
    SMTP_USER: 'test-user',
  },
}));
