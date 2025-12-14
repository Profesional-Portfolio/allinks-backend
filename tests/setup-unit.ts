import { PrismaClient } from '@/generated/prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import prismadb from '@/infraestructure/prismadb';

jest.mock('@/infraestructure/prismadb', () => {
  return {
    __esModule: true,
    default: mockDeep<PrismaClient>(),
  };
});

export const prismaMock = prismadb as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  // Reset de mocks antes de cada test
  mockReset(prismaMock);
});
