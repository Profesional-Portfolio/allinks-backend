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
