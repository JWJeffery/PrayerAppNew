Saints Cleanup Queue — Phase 1

Generated from data/saints/commemorations.json and data/saints/identities.json using tools/rank_identity_frequency.js.

Rules:

Do not modify id fields.

Do not edit generated saints-<month>.json files manually.

Run npm run saints:regen after each batch of edits to keep caches in sync.

Keep changes small and reviewable (10–30 identities per PR, unless a batch is intentionally mechanical).

A. Top 25 Identities by Commemoration Count

These appear most frequently across traditions and therefore have the highest impact when identity metadata is normalized.

rank	count	identityId	reason
1	10	saint-matthew-the-apostle	frequency-high
2	8	saint-john-chrysostom	frequency-high
3	8	saints-cyril-and-methodius	frequency-high
4	8	saint-matthias-the-apostle	frequency-high
5	8	saint-james-the-brother-of-the-lord	frequency-high
6	7	saint-cyril-of-alexandria	frequency-high
7	7	saint-ignatius-of-antioch	frequency-high
8	6	saint-polycarp-of-smyrna	frequency-high
9	6	saint-cyril-of-jerusalem	frequency-high
10	6	saint-ephrem-the-syrian	frequency-high
11	5	holy-name-of-jesus-circumcision-of-christ	frequency-high
12	5	saint-basil-the-great	frequency-high
13	5	the-epiphany-theophany-of-our-lord	frequency-high
14	5	mar-narsai	frequency-high
15	5	presentation-of-the-lord-candlemas	frequency-high
16	5	gregory-the-great-gregory-the-dialogist	frequency-high
17	5	saint-joseph-spouse-of-the-blessed-virgin-mary	frequency-high
18	5	annunciation-of-the-lord-annunciation-of-the-theotokos	frequency-high
19	5	saint-dismas	frequency-high
20	5	easter-sunday-the-resurrection-of-our-lord	frequency-high
21	5	saint-kateri-tekakwitha	frequency-high
22	5	saint-george	frequency-high
23	5	saint-mark-the-evangelist	frequency-high
24	5	saint-catherine-of-siena	frequency-high
25	5	saint-james-the-brother-of-the-lord-james-the-just	frequency-high
B. Duplicate / Near-Duplicate Identity IDs

These were detected by stripping the saint- / apostle- / martyr- / prophet- prefix and comparing the remaining slug. Both entries in each pair likely represent the same person. The higher-commemoration-count id is preferred; the other is the candidate for eventual consolidation (commemorations re-pointed, orphan identity removed).

Important:

Do not merge ids in ad hoc batches.

Consolidation should be done as a dedicated phase (see Execution Order).

identityId (preferred)	identityId (candidate)	reason
saint-john-chrysostom (8)	john-chrysostom (1)	duplicate-candidate
saint-ignatius-of-antioch (7)	ignatius-of-antioch (1)	duplicate-candidate
saint-basil-the-great (5)	basil-the-great (1)	duplicate-candidate
saint-clement-of-rome (5)	clement-of-rome (1)	duplicate-candidate
saint-justin-martyr (5)	justin-martyr (1)	duplicate-candidate
saint-kateri-tekakwitha (5)	kateri-tekakwitha (1)	duplicate-candidate
saint-catherine-of-alexandria (5)	catherine-of-alexandria (2)	duplicate-candidate
saint-gregory-of-nyssa (4)	gregory-of-nyssa (2)	duplicate-candidate
saint-theodore-of-sykeon (4)	theodore-of-sykeon (1)	duplicate-candidate
saint-martin-i (3)	martin-i (2)	duplicate-candidate
saint-augustine-of-canterbury (3)	augustine-of-canterbury (1)	duplicate-candidate
saint-macarius-the-egyptian (3)	macarius-the-egyptian (1)	duplicate-candidate
saint-peter-chanel (3)	peter-chanel (1)	duplicate-candidate
mar-babai-the-great (4)	saint-mar-babai-the-great (1)	duplicate-candidate
saint-simon-the-zealot (2)	apostle-simon-the-zealot (1)	duplicate-candidate
bede-the-venerable (2)	saint-bede-the-venerable (1)	duplicate-candidate
edward-the-confessor (2)	saint-edward-the-confessor (1)	duplicate-candidate
saint-francis-of-assisi (2)	francis-of-assisi (1)	duplicate-candidate
saint-george-the-chozebite (2)	george-the-chozebite (1)	duplicate-candidate
saint-hilary-of-poitiers (2)	hilary-of-poitiers (1)	duplicate-candidate
prophet-joel (2)	saint-joel (1)	duplicate-candidate
richard-of-chichester (2)	saint-richard-of-chichester (1)	duplicate-candidate
saint-timothy (1)	apostle-timothy (1)	duplicate-candidate
saint-boniface (2)	martyr-boniface (1)	duplicate-candidate
saint-meletius (1)	martyr-meletius (1)	duplicate-candidate
polyeuctus-of-melitine (1)	martyr-polyeuctus-of-melitine (1)	duplicate-candidate
teresa-of-avila (1)	saint-teresa-of-avila (1)	duplicate-candidate
thomas-aquinas (1)	saint-thomas-aquinas (1)	duplicate-candidate
thomas-more (1)	saint-thomas-more (1)	duplicate-candidate
vincent-de-paul (1)	saint-vincent-de-paul (1)	duplicate-candidate
vincent-ferrer (2)	saint-vincent-ferrer (2)	duplicate-candidate
prophet-hosea (1)	saint-hosea (1)	duplicate-candidate
saint-berard-and-companions (1)	berard-and-companions (1)	duplicate-candidate
saint-eutychius-of-constantinople (1)	eutychius-of-constantinople (1)	duplicate-candidate
saint-faustina-kowalska (1)	faustina-kowalska (1)	duplicate-candidate
saint-felix-of-nola (1)	felix-of-nola (1)	duplicate-candidate
saint-gregory-the-great (1)	gregory-the-great (1)	naming-normalization
saint-innocent-of-alaska (1)	innocent-of-alaska (1)	duplicate-candidate
saint-jerome (1)	jerome (1)	duplicate-candidate
saint-john-bosco (1)	john-bosco (1)	duplicate-candidate
saint-john-of-god (1)	john-of-god (1)	duplicate-candidate
saint-julian-of-norwich (1)	julian-of-norwich (1)	duplicate-candidate
saint-paul-of-the-cross (1)	paul-of-the-cross (1)	duplicate-candidate
saint-paul-the-first-hermit (1)	paul-the-first-hermit (1)	duplicate-candidate
C. Identities with Suspicious / Review Types
Type = commemoration (may need more specific type)

