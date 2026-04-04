/* ===================================================
   BASKETBALL PLAYER CAMP — Main JS
   =================================================== */

// --- Mode démo (auto-scroll) : ajouter ?demo à l'URL ---
(function initDemo() {
  if (!new URLSearchParams(window.location.search).has('demo')) return;

  const sections = ['#home', '#about', '#features', '#gallery', '#instagram', '#register'];
  const durations = [3000, 3500, 4000, 3500, 3000, 3000]; // ms sur chaque section

  // Bannière démo
  const banner = document.createElement('div');
  banner.style.cssText = [
    'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
    'background:rgba(255,107,0,0.95)', 'color:#fff', 'padding:10px 24px',
    'border-radius:100px', 'font-family:Barlow Condensed,sans-serif',
    'font-size:0.9rem', 'font-weight:700', 'letter-spacing:0.1em',
    'text-transform:uppercase', 'z-index:9999', 'pointer-events:none',
    'backdrop-filter:blur(8px)'
  ].join(';');
  banner.textContent = '🎬 MODE DÉMO — BasketBall Player Camp';
  document.body.appendChild(banner);

  let i = 0;
  function scrollToNext() {
    if (i >= sections.length) {
      banner.textContent = '✅ Fin de la démo';
      setTimeout(() => banner.remove(), 2000);
      return;
    }
    const el = document.querySelector(sections[i]);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    i++;
    setTimeout(scrollToNext, durations[i - 1]);
  }

  // Petite pause avant de démarrer
  setTimeout(scrollToNext, 1500);
})();

// --- Nav: scroll effect ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// --- Nav: mobile burger ---
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  burger.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});
// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// --- Scroll reveal animation ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll(
  '.feature-card, .gallery__item, .stats__item, .about__grid, .coach__quote, .register__inner'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// --- Stats counter animation ---
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stats__number').forEach(el => {
        const target = el.textContent;
        if (!isNaN(parseInt(target))) {
          animateCounter(el, 0, parseInt(target), 1200);
        }
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) statsObserver.observe(statsSection);

function animateCounter(el, start, end, duration) {
  const startTime = performance.now();
  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (end - start) * eased);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ===================================================
// PROTECTION DES IMAGES
// ===================================================

(function protectImages() {
  // 1. Bloquer le clic droit sur toutes les images
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('.gallery__item, .about__img-wrap, .coach__visual')) {
      e.preventDefault();
    }
  });

  // 2. Bloquer le glisser-déposer des images
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });

  // 3. Bloquer Ctrl/Cmd+S (enregistrer la page) et Ctrl/Cmd+U (voir le source)
  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const mod   = isMac ? e.metaKey : e.ctrlKey;
    if (mod && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
    }
  });

  // 4. Désactiver la sélection de texte/images par clic long (mobile)
  document.querySelectorAll('img').forEach(img => {
    img.setAttribute('draggable', 'false');
    img.addEventListener('selectstart', (e) => e.preventDefault());
    // Clic long mobile (callout menu iOS/Android)
    img.style.webkitTouchCallout = 'none';
    img.style.userSelect = 'none';
  });
})();

// --- Gallery: lightbox placeholder ---
document.querySelectorAll('.gallery__item').forEach(item => {
  item.addEventListener('click', () => {
    console.log('Lightbox: add real images to enable gallery viewer');
  });
});

// --- Form submit (async → /api/register) ---
const form = document.getElementById('registerForm');
const submitBtn = document.getElementById('submitBtn');
const formFeedback = document.getElementById('formFeedback');

function setFeedback(msg, isError = false) {
  formFeedback.textContent = msg;
  formFeedback.className = 'form__feedback ' + (isError ? 'form__feedback--error' : 'form__feedback--success');
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setFeedback('');

    // Check Turnstile token
    const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
    if (!turnstileInput || !turnstileInput.value) {
      setFeedback('Merci de valider le CAPTCHA.', true);
      return;
    }

    // Loading state
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    try {
      const body = Object.fromEntries(new FormData(form));
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback('✓ Demande envoyée ! On revient vers toi dans les 48h.');
        form.reset();
        // Reset Turnstile widget
        if (window.turnstile) window.turnstile.reset();
        submitBtn.textContent = originalLabel;
        submitBtn.disabled = false;
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      setFeedback(err.message || 'Une erreur est survenue. Réessaie.', true);
      submitBtn.textContent = originalLabel;
      submitBtn.disabled = false;
      if (window.turnstile) window.turnstile.reset();
    }
  });
}
