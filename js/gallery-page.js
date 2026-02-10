import { initTheme } from './theme.js';
import { escapeHtml } from './utils.js';
import { initVectorField } from './vector-field.js';

// Gallery state
let galleryData = [];
let currentIndex = 0;
let isAnimating = false;
let activeThumbnail = null;

// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxExpander = document.getElementById('lightboxExpander');
const lightboxImage = document.getElementById('lightboxImage');

// Motion library (loaded from CDN)
const Motion = window.Motion || {};

// Spring configuration for natural, physics-based animations
const lightboxSpring = {
  type: "spring",
  stiffness: 250,
  damping: 25,
  mass: 0.8
};

const closeSpring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.6
};

// Initialize gallery page
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initVectorField();

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  loadGallery();
  setupEventListeners();
  handlePageTransition();
});

// Load gallery data
async function loadGallery() {
  try {
    const response = await fetch('data/gallery.json');
    galleryData = await response.json();
    
    if (galleryData.length === 0) {
      showEmptyState();
      return;
    }
    
    renderGallery();
  } catch (error) {
    console.error('Failed to load gallery:', error);
    showEmptyState();
  }
}

// Show empty state
function showEmptyState() {
  galleryGrid.innerHTML = `
    <div class="gallery-empty" style="
      grid-column: 1 / -1;
      text-align: center;
      padding: 80px 20px;
      color: rgb(var(--muted));
    ">
      <span class="ms" style="font-size: 48px; display: block; margin-bottom: 16px;">photo_library</span>
      <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: rgb(var(--fg));">Gallery coming soon</h3>
      <p style="font-size: 14px;">Photos will appear here once added to data/gallery.json</p>
    </div>
  `;
}

// Render gallery grid
function renderGallery() {
  galleryGrid.innerHTML = galleryData.map((item, index) => {
    const ratio = item.ratio || 'square';
    const hasWebp = item.thumbnailWebp || item.srcWebp;
    return `
      <article 
        class="gallery-item" 
        data-index="${index}"
        data-ratio="${ratio}"
        role="button"
        tabindex="0"
        aria-label="View ${escapeHtml(item.title)}"
      >
        ${hasWebp ? `
        <picture>
          <source 
            srcset="${escapeHtml(item.thumbnailWebp || item.srcWebp)}" 
            type="image/webp"
          />
          <img 
            src="${escapeHtml(item.thumbnail || item.src)}" 
            alt="${escapeHtml(item.alt || item.title)}"
            loading="lazy"
            decoding="async"
          />
        </picture>
        ` : `
        <img 
          src="${escapeHtml(item.thumbnail || item.src)}" 
          alt="${escapeHtml(item.alt || item.title)}"
          loading="lazy"
          decoding="async"
        />
        `}
      </article>
    `;
  }).join('');
  
  // Initialize Motion press gestures on gallery items
  initializePressGestures();
}

// Initialize Motion press gestures for smooth interaction
function initializePressGestures() {
  if (!Motion.press) return;
  
  document.querySelectorAll('.gallery-item').forEach(item => {
    const img = item.querySelector('img');
    
    // Use Motion's press for gesture detection with visual feedback
    Motion.press(item, (element) => {
      // Animate the press down
      if (Motion.animate) {
        Motion.animate(img, { scale: 0.95 }, { duration: 0.15 });
      } else {
        img.style.transform = 'scale(0.95)';
      }
      
      return () => {
        // Animate the release
        if (Motion.animate) {
          Motion.animate(img, { scale: 1 }, { 
            type: "spring",
            stiffness: 400,
            damping: 25
          });
        } else {
          img.style.transform = 'scale(1)';
        }
      };
    }, { once: true });
    
    // Handle click to open lightbox
    item.addEventListener('click', () => {
      if (isAnimating) return;
      const index = parseInt(item.dataset.index);
      activeThumbnail = item.querySelector('img');
      openLightbox(index);
    });
    
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isAnimating) return;
        const index = parseInt(item.dataset.index);
        activeThumbnail = item.querySelector('img');
        openLightbox(index);
      }
    });
  });
}

