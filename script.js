'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initHeroAnimations();
  initParticles();
  initTypewriter();
  initNav();
  initMobileNav();
  initScrollReveal();
  initScrollProgress();
  initCounters();
  initProgressBars();
  initProjectHover();
  initCertHover();
  initForm();
  initParallaxBgLabels();
  initTickerSpeed();
  initLightbox();
  initNavLightMode();
});

/* ═══════════════════════════════════════════════════
   1. CUSTOM CURSOR (desktop only)
   ═══════════════════════════════════════════════════ */
function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  // Only on pointer:fine devices
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function loopRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loopRing);
  })();

  document.querySelectorAll('a, button, .project-card, .cert-card, .skill-chip, .contact-link, input, textarea, .lightbox-trigger').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}

/* ═══════════════════════════════════════════════════
   2. HERO ANIMATIONS — staggered on load
   ═══════════════════════════════════════════════════ */
function initHeroAnimations() {
  document.querySelectorAll('.fade-in').forEach(el => {
    const delay = el.dataset.delay || 0;
    el.style.animationDelay = delay + 'ms';
  });
}

/* ═══════════════════════════════════════════════════
   3. PARTICLE CANVAS
   ═══════════════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  // Skip heavy canvas on low-end mobile
  if (window.matchMedia('(pointer: coarse) and (max-width: 600px)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let W, H;
  const COUNT    = window.innerWidth < 768 ? 40 : 80;
  const LINK     = 120;
  let mouse      = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(rand) {
      this.x  = Math.random() * W;
      this.y  = rand ? Math.random() * H : H + 5;
      this.vx = (Math.random() - 0.5) * 0.28;
      this.vy = -(Math.random() * 0.32 + 0.08);
      this.r  = Math.random() * 1.3 + 0.4;
      this.life = 0;
      this.maxLife = Math.random() * 260 + 160;
      this.isGlacier = Math.random() > 0.4;
    }
    update() {
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 80) {
        const f = (80 - d) / 80;
        this.vx += (dx / d) * f * 0.35;
        this.vy += (dy / d) * f * 0.35;
      }
      this.vx *= 0.98; this.vy *= 0.98;
      this.x += this.vx; this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.x < -5 || this.x > W + 5 || this.y < -5) this.reset(false);
    }
    alpha() {
      return Math.min(this.life / 60, 1) * Math.min((this.maxLife - this.life) / 60, 1) * 0.7;
    }
    draw() {
      const col = this.isGlacier ? '126,200,227' : '74,144,217';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col},${this.alpha()})`;
      ctx.fill();
    }
  }

  resize();
  window.addEventListener('resize', resize);

  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  }

  const particles = Array.from({ length: COUNT }, () => new Particle());

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(126,200,227,${(1 - d / LINK) * 0.09})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
}

/* ═══════════════════════════════════════════════════
   4. TYPEWRITER
   ═══════════════════════════════════════════════════ */
function initTypewriter() {
  const el = document.getElementById('typedRole');
  if (!el) return;
  const phrases = ['Full-Stack Developer', 'UI/UX Enthusiast', 'AI Explorer', 'Creative Coder', 'Problem Solver'];
  let pi = 0, ci = 0, del = false;

  function tick() {
    const cur = phrases[pi];
    el.textContent = del ? cur.slice(0, --ci) : cur.slice(0, ++ci);
    if (!del && ci === cur.length) { del = true; setTimeout(tick, 1800); return; }
    if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 400); return; }
    setTimeout(tick, del ? 40 : 80);
  }
  setTimeout(tick, 1200);
}

/* ═══════════════════════════════════════════════════
   5. NAV — scroll hide/show + active link
   ═══════════════════════════════════════════════════ */
function initNav() {
  const nav   = document.getElementById('nav');
  const links = document.querySelectorAll('.nav-links a');
  let lastY   = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    nav.style.transform = (y > lastY && y > 200) ? 'translateY(-100%)' : 'translateY(0)';
    lastY = y;
  }, { passive: true });

  // Active link
  const sections = document.querySelectorAll('.section');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => obs.observe(s));
}

/* ═══════════════════════════════════════════════════
   6. MOBILE NAV — hamburger drawer
   ═══════════════════════════════════════════════════ */
function initMobileNav() {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('navDrawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  // Close on link click
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
      toggle.classList.remove('open');
    }
  });
}

/* ═══════════════════════════════════════════════════
   7. NAV LIGHT MODE
   ═══════════════════════════════════════════════════ */
function initNavLightMode() {
  const nav = document.getElementById('nav');
  const lightIds = ['about', 'projects', 'certifications', 'contact'];

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (lightIds.includes(entry.target.id)) {
        nav.classList.add('light-mode');
      } else {
        nav.classList.remove('light-mode');
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.section').forEach(s => obs.observe(s));
}

/* ═══════════════════════════════════════════════════
   8. SCROLL REVEAL
   ═══════════════════════════════════════════════════ */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => el.classList.add('is-visible'), delay);
      obs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════════════
   9. SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = ((window.scrollY / total) * 100) + '%';
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════
   10. COUNTER ANIMATION
   ═══════════════════════════════════════════════════ */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const to = parseInt(el.dataset.target, 10);
      const start = performance.now();
      const dur   = 1500;
      (function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.floor(to * e);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = to;
      })(start);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════════════
   11. PROGRESS BARS
   ═══════════════════════════════════════════════════ */
function initProgressBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 300);
      obs.unobserve(bar);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.progress-fill').forEach(b => obs.observe(b));
}

/* ═══════════════════════════════════════════════════
   12. PROJECT CARD — 3D tilt (desktop only)
   ═══════════════════════════════════════════════════ */
function initProjectHover() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / r.width;
      const dy = (e.clientY - r.top  - r.height / 2) / r.height;
      card.style.transform = `perspective(900px) rotateX(${-dy * 2.5}deg) rotateY(${dx * 2.5}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s var(--ease-expo)';
      card.style.transform  = '';
      setTimeout(() => card.style.transition = '', 600);
    });
  });
}

/* ═══════════════════════════════════════════════════
   13. CERT CARD — subtle tilt (desktop only)
   ═══════════════════════════════════════════════════ */
function initCertHover() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.cert-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / r.width;
      const dy = (e.clientY - r.top  - r.height / 2) / r.height;
      card.style.transform = `perspective(600px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ═══════════════════════════════════════════════════
   14. CONTACT FORM
   ═══════════════════════════════════════════════════ */
function initForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const span = btn.querySelector('span');
    btn.disabled = true;
    span.textContent = 'Mengirim...';

    setTimeout(() => {
      btn.disabled        = false;
      span.textContent    = 'Kirim Pesan';
      form.reset();
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 4000);
    }, 1800);
  });

  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.style.filter = 'drop-shadow(0 0 6px rgba(43,108,176,0.12))';
    });
    input.addEventListener('blur', () => {
      input.parentElement.style.filter = '';
    });
  });
}

/* ═══════════════════════════════════════════════════
   15. PARALLAX BG LABELS (desktop only)
   ═══════════════════════════════════════════════════ */
function initParallaxBgLabels() {
  if (window.innerWidth < 768) return;
  const labels = document.querySelectorAll('.section-bg-label');
  window.addEventListener('scroll', () => {
    labels.forEach(label => {
      const r    = label.parentElement.getBoundingClientRect();
      const diff = (r.top + r.height / 2 - window.innerHeight / 2) * 0.035;
      label.style.transform = `translateY(calc(-50% + ${diff}px))`;
    });
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════
   16. TICKER SPEED ON SCROLL
   ═══════════════════════════════════════════════════ */
function initTickerSpeed() {
  const tracks = document.querySelectorAll('.ticker-track');
  let lastY = window.scrollY, timer;

  window.addEventListener('scroll', () => {
    const v    = Math.abs(window.scrollY - lastY);
    lastY      = window.scrollY;
    const dur  = Math.max(10, 30 - v * 0.5);
    tracks.forEach(t => t.style.animationDuration = dur + 's');
    clearTimeout(timer);
    timer = setTimeout(() => tracks.forEach(t => t.style.animationDuration = '30s'), 350);
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════
   17. SMOOTH ANCHOR SCROLL
   ═══════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 72,
      behavior: 'smooth'
    });
  });
});

/* ═══════════════════════════════════════════════════
   18. ORBS PARALLAX (desktop only)
   ═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth < 768) return;
  const orbs = document.querySelectorAll('.orb');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orbs.forEach((o, i) => {
      o.style.transform = `translateY(${y * (i + 1) * 0.06}px)`;
    });
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════
   19. LIGHTBOX
   ═══════════════════════════════════════════════════ */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const backdrop = document.getElementById('lightboxBackdrop');
  const closeBtn = document.getElementById('lightboxClose');
  const img      = document.getElementById('lightboxImg');
  const caption  = document.getElementById('lightboxCaption');
  if (!lightbox) return;

  function open(src, cap) {
    img.src             = src;
    img.alt             = cap || '';
    caption.textContent = cap || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { img.src = ''; }, 400);
  }

  document.querySelectorAll('.lightbox-trigger').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.dataset.src || el.querySelector('img')?.src;
      const cap = el.dataset.caption || el.querySelector('img')?.alt || '';
      if (src) open(src, cap);
    });
  });

  if (backdrop) backdrop.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) close();
  });
}

/* ═══════════════════════════════════════════════════
   20. NAV LOGO GLITCH (desktop only)
   ═══════════════════════════════════════════════════ */
