import { initTheme } from './theme';
import { escapeHtml } from './utils';
import type { GalleryItem } from '../types';

// Gallery state
let galleryData: GalleryItem[] = [];
let currentIndex = 0;

// DOM Elements
const galleryGrid = document.getElementById('galleryGrid') as HTMLElement | null;
const lightboxOverlay = document.getElementById('lightboxOverlay') as HTMLElement | null;
const lightboxExpander = document.getElementById('lightboxExpander') as HTMLElement | null;
const lightboxImage = document.getElementById('lightboxImage') as HTMLImageElement | null;

// Initialize gallery page
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  loadGallery();
  setupEventListeners();
});

// Load gallery data
async function loadGallery(): Promise<void> {
  try {
    const response = await fetch('/data/gallery.json');
    galleryData = await response.json() as GalleryItem[];
    
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
function showEmptyState(): void {
  if (!galleryGrid) return;
  
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
function renderGallery(): void {
  if (!galleryGrid) return;
  
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
            srcset="${escapeHtml(item.thumbnailWebp || item.srcWebp || '')}" 
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
  
  // Add click handlers to gallery items
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt((item as HTMLElement).dataset.index || '0');
      openLightbox(index);
    });
    
    item.addEventListener('keydown', (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
        e.preventDefault();
        const index = parseInt((item as HTMLElement).dataset.index || '0');
        openLightbox(index);
      }
    });
  });
}

// Open lightbox (instant, no animation)
function openLightbox(index: number): void {
  if (!lightboxImage || !lightboxOverlay || !lightboxExpander) return;
  
  currentIndex = index;
  
  const item = galleryData[currentIndex];
  
  // Set up lightbox image
  lightboxImage.src = item.srcWebp || item.src;
  lightboxImage.alt = item.alt || item.title;
  
  // Position expander at center
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxWidth = Math.min(viewportWidth * 0.9, 1200);
  const maxHeight = viewportHeight * 0.8;
  
  lightboxExpander.style.left = `${(viewportWidth - maxWidth) / 2}px`;
  lightboxExpander.style.top = `${(viewportHeight - maxHeight) / 2}px`;
  lightboxExpander.style.width = `${maxWidth}px`;
  lightboxExpander.style.height = `${maxHeight}px`;
  lightboxExpander.style.borderRadius = '4px';
  lightboxExpander.style.opacity = '1';
  
  // Show overlay
  lightboxOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close lightbox (instant, no animation)
function closeLightbox(): void {
  if (!lightboxOverlay || !lightboxExpander) return;
  
  // Hide overlay
  lightboxOverlay.classList.remove('active');
  document.body.style.overflow = '';
  lightboxExpander.style.opacity = '0';
}

// Navigate to next image (instant)
function nextImage(): void {
  if (!lightboxImage || galleryData.length <= 1) return;
  
  currentIndex = (currentIndex + 1) % galleryData.length;
  const item = galleryData[currentIndex];
  
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt || item.title;
}

// Navigate to previous image (instant)
function prevImage(): void {
  if (!lightboxImage || galleryData.length <= 1) return;
  
  currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
  const item = galleryData[currentIndex];
  
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt || item.title;
}

// Setup event listeners
function setupEventListeners(): void {
  if (!lightboxOverlay || !lightboxExpander) return;
  
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
    if (lightboxOverlay.classList.contains('active')) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxWidth = Math.min(viewportWidth * 0.9, 1200);
      const maxHeight = viewportHeight * 0.8;
      
      lightboxExpander.style.left = `${(viewportWidth - maxWidth) / 2}px`;
      lightboxExpander.style.top = `${(viewportHeight - maxHeight) / 2}px`;
      lightboxExpander.style.width = `${maxWidth}px`;
      lightboxExpander.style.height = `${maxHeight}px`;
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
  
  function handleSwipe(): void {
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

// Export for external use
export { openLightbox, closeLightbox };
