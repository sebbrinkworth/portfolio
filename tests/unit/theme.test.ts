import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { initTheme } from '../../ts/theme';
import { createLocalStorageMock } from '../setup/mocks/local-storage';
import type { LocalStorageMock } from '../setup/mocks/local-storage';

// Mock the theme transition module to avoid GSAP animation issues
vi.mock('../../ts/theme-transitions', () => ({
  themeTransition: {
    isRunning: vi.fn(() => false),
    transition: vi.fn(async (direction: string) => {
      // Simulate the actual theme change that happens in the real implementation
      const root = document.documentElement;
      const icon = document.getElementById('themeIcon');
      
      if (direction === 'light-to-dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      if (icon) {
        icon.textContent = root.classList.contains('dark') ? 'light_mode' : 'dark_mode';
      }
      
      localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
    })
  }
}));

describe('initTheme', () => {
  let mockStorage: LocalStorageMock;
  
  beforeEach(() => {
    // Reset modules to clear mock state between tests
    vi.clearAllMocks();
    
    // Setup DOM with animation container required by theme transition
    document.body.innerHTML = `
      <button id="themeToggle"></button>
      <span id="themeIcon"></span>
      <div id="avatar">
        <img id="avatarImg" data-light="light.jpg" data-dark="dark.jpg" src="light.jpg" />
      </div>
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
    expect(document.getElementById('themeIcon')?.textContent).toBe('light_mode');
  });

  it('applies stored light theme on initialization', () => {
    mockStorage.setItem('theme', 'light');
    initTheme();
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.getElementById('themeIcon')?.textContent).toBe('dark_mode');
  });

  it('toggles to dark theme on button click', async () => {
    initTheme();
    const btn = document.getElementById('themeToggle');
    
    btn?.click();
    
    // Wait for async mock to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(mockStorage.getItem('theme')).toBe('dark');
    expect(document.getElementById('themeIcon')?.textContent).toBe('light_mode');
  });

  it('toggles to light theme on button click', async () => {
    mockStorage.setItem('theme', 'dark');
    initTheme();
    const btn = document.getElementById('themeToggle');
    
    btn?.click();
    
    // Wait for async mock to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(mockStorage.getItem('theme')).toBe('light');
    expect(document.getElementById('themeIcon')?.textContent).toBe('dark_mode');
  });
});
