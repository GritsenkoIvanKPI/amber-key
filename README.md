# Amber Key — website

Multi-page, trilingual (EN / RU / LV) static website.

## Everyday use

| Task | What to do |
|---|---|
| Change text | Edit the page file in `content/` (all three languages sit side by side), then run `node build.mjs` |
| Change contacts, menu, buttons, footer | `content/site.json` |
| Add or replace a photo | Put a `.jpg` into `assets/img/raw/` and use its name (without `.jpg`) in the content file |
| Add a new service page | See "Adding a new service page" in `CONTENT_GUIDE.md` |
| Hide / show pages | `content/site.json` → `"published"`: list of page ids to build (currently only `"home"`). Delete the line to publish all pages |
| Preview locally | `node build.mjs` then `node serve.mjs` → http://localhost:3000 |
| Publish | Upload the contents of `site/` to the hosting root |

Requirements: Node.js 18+ and Python 3 with Pillow (`pip install pillow`, used to optimise photos).

## URLs

- English: `/`, `/work-visas/`, `/residence-permit-poland/`, `/residence-permit-latvia/`, `/citizenship-by-investment/`, `/digital-nomad-spain/`, `/digital-nomad-croatia/`, `/contact/`
- Russian: the same paths under `/ru/`
- Latvian: the same paths under `/lv/`

## Before going live

- Set the real domain in `content/site.json` → `"domain"` (used for canonical links, hreflang, sitemap and social previews). It is currently a placeholder: `https://amberkey.lv`.
- The contact form opens the visitor's email app with the request filled in. To receive requests directly on the site, connect a form service (e.g. Formspree) or a backend.
- Update the office address in `content/site.json` once the office moves.

## Project structure

```
content/        page texts (JSON, one file per page, EN/RU/LV)
assets/img/raw/ source photos (generated with Gemini)
assets/brand/   logo files (transparent PNG cut from the logo)
src/css, src/js stylesheet and interactions
src/icons.mjs   icon set
build.mjs       generates ./site
tools/images.py photo optimisation (WebP 800/1600 + social preview JPG)
```