These collective feasts currently carry type: "commemoration". Many may be correctly typed (collective/calendrical commemorations rather than individual persons). Flag for review if a more specific type exists.

identityId	name	comms	reason
all-saints	All Saints	5	type-review — could be feast
all-souls-commemoration-of-the-dead	All Souls / Commemoration of the Dead	5	type-review — could be feast
the-holy-innocents	The Holy Innocents	5	type-review — could be feast
synaxis-of-the-archangel-michael-and-all-angels	Synaxis of the Archangel Michael and All Angels	5	type-review — could be feast
eve-of-the-nativity-and-holy-ancestors	Eve of the Nativity and Holy Ancestors	5	type-review — could be feast
confession-of-saint-peter	Confession of Saint Peter	1	type-review — could be feast
holy-martyrs-of-the-church-of-rome	Holy Martyrs of the Church of Rome	1	type-review — could be feast
Description quality flags

These are examples of “placeholder” or “transit” descriptions that should be normalized to short, factual, tradition-neutral phrasing.

identityId	current description	reason
saint-john-chrysostom	"Honored for eloquence."	description-normalization — too vague
saint-ephrem-the-syrian	"Commemoration."	description-normalization — placeholder text
saint-james-the-brother-of-the-lord	"Bishop of Jerusalem (shared commemoration)."	description-normalization — transit language
saint-matthias-the-apostle	"The apostle chosen to replace Judas Iscariot."	description-normalization — acceptable but terse
kateri-tekakwitha	"Native American saint (shared commemoration)."	description-normalization — transit language
martin-i	"Pope and martyr (shared commemoration)."	description-normalization — transit language
D. Type-Review (Ambiguous) — Deferred

These identities have plausible type changes but require conservative judgment before editing. Do not change these in routine cleanup batches; revisit in dedicated passes.

D1. Calendrical entries currently typed saint — candidate for feast

These are liturgical season days, octave days, synaxis feasts, and Sundays — not individual persons. feast is likely correct, but this should be handled as a single dedicated batch.

