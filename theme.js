// Apply the theme before the stylesheet loads to avoid a flash on refresh.
(() => {
  const storageKey = 'codeseek-theme';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch { /* Theme switching also works when browser storage is unavailable. */ }

  function applyTheme() {
    const dark = (preference || (systemTheme.matches ? 'dark' : 'light')) === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#161616' : '#f5f5f5';
    const toggle = document.querySelector('#theme-toggle');
    if (toggle) {
      const mode = `SideFX/Houdini ${dark ? 'Dark' : 'Light'}`;
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', `${mode} mode`);
      toggle.title = `Switch to SideFX/Houdini ${dark ? 'Light' : 'Dark'} mode`;
      toggle.querySelector('.theme-label').textContent = mode;
    }
  }

  applyTheme();
  systemTheme.addEventListener('change', () => {
    if (!preference) applyTheme();
  });
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    document.querySelector('#theme-toggle').addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(storageKey, preference); } catch { /* Keep the session preference. */ }
      applyTheme();
    });
  });
})();
