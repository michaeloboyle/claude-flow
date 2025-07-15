module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Relaxed rules for migration
    'no-unused-vars': 'warn',
    'no-undef': 'warn'
  },
  ignorePatterns: [
    'dist/',
    'dist-cjs/',
    'node_modules/',
    'bin/',
    'coverage/',
    '*.js'
  ]
};