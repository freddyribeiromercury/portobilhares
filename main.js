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

function applyFilter(filter) {
  filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
  productCards.forEach(card => {
    const show = filter === 'all' || card.dataset.cat === filter;
    card.style.display = show ? '' : 'none';
  });
}

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  /* categoria vinda de bilhares.html?cat=…; por defeito abre em Snooker */
  const wanted = new URLSearchParams(window.location.search).get('cat');
  if (wanted && [...filterBtns].some(b => b.dataset.filter === wanted)) {
    applyFilter(wanted);
  } else {
    applyFilter('snooker');
  }
}

/* ── Lightbox de produtos ─────────────────────────── */
/* construído só nas páginas com cards sem data-href (ex.: bilhares.html) */
function buildLightbox() {
  const icon = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Pré-visualização do produto');
  lightbox.innerHTML = `
    <div class="lightbox-figure">
      <div class="lightbox-counter"></div>
      <button class="lightbox-btn lightbox-close" type="button" aria-label="Fechar">${icon('<path d="M18 6 6 18M6 6l12 12"/>')}</button>
      <button class="lightbox-btn lightbox-prev" type="button" aria-label="Produto anterior">${icon('<path d="M15 18 9 12l6-6"/>')}</button>
      <button class="lightbox-btn lightbox-next" type="button" aria-label="Produto seguinte">${icon('<path d="m9 18 6-6-6-6"/>')}</button>
      <img class="lightbox-img" alt="">
      <video class="lightbox-video" controls playsinline preload="metadata" style="display:none"></video>
      <div class="lightbox-caption">
        <div class="product-type"></div>
        <div class="product-name"></div>
        <div class="product-desc"></div>
      </div>
    </div>`;
  document.body.appendChild(lightbox);

  const lbImg     = lightbox.querySelector('.lightbox-img');
  const lbVideo   = lightbox.querySelector('.lightbox-video');
  const lbType    = lightbox.querySelector('.lightbox-caption .product-type');
  const lbName    = lightbox.querySelector('.lightbox-caption .product-name');
  const lbDesc    = lightbox.querySelector('.lightbox-caption .product-desc');
  const lbCounter = lightbox.querySelector('.lightbox-counter');
  const lbPrev    = lightbox.querySelector('.lightbox-prev');
  const lbNext    = lightbox.querySelector('.lightbox-next');

  /* slides: cada entrada é { src, alt, type, name, desc } */
  let slides = [];
  let current = 0;
  let lastFocused = null;

  const text = (card, sel) => {
    const el = card.querySelector(sel);
    return el ? el.textContent.trim() : '';
  };

  function stopVideo() {
    lbVideo.pause();
    lbVideo.removeAttribute('src');
    lbVideo.load();
    lbVideo.style.display = 'none';
  }

  function show(i) {
    const slide = slides[i];
    if (!slide) return;
    current = i;
    if (slide.video) {
      stopVideo();
      lbVideo.src = slide.video;
      lbVideo.style.display = '';
      lbImg.style.display = 'none';
      lbImg.removeAttribute('src');
    } else {
      stopVideo();
      lbImg.src = slide.src;
      lbImg.alt = slide.alt || '';
      lbImg.style.display = '';
    }
    lbType.textContent = slide.type;
    lbName.textContent = slide.name;
    lbDesc.textContent = slide.desc;
    lbCounter.textContent = `${i + 1} / ${slides.length}`;
    const many = slides.length > 1;
    lbPrev.style.display = many ? '' : 'none';
    lbNext.style.display = many ? '' : 'none';
    lbCounter.style.display = many ? '' : 'none';
  }

  const step = dir => show((current + dir + slides.length) % slides.length);

  function openLightbox(card) {
    const type = text(card, '.product-type');
    const name = text(card, '.product-name');
    const desc = text(card, '.product-desc');
    const gallery = card.dataset.gallery;

    if (gallery) {
      /* card com galeria própria: navega pelas fotos deste produto */
      slides = gallery.split('|').filter(Boolean).map(src => ({
        src, alt: name, type, name, desc,
      }));
      current = 0;
    } else {
      /* comportamento padrão: navega pelos cards visíveis */
      const visibleCards = [...productCards].filter(c => c.style.display !== 'none' && !c.dataset.gallery);
      slides = visibleCards.map(c => {
        const media = c.querySelector('.product-card-bg');
        const isImg = media && media.tagName === 'IMG';
        return {
          src: isImg ? media.getAttribute('src') : '',
          video: c.dataset.video || '',
          alt: c.dataset.alt || (isImg ? (media.getAttribute('alt') || '') : ''),
          type: text(c, '.product-type'),
          name: text(c, '.product-name'),
          desc: text(c, '.product-desc'),
        };
      });
      current = visibleCards.indexOf(card);
      if (current === -1) return;
    }

    lastFocused = document.activeElement;
    show(current);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
  }

  function closeLightbox() {
    stopVideo();
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target.closest('.lightbox-close')) closeLightbox();
    else if (e.target.closest('.lightbox-prev')) step(-1);
    else if (e.target.closest('.lightbox-next')) step(1);
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  return openLightbox;
}

/* ── Interação dos cards de produto ───────────────── */
if (productCards.length) {
  /* index.html: todos os cards têm data-href → não há preview a construir */
  const openLightbox = [...productCards].some(c => !c.dataset.href) ? buildLightbox() : null;

  productCards.forEach(card => {
    /* cards com data-href navegam; os restantes abrem o preview */
    const href = card.dataset.href;
    const activate = () => {
      if (href) window.location.href = href;
      else if (openLightbox) openLightbox(card);
    };
    card.setAttribute('role', href ? 'link' : 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || (e.key === ' ' && !href)) {
        e.preventDefault();
        activate();
      }
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
