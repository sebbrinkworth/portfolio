/**
 * Initialize theme toggle functionality
 * Handles localStorage persistence and DOM class toggling.
 * 
 * @returns {void}
 */
export function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  // Apply stored theme on initialization
  const stored = localStorage.getItem("theme");
  if (stored === "dark") {
    root.classList.add("dark");
  } else if (stored === "light") {
    root.classList.remove("dark");
  }

  // Sync icon with current theme
  const syncIcon = () => {
    if (!icon) return;
    icon.textContent = root.classList.contains("dark") 
      ? "light_mode" 
      : "dark_mode";
  };

  syncIcon();

  // Exit early if toggle button doesn't exist
  if (!btn) return;

  // Toggle click handler
  btn.addEventListener("click", () => {
    root.classList.toggle("dark");
    localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
    syncIcon();
  });
}
