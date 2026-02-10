# Phase 3: Data Loading & Rendering

## Overview
Implement data loading for timeline and skills sections. Tests fetch API integration, JSON parsing, HTML generation with escapeHtml, and DOM rendering performance.

## Prerequisites
- [x] Phase 0: Project Setup & Infrastructure complete
- [x] Phase 1: Core Utilities complete (escapeHtml tested)
- [x] Phase 2: Theme System complete (localStorage tested)
- [x] fetch API mock available
- [x] escapeHtml function implemented and tested

## Objectives
1. Implement `loadTimeline()` function
2. Implement `loadSkills()` function
3. Test fetch API error handling
4. Test JSON parsing
5. Test HTML generation with XSS protection
6. Test DOM rendering performance (< 50ms for 100 items)
7. Test alternating layout classes (left/right)

## TDD Approach

### Red Phase - Write Tests First
1. Create `tests/unit/timeline.test.js` with all test cases
2. Create `tests/unit/skills.test.js` with all test cases
3. Mock fetch API with various responses (success, empty, error)
4. Mock escapeHtml from Phase 1
5. Run tests to confirm they fail

### Green Phase - Implement Functions
1. Create `js/timeline.js` with fetch and render logic
2. Create `js/skills.js` with fetch and render logic
3. Use escapeHtml for all dynamic content
4. Implement error handling
5. Run tests until all pass

### Refactor Phase - Optimize
1. Batch DOM operations for performance
2. Optimize HTML string building
3. Add benchmarks for large datasets

## Acceptance Criteria

- [ ] 10 test cases pass for timeline
- [ ] 6 test cases pass for skills
- [ ] fetch API properly mocked and tested
- [ ] All dynamic content escaped (XSS protection)
- [ ] Alternating left/right layout for timeline
- [ ] Error handling works (console.error on failure)
- [ ] Rendering < 50ms for 100 items
- [ ] 100% code coverage for both modules

## Test Specifications

### Test Suite: Timeline Loading
**File**: `tests/unit/timeline.test.js`

#### Test 1: Load and Render Timeline
```javascript
it('loads timeline from JSON and renders to DOM', async () => {
  const mockData = [{
    dates: '2024 - Present',
    role: 'Developer',
    org: 'Company',
    location: 'City',
    desc: 'Description'
  }];
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve(mockData) })
  );
  
  await loadTimeline();
  
  const timeline = document.getElementById('timeline');
  expect(timeline.querySelectorAll('.t-item')).toHaveLength(1);
});
```

#### Test 2: Render Correct HTML Structure
```javascript
it('renders correct HTML structure with all fields', async () => {
  const mockData = [{
    dates: '2024 - Present',
    role: 'Developer',
    org: 'Company',
    location: 'City',
    desc: 'Description'
  }];
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve(mockData) })
  );
  
  await loadTimeline();
  
  const item = document.querySelector('.t-item');
  expect(item.querySelector('.t-date').textContent).toBe('2024 - Present');
  expect(item.querySelector('.t-content h3').textContent).toBe('Developer');
  expect(item.querySelector('.t-meta').textContent).toBe('Company — City');
  expect(item.querySelector('.t-desc').textContent).toBe('Description');
  expect(item.querySelector('.t-dot')).toBeTruthy();
});
```

#### Test 3: Alternating Left/Right Layout
```javascript
it('renders alternating left/right classes', async () => {
  const mockData = [
    { dates: '2024', role: 'R1', org: 'O1', location: 'L1', desc: 'D1' },
    { dates: '2023', role: 'R2', org: 'O2', location: 'L2', desc: 'D2' },
    { dates: '2022', role: 'R3', org: 'O3', location: 'L3', desc: 'D3' }
  ];
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve(mockData) })
  );
  
  await loadTimeline();
  
  const items = document.querySelectorAll('.t-item');
  expect(items[0].classList.contains('right')).toBe(true);
  expect(items[1].classList.contains('left')).toBe(true);
  expect(items[2].classList.contains('right')).toBe(true);
});
```

#### Test 4: Escape HTML to Prevent XSS
```javascript
it('escapes HTML content to prevent XSS', async () => {
  const mockData = [{
    dates: '<script>alert(1)</script>',
    role: '<img src=x onerror=alert(2)>',
    org: 'Company',
    location: 'City',
    desc: 'Description'
  }];
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve(mockData) })
  );
  
  await loadTimeline();
  
  const timeline = document.getElementById('timeline');
  const html = timeline.innerHTML;
  
  expect(html).toContain('&lt;script&gt;');
  expect(html).not.toContain('<script>');
  expect(html).toContain('&lt;img');
  expect(html).not.toContain('<img src=x onerror');
});
```