// Open lightbox with shared element transition
async function openLightbox(index) {
  if (isAnimating) return;
  isAnimating = true;
  currentIndex = index;
  
  const item = galleryData[currentIndex];
  
  // Get thumbnail position
  const thumbnailRect = activeThumbnail.getBoundingClientRect();
  
  // Set up lightbox image
  lightboxImage.src = item.srcWebp || item.src;
  lightboxImage.alt = item.alt || item.title;
  
  // Position expander at thumbnail location
  lightboxExpander.style.position = 'fixed';
  lightboxExpander.style.left = `${thumbnailRect.left}px`;
  lightboxExpander.style.top = `${thumbnailRect.top}px`;
  lightboxExpander.style.width = `${thumbnailRect.width}px`;
  lightboxExpander.style.height = `${thumbnailRect.height}px`;
  lightboxExpander.style.borderRadius = '12px';
  lightboxExpander.style.opacity = '1';
  
  // Show overlay with fade
  lightboxOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Calculate target position
  const targetRect = calculateTargetRect(thumbnailRect);
  
  // Use View Transition API if available, otherwise use Motion animate
  if (document.startViewTransition && !Motion.animate) {
    const transition = document.startViewTransition(() => {
      lightboxExpander.style.left = `${targetRect.left}px`;
      lightboxExpander.style.top = `${targetRect.top}px`;
      lightboxExpander.style.width = `${targetRect.width}px`;
      lightboxExpander.style.height = `${targetRect.height}px`;
      lightboxExpander.style.borderRadius = '4px';
    });
    
    await transition.finished;
  } else if (Motion.animate) {
    // Use Motion's spring animation for natural feel
    await Promise.all([
      Motion.animate(lightboxExpander, {
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
        borderRadius: 4
      }, lightboxSpring),
      Motion.animate(lightboxOverlay, {
        opacity: 1
      }, { duration: 0.3 })
    ]);
  } else {
    // Fallback to CSS transition
    lightboxExpander.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    lightboxExpander.style.left = `${targetRect.left}px`;
    lightboxExpander.style.top = `${targetRect.top}px`;
    lightboxExpander.style.width = `${targetRect.width}px`;
    lightboxExpander.style.height = `${targetRect.height}px`;
    lightboxExpander.style.borderRadius = '4px';
    
    await new Promise(resolve => setTimeout(resolve, 500));
    lightboxExpander.style.transition = '';
  }
  
  isAnimating = false;
}

// Close lightbox with reverse animation
async function closeLightbox() {
  if (isAnimating) return;
  isAnimating = true;
  
  // Get current expander position
  const currentRect = lightboxExpander.getBoundingClientRect();
  
  // Get thumbnail position to animate back to
  const thumbnail = document.querySelector(`.gallery-item[data-index="${currentIndex}"] img`);
  const targetRect = thumbnail ? thumbnail.getBoundingClientRect() : currentRect;
  
  if (Motion.animate) {
    // Use Motion's spring animation
    await Promise.all([
      Motion.animate(lightboxExpander, {
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
        borderRadius: 12
      }, closeSpring),
      Motion.animate(lightboxOverlay, {
        opacity: 0
      }, { duration: 0.25 })
    ]);
  } else {
    // Fallback to CSS transition
    lightboxExpander.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    lightboxExpander.style.left = `${targetRect.left}px`;
    lightboxExpander.style.top = `${targetRect.top}px`;
    lightboxExpander.style.width = `${targetRect.width}px`;
    lightboxExpander.style.height = `${targetRect.height}px`;
    lightboxExpander.style.borderRadius = '12px';
    lightboxOverlay.style.transition = 'opacity 0.25s ease';
    lightboxOverlay.style.opacity = '0';
    
    await new Promise(resolve => setTimeout(resolve, 350));
    lightboxExpander.style.transition = '';
    lightboxOverlay.style.transition = '';
  }
  
  // Hide overlay
  lightboxOverlay.classList.remove('active');
  lightboxOverlay.style.opacity = '';
  document.body.style.overflow = '';
  lightboxExpander.style.opacity = '0';
  
  isAnimating = false;
}

