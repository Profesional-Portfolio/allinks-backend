// Mock Prisma Client
// jest.mock('../src/infraestructure/prismadb', () => ({
//   __esModule: true,
//   default: mockDeep<PrismaClient>(),
// }));

// Mock Prisma Client

// Global test utilities
// beforeAll(() => {
// });

// afterAll(async () => {
// });

// beforeEach(() => {
// });
beforeEach(() => {
  // Reset de mocks antes de cada test
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
