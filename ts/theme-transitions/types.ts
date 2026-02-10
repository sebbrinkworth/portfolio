/**
 * Theme Transition Types
 * 
 * Isolated type definitions for theme transition animations.
 * This module is completely decoupled from the rest of the application.
 */

export type ThemeDirection = 'light-to-dark' | 'dark-to-light';

export interface TransitionOptions {
  /** Direction of theme change */
  direction: ThemeDirection;
  /** Whether to use simplified mobile animation */
  isMobile?: boolean;
  /** Duration in seconds */
  duration?: number;
  /** Called when animation is halfway (theme should switch) */
  onHalfway?: () => void;
  /** Called when animation completes */
  onComplete?: () => void;
}

export interface TransitionStrategy {
  /** Unique identifier */
  readonly id: string;
  /** Display name */
  readonly name: string;
  /** Execute the transition animation */
  animate(options: TransitionOptions): Promise<void>;
}

export interface TransitionOrchestrator {
  /** Current active strategy */
  getStrategy(): TransitionStrategy;
  /** Set animation strategy */
  setStrategy(strategy: TransitionStrategy): void;
  /** Execute theme transition */
  transition(direction: ThemeDirection): Promise<void>;
  /** Check if transition is currently running */
  isRunning(): boolean;
}