#### Test 5: Handle Empty Timeline
```javascript
it('handles empty timeline gracefully', async () => {
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve([]) })
  );
  
  await loadTimeline();
  
  const timeline = document.getElementById('timeline');
  expect(timeline.innerHTML).toBe('');
});
```

#### Test 6: Handle Missing Timeline Element
```javascript
it('exits gracefully if timeline element missing', async () => {
  document.body.innerHTML = ''; // Remove timeline element
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve([{dates: '2024'}]) })
  );
  
  // Should not throw
  await expect(loadTimeline()).resolves.not.toThrow();
});
```

#### Test 7: Handle Fetch Error
```javascript
it('logs error when fetch fails', async () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
  
  await loadTimeline();
  
  expect(consoleSpy).toHaveBeenCalledWith('Failed to load timeline:', expect.any(Error));
  consoleSpy.mockRestore();
});
```

#### Test 8: Handle Invalid JSON
```javascript
it('logs error when JSON is invalid', async () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ 
      json: () => Promise.reject(new Error('Invalid JSON')) 
    })
  );
  
  await loadTimeline();
  
  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});
```

#### Test 9: Performance Budget (100 items < 50ms)
```javascript
it('renders 100 items within 50ms', async () => {
  const mockData = Array.from({ length: 100 }, (_, i) => ({
    dates: `${2024 - i}`,
    role: `Role ${i}`,
    org: `Company ${i}`,
    location: `City ${i}`,
    desc: `Description ${i}`
  }));
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve(mockData) })
  );
  
  const start = performance.now();
  await loadTimeline();
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(50);
  expect(document.querySelectorAll('.t-item')).toHaveLength(100);
});
```

#### Test 10: Render Many Items Without Blocking
```javascript
it('renders large dataset efficiently', async () => {
  const mockData = Array.from({ length: 500 }, (_, i) => ({
    dates: `${2024 - i}`,
    role: `Role ${i}`,
    org: `Company ${i}`,
    location: `City ${i}`,
    desc: `Description ${i}`
  }));
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve(mockData) })
  );
  
  const start = performance.now();
  await loadTimeline();
  const duration = performance.now() - start;
  
  // Should still complete in reasonable time (not blocking)
  expect(duration).toBeLessThan(200);
  expect(document.querySelectorAll('.t-item')).toHaveLength(500);
});
```

### Test Suite: Skills Loading
**File**: `tests/unit/skills.test.js`

#### Test 1: Load and Render Skills
```javascript
it('loads skills from JSON and renders to DOM', async () => {
  const mockData = [
    { icon: 'code', label: 'JavaScript' },
    { icon: 'web', label: 'HTML' }
  ];
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve(mockData) })
  );
  
  await loadSkills();
  
  const skills = document.getElementById('skills');
  expect(skills.querySelectorAll('.skill')).toHaveLength(2);
});
```

#### Test 2: Render Correct Structure
```javascript
it('renders correct HTML structure', async () => {
  const mockData = [{ icon: 'code', label: 'JavaScript' }];
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve(mockData) })
  );
  
  await loadSkills();
  
  const skill = document.querySelector('.skill');
  expect(skill.querySelector('.ms').textContent).toBe('code');
  expect(skill.querySelector('span:last-child').textContent).toBe('JavaScript');
});
```

#### Test 3: Escape HTML Content
```javascript
it('escapes HTML in skills data', async () => {
  const mockData = [{ 
    icon: '<script>alert(1)</script>', 
    label: '<img src=x onerror=alert(2)>' 
  }];
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve(mockData) })
  );
  
  await loadSkills();
  
  const skills = document.getElementById('skills');
  const html = skills.innerHTML;
  
  expect(html).toContain('&lt;script&gt;');
  expect(html).not.toContain('<script>');
});
```

#### Test 4: Handle Empty Skills
```javascript
it('handles empty skills gracefully', async () => {
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve([]) })
  );
  
  await loadSkills();
  
  const skills = document.getElementById('skills');
  expect(skills.innerHTML).toBe('');
});
```

#### Test 5: Handle Missing Skills Element
```javascript
it('exits gracefully if skills element missing', async () => {
  document.body.innerHTML = '';
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve([{icon: 'code'}]) })
  );
  
  await expect(loadSkills()).resolves.not.toThrow();
});
```

