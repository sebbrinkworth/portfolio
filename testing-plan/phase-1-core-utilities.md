# Phase 1: Core Utilities

## Overview
Implement the foundational utility functions with comprehensive test coverage. Start with `escapeHtml` as it's a pure function with clear inputs/outputs, perfect for TDD.

## Prerequisites
- [x] Phase 0: Project Setup & Infrastructure complete
- [x] `npm test` executes successfully
- [x] Happy DOM environment is configured
- [x] Mock utilities are available

## Objectives
1. Implement `escapeHtml()` utility function
2. Achieve 100% test coverage for utility functions
3. Establish testing patterns for pure functions
4. Document edge cases and performance characteristics
5. Set baseline for function execution time

## TDD Approach

### Red Phase - Write Tests First
1. Create `tests/unit/utils.test.js` with failing tests
2. Define all edge cases before implementation
3. Set performance benchmarks
4. Run tests to confirm they fail

### Green Phase - Implement Function
1. Create `js/utils.js` with minimal implementation
2. Run tests until all pass
3. Verify 100% coverage

### Refactor Phase - Optimize
1. Review implementation for efficiency
2. Add performance benchmarks
3. Document complexity (O(n) for escapeHtml)

## Acceptance Criteria

- [ ] All 6 test cases pass
- [ ] 100% code coverage for `escapeHtml`
- [ ] Performance: < 0.01ms for 1KB input
- [ ] Handles all HTML entities correctly
- [ ] Zero dependencies (pure function)
- [ ] JSDoc documentation complete

## Test Specifications

### Test Suite: escapeHtml
**File**: `tests/unit/utils.test.js`

#### Test 1: Basic HTML Escaping
```javascript
it('escapes HTML special characters correctly', () => {
  const input = '<script>alert("XSS")</script>';
  const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
  expect(escapeHtml(input)).toBe(expected);
});
```

#### Test 2: Empty String
```javascript
it('handles empty strings', () => {
  expect(escapeHtml('')).toBe('');
});
```

#### Test 3: No Special Characters
```javascript
it('handles strings without special chars', () => {
  const input = 'Hello World 123';
  expect(escapeHtml(input)).toBe(input);
});
```

#### Test 4: All Special Characters
```javascript
it('escapes all HTML special characters', () => {
  const input = '&<>"\'';
  const expected = '&amp;&lt;&gt;&quot;&#039;';
  expect(escapeHtml(input)).toBe(expected);
});
```

#### Test 5: Non-String Input
```javascript
it('handles non-string inputs gracefully', () => {
  expect(escapeHtml(123)).toBe('123');
  expect(escapeHtml(null)).toBe('null');
  expect(escapeHtml(undefined)).toBe('undefined');
});
```

#### Test 6: Performance Budget
```javascript
it('executes within performance budget (1KB < 0.01ms)', () => {
  const longInput = '<script>'.repeat(100); // ~1KB
  
  const start = performance.now();
  escapeHtml(longInput);
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(0.01);
});
```

## Implementation Steps

### Step 1: Write Failing Tests First

**File**: `tests/unit/utils.test.js`
```javascript
import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../../js/utils.js';

describe('escapeHtml', () => {
  it('escapes HTML special characters correctly', () => {
    const input = '<script>alert("XSS")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });
  
  it('handles empty strings', () => {
    expect(escapeHtml('')).toBe('');
  });
  
  it('handles strings without special chars', () => {
    const input = 'Hello World 123';
    expect(escapeHtml(input)).toBe(input);
  });
  
  it('escapes all HTML special characters', () => {
    const input = '&<>"\'';
    const expected = '&amp;&lt;&gt;&quot;&#039;';
    expect(escapeHtml(input)).toBe(expected);
  });
  
  it('handles non-string inputs gracefully', () => {
    expect(escapeHtml(123)).toBe('123');
    expect(escapeHtml(null)).toBe('null');
    expect(escapeHtml(undefined)).toBe('undefined');
  });
  
  it('executes within performance budget (1KB < 0.01ms)', () => {
    const longInput = '<script>'.repeat(100);
    
    const start = performance.now();
    escapeHtml(longInput);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(0.01);
  });
});
```

