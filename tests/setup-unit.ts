import { toBeEmpty } from 'jest-extended';
import { PrismaClient } from '@/generated/prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import prismadb from '@/infraestructure/prismadb';

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
    PORT: 3000,
    CSRF_SECRET: 'test-csrf-secret',
    JWT_ACCESS_SECRET: 'test-access-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    NODE_ENV: 'test',
    COOKIE_DOMAIN: 'localhost',
    SMTP_HOST: 'smtp.mailtrap.io',
    SMTP_PORT: '2525',
    SMTP_USER: 'test-user',
    SMTP_PASSWORD: 'test-password',
    SMTP_FROM_EMAIL: 'test@example.com',
    SMTP_FROM_NAME: 'Test User',
    SMTP_SECURE: 'false',
    MAIN_FRONTEND_HOST: 'http://localhost:5173',
    CLOUDINARY_CLOUD_NAME: 'test',
    CLOUDINARY_API_KEY: 'test',
    CLOUDINARY_API_SECRET: 'test',
    REDIS_SERVER_URL: 'redis://localhost:6379',
  },
}));
