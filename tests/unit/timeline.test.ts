import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { loadTimeline } from '../../ts/timeline';

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
    ) as unknown as typeof fetch;
    
    await loadTimeline();
    
    const timeline = document.getElementById('timeline');
    expect(timeline?.querySelectorAll('.t-item')).toHaveLength(1);
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
    ) as unknown as typeof fetch;
    
    await loadTimeline();
    
    const item = document.querySelector('.t-item');
    expect(item?.querySelector('.t-date')?.textContent).toBe('2024 - Present');
    expect(item?.querySelector('.t-content h3')?.textContent).toBe('Developer');
    expect(item?.querySelector('.t-meta')?.textContent).toBe('Company — City');
    expect(item?.querySelector('.t-desc')?.textContent).toBe('Description');
  });

  it('renders alternating left/right classes', async () => {
    const mockData = [
      { dates: '2024', role: 'R1', org: 'O1', location: 'L1', desc: 'D1' },
      { dates: '2023', role: 'R2', org: 'O2', location: 'L2', desc: 'D2' },
      { dates: '2022', role: 'R3', org: 'O3', location: 'L3', desc: 'D3' }
    ];
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    ) as unknown as typeof fetch;
    
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
    ) as unknown as typeof fetch;
    
    await loadTimeline();
    
    const timeline = document.getElementById('timeline');
    const dateEl = timeline?.querySelector('.t-date');
    const roleEl = timeline?.querySelector('.t-content h3');
    
    // Verify content is displayed as text, not executed as HTML/script
    // If not escaped, the browser would try to execute these as tags
    expect(dateEl?.textContent).toBe('<script>alert(1)</script>');
    expect(roleEl?.textContent).toBe('<img src=x onerror=alert(2)>');
    
    // Verify no script elements were created (XSS prevention)
    expect(timeline?.querySelector('script')).toBeNull();
    expect(timeline?.querySelector('img')).toBeNull();
  });

  it('handles empty timeline gracefully', async () => {
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve([]) })
    ) as unknown as typeof fetch;
    
    await loadTimeline();
    
    const timeline = document.getElementById('timeline');
    expect(timeline?.innerHTML).toBe('');
  });

  it('exits gracefully if timeline element missing', async () => {
    document.body.innerHTML = '';
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve([{dates: '2024'}]) })
    ) as unknown as typeof fetch;
    
    await expect(loadTimeline()).resolves.not.toThrow();
  });

  it('logs error when fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as unknown as typeof fetch;
    
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
    ) as unknown as typeof fetch;
    
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
    ) as unknown as typeof fetch;
    
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
    ) as unknown as typeof fetch;
    
    const start = performance.now();
    await loadTimeline();
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(200);
    expect(document.querySelectorAll('.t-item')).toHaveLength(500);
  });
});
