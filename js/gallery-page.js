import { initTheme } from './theme.js';
import { escapeHtml } from './utils.js';

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
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDescription = document.getElementById('lightboxDescription');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const pageTransition = document.getElementById('pageTransition');

// Spring physics configuration
const SPRING_CONFIG = {
  stiffness: 300,
  damping: 25,
  mass: 0.8
};

// Initialize gallery page
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
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
    return `
      <article 
        class="gallery-item" 
        data-index="${index}"
        data-ratio="${ratio}"
        role="button"
        tabindex="0"
        aria-label="View ${escapeHtml(item.title)}"
      >
        <img 
          src="${escapeHtml(item.thumbnail || item.src)}" 
          alt="${escapeHtml(item.alt || item.title)}"
          loading="lazy"
          decoding="async"
        />
      </article>
    `;
  }).join('');
  
  // Add click handlers
  document.querySelectorAll('.gallery-item').forEach(item => {
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

// Open lightbox with FLIP animation
async function openLightbox(index) {
  if (isAnimating) return;
  isAnimating = true;
  currentIndex = index;
  
  const item = galleryData[currentIndex];
  
  // Get thumbnail position (First)
  const thumbnailRect = activeThumbnail.getBoundingClientRect();
  
  // Set up lightbox image
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt || item.title;
  lightboxTitle.textContent = item.title;
  lightboxDescription.textContent = item.description || '';
  updateCounter();
  
  // Position expander at thumbnail location
  lightboxExpander.style.position = 'fixed';
  lightboxExpander.style.left = `${thumbnailRect.left}px`;
  lightboxExpander.style.top = `${thumbnailRect.top}px`;
  lightboxExpander.style.width = `${thumbnailRect.width}px`;
  lightboxExpander.style.height = `${thumbnailRect.height}px`;
  lightboxExpander.style.opacity = '1';
  
  // Show overlay
  lightboxOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Force reflow
  lightboxExpander.offsetHeight;
  
  // Calculate target position (Last)
  const targetRect = calculateTargetRect(thumbnailRect);
  
  // Animate using spring physics (Invert & Play)
  await animateExpander(thumbnailRect, targetRect, 'open');
  
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
  
  // Animate back to thumbnail
  await animateExpander(currentRect, targetRect, 'close');
  
  // Hide overlay
  lightboxOverlay.classList.remove('active');
  document.body.style.overflow = '';
  
  // Reset
  lightboxExpander.style.opacity = '0';
  isAnimating = false;
}

// Navigate to previous image
async function prevImage() {
  if (isAnimating || galleryData.length <= 1) return;
  
  isAnimating = true;
  
  // Fade out current
  await animate(lightboxImage, { opacity: 0 }, { duration: 150 });
  
  // Update index
  currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
  const item = galleryData[currentIndex];
  
  // Update thumbnail reference
  const thumbnail = document.querySelector(`.gallery-item[data-index="${currentIndex}"] img`);
  if (thumbnail) activeThumbnail = thumbnail;
  
  // Update content
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt || item.title;
  lightboxTitle.textContent = item.title;
  lightboxDescription.textContent = item.description || '';
  updateCounter();
  
  // Fade in
  await animate(lightboxImage, { opacity: 1 }, { duration: 200 });
  
  isAnimating = false;
}

// Navigate to next image
async function nextImage() {
  if (isAnimating || galleryData.length <= 1) return;
  
  isAnimating = true;
  
  // Fade out current
  await animate(lightboxImage, { opacity: 0 }, { duration: 150 });
  
  // Update index
  currentIndex = (currentIndex + 1) % galleryData.length;
  const item = galleryData[currentIndex];
  
  // Update thumbnail reference
  const thumbnail = document.querySelector(`.gallery-item[data-index="${currentIndex}"] img`);
  if (thumbnail) activeThumbnail = thumbnail;
  
  // Update content
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt || item.title;
  lightboxTitle.textContent = item.title;
  lightboxDescription.textContent = item.description || '';
  updateCounter();
  
  // Fade in
  await animate(lightboxImage, { opacity: 1 }, { duration: 200 });
  
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

// Spring-based FLIP animation
function animateExpander(fromRect, toRect, direction) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const duration = direction === 'open' ? 600 : 400;
    
    // Calculate deltas
    const deltaX = toRect.left - fromRect.left;
    const deltaY = toRect.top - fromRect.top;
    const deltaW = toRect.width - fromRect.width;
    const deltaH = toRect.height - fromRect.height;
    
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Spring easing: cubic-bezier(0.34, 1.56, 0.64, 1)
      const eased = springEasing(progress);
      
      // Apply transforms
      const currentX = fromRect.left + (deltaX * eased);
      const currentY = fromRect.top + (deltaY * eased);
      const currentW = fromRect.width + (deltaW * eased);
      const currentH = fromRect.height + (deltaH * eased);
      
      lightboxExpander.style.left = `${currentX}px`;
      lightboxExpander.style.top = `${currentY}px`;
      lightboxExpander.style.width = `${currentW}px`;
      lightboxExpander.style.height = `${currentH}px`;
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    
    requestAnimationFrame(step);
  });
}

// Spring easing function (similar to cubic-bezier(0.34, 1.56, 0.64, 1))
function springEasing(t) {
  // Custom spring curve
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
}

// Simple animate helper
function animate(element, properties, options) {
  return new Promise((resolve) => {
    const { duration = 300 } = options;
    
    Object.assign(element.style, {
      transition: `all ${duration}ms ease`,
      ...properties
    });
    
    setTimeout(() => {
      element.style.transition = '';
      resolve();
    }, duration);
  });
}

// Update counter
function updateCounter() {
  lightboxCounter.textContent = `${currentIndex + 1} / ${galleryData.length}`;
}

// Setup event listeners
function setupEventListeners() {
  // Close button
  lightboxClose.addEventListener('click', closeLightbox);
  
  // Navigation
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    prevImage();
  });
  
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    nextImage();
  });
  
  // Click backdrop to close
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
      closeLightbox();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightboxOverlay.classList.contains('active')) return;
    
    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
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
}

// Handle page transition
function handlePageTransition() {
  const navBack = document.querySelector('.nav-back');
  
  if (navBack && pageTransition) {
    navBack.addEventListener('click', (e) => {
      e.preventDefault();
      const href = navBack.getAttribute('href');
      pageTransition.classList.add('active');
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  }
}

// Export for external use
export { openLightbox, closeLightbox };