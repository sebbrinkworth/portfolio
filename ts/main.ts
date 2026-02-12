import { initTheme } from './theme';
import { loadTimeline } from './timeline';
import { initRouter, registerRoute, navigateTo } from './router';
import { galleryCache, viewState } from './app-state';
import { escapeHtml } from './utils';
import type { GalleryItem } from '../types';

// DOM Elements for views
let homeView: HTMLElement | null, galleryView: HTMLElement | null;
let galleryGrid: HTMLElement | null, lightboxOverlay: HTMLElement | null, lightboxExpander: HTMLElement | null, lightboxImage: HTMLImageElement | null;

// Gallery state (session-only)
let currentGalleryIndex = 0;

// Initialize the SPA
async function initApp(): Promise<void> {
  // Cache DOM references
  homeView = document.getElementById('home-view');
  galleryView = document.getElementById('gallery-view');
  galleryGrid = document.getElementById('galleryGrid');
  lightboxOverlay = document.getElementById('lightboxOverlay');
  lightboxExpander = document.getElementById('lightboxExpander');
  lightboxImage = document.getElementById('lightboxImage') as HTMLImageElement | null;
  
  // Initialize theme
  initTheme();
  
  // Set footer year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
  
  // Register routes
  registerRoute('/', showHomeView);
  registerRoute('/gallery', showGalleryView);
  
  // Initialize router
  initRouter();
  
  // Load initial data for home view
  loadTimeline();
  
  // Setup gallery event listeners
  setupGalleryEventListeners();
}

// View switching functions
function showHomeView(): void {
  viewState.set('home');
  
  if (homeView) {
    homeView.style.display = 'block';
  }
  if (galleryView) {
    galleryView.style.display = 'none';
  }
  
  // Update gallery nav button
  updateGalleryNavButton('gallery');
  
  document.title = 'Sebastian Brinkworth - Full-Stack Developer';
}

async function showGalleryView(): Promise<void> {
  viewState.set('gallery');
  
  if (homeView) {
    homeView.style.display = 'none';
  }
  if (galleryView) {
    galleryView.style.display = 'block';
  }
  
  // Update gallery nav button (show back arrow)
  updateGalleryNavButton('home');
  
  document.title = 'Gallery — Sebastian Brinkworth';
  
  // Load gallery data if not cached
  if (!galleryCache.isLoaded()) {
    await loadGalleryData();
  }
  
  // Render gallery if not already rendered
  if (!galleryCache.isRendered()) {
    renderGallery();
  }
}

function updateGalleryNavButton(target: 'gallery' | 'home'): void {
  const navButton = document.getElementById('galleryNavButton') as HTMLAnchorElement | null;
  const navIcon = document.getElementById('galleryNavIcon');
  
  if (navButton && navIcon) {
    if (target === 'gallery') {
      navButton.href = '#/gallery';
      navButton.setAttribute('aria-label', 'View photo gallery');
      navIcon.textContent = 'photo_library';
    } else {
      navButton.href = '#/';
      navButton.setAttribute('aria-label', 'Back to CV');
      navIcon.textContent = 'description';
    }
  }
}

// Gallery data loading with session caching
async function loadGalleryData(): Promise<void> {
  try {
    const response = await fetch('/data/gallery.json');
    const data: GalleryItem[] = await response.json();
    galleryCache.set(data);
  } catch (error) {
    console.error('Failed to load gallery:', error);
    galleryCache.setError(error as Error);
  }
}

