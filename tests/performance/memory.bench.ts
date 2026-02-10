import { bench, describe } from 'vitest';

describe('Memory Efficiency', () => {
  bench('DOM node creation - 100 elements', () => {
    const container = document.createElement('div');
    for (let i = 0; i < 100; i++) {
      const el = document.createElement('div');
      el.className = 'test-element';
      container.appendChild(el);
    }
  });

  bench('DOM node creation - 1000 elements with fragment', () => {
    const container = document.createElement('div');
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < 1000; i++) {
      const el = document.createElement('div');
      el.className = 'test-element';
      fragment.appendChild(el);
    }
    
    container.appendChild(fragment);
  });

  bench('string concatenation - map+join', () => {
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    items.map(item => `<div>${item}</div>`).join('');
  });

  bench('string concatenation - loop', () => {
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    let result = '';
    for (let i = 0; i < items.length; i++) {
      result += `<div>${items[i]}</div>`;
    }
  });
});
