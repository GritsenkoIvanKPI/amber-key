// Amber Key static site builder.
// Usage: node build.mjs   →  writes the finished website to ./site
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { icon, keyOrnament, ICON_NAMES } from './src/icons.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'site');
const CONTENT = path.join(ROOT, 'content');

const site = JSON.parse(fs.readFileSync(path.join(CONTENT, 'site.json'), 'utf8'));
const pages = fs.readdirSync(CONTENT)
  .filter((f) => f.endsWith('.json') && f !== 'site.json')
  .map((f) => JSON.parse(fs.readFileSync(path.join(CONTENT, f), 'utf8')));
const byId = Object.fromEntries(pages.map((p) => [p.id, p]));
const pathToId = Object.fromEntries(pages.map((p) => [p.path, p.id]));
// site.json → "published": list of page ids to build. Omit it to publish every page.
const isLive = (id) => !site.published || site.published.includes(id);
const LANGS = site.languages;
const YEAR = new Date().getFullYear();

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let L = 'en';
const t = (v) => (v == null ? '' : typeof v === 'object' && !Array.isArray(v) ? (v[L] ?? v.en ?? '') : String(v));
const rich = (v) => esc(t(v)).replace(/\*\*(.+?)\*\*/g, '<strong class="gold">$1</strong>');
const plain = (v) => t(v).replace(/\*\*/g, '');
const lang = () => LANGS.find((l) => l.code === L);
const isExternal = (h) => /^(https?:|tel:|mailto:|viber:|#)/.test(h);
const url = (href, code = L) => {
  if (href == null) return null;
  if (isExternal(href)) return href;
  const pre = LANGS.find((l) => l.code === code).prefix;
  const id = pathToId[href.split('#')[0]];
  // Hidden (unpublished) pages: contact → footer contacts, others → no link
  if (id && !isLive(id)) return id === 'contact' ? '/' + pre + '#contacts' : null;
  return '/' + pre + href;
};
const abs = (href, code) => site.domain + url(href, code);
const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`)).join('');
const linkAttrs = (href) => (href && /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '');
const d = (i) => ` data-d="${Math.min(i, 6)}"`;

function img(name, alt = '', { sizes = '100vw', eager = false, cls = '' } = {}) {
  if (!name) return '';
  return `<img${cls ? ` class="${cls}"` : ''} src="/assets/img/${name}-1600.webp" srcset="/assets/img/${name}-800.webp 800w, /assets/img/${name}-1600.webp 1600w" sizes="${sizes}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'} width="1600" height="1000">`;
}
const media = (name, alt, opts = {}, extra = '') => `<div class="media${extra ? ' ' + extra : ''}">${img(name, alt, opts)}</div>`;
const chip = (v) => (v ? `<span class="chip">${esc(t(v))}</span>` : '');
const head = (b, tag = 'h2') => `<div class="section-head reveal">${chip(b.chip)}${b.title ? `<${tag} class="h2">${rich(b.title)}</${tag}>` : ''}${b.lead ? `<p class="lead">${rich(b.lead)}</p>` : ''}</div>`;
const btn = (c, cls = 'btn--gold') => (c && url(c.href) ? `<a class="btn ${cls}" href="${esc(url(c.href))}"${linkAttrs(c.href)}>${esc(t(c.label))}${icon('arrow')}</a>` : '');

const navOrder = site.nav.flatMap((n) => n.children || [n.id]);
const servicePages = () => pages.filter((p) => !['home', 'contact'].includes(p.id) && isLive(p.id))
  .sort((a, b) => (navOrder.indexOf(a.id) + 1 || 99) - (navOrder.indexOf(b.id) + 1 || 99));
const navLabel = (p) => t(p.nav);

