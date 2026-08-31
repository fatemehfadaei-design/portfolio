'use strict';

const MOBILE_BREAKPOINT   = 992;
const SLIDER_INTERVAL_MS  = 4200;
const HEADER_SCROLL_PX    = 20;
const LOADER_DELAY_MS     = 800;
const PORTFOLIO_FADE_MS   = 560;
const NEW_BADGE_WINDOW_DAYS = 14;
const TYPEWRITER_WORDS    = ['طراح گرافیک', 'دیزاینر بصری', 'خلاق و متفاوت'];
const TYPEWRITER_TYPE_MS  = 75;
const TYPEWRITER_DELETE_MS = 35;
const TYPEWRITER_HOLD_MS  = 2200;
const TYPEWRITER_SWAP_MS  = 380;
const TYPEWRITER_START_MS = 1100;
const SKILL_CIRCUMFERENCE = 326.7;

const body            = document.body;
const siteHeader      = document.getElementById('siteHeader');
const themeToggle     = document.getElementById('theme-toggle');
const mobileThemeTgl  = document.getElementById('mobileThemeToggle');
const hamburger       = document.getElementById('hamburger');
const navMenu         = document.getElementById('navMenu');
const navLinks        = document.querySelectorAll('.nav-menu a');
const catTabs         = document.querySelectorAll('.cat-tab');
const portfolioItems  = document.querySelectorAll('.portfolio-item');
const pageLoader      = document.getElementById('pageLoader');
const cursorGlow      = document.getElementById('cursorGlow');
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxBd      = document.getElementById('lightboxBackdrop');
const revealEls       = document.querySelectorAll('.reveal');

let cursorGlowRaf = null;
let portfolioHideTimers = new Map();

function isMobileViewport() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

/* =========================================================
   Mobile: Always start page from the top
   ========================================================= */

if (isMobileViewport()) {
  history.scrollRestoration = 'manual';
}

function runLoaderProgress() {
  const fill = document.getElementById('loaderProgressFill');
  const percentEl = document.getElementById('loaderPercent');

  if (!pageLoader || !fill || !percentEl) {
    initSkills();
    return;
  }

  const start = performance.now();

  function step(ts) {
    const elapsed = ts - start;
    const progress = Math.min(elapsed / LOADER_DELAY_MS, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const pct = Math.round(eased * 100);

    fill.style.width = pct + '%';
    percentEl.textContent = pct + '%';

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      pageLoader.classList.add('done');
      pageLoader.addEventListener('transitionend', () => pageLoader.remove(), { once: true });
      initSkills();
    }
  }

  requestAnimationFrame(step);
}

function initCursorGlow() {
  if (!cursorGlow) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let cx = mx;
  let cy = my;
  let running = false;

  function onMouseMove(e) {
    mx = e.clientX;
    my = e.clientY;
  }

  function tick() {
    cx += (mx - cx) * .1;
    cy += (my - cy) * .1;

    cursorGlow.style.left = cx + 'px';
    cursorGlow.style.top = cy + 'px';

    cursorGlowRaf = requestAnimationFrame(tick);
  }

  function start() {
    if (running || isMobileViewport()) return;

    running = true;
    cursorGlow.classList.add('active');

    document.addEventListener('mousemove', onMouseMove);
    cursorGlowRaf = requestAnimationFrame(tick);
  }

  function stop() {
    if (!running) return;

    running = false;
    cursorGlow.classList.remove('active');

    document.removeEventListener('mousemove', onMouseMove);

    if (cursorGlowRaf) {
      cancelAnimationFrame(cursorGlowRaf);
    }

    cursorGlowRaf = null;
  }

  start();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  window.addEventListener('resize', () => {
    if (isMobileViewport()) {
      stop();
    } else {
      start();
    }
  });
}

function initTheme() {
  const saved = localStorage.getItem('theme');

  if (saved === 'light') {
    body.classList.remove('dark');
    body.classList.add('light');
  } else {
    body.classList.add('dark');
  }
}

