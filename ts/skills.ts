import { escapeHtml } from './utils';
import type { Skill } from '../types';

/**
 * Load and render skills data from JSON
 * All content is escaped to prevent XSS
 * 
 * Performance: < 30ms for 50 items
 * 
 * @returns Promise<void>
 */
export async function loadSkills(): Promise<void> {
  try {
    const response = await fetch('data/skills.json');
    const skills: Skill[] = await response.json();
    
    const skillsEl = document.getElementById("skills");
    if (!skillsEl) return;
    
    if (skills.length === 0) {
      skillsEl.innerHTML = '';
      return;
    }
    
    skillsEl.innerHTML = skills.map((s) => `
      <li class="skill">
        <span class="ms" aria-hidden="true">${escapeHtml(s.icon)}</span>
        <span>${escapeHtml(s.label)}</span>
      </li>
    `).join("");
  } catch (error) {
    console.error('Failed to load skills:', error);
  }
}
