# Images

Only the team adds images here, one at a time and on purpose. Pages keep a marked
placeholder (`<div class="slot">`) until the real image arrives.

- **Format:** `.webp`, at most 300 KB. Export larger art at about 1600–2000 px on the
  long side and lower the quality until it fits.
- **Name:** lowercase with dashes, starting with the page section, e.g.
  `world-map.webp`, `race-elf-portrait.webp`.
- **Markup:** replace the placeholder with

  ```html
  <figure class="art">
    <a class="zoom" href="assets/img/world-map.webp"><img src="assets/img/world-map.webp" alt="Hand-drawn map of the island continent" loading="lazy" width="1600" height="1170"></a>
    <figcaption><span class="kind">concept</span>Hand-drawn world map</figcaption>
  </figure>
  ```

  (use `../assets/img/…` from pages under `systems/`). The `kind` label is one of
  `concept`, `generated` or `in-engine capture`.
- Run `node scripts/check_site.mjs`: it rejects other formats, oversized files, missing
  alt text and images that don't open full size.