// ---------- blocks ----------
const blocks = {
  hero(b, page) {
    const home = b.variant === 'home';
    const crumbs = home ? '' : `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${url('')}">${esc(t(site.ui.home))}</a>${icon('chevronRight')}<span aria-current="page">${esc(navLabel(page))}</span></nav>`;
    const finder = home && b.finder && servicePages().length ? `
      <form class="finder" data-finder role="search" aria-label="${esc(t(b.finder.placeholder))}">
        <label class="visually-hidden" for="finder-select">${esc(t(b.finder.placeholder))}</label>
        <select id="finder-select" required>
          <option value="" selected disabled>${esc(t(b.finder.placeholder))}</option>
          ${servicePages().map((p) => `<option value="${esc(url(p.path))}">${esc(navLabel(p))}</option>`).join('')}
          ${isLive('contact') ? `<option value="${esc(url('contact/'))}">${esc(navLabel(byId.contact))}</option>` : ''}
        </select>
        <button class="btn btn--gold" type="submit">${esc(t(b.finder.button))}${icon('arrow')}</button>
      </form>` : '';
    const phoneBtn = b.cta && b.cta.href.startsWith('tel:') ? '' : `<a class="btn btn--ghost" href="tel:${site.contacts.phoneHref}">${icon('phone')}${esc(site.contacts.phone)}</a>`;
    const homeActions = `<div class="hero-actions"><a class="btn btn--gold" href="${esc(url('contact/'))}">${esc(t(site.ui.contact))}${icon('arrow')}</a><a class="btn btn--ghost" href="tel:${site.contacts.phoneHref}">${icon('phone')}${esc(site.contacts.phone)}</a></div>`;
    const actions = !home && b.cta ? `<div class="hero-actions">${btn(b.cta)}${phoneBtn}</div>` : '';
    const card = home && b.card ? `
      <a class="hero-card" href="${esc(url(b.card.href))}">
        ${media(b.card.image, plain(b.card.title), { sizes: '160px' })}
        <div class="hero-card-body">${chip(b.card.chip)}<h2>${esc(t(b.card.title))}</h2><span class="icon-btn" aria-hidden="true">${icon('arrowUp')}</span></div>
      </a>` : '';
    const tags = (b.tags || []).length ? `<ul class="tags">${b.tags.map((tg) => `<li>${tg.href && url(tg.href) ? `<a class="tag" href="${esc(url(tg.href))}"${linkAttrs(tg.href)}>${esc(t(tg.label))}</a>` : `<span class="tag">${esc(t(tg.label))}</span>`}</li>`).join('')}</ul>` : '';
    return `
<section class="hero ${home ? 'hero--home' : 'hero--inner'}">
  <div class="hero-bg">${img(b.image, plain(b.title), { eager: true })}</div>
  <div class="container hero-grid">
    <div class="hero-main hero-reveal">
      ${crumbs}
      <h1 class="display">${rich(b.title)}</h1>
      ${home ? (finder || homeActions) : `<p class="hero-lead">${rich(b.lead)}</p>`}
      ${home ? `<p class="hero-lead">${rich(b.lead)}</p>` : actions}
    </div>
    <div class="hero-side hero-reveal">${card}${tags}</div>
  </div>
</section>`;
  },

  intro(b) {
    const stats = (b.stats || []).map((s, i) => `<div class="stat reveal"${d(i + 1)}><b class="gold-text">${esc(t(s.value))}</b><span>${esc(t(s.label))}</span></div>`).join('');
    const paras = (b.paragraphs || []).map((p) => `<p>${rich(p)}</p>`).join('');
    const imgs = (b.images || []).length ? `<div class="intro-media">${b.images.map((im, i) => `<div class="media reveal"${d(i)}>${img(im, plain(b.label), { sizes: '(min-width: 992px) 50vw, 100vw' })}</div>`).join('')}</div>` : '';
    return `
<div class="container">
  <div class="intro-head reveal">${chip(b.chip)}<p class="intro-text">${rich(b.text)}</p></div>
  <div class="ornament reveal" aria-hidden="true">${keyOrnament()}</div>
  <div class="stats-row">
    <div class="stats-side reveal"><p class="stats-label"><span>(01)</span>${esc(t(b.label))}</p>${paras}</div>
    <div class="stats">${stats}</div>
  </div>
  ${imgs}
</div>`;
  },

  cards(b) {
    const items = b.items.map((c, i) => {
      const h = url(c.href);
      const tag = h ? 'a' : 'div';
      return `
      <${tag} class="svc-card reveal"${d(i)}${h ? ` href="${esc(h)}"` : ''}>
        ${media(c.image, plain(c.title), { sizes: '(min-width: 640px) 352px, 80vw' })}
        <div class="svc-card-label">
          <div class="top">${icon(c.icon || 'key')}${h ? `<span class="icon-btn" aria-hidden="true">${icon('arrowUp')}</span>` : ''}</div>
          <h3>${esc(t(c.title))}</h3>
        </div>
      </${tag}>`;
    }).join('');
    return `
<div class="container">
  <div class="cards-head">${head(b)}</div>
</div>
<div class="cards-track" data-track tabindex="0" aria-label="${esc(t(b.title))}">${items}</div>
<div class="container cards-controls-wrap"><div class="cards-controls" aria-hidden="false">
  <button class="icon-btn" type="button" data-prev aria-label="${esc(t(site.ui.prev))}">${icon('arrowLeft')}</button>
  <button class="icon-btn" type="button" data-next aria-label="${esc(t(site.ui.next))}">${icon('arrow')}</button>
</div></div>`;
  },

  rows(b) {
    const items = b.items.map((r) => {
      const bullets = r.bullets || [];
      return `
    <article class="row-item reveal">
      <div class="row-main">
        <h3>${esc(t(r.title))}</h3>
        <p>${rich(r.text)}</p>
        ${r.meta ? `<span class="row-meta">${esc(t(r.meta))}</span>` : ''}
        ${r.link && url(r.link.href) ? `<a class="link-arrow" href="${esc(url(r.link.href))}">${esc(t(r.link.label))}${icon('arrowUp')}</a>` : ''}
      </div>
      <ul class="dots${bullets.length > 3 ? ' dots--2' : ''}">${bullets.map((x) => `<li>${esc(t(x))}</li>`).join('')}</ul>
      ${r.image ? media(r.image, plain(r.title), { sizes: '(min-width: 992px) 25vw, 100vw' }, 'row-media') : ''}
    </article>`;
    }).join('');
    const lead = b.lead;
    return `
<div class="container">
  ${head({ ...b, lead: null })}
  ${lead ? `<p class="rows-lead reveal">${rich(lead)}</p>` : ''}
  <div class="rows">${items}</div>
  ${b.cta ? `<div class="rows-cta reveal">${btn(b.cta)}</div>` : ''}
</div>`;
  },

  grid(b) {
    const withImg = b.items.some((x) => x.image);
    const items = b.items.map((c, i) => withImg ? `
      <article class="feature feature--image reveal"${d(i % 2)}>
        <div class="feature-body">
          <span class="icon-badge">${icon(c.icon || 'star')}</span>
          <h3>${esc(t(c.title))}</h3>
          <p>${rich(c.text)}</p>
          ${c.meta ? `<span class="feature-meta">${esc(t(c.meta))}</span>` : ''}
        </div>
        ${c.tag ? `<span class="feature-tag">${esc(t(c.tag))}</span>` : ''}
        ${media(c.image, plain(c.title), { sizes: '(min-width: 992px) 25vw, 100vw' })}
      </article>` : `
      <article class="feature feature--compact reveal"${d(i % 3)}>
        <div class="feature-body">
          <span class="icon-badge">${icon(c.icon || 'star')}</span>
          <h3>${esc(t(c.title))}</h3>
          <p>${rich(c.text)}</p>
        </div>
        <span class="num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      </article>`).join('');
    return `
<div class="container">
  ${head(b)}
  <div class="cards-grid${withImg ? '' : ` cards-grid--compact cards-grid--n${b.items.length}`}">${items}</div>
  ${b.cta ? `<div class="rows-cta reveal">${btn(b.cta)}</div>` : ''}
</div>`;
  },

  tabs(b, page, idx) {
    const n = b.items.length;
    const base = `tabs-${idx}`;
    const tabs = b.items.map((it, i) => `<button class="tab" role="tab" type="button" id="${base}-t${i}" aria-controls="${base}-p${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${icon(it.icon || 'key')}${esc(t(it.tab))}</button>`).join('');
    const panels = b.items.map((it, i) => `
      <div class="tabpanel" role="tabpanel" id="${base}-p${i}" aria-labelledby="${base}-t${i}"${i ? ' hidden' : ''}>
        <div class="tab-copy">
          <p class="counter">${String(i + 1).padStart(3, '0')}/<small>${String(n).padStart(3, '0')}</small></p>
          <h3 class="h3">${esc(t(it.title))}</h3>
          <ul class="checks">${(it.bullets || []).map((x) => `<li>${icon('check')}<span>${esc(t(x))}</span></li>`).join('')}</ul>
          ${btn(it.cta)}
        </div>
        ${media(it.image, plain(it.title), { sizes: '(min-width: 992px) 50vw, 100vw' })}
      </div>`).join('');
    return `
<div class="container">
  ${head(b)}
  <div class="panel panel--dots reveal" data-tabs>
    <div class="tablist" role="tablist" aria-label="${esc(t(b.title))}">${tabs}</div>
    ${panels}
  </div>
</div>`;
  },

  steps(b) {
    const n = b.items.length;
    const items = b.items.map((s, i) => `
      <li class="step reveal"${d(i)}>
        <div class="step-top"><span class="icon-badge">${icon(s.icon || 'check')}</span><b>${String(i + 1).padStart(2, '0')}</b></div>
        <div><h3>${esc(t(s.title))}</h3><p>${rich(s.text)}</p></div>
      </li>`).join('');
    return `
<div class="container">
  ${head(b)}
  <div class="steps-wrap">
    ${media(b.image, plain(b.title), { sizes: '100vw' }, 'steps-media reveal')}
    <ol class="steps-list steps-list--${n}">${items}</ol>
  </div>
  ${b.cta ? `<div class="steps-cta reveal">${btn(b.cta)}</div>` : ''}
</div>`;
  },

  list(b) {
    const groups = b.groups.map((g) => `
      <div class="list-group">
        ${g.title && b.groups.length > 1 ? `<h3>${esc(t(g.title))}</h3>` : ''}
        <ul class="dots dots--2">${g.items.map((x) => `<li>${esc(t(x))}</li>`).join('')}</ul>
        ${g.note ? `<p class="note">${rich(g.note)}</p>` : ''}
      </div>`).join('');
    return `
<div class="container">
  ${head(b)}
  <div class="panel panel--dots list-panel${b.groups.length > 1 ? ' list-panel--2' : ''} reveal">${groups}</div>
</div>`;
  },

  countries(b) {
    const items = b.items.map((c, i) => `<li class="country reveal"${d(i % 5)}><b class="gold-text">${esc(c.code)}</b><span>${esc(t(c.name))}</span></li>`).join('');
    return `
<div class="container">
  ${head(b)}
  <ul class="countries">${items}</ul>
  ${b.note ? `<p class="countries-note reveal">${rich(b.note)}</p>` : ''}
</div>`;
  },

  checklist(b) {
    const hasImg = !!b.image;
    return `
<div class="container">
  <div class="panel panel--dots split${hasImg ? '' : ' split--noimg'}${b.reverse ? ' split--reverse' : ''} reveal">
    <div class="split-copy">
      ${chip(b.chip)}
      <h2 class="h3">${rich(b.title)}</h2>
      ${b.lead ? `<p class="lead">${rich(b.lead)}</p>` : ''}
      <ul class="checks">${b.items.map((x) => `<li>${icon('check')}<span>${esc(t(x))}</span></li>`).join('')}</ul>
      ${b.note ? `<p class="note">${rich(b.note)}</p>` : ''}
    </div>
    ${hasImg ? media(b.image, plain(b.title), { sizes: '(min-width: 992px) 50vw, 100vw' }) : ''}
  </div>
</div>`;
  },

  statement(b) {
    return `
<div class="container">
  <div class="statement">
    <div class="reveal">${chip(b.chip)}</div>
    <h2 class="h2 reveal">${rich(b.title)}</h2>
    ${(b.paragraphs || []).map((p) => `<p class="reveal">${rich(p)}</p>`).join('')}
    ${(b.bullets || []).length ? `<ul class="pills reveal">${b.bullets.map((x) => `<li>${esc(t(x))}</li>`).join('')}</ul>` : ''}
    ${b.highlight ? `<p class="highlight reveal">${rich(b.highlight)}</p>` : ''}
  </div>
</div>`;
  },

  cta(b) {
    return `
<div class="container">
  <div class="cta-band reveal">
    ${keyOrnament('cta-key')}
    <h2 class="h2">${rich(b.title)}</h2>
    <p>${rich(b.text)}</p>
    <div class="cta-actions">
      <a class="btn btn--gold" href="${url('contact/')}">${esc(t(b.button))}${icon('arrow')}</a>
      <a class="btn btn--ghost" href="${site.contacts.messengers.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
    </div>
  </div>
</div>`;
  },

  contact(b) {
    const c = site.contacts;
    const f = site.ui.form;
    const options = servicePages().map((p) => `<option>${esc(navLabel(p))}</option>`).join('');
    const mapQ = encodeURIComponent(c.address);
    return `
<div class="container">
  ${head({ chip: b.chip, title: b.title, lead: b.text })}
  <div class="contact-grid">
    <div class="contact-cards">
      <div class="contact-card reveal"><span class="icon-badge">${icon('pin')}</span><div><h3>${esc(t(site.ui.office))}</h3><span class="value">${esc(c.address)}</span><p class="small">${esc(t(c.addressNote))}</p></div></div>
      <div class="contact-card reveal"${d(1)}><span class="icon-badge">${icon('phone')}</span><div><h3>${esc(t(site.ui.phone))}</h3><a class="value" href="tel:${c.phoneHref}">${esc(c.phone)}</a>
        <div class="messengers"><a href="${c.messengers.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><a href="${c.messengers.viber}">Viber</a><a href="${c.messengers.telegram}" target="_blank" rel="noopener">Telegram</a></div></div></div>
      <div class="contact-card reveal"${d(2)}><span class="icon-badge">${icon('mail')}</span><div><h3>${esc(t(site.ui.email))}</h3><a class="value" href="mailto:${c.email}">${esc(c.email)}</a></div></div>
      <div class="contact-card reveal"${d(3)}><span class="icon-badge">${icon('instagram')}</span><div><h3>${esc(t(site.ui.instagram))}</h3><a class="value" href="https://www.instagram.com/${c.instagram}/" target="_blank" rel="noopener">@${esc(c.instagram)}</a></div></div>
    </div>
    <form class="panel panel--dots form reveal" data-contact-form data-email="${esc(c.email)}" data-subject="${esc(t(f.subject))}" data-sent="${esc(t(f.sent))}">
      <h2 class="h3">${esc(t(f.title))}</h2>
      <div class="form-row">
        <div class="field"><label for="f-name">${esc(t(f.name))}</label><input id="f-name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="f-contact">${esc(t(f.contact))}</label><input id="f-contact" name="contact" autocomplete="email" required></div>
      </div>
      <div class="field"><label for="f-service">${esc(t(f.service))}</label><select id="f-service" name="service"><option>${esc(t(f.serviceAny))}</option>${options}</select></div>
      <div class="field"><label for="f-msg">${esc(t(f.message))}</label><textarea id="f-msg" name="message"></textarea></div>
      <p class="consent">${esc(t(f.consent))}</p>
      <button class="btn btn--gold" type="submit">${esc(t(f.submit))}${icon('arrow')}</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
  <div class="map reveal"><iframe title="${esc(t(site.ui.map))}" src="https://www.google.com/maps?q=${mapQ}&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
</div>`;
  },
};

