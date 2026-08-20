// =========================================================
// AEGIS PREFLIGHT — Contact Page
// Theme toggle (persisted) + basic form submit handling
// =========================================================

(function () {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const logo = document.getElementById('theme-logo');

  function updateLogo() {
    const theme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    logo.src = `../assets/images/logo-${theme}.png`;
  }

  // Restore saved theme, fallback to dark (matches home page default)
  const saved = localStorage.getItem('aegis-theme');
  if (saved === 'light' || saved === 'dark') {
    root.setAttribute('data-theme', saved);
  }
  updateLogo();

  toggleBtn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('aegis-theme', next);
    updateLogo();
  });
})();

// ---------- Team panel: scroll reveals one member detail at a time ----------
(function () {
  const area = document.getElementById('teamScrollArea');
  const track = document.getElementById('teamTrack');
  const progressFill = document.getElementById('teamProgressFill');
  if (!area || !track || !progressFill) return;

  const cards = Array.from(track.querySelectorAll('.member-card'));

  // Reveal each member as it becomes the active snapped panel.
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    root: track,
    threshold: 0.35
  });

  cards.forEach((card) => revealObserver.observe(card));

  // Keep the initial state focused on exactly one member.
  if (cards[0]) cards[0].classList.add('revealed');

  // Require a few wheel gestures before moving to the next member.
  let wheelDistance = 0;
  track.addEventListener('wheel', (event) => {
    event.preventDefault();
    wheelDistance += event.deltaY;

    const threshold = Math.max(180, track.clientHeight * 0.75);
    if (Math.abs(wheelDistance) < threshold) return;

    const direction = wheelDistance > 0 ? 1 : -1;
    wheelDistance = 0;
    track.scrollBy({
      top: direction * track.clientHeight,
      behavior: 'smooth'
    });
  }, { passive: false });

  track.addEventListener('mouseleave', () => {
    wheelDistance = 0;
  });

  // Progress bar reflecting the active member's scroll position.
  function updateProgress() {
    const max = track.scrollHeight - track.clientHeight;
    const pct = max > 0 ? (track.scrollTop / max) * 100 : 100;
    progressFill.style.width = Math.max(16.66, pct) + '%';
  }
  track.addEventListener('scroll', updateProgress);
  updateProgress();

  // Basic click-and-drag support for mouse users.
  let isDown = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageY;
    startScroll = track.scrollTop;
  });
  window.addEventListener('mouseup', () => { isDown = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    track.scrollTop = startScroll - (e.pageY - startX);
  });
})();

// ---------- Contact form ----------
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // TODO: wire this up to your actual backend / email endpoint.
    // Example:
    // fetch('/api/contact', { method: 'POST', body: new FormData(form) })

    note.textContent = "Thanks — we'll get back to you within 1 business day.";
    note.style.color = 'var(--accent)';
    form.reset();
  });
}