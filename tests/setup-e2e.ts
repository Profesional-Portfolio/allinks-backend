import { jest, expect, beforeEach, afterEach } from '@jest/globals';
import { toBeEmpty } from 'jest-extended';

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