// Section wrapper with alternating surfaces
function renderBlocks(page) {
  let alt = 0;
  return page.blocks.map((b, i) => {
    const fn = blocks[b.type];
    if (!fn) throw new Error(`Unknown block type "${b.type}" in ${page.id}`);
    const html = fn(b, page, i);
    if (b.type === 'hero') return html;
    let cls = 'section';
    if (b.type === 'rows') cls += ' section--deep';
    else if (b.type !== 'cta') cls += alt++ % 2 ? ' section--ink1' : '';
    if (b.type === 'cards') cls += ' section--cards';
    return `<section class="${cls}"${b.id ? ` id="${esc(b.id)}"` : ''}>${html}</section>`;
  }).join('\n');
}

// ---------- layout ----------
// Menu with hidden pages removed; if only the home page is live, use in-page anchors
const liveNav = () => site.nav
  .map((n) => (n.id ? (byId[n.id] && isLive(n.id) ? n : null) : { ...n, children: n.children.filter((id) => byId[id] && isLive(id)) }))
  .filter((n) => n && (n.id || n.children.length));
const onePage = () => liveNav().length <= 1 && site.onePageNav;

function navHtml(page) {
  if (onePage()) return `<ul class="nav-pill">${site.onePageNav.map((n) => `<li class="nav-item"><a class="nav-link" href="${esc(url(n.href))}">${esc(t(n.label))}</a></li>`).join('')}</ul>`;
  const items = liveNav().map((n) => {
    if (n.id) {
      const p = byId[n.id];
      return `<li class="nav-item"><a class="nav-link" href="${url(p.path)}"${p.id === page.id ? ' aria-current="page"' : ''}>${esc(t(n.short) || navLabel(p))}</a></li>`;
    }
    const kids = n.children.map((id) => byId[id]).filter(Boolean);
    const current = kids.some((k) => k.id === page.id);
    return `<li class="nav-item${current ? ' is-current' : ''}" data-dropdown>
      <button class="nav-link" type="button" aria-expanded="false">${esc(t(n.label))}${icon('chevron')}</button>
      <div class="dropdown">${kids.map((k) => `<a href="${url(k.path)}"${k.id === page.id ? ' aria-current="page"' : ''}>${esc(navLabel(k))}${icon('arrow')}</a>`).join('')}</div>
    </li>`;
  }).join('');
  return `<ul class="nav-pill">${items}</ul>`;
}

