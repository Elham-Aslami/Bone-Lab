// Apply the saved theme before styles paint, including when model loading fails.
(() => {
  const key = 'biol270-bone-lab-theme';
  const root = document.documentElement;
  let theme = 'dark';
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch { /* The toggle still works when browser storage is unavailable. */ }

  function apply(next) {
    theme = next;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101a18' : '#173e38');
    const button = document.getElementById('theme-toggle');
    if (button) {
      const target = theme === 'dark' ? 'light' : 'dark';
      button.querySelector('.theme-label').textContent = `${target === 'light' ? 'Light' : 'Dark'} mode`;
      button.setAttribute('aria-label', `Switch to ${target} mode`);
      button.title = `Switch to ${target} mode`;
    }
    window.dispatchEvent(new CustomEvent('bonelab:themechange', {detail: theme}));
  }

  apply(theme);
  document.addEventListener('DOMContentLoaded', () => {
    apply(theme);
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      apply(theme === 'dark' ? 'light' : 'dark');
      try { localStorage.setItem(key, theme); } catch { /* Keep the session preference. */ }
    });
  }, {once: true});
  window.addEventListener('storage', event => {
    if (event.key === key && (event.newValue === 'light' || event.newValue === 'dark')) apply(event.newValue);
  });
})();
