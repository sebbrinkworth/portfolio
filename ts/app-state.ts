import type { GalleryItem, ViewName, Theme } from '../types';

/** Gallery cache state structure */
interface GalleryCacheState {
  data: GalleryItem[] | null;
  rendered: boolean;
  error: Error | null;
}

/** Complete application state */
interface AppState {
  gallery: GalleryCacheState;
  currentView: ViewName | null;
  theme: Theme;
}

// Session-only state management (data clears on page refresh/tab close)
const state: AppState = {
  gallery: {
    data: null,
    rendered: false,
    error: null
  },
  currentView: null,
  theme: (localStorage.getItem('theme') as Theme) || 'light'
};

// Gallery cache operations
export const galleryCache = {
  get(): GalleryItem[] | null {
    return state.gallery.data;
  },
  
  set(data: GalleryItem[]): void {
    state.gallery.data = data;
    state.gallery.error = null;
  },
  
  isLoaded(): boolean {
    return state.gallery.data !== null;
  },
  
  isRendered(): boolean {
    return state.gallery.rendered;
  },
  
  markRendered(): void {
    state.gallery.rendered = true;
  },
  
  setError(error: Error): void {
    state.gallery.error = error;
  },
  
  getError(): Error | null {
    return state.gallery.error;
  },
  
  clear(): void {
    state.gallery.data = null;
    state.gallery.rendered = false;
    state.gallery.error = null;
  }
};

// Current view state
export const viewState = {
  get(): ViewName | null {
    return state.currentView;
  },
  
  set(view: ViewName): void {
    state.currentView = view;
  }
};

// Theme persistence (this one CAN use localStorage since it's user preference)
export const themeState = {
  get(): Theme {
    return state.theme;
  },
  
  set(theme: Theme): void {
    state.theme = theme;
    localStorage.setItem('theme', theme);
  }
};

// Debug helper (only in development)
declare global {
  interface ImportMeta {
    env?: {
      DEV?: boolean;
    };
  }
}

if ((import.meta as ImportMeta).env?.DEV || (typeof location !== 'undefined' && location.hostname === 'localhost')) {
  (window as unknown as { __appState: AppState }).__appState = state;
}
