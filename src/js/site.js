(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Header: solid on scroll, hide on scroll down */
  const header = $('[data-header]');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    const hide = y > 400 && y > lastY && !document.body.classList.contains('menu-open') && !header.contains(document.activeElement);
    header.classList.toggle('is-hidden', hide);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const burger = $('[data-burger]');
  burger?.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('#mobile-menu a').forEach((a) => a.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    burger?.setAttribute('aria-expanded', 'false');
  }));

  /* Dropdowns (click/keyboard; hover handled by CSS) */
  const closeAll = (except) => $$('[data-dropdown].is-open, [data-lang].is-open').forEach((el) => {
    if (el === except) return;
    el.classList.remove('is-open');
    el.querySelector('button')?.setAttribute('aria-expanded', 'false');
  });
  $$('[data-dropdown], [data-lang]').forEach((el) => {
    const b = el.querySelector('button');
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !el.classList.contains('is-open');
      closeAll(el);
      el.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', () => closeAll());
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeAll();
    if (document.body.classList.contains('menu-open')) burger?.click();
  });

  /* Service finder */
  $$('[data-finder]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = f.querySelector('select').value;
    if (v) window.location.href = v;
  }));

  /* Card carousel controls */
  $$('[data-track]').forEach((track) => {
    const wrap = track.nextElementSibling;
    const prev = wrap?.querySelector('[data-prev]');
    const next = wrap?.querySelector('[data-next]');
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + 16;
    const update = () => {
      if (!prev) return;
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
    };
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* Tabs (WAI-ARIA pattern) */
  $$('[data-tabs]').forEach((root) => {
    const tabs = $$('[role="tab"]', root);
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !on;
        panel.classList.toggle('is-entering', on);
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const map = { ArrowRight: 1, ArrowLeft: -1 };
        if (e.key in map) { e.preventDefault(); select(tabs[(i + map[e.key] + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
  });

  /* Contact form → opens the visitor's email app with the request */
  $$('[data-contact-form]').forEach((form) => form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const body = [...data.entries()].map(([k, v]) => `${form.querySelector(`[name="${k}"]`)?.labels?.[0]?.textContent || k}: ${v}`).join('\n');
    window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(form.dataset.subject)}&body=${encodeURIComponent(body)}`;
    form.querySelector('.form-status').textContent = form.dataset.sent;
  }));

  /* Scroll reveal */
  const items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }
})();
