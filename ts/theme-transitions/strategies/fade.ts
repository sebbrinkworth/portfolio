/**
 * Fade Transition Strategy
 * 
 * Simple crossfade animation as a lightweight alternative.
 * Uses CSS transitions for maximum performance.
 */

import type { TransitionStrategy, TransitionOptions, ThemeDirection } from '../types';

const COLOR_PALETTES: Record<ThemeDirection, string> = {
  'light-to-dark': '#1a1814',
  'dark-to-light': '#fdfbf7'
};

export class FadeStrategy implements TransitionStrategy {
  readonly id = 'fade';
  readonly name = 'Crossfade';
  
  private overlay: HTMLElement | null = null;
  
  async animate(options: TransitionOptions): Promise<void> {
    const { direction, onHalfway, onComplete } = options;
    
    this.createOverlay(direction);
    
    return new Promise((resolve) => {
      if (!this.overlay) {
        resolve();
        return;
      }
      
      // Phase 1: Fade in (cover screen)
      requestAnimationFrame(() => {
        this.overlay!.style.opacity = '1';
        
        // Halfway - switch theme
        setTimeout(() => {
          if (onHalfway) onHalfway();
          
          // Phase 2: Fade out (reveal new theme)
          requestAnimationFrame(() => {
            this.overlay!.style.opacity = '0';
            
            // Complete
            setTimeout(() => {
              this.destroy();
              if (onComplete) onComplete();
              resolve();
            }, 300);
          });
        }, 300);
      });
    });
  }
  
  private createOverlay(direction: ThemeDirection): void {
    this.destroy();
    
    this.overlay = document.createElement('div');
    this.overlay.className = 'theme-transition-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${COLOR_PALETTES[direction]};
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      contain: strict;
    `;
    
    document.body.appendChild(this.overlay);
  }
  
  private destroy(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
  }
}

// Export singleton instance
export const fadeStrategy = new FadeStrategy();
