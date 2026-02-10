import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { loadSkills } from '../../js/skills';

describe('loadSkills', () => {
  beforeEach(() => {
    document.body.innerHTML = '<ul id="skills"></ul>';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads skills from JSON and renders to DOM', async () => {
    const mockData = [
      { icon: 'code', label: 'JavaScript' },
      { icon: 'web', label: 'HTML' }
    ];
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    ) as unknown as typeof fetch;
    
    await loadSkills();
    
    const skills = document.getElementById('skills');
    expect(skills?.querySelectorAll('.skill')).toHaveLength(2);
  });

  it('renders correct HTML structure', async () => {
    const mockData = [{ icon: 'code', label: 'JavaScript' }];
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    ) as unknown as typeof fetch;
    
    await loadSkills();
    
    const skill = document.querySelector('.skill');
    expect(skill?.querySelector('.ms')?.textContent).toBe('code');
  });

  it('escapes HTML in skills data', async () => {
    const mockData = [{ 
      icon: '<script>alert(1)</script>', 
      label: '<img src=x onerror=alert(2)>' 
    }];
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    ) as unknown as typeof fetch;
    
    await loadSkills();
    
    const skills = document.getElementById('skills');
    const iconEl = skills?.querySelector('.skill .ms');
    const labelEl = skills?.querySelector('.skill span:last-child');
    
    // Verify content is displayed as text, not executed as HTML/script
    expect(iconEl?.textContent).toBe('<script>alert(1)</script>');
    expect(labelEl?.textContent).toBe('<img src=x onerror=alert(2)>');
    
    // Verify no script elements were created (XSS prevention)
    expect(skills?.querySelector('script')).toBeNull();
    expect(skills?.querySelector('img')).toBeNull();
  });

  it('handles empty skills gracefully', async () => {
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve([]) })
    ) as unknown as typeof fetch;
    
    await loadSkills();
    
    const skills = document.getElementById('skills');
    expect(skills?.innerHTML).toBe('');
  });

  it('exits gracefully if skills element missing', async () => {
    document.body.innerHTML = '';
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve([{icon: 'code'}]) })
    ) as unknown as typeof fetch;
    
    await expect(loadSkills()).resolves.not.toThrow();
  });

  it('renders 50 skills within 30ms', async () => {
    const mockData = Array.from({ length: 50 }, (_, i) => ({
      icon: 'code',
      label: `Skill ${i}`
    }));
    
    global.fetch = vi.fn(() => 
      Promise.resolve({ json: () => Promise.resolve(mockData) })
    ) as unknown as typeof fetch;
    
    const start = performance.now();
    await loadSkills();
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(30);
    expect(document.querySelectorAll('.skill')).toHaveLength(50);
  });

  it('logs error when fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as unknown as typeof fetch;
    
    await loadSkills();
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load skills:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
