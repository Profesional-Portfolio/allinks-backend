import { PrismaClient } from '@/generated/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { toBeEmpty } from 'jest-extended';

import prismadb from '@/infraestructure/prismadb';

expect.extend({ toBeEmpty });

jest.mock('@/infraestructure/prismadb', () => {
  return {
    __esModule: true,
    default: mockDeep<PrismaClient>(),
  };
});

export const prismaMock = prismadb as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {});

beforeEach(() => {
  // Reset de mocks antes de cada test
  jest.clearAllMocks();
  mockReset(prismaMock);
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
