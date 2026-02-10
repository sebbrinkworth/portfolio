/**
 * Initialize theme toggle functionality
 * Handles localStorage persistence, DOM class toggling,
 * and animated theme transitions using the isolated transition module.
 * 
 * @returns void
 */
import { themeTransition } from './theme-transitions';

export function initTheme(): void {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");
  const avatarImg = document.getElementById("avatarImg") as HTMLImageElement | null;

  // Apply stored theme on initialization (no animation on page load)
  const stored = localStorage.getItem("theme");
  if (stored === "dark") {
    root.classList.add("dark");
  } else if (stored === "light") {
    root.classList.remove("dark");
  }

  // Sync icon with current theme
  const syncIcon = (): void => {
    if (!icon) return;
    icon.textContent = root.classList.contains("dark") 
      ? "light_mode" 
      : "dark_mode";
  };

  // Sync avatar with current theme
  const syncAvatar = (): void => {
    if (!avatarImg) return;
    const isDark = root.classList.contains("dark");
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
  };

  syncIcon();
  syncAvatar();

  // Exit early if toggle button doesn't exist
  if (!btn) return;

  // Toggle click handler with animation
  btn.addEventListener("click", async () => {
    // Determine direction
    const isCurrentlyDark = root.classList.contains("dark");
    const direction = isCurrentlyDark ? 'dark-to-light' : 'light-to-dark';
    
    // Prevent clicks during transition
    if (themeTransition.isRunning()) {
      return;
    }
    
    // Execute animated transition
    await themeTransition.transition(direction);
  });
}
