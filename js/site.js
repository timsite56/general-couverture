// Général Couverture — interactions communes : en-tête, menu, apparitions, avant/après, formulaire
(function () {
  const header = document.querySelector('.site-header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const params = new URLSearchParams(location.search);

  // En-tête transparent en haut, verre sombre dès qu'on défile
  const onScroll = () => { if (header) header.classList.toggle('is-scrolled', scrollY > 24); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Menu mobile
  if (burger && nav) {
    const close = () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('nav-open'); };
    burger.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open ? 'true' : 'false'); document.body.classList.toggle('nav-open', open);
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  }

  // Lien courant
  const here = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav a[href]').forEach((a) => {
    const href = a.getAttribute('href').split('#')[0].replace(/\/$/, '');
    if (href && href === here && here !== '/') a.classList.add('is-current');
  });

  // Apparition au défilement
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else { reveals.forEach((el) => el.classList.add('in')); }

  // Parallaxe douce de l'image des pages internes
  const heroImg = document.querySelector('.page-hero .hero-bg');
  if (heroImg && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const move = () => { heroImg.style.transform = `translateY(${Math.min(scrollY, 900) * 0.18}px)`; };
    addEventListener('scroll', move, { passive: true }); move();
  }

  // Curseur avant / après
  document.querySelectorAll('[data-ba]').forEach((fig) => {
    const range = fig.querySelector('.ba-range');
    const before = fig.querySelector('.ba-before');
    const handle = fig.querySelector('.ba-handle');
    const set = (v) => { const pos = `${v}%`; before.style.setProperty('--pos', pos); handle.style.setProperty('--pos', pos); };
    range.addEventListener('input', () => set(range.value));
    set(range.value);
  });

  // Captures de contrôle : ?to=%23services défile jusqu'à la section, ?no3d=1 masque l'expérience 3D
  const to = params.get('to');
  if (to) addEventListener('load', () => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.querySelector(to); if (el) el.scrollIntoView(); document.querySelectorAll('.reveal').forEach((r) => r.classList.add('in')); });
  if (params.has('no3d')) { const ex = document.querySelector('.experience'); if (ex) ex.style.display = 'none'; }

  // Formulaire de devis (Web3Forms)
  const form = document.getElementById('devisForm');
  if (form) {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Envoi en cours…';
      status.className = 'form-status';
      try {
        const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        const data = await res.json();
        if (data.success) { form.reset(); status.textContent = 'Merci, votre demande est envoyée. Nous vous rappelons rapidement.'; status.classList.add('ok'); }
        else throw new Error(data.message || 'Erreur');
      } catch (err) {
        status.textContent = 'L’envoi a échoué. Appelez-nous directement au 06 21 32 37 89.'; status.classList.add('err');
      } finally { btn.disabled = false; btn.textContent = 'Envoyer ma demande'; }
    });
  }
})();
