/* =====================================================
   PORTOBILHARES — MAIN.JS
   ===================================================== */

/* ── Page load animation trigger ─────────────────── */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

/* ── Navbar scroll state ──────────────────────────── */
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile menu ──────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    hamburger.setAttribute('aria-expanded', String(open));
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('scroll', () => {
    if (mobileMenu.classList.contains('open')) closeMenu();
  }, { passive: true });
}

function closeMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  hamburger.setAttribute('aria-expanded', 'false');
}

/* ── Active nav link ──────────────────────────────── */
const page = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
  const href = a.getAttribute('href') || '';
  if (href === page || (page === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

/* ── Scroll reveal (IntersectionObserver) ─────────── */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));
}

/* ── Product filter ───────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card[data-cat]');

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      productCards.forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

/* ── Comparador antes/depois (Trabalhos Realizados) ── */
document.querySelectorAll('.ba-range').forEach(range => {
  const compare = range.closest('.ba-compare');
  if (!compare) return;
  const update = () => compare.style.setProperty('--pos', range.value + '%');
  range.addEventListener('input', update);
  update();
});

/* ── Form submission (demo — logs to console) ─────── */
function handleForm(formId, successId) {
  const form = document.getElementById(formId);
  const success = document.getElementById(successId);
  if (!form || !success) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'A enviar…'; }

    setTimeout(() => {
      form.reset();
      success.classList.add('visible');
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Enviar'; }
      setTimeout(() => success.classList.remove('visible'), 5000);
    }, 900);
  });
}

handleForm('contactForm', 'contactSuccess');
handleForm('quoteForm',   'quoteSuccess');
