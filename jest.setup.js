/**
 * Jest Setup File - ES Module Compatible
 * Configure test environment and global settings
 */

// Set test environment flags
process.env.CLAUDE_FLOW_ENV = 'test';
process.env.NODE_ENV = 'test';

// Initialize logger for test environment
// Note: Logger initialization disabled for compatibility
// import { Logger } from './src/core/logger.js';
// Logger.getInstance({ 
//   level: 'error', 
//   format: 'json', 
//   destination: 'console' 
// });

// Test timeout will be set in Jest config

// Suppress console output during tests unless explicitly needed
const originalConsole = { ...console };

// Store original console for restoration
global.originalConsole = originalConsole;

// Handle unhandled rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  // Only log in test environment if needed
  if (process.env.DEBUG_TESTS) {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  }
});