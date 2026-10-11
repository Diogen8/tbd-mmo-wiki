#!/usr/bin/env node
// Checks the static site before it goes public:
//   - every local link and image resolves, including #fragments;
//   - every page has a title, a description and the same navigation rail as the
//     hub in its language;
//   - every English page has a Ukrainian translation under uk/ (and the other way
//     round) with the same anchors and links, hreflang links to both, and a
//     language switch that points at the other one;
//   - every image has alt text, opens full size through <a class="zoom">, and
//     images in assets/img are .webp or .svg and at most 300 KB;
//   - no internal details leak (infrastructure names, IP addresses, drive
//     paths, engine asset paths, credentials).
// Exit code 0 when clean, 1 with a list of problems. Zero npm dependencies.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_PREFIX = '/tbd-mmo-wiki/'; // GitHub Pages project path, used by 404.html
const SITE_URL = 'https://diogen8.github.io/tbd-mmo-wiki/'; // published address, used by hreflang links
const UK = 'uk/'; // the Ukrainian translation mirrors the English pages under this folder
const MAX_IMAGE_BYTES = 300 * 1024;
const SKIP_DIRS = new Set(['.git', 'node_modules', '.github']);

// Patterns that must never appear in published text. This file is the only
// exception, because it has to spell them out.
const FORBIDDEN = [
  [/tailscale/i, 'infrastructure name'],
  [/perforce|\bp4\b|helix core/i, 'source-control detail'],
  [/\b\d{1,3}(?:\.\d{1,3}){3}\b/, 'IP address'],
  [/(?<![A-Za-z])[A-Za-z]:\\/, 'Windows drive path'],
  [/(?<![A-Za-z])[A-Za-z]:\/(?!\/)/, 'Windows drive path'],
  [/\/Game\/|\.uasset\b|\.umap\b/, 'engine asset path'],
  [/api[_-]?key|password|client[_-]?secret|bearer\s+[a-z0-9]/i, 'credential'],
];

const problems = [];
const fail = (file, text) => problems.push(`${file}: ${text}`);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(relative(root, full).split(sep).join('/'));
  }
  return out;
}

const files = walk(root);
const pages = files.filter(f => f.endsWith('.html'));
const html = new Map(pages.map(p => [p, readFileSync(join(root, p), 'utf8')]));
const idsOf = page => new Set([...html.get(page).matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));

// Resolves a link from `page` to a site path ("systems/mana.html") plus fragment,
// or null for external links.
function resolveLink(page, href) {
  if (/^(?:[a-z]+:|\/\/)/i.test(href)) return null;
  let [path, fragment = ''] = href.split('#');
  if (path.startsWith(SITE_PREFIX)) path = path.slice(SITE_PREFIX.length);
  else if (path.startsWith('/')) return { error: 'absolute link outside the site prefix' };
  else if (path === '') path = page;
  else path = posix.normalize(posix.join(posix.dirname(page), path));
  if (path.endsWith('/')) path += 'index.html';
  return { path, fragment };
}

const langOf = page => (page.startsWith(UK) ? 'uk' : 'en');
const englishOf = page => (page.startsWith(UK) ? page.slice(UK.length) : page);
// The page the language switch leads to. 404.html is served for every missing path,
// so it has no translation and switches to the Ukrainian hub.
const counterpart = page => (page.startsWith(UK) ? englishOf(page) : page === '404.html' ? `${UK}index.html` : UK + page);

for (const [page, text] of html) {
  if (!text.includes(`<html lang="${langOf(page)}">`)) fail(page, `missing <html lang="${langOf(page)}">`);
  if (!/<title>[^<]+<\/title>/.test(text)) fail(page, 'missing <title>');
  if (!/<meta name="description" content="[^"]+">/.test(text)) fail(page, 'missing meta description');

  for (const m of text.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const href = m[1].replaceAll('&amp;', '&');
    const link = resolveLink(page, href);
    if (!link) continue;
    if (link.error) { fail(page, `${href}: ${link.error}`); continue; }
    if (!existsSync(join(root, link.path))) { fail(page, `broken link ${href}`); continue; }
    if (link.fragment && link.path.endsWith('.html') && !idsOf(link.path).has(link.fragment)) {
      fail(page, `missing anchor ${href}`);
    }
  }

  for (const m of text.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="[^"]+"/.test(m[0])) fail(page, `image without alt text: ${m[0]}`);
  }
  const imgs = (text.match(/<img\b/g) || []).length;
  const zoomed = (text.match(/<a class="zoom" href="[^"]+"[^>]*>\s*<img\b/g) || []).length;
  if (imgs !== zoomed) fail(page, `${imgs - zoomed} image(s) not wrapped in <a class="zoom" href="…full size…">`);
}

