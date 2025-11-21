import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  collectCoverageFrom: ['app/**/*.ts', 'config/**/*.ts', 'sdk/**/*.ts'],
  moduleNameMapper: {
    '^@verilens/sdk$': '<rootDir>/sdk/index.ts',
    '^@verilens/sdk/(.*)$': '<rootDir>/sdk/$1',
  },
};

export default config;