#### Test 6: Performance Budget (50 items < 30ms)
```javascript
it('renders 50 skills within 30ms', async () => {
  const mockData = Array.from({ length: 50 }, (_, i) => ({
    icon: 'code',
    label: `Skill ${i}`
  }));
  
  global.fetch = vi.fn(() => 
    Promise.resolve({ json: () => Promise.resolve(mockData) })
  );
  
  const start = performance.now();
  await loadSkills();
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(30);
  expect(document.querySelectorAll('.skill')).toHaveLength(50);
});
```

## Implementation Steps

### Step 1: Write Failing Tests

**File**: `tests/unit/timeline.test.js`
```javascript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { loadTimeline } from '../../js/timeline.js';

describe('loadTimeline', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="timeline"></div>';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads timeline from JSON and renders to DOM', async () => {
    const mockData = [{
      dates: '2024 - Present',
      role: 'Developer',
      org: 'Company',
      location: 'City',
      desc: 'Description'
    }];
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    );
    
    await loadTimeline();
    
    const timeline = document.getElementById('timeline');
    expect(timeline.querySelectorAll('.t-item')).toHaveLength(1);
  });

  it('renders correct HTML structure with all fields', async () => {
    const mockData = [{
      dates: '2024 - Present',
      role: 'Developer',
      org: 'Company',
      location: 'City',
      desc: 'Description'
    }];
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    );
    
    await loadTimeline();
    
    const item = document.querySelector('.t-item');
    expect(item.querySelector('.t-date').textContent).toBe('2024 - Present');
    expect(item.querySelector('.t-content h3').textContent).toBe('Developer');
    expect(item.querySelector('.t-meta').textContent).toBe('Company — City');
    expect(item.querySelector('.t-desc').textContent).toBe('Description');
  });

  it('renders alternating left/right classes', async () => {
    const mockData = [
      { dates: '2024', role: 'R1', org: 'O1', location: 'L1', desc: 'D1' },
      { dates: '2023', role: 'R2', org: 'O2', location: 'L2', desc: 'D2' },
      { dates: '2022', role: 'R3', org: 'O3', location: 'L3', desc: 'D3' }
    ];
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    );
    
    await loadTimeline();
    
    const items = document.querySelectorAll('.t-item');
    expect(items[0].classList.contains('right')).toBe(true);
    expect(items[1].classList.contains('left')).toBe(true);
    expect(items[2].classList.contains('right')).toBe(true);
  });

  it('escapes HTML content to prevent XSS', async () => {
    const mockData = [{
      dates: '<script>alert(1)</script>',
      role: '<img src=x onerror=alert(2)>',
      org: 'Company',
      location: 'City',
      desc: 'Description'
    }];
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    );
    
    await loadTimeline();
    
    const timeline = document.getElementById('timeline');
    const html = timeline.innerHTML;
    
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('handles empty timeline gracefully', async () => {
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve([]) })
    );
    
    await loadTimeline();
    
    const timeline = document.getElementById('timeline');
    expect(timeline.innerHTML).toBe('');
  });

  it('exits gracefully if timeline element missing', async () => {
    document.body.innerHTML = '';
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve([{dates: '2024'}]) })
    );
    
    await expect(loadTimeline()).resolves.not.toThrow();
  });

  it('logs error when fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
    
    await loadTimeline();
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load timeline:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('logs error when JSON is invalid', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ 
        json: () => Promise.reject(new Error('Invalid JSON')) 
      })
    );
    
    await loadTimeline();
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('renders 100 items within 50ms', async () => {
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      dates: `${2024 - i}`,
      role: `Role ${i}`,
      org: `Company ${i}`,
      location: `City ${i}`,
      desc: `Description ${i}`
    }));
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    );
    
    const start = performance.now();
    await loadTimeline();
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50);
    expect(document.querySelectorAll('.t-item')).toHaveLength(100);
  });

  it('renders large dataset efficiently', async () => {
    const mockData = Array.from({ length: 500 }, (_, i) => ({
      dates: `${2024 - i}`,
      role: `Role ${i}`,
      org: `Company ${i}`,
      location: `City ${i}`,
      desc: `Description ${i}`
    }));
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    );
    
    const start = performance.now();
    await loadTimeline();
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(200);
    expect(document.querySelectorAll('.t-item')).toHaveLength(500);
  });
});
```

