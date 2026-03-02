# Saints Cleanup Queue — Phase 1

Generated from `data/saints/commemorations.json` and `data/saints/identities.json`
using `tools/rank_identity_frequency.js`.

Do not modify `id` fields.  Do not edit generated `saints-<month>.json` files.
Run `npm run saints:regen` after each batch of edits to keep caches in sync.

---

## A. Top 25 Identities by Commemoration Count

These appear most frequently across traditions and therefore have the highest
impact when descriptions are normalised.

| rank | count | identityId | reason |
|------|-------|------------|--------|
| 1 | 10 | `saint-matthew-the-apostle` | frequency-high |
| 2 | 8 | `saint-john-chrysostom` | frequency-high |
| 3 | 8 | `saints-cyril-and-methodius` | frequency-high |
| 4 | 8 | `saint-matthias-the-apostle` | frequency-high |
| 5 | 8 | `saint-james-the-brother-of-the-lord` | frequency-high |
| 6 | 7 | `saint-cyril-of-alexandria` | frequency-high |
| 7 | 7 | `saint-ignatius-of-antioch` | frequency-high |
| 8 | 6 | `saint-polycarp-of-smyrna` | frequency-high |
| 9 | 6 | `saint-cyril-of-jerusalem` | frequency-high |
| 10 | 6 | `saint-ephrem-the-syrian` | frequency-high |
| 11 | 5 | `holy-name-of-jesus-circumcision-of-christ` | frequency-high |
| 12 | 5 | `saint-basil-the-great` | frequency-high |
| 13 | 5 | `the-epiphany-theophany-of-our-lord` | frequency-high |
| 14 | 5 | `mar-narsai` | frequency-high |
| 15 | 5 | `presentation-of-the-lord-candlemas` | frequency-high |
| 16 | 5 | `gregory-the-great-gregory-the-dialogist` | frequency-high |
| 17 | 5 | `saint-joseph-spouse-of-the-blessed-virgin-mary` | frequency-high |
| 18 | 5 | `annunciation-of-the-lord-annunciation-of-the-theotokos` | frequency-high |
| 19 | 5 | `saint-dismas` | frequency-high |
| 20 | 5 | `easter-sunday-the-resurrection-of-our-lord` | frequency-high |
| 21 | 5 | `saint-kateri-tekakwitha` | frequency-high |
| 22 | 5 | `saint-george` | frequency-high |
| 23 | 5 | `saint-mark-the-evangelist` | frequency-high |
| 24 | 5 | `saint-catherine-of-siena` | frequency-high |
| 25 | 5 | `saint-james-the-brother-of-the-lord-james-the-just` | frequency-high |

---

## B. Duplicate / Near-Duplicate Identity IDs

These were detected by stripping the `saint-` / `apostle-` / `martyr-` /
`prophet-` prefix and comparing the remaining slug.  Both entries in each pair
represent the same person.  The higher-commemoration-count id is preferred;
the other is the candidate for eventual consolidation (commemorations
re-pointed, orphan identity removed).

**Do not merge ids in this batch.  List only — merging is a future phase.**

