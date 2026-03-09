import type { Config } from 'jest';
import baseConfig from './jest.config.ts';

const config: Config = {
  ...baseConfig,
  setupFilesAfterEnv: ['<rootDir>/tests/setup-unit.ts'],
  testMatch: [
    '<rootDir>/tests/unit/**/*.{test,spec}.ts',
    '<rootDir>/tests/integration/**/*.{test,spec}.ts',
  ],
};

export default config;
