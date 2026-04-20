import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { PrismaClient } from '@/prisma/client';

export interface Context {
  prisma: PrismaClient;
}

export interface MockContext {
  prisma: DeepMockProxy<PrismaClient>;
}

export function createMockContext(): MockContext {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
}
