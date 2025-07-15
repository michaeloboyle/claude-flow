#!/usr/bin/env node

/**
 * CI-friendly basic test runner
 * Runs only the essential converted tests to avoid resource issues
 */

const { spawn } = require('child_process');
const path = require('path');

const CONVERTED_TESTS = [
  'tests/unit/simple-example.test.ts',
  'tests/unit/cli/commands/init/init-command.test.ts',
  'tests/unit/core/config.test.ts'
];

const JEST_OPTIONS = [
  '--ci',
  '--maxWorkers=1',  // Limit to single worker to reduce resource usage
  '--forceExit',
  '--detectOpenHandles',
  '--coverage=false'  // Disable coverage for speed
];

async function runTestBatch(testFiles) {
  return new Promise((resolve, reject) => {
    const args = [
      'jest',
      ...JEST_OPTIONS,
      ...testFiles
    ];
    
    console.log(`Running: NODE_OPTIONS=--experimental-vm-modules npx ${args.join(' ')}`);
    
    const child = spawn('npx', args, {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_OPTIONS: '--experimental-vm-modules'
      }
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

async function main() {
  console.log('🧪 Running CI-friendly basic tests...\n');
  
  try {
    // Run converted tests that should work
    console.log('📋 Running converted Jest tests...');
    await runTestBatch(CONVERTED_TESTS);
    
    console.log('\n✅ All basic tests passed!');
    console.log('\n💡 For full test suite, run in a more resourceful environment:');
    console.log('   npm run test:ci');
    
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runTestBatch, CONVERTED_TESTS };