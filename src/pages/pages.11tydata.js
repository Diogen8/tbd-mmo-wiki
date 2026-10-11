// Every template under src/pages is built once per language: English at its own path,
// each translation under its language prefix (pages/systems/mana.njk -> systems/mana.html
// and uk/systems/mana.html). Its strings come from locales/<lang>/<file name>.json.
import site from "../_data/site.js";

const pathOf = data => `${data.page.filePathStem.replace(/^\/pages\//, "")}.html`;

export default {
  layout: "base.njk",
  pagination: { data: "site.locales", size: 1, alias: "lang" },
  eleventyComputed: {
    path: pathOf,
    ns: data => data.page.filePathStem.split("/").pop(),
    permalink: data => `${site.languages[data.lang].prefix}${pathOf(data)}`,
  },
};