function mobileNav(page) {
  if (onePage()) return site.onePageNav.map((n) => `<a href="${esc(url(n.href))}">${esc(t(n.label))}</a>`).join('');
  const items = liveNav().map((n) => {
    if (n.id) { const p = byId[n.id]; return p ? `<a href="${url(p.path)}"${p.id === page.id ? ' aria-current="page"' : ''}>${esc(navLabel(p))}</a>` : ''; }
    const kids = n.children.map((id) => byId[id]).filter(Boolean);
    return `<div class="m-group"><p>${esc(t(n.label))}</p>${kids.map((k) => `<a href="${url(k.path)}"${k.id === page.id ? ' aria-current="page"' : ''}>${esc(navLabel(k))}</a>`).join('')}</div>`;
  }).join('');
  return `${items}<a href="${url('contact/')}"${page.id === 'contact' ? ' aria-current="page"' : ''}>${esc(navLabel(byId.contact))}</a>`;
}

const langLinks = (page, cls = '') => LANGS.map((l) => `<a${cls ? ` class="${cls}"` : ''} href="${url(page.path, l.code)}" hreflang="${l.code}" lang="${l.code}"${l.code === L ? ' aria-current="true"' : ''}>${esc(l.name)}<span>${l.label}</span></a>`).join('');

