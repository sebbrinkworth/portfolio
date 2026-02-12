import { escapeHtml } from './utils';
import type { TimelineItem, Skill } from '../types';

/**
 * Load and render timeline data from JSON
 * Renders alternating left/right layout with skill badges on opposite side
 * All content is escaped to prevent XSS
 * 
 * Performance: < 50ms for 100 items
 * 
 * @returns Promise<void>
 */
export async function loadTimeline(): Promise<void> {
  try {
    const [timelineRes, skillsRes] = await Promise.all([
      fetch('/data/timeline.json'),
      fetch('/data/skills.json')
    ]);
    
    const timeline: TimelineItem[] = await timelineRes.json();
    const skills: Skill[] = await skillsRes.json();
    
    const timelineEl = document.getElementById("timeline");
    if (!timelineEl) return;
    
    if (timeline.length === 0) {
      timelineEl.innerHTML = '';
      return;
    }

    // Create a lookup map for skills by label
    const skillMap = new Map(skills.map(s => [s.label, s]));
    
    timelineEl.innerHTML = timeline.map((item, i) => {
      const side = i % 2 === 0 ? "right" : "left";
      
      // Build skill badges HTML
      let skillsHtml = '';
      if (item.skills && item.skills.length > 0) {
        const skillBadges = item.skills
          .map(skillLabel => {
            const skill = skillMap.get(skillLabel);
            if (!skill) return '';
            return `
              <span class="t-skill-badge">
                <span class="ms" aria-hidden="true">${escapeHtml(skill.icon)}</span>
                <span>${escapeHtml(skill.label)}</span>
              </span>
            `;
          })
          .filter(Boolean)
          .join('');
        
        if (skillBadges) {
          skillsHtml = `<div class="t-skills">${skillBadges}</div>`;
        }
      }
      
      // For right items, skills come before content in DOM to match visual order
      // For left items, skills come after content
      const contentHtml = `
          <div class="t-content">
            <h3>${escapeHtml(item.role)}</h3>
            <div class="t-meta">${escapeHtml(item.org)} — ${escapeHtml(item.location)}</div>
            <div class="t-desc">${escapeHtml(item.desc)}</div>
          </div>
      `;
      
      return `
        <article class="t-item ${side}">
          <div class="t-dot" aria-hidden="true"></div>

          <div class="t-date-wrap">
            <span class="t-date">${escapeHtml(item.dates)}</span>
          </div>

          ${side === 'right' ? skillsHtml + contentHtml : contentHtml + skillsHtml}
        </article>
      `;
    }).join("");
  } catch (error) {
    console.error('Failed to load timeline:', error);
  }
}
