/**
 * Type definitions for application data structures
 * These interfaces match the JSON schema of data files
 */

/** Represents a skill entry from skills.json */
export interface Skill {
  icon: string;
  label: string;
}

/** Represents a timeline entry from timeline.json */
export interface TimelineItem {
  dates: string;
  role: string;
  org: string;
  location: string;
  desc: string;
  skills?: string[];
}

/** Represents a gallery image entry from gallery.json */
export interface GalleryItem {
  src: string;
  srcWebp?: string;
  thumbnail?: string;
  thumbnailWebp?: string;
  alt?: string;
  title: string;
  description?: string;
  ratio?: 'square' | 'portrait' | 'landscape';
}

/** View names for the SPA */
export type ViewName = 'home' | 'gallery';

/** Theme preference */
export type Theme = 'light' | 'dark';

/** Gallery cache state */
export interface GalleryCacheState {
  data: GalleryItem[] | null;
  rendered: boolean;
  error: Error | null;
}

/** Complete application state */
export interface AppState {
  gallery: GalleryCacheState;
  currentView: ViewName | null;
  theme: Theme;
}

/** Route handler function type */
export type RouteHandler = (path: string) => void;

/** Route registration map */
export type RouteMap = Map<string, RouteHandler>;

/** Vector field configuration */
export interface VectorFieldConfig {
  cell: number;
  radius: number;
  baseOpacity: number;
  peakOpacity: number;
  cursorSmooth: number;
  rotSmooth: number;
  opSmooth: number;
  updateBudget: number;
  overscan: number;
}

/** Vector field dash element */
export interface VectorFieldDash {
  el: HTMLSpanElement;
  x: number;
  y: number;
  rot: number;
  op: number;
}
