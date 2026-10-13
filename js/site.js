// Général Couverture — interactions communes (menu mobile, formulaire)
(function () {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }));
  }

  // Captures de contrôle : ?to=%23services fait défiler jusqu'à la section, ?no3d=1 masque l'expérience 3D
  const params = new URLSearchParams(location.search);
  const to = params.get('to');
  if (to) addEventListener('load', () => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.querySelector(to); if (el) el.scrollIntoView(); });
  if (params.has('no3d')) { const ex = document.querySelector('.experience'); if (ex) ex.style.display = 'none'; }

  // Lien de navigation actif
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a[href]').forEach((a) => {
    const href = a.getAttribute('href').split('#')[0];
    if (href && href === here && here !== 'index.html') a.classList.add('is-current');
  });

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
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form),
        });
        const data = await res.json();
        if (data.success) {
          form.reset();
          status.textContent = 'Merci, votre demande est envoyée. Nous vous rappelons rapidement.';
          status.classList.add('ok');
        } else { throw new Error(data.message || 'Erreur'); }
      } catch (err) {
        status.textContent = 'L’envoi a échoué. Appelez-nous directement au 06 21 32 37 89.';
        status.classList.add('err');
      } finally {
        btn.disabled = false; btn.textContent = 'Envoyer ma demande';
      }
    });
  }
})();
