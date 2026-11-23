/* Md. Abdul Adol — site interactions. No libraries. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance */
  var hero = document.getElementById('home');
  requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('loaded'); }); });
  setTimeout(function () { hero.classList.add('loaded'); }, 400);

  /* Staggered delays for groups marked data-stagger */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    group.querySelectorAll('.reveal, .img-reveal').forEach(function (el, i) {
      if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (i * 110) + 'ms');
    });
  });

  /* Reveal on scroll */
  var els = document.querySelectorAll('.reveal, .img-reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) {
      /* A fully clipped image is never reported as visible, so watch its figure instead */
      if (e.classList.contains('img-reveal')) {
        var holder = e.parentNode;
        var io2 = new IntersectionObserver(function (en) {
          en.forEach(function (x) { if (x.isIntersecting) { e.classList.add('in'); io2.disconnect(); } });
        }, { threshold: 0.1 });
        io2.observe(holder);
      } else { io.observe(e); }
    });
    setTimeout(function () {
      els.forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); });
    }, 1200);
  }

  /* Navbar state on scroll */
  var header = document.getElementById('top');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 12); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  var btn = document.getElementById('menuBtn'), list = document.getElementById('navList');
  function setMenu(open) {
    list.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.querySelector('span').textContent = open ? 'Close' : 'Menu';
  }
  btn.addEventListener('click', function () { setMenu(!list.classList.contains('open')); });
  list.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });

  /* Active section in nav */
  var links = {};
  document.querySelectorAll('#navList a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var id = e.target.getAttribute('data-nav') || e.target.id;
        if (e.isIntersecting && links[id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          links[id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { so.observe(s); });
  }

  /* Dialog helpers */
  var lastFocus = null;
  function openOverlay(el, focusEl) { lastFocus = document.activeElement; el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); (focusEl || el).focus(); }
  function closeOverlay(el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); if (lastFocus) lastFocus.focus(); }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.querySelectorAll('.overlay.open').forEach(closeOverlay);
  });
  document.querySelectorAll('.overlay').forEach(function (o) {
    o.addEventListener('click', function (e) { if (e.target === o) closeOverlay(o); });
    o.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { closeOverlay(o); }); });
  });

  /* Figure viewer */
  var viewer = document.getElementById('viewer');
  var vImg = viewer.querySelector('img'), vCap = viewer.querySelector('p');
  document.querySelectorAll('.fig button[data-full]').forEach(function (b) {
    b.addEventListener('click', function () {
      vImg.src = b.getAttribute('data-full');
      vImg.alt = b.querySelector('img').alt;
      var fc = b.parentNode.querySelector('figcaption');
      vCap.textContent = fc ? fc.textContent : '';
      openOverlay(viewer, viewer.querySelector('[data-close]'));
    });
  });

  /* Project details */
  var details = document.getElementById('details');
  var dBody = details.querySelector('.sheet-body');
  document.querySelectorAll('[data-project]').forEach(function (b) {
    b.addEventListener('click', function () {
      var tpl = document.getElementById(b.getAttribute('data-project'));
      dBody.innerHTML = '';
      dBody.appendChild(tpl.content.cloneNode(true));
      openOverlay(details, details.querySelector('[data-close]'));
    });
  });

  /* Copy buttons */
  document.querySelectorAll('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-copy');
      try {
        navigator.clipboard.writeText(v).then(function () {
          b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600);
        }, function () { b.textContent = 'Select text'; });
      } catch (err) { b.textContent = 'Select text'; }
    });
  });
})();
