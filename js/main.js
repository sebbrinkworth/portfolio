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
  
  // Setup page transitions
  setupPageTransitions();
});

// Handle smooth page transitions
function setupPageTransitions() {
  // Create transition overlay if it doesn't exist
  let pageTransition = document.getElementById('pageTransition');
  if (!pageTransition) {
    pageTransition = document.createElement('div');
    pageTransition.id = 'pageTransition';
    pageTransition.className = 'page-transition-overlay';
    document.body.appendChild(pageTransition);
  }
  
  // Gallery nav button transition
  const galleryNav = document.querySelector('.gallery-nav');
  if (galleryNav) {
    galleryNav.addEventListener('click', (e) => {
      e.preventDefault();
      const href = galleryNav.getAttribute('href');
      
      // Trigger transition animation
      pageTransition.classList.add('active');
      
      // Navigate after animation
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  }
  
  // Check if we arrived from gallery with transition
  if (document.referrer && document.referrer.includes('gallery.html')) {
    // Play entry animation
    pageTransition.style.transformOrigin = 'bottom';
    pageTransition.style.animation = 'page-entry 600ms var(--expo-out) forwards';
  }
}