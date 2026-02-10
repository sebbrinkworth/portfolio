import { escapeHtml } from './utils.js';

export async function loadSkills() {
  try {
    const response = await fetch('data/skills.json');
    const skills = await response.json();
    
    const skillsEl = document.getElementById("skills");
    if (!skillsEl) return;
    
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