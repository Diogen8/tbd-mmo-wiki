# tbd-mmo design wiki

The public design wiki for **tbd-mmo** (working title), a dark-fantasy MMO in early
development. It is a set of hand-written static HTML pages served by GitHub Pages:
no build step, no framework, no dependencies.

**Site:** <https://diogen8.github.io/tbd-mmo-wiki/>

## What belongs here

The wiki presents the team's game-design notes: concept, world and lore, races and
characters, and game systems. Those notes are the source of truth; the wiki is a
readable presentation of them, not a separate canon.

- **Render, don't invent.** Every claim on a page comes from a design note. A gap in
  the notes is shown as “Not designed yet”, never filled in.
- **Design and lore only.** No technical documentation, roadmap commitments,
  infrastructure, addresses, file paths or credentials. Everything in this repository,
  including its history, is public.
- **English**, short sentences, one idea per paragraph.
- **Images are added by the team, deliberately.** Each one is `.webp`, at most 300 KB,
  has alt text, opens full size with a download link, and its caption says what it is:
  `concept`, `generated` or `in-engine capture`. See [assets/img/README.md](assets/img/README.md).

## Layout

```
index.html              hub: 01 Concept · 02 World · 03 Races & Characters · 04 Systems · 05 Status
world.html              cosmology, locations, factions, timeline
races.html              playable races and notable characters
systems/<name>.html     one page per game system
assets/wiki.css         design tokens, light and dark themes, layout
assets/wiki.js          theme switch and image lightbox
assets/img/             published images (.webp)
sources.json            which design note each section renders, pinned by git blob hash
scripts/check_site.mjs  links, anchors, images, navigation, and leak check
scripts/check_sync.mjs  which sections are out of date with the design notes
404.html, .nojekyll
```

Every page repeats the same navigation rail. When you add or rename a page, update the
rail on **every** page; `check_site.mjs` fails if one differs.

## Editing a section

1. Read the design note(s) listed for the section in `sources.json`.
2. Edit the page by hand. Keep what `omitted` lists out of the page.
3. Re-pin the section to the notes you rendered:
   `node scripts/check_sync.mjs --client ../MyProject --accept <section-id>`
   (`--client` is a checkout of the source repository; it defaults to `../MyProject`).
4. Run the checks and open the pages at desktop and phone width, in light and dark:
   ```
   node scripts/check_site.mjs
   node scripts/check_sync.mjs --client ../MyProject
   python -m http.server -d . 8080      # then open http://localhost:8080/
   ```
5. Open a pull request. Merging to `main` publishes the site.

A new design note needs either a section in `sources.json` or an entry in `excluded`
with the reason it isn't published.

## Checks

- `scripts/check_site.mjs` runs on every pull request here (`.github/workflows/check.yml`).
- `scripts/check_sync.mjs` runs in the source repository whenever its design notes change,
  and warns there when a wiki section has fallen behind.

Both need Node 18+; the sync check also needs git.

## Credits

The page layout (numbered rail, editorial headings, note and art cards, image viewer)
is adapted from the game-project hub in
[Mr. Mak Workspace](https://github.com/witnesstodark/mr-mak-workspace) (MIT,
commit `1e0c7c3`). The code here is written from scratch.
