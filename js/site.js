// Général Couverture — interactions : en-tête (indicateur de section), menu, carrousel 3D, bande en perspective, avant/après, formulaire
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const isMobile = () => innerWidth <= 820;
  const params = new URLSearchParams(location.search);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // ---------- carrousel 3D des services (arc de cartes, repositionnées à chaque image) ----------
  const ringWrap = $('.ring-wrap');
  if (ringWrap) {
    const ring = $('.ring', ringWrap), cards = $$('.ring-card', ringWrap), N = cards.length;
    const SPAN = () => (isMobile() ? 42 : 34), COVER = () => SPAN() * N;
    const navBtns = $$('.ring-nav button'), titleEl = $('#ring-title'), labelEl = $('#ring-label'), linkEl = $('#ring-link');
    let rot = 0, target = 0, R = 1000, dragging = false, startX = 0, startT = 0, moved = 0, wheelTimer = 0, idle = 0, hover = false;
    function layout() {
      const cw = isMobile() ? Math.min(innerWidth * 0.76, 440) : Math.min(innerWidth * 0.42, 680);
      ringWrap.style.setProperty('--cw', cw + 'px');
      R = (cw + (isMobile() ? 24 : 56)) / (2 * Math.sin(SPAN() / 2 * Math.PI / 180));
      ring.style.transform = `translateZ(${-R}px)`;
    }
    const wrapA = (a) => { const c = COVER(); return ((a % c) + c * 1.5) % c - c / 2; };
    const front = () => ((Math.round(target / SPAN()) % N) + N) % N;
    function setActive() {
      const i = front(), c = cards[i];
      navBtns.forEach((b, k) => b.classList.toggle('is-active', k === i));
      if (titleEl && titleEl.dataset.idx !== String(i)) { titleEl.dataset.idx = String(i); titleEl.innerHTML = c.dataset.title; labelEl.textContent = c.dataset.label; linkEl.href = c.dataset.href; }
    }
    function render() {
      rot += (target - rot) * (dragging ? 0.45 : 0.1);
      const S = SPAN();
      cards.forEach((c, i) => {
        const a = wrapA(i * S - rot), d = Math.abs(a) / S;
        const t = clamp(1 - Math.max(0, d - 0.5), 0, 1);
        c.style.transform = `rotateY(${a.toFixed(2)}deg) translateZ(${R.toFixed(1)}px)`;
        c.style.opacity = (0.08 + 0.92 * t).toFixed(3);
        c.style.filter = `blur(${((1 - t) * 4).toFixed(2)}px)`;
        c.style.visibility = d > 1.9 ? 'hidden' : 'visible';
        c.classList.toggle('is-front', d < 0.5);
      });
      setActive();
      requestAnimationFrame(render);
    }
    const snap = () => { target = Math.round(target / SPAN()) * SPAN(); };
    const goTo = (i) => { const S = SPAN(), cur = Math.round(target / S); let d = i - ((cur % N) + N) % N; if (d > N / 2) d -= N; if (d < -N / 2) d += N; target = (cur + d) * S; };
    ringWrap.addEventListener('pointerdown', (e) => { dragging = true; startX = e.clientX; startT = target; moved = 0; idle = -40; ringWrap.classList.add('is-dragging'); ringWrap.setPointerCapture(e.pointerId); });
    ringWrap.addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx)); target = startT - dx * (isMobile() ? 0.22 : 0.12); });
    const end = (e) => { if (!dragging) return; dragging = false; ringWrap.classList.remove('is-dragging'); snap(); if (moved < 6 && e.target.closest && e.target.closest('.ring-card.is-front')) location.href = e.target.closest('.ring-card').dataset.href; };
    ringWrap.addEventListener('pointerup', end); ringWrap.addEventListener('pointercancel', end);
    ringWrap.addEventListener('pointerenter', () => { hover = true; }); ringWrap.addEventListener('pointerleave', () => { hover = false; });
    ringWrap.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return; e.preventDefault(); target += e.deltaX * 0.15; idle = -20; clearTimeout(wheelTimer); wheelTimer = setTimeout(snap, 160); }, { passive: false });
    navBtns.forEach((b, i) => b.addEventListener('click', () => { goTo(i); idle = -30; }));
    const prev = $('#ring-prev'), next = $('#ring-next');
    if (prev) prev.addEventListener('click', () => { target -= SPAN(); idle = -30; });
    if (next) next.addEventListener('click', () => { target += SPAN(); idle = -30; });
    addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') target += SPAN(); if (e.key === 'ArrowLeft') target -= SPAN(); });
    setInterval(() => { if (!dragging && !hover && !reduced && document.visibilityState === 'visible') { idle += 1; if (idle > 7) { target += SPAN(); idle = 0; } } }, 1000);
    addEventListener('resize', layout); layout(); render();
  }

  // ---------- bande de réalisations en perspective ----------
  const strip = $('.strip');
  if (strip) {
    const cards = $$('.strip-card', strip), title = $('#strip-title'), sub = $('#strip-sub');
    function update() {
      const vw = strip.clientWidth, mid = strip.getBoundingClientRect().left + vw / 2;
      let best = null, bestD = 1e9;
      cards.forEach((c) => {
        const r = c.getBoundingClientRect(); const d = (r.left + r.width / 2 - mid) / vw;
        if (!reduced) c.style.transform = `rotateY(${(-d * 26).toFixed(2)}deg) translateZ(${(-Math.abs(d) * 120).toFixed(1)}px)`;
        if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = c; }
      });
      if (best && title && title.dataset.cur !== best.dataset.title) { title.dataset.cur = best.dataset.title; title.innerHTML = best.dataset.title; sub.textContent = best.dataset.sub; }
    }
    strip.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true }); addEventListener('resize', update); update();
    const sp = $('#strip-prev'), sn = $('#strip-next');
    const stepW = () => (cards[0] ? cards[0].getBoundingClientRect().width + 28 : 400);
    if (sp) sp.addEventListener('click', () => strip.scrollBy({ left: -stepW(), behavior: 'smooth' }));
    if (sn) sn.addEventListener('click', () => strip.scrollBy({ left: stepW(), behavior: 'smooth' }));
  }

  // ---------- avant / après ----------
  $$('[data-ba]').forEach((fig) => {
    const range = $('.ba-range', fig), before = $('.ba-before', fig), handle = $('.ba-handle', fig);
    const set = (v) => { before.style.setProperty('--pos', v + '%'); handle.style.setProperty('--pos', v + '%'); };
    range.addEventListener('input', () => set(range.value)); set(range.value);
    range.addEventListener('pointerdown', (e) => e.stopPropagation());
  });

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
