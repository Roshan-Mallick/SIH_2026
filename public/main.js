// Theme toggle
(function () {
  const STORAGE_KEY = 'aegis-theme';

  function applyTheme(isLight) {
    document.body.classList.toggle('light-mode', isLight);
    document.querySelectorAll('.theme-icon').forEach(el => {
      el.textContent = isLight ? '☾' : '☼';
    });
    document.querySelectorAll('#theme-logo').forEach(img => {
      img.src = isLight ? 'assets/logo2.png' : 'assets/logo.png';
    });
    document.querySelectorAll('[aria-label="Switch theme"]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(isLight));
      btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    });
  }

  // Init from storage
  const stored = localStorage.getItem(STORAGE_KEY);
  const isLight = stored === 'light';
  applyTheme(isLight);

  // Wire up all toggle buttons
  document.querySelectorAll('#themeToggle, .theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = !document.body.classList.contains('light-mode');
      localStorage.setItem(STORAGE_KEY, next ? 'light' : 'dark');
      applyTheme(next);
    });
  });
})();
