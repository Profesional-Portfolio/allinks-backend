import { PrismaClient } from '@/prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

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
