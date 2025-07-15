module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.{js,ts}',
    '**/*.(test|spec).{js,ts}',
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/tests/**/*.spec.js'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { 
      useESM: false,
      isolatedModules: true,
      tsconfig: {
        allowJs: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        moduleResolution: 'node',
        target: 'es2021',
        module: 'commonjs'
      }
    }],
    '^.+\\.(js|jsx)$': ['ts-jest', {
      useESM: false,
      isolatedModules: true,
      tsconfig: {
        allowJs: true,
        esModuleInterop: true,
        resolveJsonModule: true,
        moduleResolution: 'node',
        target: 'es2021',
        module: 'commonjs'
      }
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@ruv-swarm|@claude-code)/)'
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!**/node_modules/**',
    '!src/**/*.test.ts',
    '!src/**/*.test.js',
    '!src/**/*.spec.ts',
    '!src/**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      useESM: false,
      isolatedModules: true
    }
  },
  maxWorkers: process.env.CI ? 2 : '50%',
  verbose: !!process.env.CI,
  bail: !!process.env.CI,
  cache: !process.env.CI,
  watchman: false,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
  restoreMocks: true
};