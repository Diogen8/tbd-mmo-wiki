// The navigation rail, in order. Labels are common:nav.<id> in locales/<lang>/common.json;
// a page marks its own item with `current` (and `currentSystem` under Systems).
export default [
  { id: "concept", num: "01", href: "index.html#concept" },
  { id: "world", num: "02", href: "world.html" },
  { id: "races", num: "03", href: "races.html" },
  {
    id: "systems", num: "04", href: "index.html#systems",
    children: ["mana", "stats", "combat", "progression", "pvp", "world-progression", "inventory-economy", "social-guilds"]
      .map(id => ({ id, href: `systems/${id}.html` })),
  },
  { id: "status", num: "05", href: "index.html#status" },
];
