# Vitest TDD Implementation Plan

A comprehensive Test-Driven Development plan for implementing unit tests using Vitest in your portfolio app. Each phase builds upon the previous one, following strict TDD principles.

## Overview

This plan transforms your vanilla HTML/CSS/JS portfolio into a thoroughly tested application with:
- **60+ unit tests** covering all functionality
- **100% code coverage** for all modules
- **Performance benchmarks** ensuring fast load times
- **CI/CD pipeline** with automated quality gates

## Phase Structure

### Phase 0: Project Setup & Infrastructure
**Foundation phase** - Establishes testing infrastructure
- Initialize Node.js project with Vitest
- Configure happy-dom for maximum performance
- Setup mock utilities for browser APIs
- Create test directory structure

**Deliverables:**
- `package.json` with testing dependencies
- `vitest.config.js` optimized for performance
- Mock utilities (localStorage, fetch)
- Global test setup hooks

**Tests:** 2 infrastructure tests

---

### Phase 1: Core Utilities
**Pure function testing** - Establishes TDD patterns
- Implement `escapeHtml()` with XSS protection
- 100% test coverage for utility functions
- Performance benchmarks (< 0.01ms for 1KB)

**Deliverables:**
- `js/utils.js` with escapeHtml function
- `tests/unit/utils.test.js` with 6 test cases
- `tests/performance/utils.bench.js`

**Tests:** 6 unit tests

---

### Phase 2: Theme System
**DOM manipulation testing** - localStorage integration
- Test theme toggle functionality
- Test localStorage persistence

**Deliverables:**
- `js/theme.js` with initTheme function
- `tests/unit/theme.test.js` with test cases

**Tests:** unit tests

---

### Phase 3: Data Loading & Rendering
**Async testing** - fetch API & DOM generation
- Test `loadTimeline()` with alternating layout
- Test `loadSkills()` with icon rendering
- Test XSS protection in all dynamic content
- Test error handling (fetch failures)
- Performance: < 50ms for 100 items

**Deliverables:**
- `js/timeline.js` with data loading
- `js/skills.js` with skills rendering
- `tests/unit/timeline.test.js` with test cases
- `tests/unit/skills.test.js` with test cases
- `tests/performance/data-loading.bench.js`

**Tests:** unit tests

---

### Phase 4: Performance Benchmarks
**Performance regression detection**
- Benchmark all rendering operations
- Benchmark large dataset handling
- Create performance budgets

**Deliverables:**
- `tests/performance/render.bench.js`
- `tests/performance/memory.bench.js`
- `benchmark-results.json`

**Tests:** benchmark tests

---

### Phase 5: CI/CD Pipeline
**Continuous integration**
- GitHub Actions workflow
- Automated test execution
- Coverage reporting (Codecov)
- Performance regression detection
- Quality gates (coverage > 80%)

**Deliverables:**
- `.github/workflows/test.yml`
- Coverage configuration
- Deployment automation

**Tests:** All previous tests run in CI

---

### Phase 5: CI/CD Pipeline
**Continuous integration**
- GitHub Actions workflow
- Automated test execution
- Coverage reporting (Codecov)
- Performance regression detection
- Quality gates (coverage > 80%)

**Deliverables:**
- `.github/workflows/test.yml`
- Coverage configuration
- Deployment automation

**Tests:** All previous tests run in CI

---

## Test Summary

| Phase | Unit Tests | Benchmarks | Total |
|-------|------------|------------|-------|
| 0 | 2 | 0 | 2 |
| 1 | 6 | 3 | 9 |
| 2 | 8 | 2 | 10 |
| 3 | 16 | 3 | 19 |
| 4 | 0 | 10+ | 10+ |
| 5 | 0 | 0 | 0 |
| **Total** | **32+** | **18+** | **50+** |

---

## TDD Workflow

### 1. Red Phase (Write Tests First)
```bash
# Create test file
# Write failing tests
npm test path/to/test.js
# Expect: Tests fail (modules not found or undefined)
```

### 2. Green Phase (Implement Function)
```bash
# Create implementation file
# Write minimal code to make tests pass
npm test path/to/test.js
# Expect: All tests pass
```

### 3. Refactor Phase (Optimize)
```bash
# Review implementation
# Optimize for performance
# Re-run tests to ensure still passing
npm test path/to/test.js
# Expect: All tests pass with better performance
```

