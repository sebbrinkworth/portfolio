import { vi } from 'vitest';

// Global afterEach hook
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  document.body.innerHTML = '';
});
