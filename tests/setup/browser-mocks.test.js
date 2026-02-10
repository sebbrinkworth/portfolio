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
