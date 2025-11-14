import { PrismaClient } from '@/generated/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import { prismadb } from '@/infraestructure/prismadb';

jest.mock('../src/infraestructure/prismadb', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

export const prismaMock = prismadb as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
