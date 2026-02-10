import type { RouteHandler, RouteMap } from '../types';

// Hash-based router for SPA navigation
const routes: RouteMap = new Map();
let currentRoute = '';

export function initRouter(): void {
  // Handle hash changes
  window.addEventListener('hashchange', handleRouteChange);
  
  // Handle initial load
  window.addEventListener('DOMContentLoaded', () => {
    handleRouteChange();
  });
  
  // Intercept all internal link clicks
  document.addEventListener('click', (e: MouseEvent) => {
    const link = (e.target as HTMLElement).closest('a[href^="#/"], a[href^="#"]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href && href.startsWith('#/')) {
        navigateTo(href);
      }
    }
  });
}

export function registerRoute(path: string, handler: RouteHandler): void {
  routes.set(path, handler);
}

export function navigateTo(path: string): void {
  if (path === currentRoute) return;
  
  window.location.hash = path;
}

function handleRouteChange(): void {
  const hash = window.location.hash || '#/';
  const path = hash.replace('#', '') || '/';
  
  // Find matching route
  let handler = routes.get(path);
  
  // Try exact match first, then pattern match for dynamic routes
  if (!handler) {
    for (const [routePath, routeHandler] of routes) {
      if (matchRoute(path, routePath)) {
        handler = routeHandler;
        break;
      }
    }
  }
  
  if (handler) {
    currentRoute = hash;
    handler(path);
    updateActiveNav(path);
    window.scrollTo(0, 0);
  } else {
    // 404 - default to home
    navigateTo('#/');
  }
}

function matchRoute(path: string, pattern: string): boolean {
  // Simple pattern matching - exact match for now
  return path === pattern;
}

function updateActiveNav(path: string): void {
  // Update active state on nav links
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.classList.remove('active');
    if ((el as HTMLElement).dataset.nav === path) {
      el.classList.add('active');
    }
  });
}

export function getCurrentRoute(): string {
  return currentRoute;
}
