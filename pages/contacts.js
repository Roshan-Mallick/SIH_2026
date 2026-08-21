// =========================================================
// AEGIS PREFLIGHT — Contact Page JS
// Theme toggle (persisted) + form submit + team scroll panel
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

// ---------- Team panel: scroll reveals one member at a time ----------
(function () {
  const track = document.getElementById('teamTrack');
  const progressFill = document.getElementById('teamProgressFill');
  if (!track || !progressFill) return;

  const cards = Array.from(track.querySelectorAll('.member-card'));

  // Reveal each member as it scrolls into view
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { root: track, threshold: 0.35 });

  cards.forEach((card) => revealObserver.observe(card));
  if (cards[0]) cards[0].classList.add('revealed');

  // Require a few wheel gestures before snapping to next member
  let wheelDistance = 0;
  track.addEventListener('wheel', (event) => {
    event.preventDefault();
    wheelDistance += event.deltaY;
    const threshold = Math.max(180, track.clientHeight * 0.75);
    if (Math.abs(wheelDistance) < threshold) return;
    const direction = wheelDistance > 0 ? 1 : -1;
    wheelDistance = 0;
    track.scrollBy({ top: direction * track.clientHeight, behavior: 'smooth' });
  }, { passive: false });

  track.addEventListener('mouseleave', () => { wheelDistance = 0; });

  // Progress bar
  function updateProgress() {
    const max = track.scrollHeight - track.clientHeight;
    const pct = max > 0 ? (track.scrollTop / max) * 100 : 100;
    progressFill.style.width = Math.max(16.66, pct) + '%';
  }
  track.addEventListener('scroll', updateProgress);
  updateProgress();

  // Click-and-drag for mouse users
  let isDown = false, startY = 0, startScroll = 0;
  track.addEventListener('mousedown', (e) => { isDown = true; startY = e.pageY; startScroll = track.scrollTop; });
  window.addEventListener('mouseup', () => { isDown = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    track.scrollTop = startScroll - (e.pageY - startY);
  });
})();

// ---------- Contact form ----------
// Submissions are relayed to the team's Discord via a Supabase Edge Function
// (contact-webhook). The Discord webhook itself stays server-side as a secret.
const CONTACT_FUNCTION_URL = 'https://aiexfmkkvqacyxrgjdgl.supabase.co/functions/v1/contact-webhook';
const CONTACT_ANON_KEY = window.__AEGIS_SUPABASE_CONFIG__?.anonKey || 'sb_publishable_c1tgCLDnsaa4qVSHLWH_9g_1WIU9Hwp';

const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      topic: document.getElementById('topic').value,
      message: document.getElementById('message').value,
    };

    submitBtn.disabled = true;
    note.textContent = 'Sending your message...';
    note.style.color = 'var(--muted)';

    try {
      const res = await fetch(CONTACT_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': CONTACT_ANON_KEY },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Message could not be sent.');
      }

      note.textContent = "Thanks — we'll get back to you within 1 business day.";
      note.style.color = 'var(--accent)';
      form.reset();
    } catch (err) {
      note.textContent = err.message || 'Something went wrong. Please try again.';
      note.style.color = '#ff4d4d';
    } finally {
      submitBtn.disabled = false;
    }
  });
}