### 4. Coverage Verification
```bash
npm run test:coverage -- path/to/test.js
# Expect: 100% coverage for implemented file
```

---

## Performance Budgets

| Operation | Budget | Phase |
|-----------|--------|-------|
| escapeHtml (1KB) | < 0.01ms | 1 |
| escapeHtml (100KB) | < 1ms | 1 |
| Timeline render (100 items) | < 50ms | 3 |
| Skills render (50 items) | < 30ms | 3 |
| DOM node creation (1000) | < 10ms | 4 |
| Data loading (500 items) | < 200ms | 4 |
| Test suite execution | < 30s | CI/CD |

---

## Code Coverage Requirements

| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| Lines | 80% | CI/CD gate |
| Statements | 80% | CI/CD gate |
| Functions | 80% | CI/CD gate |
| Branches | 70% | CI/CD gate |

---

## File Structure After Implementation

```
cv/
├── .github/
│   └── workflows/
│       └── test.yml              # CI/CD pipeline
├── js/
│   ├── utils.js                 # escapeHtml
│   ├── theme.js                 # initTheme
│   ├── timeline.js              # loadTimeline
│   └── skills.js                # loadSkills
├── tests/
│   ├── setup/
│   │   ├── setup.js             # Global test setup
│   │   └── mocks/
│   │       ├── local-storage.js # localStorage mock
│   │       └── fetch.js         # fetch API mock
│   ├── unit/
│   │   ├── utils.test.js        # Phase 1
│   │   ├── theme.test.js        # Phase 2
│   │   ├── timeline.test.js     # Phase 3
│   │   └── skills.test.js       # Phase 3
│   ├── performance/
│   │   ├── utils.bench.js       # Phase 1
│   │   ├── theme.bench.js       # Phase 2
│   │   ├── data-loading.bench.js # Phase 3
│   │   ├── render.bench.js      # Phase 4
│   │   └── memory.bench.js      # Phase 4
│   └── fixtures/
│       ├── timeline.json         # Test data
│       └── skills.json           # Test data
├── testing-plan/
│   ├── phase-0-setup.md
│   ├── phase-1-core-utilities.md
│   ├── phase-2-theme-system.md
│   ├── phase-3-data-loading.md
│   ├── phase-4-performance-benchmarks.md
│   ├── phase-5-cicd-pipeline.md
│   └── README.md                # This file
├── package.json
├── vitest.config.js
└── .gitignore
```

---

## Quick Start

### 1. Start with Phase 0
```bash
cd testing-plan
# Follow phase-0-setup.md instructions
```

### 2. Execute Each Phase
Follow each markdown file in order:
1. Phase 0: Setup
2. Phase 1: Core Utilities
3. Phase 2: Theme System
4. Phase 3: Data Loading
5. Phase 4: Performance Benchmarks
6. Phase 5: CI/CD Pipeline

### 3. Run All Tests
```bash
npm test                    # Unit tests
npm run test:benchmark      # Performance benchmarks
npm run test:coverage       # Coverage report
```

---

## Success Criteria

- ✅ 60+ unit tests passing
- ✅ 100% code coverage for all modules
- ✅ Performance budgets met
- ✅ CI/CD pipeline running on every PR
- ✅ All quality gates passing (coverage > 80%)

---

## Dependencies

### Production
None (vanilla HTML/CSS/JS)

### Development
```json
{
  "vitest": "^1.0.0",
  "@vitest/coverage-v8": "^1.0.0",
  "@vitest/ui": "^1.0.0",
  "happy-dom": "^14.0.0"
}
```

---

## Notes

- Each phase is **self-contained** and can be implemented independently
- Phases **build upon each other** (Phase 2 needs Phase 1 mocks)
- **TDD approach**: Write tests first, then implementation
- **Performance focus**: Every phase includes timing assertions
- **CI/CD ready**: All tests configured for automated execution

---

## Support

For issues or questions about this testing plan:
1. Check the specific phase markdown file
2. Review the test specifications section
3. Verify prerequisites are complete
4. Check test results template for expected output

---

**Total Estimated Time**: 1-2 weeks (1-2 days per phase)

**Team Size**: 1-2 developers

**Difficulty**: Intermediate (requires understanding of DOM, async)