function header(page) {
  return `
<header class="site-header" data-header>
  <div class="container header-row">
    <a class="brand" href="${url('')}" aria-label="Amber Key — ${esc(t(site.ui.home))}">
      <img src="/assets/brand/monogram.png" alt="" width="677" height="402">
      <span class="brand-word"><b>AMBER KEY</b><small>Global mobility</small></span>
    </a>
    <nav class="main-nav" aria-label="Main">${navHtml(page)}</nav>
    <div class="header-actions">
      <div class="lang" data-lang>
        <button class="lang-btn" type="button" aria-expanded="false" aria-label="${esc(t(site.ui.language))}">${lang().label}${icon('chevron')}</button>
        <div class="lang-menu">${langLinks(page)}</div>
      </div>
      <a class="btn btn--ivory btn--sm header-cta" href="${url('contact/')}">${esc(t(site.ui.contact))}${icon('arrow')}</a>
      <button class="burger" type="button" data-burger aria-expanded="false" aria-controls="mobile-menu" aria-label="${esc(t(site.ui.menu))}"><i><span></span><span></span></i></button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu">
  <nav aria-label="Mobile">${mobileNav(page)}</nav>
  <div class="m-foot">
    <div class="m-langs">${LANGS.map((l) => `<a href="${url(page.path, l.code)}" hreflang="${l.code}"${l.code === L ? ' aria-current="true"' : ''}>${l.label}</a>`).join('')}</div>
    <a class="btn btn--gold" href="tel:${site.contacts.phoneHref}">${icon('phone')}${esc(site.contacts.phone)}</a>
  </div>
</div>`;
}

