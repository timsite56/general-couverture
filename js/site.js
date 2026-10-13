// Général Couverture — interactions : en-tête, menu, cartes de services au défilement, bande en perspective, avant/après, formulaire
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

  // ---------- services : cartes 3D pilotées par le défilement ----------
  const deckSec = $('.deck-section');
  if (deckSec) {
    const stageEl = $('.deck-stage', deckSec), cards = $$('.deck-card', deckSec), N = cards.length;
    const curEl = $('#deck-cur'), titleEl = $('#deck-title'), descEl = $('#deck-desc'), linkEl = $('#deck-link'), dots = $$('.deck-dots button'), hint = $('.deck-hint');
    let cur = 0, shown = -1, mx = 0, my = 0, started = false;
    const range = () => Math.max(1, deckSec.offsetHeight - stageEl.offsetHeight);
    const progress = () => clamp(-deckSec.getBoundingClientRect().top / range(), 0, 1) * (N - 1);
    function place(i, d) {
      const c = cards[i], mobile = isMobile(), side = i % 2 ? 1 : -1;
      let x, y, z, ry, rx, op, bl;
      if (d >= 0) {
        x = side * Math.min(d, 2.2) * (mobile ? 44 : 150); y = d * (mobile ? 26 : 30); z = -d * (mobile ? 520 : 760);
        ry = -side * Math.min(d, 1.6) * 13; rx = 0;
        op = clamp(1 - (d - 0.25) * 0.3, 0.04, 1); bl = clamp((d - 0.4) * 2.4, 0, 9);
      } else {
        const e = -d;
        x = -side * e * 140; y = -e * (mobile ? 240 : 340); z = e * 460; ry = side * e * 12; rx = e * 20;
        op = clamp(1 - e * 1.6, 0, 1); bl = clamp(e * 7, 0, 9);
      }
      const front = Math.abs(d) < 0.5;
      c.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${(ry + (front ? mx : 0)).toFixed(2)}deg) rotateX(${(rx + (front ? my : 0)).toFixed(2)}deg)`;
      c.style.opacity = op.toFixed(3);
      c.style.filter = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : 'none';
      c.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
      c.style.visibility = (op < 0.02 || d > 2.6) ? 'hidden' : 'visible';
      c.classList.toggle('is-front', front);
    }
    function setText(i) {
      if (shown === i) return; shown = i; const c = cards[i];
      curEl.textContent = pad2(i + 1); titleEl.innerHTML = c.dataset.title; descEl.textContent = c.dataset.desc; linkEl.href = c.dataset.href;
      dots.forEach((b, k) => b.classList.toggle('is-active', k === i));
      titleEl.classList.remove('swap'); void titleEl.offsetWidth; titleEl.classList.add('swap');
    }
    function frame() {
      const target = progress();
      cur += (target - cur) * (reduced ? 1 : 0.14);
      if (Math.abs(target - cur) < 0.0005) cur = target;
      if (!started && target > 0.05) { started = true; if (hint) hint.classList.add('is-hidden'); }
      cards.forEach((c, i) => place(i, i - cur));
      setText(clamp(Math.round(cur), 0, N - 1));
      requestAnimationFrame(frame);
    }
    dots.forEach((b, i) => b.addEventListener('click', () => { const r = deckSec.getBoundingClientRect(); scrollTo({ top: scrollY + r.top + range() * i / (N - 1), behavior: reduced ? 'auto' : 'smooth' }); }));
    cards.forEach((c) => c.addEventListener('click', () => { if (c.classList.contains('is-front')) location.href = c.dataset.href; }));
    stageEl.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; const r = stageEl.getBoundingClientRect(); mx = ((e.clientX - r.left) / r.width - 0.5) * 9; my = ((e.clientY - r.top) / r.height - 0.5) * -7; });
    stageEl.addEventListener('pointerleave', () => { mx = 0; my = 0; });
    frame();
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
