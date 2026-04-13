/* ============================================================
   main.js — SQA Portfolio
   ============================================================ */

'use strict';

/* ── PARTICLE NETWORK ── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  let mouseX = -999, mouseY = -999;

  const COUNT = () => Math.min(90, Math.floor(window.innerWidth / 13));

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawn() {
    pts = [];
    const n = COUNT();
    for (let i = 0; i < n; i++) {
      pts.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r:  Math.random() * 1.4 + 0.4,
        col: Math.random() < 0.65
          ? 'rgba(0,229,255,'
          : 'rgba(255,61,0,'
      });
    }
  }

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* draw connecting edges */
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,229,255,${(1 - d / 120) * 0.18})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }

      /* mouse attraction lines */
      const mx = pts[i].x - mouseX;
      const my = pts[i].y - mouseY;
      const md = Math.sqrt(mx * mx + my * my);
      if (md < 190) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = `rgba(255,61,0,${(1 - md / 190) * 0.35})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    }

    /* draw + move nodes */
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.col + '0.55)';
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); spawn(); });
  resize();
  spawn();
  draw();
})();


/* ── CUSTOM CURSOR ── */
(function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  if (!cursor || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function loopRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loopRing);
  })();

  const targets = 'a, button, .skill-card, .proj-card, .pill, .cta-btn';
  document.querySelectorAll(targets).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
      ring.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
      ring.classList.remove('hovered');
    });
  });
})();


/* ── MOBILE HAMBURGER MENU ── */
function toggleMenu() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');
  if (!burger || !menu) return;
  const isOpen = menu.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}


/* ── TYPEWRITER EFFECT ── */
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'PROFESSIONALLY.',
    'AT SCALE.',
    'SYSTEMATICALLY.',
    'BEFORE YOU DO.',
    'RELENTLESSLY.'
  ];

  let pIdx = 0, cIdx = 0, deleting = false;

  function tick() {
    const phrase = phrases[pIdx];

    if (!deleting) {
      cIdx++;
      el.textContent = phrase.slice(0, cIdx);
      if (cIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      cIdx--;
      el.textContent = phrase.slice(0, cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
        setTimeout(tick, 300);
        return;
      }
    }

    setTimeout(tick, deleting ? 40 : 78);
  }

  tick();
})();


/* ── COUNT-UP UTILITY ── */
function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';

  const target = parseFloat(el.dataset.count);
  const sfx    = el.dataset.sfx || '';
  const steps  = 60;
  const step   = target / steps;
  let cur = 0;

  el.classList.add('counting');

  const iv = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = (target % 1 === 0 ? Math.round(cur) : cur.toFixed(1)) + sfx;
    if (cur >= target) {
      clearInterval(iv);
      el.classList.remove('counting');
    }
  }, 20);
}


/* ── INTERSECTION OBSERVER — fade-up + bars + counters ── */
(function initObserver() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      /* reveal */
      el.classList.add('visible');

      /* skill bars */
      el.querySelectorAll('.sbar-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });

      /* metric bars */
      el.querySelectorAll('.metric-bar-fill').forEach(bar => {
        /* width already set inline; trigger a reflow trick to animate */
        const w = bar.style.width;
        bar.style.width = '0';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => { bar.style.width = w; });
        });
      });

      /* count-up numbers */
      el.querySelectorAll('.count-up[data-count]').forEach(countUp);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
})();


/* ── HERO STATS COUNT-UP ON LOAD ── */
(function initHeroStats() {
  const statsSection = document.querySelector('.hero-stats');
  if (!statsSection) return;

  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();

    document.querySelectorAll('.stat-num[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const sfx    = el.dataset.sfx || '';

      if (target === 0) { el.textContent = '0' + sfx; return; }

      const steps = 55;
      const step  = target / steps;
      let cur = 0;

      el.classList.add('counting');
      const iv = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = Math.round(cur) + sfx;
        if (cur >= target) {
          clearInterval(iv);
          el.classList.remove('counting');
        }
      }, 22);
    });
  }, { threshold: 0.4 });

  io.observe(statsSection);
})();


/* ── PARALLAX HERO BG TEXT ── */
(function initParallax() {
  const bgText = document.getElementById('heroBgText');
  if (!bgText) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    bgText.style.transform = `translate(-50%, calc(-50% + ${y * 0.22}px))`;
  }, { passive: true });
})();

/* ── SCROLL HINT + TOP BUTTON ── */
(function initScrollControls() {
  const scrollHint = document.querySelector('.scroll-hint');
  const topBtn = document.getElementById('toTopBtn');
  const about = document.getElementById('about');
  const hero = document.getElementById('hero');

  if (scrollHint && about) {
    scrollHint.addEventListener('click', () => {
      about.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (!topBtn || !hero) return;

  const updateTopVisibility = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const show = heroBottom <= 0 || window.scrollY > 140;
    topBtn.classList.toggle('visible', show);
  };

  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', updateTopVisibility, { passive: true });
  updateTopVisibility();
})();


/* ── NAV ACTIVE LINK ON SCROLL ── */
(function initNavHighlight() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const links    = Array.from(document.querySelectorAll('.nav-links a'));

  function updateNavHighlight() {
    let current = '';
    const fromTop = window.scrollY + 120;

    sections.forEach(sec => {
      if (fromTop >= sec.offsetTop) current = sec.id;
    });

    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 10) {
      current = sections[sections.length - 1]?.id || current;
    }

    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateNavHighlight, { passive: true });
  updateNavHighlight();
})();


/* ── CONTACT FORM SUBMIT ── */
function handleSubmit(e) {
  e.preventDefault();

  const form     = e.target;
  const btnText  = form.querySelector('.btn-text');
  const btnArrow = form.querySelector('.btn-arrow');
  const btn      = form.querySelector('.submit-btn');

  /* success state */
  btnText.textContent = 'Message Sent ✓';
  if (btnArrow) btnArrow.style.display = 'none';
  btn.style.background = 'var(--cyan)';
  btn.style.color      = 'var(--black)';
  btn.style.borderColor = 'var(--cyan)';

  /* reset after 3 seconds */
  setTimeout(() => {
    btnText.textContent = 'Send Message';
    if (btnArrow) btnArrow.style.display = '';
    btn.style.background  = '';
    btn.style.color       = '';
    btn.style.borderColor = '';
    form.reset();
  }, 3000);
}
