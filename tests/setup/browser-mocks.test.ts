import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Browser API Mocks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('localStorage is mockable', () => {
    const mockStorage = new Map<string, string>();
    const getItem = vi.fn((key: string) => mockStorage.get(key));
    const setItem = vi.fn((key: string, value: string) => { mockStorage.set(key, value); });
    
    setItem('theme', 'dark');
    expect(getItem('theme')).toBe('dark');
  });

  it('fetch is mockable', () => {
    const mockFetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve({}) })
    );
    global.fetch = mockFetch as unknown as typeof fetch;
    
    expect(typeof fetch).toBe('function');
  });

  it('matchMedia is mockable', () => {
    const mockMatchMedia = vi.fn(() => ({ matches: false }));
    global.matchMedia = mockMatchMedia as unknown as typeof matchMedia;
    
    expect(matchMedia('(prefers-reduced-motion: reduce)')).toEqual({ matches: false });
  });
});
