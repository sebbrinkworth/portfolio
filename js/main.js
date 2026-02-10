import { initTheme } from './theme.js';
import { loadTimeline } from './timeline.js';
import { loadSkills } from './skills.js';
import { initVectorField } from './vector-field.js';
import { initGallery } from './gallery.js';

// Check if View Transitions API is supported
const supportsViewTransitions = 'startViewTransition' in document;

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

  // Setup page transitions (View Transitions API for cross-document nav)
  setupPageTransitions();
});

// Handle smooth page transitions using View Transitions API
function setupPageTransitions() {
  // Gallery nav button transition with View Transitions API
  const galleryNav = document.querySelector('.gallery-nav');
  if (galleryNav) {
    galleryNav.addEventListener('click', (e) => {
      if (!supportsViewTransitions) {
        // Let default navigation happen for unsupported browsers
        return;
      }

      e.preventDefault();
      const href = galleryNav.getAttribute('href');

      // Start view transition before navigation
      document.startViewTransition(() => {
        window.location.href = href;
      });
    });
  }
}