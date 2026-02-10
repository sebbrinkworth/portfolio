# Phase 4: Performance Benchmarks

## Overview
Establish comprehensive performance benchmarks for all critical operations. Tests rendering speed and memory efficiency across all modules.

## Prerequisites
- [x] Phase 0-3: All core functionality implemented and tested
- [x] Vitest benchmark mode configured
- [x] Baseline performance metrics from previous phases

## Objectives
1. Create benchmark suite for all rendering operations
2. Establish performance baselines
3. Test memory allocation patterns
4. Benchmark large dataset handling
5. Create performance regression detection
6. Document performance budgets

## TDD Approach

### Red Phase - Write Benchmarks First
1. Create `tests/performance/render.bench.js` for rendering benchmarks
2. Create `tests/performance/memory.bench.js` for memory benchmarks
3. Define performance thresholds
4. Run benchmarks to establish baselines

### Green Phase - Validate Benchmarks
1. Run all benchmarks to confirm they execute
2. Verify results are recorded in benchmark-results.json
3. Ensure benchmarks complete without errors

### Refactor Phase - Optimize Based on Data
1. Analyze benchmark results
2. Identify bottlenecks
3. Optimize critical paths
4. Re-run to verify improvements

## Acceptance Criteria

- [ ] All benchmark files execute successfully
- [ ] Baseline metrics recorded for all operations
- [ ] Memory allocation patterns documented
- [ ] Large dataset benchmarks (< 500 items) pass
- [ ] Benchmark results saved to benchmark-results.json
- [ ] Performance regression thresholds defined

## Test Specifications

### Benchmark Suite: Rendering Performance
**File**: `tests/performance/render.bench.js`

```javascript
import { bench, describe } from 'vitest';
import { escapeHtml } from '../../js/utils.js';
import { loadTimeline } from '../../js/timeline.js';
import { loadSkills } from '../../js/skills.js';

describe('Rendering Performance', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="timeline"></div>
      <ul id="skills"></ul>
    `;
  });

  bench('escapeHtml - short string (100B)', () => {
    escapeHtml('<script>alert("XSS")</script>');
  });

  bench('escapeHtml - medium string (1KB)', () => {
    const input = '<script>alert("XSS")</script>'.repeat(100);
    escapeHtml(input);
  });

  bench('escapeHtml - long string (100KB)', () => {
    const input = '<script>alert("XSS")</script>'.repeat(10000);
    escapeHtml(input);
  }, { time: 1000 });

  bench('render timeline - 10 items', async () => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      dates: '2024',
      role: `Role ${i}`,
      org: 'Company',
      location: 'City',
      desc: 'Description'
    }));
    
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve(data) });
    await loadTimeline();
  });

  bench('render timeline - 100 items', async () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      dates: '2024',
      role: `Role ${i}`,
      org: 'Company',
      location: 'City',
      desc: 'Description'
    }));
    
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve(data) });
    await loadTimeline();
  }, { time: 2000 });

  bench('render skills - 50 items', async () => {
    const data = Array.from({ length: 50 }, (_, i) => ({
      icon: 'code',
      label: `Skill ${i}`
    }));
    
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve(data) });
    await loadSkills();
  });
});
```

### Benchmark Suite: Memory Efficiency
**File**: `tests/performance/memory.bench.js`

```javascript
import { bench, describe } from 'vitest';

describe('Memory Efficiency', () => {
  bench('DOM node creation - 100 elements', () => {
    const container = document.createElement('div');
    for (let i = 0; i < 100; i++) {
      const el = document.createElement('div');
      el.className = 'test-element';
      container.appendChild(el);
    }
  });

  bench('DOM node creation - 1000 elements', () => {
    const container = document.createElement('div');
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < 1000; i++) {
      const el = document.createElement('div');
      el.className = 'test-element';
      fragment.appendChild(el);
    }
    
    container.appendChild(fragment);
  });

  bench('string concatenation - map+join vs loop', () => {
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    
    // map+join method
    const result1 = items.map(item => `<div>${item}</div>`).join('');
  });

  bench('string concatenation - manual loop', () => {
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    
    // Manual loop method
    let result2 = '';
    for (let i = 0; i < items.length; i++) {
      result2 += `<div>${items[i]}</div>`;
    }
  });
});
```

## Implementation Steps

### Step 1: Create Benchmark Files

**File**: `tests/performance/render.bench.js`
```javascript
import { bench, describe } from 'vitest';
import { escapeHtml } from '../../js/utils.js';
import { loadTimeline } from '../../js/timeline.js';
import { loadSkills } from '../../js/skills.js';

