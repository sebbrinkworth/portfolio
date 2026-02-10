export function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");
  const avatar = document.getElementById("avatar");

  const stored = localStorage.getItem("theme");
  if (stored === "dark") root.classList.add("dark");
  if (stored === "light") root.classList.remove("dark");

  const syncIcon = () => {
    if (!icon) return;
    icon.textContent = root.classList.contains("dark") ? "light_mode" : "dark_mode";
  };

  syncIcon();

  if (!btn) return;

  btn.addEventListener("click", () => {
    const isDark = root.classList.contains("dark");

    if (avatar) {
      avatar.classList.toggle("flipped");
    }

    if (document.startViewTransition) {
      // Add theme class for specific theme transition styling
      root.classList.add("view-transition-theme");

      document.startViewTransition(() => {
        root.classList.toggle("dark");
        localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
        syncIcon();
      });

      // Clean up theme class after transition
      setTimeout(() => {
        root.classList.remove("view-transition-theme");
      }, 1100);
    } else {
      root.classList.toggle("dark");
      localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
      syncIcon();
    }
  });
}