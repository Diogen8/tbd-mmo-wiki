# Ukrainian translation

Every English page has a Ukrainian translation at the same path under `uk/`. English is
the source: when the two disagree, the English page is right, and the Ukrainian hub says
so. A translation renders the same design notes, so the rules in the [README](README.md)
apply unchanged: nothing added, nothing filled in, gaps stay “Ще не розроблено”.

## How to translate

- **Translate the meaning, not the words.** Write the sentence a Ukrainian designer would
  write. Reorder, split or merge clauses when English word order reads awkwardly.
- **Keep the structure.** Same sections, ids, lists, tables, links and open questions.
  `check_site.mjs` fails if anchors or links differ between the two languages.
- **Link text names the page**, so it isn't declined: “на сторінці <a>Економіка мани</a>”,
  “див. <a>Розвиток персонажа</a>”.
- **Typography:** «ялинки» for quotes, the typographic apostrophe `’` (п’ять, зв’язок),
  a decimal comma (33,2 км; 1,0), a space before `%` (0–100 %), units in Cyrillic
  (м, км, км²). Coordinates are separated by a semicolon: (15,7 км; 9,2 км).
- **Leave as is:** working labels from the map data (`Lake_Central`, `River_*`), attribute
  abbreviations (STR, DEX…), PvP, PvE, PK, NPC, WASD, and names of other games and
  companies (Lineage 2, EVE Online, CCP…). Titles of English sources stay in English.
- **Headings** are set in Cormorant SC, because Cinzel has no Cyrillic. The brand
  (“TBD MMO”) stays in Cinzel in both languages.

## Glossary

Use these terms everywhere, including the rail, page titles and the pager. Add a row
when a new term appears, before translating the page that introduces it.

### Site

| English | Українська |
|---|---|
| Design wiki | Дизайн-вікі |
| working title | робоча назва |
| Hub | Головна |
| Concept · World · Races & Characters · Systems · Status | Концепція · Світ · Раси й персонажі · Системи · Стан |
| Draft | Чернетка |
| Stub | Заготовка |
| Not designed yet | Ще не розроблено |
| Lore not written | Лор не написано |
| not agreed for build | не затверджено до реалізації |
| A team brainstorm | Командний мозковий штурм |
| Open questions · Resolved | Відкриті питання · Вирішено |
| On this page | На цій сторінці |
| ← Previous · Next → | ← Назад · Далі → |
| working label | робоча мітка |
| design notes | дизайн-нотатки |

### Systems (page names)

| English | Українська |
|---|---|
| Mana Economy | Економіка мани |
| Character Stats | Характеристики персонажа |
| Combat | Бій |
| Progression | Розвиток персонажа |
| PvP, Robbery & PK | PvP, грабунок і PK |
| World Progression | Розвиток світу |
| Inventory & Economy | Інвентар і економіка |
| Social & Guilds | Спільнота й гільдії |

### World and mana

| English | Українська |
|---|---|
| mana | мана |
| white desert | біла пустеля |
| (city) core | ядро (міста) |
| mana core, raw / processed | ядро мани, сире / оброблене |
| upkeep | утримання |
| personal (mana) pool | особистий запас (мани) |
| storage vault | (міське) сховище |
| personal / civic status | особистий / міський статус |
| crystallized mana | кристалізована мана |
| island continent | острів-континент |
| Human · Elf · Dwarf · Orc | Людина · Ельф · Гном · Орк |
| Arkenstone | Аркенстон |

### Character and combat

| English | Українська |
|---|---|
| primary attributes · derived stats | основні атрибути · похідні характеристики |
| Strength · Dexterity · Constitution | Сила · Спритність · Статура |
| Intelligence · Wisdom · Charisma | Інтелект · Мудрість · Харизма |
| critical chance / multiplier | шанс / множник критичного удару |
| cast speed | швидкість чаклування |
| cooldown reduction | скорочення перезарядки |
| elemental resistance | опір стихіям |
| tab-target | прив’язка до цілі (tab-target) |
| non-target | ручне прицілювання (non-target) |
| skill-shot | скілшот |
| lock / lock break | захоплення (цілі) / зрив захоплення |
| Target mode · Non-target mode | режим цілі · режим прицілювання |
| aim override | примусове прицілювання |
| click-to-move | рух кліком |
| body-blocking | блокування тілом |
| passive tree · node | пасивне дерево · вузол |
| weapon mastery | майстерність зброї |
| affinity | спорідненість |
| reset (soft prestige) | скидання (м’який престиж) |
| Novice Stone · Master Stone | Камінь новачка · Камінь майстра |
| diminishing returns | спадна віддача |
| grinding | гринд |

### PvP and the world economy

| English | Українська |
|---|---|
| ally tiers: party · guild · city | рівні союзників: група · гільдія · місто |
| crime states | кримінальні стани |
| Neutral · Aggressor · Combatant · Wanted · Captured | Нейтральний · Агресор · Учасник бою · Розшукуваний · Схоплений |
| Chaotic | Хаотичний |
| mutual PvP | взаємне PvP |
| fight back | дати відсіч |
| PK points | очки PK |
| stolen cargo | крадений вантаж |
| (cargo) fence | скупник краденого |
| criminal fixer | кримінальний посередник |
| sheriff · warrant | шериф · ордер |
| outlaw refuge | притулок вигнанців |
| safe zone | безпечна зона |
| city wars | війни міст |
| safeguards | запобіжники |
| deposit | родовище |
| finite resources | вичерпні ресурси |
| supply contract | контракт на постачання |
| economic floor | економічний мінімум |
| weekly world renewal | щотижневе оновлення світу |
| equipment generation | покоління спорядження |