(function() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const logo = document.querySelector('.nav-logo');
  if (!logo) return;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes glitch {
      0%,100%{ text-shadow: none; }
      25%{ text-shadow: -2px 0 #7ec8e3, 2px 0 #2b6cb0; }
      50%{ text-shadow: 2px 0 #7ec8e3; letter-spacing: 0.14em; }
      75%{ text-shadow: -1px 0 #2b6cb0; }
    }
    .nav-logo.glitch { animation: glitch 0.4s steps(1); }
  `;
  document.head.appendChild(style);
  logo.addEventListener('mouseenter', () => {
    logo.classList.add('glitch');
    logo.addEventListener('animationend', () => logo.classList.remove('glitch'), { once: true });
  });
})();

/* ═══════════════════════════════════════════════════
   21. PHOTO TILT — about image interactive
   ═══════════════════════════════════════════════════ */
(function initPhotoTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const frame = document.querySelector('.about-img-frame');
  const wrapper = document.querySelector('.about-img-wrapper');
  if (!frame || !wrapper) return;

  wrapper.addEventListener('mousemove', e => {
    const r  = wrapper.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / r.width;
    const dy = (e.clientY - r.top  - r.height / 2) / r.height;
    frame.style.transform = `rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) scale(1.02)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    frame.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
  });
})();

/* ═══════════════════════════════════════════════════
   22. MAGNETIC BUTTONS
   ═══════════════════════════════════════════════════ */
(function initMagnetic() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.2;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.2;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s var(--ease-expo)';
      setTimeout(() => btn.style.transition = '', 500);
    });
  });
})();

/* ═══════════════════════════════════════════════════
   23. SECTION HEADER UNDERLINE
   ═══════════════════════════════════════════════════ */
(function initSectionHeaderUnderline() {
  const headers = document.querySelectorAll('.section-header');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('is-visible');
    });
  }, { threshold: 0.3 });
  headers.forEach(h => obs.observe(h));
})();

/* ═══════════════════════════════════════════════════
   24. RIPPLE on skill chips (touch + click)
   ═══════════════════════════════════════════════════ */
(function initRipple() {
  document.querySelectorAll('.skill-chip').forEach(chip => {
    chip.addEventListener('click', e => {
      const r    = chip.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        background:rgba(43,108,176,0.2);
        width:10px; height:10px;
        left:${e.clientX - r.left - 5}px;
        top:${e.clientY - r.top - 5}px;
        transform:scale(0);
        animation:rippleAnim 0.5s ease-out forwards;
        pointer-events:none;
      `;
      chip.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(20); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

/* ═══════════════════════════════════════════════════
   25. CURSOR TRAIL on hero
   ═══════════════════════════════════════════════════ */
(function initCursorTrail() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const hero = document.getElementById('hero');
  if (!hero) return;

  const dots = [];
  const NUM  = 6;

  for (let i = 0; i < NUM; i++) {
    const d = document.createElement('div');
    d.style.cssText = `
      position:fixed; width:${4 - i * 0.4}px; height:${4 - i * 0.4}px;
      border-radius:50%; background:rgba(126,200,227,${0.4 - i * 0.06});
      pointer-events:none; z-index:9999;
      transform:translate(-50%,-50%);
      transition: left ${0.05 + i * 0.04}s linear, top ${0.05 + i * 0.04}s linear;
    `;
    document.body.appendChild(d);
    dots.push(d);
  }

  let active = false;

  hero.addEventListener('mouseenter', () => { active = true; dots.forEach(d => d.style.opacity = '1'); });
  hero.addEventListener('mouseleave', () => { active = false; dots.forEach(d => d.style.opacity = '0'); });

  document.addEventListener('mousemove', e => {
    if (!active) return;
    dots.forEach(d => {
      d.style.left = e.clientX + 'px';
      d.style.top  = e.clientY + 'px';
    });
  });

  dots.forEach(d => { d.style.opacity = '0'; });
})();

/* ═══════════════════════════════════════════════════
   26. ABOUT REVEAL — separate observer for about layout
   ═══════════════════════════════════════════════════ */
(function initAboutReveal() {
  const els = document.querySelectorAll('.reveal-about');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.classList.contains('about-right') ? 150 : 0;
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════════════
   27. PHOTO TILT — pakai class baru
   ═══════════════════════════════════════════════════ */
(function initPhotoTiltFix() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const frame = document.querySelector('.about-photo-frame');
  const col   = document.querySelector('.about-photo-col');
  if (!frame || !col) return;

  col.addEventListener('mousemove', e => {
    const r  = col.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / r.width;
    const dy = (e.clientY - r.top  - r.height / 2) / r.height;
    frame.style.transform = `perspective(800px) rotateY(${dx * 7}deg) rotateX(${-dy * 7}deg) scale(1.02)`;
  });

  col.addEventListener('mouseleave', () => {
    frame.style.transform = '';
  });
})();

/* ═══════════════════════════════════════════════════
   28. FIX: Resize canvas on orientation change
   & clamp particles within viewport bounds
   ═══════════════════════════════════════════════════ */
(function fixCanvasOverflow() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  function clampCanvas() {
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', clampCanvas, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(clampCanvas, 200);
  });

  clampCanvas();
})();