(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();
  document.body.classList.add('is-loading');

  /* ---------- Word stagger setup ---------- */
  $$('.hero__title, .cta__title').forEach((title) => {
    $$('.word', title).forEach((w, i) => { w.style.transitionDelay = `${i * 0.08}s`; });
  });

  /* ---------- Loader ---------- */
  const loaderBar = $('#loaderBar');
  const loaderCount = $('#loaderCount');
  const loadStart = performance.now();
  const LOAD_MS = reduceMotion ? 1 : 1400;

  function loaderTick(now) {
    const p = clamp((now - loadStart) / LOAD_MS, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    loaderBar.style.width = `${eased * 100}%`;
    loaderCount.textContent = Math.round(eased * 100);
    if (p < 1) return requestAnimationFrame(loaderTick);
    setTimeout(() => {
      $('#loader').classList.add('is-done');
      document.body.classList.remove('is-loading');
      setTimeout(() => {
        $('.hero__title').classList.add('is-in');
        $$('.hero .reveal').forEach((el, i) => {
          el.style.setProperty('--d', `${0.3 + i * 0.12}s`);
          el.classList.add('is-in');
        });
        startTyping();
      }, 350);
    }, 200);
  }
  requestAnimationFrame(loaderTick);

  /* ---------- Reveal on scroll ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('is-in');
      // once revealed, clear the stagger delay so hover/tilt reacts instantly
      setTimeout(() => el.style.setProperty('--d', '0s'), 1600);
      revealIO.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  // stagger siblings inside the same parent
  const groups = new Map();
  $$('.reveal').forEach((el) => {
    if (el.closest('.hero')) return;
    const parent = el.parentElement;
    const idx = groups.get(parent) || 0;
    groups.set(parent, idx + 1);
    el.style.setProperty('--d', `${idx * 0.1}s`);
    revealIO.observe(el);
  });

  const titleIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); titleIO.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  $$('.cta__title').forEach((t) => titleIO.observe(t));

  /* ---------- Typed code ---------- */
  const code = [
    ['tk-c', '// Lo que hace especial cada proyecto\n'],
    ['tk-k', 'export const '], ['', 'proyecto '], ['tk-p', '= '], ['', '{\n'],
    ['', '  diseño: '], ['tk-s', '"a medida"'], ['', ',\n'],
    ['', '  rendimiento: '], ['tk-n', '100'], ['', ',\n'],
    ['', '  fps: '], ['tk-n', '60'], ['', ',\n'],
    ['', '  escalable: '], ['tk-k', 'true'], ['', ',\n'],
    ['', '  stack: ['], ['tk-s', '"react"'], ['', ', '], ['tk-s', '"node"'], ['', ', '], ['tk-s', '"ia"'], ['', '],\n'],
    ['', '  equipo: '], ['tk-s', '"Cottez Studio"'], ['', ',\n'],
    ['', '};\n\n'],
    ['tk-k', 'await '], ['tk-p', 'lanzar'], ['', '(proyecto); '], ['tk-c', '// 🚀'],
  ];
  const typedEl = $('#typed');

  function startTyping() {
    if (!typedEl) return;
    if (reduceMotion) {
      typedEl.innerHTML = code.map(([c, t]) => `<span class="${c}">${t}</span>`).join('');
      return;
    }
    let tokenIdx = 0, charIdx = 0, span = null;
    (function step() {
      if (tokenIdx >= code.length) return;
      const [cls, text] = code[tokenIdx];
      if (charIdx === 0) {
        span = document.createElement('span');
        if (cls) span.className = cls;
        typedEl.appendChild(span);
      }
      span.textContent += text[charIdx++];
      if (charIdx >= text.length) { tokenIdx++; charIdx = 0; }
      const ch = text[charIdx - 1];
      setTimeout(step, ch === '\n' ? 140 : 18 + Math.random() * 30);
    })();
  }

  /* ---------- Particles ---------- */
  const canvas = $('#particles');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], dpr = Math.min(devicePixelRatio || 1, 2);
  const mouse = { x: -9999, y: -9999 };
  let heroVisible = true;

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(clamp((W * H) / 16000, 30, 110));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5,
    }));
  }

  function drawParticles() {
    if (heroVisible) {
      ctx.clearRect(0, 0, W, H);
      const LINK = 130;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < 140) { p.x += (dx / d) * 1.6; p.y += (dy / d) * 1.6; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < LINK) {
            ctx.strokeStyle = `rgba(140, 120, 255, ${(1 - dist / LINK) * 0.22})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(220, 220, 255, 0.7)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (!reduceMotion) requestAnimationFrame(drawParticles);
  }
  resizeCanvas();
  drawParticles();

  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe($('.hero'));

  $('.hero').addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  $('.hero').addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

  /* ---------- Cursor ---------- */
  const cursor = $('#cursor'), dot = $('#cursorDot');
  const cPos = { x: innerWidth / 2, y: innerHeight / 2 }, cTarget = { ...cPos };
  if (finePointer) {
    addEventListener('pointermove', (e) => {
      cTarget.x = e.clientX; cTarget.y = e.clientY;
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
    $$('a, button, [data-tilt]').forEach((el) => {
      el.addEventListener('pointerenter', () => cursor.classList.toggle('is-hover', el.matches('a, button')));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- Magnetic ---------- */
  if (finePointer && !reduceMotion) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Spotlight ---------- */
  $$('[data-spotlight]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Tilt ---------- */
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]').forEach((el) => {
      const target = el.classList.contains('hero__code') ? $('.window', el) : el;
      const base = target === el ? '' : 'perspective(1000px) rotateY(-12deg) rotateX(6deg)';
      const max = target === el ? 5 : 10;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        target.style.transform = `perspective(1000px) rotateY(${px * max * (target === el ? 1 : 1.5)}deg) rotateX(${-py * max}deg) translateZ(0)`;
      });
      el.addEventListener('pointerleave', () => { target.style.transform = base; });
    });
  }

  /* ---------- Counters ---------- */
  function animateNumber(el, to, { prefix = '', suffix = '', duration = 1800 } = {}) {
    const start = performance.now();
    (function tick(now) {
      const p = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = `${prefix}${Math.round(to * eased)}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      animateNumber(el, +el.dataset.count, {
        prefix: el.dataset.prefix || '',
        suffix: el.dataset.suffix || '',
      });
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- Perf rings ---------- */
  const ringIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$('.perf__ring', e.target).forEach((ring, i) => {
        setTimeout(() => {
          const score = +ring.dataset.score;
          $('.perf__fill', ring).style.strokeDashoffset = 100 - score;
          animateNumber($('span', ring), score, { duration: 2000 });
        }, i * 200);
      });
      ringIO.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  $$('.perf').forEach((el) => ringIO.observe(el));

  /* ---------- Chat demo ---------- */
  const chatIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('is-answered'), 1800);
      chatIO.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  $$('.chat').forEach((el) => chatIO.observe(el));

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger'), menu = $('#mobileMenu');
  const toggleMenu = (open) => {
    burger.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- Scroll-driven: nav, progress, horizontal work, timeline ---------- */
  const nav = $('#nav'), progress = $('#progress');
  const work = $('#trabajo'), track = $('#workTrack');
  const timeline = $('#timeline'), timelineFill = $('#timelineFill');
  const steps = $$('.step', timeline);
  const isDesktop = () => innerWidth > 900;
  let workX = 0, workTargetX = 0;

  function sizeWork() {
    if (isDesktop()) {
      const distance = track.scrollWidth - innerWidth;
      work.style.height = `${distance + innerHeight}px`;
    } else {
      work.style.height = '';
      track.style.transform = '';
    }
  }

  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('is-scrolled', y > 40);

    if (isDesktop()) {
      const start = work.offsetTop;
      const len = work.offsetHeight - innerHeight;
      const p = clamp((y - start) / len, 0, 1);
      workTargetX = -p * (track.scrollWidth - innerWidth);
    }

    const tr = timeline.getBoundingClientRect();
    const tp = clamp((innerHeight * 0.6 - tr.top) / tr.height, 0, 1);
    timelineFill.style.transform = `scaleY(${tp})`;
    steps.forEach((s) => {
      const sr = s.getBoundingClientRect();
      s.classList.toggle('is-active', sr.top + 32 < innerHeight * 0.6);
    });
  }

  /* ---------- Main RAF loop (smooth interpolation) ---------- */
  function loop() {
    if (finePointer) {
      cPos.x = lerp(cPos.x, cTarget.x, 0.18);
      cPos.y = lerp(cPos.y, cTarget.y, 0.18);
      cursor.style.transform = `translate(${cPos.x}px, ${cPos.y}px) translate(-50%, -50%)`;
    }
    if (isDesktop()) {
      workX = reduceMotion ? workTargetX : lerp(workX, workTargetX, 0.1);
      track.style.transform = `translate3d(${workX}px, 0, 0)`;
    }
    requestAnimationFrame(loop);
  }

  addEventListener('scroll', onScroll, { passive: true });
  let resizeT;
  addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { resizeCanvas(); sizeWork(); onScroll(); }, 150);
  });
  addEventListener('load', () => { sizeWork(); onScroll(); });
  sizeWork();
  onScroll();
  loop();
})();