function footer(page) {
  const c = site.contacts;
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-wrapper">
      <div class="footer-brand">
        <img src="/assets/brand/logo-full.png" alt="Amber Key — Global mobility &amp; business advisory" width="860" height="596" loading="lazy">
        <p>${esc(t(site.ui.footerText))}</p>
      </div>
      <div class="footer-cols">
        ${servicePages().length ? `<div class="footer-col"><h2>${esc(t(site.ui.services))}</h2><ul>${servicePages().map((p) => `<li><a href="${url(p.path)}">${esc(navLabel(p))}</a></li>`).join('')}</ul></div>` : ''}
        <div class="footer-col"><h2>${esc(t(site.ui.company))}</h2><ul>
          <li><a href="${url('')}">${esc(navLabel(byId.home))}</a></li>
          <li><a href="${url('#about')}">${esc(t(byId.home.blocks.find((b) => b.type === 'intro').chip))}</a></li>
          <li><a href="${url('contact/')}">${esc(navLabel(byId.contact))}</a></li>
        </ul></div>
        <div class="footer-col" id="contacts"><h2>${esc(t(site.ui.contactsTitle))}</h2><ul>
          <li>${esc(c.address)}</li>
          <li><a href="tel:${c.phoneHref}">${esc(c.phone)}</a></li>
          <li><a href="mailto:${c.email}">${esc(c.email)}</a></li>
          <li><a href="https://www.instagram.com/${c.instagram}/" target="_blank" rel="noopener">Instagram @${esc(c.instagram)}</a></li>
        </ul></div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© ${YEAR} SIA Amber Key. ${esc(t(site.ui.rights))} ${esc(t(site.ui.legalNote))}</p>
      <nav class="footer-langs" aria-label="${esc(t(site.ui.language))}">${LANGS.map((l) => `<a href="${url(page.path, l.code)}" hreflang="${l.code}"${l.code === L ? ' aria-current="true"' : ''}>${l.label}</a>`).join('')}</nav>
    </div>
  </div>
</footer>`;
}

function jsonLd(page) {
  const c = site.contacts;
  const org = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Amber Key',
    legalName: 'SIA Amber Key',
    url: site.domain + '/',
    logo: site.domain + '/assets/brand/logo-full.png',
    image: site.domain + `/assets/img/${page.seo.image}-og.jpg`,
    description: plain(byId.home.seo.description),
    telephone: c.phone,
    email: c.email,
    address: { '@type': 'PostalAddress', streetAddress: 'Brīvības iela 144', addressLocality: 'Riga', postalCode: 'LV-1012', addressCountry: 'LV' },
    areaServed: 'Europe',
    knowsLanguage: ['en', 'ru', 'lv'],
    sameAs: [`https://www.instagram.com/${c.instagram}/`],
  };
  const out = [org];
  if (page.id !== 'home') {
    out.push({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t(site.ui.home), item: abs('', L) },
        { '@type': 'ListItem', position: 2, name: navLabel(page), item: abs(page.path, L) },
      ],
    });
  }
  return out.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
}