function toggleTheme() {
  const isDark = body.classList.contains('dark');

  body.classList.toggle('dark', !isDark);
  body.classList.toggle('light', isDark);

  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

function handleHeaderScroll() {
  if (!siteHeader) return;

  const scrolled = window.scrollY > HEADER_SCROLL_PX;

  siteHeader.classList.toggle('scrolled', scrolled);
}

function openMenu() {
  if (!hamburger || !navMenu) return;

  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.classList.add('active');
  navMenu.classList.add('active');

  body.style.overflow = 'hidden';
}

function closeMenu() {
  if (!hamburger || !navMenu) return;

  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');

  body.style.overflow = '';
}

function toggleMenu() {
  if (!hamburger) return;

  const open = hamburger.getAttribute('aria-expanded') === 'true';

  open ? closeMenu() : openMenu();
}

function initSimpleSlider() {
  const slides = document.querySelectorAll('.simple-slide');
  const dots = document.querySelectorAll('.simple-slider-dot');

  if (slides.length < 2) return;

  let idx = 0;

  setInterval(() => {
    slides[idx].classList.remove('active');
    dots[idx]?.classList.remove('active');

    idx = (idx + 1) % slides.length;

    slides[idx].classList.add('active');
    dots[idx]?.classList.add('active');
  }, SLIDER_INTERVAL_MS);
}

function animateSkillCircle(el) {
  const percent = Number(el.dataset.percent) || 0;
  const bar = el.querySelector('.skill-bar');
  const label = el.querySelector('.skill-percent');

  const offset = SKILL_CIRCUMFERENCE * (1 - percent / 100);

  requestAnimationFrame(() => {
    bar.style.strokeDashoffset = String(offset);
  });

  const duration = 1500;
  let start = null;

  function step(ts) {
    if (start === null) start = ts;

    const progress = Math.min((ts - start) / duration, 1);

    label.textContent = Math.round(progress * percent) + '%';

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function initSkills() {
  const circles = document.querySelectorAll('.skill-circle');

  if (!circles.length) return;

  circles.forEach((c, i) => {
    setTimeout(() => animateSkillCircle(c), i * 120);
  });
}

const catTabsWrap = document.getElementById('catTabs');
const catIndicator = document.getElementById('catTabIndicator');

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
  return Array.from(catTabs)
    .find(t => t.classList.contains('active')) || null;
}

function markImageLoaded(img) {
  if (img.complete && img.naturalWidth > 0) {
    img.classList.add('loaded');
    return;
  }

  img.addEventListener(
    'load',
    () => img.classList.add('loaded'),
    { once: true }
  );
}

function filterByCategory(category, isInitial) {
  catTabs.forEach(tab => {
    const active = tab.dataset.category === category;

    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active);

    if (active) {
      positionIndicator(tab);

      if (isMobileViewport()) {
        tab.scrollIntoView({
          behavior: isInitial ? 'auto' : 'smooth',
          inline: isInitial ? 'start' : 'center',
          block: 'nearest'
        });
      }
    }
  });

  const toReveal = [];

  portfolioItems.forEach(item => {
    const match = item.dataset.category === category;

    const pendingTimer = portfolioHideTimers.get(item);

    if (pendingTimer) {
      clearTimeout(pendingTimer);
      portfolioHideTimers.delete(item);
    }

    if (match) {
      if (item.hidden) {
        item.classList.add('hide');
        item.hidden = false;

        toReveal.push(item);

        const img = item.querySelector('.portfolio-img-wrap img');

        if (img) {
          markImageLoaded(img);
        }
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
        toReveal.forEach(item => {
          item.classList.remove('hide');
        });
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

    const itemDate = new Date(item.dataset.date).getTime();

    if (Number.isNaN(itemDate)) return;
    if (now - itemDate > windowMs) return;

    const badge = document.createElement('div');

    badge.className = 'new-badge';
    badge.setAttribute('aria-label', 'جدید');

    badge.innerHTML =
      '<i class="fa-solid fa-bolt" aria-hidden="true"></i> جدید';

    item.appendChild(badge);
  });
}

function initTypewriter() {
  const el = document.getElementById('typewriter');

  if (!el) return;

  let wi = 0;
  let ci = 0;
  let deleting = false;

  function tick() {
    const word = TYPEWRITER_WORDS[wi];

    if (!deleting && ci <= word.length) {
      el.textContent = word.slice(0, ci);
      ci++;

      if (ci > word.length) {
        setTimeout(() => {
          deleting = true;
          tick();
        }, TYPEWRITER_HOLD_MS);

        return;
      }

      setTimeout(tick, TYPEWRITER_TYPE_MS);

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

        setTimeout(() => {
          el.style.opacity = '1';
          tick();
        }, TYPEWRITER_SWAP_MS);

        return;
      }

      setTimeout(tick, TYPEWRITER_DELETE_MS);
    }
  }

  setTimeout(tick, TYPEWRITER_START_MS);
}

function openLightbox(src) {
  if (!lightbox || !lightboxImg) return;

  lightboxImg.setAttribute('data-loading', '');
  lightboxImg.src = src;
  lightboxImg.alt = '';

  lightbox.hidden = false;

  body.style.overflow = 'hidden';

  lightboxImg.addEventListener(
    'load',
    () => {
      lightboxImg.removeAttribute('data-loading');
    },
    { once: true }
  );

  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.hidden = true;

  if (lightboxImg) {
    lightboxImg.src = '';
  }

  body.style.overflow = '';
}

function initLightbox() {
  if (!lightbox) return;

  portfolioItems.forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');

    const open = () => {
      const img = item.querySelector('.portfolio-img-wrap img');

      if (img) {
        openLightbox(img.src);
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

function initReveal() {
  if (!revealEls.length) return;

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: .12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealEls.forEach(el => io.observe(el));
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();

      const target = document.querySelector(a.getAttribute('href'));

      if (!target) return;

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      if (isMobileViewport()) {
        closeMenu();
      }
    });
  });
}

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');

  if (!sections.length) return;

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;

        navLinks.forEach(a => {
          a.classList.toggle(
            'active-link',
            a.getAttribute('href') === `#${id}`
          );
        });
      });
    },
    {
      threshold: .35
    }
  );

  sections.forEach(s => io.observe(s));
}

