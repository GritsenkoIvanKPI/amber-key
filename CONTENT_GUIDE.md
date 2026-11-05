# Amber Key — Content Guide

All website text lives in `content/`. One JSON file = one page, with all three
languages side by side. After editing, run:

```bash
node build.mjs
```

The finished website is written to `site/` (upload that folder to hosting).

---

## Localized text

Any text field is an object with three languages:

```json
"title": { "en": "Work visas", "ru": "Рабочие визы", "lv": "Darba vīzas" }
```

Fields that are not text (image names, links, icons, numbers like `"8+"`) are plain strings.

- `**bold**` inside text is rendered as gold emphasis.
- Lists are arrays of localized objects: `"items": [ {"en":"…","ru":"…","lv":"…"}, … ]`.

## Page file

```json
{
  "id": "residence-permit-latvia",          // unique id, used in nav (content/site.json)
  "path": "residence-permit-latvia/",       // URL; "" for the home page
  "nav": { "en": "…", "ru": "…", "lv": "…" },   // short name (menus, breadcrumbs, footer)
  "seo": { "title": L, "description": L, "image": "lv-hero" },
  "blocks": [ … sections in order … ]
}
```

`href` values are page paths without language prefix (`"contact/"`, `"work-visas/"`, `""` = home, `"#steps"` = anchor). The build adds `/ru/` or `/lv/` automatically.

Images: a name such as `"lv-hero"` refers to `assets/img/raw/lv-hero.jpg`. Add a new photo there and use its name.

Icons (use the name): `key passport briefcase building globe shield users family scale document chart plane truck factory hammer warehouse laptop check compass handshake clock pin phone mail coins home palm sun star search flag card rocket layers chat lock`

---

## Section types (`blocks`)

All `chip` fields are the small label above a section title.

### `hero` — top of every page
```json
{ "type": "hero", "title": L, "lead": L, "image": "lv-hero",
  "tags": [ {"label": L, "href": "work-visas/"} ],          // small pills, bottom right (3–6)
  "cta": { "label": L, "href": "contact/" } }
```
Home only adds `"variant": "home"`, `"card": {"image","chip":L,"title":L,"href"}`, `"finder": {"placeholder":L,"button":L}`.

### `intro` — centred statement + 3 numbers + two photos
```json
{ "type": "intro", "chip": L, "text": L, "label": L,
  "stats": [ {"value": "8+", "label": L}, … 3 items ],
  "paragraphs": [ L, … ],            // optional, shown beside the stats
  "images": ["about-1", "about-2"] }
```

### `cards` — horizontal scrolling photo cards with links
```json
{ "type": "cards", "chip": L, "title": L,
  "items": [ {"title": L, "icon": "key", "image": "svc-work", "href": "work-visas/"} ] }
```

### `rows` — dark section, one row per item (title, text, bullet columns, photo)
```json
{ "type": "rows", "chip": L, "title": L, "lead": L,
  "items": [ {"title": L, "text": L, "meta": L, "bullets": [L,…], "image": "row-work",
              "link": {"label": L, "href": "work-visas/"} } ],
  "cta": {"label": L, "href": "contact/"} }
```
`meta`, `link`, `lead`, `cta` are optional.

### `grid` — 2-column cards (icon, tag, title, text, optional photo)
```json
{ "type": "grid", "chip": L, "title": L, "lead": L,
  "items": [ {"icon": "shield", "tag": L, "title": L, "text": L, "image": "why-1", "meta": L} ] }
```
Cards without `image` render compact (3 columns). Keep either all with or all without images.

### `tabs` — tabbed panel (numbered 001/004), checklist + button + photo
```json
{ "type": "tabs", "chip": L, "title": L,
  "items": [ {"tab": L, "icon": "briefcase", "title": L, "bullets": [L,…],
              "cta": {"label": L, "href": "…"}, "image": "tab-investors"} ] }
```

### `list` — one or two columns of bullet lists on a panel
```json
{ "type": "list", "chip": L, "title": L, "lead": L,
  "groups": [ {"title": L, "items": [L,…], "note": L} ] }
```

### `countries` — grid of country tiles (code + name)
```json
{ "type": "countries", "chip": L, "title": L, "lead": L, "note": L,
  "items": [ {"code": "LV", "name": L} ] }
```

### `checklist` — split panel: checklist + photo
```json
{ "type": "checklist", "chip": L, "title": L, "lead": L, "items": [L,…], "note": L,
  "image": "lv-1", "reverse": false }
```

### `statement` — centred editorial text block
```json
{ "type": "statement", "chip": L, "title": L, "paragraphs": [L,…], "bullets": [L,…], "highlight": L }
```

### `steps` — wide photo with numbered step cards over it
```json
{ "type": "steps", "chip": L, "title": L, "image": "process-wide",
  "items": [ {"title": L, "text": L, "icon": "chat"} ], "cta": {"label": L, "href": "contact/"} }
```

### `cta` — closing call-to-action band (last block of each page)
```json
{ "type": "cta", "title": L, "text": L, "button": L }
```

### `contact` — contact page details + form (uses data from `site.json`)
```json
{ "type": "contact", "chip": L, "title": L, "text": L }
```

---

## Adding a new service page

1. Copy a similar file (e.g. `content/residence-permit-latvia.json`) to a new name.
2. Change `id`, `path`, `nav`, `seo` and the texts.
3. Add the `id` to the menu in `content/site.json` (`nav`).
4. Run `node build.mjs`.
