// Site-wide settings. Text a reader sees lives in locales/, not here.
export default {
  url: "https://diogen8.github.io/tbd-mmo-wiki/", // published address, used by hreflang links
  pathPrefix: "/tbd-mmo-wiki/", // GitHub Pages project path, used by 404.html
  locales: ["en", "uk"], // English first: it is the source the translations follow
  languages: {
    en: { label: "EN", name: "English", prefix: "" },
    uk: { label: "UA", name: "Українська", prefix: "uk/" },
  },
  // Cinzel has no Cyrillic, so Ukrainian pages also load Cormorant SC (see wiki.css).
  fonts: {
    en: "family=Cinzel:wght@500;600;700&amp;display=swap",
    uk: "family=Cormorant+SC:wght@600;700&amp;family=Cinzel:wght@500;600;700&amp;display=swap",
  },
};
