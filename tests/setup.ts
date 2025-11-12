import { PrismaClient } from '../generated/prisma';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock Prisma Client
// jest.mock('../src/infraestructure/prismadb', () => ({
//   __esModule: true,
//   default: mockDeep<PrismaClient>(),
// }));

// Mock Prisma Client
jest.mock('../src/infraestructure/prismadb', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

// Global test utilities
// beforeAll(() => {
// });

// afterAll(async () => {
// });

// beforeEach(() => {
// });

afterEach(() => {
  jest.clearAllMocks();
});

// Helpers globales
global.console = {
  ...console,
  error: jest.fn(), // Mock console.error para evitar logs en tests
  warn: jest.fn(),
};
