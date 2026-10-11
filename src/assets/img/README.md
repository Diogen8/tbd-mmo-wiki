# Images

Only the team adds images here, one at a time and on purpose. Pages keep a marked
placeholder (`<div class="slot">`) until the real image arrives.

- **Format:** `.webp`, at most 300 KB. Export larger art at about 1600–2000 px on the
  long side and lower the quality until it fits.
- **Name:** lowercase with dashes, starting with the page section, e.g.
  `world-map.webp`, `race-elf-portrait.webp`.
- **Markup:** replace the placeholder in the page's template (`src/pages/…`) with

  ```njk
  <figure class="art">
    <a class="zoom" href="{{ asset("assets/img/world-map.webp") }}"><img src="{{ asset("assets/img/world-map.webp") }}" alt="{{ t("locations.map.alt") }}" loading="lazy" width="1600" height="1170"></a>
    <figcaption><span class="kind">{{ t("common:kind.concept") }}</span>{{ t("locations.map.caption") }}</figcaption>
  </figure>
  ```

  and add the alt text and caption to `locales/en/<page>.json` and `locales/uk/<page>.json`
  (and the `kind` label to both `common.json` files the first time it is used). The
  `kind` label is one of `concept`, `generated` or `in-engine capture`.
- Run `npm run check`: it rejects other formats, oversized files, missing alt text,
  missing translations and images that don't open full size.
