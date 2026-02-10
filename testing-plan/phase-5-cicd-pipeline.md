# Phase 5: CI/CD Pipeline

## Overview
Implement continuous integration and deployment pipeline with automated testing, performance monitoring, and quality gates. Ensures all code changes meet testing and performance standards.

## Prerequisites
- [x] Phase 0-4: All testing phases complete
- [x] All tests passing (60+ tests)
- [x] 100% code coverage achieved
- [x] Performance benchmarks established

## Objectives
1. Create GitHub Actions workflow for CI/CD
2. Configure automated test execution on push/PR
3. Setup coverage reporting with thresholds
4. Configure performance regression detection
5. Document deployment process

## TDD Approach

### Red Phase - Write Pipeline Configuration
1. Create `.github/workflows/test.yml`
2. Define test matrix (Node versions)
3. Configure coverage thresholds
4. Setup performance regression detection
5. Define deployment triggers

### Green Phase - Validate Pipeline
1. Push configuration to repository
2. Verify workflow triggers on PR
3. Confirm all tests execute in CI
4. Verify coverage reports upload
5. Test deployment flow

### Refactor Phase - Optimize Pipeline
1. Cache dependencies for speed
2. Parallelize test execution
3. Optimize workflow runtime
4. Add notifications on failure

## Acceptance Criteria

- [ ] GitHub Actions workflow created
- [ ] Tests execute automatically on push/PR
- [ ] Coverage reports generated and uploaded
- [ ] Performance benchmarks compared
- [ ] All quality gates pass (coverage > 80%)
- [ ] Deployment automated on main branch
- [ ] Pipeline completes in < 5 minutes

## CI/CD Configuration

### Workflow: Automated Testing
**File**: `.github/workflows/test.yml`

```yaml
name: Tests & Quality Gates

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Run performance benchmarks
        run: npm run test:benchmark
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      
      - name: Upload benchmark results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results-${{ matrix.node-version }}
          path: benchmark-results.json

  quality-gates:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check code coverage
        run: |
          npm run test:coverage -- --reporter=text-summary
          # Verify coverage meets thresholds
          grep -E "(Statements|Branches|Functions|Lines)" coverage/text-summary.txt | \
          awk -F'|' '{gsub(/%/, "", $2); if($2 < 80) exit 1}'
      
      - name: Verify performance budgets
        run: |
          npm run test:benchmark
          # Check benchmark results meet budgets
          node -e "
            const results = require('./benchmark-results.json');
            const failed = results.suites.some(suite => 
              suite.benches.some(bench => bench.mean > bench.budget)
            );
            if (failed) process.exit(1);
          "

  deploy:
    needs: [test, quality-gates]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy to production
        run: |
          echo "Deployment would happen here"
          # Add your deployment commands
          # e.g., rsync, aws s3 sync, vercel deploy, etc.
```

## Implementation Steps

### Step 1: Create GitHub Actions Directory
```bash
mkdir -p .github/workflows
```

### Step 2: Create Workflow File
**File**: `.github/workflows/test.yml`
```yaml
name: Tests & Quality Gates

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Run performance benchmarks
        run: npm run test:benchmark
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
      
      - name: Upload benchmark results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: benchmark-results.json

  quality-gates:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check coverage thresholds
        run: |
          npm run test:coverage
          # Coverage threshold: 80%
          node -e "
            const fs = require('fs');
            const summary = fs.readFileSync('./coverage/coverage-summary.json', 'utf8');
            const coverage = JSON.parse(summary);
            const total = coverage.total;
            
            const thresholds = {
              lines: 80,
              statements: 80,
              functions: 80,
              branches: 70
            };
            
            let failed = false;
            for (const [metric, threshold] of Object.entries(thresholds)) {
              const actual = total[metric].pct;
              if (actual < threshold) {
                console.error(\`Coverage \${metric}: \${actual}% (threshold: \${threshold}%)\`);
                failed = true;
              }
            }
            
            if (failed) {
              console.error('Coverage thresholds not met!');
              process.exit(1);
            } else {
              console.log('All coverage thresholds met!');
            }
          "
```

