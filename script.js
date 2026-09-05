'use strict';

/* ==============================
   Constants
============================== */
const MOBILE_BREAKPOINT = 992;
const SLIDER_INTERVAL_MS = 4200;
const HEADER_SCROLL_PX = 20;
const PORTFOLIO_FADE_MS = 560;
const NEW_BADGE_WINDOW_DAYS = 14;

const TYPEWRITER_WORDS = ['طراح گرافیک', 'دیزاینر بصری', 'خلاق و متفاوت'];
const TYPEWRITER_TYPE_MS = 75;
const TYPEWRITER_DELETE_MS = 35;
const TYPEWRITER_HOLD_MS = 2200;
const TYPEWRITER_SWAP_MS = 380;
const TYPEWRITER_START_MS = 1100;

const SKILL_CIRCUMFERENCE = 326.725;

/* ==============================
   DOM References
============================== */
const body = document.body;
const siteHeader = document.getElementById('siteHeader');
const themeToggle = document.getElementById('theme-toggle');
const mobileThemeTgl = document.getElementById('mobileThemeToggle');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-menu a');
const catTabs = document.querySelectorAll('.cat-tab');
const portfolioItems = document.querySelectorAll('.portfolio-item');
const pageLoader = document.getElementById('pageLoader');
const cursorGlow = document.getElementById('cursorGlow');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxBd = document.getElementById('lightboxBackdrop');
const revealEls = document.querySelectorAll('.reveal');
const catTabsWrap = document.getElementById('catTabs');
const catIndicator = document.getElementById('catTabIndicator');
const catSticky = document.querySelector('.cat-tabs-sticky');

/* ==============================
   State
============================== */
let scrollLockCount = 0;
let lastFocusedEl = null;
const portfolioHideTimers = new Map();

/* ==============================
   Helpers
============================== */
function pushScrollLock() {
  scrollLockCount++;
  body.classList.add('no-scroll');
}

function popScrollLock() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) body.classList.remove('no-scroll');
}

function isMobileViewport() {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
}

function debounce(fn, ms = 100) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* ==============================
   Loader (Time-based - never stuck)
============================== */
function runLoaderProgress() {
  const fill = document.getElementById('loaderProgressFill');
  const percentEl = document.getElementById('loaderPercent');

  if (!pageLoader || !fill || !percentEl) {
    initSkills();
    return;
  }

  const start = performance.now();
  const DURATION = 1600;
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;

    fill.style.width = '100%';
    percentEl.textContent = '100%';
    pageLoader.classList.add('done');

    setTimeout(() => {
      if (pageLoader && pageLoader.parentNode) {
        pageLoader.remove();
      }
      initSkills();
    }, 600);
  }

  function update() {
    if (finished) return;

    const elapsed = performance.now() - start;
    const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));

    fill.style.width = pct + '%';
    percentEl.textContent = pct + '%';

    if (pct >= 100) {
      finish();
    } else {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
  setTimeout(finish, DURATION + 400);
}

/* ==============================
   Cursor Glow
============================== */
function initCursorGlow() {
  if (!cursorGlow) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let cx = mx;
  let cy = my;
  let raf = null;
  let running = false;

  function onMove(e) {
    mx = e.clientX;
    my = e.clientY;
  }

  function tick() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursorGlow.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running || isMobileViewport()) return;
    running = true;
    cursorGlow.classList.add('active');
    document.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (!running) return;
    running = false;
    cursorGlow.classList.remove('active');
    document.removeEventListener('mousemove', onMove);
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  start();
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });
  window.addEventListener('resize', debounce(() => {
    isMobileViewport() ? stop() : start();
  }, 200));
}

/* ==============================
   Theme
============================== */
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (saved === 'light') {
    body.classList.remove('dark');
  } else if (saved === 'dark') {
    body.classList.add('dark');
  } else {
    prefersDark ? body.classList.add('dark') : body.classList.remove('dark');
  }
}