document.addEventListener('DOMContentLoaded', () => {

  // Mobile: always open the website from the top
  if (isMobileViewport()) {
    history.scrollRestoration = 'manual';

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }

  initTheme();

  themeToggle?.addEventListener('click', toggleTheme);
  mobileThemeTgl?.addEventListener('click', toggleTheme);

  initCursorGlow();

  window.addEventListener(
    'scroll',
    handleHeaderScroll,
    { passive: true }
  );

  handleHeaderScroll();

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
      if (
        e.key === 'Escape' &&
        navMenu.classList.contains('active')
      ) {
        closeMenu();
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (isMobileViewport()) {
          closeMenu();
        }
      });
    });
  }

  initSimpleSlider();

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterByCategory(tab.dataset.category);
    });
  });

  filterByCategory('logo', true);

  document
    .querySelectorAll('.portfolio-item:not([hidden]) .portfolio-img-wrap img')
    .forEach(markImageLoaded);

  requestAnimationFrame(() => {
    positionIndicatorInstant(getActiveTabEl());
  });

  document.fonts?.ready?.then(() => {
    positionIndicatorInstant(getActiveTabEl());
  });

  initTypewriter();
  initLightbox();
  initReveal();
  initSmoothScroll();
  initActiveNav();
});

window.addEventListener('resize', () => {
  if (
    !isMobileViewport() &&
    navMenu?.classList.contains('active')
  ) {
    closeMenu();
  }

  positionIndicatorInstant(getActiveTabEl());
});

window.addEventListener('load', () => {

  // Extra protection for mobile browsers that restore scroll position
  if (isMobileViewport()) {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }

  runLoaderProgress();
  positionIndicatorInstant(getActiveTabEl());
});
