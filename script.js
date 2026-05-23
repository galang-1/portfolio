'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initHeroAnimations();
  initParticles();
  initTypewriter();
  initNav();
  initScrollReveal();
  initScrollProgress();
  initCounters();
  initProgressBars();
  initProjectHover();
  initCertHover();
  initForm();
  initParallaxBgLabels();
  initTickerSpeed();
});

/* ═══════════════════════════════════════════════════
   1. CUSTOM CURSOR
   ═══════════════════════════════════════════════════ */
function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
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

  document.querySelectorAll('a, button, .project-card, .cert-card, .skill-chip, .contact-link, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}

/* ═══════════════════════════════════════════════════
   2. HERO ANIMATIONS (staggered on load)
   ═══════════════════════════════════════════════════ */
function initHeroAnimations() {
  // Apply animation-delay from data-delay attribute
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
  const ctx = canvas.getContext('2d');
  let W, H;
  const COUNT = 80;
  const LINK_DIST = 130;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(rand) {
      this.x  = Math.random() * W;
      this.y  = rand ? Math.random() * H : H + 5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.35 + 0.1);
      this.r  = Math.random() * 1.4 + 0.4;
      this.life = 0;
      this.maxLife = Math.random() * 280 + 180;
      this.isGold = Math.random() > 0.5;
    }
    update() {
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < 90) {
        const f = (90 - d) / 90;
        this.vx += (dx/d) * f * 0.4;
        this.vy += (dy/d) * f * 0.4;
      }
      this.vx *= 0.98; this.vy *= 0.98;
      this.x += this.vx; this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.x < -5 || this.x > W+5 || this.y < -5) this.reset(false);
    }
    alpha() {
      return Math.min(this.life/60, 1) * Math.min((this.maxLife-this.life)/60, 1) * 0.75;
    }
    draw() {
      const col = this.isGold ? '200,169,110' : '168,180,200';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${col},${this.alpha()})`;
      ctx.fill();
    }
  }

  resize();
  window.addEventListener('resize', resize);

  const hero = document.getElementById('hero');
  hero.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  const particles = Array.from({ length: COUNT }, () => new Particle());

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    // connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(200,169,110,${(1 - d/LINK_DIST) * 0.1})`;
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
    if (del && ci === 0) { del = false; pi = (pi+1) % phrases.length; setTimeout(tick, 400); return; }
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

  // Active link via IntersectionObserver
  const sections = document.querySelectorAll('.section');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.45 });
  sections.forEach(s => obs.observe(s));
}

/* ═══════════════════════════════════════════════════
   6. SCROLL REVEAL — IntersectionObserver
   Supports: fade-up, slide-left, slide-right
   Supports data-delay for staggering
   ═══════════════════════════════════════════════════ */
function initScrollReveal() {
  const targets = document.querySelectorAll('.scroll-reveal');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => el.classList.add('is-visible'), delay);
      obs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  targets.forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════════════
   7. SCROLL PROGRESS BAR
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
   8. COUNTER ANIMATION
   ═══════════════════════════════════════════════════ */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const to = parseInt(el.dataset.target, 10);
      const start = performance.now();
      const dur   = 1600;
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1-p, 4); // easeOutQuart
        el.textContent = Math.floor(to * e);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = to;
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════════════
   9. PROGRESS BARS
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
   10. PROJECT CARD — 3D tilt on hover
   ═══════════════════════════════════════════════════ */
function initProjectHover() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2)  / r.width;
      const dy = (e.clientY - r.top  - r.height/2) / r.height;
      card.style.transform = `perspective(900px) rotateX(${-dy*3}deg) rotateY(${dx*3}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s var(--ease-expo)';
      card.style.transform  = '';
      setTimeout(() => card.style.transition = '', 600);
    });
  });
}

/* ═══════════════════════════════════════════════════
   11. CERT CARD — subtle tilt
   ═══════════════════════════════════════════════════ */
function initCertHover() {
  document.querySelectorAll('.cert-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2)  / r.width;
      const dy = (e.clientY - r.top  - r.height/2) / r.height;
      card.style.transform = `perspective(600px) rotateX(${-dy*5}deg) rotateY(${dx*5}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ═══════════════════════════════════════════════════
   12. CONTACT FORM
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
      btn.disabled = false;
      span.textContent = 'Kirim Pesan';
      form.reset();
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 4000);
    }, 1800);
  });

  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.style.filter = 'drop-shadow(0 0 8px rgba(200,169,110,0.15))';
    });
    input.addEventListener('blur', () => {
      input.parentElement.style.filter = '';
    });
  });
}

/* ═══════════════════════════════════════════════════
   13. PARALLAX — section bg number labels
   ═══════════════════════════════════════════════════ */
function initParallaxBgLabels() {
  const labels = document.querySelectorAll('.section-bg-label');
  window.addEventListener('scroll', () => {
    labels.forEach(label => {
      const r    = label.parentElement.getBoundingClientRect();
      const mid  = r.top + r.height / 2;
      const diff = (mid - window.innerHeight / 2) * 0.04;
      label.style.transform = `translateY(calc(-50% + ${diff}px))`;
    });
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════
   14. TICKER — speed boost on fast scroll
   ═══════════════════════════════════════════════════ */
function initTickerSpeed() {
  const tracks = document.querySelectorAll('.ticker-track');
  let lastY = window.scrollY;
  let timer;

  window.addEventListener('scroll', () => {
    const v    = Math.abs(window.scrollY - lastY);
    lastY      = window.scrollY;
    const dur  = Math.max(10, 30 - v * 0.6);
    tracks.forEach(t => t.style.animationDuration = dur + 's');
    clearTimeout(timer);
    timer = setTimeout(() => {
      tracks.forEach(t => t.style.animationDuration = '30s');
    }, 350);
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════
   15. SMOOTH ANCHOR SCROLL
   ═══════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════════════
   16. ORBS PARALLAX on scroll
   ═══════════════════════════════════════════════════ */
(function() {
  const orbs = document.querySelectorAll('.orb');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orbs.forEach((o, i) => {
      o.style.transform = `translateY(${y * (i+1) * 0.07}px)`;
    });
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════
   17. NAV LOGO glitch on hover
   ═══════════════════════════════════════════════════ */
(function() {
  const logo = document.querySelector('.nav-logo');
  if (!logo) return;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes glitch {
      0%,100%{ text-shadow: none; letter-spacing: 0.1em; }
      25%{ text-shadow: -2px 0 #ff0080, 2px 0 #00ffff; }
      50%{ text-shadow: 2px 0 #ff0080; letter-spacing: 0.15em; }
      75%{ text-shadow: -1px 0 #00ffff; }
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
   18. LIGHTBOX
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
});

function initLightbox() {
  const lightbox  = document.getElementById('lightbox');
  const backdrop  = document.getElementById('lightboxBackdrop');
  const closeBtn  = document.getElementById('lightboxClose');
  const img       = document.getElementById('lightboxImg');
  const caption   = document.getElementById('lightboxCaption');
  if (!lightbox) return;

  function open(src, cap) {
    img.src            = src;
    img.alt            = cap || '';
    caption.textContent = cap || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Clear src after transition to free memory
    setTimeout(() => { img.src = ''; }, 400);
  }

  // Open on trigger click
  document.querySelectorAll('.lightbox-trigger').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.dataset.src || el.querySelector('img')?.src;
      const cap = el.dataset.caption || el.querySelector('img')?.alt || '';
      if (src) open(src, cap);
    });
  });

  backdrop.addEventListener('click', close);
  closeBtn.addEventListener('click', close);

  // Keyboard: Escape to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) close();
  });
}