function toggleTheme() {
  const isDark = body.classList.contains('dark');
  if (isDark) {
    body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

/* ==============================
   Header
============================== */
function handleHeaderScroll() {
  if (!siteHeader) return;
  siteHeader.classList.toggle('scrolled', window.scrollY > HEADER_SCROLL_PX);

  if (catSticky) {
    catSticky.classList.toggle(
      'is-stuck',
      window.scrollY > (siteHeader.offsetHeight + 120)
    );
  }
}

/* ==============================
   Mobile Menu
============================== */
function openMenu() {
  if (!hamburger || !navMenu) return;
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.classList.add('active');
  navMenu.classList.add('active');
  pushScrollLock();
}

function closeMenu() {
  if (!hamburger || !navMenu) return;
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');
  popScrollLock();
}

function toggleMenu() {
  if (!hamburger) return;
  const open = hamburger.getAttribute('aria-expanded') === 'true';
  open ? closeMenu() : openMenu();
}

/* ==============================
   Simple Slider
============================== */
function initSimpleSlider() {
  const slides = document.querySelectorAll('.simple-slide');
  const dots = document.querySelectorAll('.simple-slider-dot');
  if (slides.length < 2) return;

  let idx = 0;
  let intervalId = null;

  function show(n) {
    slides[idx].classList.remove('active');
    dots[idx]?.classList.remove('active');
    dots[idx]?.setAttribute('aria-selected', 'false');

    idx = (n + slides.length) % slides.length;

    slides[idx].classList.add('active');
    dots[idx]?.classList.add('active');
    dots[idx]?.setAttribute('aria-selected', 'true');
  }

  function next() {
    show(idx + 1);
  }

  function start() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(next, SLIDER_INTERVAL_MS);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  dots.forEach((d, i) => {
    d.addEventListener('click', () => {
      show(i);
      start();
    });
  });

  const wrap = document.getElementById('simpleSlider')?.parentElement;
  wrap?.addEventListener('mouseenter', stop);
  wrap?.addEventListener('mouseleave', start);

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  start();
}

/* ==============================
   Skills
============================== */
function animateSkillCircle(el) {
  const percent = Number(el.dataset.percent) || 0;
  const bar = el.querySelector('.skill-bar');
  const label = el.querySelector('.skill-percent');
  if (!bar || !label) return;

  const offset = SKILL_CIRCUMFERENCE * (1 - percent / 100);
  requestAnimationFrame(() => {
    bar.style.strokeDashoffset = String(offset);
  });

  const duration = 1500;
  let start = null;

  function step(ts) {
    if (start === null) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    label.textContent = Math.round(p * percent) + '%';
    if (p < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initSkills() {
  const circles = document.querySelectorAll('.skill-circle');
  circles.forEach((c, i) => {
    setTimeout(() => animateSkillCircle(c), i * 120);
  });
}

/* ==============================
   Magnetic Effect (Skills)
============================== */
function initMagnetic() {
  // در موبایل اجرا نشود
  if (isMobileViewport()) return;

  const skillCircles = document.querySelectorAll('.skill-circle');

  skillCircles.forEach(circle => {
    circle.addEventListener('mousemove', (e) => {
      const rect = circle.getBoundingClientRect();
      // محاسبه فاصله موس از مرکز دایره
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const strength = 0.35; // شدت کشش
      circle.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });

    circle.addEventListener('mouseleave', () => {
      circle.style.transform = 'translate(0, 0)';
    });
  });
}

/* ==============================
   Category Tabs Indicator
============================== */
function positionIndicator(tabEl) {
  if (!catIndicator || !catTabsWrap || !tabEl) return;
  catIndicator.style.left = `${tabEl.offsetLeft}px`;
  catIndicator.style.width = `${tabEl.offsetWidth}px`;
}

function positionIndicatorInstant(tabEl) {
  if (!catIndicator) return;
  catIndicator.style.transition = 'none';
  positionIndicator(tabEl);
  void catIndicator.offsetWidth;
  catIndicator.style.transition = '';
}

function getActiveTabEl() {
  return Array.from(catTabs).find(t => t.classList.contains('active')) || null;
}

/* ==============================
   Portfolio Filter
============================== */
function markImageLoaded(img) {
  if (!img) return;
  if (img.complete && img.naturalWidth > 0) {
    img.classList.add('loaded');
    return;
  }
  img.addEventListener('load', () => {
    img.classList.add('loaded');
    img.classList.remove('failed');
  }, { once: true });
  img.addEventListener('error', () => {
    img.classList.add('failed');
    img.classList.add('loaded');
  }, { once: true });
}

function filterByCategory(category, isInitial = false) {
  catTabs.forEach(tab => {
    const active = tab.dataset.category === category;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));

    if (active) {
      positionIndicator(tab);
      if (isMobileViewport()) {
        tab.scrollIntoView({
          behavior: isInitial ? 'auto' : 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  });

  const toReveal = [];

  portfolioItems.forEach(item => {
    const match = item.dataset.category === category;
    const pending = portfolioHideTimers.get(item);

    if (pending) {
      clearTimeout(pending);
      portfolioHideTimers.delete(item);
    }

    if (match) {
      if (item.hidden) {
        item.classList.add('hide');
        item.hidden = false;
        toReveal.push(item);
        const img = item.querySelector('.portfolio-img-wrap img');
        if (img) markImageLoaded(img);
      } else {
        item.classList.remove('hide');
      }
    } else if (!item.hidden) {
      item.classList.add('hide');
      const timer = setTimeout(() => {
        item.hidden = true;
      }, PORTFOLIO_FADE_MS);
      portfolioHideTimers.set(item, timer);
    }
  });

  if (toReveal.length) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toReveal.forEach(i => i.classList.remove('hide'));
      });
    });
  }

  refreshNewBadges(category);
}

function refreshNewBadges(activeCategory) {
  document.querySelectorAll('.new-badge').forEach(b => b.remove());

  const now = Date.now();
  const windowMs = NEW_BADGE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  portfolioItems.forEach(item => {
    if (item.dataset.category !== activeCategory) return;

    const d = new Date(item.dataset.date);
    if (Number.isNaN(d.getTime())) return;
    if (now - d.getTime() > windowMs) return;

    const badge = document.createElement('div');
    badge.className = 'new-badge';
    badge.setAttribute('aria-label', 'جدید');
    badge.innerHTML = '<i class="fa-solid fa-bolt" aria-hidden="true"></i> جدید';
    item.appendChild(badge);
  });
}

/* ==============================
   Typewriter
============================== */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  let wi = 0;
  let ci = 0;
  let deleting = false;
  let timeoutId = null;
  let isPaused = false;

  function tick() {
    if (isPaused) return;

    const word = TYPEWRITER_WORDS[wi];

    if (!deleting && ci <= word.length) {
      el.textContent = word.slice(0, ci);
      ci++;

      if (ci > word.length) {
        timeoutId = setTimeout(() => {
          deleting = true;
          tick();
        }, TYPEWRITER_HOLD_MS);
        return;
      }

      timeoutId = setTimeout(tick, TYPEWRITER_TYPE_MS);
      return;
    }

    if (deleting && ci >= 0) {
      el.textContent = word.slice(0, ci);
      ci--;

      if (ci < 0) {
        deleting = false;
        wi = (wi + 1) % TYPEWRITER_WORDS.length;
        ci = 0;
        el.style.opacity = '.4';
        timeoutId = setTimeout(() => {
          el.style.opacity = '1';
          tick();
        }, TYPEWRITER_SWAP_MS);
        return;
      }

      timeoutId = setTimeout(tick, TYPEWRITER_DELETE_MS);
    }
  }

  function startTypewriter() {
    isPaused = false;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(tick, TYPEWRITER_START_MS);
  }

  function pauseTypewriter() {
    isPaused = true;
    if (timeoutId) clearTimeout(timeoutId);
  }

  startTypewriter();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseTypewriter();
    } else {
      startTypewriter();
    }
  });
}