function document(page) {
  const title = plain(page.seo.title);
  const desc = plain(page.seo.description);
  const alternates = LANGS.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${abs(page.path, l.code)}">`).join('\n  ');
  return `<!doctype html>
<html lang="${L}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${abs(page.path, L)}">
  ${alternates}
  <link rel="alternate" hreflang="x-default" href="${abs(page.path, 'en')}">
  <meta name="theme-color" content="#070605">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Amber Key">
  <meta property="og:locale" content="${lang().locale}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${abs(page.path, L)}">
  <meta property="og:image" content="${site.domain}/assets/img/${page.seo.image}-og.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon-32.png">
  <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${L === 'lv' ? 'EB+Garamond:wght@400;500' : 'Cormorant+Garamond:wght@500;600'}&family=Onest:wght@400;500;600&display=swap">
  <link rel="preload" as="image" href="/assets/img/${page.blocks[0].image}-1600.webp" imagesrcset="/assets/img/${page.blocks[0].image}-800.webp 800w, /assets/img/${page.blocks[0].image}-1600.webp 1600w" imagesizes="100vw">
  <link rel="stylesheet" href="/assets/css/site.css?v=${BUILD}">
  <script>document.documentElement.classList.add('js')</script>
  ${jsonLd(page)}
</head>
<body>
  <a class="skip-link" href="#main">${esc(t(site.ui.skip))}</a>
  ${header(page)}
  <main id="main">
${renderBlocks(page)}
  </main>
  ${footer(page)}
  <script src="/assets/js/site.js?v=${BUILD}" defer></script>
</body>
</html>
`;
}

