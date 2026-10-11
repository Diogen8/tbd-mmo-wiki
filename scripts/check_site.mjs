#!/usr/bin/env node
// Checks the static site before it goes public:
//   - every local link and image resolves, including #fragments;
//   - every page has a title, a description and the same navigation rail;
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

for (const [page, text] of html) {
  if (!/<html lang="en">/.test(text)) fail(page, 'missing <html lang="en">');
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

// Every page carries the same rail; compare it with the hub's, ignoring which
// item is marked current and resolving relative links.
const railOf = page => {
  const m = html.get(page).match(/<aside class="rail">[\s\S]*?<\/aside>/);
  if (!m) return null;
  return m[0]
    .replace(/\saria-current="[^"]*"/g, '')
    .replace(/\shref="([^"]*)"/g, (_, href) => {
      const link = resolveLink(page, href);
      return ` href="${link && !link.error ? `${link.path}${link.fragment ? `#${link.fragment}` : ''}` : href}"`;
    });
};
const reference = railOf('index.html');
for (const page of pages) {
  const rail = railOf(page);
  if (!rail) fail(page, 'missing navigation rail');
  else if (rail !== reference) fail(page, 'navigation rail differs from index.html');
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
