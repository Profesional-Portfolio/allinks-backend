import { PrismaClient } from '@/generated/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type Context = {
  prisma: PrismaClient;
};

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export function createMockContext(): MockContext {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
}