/* ==============================
   Lightbox
============================== */
function openLightbox(src, alt) {
  if (!lightbox || !lightboxImg) return;

  lastFocusedEl = document.activeElement;
  lightboxImg.setAttribute('data-loading', '');
  lightboxImg.src = src;
  lightboxImg.alt = alt || 'نمایش تصویر';
  lightbox.hidden = false;
  pushScrollLock();

  lightboxImg.addEventListener('load', () => {
    lightboxImg.removeAttribute('data-loading');
  }, { once: true });

  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.hidden = true;
  if (lightboxImg) {
    lightboxImg.src = '';
    lightboxImg.alt = '';
  }
  popScrollLock();

  if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
    lastFocusedEl.focus();
  }
}

function initLightbox() {
  if (!lightbox) return;

  portfolioItems.forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');

    const titleEl = item.querySelector('h4');
    if (titleEl) {
      item.setAttribute('aria-label', `نمایش ${titleEl.textContent}`);
    }

    const open = () => {
      const img = item.querySelector('.portfolio-img-wrap img');
      if (img) {
        openLightbox(img.currentSrc || img.src, img.alt);
      }
    };

    item.addEventListener('click', open);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxBd?.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', e => {
    if (!lightbox.hidden && e.key === 'Escape') {
      closeLightbox();
    }
  });
}