### Step 3: Create Coverage Configuration
**File**: `vitest.config.js` (update coverage section)
```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov', 'json-summary'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 70,
    statements: 80
  },
  exclude: [
    'tests/**',
    '**/*.test.js',
    '**/*.bench.js',
    '**/node_modules/**'
  ]
}
```

### Step 4: Add Package Scripts
**File**: `package.json` (update scripts section)
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:benchmark": "vitest bench",
    "test:performance": "vitest run tests/performance/",
    "test:ci": "vitest run --coverage --reporter=verbose"
  }
}
```

### Step 5: Add Pre-commit Hooks (Optional)
**File**: `.husky/pre-commit` (if using husky)
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm test
```

### Step 6: Test Pipeline
1. Push changes to repository
2. Create a pull request
3. Verify workflow triggers
4. Check all jobs complete successfully

## Quality Gates

### Coverage Thresholds
| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| Lines | 80% | Fail CI if below |
| Statements | 80% | Fail CI if below |
| Functions | 80% | Fail CI if below |
| Branches | 70% | Fail CI if below |

### Performance Budgets
| Operation | Budget | Enforcement |
|-----------|--------|-------------|
| Full test suite | < 30s | Warn if exceeded |
| DOM operations | < 10ms | Fail if exceeded |
| Render 100 items | < 50ms | Fail if exceeded |

### Test Requirements
| Category | Minimum | Enforcement |
|----------|---------|-------------|
| Unit tests | 60+ | Track count |
| Performance tests | 10+ | Track count |
| Visual tests | 15+ | Track count |
| Total coverage | 80%+ | Fail CI if below |

## Verification Steps

1. **Test Workflow Syntax**
   ```bash
   # Use actionlint or similar tool
   actionlint .github/workflows/test.yml
   ```

2. **Push to Repository**
   ```bash
   git add .github/workflows/test.yml
   git commit -m "Add CI/CD pipeline"
   git push origin main
   ```

3. **Verify Workflow Execution**
   - Check Actions tab in GitHub
   - Verify workflow triggers
   - Confirm all jobs complete

4. **Test Pull Request**
   - Create test PR
   - Verify checks run automatically
   - Confirm status reports

5. **Check Coverage Reports**
   - Verify Codecov receives data
   - Check coverage badge updates
   - Confirm threshold enforcement

## Test Results Template

```
✅ Tests & Quality Gates — Passed

Jobs:
✓ test (Node 18.x) — Passed in 2m 34s
✓ test (Node 20.x) — Passed in 2m 12s
✓ quality-gates — Passed in 1m 45s

Coverage:
Statements: 95.43% ✅ (threshold: 80%)
Branches: 87.21% ✅ (threshold: 70%)
Functions: 92.18% ✅ (threshold: 80%)
Lines: 95.12% ✅ (threshold: 80%)

Performance:
✓ All benchmarks within budget
✓ Test suite < 30s
✓ No performance regressions detected

Artifacts:
✓ benchmark-results.json uploaded
✓ coverage report uploaded
```

## Deployment Strategy

### Staging Deployment
```yaml
# .github/workflows/staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          # Deploy commands here
          echo "Deploying to staging..."
```

### Production Deployment
```yaml
# .github/workflows/production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-production:
    needs: [test, quality-gates]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Production deploy commands
          echo "Deploying to production..."
```

## Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| CI/CD Workflow | Created | TBD | ⏳ |
| Auto Tests on PR | Working | TBD | ⏳ |
| Coverage Upload | Working | TBD | ⏳ |
| Quality Gates | Enforced | TBD | ⏳ |
| Pipeline Runtime | < 5 min | TBD | ⏳ |
| Node Versions | 18, 20 | TBD | ⏳ |

## Monitoring & Alerts

### Recommended Integrations
- **Codecov**: Coverage tracking and badges
- **GitHub Actions**: Workflow automation
- **Dependabot**: Dependency updates
- **CodeQL**: Security scanning

### Notifications
- Slack/Discord on failure
- Email on coverage drop
- PR comments with test results

## Notes

- Caching npm dependencies reduces install time by ~60%
- Parallel test jobs improve overall pipeline speed
- Coverage thresholds prevent quality degradation
- Benchmark artifacts enable performance trend analysis
- All quality gates must pass before deployment
- Node 18.x and 20.x tested for compatibility
