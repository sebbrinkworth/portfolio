import { initTheme } from './theme.js';
import { escapeHtml } from './utils.js';

// Gallery state
let galleryData = [];
let currentIndex = 0;
let isAnimating = false;

// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDescription = document.getElementById('lightboxDescription');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxImageContainer = document.getElementById('lightboxImageContainer');
const pageTransition = document.getElementById('pageTransition');

// Spring physics configuration (matching motion.dev feel)
const SPRING_CONFIG = {
  stiffness: 300,
  damping: 30,
  mass: 1
};

// Initialize gallery page
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initTheme();
  
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
  
  // Load and render gallery
  loadGallery();
  
  // Setup event listeners
  setupEventListeners();
  
  // Handle page transition
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

// Show empty state when no images
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
        <div class="gallery-item-title">${escapeHtml(item.title)}</div>
      </article>
    `;
  }).join('');
  
  // Add click handlers
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      openLightbox(index);
    });
    
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const index = parseInt(item.dataset.index);
        openLightbox(index);
      }
    });
  });
}

// Open lightbox with smooth animation
function openLightbox(index) {
  if (isAnimating) return;
  isAnimating = true;
  
  currentIndex = index;
  const item = galleryData[currentIndex];
  
  // Preload image
  lightboxImageContainer.classList.add('loading');
  const img = new Image();
  img.onload = () => {
    lightboxImageContainer.classList.remove('loading');
  };
  img.src = item.src;
  
  // Set content
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt || item.title;
  lightboxTitle.textContent = item.title;
  lightboxDescription.textContent = item.description || '';
  
  // Show modal with animation
  lightbox.showModal();
  
  // Prevent background scrolling
  document.body.style.overflow = 'hidden';
  
  // Reset animation flag after transition
  setTimeout(() => {
    isAnimating = false;
  }, 500);
}

// Close lightbox
function closeLightbox() {
  if (isAnimating) return;
  isAnimating = true;
  
  // Add closing class for exit animation
  lightbox.classList.add('closing');
  
  // Wait for animation then close
  setTimeout(() => {
    lightbox.close();
    lightbox.classList.remove('closing');
    document.body.style.overflow = '';
    isAnimating = false;
  }, 300);
}

// Navigate to previous image
function prevImage() {
  if (isAnimating || galleryData.length <= 1) return;
  
  currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
  animateImageChange('prev');
}

// Navigate to next image
function nextImage() {
  if (isAnimating || galleryData.length <= 1) return;
  
  currentIndex = (currentIndex + 1) % galleryData.length;
  animateImageChange('next');
}

// Animate image change with spring-like transition
function animateImageChange(direction) {
  isAnimating = true;
  
  const item = galleryData[currentIndex];
  const translateX = direction === 'next' ? -50 : 50;
  
  // Animate out current image
  lightboxImage.style.transition = 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease';
  lightboxImage.style.transform = `translateX(${translateX}px) scale(0.95)`;
  lightboxImage.style.opacity = '0';
  
  setTimeout(() => {
    // Preload new image
    lightboxImageContainer.classList.add('loading');
    const img = new Image();
    img.onload = () => {
      lightboxImageContainer.classList.remove('loading');
    };
    img.src = item.src;
    
    // Update content
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt || item.title;
    lightboxTitle.textContent = item.title;
    lightboxDescription.textContent = item.description || '';
    
    // Reset position for entrance
    lightboxImage.style.transition = 'none';
    lightboxImage.style.transform = `translateX(${-translateX}px) scale(0.95)`;
    
    // Force reflow
    lightboxImage.offsetHeight;
    
    // Animate in
    lightboxImage.style.transition = 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease';
    lightboxImage.style.transform = 'translateX(0) scale(1)';
    lightboxImage.style.opacity = '1';
    
    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }, 250);
}

// Setup event listeners
function setupEventListeners() {
  // Close button
  lightboxClose.addEventListener('click', closeLightbox);
  
  // Click backdrop to close
  lightboxBackdrop.addEventListener('click', closeLightbox);
  
  // Navigation
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    prevImage();
  });
  
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    nextImage();
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.open) return;
    
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
  
  // Prevent closing when clicking content
  lightbox.querySelector('.lightbox-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Touch/swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  lightbox.addEventListener('touchend', (e) => {
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

// Handle page transition animation
function handlePageTransition() {
  // Add click handlers to nav-back link for smooth transition
  const navBack = document.querySelector('.nav-back');
  
  if (navBack && pageTransition) {
    navBack.addEventListener('click', (e) => {
      e.preventDefault();
      const href = navBack.getAttribute('href');
      
      // Trigger transition animation
      pageTransition.classList.add('active');
      
      // Navigate after animation
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  }
  
  // Check if we arrived from another page with transition
  if (document.referrer && pageTransition) {
    // Play entry animation
    pageTransition.style.transformOrigin = 'bottom';
    pageTransition.style.animation = 'page-entry 600ms var(--expo-out) forwards';
  }
}

// Export for potential external use
export { openLightbox, closeLightbox };