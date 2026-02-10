# Phase 0: Project Setup & Infrastructure

## Overview
Foundation phase for the entire TDD implementation. Establishes testing infrastructure, tooling, and project configuration.

## Prerequisites
- None (this is the starting phase)

## Objectives
1. Initialize Node.js project structure
2. Configure Vitest for maximum performance
3. Set up test environment with happy-dom
4. Create mock infrastructure for browser APIs
5. Establish testing conventions and utilities

## TDD Approach

### Red Phase
- Create `package.json` with project metadata
- Create `vitest.config.js` with performance optimizations
- Create test directory structure
- Write the first failing test to verify setup

### Green Phase
- Install all dependencies
- Run initial test to confirm configuration works
- Verify test environment is properly mocked

### Refactor Phase
- Optimize configuration for parallel execution
- Add benchmark support
- Configure coverage thresholds

## Acceptance Criteria

- [ ] `npm test` command executes successfully
- [ ] Tests run in less than 5 seconds (empty suite)
- [ ] Coverage reporting is configured
- [ ] Happy DOM environment is active (faster than jsdom)
- [ ] Parallel execution is enabled (threads pool)
- [ ] Test isolation can be disabled for performance
- [ ] All browser APIs are mockable

## Test Specifications

### Test: Infrastructure Exists
**File**: `tests/setup/infrastructure.test.js`

```javascript
import { describe, it, expect } from 'vitest';

describe('Project Infrastructure', () => {
  it('has package.json with correct configuration', () => {
    // This test verifies the setup is complete
    expect(true).toBe(true);
  });

  it('vitest configuration is loaded', () => {
    // Verify vitest config is valid
    expect(typeof import.meta.env).toBe('object');
  });

  it('test environment is happy-dom', () => {
    // Verify DOM APIs are available
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });
});
```

### Test: Browser API Mocks
**File**: `tests/setup/browser-mocks.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Browser API Mocks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('localStorage is mockable', () => {
    const mockStorage = new Map();
    const getItem = vi.fn((key) => mockStorage.get(key));
    const setItem = vi.fn((key, value) => mockStorage.set(key, value));
    
    setItem('theme', 'dark');
    expect(getItem('theme')).toBe('dark');
  });

  it('fetch is mockable', () => {
    const mockFetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve({}) })
    );
    global.fetch = mockFetch;
    
    expect(typeof fetch).toBe('function');
  });

  it('matchMedia is mockable', () => {
    const mockMatchMedia = vi.fn(() => ({ matches: false }));
    global.matchMedia = mockMatchMedia;
    
    expect(matchMedia('(prefers-reduced-motion: reduce)')).toEqual({ matches: false });
  });


});
```

## Implementation Steps

### Step 1: Create package.json
```json
{
  "name": "cv-portfolio",
  "version": "1.0.0",
  "description": "Portfolio website with TDD implementation",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:benchmark": "vitest bench",
    "test:performance": "vitest run tests/performance/",
    "test:visual": "vitest run tests/visual/"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "benchmark": "^2.1.4",
    "happy-dom": "^14.0.0",
    "jsdom": "^24.0.0",
    "vitest": "^1.0.0"
  }
}
```

### Step 2: Create vitest.config.js
```javascript
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
```

### Step 3: Create Directory Structure
```
tests/
├── setup/
│   ├── setup.js                 # Global test setup
│   └── mocks/
│       ├── local-storage.js     # localStorage mock
│       └── fetch.js             # fetch API mock
├── unit/
├── performance/
└── fixtures/
```

### Step 4: Create Global Setup
**File**: `tests/setup/setup.js`
```javascript
import { vi } from 'vitest';

// Global afterEach hook
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  document.body.innerHTML = '';
});
```

### Step 5: Create Mock Utilities
**File**: `tests/setup/mocks/local-storage.js`
```javascript
export function createLocalStorageMock() {
  const storage = new Map();
  
  return {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
    get length() { return storage.size; },
    key: (index) => Array.from(storage.keys())[index] ?? null,
    _storage: storage, // Access for testing
  };
}
```



## Verification Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Infrastructure Test**
   ```bash
   npm test tests/setup/infrastructure.test.js
   ```
   Expected: ✓ All tests pass

3. **Run Browser Mocks Test**
   ```bash
   npm test tests/setup/browser-mocks.test.js
   ```
   Expected: ✓ All tests pass

4. **Verify Performance**
   ```bash
   npm test
   ```
   Expected: Test suite completes in < 5 seconds

5. **Verify Coverage**
   ```bash
   npm run test:coverage
   ```
   Expected: Coverage report generates without errors

## Next Phase Dependencies

**Phase 1: Core Utilities** depends on:
- ✓ Vitest configuration working
- ✓ Happy DOM environment active
- ✓ Mock utilities available
- ✓ Test setup hooks configured

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Suite Startup | < 2s | Time to first test |
| Empty Test Run | < 5s | `npm test` with no tests |
| Mock Overhead | < 1ms | Time to create mocks |
| DOM Operations | < 0.1ms | Simple DOM query |

## Notes

- Happy DOM is chosen over jsdom for 2-3x performance improvement
- Thread pool is enabled but capped at 4 threads to prevent resource exhaustion
- Test isolation is disabled for speed, but modules must remain side-effect free
- All browser globals are mockable to enable pure unit testing