// Calculate target position for expander
function calculateTargetRect(thumbnailRect) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate max dimensions (leave padding)
  const maxWidth = Math.min(viewportWidth * 0.9, 1200);
  const maxHeight = viewportHeight * 0.8;
  
  // Get image aspect ratio from thumbnail
  const aspectRatio = thumbnailRect.width / thumbnailRect.height;
  
  let targetWidth, targetHeight;
  
  if (aspectRatio > maxWidth / maxHeight) {
    // Width constrained
    targetWidth = maxWidth;
    targetHeight = maxWidth / aspectRatio;
  } else {
    // Height constrained
    targetHeight = maxHeight;
    targetWidth = maxHeight * aspectRatio;
  }
  
  // Center in viewport
  const targetLeft = (viewportWidth - targetWidth) / 2;
  const targetTop = (viewportHeight - targetHeight) / 2;
  
  return {
    left: targetLeft,
    top: targetTop,
    width: targetWidth,
    height: targetHeight
  };
}

// Navigate to next image
async function nextImage() {
  if (isAnimating || galleryData.length <= 1) return;
  
  isAnimating = true;
  
  // Fade out current image
  if (Motion.animate) {
    await Motion.animate(lightboxImage, { opacity: 0 }, { duration: 0.15 });
  } else {
    lightboxImage.style.transition = 'opacity 0.15s ease';
    lightboxImage.style.opacity = '0';
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  // Update index
  currentIndex = (currentIndex + 1) % galleryData.length;
  const item = galleryData[currentIndex];
  
  // Update thumbnail reference
  const thumbnail = document.querySelector(`.gallery-item[data-index="${currentIndex}"] img`);
  if (thumbnail) activeThumbnail = thumbnail;
  
  // Update content
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt || item.title;
  
  // Fade in
  if (Motion.animate) {
    await Motion.animate(lightboxImage, { opacity: 1 }, { duration: 0.2 });
  } else {
    lightboxImage.style.opacity = '1';
    await new Promise(resolve => setTimeout(resolve, 200));
    lightboxImage.style.transition = '';
  }
  
  isAnimating = false;
}

// Navigate to previous image
async function prevImage() {
  if (isAnimating || galleryData.length <= 1) return;
  
  isAnimating = true;
  
  // Fade out current image
  if (Motion.animate) {
    await Motion.animate(lightboxImage, { opacity: 0 }, { duration: 0.15 });
  } else {
    lightboxImage.style.transition = 'opacity 0.15s ease';
    lightboxImage.style.opacity = '0';
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  // Update index
  currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
  const item = galleryData[currentIndex];
  
  // Update thumbnail reference
  const thumbnail = document.querySelector(`.gallery-item[data-index="${currentIndex}"] img`);
  if (thumbnail) activeThumbnail = thumbnail;
  
  // Update content
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt || item.title;
  
  // Fade in
  if (Motion.animate) {
    await Motion.animate(lightboxImage, { opacity: 1 }, { duration: 0.2 });
  } else {
    lightboxImage.style.opacity = '1';
    await new Promise(resolve => setTimeout(resolve, 200));
    lightboxImage.style.transition = '';
  }
  
  isAnimating = false;
}

// Setup event listeners
function setupEventListeners() {
  // Click on overlay (outside image) to close
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
      closeLightbox();
    }
  });

  // Prevent clicks on the image from closing
  lightboxExpander.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightboxOverlay.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextImage();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevImage();
        break;
    }
  });

  // Resize handler
  window.addEventListener('resize', () => {
    if (lightboxOverlay.classList.contains('active') && !isAnimating) {
      const targetRect = calculateTargetRect({ width: 0, height: 0 });
      lightboxExpander.style.left = `${targetRect.left}px`;
      lightboxExpander.style.top = `${targetRect.top}px`;
      lightboxExpander.style.width = `${targetRect.width}px`;
      lightboxExpander.style.height = `${targetRect.height}px`;
    }
  });
  
  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  lightboxOverlay.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  lightboxOverlay.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
  }
}

// Handle page transition with View Transitions API
function handlePageTransition() {
  const galleryNav = document.querySelector('.gallery-nav');
  const supportsViewTransitions = 'startViewTransition' in document;

  if (galleryNav) {
    galleryNav.addEventListener('click', (e) => {
      if (!supportsViewTransitions) return;

      e.preventDefault();
      const href = galleryNav.getAttribute('href');

      document.startViewTransition(() => {
        window.location.href = href;
      });
    });
  }
}

// Export for external use
export { openLightbox, closeLightbox };