**File**: `tests/unit/skills.test.js`
```javascript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { loadSkills } from '../../js/skills.js';

describe('loadSkills', () => {
  beforeEach(() => {
    document.body.innerHTML = '<ul id="skills"></ul>';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads skills from JSON and renders to DOM', async () => {
    const mockData = [
      { icon: 'code', label: 'JavaScript' },
      { icon: 'web', label: 'HTML' }
    ];
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    );
    
    await loadSkills();
    
    const skills = document.getElementById('skills');
    expect(skills.querySelectorAll('.skill')).toHaveLength(2);
  });

  it('renders correct HTML structure', async () => {
    const mockData = [{ icon: 'code', label: 'JavaScript' }];
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    );
    
    await loadSkills();
    
    const skill = document.querySelector('.skill');
    expect(skill.querySelector('.ms').textContent).toBe('code');
  });

  it('escapes HTML in skills data', async () => {
    const mockData = [{ 
      icon: '<script>alert(1)</script>', 
      label: '<img src=x onerror=alert(2)>' 
    }];
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    );
    
    await loadSkills();
    
    const skills = document.getElementById('skills');
    expect(skills.innerHTML).toContain('&lt;script&gt;');
    expect(skills.innerHTML).not.toContain('<script>');
  });

  it('handles empty skills gracefully', async () => {
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve([]) })
    );
    
    await loadSkills();
    
    const skills = document.getElementById('skills');
    expect(skills.innerHTML).toBe('');
  });

  it('exits gracefully if skills element missing', async () => {
    document.body.innerHTML = '';
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve([{icon: 'code'}]) })
    );
    
    await expect(loadSkills()).resolves.not.toThrow();
  });

  it('renders 50 skills within 30ms', async () => {
    const mockData = Array.from({ length: 50 }, (_, i) => ({
      icon: 'code',
      label: `Skill ${i}`
    }));
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    );
    
    const start = performance.now();
    await loadSkills();
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(30);
    expect(document.querySelectorAll('.skill')).toHaveLength(50);
  });
});
```

### Step 2: Run Tests (Should Fail)
```bash
npm test tests/unit/timeline.test.js tests/unit/skills.test.js
```
Expected: All tests fail (modules not found)

### Step 3: Implement Timeline Function

**File**: `js/timeline.js`
```javascript
import { escapeHtml } from './utils.js';

/**
 * Load and render timeline data from JSON
 * Renders alternating left/right layout
 * All content is escaped to prevent XSS
 * 
 * Performance: < 50ms for 100 items
 * 
 * @returns {Promise<void>}
 */
export async function loadTimeline() {
  try {
    const response = await fetch('data/timeline.json');
    const timeline = await response.json();
    
    const timelineEl = document.getElementById("timeline");
    if (!timelineEl) return;
    
    if (timeline.length === 0) {
      timelineEl.innerHTML = '';
      return;
    }
    
    timelineEl.innerHTML = timeline.map((item, i) => {
      const side = i % 2 === 0 ? "right" : "left";
      return `
        <article class="t-item ${side}">
          <div class="t-dot" aria-hidden="true"></div>
          
          <div class="t-date-wrap">
            <span class="t-date">${escapeHtml(item.dates)}</span>
          </div>
          
          <div class="t-content">
            <h3>${escapeHtml(item.role)}</h3>
            <div class="t-meta">${escapeHtml(item.org)} — ${escapeHtml(item.location)}</div>
            <div class="t-desc">${escapeHtml(item.desc)}</div>
          </div>
        </article>
      `;
    }).join("");
  } catch (error) {
    console.error('Failed to load timeline:', error);
  }
}
```

### Step 4: Implement Skills Function

**File**: `js/skills.js`
```javascript
import { escapeHtml } from './utils.js';

/**
 * Load and render skills data from JSON
 * All content is escaped to prevent XSS
 * 
 * Performance: < 30ms for 50 items
 * 
 * @returns {Promise<void>}
 */
export async function loadSkills() {
  try {
    const response = await fetch('data/skills.json');
    const skills = await response.json();
    
    const skillsEl = document.getElementById("skills");
    if (!skillsEl) return;
    
    if (skills.length === 0) {
      skillsEl.innerHTML = '';
      return;
    }
    
    skillsEl.innerHTML = skills.map((s) => `
      <li class="skill">
        <span class="ms" aria-hidden="true">${escapeHtml(s.icon)}</span>
        <span>${escapeHtml(s.label)}</span>
      </li>
    `).join("");
  } catch (error) {
    console.error('Failed to load skills:', error);
  }
}
```

