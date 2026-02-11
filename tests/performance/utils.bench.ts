import { bench, describe } from 'vitest';
import { escapeHtml } from '../../ts/utils';

describe('escapeHtml Performance', () => {
  const shortInput = '<script>alert("XSS")</script>';
  const mediumInput = shortInput.repeat(100); // ~1KB
  const longInput = shortInput.repeat(10000); // ~100KB

  bench('short input (100B)', () => {
    escapeHtml(shortInput);
  });

  bench('medium input (1KB)', () => {
    escapeHtml(mediumInput);
  });

  bench('long input (100KB)', () => {
    escapeHtml(longInput);
  }, { time: 1000 });
});