### Step 2: Run Tests (Should Fail)
```bash
npm test tests/unit/utils.test.js
```
Expected: 6 failing tests (module not found)

### Step 3: Implement Function

**File**: `js/utils.js`
```javascript
/**
 * Escapes HTML special characters to prevent XSS attacks
 * and ensure safe rendering in the DOM.
 * 
 * Time Complexity: O(n) where n is input string length
 * Space Complexity: O(n) for the output string
 * 
 * @param {string} str - Input string to escape
 * @returns {string} Escaped HTML string
 * 
 * @example
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
```

### Step 4: Run Tests (Should Pass)
```bash
npm test tests/unit/utils.test.js
```
Expected: ✓ 6 passing tests

### Step 5: Verify Coverage
```bash
npm run test:coverage -- tests/unit/utils.test.js
```
Expected: 100% coverage for utils.js

## Performance Benchmark

**File**: `tests/performance/utils.bench.js`
```javascript
import { bench, describe } from 'vitest';
import { escapeHtml } from '../../js/utils.js';

describe('escapeHtml Performance', () => {
  const shortInput = '<script>alert("XSS")</script>';
  const mediumInput = shortInput.repeat(100); // ~1KB
  const longInput = shortInput.repeat(10000); // ~100KB

  bench('short input (100B)', () => {
    escapeHtml(shortInput);
  });

  bench('medium input (1KB)', () => {
    escapeHtml(mediumInput);
  });

  bench('long input (100KB)', () => {
    escapeHtml(longInput);
  }, { time: 1000 });
});
```

Run benchmarks:
```bash
npm run test:benchmark tests/performance/utils.bench.js
```

## Verification Steps

1. **Test All Cases**
   ```bash
   npm test tests/unit/utils.test.js
   ```
   Expected: ✓ 6 passing tests

2. **Verify Coverage**
   ```bash
   npm run test:coverage -- tests/unit/utils.test.js
   ```
   Expected: 
   - Statements: 100%
   - Branches: 100%
   - Functions: 100%
   - Lines: 100%

3. **Run Performance Benchmarks**
   ```bash
   npm run test:benchmark tests/performance/utils.bench.js
   ```
   Expected: Baseline metrics recorded

4. **Verify No Dependencies**
   ```bash
   grep -r "import" js/utils.js
   ```
   Expected: Only function export (no imports)

## Test Results Template

After running tests, document results:

```
PASS  tests/unit/utils.test.js
  escapeHtml
    ✓ escapes HTML special characters correctly (2ms)
    ✓ handles empty strings (1ms)
    ✓ handles strings without special chars (1ms)
    ✓ escapes all HTML special characters (1ms)
    ✓ handles non-string inputs gracefully (1ms)
    ✓ executes within performance budget (1KB < 0.01ms) (0ms)

Test Files: 1 passed, 1 total
Tests:       6 passed, 6 total
Duration:    0.5s

Coverage:
File       | % Stmts | % Branch | % Funcs | % Lines |
-----------|---------|----------|---------|---------|
js/utils.js| 100.00  | 100.00   | 100.00  | 100.00  |
```

## Next Phase Dependencies

**Phase 2: Theme System** depends on:
- ✓ `escapeHtml` function implemented and tested
- ✓ Testing patterns established
- ✓ Performance benchmarking working
- ✓ 100% coverage as baseline expectation

## Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Tests Passing | 6/6 | TBD | ⏳ |
| Code Coverage | 100% | TBD | ⏳ |
| Performance (1KB) | < 0.01ms | TBD | ⏳ |
| Benchmark Baseline | Recorded | TBD | ⏳ |

## Notes

- `String(str)` handles non-string inputs gracefully
- `replaceAll()` is used instead of `replace()` with regex for clarity
- Order of replacements matters: `&` must be first to avoid double-escaping
- Performance benchmark establishes baseline for regression testing
- Pure function with zero side effects - ideal for testing
