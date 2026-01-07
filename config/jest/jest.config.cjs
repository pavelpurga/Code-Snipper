/** @type {import('jest').Config} */
module.exports = {
  rootDir: '../../',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/config/jest/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': '<rootDir>/test/__mocks__/styleMock.js'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/config/jest/tsconfig.jest.json' }],
    '^.+\\.(js|jsx)$': ['babel-jest']
  },
  transformIgnorePatterns: ['/node_modules/(?!.*)'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)']
}