// Every page carries the same rail as the hub in its language; compare them,
// ignoring which item is marked current, the language switch (it leads to each
// page's own translation, checked below) and how relative links are written.
const railOf = page => {
  const m = html.has(page) && html.get(page).match(/<aside class="rail">[\s\S]*?<\/aside>/);
  if (!m) return null;
  return m[0]
    .replace(/\saria-current="[^"]*"/g, '')
    .replace(/<div class="lang-switch"[\s\S]*?<\/div>/, '<div class="lang-switch"></div>')
    .replace(/\shref="([^"]*)"/g, (_, href) => {
      const link = resolveLink(page, href);
      return ` href="${link && !link.error ? `${link.path}${link.fragment ? `#${link.fragment}` : ''}` : href}"`;
    });
};
const hubs = { en: 'index.html', uk: `${UK}index.html` };
for (const page of pages) {
  const rail = railOf(page);
  const hub = hubs[langOf(page)];
  if (!rail) fail(page, 'missing navigation rail');
  else if (rail !== railOf(hub)) fail(page, `navigation rail differs from ${hub}`);
}

// Translations. Anchors must match so the language switch keeps the reader's place,
// and links must match so a structural change to one language can't go unnoticed
// in the other. Links are compared as English site paths ("uk/" dropped).
const linksOf = page => new Set([...html.get(page).matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)].map(m => {
  const href = m[1].replaceAll('&amp;', '&');
  const link = resolveLink(page, href);
  return link && !link.error ? `${englishOf(link.path)}${link.fragment ? `#${link.fragment}` : ''}` : href;
}));
const differences = (a, b) => [...a].filter(x => !b.has(x));
for (const page of pages) {
  const text = html.get(page);
  const target = text.match(/<div class="lang-switch"[^>]*>[\s\S]*?<a\b[^>]*?\shref="([^"]*)"/);
  const link = target && resolveLink(page, target[1]);
  if (!link || link.path !== counterpart(page)) fail(page, `language switch must link to ${counterpart(page)}`);

  if (page === '404.html') continue;
  for (const [lang, path] of [['en', englishOf(page)], ['uk', UK + englishOf(page)]]) {
    const tag = `<link rel="alternate" hreflang="${lang}" href="${SITE_URL}${path}">`;
    if (!text.includes(tag)) fail(page, `missing ${tag}`);
  }

  const other = counterpart(page);
  if (!html.has(other)) { fail(page, `no ${langOf(page) === 'en' ? 'translation' : 'original'} at ${other}`); continue; }
  if (langOf(page) === 'uk') continue; // each pair is compared once, from the English side
  for (const [what, of] of [['anchor', idsOf], ['link', linksOf]]) {
    const mine = of(page), theirs = of(other);
    for (const x of differences(mine, theirs)) fail(other, `${what} ${x} is in ${page} but not in the translation`);
    for (const x of differences(theirs, mine)) fail(other, `${what} ${x} is not in the original ${page}`);
  }
}

for (const file of files.filter(f => f.startsWith('assets/img/'))) {
  if (file.endsWith('/.gitkeep') || file.endsWith('README.md')) continue;
  const ext = extname(file).toLowerCase();
  if (ext !== '.webp' && ext !== '.svg') fail(file, 'images must be .webp (png/jpg are not allowed here)');
  const size = statSync(join(root, file)).size;
  if (size > MAX_IMAGE_BYTES) fail(file, `${Math.round(size / 1024)} KB is over the ${MAX_IMAGE_BYTES / 1024} KB limit`);
}

const self = relative(root, fileURLToPath(import.meta.url)).split(sep).join('/');
for (const file of files.filter(f => /\.(html|css|js|mjs|json|md|txt|svg)$/.test(f) && f !== self)) {
  const text = readFileSync(join(root, file), 'utf8');
  text.split(/\r?\n/).forEach((line, i) => {
    for (const [pattern, what] of FORBIDDEN) {
      if (pattern.test(line)) fail(`${file}:${i + 1}`, `looks like an internal detail (${what}): ${line.trim().slice(0, 120)}`);
    }
  });
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log(`OK: ${pages.length} pages, ${files.length} files checked.`);
