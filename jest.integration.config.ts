import type { Config } from 'jest';
import baseConfig from './jest.config.ts';

const config: Config = {
  ...baseConfig,
  setupFilesAfterEnv: ['<rootDir>/tests/setup-unit.ts'],
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
};

export default config;
