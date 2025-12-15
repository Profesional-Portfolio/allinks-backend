import type { Config } from 'jest';
import baseConfig from './jest.config.ts';

const config: Config = {
  ...baseConfig,
  setupFilesAfterEnv: ['<rootDir>/tests/setup-e2e.ts'],
  testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
};

export default config;
