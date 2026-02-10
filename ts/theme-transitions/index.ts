/**
 * Theme Transitions Module
 * 
 * Isolated module for theme switch animations.
 * Provides swappable transition strategies with a clean public API.
 * 
 * Usage:
 *   import { themeTransition, svgShapesStrategy, fadeStrategy } from './theme-transitions';
 *   
 *   // Use default (svg shapes)
 *   await themeTransition.transition('light-to-dark');
 *   
 *   // Swap strategy
 *   themeTransition.setStrategy(fadeStrategy);
 * 
 * @module theme-transitions
 */

// Types
export type { 
  TransitionOptions, 
  TransitionStrategy, 
  TransitionOrchestrator,
  ThemeDirection 
} from './types';

// Orchestrator (main API)
export { themeTransition, ThemeTransitionOrchestrator } from './orchestrator';

// Strategies (for swapping)
export { svgShapesStrategy } from './strategies';
export { fadeStrategy } from './strategies';
