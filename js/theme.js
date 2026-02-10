export function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

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
    root.classList.toggle("dark");
    localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
    syncIcon();
  });
}