| identityId (preferred) | identityId (candidate) | reason |
|------------------------|------------------------|--------|
| `saint-john-chrysostom` (8) | `john-chrysostom` (1) | duplicate-candidate |
| `saint-ignatius-of-antioch` (7) | `ignatius-of-antioch` (1) | duplicate-candidate |
| `saint-basil-the-great` (5) | `basil-the-great` (1) | duplicate-candidate |
| `saint-clement-of-rome` (5) | `clement-of-rome` (1) | duplicate-candidate |
| `saint-justin-martyr` (5) | `justin-martyr` (1) | duplicate-candidate |
| `saint-kateri-tekakwitha` (5) | `kateri-tekakwitha` (1) | duplicate-candidate |
| `saint-catherine-of-alexandria` (5) | `catherine-of-alexandria` (2) | duplicate-candidate |
| `saint-gregory-of-nyssa` (4) | `gregory-of-nyssa` (2) | duplicate-candidate |
| `saint-theodore-of-sykeon` (4) | `theodore-of-sykeon` (1) | duplicate-candidate |
| `saint-martin-i` (3) | `martin-i` (2) | duplicate-candidate |
| `saint-augustine-of-canterbury` (3) | `augustine-of-canterbury` (1) | duplicate-candidate |
| `saint-macarius-the-egyptian` (3) | `macarius-the-egyptian` (1) | duplicate-candidate |
| `saint-peter-chanel` (3) | `peter-chanel` (1) | duplicate-candidate |
| `mar-babai-the-great` (4) | `saint-mar-babai-the-great` (1) | duplicate-candidate |
| `saint-simon-the-zealot` (2) | `apostle-simon-the-zealot` (1) | duplicate-candidate |
| `bede-the-venerable` (2) | `saint-bede-the-venerable` (1) | duplicate-candidate |
| `edward-the-confessor` (2) | `saint-edward-the-confessor` (1) | duplicate-candidate |
| `saint-francis-of-assisi` (2) | `francis-of-assisi` (1) | duplicate-candidate |
| `saint-george-the-chozebite` (2) | `george-the-chozebite` (1) | duplicate-candidate |
| `saint-hilary-of-poitiers` (2) | `hilary-of-poitiers` (1) | duplicate-candidate |
| `prophet-joel` (2) | `saint-joel` (1) | duplicate-candidate |
| `richard-of-chichester` (2) | `saint-richard-of-chichester` (1) | duplicate-candidate |
| `saint-timothy` (1) | `apostle-timothy` (1) | duplicate-candidate |
| `saint-boniface` (2) | `martyr-boniface` (1) | duplicate-candidate |
| `saint-meletius` (1) | `martyr-meletius` (1) | duplicate-candidate |
| `polyeuctus-of-melitine` (1) | `martyr-polyeuctus-of-melitine` (1) | duplicate-candidate |
| `teresa-of-avila` (1) | `saint-teresa-of-avila` (1) | duplicate-candidate |
| `thomas-aquinas` (1) | `saint-thomas-aquinas` (1) | duplicate-candidate |
| `thomas-more` (1) | `saint-thomas-more` (1) | duplicate-candidate |
| `vincent-de-paul` (1) | `saint-vincent-de-paul` (1) | duplicate-candidate |
| `vincent-ferrer` (2) | `saint-vincent-ferrer` (2) | duplicate-candidate |
| `prophet-hosea` (1) | `saint-hosea` (1) | duplicate-candidate |
| `saint-berard-and-companions` (1) | `berard-and-companions` (1) | duplicate-candidate |
| `saint-eutychius-of-constantinople` (1) | `eutychius-of-constantinople` (1) | duplicate-candidate |
| `saint-faustina-kowalska` (1) | `faustina-kowalska` (1) | duplicate-candidate |
| `saint-felix-of-nola` (1) | `felix-of-nola` (1) | duplicate-candidate |
| `saint-gregory-the-great` (1) | `gregory-the-great` (1) | naming-normalization |
| `saint-innocent-of-alaska` (1) | `innocent-of-alaska` (1) | duplicate-candidate |
| `saint-jerome` (1) | `jerome` (1) | duplicate-candidate |
| `saint-john-bosco` (1) | `john-bosco` (1) | duplicate-candidate |
| `saint-john-of-god` (1) | `john-of-god` (1) | duplicate-candidate |
| `saint-julian-of-norwich` (1) | `julian-of-norwich` (1) | duplicate-candidate |
| `saint-paul-of-the-cross` (1) | `paul-of-the-cross` (1) | duplicate-candidate |
| `saint-paul-the-first-hermit` (1) | `paul-the-first-hermit` (1) | duplicate-candidate |

---

## C. Identities with Suspicious / Review Types

### Type = `commemoration` (may need more specific type)

These collective feasts currently carry `type: "commemoration"`.  Most are
correctly typed (they are collective or calendrical commemorations, not
individual saints).  Flag for review if a more specific type exists.

| identityId | name | comms | reason |
|------------|------|-------|--------|
| `all-saints` | All Saints | 5 | type-review — could be `feast` |
| `all-souls-commemoration-of-the-dead` | All Souls / Commemoration of the Dead | 5 | type-review — could be `feast` |
| `the-holy-innocents` | The Holy Innocents | 5 | type-review — could be `feast` |
| `synaxis-of-the-archangel-michael-and-all-angels` | Synaxis of the Archangel Michael and All Angels | 5 | type-review — could be `feast` |
| `eve-of-the-nativity-and-holy-ancestors` | Eve of the Nativity and Holy Ancestors | 5 | type-review — could be `feast` |
| `confession-of-saint-peter` | Confession of Saint Peter | 1 | type-review — could be `feast` |
| `holy-martyrs-of-the-church-of-rome` | Holy Martyrs of the Church of Rome | 1 | type-review — could be `feast` |

### Description quality flags

| identityId | current description | reason |
|------------|---------------------|--------|
| `saint-john-chrysostom` | "Honored for eloquence." | naming-normalization — too vague; missing role/date |
| `saint-ephrem-the-syrian` | "Commemoration." | naming-normalization — placeholder text |
| `saint-james-the-brother-of-the-lord` | "Bishop of Jerusalem (shared commemoration)." | naming-normalization — "shared commemoration" is transit language |
| `saint-matthias-the-apostle` | "The apostle chosen to replace Judas Iscariot." | frequency-high — acceptable but terse |
| `kateri-tekakwitha` | "Native American saint (shared commemoration)." | naming-normalization — "shared commemoration" is transit language |
| `martin-i` | "Pope and martyr (shared commemoration)." | naming-normalization — "shared commemoration" is transit language |

---

## Execution Order (recommended)

1. **Phase 1 Batch (current):** Normalize description quality on top-10 by
   frequency and clear "shared commemoration" transit language from all
   affected records.
2. **Phase 2 Batch:** Re-point duplicate commemorations to preferred ids and
   remove orphan identity records.
3. **Phase 3 Batch:** Review `commemoration`-typed entries and reclassify as
   `feast` where appropriate.