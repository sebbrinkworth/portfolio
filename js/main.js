import { initTheme } from './theme.js';
import { loadTimeline } from './timeline.js';
import { loadSkills } from './skills.js';
import { initVectorField } from './vector-field.js';
import { initGallery } from './gallery.js';

// Initialize all modules
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  initTheme();
  
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
  
  // Load data
  loadTimeline();
  loadSkills();
  
  // Initialize effects
  initVectorField();
  
  // Initialize gallery (ready for future use)
  initGallery();
});