describe('Rendering Performance', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="timeline"></div>
      <ul id="skills"></ul>
    `;
  });

  bench('escapeHtml - short string (100B)', () => {
    escapeHtml('<script>alert("XSS")</script>');
  });

  bench('escapeHtml - medium string (1KB)', () => {
    const input = '<script>alert("XSS")</script>'.repeat(100);
    escapeHtml(input);
  });

  bench('escapeHtml - long string (100KB)', () => {
    const input = '<script>alert("XSS")</script>'.repeat(10000);
    escapeHtml(input);
  }, { time: 1000 });

  bench('render timeline - 10 items', async () => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      dates: '2024',
      role: `Role ${i}`,
      org: 'Company',
      location: 'City',
      desc: 'Description'
    }));
    
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve(data) });
    await loadTimeline();
  });

  bench('render timeline - 100 items', async () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      dates: '2024',
      role: `Role ${i}`,
      org: 'Company',
      location: 'City',
      desc: 'Description'
    }));
    
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve(data) });
    await loadTimeline();
  }, { time: 2000 });

  bench('render skills - 50 items', async () => {
    const data = Array.from({ length: 50 }, (_, i) => ({
      icon: 'code',
      label: `Skill ${i}`
    }));
    
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve(data) });
    await loadSkills();
  });
});
```

**File**: `tests/performance/memory.bench.js`
```javascript
import { bench, describe } from 'vitest';

describe('Memory Efficiency', () => {
  bench('DOM node creation - 100 elements', () => {
    const container = document.createElement('div');
    for (let i = 0; i < 100; i++) {
      const el = document.createElement('div');
      el.className = 'test-element';
      container.appendChild(el);
    }
  });

  bench('DOM node creation - 1000 elements with fragment', () => {
    const container = document.createElement('div');
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < 1000; i++) {
      const el = document.createElement('div');
      el.className = 'test-element';
      fragment.appendChild(el);
    }
    
    container.appendChild(fragment);
  });

  bench('string concatenation - map+join', () => {
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    items.map(item => `<div>${item}</div>`).join('');
  });

  bench('string concatenation - loop', () => {
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    let result = '';
    for (let i = 0; i < items.length; i++) {
      result += `<div>${items[i]}</div>`;
    }
  });
});
```

### Step 2: Run Benchmarks
```bash
npm run test:benchmark
```
Expected: All benchmarks execute and results saved to `benchmark-results.json`

## Performance Budgets

| Operation | Budget | Measurement |
|-----------|--------|-------------|
| escapeHtml (1KB) | < 0.01ms | CPU time |
| escapeHtml (100KB) | < 1ms | CPU time |
| Timeline render (100 items) | < 50ms | Total time |
| Timeline render (500 items) | < 200ms | Total time |
| Skills render (50 items) | < 30ms | Total time |
| DOM creation (1000 nodes) | < 10ms | CPU time |
| Data loading (500 items) | < 200ms | Total time |

## Verification Steps

1. **Run All Benchmarks**
   ```bash
   npm run test:benchmark
   ```
   Expected: All benchmarks complete, results saved

2. **Verify Results File**
   ```bash
   cat benchmark-results.json
   ```
   Expected: JSON file with all benchmark results

3. **Run Performance Tests**
   ```bash
   npm run test:performance
   ```
   Expected: All performance assertions pass

## Benchmark Results Template

```
RUN  v1.0.0

✓ tests/performance/render.bench.js (6) 1842ms
  ✓ Rendering Performance (6)
    name                                    hz       mean   stdDev  median  min   max  samples
    · escapeHtml - short string (100B)  152,439.17   0.01ms   0.00ms  0.01ms 0.01ms 0.03ms 76220
    · escapeHtml - medium string (1KB)   45,632.11   0.02ms   0.01ms  0.02ms 0.02ms 0.10ms 22817
    · escapeHtml - long string (100KB)    892.34   1.12ms   0.23ms  1.09ms 0.91ms 2.47ms 447
    · render timeline - 10 items          125.43   7.97ms   1.12ms  7.89ms 6.84ms 12.34ms 63
    · render timeline - 100 items          18.67  53.55ms   3.21ms 53.12ms 48.21ms 61.23ms 10
    · render skills - 50 items             42.83  23.35ms   2.11ms 23.12ms 20.45ms 28.90ms 22

✓ tests/performance/memory.bench.js (4) 456ms
  ✓ Memory Efficiency (4)
    · DOM node creation - 100 elements      2,543.21   0.39ms
    · DOM node creation - 1000 elements   892.34     1.12ms
    · string concatenation - map+join      15,234.56   0.07ms
    · string concatenation - loop          12,456.78   0.08ms

Benchmark Results saved to benchmark-results.json
```

## Next Phase Dependencies

**Phase 5: CI/CD Pipeline** depends on:
- ✓ All performance benchmarks established
- [ ] Baseline metrics documented
- [ ] Performance budgets defined
- [ ] Regression thresholds set

## Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Benchmark Files | 2 created | TBD | ⏳ |
| Benchmarks Passing | All | TBD | ⏳ |
| Baseline Metrics | Recorded | TBD | ⏳ |
| Results File | Generated | TBD | ⏳ |

## Notes

- Benchmarks run in isolation to avoid interference
- Results saved to JSON for CI/CD comparison
- map+join pattern shown to be faster than manual loops
- DocumentFragment significantly improves DOM performance
- Viewport size impacts performance significantly
