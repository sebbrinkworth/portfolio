import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../../js/utils.js';

describe('escapeHtml', () => {
  it('escapes HTML special characters correctly', () => {
    const input = '<script>alert("XSS")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });
  
  it('handles empty strings', () => {
    expect(escapeHtml('')).toBe('');
  });
  
  it('handles strings without special chars', () => {
    const input = 'Hello World 123';
    expect(escapeHtml(input)).toBe(input);
  });
  
  it('escapes all HTML special characters', () => {
    const input = '&<>"\'';
    const expected = '&amp;&lt;&gt;&quot;&#039;';
    expect(escapeHtml(input)).toBe(expected);
  });
  
  it('handles non-string inputs gracefully', () => {
    expect(escapeHtml(123)).toBe('123');
    expect(escapeHtml(null)).toBe('null');
    expect(escapeHtml(undefined)).toBe('undefined');
  });
  
  it('executes within performance budget (1KB < 1ms)', () => {
    const longInput = '<script>'.repeat(100);
    
    const start = performance.now();
    escapeHtml(longInput);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(1);
  });
});
