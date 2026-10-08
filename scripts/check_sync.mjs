#!/usr/bin/env node
// Reports wiki sections whose design notes changed since the section was written.
//
//   node scripts/check_sync.mjs --client ../MyProject           check
//   node scripts/check_sync.mjs --client ../MyProject --accept mana   re-pin one section
//   node scripts/check_sync.mjs --client ../MyProject --accept all    re-pin every section
//
// --client is a checkout of the source repository (default: $TBD_MMO_CLIENT, then
// ../MyProject). Hashes come from `git hash-object`, so line-ending conversion is
// applied exactly as git would and a CRLF working tree still matches the commit.
//
// Exit codes: 0 in sync, 1 stale/unmapped/missing notes, 2 usage error.
// Zero npm dependencies; needs Node 18+ and git on PATH.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const wikiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcesPath = join(wikiRoot, 'sources.json');

function usage(message) {
  if (message) console.error(`error: ${message}`);
  console.error('usage: node scripts/check_sync.mjs [--client <path>] [--accept <section-id>|all]');
  process.exit(2);
}

const args = process.argv.slice(2);
let client = process.env.TBD_MMO_CLIENT || join(wikiRoot, '..', 'MyProject');
let accept = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--client') client = args[++i];
  else if (args[i] === '--accept') accept = args[++i];
  else if (args[i] === '--help' || args[i] === '-h') usage();
  else usage(`unknown argument ${args[i]}`);
}
if (!client) usage('--client needs a path');
client = resolve(client);

const config = JSON.parse(readFileSync(sourcesPath, 'utf8'));
const designRoot = join(client, ...config.source.root.split('/'));
if (!existsSync(designRoot)) usage(`${designRoot} not found; point --client at a checkout of ${config.source.repo}`);

const gha = process.env.GITHUB_ACTIONS === 'true';
const warn = (title, text) => {
  console.log(`  - ${text}`);
  if (gha) console.log(`::warning title=${title}::${text}`);
};

// Every *.md under the design root, as repo-relative forward-slash paths.
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith('.md')) out.push(relative(client, full).split(sep).join('/'));
  }
  return out;
}
const designFiles = walk(designRoot).sort();

const mapped = new Set(config.sections.flatMap(s => Object.keys(s.sources)));
const present = [...mapped].filter(p => existsSync(join(client, p)));
const hashes = new Map();
if (present.length) {
  const out = execFileSync('git', ['-C', client, 'hash-object', '--', ...present], { encoding: 'utf8' });
  out.trim().split(/\r?\n/).forEach((hash, i) => hashes.set(present[i], hash));
}

if (accept) {
  const targets = accept === 'all' ? config.sections : config.sections.filter(s => s.id === accept);
  if (!targets.length) usage(`no section with id "${accept}"; ids: ${config.sections.map(s => s.id).join(', ')}`);
  for (const section of targets) {
    for (const path of Object.keys(section.sources)) {
      if (!hashes.has(path)) usage(`${path} (section ${section.id}) no longer exists; fix sources.json by hand`);
      section.sources[path] = hashes.get(path);
    }
    console.log(`pinned ${section.id}`);
  }
  writeFileSync(sourcesPath, `${JSON.stringify(config, null, 2)}\n`);
  process.exit(0);
}

let problems = 0;

const stale = [];
for (const section of config.sections) {
  const changed = Object.entries(section.sources).filter(([path, hash]) => hashes.get(path) !== hash);
  if (changed.length) stale.push([section, changed]);
}
if (stale.length) {
  console.log('Wiki sections whose design notes changed since they were written:');
  for (const [section, changed] of stale) {
    for (const [path] of changed) {
      const what = hashes.has(path) ? 'changed' : 'was deleted or moved';
      warn('Design wiki out of date', `${section.page} (${section.id}): ${path} ${what}`);
    }
  }
  problems += stale.length;
}

const excluded = new Set(Object.keys(config.excluded || {}));
const unmapped = designFiles.filter(p => !mapped.has(p) && !excluded.has(p));
if (unmapped.length) {
  console.log('Design notes with no wiki section and no "excluded" entry:');
  for (const path of unmapped) warn('Design note not in the wiki', path);
  problems += unmapped.length;
}

const goneExcluded = [...excluded].filter(p => !designFiles.includes(p));
if (goneExcluded.length) {
  console.log('"excluded" entries that no longer exist:');
  for (const path of goneExcluded) warn('Stale wiki exclusion', path);
  problems += goneExcluded.length;
}

if (problems) {
  console.log(`\n${problems} issue(s). Update the wiki page, then re-pin with --accept <section-id>,`);
  console.log('or map/exclude the note in sources.json.');
  process.exit(1);
}
console.log(`In sync: ${config.sections.length} sections, ${designFiles.length} design notes (${excluded.size} excluded).`);
