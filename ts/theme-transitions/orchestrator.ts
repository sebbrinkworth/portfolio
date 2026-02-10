/**
 * Theme Transition Orchestrator
 * 
 * Central controller for theme transition animations.
 * Manages the animation lifecycle and handles theme switching
 * at the optimal moment during the animation.
 */

import type { TransitionOrchestrator, TransitionStrategy, ThemeDirection } from './types';
import { svgShapesStrategy } from './strategies';

class ThemeTransitionOrchestrator implements TransitionOrchestrator {
  private strategy: TransitionStrategy;
  private running: boolean = false;
  
  constructor(defaultStrategy: TransitionStrategy = svgShapesStrategy) {
    this.strategy = defaultStrategy;
  }
  
  getStrategy(): TransitionStrategy {
    return this.strategy;
  }
  
  setStrategy(strategy: TransitionStrategy): void {
    this.strategy = strategy;
  }
  
  isRunning(): boolean {
    return this.running;
  }
  
  async transition(direction: ThemeDirection): Promise<void> {
    // Prevent concurrent transitions
    if (this.running) {
      console.warn('[ThemeTransition] Transition already in progress');
      return;
    }
    
    this.running = true;
    
    // Detect mobile for simplified animation
    const isMobile = this.isMobileDevice();
    
    try {
      // Perform the transition animation
      await this.strategy.animate({
        direction,
        isMobile,
        onHalfway: () => {
          // This is where the theme actually changes
          // The overlay is covering the screen at this point
          this.applyThemeChange(direction);
        },
        onComplete: () => {
          // Animation complete, cleanup already done by strategy
        }
      });
    } catch (error) {
      console.error('[ThemeTransition] Transition failed:', error);
      // Fallback: just apply theme change directly
      this.applyThemeChange(direction);
    } finally {
      this.running = false;
    }
  }
  
  private applyThemeChange(direction: ThemeDirection): void {
    const root = document.documentElement;
    
    if (direction === 'light-to-dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Update icon if exists
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.textContent = root.classList.contains('dark') 
        ? 'light_mode' 
        : 'dark_mode';
    }
    
    // Update avatar if exists
    const avatarImg = document.getElementById('avatarImg') as HTMLImageElement | null;
    if (avatarImg) {
      const isDark = root.classList.contains('dark');
      const newSrc = isDark 
        ? avatarImg.dataset.dark 
        : avatarImg.dataset.light;
      const fallbackSrc = avatarImg.dataset.light;
      
      if (newSrc && avatarImg.src !== newSrc) {
        // Preload image to check if it exists
        const testImg = new Image();
        testImg.onload = () => {
          avatarImg.src = newSrc;
        };
        testImg.onerror = () => {
          // Fallback to light image if dark image doesn't exist
          if (fallbackSrc) avatarImg.src = fallbackSrc;
        };
        testImg.src = newSrc;
      }
    }
    
    // Persist to localStorage
    localStorage.setItem('theme', 
      root.classList.contains('dark') ? 'dark' : 'light'
    );
  }
  
  private isMobileDevice(): boolean {
    // Check for touch device AND small viewport
    const hasTouch = window.matchMedia('(pointer: coarse)').matches;
    const isSmallViewport = window.innerWidth < 768;
    return hasTouch && isSmallViewport;
  }
}

// Export singleton instance
export const themeTransition = new ThemeTransitionOrchestrator();

// Also export class for testing/custom instances
export { ThemeTransitionOrchestrator };
