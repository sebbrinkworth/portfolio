import { escapeHtml } from './utils.js';

export async function loadTimeline() {
  try {
    const response = await fetch('data/timeline.json');
    const timeline = await response.json();
    
    const timelineEl = document.getElementById("timeline");
    if (!timelineEl) return;
    
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