# Phase 2: Theme System

## Overview
Implement the dark/light theme toggle functionality with comprehensive tests for localStorage integration and DOM manipulation.

## Prerequisites
- [x] Phase 0: Project Setup & Infrastructure complete
- [x] Phase 1: Core Utilities complete (escapeHtml tested)
- [x] localStorage mock available
- [x] Testing patterns established

## Objectives
1. Implement `initTheme()` function
2. Test localStorage persistence
3. Test DOM class manipulation
4. Test theme toggle functionality

## TDD Approach

### Red Phase - Write Tests First
1. Create `tests/unit/theme.test.js` with all test cases
2. Mock DOM elements (themeToggle, themeIcon)
3. Mock localStorage
4. Run tests to confirm they fail

### Green Phase - Implement Function
1. Create `js/theme.js` with minimal implementation
2. Handle stored theme on initialization
3. Implement toggle click handler
4. Run tests until all pass

### Refactor Phase - Optimize
1. Review for performance bottlenecks
2. Add timing assertions

## Acceptance Criteria

- [ ] 4 test cases pass
- [ ] localStorage theme persistence works
- [ ] DOM classes toggle correctly
- [ ] 100% code coverage

## Test Specifications

### Test Suite: Theme System
**File**: `tests/unit/theme.test.js`

#### Test 1: Initialize with Stored Dark Theme
```javascript
it('applies stored dark theme on initialization', () => {
  localStorage.setItem('theme', 'dark');
  initTheme();
  
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(document.getElementById('themeIcon').textContent).toBe('light_mode');
});
```

#### Test 2: Initialize with Stored Light Theme
```javascript
it('applies stored light theme on initialization', () => {
  localStorage.setItem('theme', 'light');
  initTheme();
  
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  expect(document.getElementById('themeIcon').textContent).toBe('dark_mode');
});
```

#### Test 3: Toggle to Dark Theme
```javascript
it('toggles to dark theme on button click', () => {
  initTheme();
  const btn = document.getElementById('themeToggle');
  
  btn.click();
  
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(localStorage.getItem('theme')).toBe('dark');
  expect(document.getElementById('themeIcon').textContent).toBe('light_mode');
});
```

#### Test 4: Toggle to Light Theme
```javascript
it('toggles to light theme on button click', () => {
  localStorage.setItem('theme', 'dark');
  initTheme();
  const btn = document.getElementById('themeToggle');
  
  btn.click();
  
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  expect(localStorage.getItem('theme')).toBe('light');
  expect(document.getElementById('themeIcon').textContent).toBe('dark_mode');
});
```



## Implementation Steps

### Step 1: Write Failing Tests

**File**: `tests/unit/theme.test.js`
```javascript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { initTheme } from '../../js/theme.js';
import { createLocalStorageMock } from '../setup/mocks/local-storage.js';

describe('initTheme', () => {
  let mockStorage;
  
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <button id="themeToggle"></button>
      <span id="themeIcon"></span>
    `;
    
    // Reset classes
    document.documentElement.className = '';
    
    // Mock localStorage
    mockStorage = createLocalStorageMock();
    vi.stubGlobal('localStorage', mockStorage);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
    mockStorage.clear();
  });

  it('applies stored dark theme on initialization', () => {
    mockStorage.setItem('theme', 'dark');
    initTheme();
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.getElementById('themeIcon').textContent).toBe('light_mode');
  });

  it('applies stored light theme on initialization', () => {
    mockStorage.setItem('theme', 'light');
    initTheme();
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.getElementById('themeIcon').textContent).toBe('dark_mode');
  });

  it('toggles to dark theme on button click', () => {
    initTheme();
    const btn = document.getElementById('themeToggle');
    
    btn.click();
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(mockStorage.getItem('theme')).toBe('dark');
    expect(document.getElementById('themeIcon').textContent).toBe('light_mode');
  });

  it('toggles to light theme on button click', () => {
    mockStorage.setItem('theme', 'dark');
    initTheme();
    const btn = document.getElementById('themeToggle');
    
    btn.click();
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(mockStorage.getItem('theme')).toBe('light');
    expect(document.getElementById('themeIcon').textContent).toBe('dark_mode');
  });


});
```

### Step 2: Run Tests (Should Fail)
```bash
npm test tests/unit/theme.test.js
```
Expected: 4 failing tests (module not found or undefined function)

### Step 3: Implement Function

**File**: `js/theme.js`
```javascript
/**
 * Initialize theme toggle functionality
 * Handles localStorage persistence and DOM class toggling.
 * 
 * @returns {void}
 */
export function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  // Apply stored theme on initialization
  const stored = localStorage.getItem("theme");
  if (stored === "dark") {
    root.classList.add("dark");
  } else if (stored === "light") {
    root.classList.remove("dark");
  }

  // Sync icon with current theme
  const syncIcon = () => {
    if (!icon) return;
    icon.textContent = root.classList.contains("dark") 
      ? "light_mode" 
      : "dark_mode";
  };

  syncIcon();

  // Exit early if toggle button doesn't exist
  if (!btn) return;

  // Toggle click handler
  btn.addEventListener("click", () => {
    root.classList.toggle("dark");
    localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
    syncIcon();
  });
}
```

### Step 4: Run Tests (Should Pass)
```bash
npm test tests/unit/theme.test.js
```
Expected: ✓ 8 passing tests

### Step 5: Verify Coverage
```bash
npm run test:coverage -- tests/unit/theme.test.js
```
Expected: 100% coverage

## Verification Steps

1. **Run All Theme Tests**
   ```bash
   npm test tests/unit/theme.test.js
   ```
Expected: ✓ 4 passing tests

2. **Verify Coverage**
   ```bash
   npm run test:coverage -- tests/unit/theme.test.js
   ```
   Expected: 100% coverage for theme.js

3. **Test Edge Cases**
   ```bash
   npm test -- --reporter=verbose tests/unit/theme.test.js
   ```
   Expected: All edge cases documented

## Test Results Template

```
PASS  tests/unit/theme.test.js
  initTheme
    ✓ applies stored dark theme on initialization (3ms)
    ✓ applies stored light theme on initialization (2ms)
    ✓ toggles to dark theme on button click (1ms)
    ✓ toggles to light theme on button click (1ms)

Test Files: 1 passed, 1 total
Tests:       4 passed, 4 total
Duration:    0.8s

Coverage:
File         | % Stmts | % Branch | % Funcs | % Lines |
-------------|---------|----------|---------|---------|
js/theme.js  | 100.00  | 100.00   | 100.00  | 100.00  |
```

## Next Phase Dependencies

**Phase 3: Data Loading** depends on:
- ✓ Theme system implemented and tested
- ✓ localStorage mocking patterns established
- ✓ DOM manipulation tests working

## Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Tests Passing | 4/4 | TBD | ⏳ |
| Code Coverage | 100% | TBD | ⏳ |
| localStorage Integration | Working | TBD | ⏳ |

## Notes

- All DOM element lookups use `getElementById` for O(1) performance
- Early return if toggle button missing allows graceful degradation
- Icon sync is extracted as function for reusability
