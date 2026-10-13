// Général Couverture — interactions : en-tête, menu, anneaux 3D au défilement (services, méthode, réalisations), avant/après, formulaire
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const isMobile = () => innerWidth <= 820;
  const params = new URLSearchParams(location.search);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad2 = (n) => String(n).padStart(2, '0');

  // ---------- en-tête : transparent en haut, verre bleu nuit ensuite ----------
  const header = $('#header');
  const onScrollHeader = () => header && header.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', onScrollHeader, { passive: true }); onScrollHeader();

  // ---------- menu plein écran ----------
  const burger = $('#burger'), menu = $('#menu');
  if (burger && menu) {
    const set = (open) => { menu.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open ? 'true' : 'false'); document.body.classList.toggle('nav-open', open); };
    burger.addEventListener('click', () => set(!menu.classList.contains('is-open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => set(false)));
  }

  // ---------- indicateur de section dans l'en-tête ----------
  const navLabel = $('#nav-section'), navFill = $('#nav-fill');
  const navSections = $$('[data-nav]');
  function updateNav() {
    if (!navLabel || !navSections.length) return;
    const mid = innerHeight * 0.5;
    let cur = navSections[0];
    for (const s of navSections) { if (s.getBoundingClientRect().top <= mid) cur = s; }
    const r = cur.getBoundingClientRect();
    const p = clamp((mid - r.top) / Math.max(1, r.height), 0, 1);
    if (navLabel.textContent !== cur.dataset.nav) navLabel.textContent = cur.dataset.nav;
    navFill.style.width = (p * 100).toFixed(1) + '%';
  }
  addEventListener('scroll', updateNav, { passive: true }); addEventListener('resize', updateNav); updateNav();

  // ---------- apparitions ----------
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length && !reduced) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('in'));

  // ---------- anneaux 3D pilotés par le défilement (services, méthode, réalisations) ----------
  $$('.ring-section').forEach((sec) => {
    const stage = $('.ring-stage', sec), ring = $('.ring', sec), wrap = $('.ring-wrap', sec), cards = $$('.ring-card', sec), N = cards.length;
    if (!N) return;
    const axis = ring.dataset.axis || 'y', SPAN = 360 / N;
    const curEl = $('.ring-cur', sec), titleEl = $('.ring-title', sec), descEl = $('.ring-desc', sec), linkEl = $('.ring-link', sec), subEl = $('.ring-sub', sec), numEl = $('.ring-num-val', sec), dots = $$('.ring-dots button', sec);
    let rot = 0, user = 0, R = 500, shown = -1, dragging = false, sx = 0, su = 0, moved = 0;
    function layout() {
      const c = cards[0], size = axis === 'y' ? c.offsetWidth : c.offsetHeight, gap = isMobile() ? 16 : 44;
      R = Math.max(size * 0.55, (size + gap) / (2 * Math.sin(Math.PI / N)));
      ring.style.transform = `translateZ(${(-R).toFixed(1)}px)`;
    }
    const range = () => Math.max(1, sec.offsetHeight - stage.offsetHeight);
    const progress = () => clamp(-sec.getBoundingClientRect().top / range(), 0, 1) * (N - 1) * SPAN;
    function setShown(i) {
      if (i === shown) return; shown = i; const c = cards[i];
      if (curEl) curEl.textContent = pad2(i + 1);
      if (numEl) numEl.textContent = pad2(i + 1);
      if (titleEl && c.dataset.title) { titleEl.innerHTML = c.dataset.title; titleEl.classList.remove('swap'); void titleEl.offsetWidth; titleEl.classList.add('swap'); }
      if (descEl && c.dataset.desc) descEl.textContent = c.dataset.desc;
      if (linkEl && c.dataset.href) linkEl.href = c.dataset.href;
      if (subEl && c.dataset.sub) subEl.textContent = c.dataset.sub;
      dots.forEach((b, k) => b.classList.toggle('is-active', k === i));
    }
    function frame() {
      const target = progress() + user;
      rot += (target - rot) * (reduced ? 1 : 0.12);
      if (Math.abs(target - rot) < 0.001) rot = target;
      cards.forEach((c, i) => {
        const a = (((i * SPAN - rot) % 360) + 540) % 360 - 180;
        const depth = (1 - Math.cos(a * Math.PI / 180)) / 2;
        c.style.transform = axis === 'y' ? `rotateY(${a.toFixed(2)}deg) translateZ(${R.toFixed(1)}px)` : `rotateX(${(-a).toFixed(2)}deg) translateZ(${R.toFixed(1)}px)`;
        c.style.opacity = (1 - depth * 0.9).toFixed(3);
        c.style.filter = depth > 0.12 ? `blur(${(depth * 6).toFixed(2)}px)` : 'none';
        c.style.visibility = depth > 0.97 ? 'hidden' : 'visible';
        c.classList.toggle('is-front', Math.abs(a) < SPAN / 2);
      });
      setShown(((Math.round(rot / SPAN) % N) + N) % N);
      requestAnimationFrame(frame);
    }
    const goTo = (i) => { user = 0; const r = sec.getBoundingClientRect(); scrollTo({ top: scrollY + r.top + range() * i / (N - 1), behavior: reduced ? 'auto' : 'smooth' }); };
    dots.forEach((b, i) => b.addEventListener('click', () => goTo(i)));
    const prev = $('.ring-prev', sec), next = $('.ring-next', sec);
    if (prev) prev.addEventListener('click', () => goTo(Math.max(0, shown - 1)));
    if (next) next.addEventListener('click', () => goTo(Math.min(N - 1, shown + 1)));
    if (axis === 'y') {
      wrap.addEventListener('pointerdown', (e) => { if (e.target.closest('input, button, a')) return; dragging = true; sx = e.clientX; su = user; moved = 0; wrap.setPointerCapture(e.pointerId); });
      wrap.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); user = su - dx * 0.16; });
      const end = (e) => { if (!dragging) return; dragging = false; if (moved < 6) { const card = e.target.closest('.ring-card'); if (card && card.classList.contains('is-front') && card.dataset.href) location.href = card.dataset.href; } };
      wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);
    }
    addEventListener('resize', layout); layout(); frame();
  });

  // ---------- avant / après ----------
  $$('[data-ba]').forEach((fig) => {
    const range = $('.ba-range', fig), before = $('.ba-before', fig), handle = $('.ba-handle', fig);
    const set = (v) => { before.style.setProperty('--pos', v + '%'); handle.style.setProperty('--pos', v + '%'); };
    range.addEventListener('input', () => set(range.value)); set(range.value);
    range.addEventListener('pointerdown', (e) => e.stopPropagation());
  });

  // ---------- curseurs : remplissage doré de la piste ----------
  $$('.slider').forEach((r) => { const f = () => r.style.setProperty('--fill', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); r.addEventListener('input', f); f(); });

  // ---------- captures de contrôle ----------
  const to = params.get('to');
  if (to) addEventListener('load', () => { document.documentElement.style.scrollBehavior = 'auto'; const el = $(to); if (el) el.scrollIntoView(); reveals.forEach((r) => r.classList.add('in')); });
  if (params.has('no3d')) { const ex = $('.experience'); if (ex) ex.style.display = 'none'; }

  // ---------- formulaire ----------
  const form = $('#devisForm');
  if (form) {
    const status = $('.form-status', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); const btn = $('button[type="submit"]', form);
      btn.disabled = true; btn.textContent = 'Envoi en cours…'; status.className = 'form-status';
      try {
        const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        const data = await res.json();
        if (data.success) { form.reset(); status.textContent = 'Merci, votre demande est envoyée. Nous vous rappelons rapidement.'; status.classList.add('ok'); } else throw new Error(data.message || 'Erreur');
      } catch (err) { status.textContent = 'L’envoi a échoué. Appelez-nous directement au 06 21 32 37 89.'; status.classList.add('err'); }
      finally { btn.disabled = false; btn.textContent = 'Envoyer ma demande'; }
    });
  }
})();
