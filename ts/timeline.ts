import { escapeHtml } from './utils';
import type { TimelineItem } from '../types';

/**
 * Load and render timeline data from JSON
 * Renders alternating left/right layout
 * All content is escaped to prevent XSS
 * 
 * Performance: < 50ms for 100 items
 * 
 * @returns Promise<void>
 */
export async function loadTimeline(): Promise<void> {
  try {
    const response = await fetch('data/timeline.json');
    const timeline: TimelineItem[] = await response.json();
    
    const timelineEl = document.getElementById("timeline");
    if (!timelineEl) return;
    
    if (timeline.length === 0) {
      timelineEl.innerHTML = '';
      return;
    }
    
    timelineEl.innerHTML = timeline.map((item, i) => {
      const side = i % 2 === 0 ? "right" : "left";
      return `
        <article class="t-item ${side}">
          <div class="t-dot" aria-hidden="true"></div>

          <div class="t-date-wrap">
            <span class="t-date">${escapeHtml(item.dates)}</span>
          </div>

          <div class="t-content">
            <h3>${escapeHtml(item.role)}</h3>
            <div class="t-meta">${escapeHtml(item.org)} — ${escapeHtml(item.location)}</div>
            <div class="t-desc">${escapeHtml(item.desc)}</div>
          </div>
        </article>
      `;
    }).join("");
  } catch (error) {
    console.error('Failed to load timeline:', error);
  }
}
