# tbd-mmo design wiki

The public design wiki for **tbd-mmo** (working title), a dark-fantasy MMO in early
development, in English and Ukrainian. Pages are [Nunjucks](https://mozilla.github.io/nunjucks/)
templates built by [Eleventy](https://www.11ty.dev/) into static HTML; every piece of
text comes from translation files read by [i18next](https://www.i18next.com/). GitHub
Actions builds the site and publishes it to GitHub Pages.

**Site:** <https://diogen8.github.io/tbd-mmo-wiki/> · Ukrainian: <https://diogen8.github.io/tbd-mmo-wiki/uk/>

## What belongs here

The wiki presents the team's game-design notes: concept, world and lore, races and
characters, and game systems. Those notes are the source of truth; the wiki is a
readable presentation of them, not a separate canon.

- **Render, don't invent.** Every claim on a page comes from a design note. A gap in
  the notes is shown as “Not designed yet”, never filled in.
- **Design and lore only.** No technical documentation, roadmap commitments,
  infrastructure, addresses, file paths or credentials. Everything in this repository,
  including its history, is public.
- **English first**, short sentences, one idea per paragraph. English is the source;
  the Ukrainian translation follows it. See [TRANSLATION.md](TRANSLATION.md) for the
  glossary and style.
- **Images are added by the team, deliberately.** Each one is `.webp`, at most 300 KB,
  has alt text, opens full size with a download link, and its caption says what it is:
  `concept`, `generated` or `in-engine capture`. See [src/assets/img/README.md](src/assets/img/README.md).

## Layout

```
src/pages/index.njk           hub: 01 Concept · 02 World · 03 Races & Characters · 04 Systems · 05 Status
src/pages/world.njk           cosmology, locations, factions, timeline
src/pages/races.njk           playable races and notable characters
src/pages/systems/<name>.njk  one page per game system
src/404.njk                   page not found (English only)
src/_includes/base.njk        the shell of every page: head, rail, language switch, footer
src/_data/rail.js             the navigation rail, in order
src/_data/site.js             address, languages, fonts
src/assets/                   wiki.css, wiki.js, favicon, img/ (copied as is)
locales/<lang>/<page>.json    the text of each page, one file per page and language
locales/<lang>/common.json    text shared by every page: rail, tags, footer, interface
lib/i18n.js                   i18next setup; fails the build when languages drift apart
eleventy.config.js            the build
sources.json                  which design note each section renders, pinned by git blob hash
scripts/check_site.mjs        links, anchors, images, translations, navigation, leak check
scripts/check_sync.mjs        which sections are out of date with the design notes
TRANSLATION.md                how to translate, and the English–Ukrainian glossary
```

Each template under `src/pages/` is built once per language: `src/pages/systems/mana.njk`
becomes `systems/mana.html` and `uk/systems/mana.html`. A template holds the page's
markup and no text: it asks for each string by key, `{{ t("cosmology.p1") }}`, from
`locales/<lang>/mana.json`, or with a `common:` prefix from `common.json`. The rail,
the language switch, the `hreflang` links and the footer come from `base.njk`, so every
page has them.

## Working on the wiki

Needs Node 20 or later.

```
npm install
npm start               # http://localhost:8080/ with live reload
npm run check           # build, then check the result
```

### Editing a section

1. Read the design note(s) listed for the section in `sources.json`.
2. Edit the text in `locales/en/<page>.json` and the same keys in `locales/uk/<page>.json`.
   Keep what `omitted` lists out of the page. To add or remove a paragraph, list item
   or section, change the template in `src/pages/` and the keys in **both** languages.
   The build fails if a key is missing in either language or a key isn't used anywhere.
3. Re-pin the section to the notes you rendered:
   `node scripts/check_sync.mjs --client ../MyProject --accept <section-id>`
   (`--client` is a checkout of the source repository; it defaults to `../MyProject`).
4. Run `npm run check` and `node scripts/check_sync.mjs --client ../MyProject`, then open
   the pages from `npm start` at desktop and phone width, in light and dark.
5. Open a pull request. Merging to `main` publishes the site.

A new design note needs either a section in `sources.json` or an entry in `excluded`
with the reason it isn't published. A new page needs a template in `src/pages/`, its
`locales/<lang>/<page>.json` files, a rail entry in `src/_data/rail.js` and its label in
both `common.json` files.

## Checks

- **The build** fails on a translation key that is missing in a language or unused.
- **`scripts/check_site.mjs`** checks the built `_site/`: links and anchors, images, the
  rail, that every page has its translation with the same anchors and links and a
  language switch pointing at it, and that nothing internal leaks into the site or the
  repository.
- Both run on every pull request and before every deploy (`.github/workflows/site.yml`).
- **`scripts/check_sync.mjs`** runs in the source repository whenever its design notes
  change, and warns there when a wiki section has fallen behind. It needs git.

## Credits

The page layout (numbered rail, editorial headings, note and art cards, image viewer)
is adapted from the game-project hub in
[Mr. Mak Workspace](https://github.com/witnesstodark/mr-mak-workspace) (MIT,
commit `1e0c7c3`). The code here is written from scratch.