// ---------- content check: unknown images / icons / languages ----------
const rawImages = new Set(fs.readdirSync(path.join(ROOT, 'assets', 'img', 'raw')).map((f) => f.replace(/\.(jpe?g|png)$/i, '')));
const problems = [];
const walk = (node, where) => {
  if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${where}[${i}]`));
  if (!node || typeof node !== 'object') return;
  const keys = Object.keys(node);
  if (keys.length && keys.every((k) => ['en', 'ru', 'lv'].includes(k))) {
    for (const l of LANGS) if (!node[l.code]) problems.push(`${where}: missing "${l.code}" text`);
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === 'image' && typeof v === 'string' && !rawImages.has(v)) problems.push(`${where}.image: no photo "${v}" in assets/img/raw`);
    if (k === 'images') v.forEach((im) => !rawImages.has(im) && problems.push(`${where}.images: no photo "${im}"`));
    if (k === 'icon' && !ICON_NAMES.includes(v)) problems.push(`${where}.icon: unknown icon "${v}"`);
    walk(v, `${where}.${k}`);
  }
};
pages.forEach((p) => walk(p, p.id));
if (problems.length) console.warn('Content warnings:\n  ' + problems.join('\n  '));

// ---------- build ----------
const BUILD = Date.now().toString(36);
const write = (rel, html) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// Images (optimised webp + og jpg + favicons) — cached in .cache/img
execFileSync('python3', [path.join(ROOT, 'tools', 'images.py'), ROOT], { stdio: 'inherit' });
fs.cpSync(path.join(ROOT, '.cache', 'img'), path.join(OUT, 'assets', 'img'), { recursive: true });
fs.cpSync(path.join(ROOT, 'assets', 'brand'), path.join(OUT, 'assets', 'brand'), { recursive: true });
fs.cpSync(path.join(ROOT, 'src', 'css'), path.join(OUT, 'assets', 'css'), { recursive: true });
fs.cpSync(path.join(ROOT, 'src', 'js'), path.join(OUT, 'assets', 'js'), { recursive: true });

const sitemap = [];
for (const l of LANGS) {
  L = l.code;
  for (const page of pages.filter((p) => isLive(p.id))) {
    write(path.join(l.prefix, page.path, 'index.html'), document(page));
    sitemap.push(`  <url>\n    <loc>${abs(page.path, l.code)}</loc>\n${LANGS.map((x) => `    <xhtml:link rel="alternate" hreflang="${x.code}" href="${abs(page.path, x.code)}"/>`).join('\n')}\n  </url>`);
  }
}

// 404 (English + links to all languages)
L = 'en';
const notFound = { id: '404', path: '', nav: { en: 'Page not found' }, seo: { title: { en: 'Page not found | Amber Key' }, description: { en: 'Page not found.' }, image: 'home-hero' },
  blocks: [{ type: 'hero', title: { en: 'Page not found', ru: 'Страница не найдена', lv: 'Lapa nav atrasta' }, lead: { en: 'The page you are looking for has moved or no longer exists.' }, image: 'home-hero', cta: { label: { en: 'Back to home' }, href: '' }, tags: LANGS.map((x) => ({ label: x.name, href: x.prefix ? x.prefix : '' })) }] };
write('404.html', document(notFound).replace('<head>', '<head>\n  <meta name="robots" content="noindex">'));

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemap.join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`);

console.log(`Built ${pages.filter((p) => isLive(p.id)).length} of ${pages.length} pages × ${LANGS.length} languages → ${path.relative(process.cwd(), OUT) || OUT}`);
