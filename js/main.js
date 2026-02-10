import { initTheme } from './theme.js';
import { loadTimeline } from './timeline.js';
import { loadSkills } from './skills.js';
import { initVectorField } from './vector-field.js';
import { initGallery } from './gallery.js';

// Check if View Transitions API is supported
const supportsViewTransitions = 'startViewTransition' in document;

// Initialize all modules
document.addEventListener('DOMContentLoaded', async () => {
  // Add loading state
  document.body.classList.add('loading');
  
  // Wait for Motion to load from CDN (max 2 seconds)
  let motionReady = false;
  for (let i = 0; i < 20; i++) {
    if (window.Motion && window.Motion.animate) {
      motionReady = true;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Start loading animation (with 3 second max timeout)
  await initLoadingAnimation();
  
  // Animation complete - fade in content
  document.body.classList.remove('loading');
  document.body.classList.add('loaded');
  
  // Hide loading overlay after fade completes
  setTimeout(() => {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }, 800);

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

// Loading animation with Motion spring
async function initLoadingAnimation() {
  const loadingLine = document.querySelector('.loading-line');
  const Motion = window.Motion;
  
  // Create a timeout that always resolves after max 3 seconds
  const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
  
  // If Motion isn't available, use CSS fallback
  if (!loadingLine || !Motion || !Motion.animate) {
    if (loadingLine) {
      loadingLine.style.transition = 'height 1s ease-out';
      loadingLine.style.height = '100%';
    }
    // Wait for CSS animation + buffer
    await new Promise(resolve => setTimeout(resolve, 1200));
    return;
  }
  
  try {
    // Create the animation promise
    const animationPromise = (async () => {
      await Motion.animate(loadingLine, {
        height: '100%'
      }, {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1.2,
        duration: 1.5
      });
      // Small pause at the end
      await new Promise(resolve => setTimeout(resolve, 200));
    })();
    
    // Race between animation and timeout - whichever finishes first
    await Promise.race([animationPromise, timeoutPromise]);
  } catch (error) {
    console.warn('Loading animation failed:', error);
    // Ensure loading completes even if animation fails
    if (loadingLine) {
      loadingLine.style.height = '100%';
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

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
