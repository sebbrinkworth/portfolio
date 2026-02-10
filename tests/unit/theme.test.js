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
