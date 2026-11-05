// node screenshot.mjs <url> [label] [width]  → ./temporary screenshots/screenshot-N[-label].png (full page)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let puppeteer;
try { puppeteer = require('puppeteer-core'); } catch {
  puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.tmpdir(), 'puppeteer-core'));
}

const [, , target = 'http://localhost:3000', label = '', width = '1440'] = process.argv;
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'temporary screenshots');
fs.mkdirSync(dir, { recursive: true });
const n = fs.readdirSync(dir).filter((f) => f.startsWith('screenshot-')).length + 1;
const file = path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`);

const cache = path.join(os.homedir(), '.cache', 'puppeteer', 'chrome');
const ver = fs.readdirSync(cache).sort().pop();
const exe = path.join(cache, ver, fs.readdirSync(path.join(cache, ver))[0], 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--hide-scrollbars'] });
const page = await browser.newPage();
const w = Number(width);
await page.setViewport({ width: w, height: w < 600 ? 844 : 900, deviceScaleFactor: 1 });
await page.goto(target, { waitUntil: 'networkidle0' });
// trigger lazy images + reveals
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
  document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
  await Promise.all([...document.images].filter((i) => !i.closest('[hidden]')).map((i) => (i.complete ? i.decode().catch(() => {}) : new Promise((r) => { i.onload = i.onerror = r; }))));
  window.scrollTo(0, 0);
});
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: file, fullPage: true });
await browser.close();
console.log(file);