identityId	name	reason
5th-epiphany-sunday	5th Epiphany Sunday	Sunday of season, not a person
all-saints-day	All Saints' Day	calendrical feast
all-souls-day	All Souls' Day	calendrical feast
pentecost-sunday	Pentecost Sunday	calendrical feast
feast-of-the-ascension	Feast of the Ascension	name begins “Feast of”
feast-of-the-visitation	Feast of the Visitation	name begins “Feast of”
second-day-of-the-nativity through twelfth-day-of-the-nativity	Nativity octave days (11 entries)	calendrical day sequence
fifth-day-of-the-fast-of-the-nativity	Nativity fast day	calendrical day
sixth-day-of-the-fast-of-the-nativity	Nativity fast day	calendrical day
first-sunday-of-great-fast	First Sunday of Great Fast	Sunday of season
second-sunday-of-great-lent	Second Sunday of Great Lent	Sunday of season
third-sunday-of-great-lent	Third Sunday of Great Lent	Sunday of season
fourth-sunday-of-great-lent	Fourth Sunday of Great Lent	Sunday of season
second-sunday-of-the-apostles	Second Sunday of the Apostles	Sunday of season
third-sunday-of-the-apostles	Third Sunday of the Apostles	Sunday of season
eve-of-the-nativity-and-theophany	Eve of the Nativity and Theophany	vigil/eve entry
forefeast-of-the-annunciation	Forefeast of the Annunciation	forefeast entry
forefeast-of-the-transfiguration	Forefeast of the Transfiguration	forefeast entry
encaenia-of-the-temple-of-the-resurrection	Encaenia of the Temple of the Resurrection	dedication feast
dedication-of-the-lateran-basilica	Dedication of the Lateran Basilica	dedication feast
dedication-of-peter-and-paul-basilicas	Dedication of Peter and Paul Basilicas	dedication feast
dedication-of-saint-mary-major	Dedication of Saint Mary Major	dedication feast
synaxis-of-the-twelve-apostles	Synaxis of the Twelve Apostles	synaxis feast
synaxis-of-the-seventy-apostles	Synaxis of the Seventy Apostles	synaxis feast
synaxis-of-john-the-baptist	Synaxis of John the Baptist	synaxis feast
synaxis-of-the-archangel-gabriel	Synaxis of the Archangel Gabriel	synaxis feast
synaxis-of-the-three-holy-hierarchs	Synaxis of the Three Holy Hierarchs	synaxis feast
D2. Secondary observances tied to a person — candidate for feast (or remain saint)

These are secondary observances (translation of relics, martyrdom commemoration, vigil/eve, etc.). They may warrant feast rather than saint, or they may remain saint with a note. Handle in a dedicated pass.

identityId	name	reason
saint-matthew-synaxis	Saint Matthew (Synaxis)	synaxis variant
mar-mari-synaxis	Mar Mari (Synaxis)	synaxis variant
mar-addai-secondary-feast	Mar Addai (Secondary Feast)	secondary feast
mar-toma-feast-of-relics	Mar Toma (Feast of Relics)	relic feast
saint-bartholomew-eve	Saint Bartholomew (Eve)	vigil/eve
saint-john-the-evangelist-translation	Saint John the Evangelist (Translation)	relic translation
repose-of-apostle-john-the-theologian	Repose of Apostle John the Theologian	repose/dormition
return-of-the-relics-of-the-apostle-bartholomew	Return of the Relics of the Apostle Bartholomew	relic feast
translation-of-the-relics-of-saint-john-chrysostom	Translation of the Relics of Saint John Chrysostom	relic feast
veneration-of-the-precious-chains-of-saint-peter	Veneration of the Precious Chains of Saint Peter	relic feast
martyrdom-of-saint-james-the-apostle	Martyrdom of Saint James the Apostle	martyrdom observance
martyrdom-of-saint-mark-the-evangelist	Martyrdom of Saint Mark the Evangelist	martyrdom observance
martyrdom-of-st-mark-the-evangelist	Martyrdom of St. Mark the Evangelist	likely duplicate-candidate with above
third-finding-of-the-head-of-saint-john-the-baptist	Third Finding of the Head of Saint John the Baptist	relic feast
conception-of-saint-john-the-baptist	Conception of Saint John the Baptist	biographical feast
D3. False-positive “apostle-name” matches — keep typed as saint

These matched name patterns but are not the apostles. Leave typed saint.

identityId	name	why it stays saint
saint-john-chrysostom	Saint John Chrysostom	bishop, not apostle
saint-john-bosco	Saint John Bosco	19c founder
saint-john-of-the-cross	Saint John of the Cross	mystic/doctor
saint-john-vianney	Saint John Vianney	parish priest
saint-peter-canisius	Saint Peter Canisius	Jesuit, not apostle
saint-peter-damian	Saint Peter Damian	reformer
saint-james-of-the-march	Saint James of the March	Franciscan
saint-james-the-hermit	Saint James the Hermit	ascetic
saint-james-the-persian	Saint James the Persian	martyr
Execution Order (recommended)

Phase 1 (completed or in progress): Normalize description quality for high-frequency identities; remove “transit language” (e.g., “shared commemoration”); make a small set of high-confidence type corrections (e.g., obvious apostles/evangelists/prophets where unambiguous).

Phase 2: Reclassify calendrical feast entries (Section D1) from saint → feast in one mechanical batch.

Phase 3: Review secondary observances (Section D2) and decide feast vs saint consistently.

Phase 4: Consolidate duplicate ids (Section B): re-point commemorations to preferred ids, remove orphan identities, regen, commit.

Phase 5: Revisit type: "commemoration" entries (Section C) and reclassify to feast where appropriate.