// Gallery rendering
function renderGallery(): void {
  const data = galleryCache.get();
  
  if (!data || data.length === 0) {
    showEmptyState();
    return;
  }
  
  if (!galleryGrid) return;
  
  galleryGrid.innerHTML = data.map((item, index) => {
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
  
  galleryCache.markRendered();
}

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

// Lightbox functions
function openLightbox(index: number): void {
  currentGalleryIndex = index;
  const data = galleryCache.get();
  
  if (!data || !data[index]) return;
  
  const item = data[currentGalleryIndex];
  
  if (lightboxImage) {
    lightboxImage.src = item.srcWebp || item.src;
    lightboxImage.alt = item.alt || item.title;
  }
  
  if (lightboxExpander) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxWidth = Math.min(viewportWidth * 0.9, 1200);
    const maxHeight = viewportHeight * 0.8;
    
    lightboxExpander.style.left = `${(viewportWidth - maxWidth) / 2}px`;
    lightboxExpander.style.top = `${(viewportHeight - maxHeight) / 2}px`;
    lightboxExpander.style.width = `${maxWidth}px`;
    lightboxExpander.style.height = `${maxHeight}px`;
    lightboxExpander.style.opacity = '1';
  }
  
  if (lightboxOverlay) {
    lightboxOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Update counter
  const counter = document.getElementById('lightboxCounter');
  if (counter) {
    counter.textContent = `${index + 1} / ${data.length}`;
  }
  
  // Update info
  const title = document.getElementById('lightboxTitle');
  const description = document.getElementById('lightboxDescription');
  if (title) title.textContent = item.title || '';
  if (description) description.textContent = item.description || '';
}

function closeLightbox(): void {
  if (lightboxOverlay) {
    lightboxOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (lightboxExpander) {
    lightboxExpander.style.opacity = '0';
  }
}

function nextImage(): void {
  const data = galleryCache.get();
  if (!data || data.length <= 1) return;
  
  currentGalleryIndex = (currentGalleryIndex + 1) % data.length;
  const item = data[currentGalleryIndex];
  
  if (lightboxImage) {
    lightboxImage.src = item.srcWebp || item.src;
    lightboxImage.alt = item.alt || item.title;
  }
  
  // Update counter
  const counter = document.getElementById('lightboxCounter');
  if (counter) {
    counter.textContent = `${currentGalleryIndex + 1} / ${data.length}`;
  }
  
  // Update info
  const title = document.getElementById('lightboxTitle');
  const description = document.getElementById('lightboxDescription');
  if (title) title.textContent = item.title || '';
  if (description) description.textContent = item.description || '';
}

function prevImage(): void {
  const data = galleryCache.get();
  if (!data || data.length <= 1) return;
  
  currentGalleryIndex = (currentGalleryIndex - 1 + data.length) % data.length;
  const item = data[currentGalleryIndex];
  
  if (lightboxImage) {
    lightboxImage.src = item.srcWebp || item.src;
    lightboxImage.alt = item.alt || item.title;
  }
  
  // Update counter
  const counter = document.getElementById('lightboxCounter');
  if (counter) {
    counter.textContent = `${currentGalleryIndex + 1} / ${data.length}`;
  }
  
  // Update info
  const title = document.getElementById('lightboxTitle');
  const description = document.getElementById('lightboxDescription');
  if (title) title.textContent = item.title || '';
  if (description) description.textContent = item.description || '';
}

// Event listeners
function setupGalleryEventListeners(): void {
  // Lightbox close on overlay click
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) {
        closeLightbox();
      }
    });
  }
  
  // Prevent clicks on expander from closing
  if (lightboxExpander) {
    lightboxExpander.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  
  // Lightbox close button
  const closeBtn = document.getElementById('lightboxClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }
  
  // Navigation buttons
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  if (prevBtn) prevBtn.addEventListener('click', prevImage);
  if (nextBtn) nextBtn.addEventListener('click', nextImage);
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightboxOverlay || !lightboxOverlay.classList.contains('active')) return;
    
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
  
  // Swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightboxOverlay.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }
  
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
  
  // Resize handler
  window.addEventListener('resize', () => {
    if (lightboxOverlay && lightboxOverlay.classList.contains('active')) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxWidth = Math.min(viewportWidth * 0.9, 1200);
      const maxHeight = viewportHeight * 0.8;
      
      if (lightboxExpander) {
        lightboxExpander.style.left = `${(viewportWidth - maxWidth) / 2}px`;
        lightboxExpander.style.top = `${(viewportHeight - maxHeight) / 2}px`;
        lightboxExpander.style.width = `${maxWidth}px`;
        lightboxExpander.style.height = `${maxHeight}px`;
      }
    }
  });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Expose for testing if needed
export { navigateTo, openLightbox, closeLightbox, galleryCache };