### Step 5: Run Tests (Should Pass)
```bash
npm test tests/unit/timeline.test.js tests/unit/skills.test.js
```
Expected: ✓ 16 passing tests

### Step 6: Verify Coverage
```bash
npm run test:coverage -- tests/unit/timeline.test.js tests/unit/skills.test.js
```
Expected: 100% coverage for both files

## Performance Benchmark

**File**: `tests/performance/data-loading.bench.js`
```javascript
import { bench, describe } from 'vitest';
import { loadTimeline } from '../../js/timeline.js';
import { loadSkills } from '../../js/skills.js';

describe('Data Loading Performance', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="timeline"></div>
      <ul id="skills"></ul>
    `;
  });

  bench('loadTimeline - 10 items', async () => {
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

  bench('loadTimeline - 100 items', async () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      dates: '2024',
      role: `Role ${i}`,
      org: 'Company',
      location: 'City',
      desc: 'Description'
    }));
    
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve(data) });
    await loadTimeline();
  }, { time: 1000 });

  bench('loadSkills - 50 items', async () => {
    const data = Array.from({ length: 50 }, (_, i) => ({
      icon: 'code',
      label: `Skill ${i}`
    }));
    
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve(data) });
    await loadSkills();
  });
});
```

## Verification Steps

1. **Run All Data Tests**
   ```bash
   npm test tests/unit/timeline.test.js tests/unit/skills.test.js
   ```
   Expected: ✓ 16 passing tests (10 timeline + 6 skills)

2. **Verify Coverage**
   ```bash
   npm run test:coverage -- tests/unit/timeline.test.js tests/unit/skills.test.js
   ```
   Expected: 100% coverage for both modules

3. **Run Benchmarks**
   ```bash
   npm run test:benchmark tests/performance/data-loading.bench.js
   ```
   Expected: Performance baselines recorded

4. **Test XSS Protection**
   ```bash
   npm test -- --reporter=verbose tests/unit/timeline.test.js
   ```
   Verify "escapes HTML content to prevent XSS" passes

## Test Results Template

```
PASS  tests/unit/timeline.test.js
  loadTimeline
    ✓ loads timeline from JSON and renders to DOM (3ms)
    ✓ renders correct HTML structure with all fields (2ms)
    ✓ renders alternating left/right classes (2ms)
    ✓ escapes HTML content to prevent XSS (2ms)
    ✓ handles empty timeline gracefully (1ms)
    ✓ exits gracefully if timeline element missing (1ms)
    ✓ logs error when fetch fails (1ms)
    ✓ logs error when JSON is invalid (1ms)
    ✓ renders 100 items within 50ms (35ms)
    ✓ renders large dataset efficiently (145ms)

PASS  tests/unit/skills.test.js
  loadSkills
    ✓ loads skills from JSON and renders to DOM (2ms)
    ✓ renders correct HTML structure (2ms)
    ✓ escapes HTML in skills data (1ms)
    ✓ handles empty skills gracefully (1ms)
    ✓ exits gracefully if skills element missing (1ms)
    ✓ renders 50 skills within 30ms (18ms)

Test Files: 2 passed, 2 total
Tests:       16 passed, 16 total
Duration:    1.2s

Coverage:
File            | % Stmts | % Branch | % Funcs | % Lines |
----------------|---------|----------|---------|---------|
js/timeline.js  | 100.00  | 100.00   | 100.00  | 100.00  |
js/skills.js    | 100.00  | 100.00   | 100.00  | 100.00  |
```

## Next Phase Dependencies

**Phase 4: Vector Field** depends on:
- ✓ Data loading implemented and tested
- ✓ fetch API mocking patterns established
- ✓ Performance testing patterns (< 50ms) established
- ✓ Error handling patterns (console.error) documented
- ✓ DOM batch rendering patterns working

## Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Timeline Tests | 10/10 | TBD | ⏳ |
| Skills Tests | 6/6 | TBD | ⏳ |
| Timeline Coverage | 100% | TBD | ⏳ |
| Skills Coverage | 100% | TBD | ⏳ |
| XSS Protection | Working | TBD | ⏳ |
| 100 Items Performance | < 50ms | TBD | ⏳ |
| 50 Skills Performance | < 30ms | TBD | ⏳ |

## Notes

- escapeHtml is called on every dynamic field for XSS protection
- map().join("") pattern is used for efficient string concatenation
- Early exit if target element not found prevents errors
- console.error with descriptive messages aids debugging
- Performance budgets ensure UI remains responsive
- Alternating layout uses modulo operator (i % 2) for O(1) calculation
