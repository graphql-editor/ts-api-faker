module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  collectCoverageFrom: ['**/src/**/*.ts', '!**/node_modules/**', '!**/lib/**'],
  collectCoverage: true,
  transform: { '^.+\\.ts?$': 'ts-jest' },
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '@app(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  testRunner: 'jest-circus/runner',
};
