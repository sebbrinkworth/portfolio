/**
 * SVG Shapes Transition Strategy
 * 
 * Ported from: https://codepen.io/GreenSock/pen/qBedXpg
 * Uses GSAP to animate organic wave-like SVG path overlays.
 * 
 * Features:
 * - Theme-appropriate colors (dark shapes for light→dark, vice versa)
 * - Mobile detection with simplified version (fewer points)
 * - High performance using GSAP's optimized animation engine
 */

import { gsap } from 'gsap';
import type { TransitionStrategy, TransitionOptions, ThemeDirection } from '../types';

// Theme-appropriate color palettes
const COLOR_PALETTES: Record<ThemeDirection, { paths: string[] }> = {
  'light-to-dark': {
    // Dark colors that appear when transitioning to dark theme
    paths: ['#1a1814', '#262420']
  },
  'dark-to-light': {
    // Light colors that appear when transitioning to light theme
    paths: ['#fdfbf7', '#f5f3ef']
  }
};

export class SvgShapesStrategy implements TransitionStrategy {
  readonly id = 'svg-shapes';
  readonly name = 'SVG Wave Overlay';
  
  private svg: SVGElement | null = null;
  private paths: SVGPathElement[] = [];
  private overlay: HTMLElement | null = null;
  
  async animate(options: TransitionOptions): Promise<void> {
    const { direction, isMobile = false, onHalfway, onComplete } = options;
    
    // Create or get overlay
    this.createOverlay(direction, isMobile);
    
    // Animation parameters - optimized for speed
    const numPoints = isMobile ? 5 : 8; // Simplified for mobile
    const delayPointsMax = 0.15; // Reduced from 0.3
    const delayPerPath = 0.12; // Reduced from 0.25
    const duration = isMobile ? 0.35 : 0.5; // Faster: 0.5s desktop, 0.35s mobile
    
    // Initialize points
    const allPoints: number[][] = [];
    const pointsDelay: number[] = [];
    const numPaths = this.paths.length;
    
    for (let i = 0; i < numPaths; i++) {
      const points: number[] = [];
      allPoints.push(points);
      for (let j = 0; j < numPoints; j++) {
        points.push(100); // Start fully open
      }
    }
    
    // Create GSAP timeline
    const tl = gsap.timeline({
      onUpdate: () => this.render(numPoints, numPaths, allPoints, true),
      onComplete: () => {
        // Animation finished, trigger cleanup
        if (onComplete) onComplete();
        this.destroy();
      }
    });
    
    // Calculate random delays
    for (let i = 0; i < numPoints; i++) {
      pointsDelay[i] = Math.random() * delayPointsMax;
    }
    
    // Phase 1: Close (cover screen) - shapes come in
    for (let i = 0; i < numPaths; i++) {
      const points = allPoints[i];
      const pathDelay = delayPerPath * i;
      
      for (let j = 0; j < numPoints; j++) {
        const delay = pointsDelay[j];
        tl.to(points, {
          [j]: 0, // Animate to closed (0)
          duration: duration,
          ease: 'power2.inOut'
        }, delay + pathDelay);
      }
    }
    
    // Calculate when screen is fully covered (end of Phase 1)
    const phase1Duration = duration + delayPointsMax + (delayPerPath * (numPaths - 1));
    
    // Call halfway callback when fully covered
    tl.call(() => {
      if (onHalfway) onHalfway();
    }, [], phase1Duration * 0.8); // Trigger at 80% of phase 1 (when mostly covered)
    
    // Phase 2: Open (reveal new theme) - shapes exit
    // Start shortly before phase 1 ends for smoother transition
    const phase2Start = phase1Duration * 0.85;
    
    for (let i = 0; i < numPaths; i++) {
      const points = allPoints[i];
      const pathDelay = delayPerPath * (numPaths - i - 1);
      
      for (let j = 0; j < numPoints; j++) {
        const delay = pointsDelay[j];
        tl.to(points, {
          [j]: 100, // Animate back to open
          duration: duration,
          ease: 'power2.inOut'
        }, phase2Start + delay + pathDelay);
      }
    }
    
    // Wait for completion
    return new Promise((resolve) => {
      tl.eventCallback('onComplete', () => {
        resolve();
      });
    });
  }
  
  private createOverlay(direction: ThemeDirection, isMobile: boolean): void {
    // Remove existing overlay if present
    this.destroy();
    
    const colors = COLOR_PALETTES[direction];
    
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'theme-transition-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      pointer-events: none;
      contain: strict;
    `;
    
    // Create SVG
    const svgNS = 'http://www.w3.org/2000/svg';
    this.svg = document.createElementNS(svgNS, 'svg');
    this.svg.setAttribute('viewBox', '0 0 100 100');
    this.svg.setAttribute('preserveAspectRatio', 'none');
    this.svg.style.cssText = `
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    `;
    
    // Create paths
    for (let i = 0; i < 2; i++) {
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('fill', colors.paths[i] || colors.paths[0]);
      path.classList.add('shape-overlays__path');
      this.svg.appendChild(path);
      this.paths.push(path);
    }
    
    this.overlay.appendChild(this.svg);
    document.body.appendChild(this.overlay);
  }
  
  private render(
    numPoints: number,
    numPaths: number,
    allPoints: number[][],
    isOpened: boolean
  ): void {
    for (let i = 0; i < numPaths; i++) {
      const path = this.paths[i];
      const points = allPoints[i];
      
      if (!path || !points) continue;
      
      let d = '';
      // Start point
      d += isOpened ? `M 0 0 V ${points[0]} C` : `M 0 ${points[0]} C`;
      
      // Bezier curves
      for (let j = 0; j < numPoints - 1; j++) {
        const p = ((j + 1) / (numPoints - 1)) * 100;
        const cp = p - (1 / (numPoints - 1) * 100) / 2;
        d += ` ${cp} ${points[j]} ${cp} ${points[j + 1]} ${p} ${points[j + 1]}`;
      }
      
      // End point
      d += isOpened ? ` V 100 H 0` : ` V 0 H 0`;
      path.setAttribute('d', d);
    }
  }
  
  private destroy(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
    this.svg = null;
    this.paths = [];
  }
}

// Export singleton instance
export const svgShapesStrategy = new SvgShapesStrategy();
