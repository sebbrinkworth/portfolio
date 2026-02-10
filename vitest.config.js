import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use happy-dom for maximum performance (2-3x faster than jsdom)
    environment: 'happy-dom',
    
    // Parallel execution with threads
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 2,
      }
    },
    
    // Disable isolation for speed (modules have no side effects)
    isolate: false,
    
    // Fast native coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
    
    // Benchmark configuration
    benchmark: {
      include: ['**/*.bench.js'],
      outputFile: './benchmark-results.json',
      reporter: ['verbose']
    },
    
    // Global setup
    globals: true,
    setupFiles: ['./tests/setup/setup.js'],
    
    // Performance budget for tests
    testTimeout: 5000,
    hookTimeout: 5000,
  },
});
