// Translations for the build: i18next over locales/<lang>/<namespace>.json.
// Every page reads its own namespace (named after its template) plus "common".
// Values are HTML and are inserted as is.
//
// The build fails when a template asks for a key a language doesn't have, or when a
// translation file holds a key no page uses, so the languages can't drift apart.
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import i18next from "i18next";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === "object" ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

export function createTranslator(dir) {
  let instance, resources, used, missing;

  return {
    // Reads every translation file again; called before each build, so edits show up in `npm start`.
    load() {
      resources = {};
      for (const lang of readdirSync(dir)) {
        resources[lang] = {};
        for (const file of readdirSync(join(dir, lang)).filter(f => f.endsWith(".json"))) {
          const path = join(dir, lang, file);
          try {
            resources[lang][basename(file, ".json")] = JSON.parse(readFileSync(path, "utf8"));
          } catch (error) {
            throw new Error(`${path}: ${error.message}`);
          }
        }
      }
      instance = i18next.createInstance();
      instance.init({
        resources,
        initAsync: false,
        fallbackLng: false, // a missing Ukrainian string is an error, not silent English
        defaultNS: false,
        interpolation: { escapeValue: false },
      });
      used = new Set();
      missing = new Set();
    },

    // t(lang, ns, "intro.h1") or t(lang, ns, "common:tag.draft").
    t(lang, ns, key, options = {}) {
      const [n, k] = key.includes(":") ? key.split(":") : [ns, key];
      const id = `${lang}/${n}:${k}`;
      if (!instance.exists(k, { lng: lang, ns: n })) {
        missing.add(id);
        return `[missing ${id}]`;
      }
      const value = instance.t(k, { lng: lang, ns: n, ...options });
      if (options.returnObjects && typeof value === "object") for (const leaf of flatten(value)) used.add(`${id}.${leaf}`);
      else used.add(id);
      return value;
    },

    report() {
      const unused = Object.entries(resources).flatMap(([lang, namespaces]) =>
        Object.entries(namespaces).flatMap(([ns, tree]) => flatten(tree).map(k => `${lang}/${ns}:${k}`).filter(id => !used.has(id))));
      const lines = [
        ...[...missing].sort().map(id => `  missing: ${id}`),
        ...unused.sort().map(id => `  unused:  ${id}`),
      ];
      if (lines.length) throw new Error(`Translation keys out of sync (${lines.length}):\n${lines.join("\n")}`);
    },
  };
}
