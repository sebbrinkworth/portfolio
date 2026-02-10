import { vi } from 'vitest';

export function createFetchMock() {
  return vi.fn((url) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    });
  });
}

export function createFetchMockWithResponse(data, options = {}) {
  return vi.fn((url) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      ...options,
    });
  });
}
