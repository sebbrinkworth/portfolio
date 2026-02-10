import { bench, describe, beforeEach } from 'vitest';
import { escapeHtml } from '../../js/utils';
import { loadTimeline } from '../../js/timeline';
import { loadSkills } from '../../js/skills';

describe('Rendering Performance', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="timeline"></div>
      <ul id="skills"></ul>
    `;
  });

  bench('escapeHtml - short string (100B)', () => {
    escapeHtml('<script>alert("XSS")</script>');
  });

  bench('escapeHtml - medium string (1KB)', () => {
    const input = '<script>alert("XSS")</script>'.repeat(100);
    escapeHtml(input);
  });

  bench('escapeHtml - long string (100KB)', () => {
    const input = '<script>alert("XSS")</script>'.repeat(10000);
    escapeHtml(input);
  }, { time: 1000 });

  bench('render timeline - 10 items', async () => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      dates: '2024',
      role: `Role ${i}`,
      org: 'Company',
      location: 'City',
      desc: 'Description'
    }));
    
    global.fetch = () => Promise.resolve({ 
      json: () => Promise.resolve(data) 
    }) as unknown as Promise<Response>;
    await loadTimeline();
  });

  bench('render timeline - 100 items', async () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      dates: '2024',
      role: `Role ${i}`,
      org: 'Company',
      location: 'City',
      desc: 'Description'
    }));
    
    global.fetch = () => Promise.resolve({ 
      json: () => Promise.resolve(data) 
    }) as unknown as Promise<Response>;
    await loadTimeline();
  }, { time: 2000 });

  bench('render skills - 50 items', async () => {
    const data = Array.from({ length: 50 }, (_, i) => ({
      icon: 'code',
      label: `Skill ${i}`
    }));
    
    global.fetch = () => Promise.resolve({ 
      json: () => Promise.resolve(data) 
    }) as unknown as Promise<Response>;
    await loadSkills();
  });
});
