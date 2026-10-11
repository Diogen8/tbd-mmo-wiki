// Builds the wiki from src/ (Nunjucks templates) and locales/ (i18next translations)
// into _site/. `npm start` serves it with live reload, `npm run build` writes it once.
import { createTranslator } from "./lib/i18n.js";
import site from "./src/_data/site.js";

const i18n = createTranslator("locales");
const up = path => "../".repeat(path.split("/").length - 1);

export default function (eleventyConfig) {
  eleventyConfig.on("eleventy.before", () => i18n.load());
  eleventyConfig.on("eleventy.after", () => i18n.report());
  eleventyConfig.addWatchTarget("locales/");
  eleventyConfig.addWatchTarget("lib/");

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Translations and data hold HTML that is written to the page as is.
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: false });

  // Helpers called from templates. `this.ctx` is the page being rendered: its `lang`,
  // `ns` (translation file), `path` (inside its language), and for 404.html `absoluteLinks`.
  eleventyConfig.addNunjucksGlobal("t", function (key, options) {
    return i18n.t(this.ctx.lang, this.ctx.ns, key, options);
  });
  // The interface strings wiki.js needs, as JSON for <script type="application/json">.
  eleventyConfig.addNunjucksGlobal("uiStrings", function () {
    return JSON.stringify(i18n.t(this.ctx.lang, "common", "ui", { returnObjects: true })).replaceAll("<", "\\u003c");
  });
  // A page in the same language, e.g. url("systems/mana.html").
  eleventyConfig.addNunjucksGlobal("url", function (target) {
    const { lang, path, absoluteLinks } = this.ctx;
    return absoluteLinks ? `${site.pathPrefix}${site.languages[lang].prefix}${target}` : up(path) + target;
  });
  // A file shared by every language, e.g. asset("assets/wiki.css").
  eleventyConfig.addNunjucksGlobal("asset", function (target) {
    const { lang, path, absoluteLinks } = this.ctx;
    return absoluteLinks ? `${site.pathPrefix}${target}` : up(site.languages[lang].prefix + path) + target;
  });
  // This page in another language; 404.html has no translation and leads to the hub.
  eleventyConfig.addNunjucksGlobal("translationUrl", function (lang) {
    const { path, absoluteLinks, noTranslation } = this.ctx;
    const target = site.languages[lang].prefix + (noTranslation ? "index.html" : path);
    return absoluteLinks ? `${site.pathPrefix}${target}` : up(site.languages[this.ctx.lang].prefix + path) + target;
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk"],
  };
}