/* ==============================
   Reveal on Scroll
============================== */
function initReveal() {
  if (!revealEls.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => io.observe(el));
}

/* ==============================
   Smooth Scroll
============================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (isMobileViewport()) closeMenu();
    });
  });
}

/* ==============================
   Active Nav
============================== */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(a => {
        a.classList.toggle('active-link', a.getAttribute('href') === `#${id}`);
      });
    });
  }, { threshold: 0.35 });

  sections.forEach(s => io.observe(s));
}

/* ==============================
   Category Keyboard Navigation
============================== */
function initCatKeyboard() {
  if (!catTabsWrap) return;

  catTabsWrap.addEventListener('keydown', e => {
    const current = document.activeElement;
    if (!current.classList.contains('cat-tab')) return;

    let idx = Array.from(catTabs).indexOf(current);

    // RTL friendly
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      idx = (idx + 1) % catTabs.length;
      catTabs[idx].focus();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      idx = (idx - 1 + catTabs.length) % catTabs.length;
      catTabs[idx].focus();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      filterByCategory(current.dataset.category);
    }
  });
}

/* ==============================
   Init
============================== */
document.addEventListener('DOMContentLoaded', () => {
  // Scroll restoration
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  initTheme();
  themeToggle?.addEventListener('click', toggleTheme);
  mobileThemeTgl?.addEventListener('click', toggleTheme);

  initCursorGlow();

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // Mobile menu
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', toggleMenu);

    document.addEventListener('click', e => {
      if (!isMobileViewport()) return;
      if (
        !hamburger.contains(e.target) &&
        !navMenu.contains(e.target) &&
        navMenu.classList.contains('active')
      ) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMenu();
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (isMobileViewport()) closeMenu();
      });
    });
  }

  initSimpleSlider();

  // Categories
  catTabs.forEach(tab => {
    tab.addEventListener('click', () => filterByCategory(tab.dataset.category));
  });
  filterByCategory('logo', true);

  document.querySelectorAll('.portfolio-item .portfolio-img-wrap img')
    .forEach(markImageLoaded);

  requestAnimationFrame(() => positionIndicatorInstant(getActiveTabEl()));
  document.fonts?.ready?.then(() => positionIndicatorInstant(getActiveTabEl()));

  initTypewriter();
  initLightbox();
  initReveal();
  initSmoothScroll();
  initActiveNav();
  initCatKeyboard();

  // ===== فراخوانی افکت آهن‌ربایی =====
  initMagnetic();
});

/* ==============================
   Resize
============================== */
const onResizeDebounced = debounce(() => {
  if (!isMobileViewport() && navMenu?.classList.contains('active')) {
    closeMenu();
  }
  positionIndicatorInstant(getActiveTabEl());
}, 150);

window.addEventListener('resize', onResizeDebounced);

/* ==============================
   Window Load → Start Loader
============================== */
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  runLoaderProgress();
  positionIndicatorInstant(getActiveTabEl());
});