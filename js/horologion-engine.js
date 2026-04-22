// ── js/horologion-engine.js ────────────────────────────────────────────────
//
// Horologion Engine v2.0
// Architecture layer: ENGINE (not UI, not calendar)
//
// This module owns:
//   - Loading and caching office skeletons from data/horologion/*.json
//   - Resolving a normalized office payload from a skeleton + date context
//   - Validating a payload and returning diagnostics
//
// This module does NOT own:
//   - Rendering HTML (that belongs to office-ui.js adapter functions)
//   - Calendar logic (that belongs to CalendarEngine or equivalent)
//   - BCP, COE, or Ethiopian office logic (those have their own paths)
//
// Exposed globally as: window.HorologionEngine
//
// Supported offices (v1): vespers
// Planned (not yet built): orthros, midnight-office, first-hour, third-hour,
//                          sixth-hour, ninth-hour, compline (apodeipnon)
//
// ── v1.3 additions ─────────────────────────────────────────────────────────
//   - _computeBaselineTone(dateObj): derives Octoechos tone 1–8 from date
//     using Julian Paschalion. See function documentation below.
//   - _loadOctoechosData(): loads data/horologion/octoechos-vespers.json
//   - stichera-at-lord-i-have-cried and aposticha resolved for Saturday
//     Vespers (all tones 1–8) and identified (with stub note) for weekdays.
//   - Bright Week (Pascha–Thomas Saturday) detected; Octoechos slots
//     resolved as a rubric noting Paschal Tone is in use.
//
// ── v1.5 additions ─────────────────────────────────────────────────────────
//   - _loadKathismaData(): loads data/horologion/vespers-kathisma.json
//   - _resolveKathismaSlot(dayOfWeek, brightWeek): returns a resolved item
//     for the kathisma-reading slot using the standard Byzantine Psalter
//     weekly cycle (Mon–Sat ordinary). Sunday is explicitly deferred.
//     Bright Week (no kathisma) returns a rubric with honest note.
//     Festal/Lenten overrides are NOT implemented; stated openly in output.
//   - kathisma-reading slot resolved for Mon–Sat ordinary Vespers (v1.5).
//     Produces type:'rubric' naming the appointed kathisma number, title,
//     psalm range (LXX), and incipit. Full psalm text is deferred.
//
// ── v1.6 additions ─────────────────────────────────────────────────────────
//   - _loadTroparionData(): loads data/horologion/vespers-troparion.json
//   - _resolveTroparionSlot(dayOfWeek, toneResult): returns a resolved item
//     for the troparion-or-apolytikion slot.
//     Saturday: full Resurrectional Troparion text for the current tone.
//     Bright Week: Paschal Troparion ("Christ is risen") — fixed text.
//     Weekday (Mon–Fri): tone-identified rubric stub — the weekday troparion
//       requires the Menaion (daily saints); no text is fabricated.
//     Sunday: explicitly deferred — Sunday Vespers troparion handling
//       is evaluated as part of the dedicated Sunday Vespers pass.
//     Festal overrides: NOT implemented; stated openly in output.
//   - theotokion-dismissal: remains deferred this pass (depends on which
//     troparion was sung; weekday theotokion requires Menaion resolution).
//
// ── v1.7 additions ─────────────────────────────────────────────────────────
//   - _loadTheotokionData(): loads data/horologion/vespers-theotokion.json
//   - _resolveTheotokionSlot(dayOfWeek, toneResult): returns a resolved item
//     for the theotokion-dismissal slot.
//     Saturday: full dismissal Theotokion text for the current tone (tones 1–8).
//       These are the Octoechos apolytikion-paired dismissal Theotokia,
//       invariable for each tone at ordinary Saturday Great Vespers.
//     Bright Week: no dismissal Theotokion — the Paschal Troparion itself
//       serves as the dismissal; explicit omission rubric returned.
//     Weekday (Mon–Fri): tone-identified rubric stub — the weekday
//       dismissal Theotokion depends on which Menaion troparion was sung;
//       Menaion not yet implemented; tone is stated; text not fabricated.
//     Sunday: explicitly deferred — part of the Sunday Vespers pass.
//     Festal overrides: NOT implemented; stated openly in Saturday output.
//
// ──────────────────────────────────────────────────────────────────────────
// ── v1.8 additions ─────────────────────────────────────────────────────────
//   Sunday Vespers bundle pass. Implements Sunday Small Vespers (Sunday
//   evening office) as a distinct, honest baseline.
//
//   WHAT "SUNDAY VESPERS" MEANS HERE:
//     This is Sunday Small Vespers — the brief evening office sung on Sunday
//     evening itself, not Saturday Great Vespers (which anticipates Sunday and
//     is already implemented under dayOfWeek === 6). The two offices are
//     liturgically distinct; this pass targets dayOfWeek === 0.
//
//   stichera-at-lord-i-have-cried (Sunday):
//     Resolved using the resurrectional 'saturday' Octoechos corpus (same tone
//     week). At Sunday Small Vespers the resurrectional stichera of the current
//     tone are appointed — the same set anticipated at Saturday Great Vespers.
//     Label patched to read "Sunday Small Vespers"; rubric notes that three
//     stichera are typically used rather than eight at this shorter office.
//     resolvedAs: 'sunday-small-vespers-resurrectional-stichera'
//
//   aposticha (Sunday):
//     Same approach — Resurrectional Aposticha from the 'saturday' corpus.
//     resolvedAs: 'sunday-small-vespers-resurrectional-aposticha'
//
//   kathisma-reading (Sunday):
//     Upgraded from generic deferred stub to an actionable rubric encoding
//     the ordinary Sunday Small Vespers practice: kathisma omitted. Vigil
//     usage (Kathisma 1) is stated for reference. No text fabricated.
//     resolvedAs: 'sunday-small-vespers-kathisma-ordinary-omitted'
//
//   troparion-or-apolytikion (Sunday):
//     Full Resurrectional Troparion of the current Octoechos tone, from
//     data/horologion/vespers-troparion.json. Same text as Saturday Great
//     Vespers — the apolytikion of the tone, not Saturday-specific.
//     resolvedAs: 'resurrectional-troparion-sunday'
//
//   theotokion-dismissal (Sunday):
//     Full dismissal Theotokion of the current Octoechos tone, from
//     data/horologion/vespers-theotokion.json. Same text as Saturday Great
//     Vespers — tone-matched Octoechos Theotokion, not Saturday-specific.
//     resolvedAs: 'dismissal-theotokion-sunday'
//
//   No new data files. No new loaders. office-ui.js unchanged.
//   Engine changes: _resolveKathismaSlot, _resolveTroparionSlot,
//   _resolveTheotokionSlot, _resolveVespersSlots (octoechosWeekdayKey +
//   Sunday label patches in stichera and aposticha blocks).
//
// ── v1.9 additions ─────────────────────────────────────────────────────────
//   - _loadWeekdayTheotokionData(): loads
//       data/horologion/vespers-weekday-theotokion.json
//       40 entries: 8 tones × 5 weekdays (Mon–Fri).
//   - _resolveTheotokionSlot() weekday branch (Mon–Fri): upgraded from
//       tone-identified rubric stub to type:'text' full resolution.
//     Mon, Tue, Thu: standard Octoechos weekday Theotokion for this tone + day.
//     Wed, Fri:      Stavrotheotokion (Cross Theotokion) for this tone + day —
//       standard Byzantine practice on the weekly fasting days.
//     resolvedAs: 'weekday-octoechos-theotokion'
//   - troparion-or-apolytikion (Mon–Fri): UNCHANGED — remains rubric stub.
//       No Menaion data exists in the repo. Tone is stated; text not fabricated.
//       resolvedAs: 'weekday-menaion-required'
//   - LIMITATION RECORDED IN OUTPUT: weekday Theotokion ideally follows the
//       tone of the Menaion troparion, which may differ from the Octoechos
//       weekly tone. This baseline uses the Octoechos tone — correct when
//       the two tones agree (ordinary weeks). Stated openly in the output text.
//
// ── v2.0 additions ─────────────────────────────────────────────────────────
//   Weekday Menaion refinement — Mon–Fri troparion-or-apolytikion.
//
//   ASSESSMENT RESULT (v2.0):
//     Full weekday troparion text is NOT derivable from existing repo data.
//     No Menaion corpus exists. No fake text has been introduced.
//     The Octoechos weekday stichera (octoechos-vespers.json) cover chorus
//     texts but NOT the troparion/apolytikion slot.
//     The resurrectional troparia (vespers-troparion.json) are Sat/Sun only.
//
//   WHAT IS IMPLEMENTED (Outcome B + C):
//     1. New data file: data/horologion/vespers-weekday-troparion-meta.json
//        Dependency contract: weekday themes, resolution chain, resolution
//        states. Contains NO troparion text. Honest documentation only.
//     2. _loadWeekdayTroparionMeta(): lazy loader. Non-throwing; falls back
//        to an inline theme table if the file cannot be loaded.
//     3. _resolveTroparionSlot() weekday branch upgraded:
//        - Rubric names the liturgical theme of the day (e.g., "Angels" on
//          Monday, "Holy Apostles" on Thursday).
//        - Fasting day flag noted on Wednesday and Friday.
//        - weekdayTheme field added to the returned item for future use.
//        - resolvedAs: 'weekday-theme-rubric' (more precise than prior code).
//
//   WHAT REMAINS DEFERRED:
//     - Actual weekday troparion text (requires Menaion data import)
//     - Feast-rank override engine
//     - Great Lent overrides
//
// ── v2.1 additions ─────────────────────────────────────────────────────────
//   Menaion pilot wired into weekday Vespers troparion resolution.
//
//   NEW DEPENDENCY: js/menaion-resolver.js (loaded before this file in index.html)
//     Exposes window.MenaionResolver.queryTroparion(mmdd) → Promise<ResultObject>
//     This engine calls it; it does NOT own any Menaion data or loading.
//
//   _resolveTroparionSlot() — now async; accepts dateObj as third argument.
//     Bright Week / Saturday / Sunday branches: behaviour unchanged.
//     Weekday (Mon–Fri) branch:
//       1. If MenaionResolver is available and returns 'menaion-resolved':
//          → type:'text' with full troparion text, saint name, tone, rank.
//       2. If MenaionResolver returns 'menaion-text-unavailable':
//          → type:'rubric' noting the commemoration name and missing text.
//       3. All other statuses ('menaion-not-imported', 'menaion-no-ranked-commemoration',
//          'menaion-load-error') or MenaionResolver unavailable:
//          → weekday-theme rubric (identical to v2.0 fallback).
//     Non-throwing: try/catch wraps the resolver call.
//
//   Call site in _resolveVespersSlots(): _resolveTroparionSlot() is awaited;
//     dateObj passed as third argument. _resolveVespersSlots() was already async.
//
//   PILOT CORPUS SCOPE: November only (12 of 30 dates).
//     All other months → fallback rubric.
//     Non-imported November dates → fallback rubric.
//
// ── v3.0 additions ─────────────────────────────────────────────────────────
//   Small Compline (Mikron Apodeipnon) support.
//
//   SUPPORTED_OFFICES updated: ['vespers', 'small-compline']
//   COMPLINE_FIXED_URL: 'data/horologion/compline-fixed.json'
//   _complineFixedData: module-level cache (null until first load).
//
//   _loadComplineFixedData(): lazy loader for compline-fixed.json.
//     Non-throwing: on failure, logs warning; fixed slots degrade to visible
//     placeholder boxes rather than failing silently.
//
//   _resolveComplineSlots(sections, dateObj): slot resolution pass for
//     Small Compline. Called from resolveOffice() when normalizedKey ===
//     'small-compline'. Parallel-loads compline-fixed, troparion, and
//     weekday-troparion-meta data.
//
//     Fixed slots (resolved unconditionally from compline-fixed.json):
//       usual-beginning, psalm-50, psalm-69, psalm-142, doxology, creed,
//       trisagion-prayers, compline-theotokion, prayer-of-basil, into-thy-hands
//     Variable slot:
//       troparion-of-the-day — delegates to _resolveTroparionSlot() with
//       key renamed from 'troparion-or-apolytikion' for correct labelling.
//       All fallback paths (weekday-theme rubric, Resurrectional Troparion,
//       Paschal Troparion) inherited unchanged from Vespers implementation.
//
//   Unified Horologion navigation (office-ui.js + index.html):
//     - selectMode('horologion') replaces selectMode('horologion-vespers')
//     - #generic-settings sidebar now contains office selector buttons:
//       #hor-btn-vespers and #hor-btn-small-compline
//     - selectHorologionOffice(), _updateHorologionOfficeButtons(),
//       _horologionOfficeLabel() added to office-ui.js
//     - selectedHorologionOffice state defaults to 'vespers'
//     - Old mode strings horologion-vespers and horologion-small-compline
//       eliminated from all files
//
// ──────────────────────────────────────────────────────────────────────────
const HorologionEngine = (() => {

    // ── Internal skeleton cache ────────────────────────────────────────────
    // Keys: officeKey strings (e.g. 'vespers')
    // Values: parsed JSON skeleton objects
    const _skeletonCache = {};

    // ── Supported offices in this version ─────────────────────────────────
    const SUPPORTED_OFFICES = ['vespers', 'small-compline', 'first-hour', 'third-hour', 'sixth-hour', 'ninth-hour', 'orthros', 'midnight-office', 'typika', 'interhour-first', 'interhour-third', 'interhour-sixth', 'interhour-ninth'];

    // ── Tradition code for this engine ────────────────────────────────────
    const TRADITION = 'BYZC';

    // ── v1.2: Prokeimena data file URL ─────────────────────────────────────
    const PROKEIMENA_URL = 'data/horologion/vespers-prokeimena.json';

    // ── v1.3: Octoechos data file URL ──────────────────────────────────────
    const OCTOECHOS_URL = 'data/horologion/octoechos-vespers.json';

    // ── v1.5: Kathisma appointment table URL ───────────────────────────────
    const KATHISMA_URL = 'data/horologion/vespers-kathisma.json';

    // ── v5.5: Kathisma full psalm text corpus URL ──────────────────────────
    // Six kathismata appointed at ordinary weekday Vespers (1, 4, 6, 8, 10, 12).
    // Shape: { kathismata: { "1": { stases: [ { stasis, psalms: [...] } ] }, ... } }
    const KATHISMA_FULL_TEXT_URL = 'data/horologion/kathisma-full-text.json';

    // ── v1.6: Troparion/Apolytikion data file URL ──────────────────────────
    const TROPARION_URL = 'data/horologion/vespers-troparion.json';

    // ── v1.7: Dismissal Theotokion data file URL ───────────────────────────
    const THEOTOKION_URL = 'data/horologion/vespers-theotokion.json';

    // ── v1.9: Weekday Theotokion data file URL ────────────────────────────
    // 40 entries: 8 Octoechos tones × 5 weekdays (Mon–Fri).
    // Wednesday and Friday entries are Stavrotheotokia (Cross Theotokia).
    const WEEKDAY_THEOTOKION_URL = 'data/horologion/vespers-weekday-theotokion.json';

    // ── v1.2: Weekday prokeimena lookup array (null until first fetch) ──────
    // Populated lazily by _loadVespersProkeimena(). Indexed by JS Date.getDay()
    // (0 = Sunday … 6 = Saturday). Built from vespers-prokeimena.json entries.
    let _prokeimenaByDay = null;

    // ── v1.3: Octoechos data object (null until first fetch) ───────────────
    // Populated lazily by _loadOctoechosData().
    // Shape: { tones: { "1": { saturday: {...}, monday: {...}, ... }, ... } }
    let _octoechosData = null;

    // ── v1.5: Kathisma data object (null until first fetch) ────────────────
    // Populated lazily by _loadKathismaData().
    // Shape: { assignments: [ { weekday, weekdayIndex, kathismaNumber, ... }, ... ] }
    // assignments[0] = Sunday (deferred), assignments[1] = Monday, etc.
    let _kathismaData = null;

    // ── v5.5: Kathisma full psalm text data object (null until first fetch) ─
    // Populated lazily by _loadKathismaFullTextData().
    // Shape: { kathismata: { "1": { stases: [ { stasis, psalms: [...] } ] }, ... } }
    // Covers kathismata 1, 4, 6, 8, 10, 12 (all ordinary weekday Vespers assignments).
    // null if file fails to load — _resolveKathismaSlot degrades to rubric output.
    let _kathismaFullTextData = null;

    // ── v1.6: Troparion data object (null until first fetch) ───────────────
    // Populated lazily by _loadTroparionData().
    // Shape: { resurrectional_troparia: { "1": {...}, ... "8": {...} },
    //          paschal_troparion: { title, text, note } }
    let _troparionData = null;

    // ── v1.7: Theotokion data object (null until first fetch) ──────────────
    // Populated lazily by _loadTheotokionData().
    // Shape: { dismissal_theotokia: { "1": {...}, ... "8": {...} } }
    let _theotokionData = null;

    // ── v1.9: Weekday Theotokion data object (null until first fetch) ──────
    // Populated lazily by _loadWeekdayTheotokionData().
    // Shape: { weekday_theotokia: { "1": { monday: {...}, tuesday: {...}, ... }, ... } }
    // Covers tones 1–8, weekdays Monday–Friday (40 entries total).
    let _weekdayTheotokionData = null;

    // ── v2.0: Weekday troparion meta file URL ─────────────────────────────
    // Documents the dependency contract for weekday troparia (no text supplied).
    const WEEKDAY_TROPARION_META_URL = 'data/horologion/vespers-weekday-troparion-meta.json';

  // ── v3.0: Compline fixed-text data file URL and cache ─────────────────
    const COMPLINE_FIXED_URL = 'data/horologion/compline-fixed.json';

    // Populated lazily by _loadComplineFixedData().
    // Shape: { slots: { "usual-beginning": {...}, "psalm-50": {...}, ... } }
    let _complineFixedData = null;

   // ── v3.1: First Hour fixed-text data file URL and cache ───────────────
    const FIRST_HOUR_FIXED_URL = 'data/horologion/first-hour-fixed.json';

    // Populated lazily by _loadFirstHourFixedData().
    // Shape: { slots: { "usual-beginning": {...}, "psalm-5": {...}, ... } }
    let _firstHourFixedData = null;

    // ── v3.2: Third Hour fixed-text data file URL and cache ───────────────
    const THIRD_HOUR_FIXED_URL = 'data/horologion/third-hour-fixed.json';

    // Populated lazily by _loadThirdHourFixedData().
    // Shape: { slots: { "usual-beginning": {...}, "psalm-16": {...}, ... } }
    let _thirdHourFixedData = null;

    // ── v3.3: Sixth Hour fixed-text data file URL and cache ───────────────
    const SIXTH_HOUR_FIXED_URL = 'data/horologion/sixth-hour-fixed.json';

    // Populated lazily by _loadSixthHourFixedData().
    // Shape: { slots: { "usual-beginning": {...}, "psalm-53": {...}, ... } }
    let _sixthHourFixedData = null;

    // ── v3.4: Ninth Hour fixed-text data file URL and cache ───────────────
    const NINTH_HOUR_FIXED_URL = 'data/horologion/ninth-hour-fixed.json';

    // Populated lazily by _loadNinthHourFixedData().
    // Shape: { slots: { "usual-beginning": {...}, "psalm-83": {...}, ... } }
    let _ninthHourFixedData = null;

    // ── v5.6: Orthros (Matins) fixed-text data file URL and cache ─────────
     const ORTHROS_FIXED_URL = 'data/horologion/orthros-fixed.json';
 
    // Populated lazily by _loadOrthrosFixedData().
    // Shape: { slots: { "usual-beginning": {...}, "psalm-3": {...}, ... } }
    let _orthrosFixedData = null;
 
    // ── v6.2: Midnight Office (Mesoniktikon) fixed text URL and cache ──────
    const MIDNIGHT_OFFICE_FIXED_URL = 'data/horologion/midnight-office-fixed.json';
 
    // Populated lazily by _loadMidnightOfficeFixedData().
    // Shape: { slots: { "usual-beginning": {...}, "psalm-50": {...}, ... } }
    let _midnightOfficeFixedData = null;
 
    // ── v6.3: Midnight Office theotokion corpus URL and cache ─────────────
// Tone × day-of-week grid. null = untranscribed; string = full text.
// Shape: { tones: { "1": { "0": null|string, … "6": null|string }, … } }
const MIDNIGHT_OFFICE_THEOTOKION_URL = 'data/horologion/midnight-office-theotokion.json';

// Populated lazily by _loadMidnightOfficeTheotokionData().
let _midnightOfficeTheotokionData = null;

// ── v6.7: Great Compline fixed text URL and cache ─────────────────────
const GREAT_COMPLINE_FIXED_URL = 'data/horologion/great-compline-fixed.json';
let _greatComplineFixedData = null;

// ── v7.1: Octoechos Great Compline canon corpus (null-sentinel) ──────────────
// window.GC_CANON_OCTOECHOS is loaded from js/octoechos/gc-canon-theotokos.js.
// The engine probes this object and degrades to the gc-canon-octoechos rubric
// slot when the sentinel is null. No engine redesign will be required when
// corpus text is added: replace null with the text object per tone.
function _getGcCanonOctoechos(tone) {
    if (
        window.GC_CANON_OCTOECHOS &&
        window.GC_CANON_OCTOECHOS.tones &&
        window.GC_CANON_OCTOECHOS.tones[tone] !== undefined
    ) {
        return window.GC_CANON_OCTOECHOS.tones[tone]; // null or text object
    }
    return undefined; // corpus file not loaded at all
}

// ── v7.2: Great Canon corpus (null-sentinel) ─────────────────────────────────
// window.GC_CANON_MENAION is loaded from js/octoechos/gc-canon-menaion.js.
// Corpus contract: window.GC_CANON_MENAION.dates["MM-DD"]
//   key present with { label, text } → use corpus text
//   key absent                       → degrade to gc-canon-menaion rubric slot
// Returns { label, text } or undefined.
function _getGcCanonMenaion(mmdd) {
    if (!window.GC_CANON_MENAION || !window.GC_CANON_MENAION.dates) return undefined;
    return window.GC_CANON_MENAION.dates[mmdd] || undefined;
}

// window.GC_CANON_GREAT_CANON is loaded from js/octoechos/gc-canon-great-canon.js.
// Four evening slots (monday–thursday) are null sentinels until the corpus
// transcription tranche. The engine probes this object in the isFirstWeekOfLent
// branch and degrades to the gc-canon-great-canon rubric slot when the sentinel
// is null. No engine redesign will be required when corpus text is added:
// replace null with the text object per evening.
function _getGcCanonGreatCanon(dayName) {
    if (
        window.GC_CANON_GREAT_CANON &&
        window.GC_CANON_GREAT_CANON.evenings &&
        window.GC_CANON_GREAT_CANON.evenings[dayName] !== undefined
    ) {
        return window.GC_CANON_GREAT_CANON.evenings[dayName]; // null or text object
    }
    return undefined; // corpus file not loaded at all
}

// ── v6.9: Typika (Obednitsa) fixed text URL and cache ─────────────────
const TYPIKA_FIXED_URL = 'data/horologion/typika-fixed.json';
let _typikaFixedData = null;

// ── v7.0: Interhours fixed text URLs and cache ────────────────────────
const INTERHOUR_FIRST_FIXED_URL = 'data/horologion/interhour-first-fixed.json';
const INTERHOUR_THIRD_FIXED_URL = 'data/horologion/interhour-third-fixed.json';
const INTERHOUR_SIXTH_FIXED_URL = 'data/horologion/interhour-sixth-fixed.json';
const INTERHOUR_NINTH_FIXED_URL = 'data/horologion/interhour-ninth-fixed.json';

// Populated lazily by _loadInterhourFixedData(officeKey).
const _interhourFixedDataCache = {};

    // ── v5.7: Orthros kathisma appointment table URL and cache ─────────────
    // Weekday pair assignments (Mon–Sat) for ordinary non-vigil Orthros.
    // Shape: { assignments: [ { weekdayIndex, kathismaFirst: {...}, kathismaSecond: {...} }, ... ] }
    // Distinct from vespers-kathisma.json — the Orthros cycle uses Kathismata 4–15;
    // the Vespers cycle uses Kathismata 1, 4, 6, 8, 10, 12.
    const ORTHROS_KATHISMA_URL = 'data/horologion/orthros-kathisma.json';

    // Populated lazily by _loadOrthrosKathismaData().
    // null until first load attempt.
    let _orthrosKathismaData = null;

    // ── v5.0: Triodion lenten weekday data file URL and cache ─────────────
    // Keyed by lent week number (1–6), then weekday name (monday … friday).
    // Shape: { lenten_weekday_troparion: { "1": { monday: { troparion: {...} }, ... }, ... } }
    // Populated lazily by _loadTriodionData(). null until first load attempt.
    const TRIODION_LENTEN_WEEKDAY_URL = 'data/triodion/triodion-lenten-weekday.json';
    let _triodionLentenData = null;

    // ── v5.1: Holy Week text overlay data file URL and cache ──────────────
    // Keyed by holyWeekDay string (palm-sunday … great-saturday), then slot key.
    // Shape: { holy_week: { "palm-sunday": { slots: { "troparion-or-apolytikion": {...} } }, ... } }
    // Populated lazily by _loadHolyWeekData(). null until first load attempt.
    const HOLY_WEEK_URL = 'data/triodion/holy-week/holy-week.json';
    let _holyWeekData = null;

    // ── v5.2: Pentecostarion Bright Week text overlay data file URL and cache
    // Keyed by slot name ('stichera-at-lord-i-have-cried' | 'aposticha').
    // Shape: { bright_week: { "stichera-at-lord-i-have-cried": {...}, "aposticha": {...} } }
    // Populated lazily by _loadPentecostarionData(). null until first load attempt.
    // Note: troparion, kathisma, and theotokion slots are already correctly
    // handled by existing engine logic and need no Pentecostarion overlay.
    const PENTECOSTARION_BRIGHT_WEEK_URL = 'data/pentecostarion/pentecostarion-bright-week.json';
    let _pentecostarionData = null;

    // ── v2.0: Weekday troparion meta object (null until first fetch) ───────
    // Populated lazily by _loadWeekdayTroparionMeta().
    // Shape: { weekday_themes: { monday: { theme, theme_short, fasting_day? }, ... } }
    // Used to produce accurate weekday theme rubrics without fabricating text.
    let _weekdayTroparionMeta = null;

    // ── v2.0: Inline fallback weekday theme table ──────────────────────────
    // Used if the meta JSON file fails to load. Keeps the rubric accurate
    // even under network failure without requiring the file at runtime.
    const _WEEKDAY_THEME_FALLBACK = {
        monday:    { theme: 'Bodiless Powers (Angels)',              theme_short: 'Angels',                fasting_day: false },
        tuesday:   { theme: 'St. John the Baptist and the Prophets', theme_short: 'St. John the Baptist',  fasting_day: false },
        wednesday: { theme: 'Cross and Theotokos',                   theme_short: 'the Holy Cross',         fasting_day: true  },
        thursday:  { theme: 'Holy Apostles and St. Nicholas',        theme_short: 'the Holy Apostles',      fasting_day: false },
        friday:    { theme: 'Cross and Theotokos (penitential)',     theme_short: 'the Holy Cross',         fasting_day: true  }
    };

    // ── v1.3: Pascha authority ─────────────────────────────────────────────
    // Delegated to window.ByzantinePaschalion (js/byzantine-paschalion.js).
    // Cache is owned there; no local cache needed.


    // ──────────────────────────────────────────────────────────────────────
    // getOfficeSkeleton(officeKey, traditionVariant)
    //
    // Loads the static JSON skeleton for the given office from:
    //   data/horologion/<officeKey>.json
    //
    // Returns a Promise resolving to the parsed skeleton object.
    // Throws (rejects) if the file is missing or not parseable.
    // Results are cached in _skeletonCache so subsequent calls are synchronous.
    // ──────────────────────────────────────────────────────────────────────
    async function getOfficeSkeleton(officeKey, traditionVariant = 'byzantine') {
        if (!officeKey || typeof officeKey !== 'string') {
            throw new Error('[HorologionEngine] getOfficeSkeleton: officeKey must be a non-empty string.');
        }

        const normalizedKey = officeKey.toLowerCase().trim();

        if (_skeletonCache[normalizedKey]) {
            return _skeletonCache[normalizedKey];
        }

        const url = `data/horologion/${normalizedKey}.json`;
        let response;

        try {
            response = await fetch(url);
        } catch (networkErr) {
            throw new Error(`[HorologionEngine] Network error loading skeleton "${normalizedKey}": ${networkErr.message}`);
        }

        if (!response.ok) {
            throw new Error(`[HorologionEngine] Skeleton file not found: ${url} (HTTP ${response.status})`);
        }

        let skeleton;
        try {
            skeleton = await response.json();
        } catch (parseErr) {
            throw new Error(`[HorologionEngine] Failed to parse skeleton JSON for "${normalizedKey}": ${parseErr.message}`);
        }

        _skeletonCache[normalizedKey] = skeleton;
        console.log(`[HorologionEngine] Loaded skeleton: ${normalizedKey}`);
        return skeleton;
    }


    // ──────────────────────────────────────────────────────────────────────
    // resolveOffice(date, officeKey, context)
    //
    // Returns a normalized office payload ready for the UI adapter to render.
    //
    // Parameters:
    //   date      — JS Date object or ISO string 'YYYY-MM-DD'
    //   officeKey — e.g. 'vespers'
    //   context   — optional object for future use (feast rank, tone week, etc.)
    //
    // The payload shape is defined in data/horologion/schema.json.
    // All unresolved variable slots are preserved as-is from the skeleton with
    // status:'unresolved' — they are NEVER silently omitted or fabricated.
    // ──────────────────────────────────────────────────────────────────────
    async function resolveOffice(date, officeKey, context = {}) {
        // Normalise date
        let dateObj;
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string') {
            dateObj = new Date(date + (date.length === 10 ? 'T00:00:00' : ''));
        } else {
            throw new Error('[HorologionEngine] resolveOffice: date must be a Date object or ISO string.');
        }

        if (isNaN(dateObj.getTime())) {
            throw new Error(`[HorologionEngine] resolveOffice: invalid date value "${date}".`);
        }

        const isoDate = _formatLocalISODate(dateObj);
        const normalizedKey = (officeKey || '').toLowerCase().trim();

        // Load skeleton
        let skeleton;
        try {
            skeleton = await getOfficeSkeleton(normalizedKey);
        } catch (err) {
            // Return an error payload rather than throwing — keeps UI rendering predictable
            return {
                tradition:  TRADITION,
                officeKey:  normalizedKey,
                date:       isoDate,
                title:      officeKey || '(unknown)',
                variant:    'error',
                status:     'error',
                sections:   [],
                diagnostics: {
                    implementedSlots: 0,
                    placeholderSlots: 0,
                    warnings: [`Failed to load skeleton: ${err.message}`]
                }
            };
        }

        // Deep-copy sections so we never mutate the cached skeleton
        const sections = _deepCopySections(skeleton.sections || []);

         // Route to the correct slot resolver based on officeKey.
        if (normalizedKey === 'small-compline') {
            await _resolveComplineSlots(sections, dateObj);
         } else if (normalizedKey === 'first-hour') {
            await _resolveFirstHourSlots(sections, dateObj);
        } else if (normalizedKey === 'third-hour') {
            await _resolveThirdHourSlots(sections, dateObj);
        } else if (normalizedKey === 'sixth-hour') {
            await _resolveSixthHourSlots(sections, dateObj);
        } else if (normalizedKey === 'ninth-hour') {
            await _resolveNinthHourSlots(sections, dateObj);
       } else if (normalizedKey === 'orthros') {
            await _resolveOrthrosSlots(sections, dateObj);
        } else if (normalizedKey === 'midnight-office') {
    await _resolveMidnightOfficeSlots(sections, dateObj);
} else if (normalizedKey === 'great-compline') {
    await _resolveGreatComplineSlots(sections, dateObj);
} else if (normalizedKey === 'typika') {
    await _resolveTypikaSlots(sections, dateObj);
} else if (
    normalizedKey === 'interhour-first' ||
    normalizedKey === 'interhour-third' ||
    normalizedKey === 'interhour-sixth' ||
    normalizedKey === 'interhour-ninth'
) {
    await _resolveInterhourSlots(normalizedKey, sections, dateObj);
} else {
            // v1.2 / v1.3: Vespers resolver (default for 'vespers' and any
            // future office that shares it until it has its own resolver).
            await _resolveVespersSlots(sections, dateObj);
        }

        // Diagnostic pass — count resolved vs placeholder slots
        let implementedSlots = 0;
        let placeholderSlots = 0;
        const warnings = [];

        for (const section of sections) {
            if (!Array.isArray(section.items)) continue;
            for (const item of section.items) {
                const isPlaceholder =
                    item.type === 'placeholder' ||
                    item.status === 'unresolved' ||
                    item.status === 'placeholder';

                if (isPlaceholder) {
                    placeholderSlots++;
                    warnings.push(`Unresolved slot [${section.id}] → ${item.key}: ${item.label || item.key}`);
                } else {
                    implementedSlots++;
                }
            }
        }

        const status = placeholderSlots === 0 ? 'complete' : 'partial';

        const payload = {
            tradition:  TRADITION,
            officeKey:  normalizedKey,
            date:       isoDate,
            title:      skeleton.label || _officeTitleFallback(normalizedKey),
            variant:    'baseline',
            status:     status,
            sections:   sections,
            diagnostics: {
                implementedSlots,
                placeholderSlots,
                warnings
            }
        };

        console.log(
            `[HorologionEngine] Resolved "${normalizedKey}" for ${isoDate}: ` +
            `${implementedSlots} implemented, ${placeholderSlots} placeholder slots.`
        );

        return payload;
    }


    // ──────────────────────────────────────────────────────────────────────
    // validateOfficePayload(payload)
    //
    // Checks a payload object for required fields and structural integrity.
    // Returns a diagnostics object:
    //   { valid: boolean, errors: string[], warnings: string[] }
    //
    // This is designed to be called by the UI adapter or from the browser
    // console for debugging. It does not throw.
    // ──────────────────────────────────────────────────────────────────────
    function validateOfficePayload(payload) {
        const errors = [];
        const warnings = [];

        if (!payload || typeof payload !== 'object') {
            return { valid: false, errors: ['Payload is null or not an object.'], warnings: [] };
        }

        // Required top-level fields
        const requiredFields = ['tradition', 'officeKey', 'date', 'title', 'status', 'sections', 'diagnostics'];
        for (const field of requiredFields) {
            if (payload[field] === undefined || payload[field] === null) {
                errors.push(`Missing required field: "${field}"`);
            }
        }

        // Sections must be an array
        if (payload.sections !== undefined && !Array.isArray(payload.sections)) {
            errors.push('"sections" must be an array.');
        }

        // Diagnostics shape
        if (payload.diagnostics) {
            if (typeof payload.diagnostics.implementedSlots !== 'number') {
                errors.push('"diagnostics.implementedSlots" must be a number.');
            }
            if (typeof payload.diagnostics.placeholderSlots !== 'number') {
                errors.push('"diagnostics.placeholderSlots" must be a number.');
            }
            if (!Array.isArray(payload.diagnostics.warnings)) {
                errors.push('"diagnostics.warnings" must be an array.');
            }
        }

        // Section integrity
        if (Array.isArray(payload.sections)) {
            payload.sections.forEach((section, si) => {
                if (!section.id)    errors.push(`sections[${si}] missing "id".`);
                if (!section.label) errors.push(`sections[${si}] missing "label".`);
                if (!Array.isArray(section.items)) {
                    errors.push(`sections[${si}] "items" must be an array.`);
                } else {
                    section.items.forEach((item, ii) => {
                        if (!item.type) errors.push(`sections[${si}].items[${ii}] missing "type".`);
                        if (!item.key)  errors.push(`sections[${si}].items[${ii}] missing "key".`);
                    });
                }
            });
        }

        // Status value check
        const validStatuses = ['complete', 'partial', 'error'];
        if (payload.status && !validStatuses.includes(payload.status)) {
            warnings.push(`Unexpected status value: "${payload.status}". Expected one of: ${validStatuses.join(', ')}.`);
        }

        // Surface any resolution warnings carried by the payload
        if (Array.isArray(payload.diagnostics?.warnings)) {
            payload.diagnostics.warnings.forEach(w => warnings.push(w));
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }


    // ══════════════════════════════════════════════════════════════════════
    // Internal helpers
    // ══════════════════════════════════════════════════════════════════════

    // ──────────────────────────────────────────────────────────────────────
    // v1.2: _formatLocalISODate(dateObj)
    //
    // Returns YYYY-MM-DD using local wall-clock date, not UTC.
    // toISOString() returns UTC which can shift the date by one day for users
    // west of UTC during evening hours — incorrect for a liturgical application.
    // ──────────────────────────────────────────────────────────────────────
    function _formatLocalISODate(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    // ──────────────────────────────────────────────────────────────────────
    // _officeTitleFallback(normalizedKey)
    //
    // Last-resort title string when a skeleton file has no 'label' field.
    // In practice every current skeleton defines 'label', so this function
    // is never called; it exists only to prevent a ReferenceError if a
    // future skeleton is added without one.
    // ──────────────────────────────────────────────────────────────────────
    function _officeTitleFallback(normalizedKey) {
         const TITLES = {
            'vespers':        'Vespers',
            'small-compline': 'Small Compline',
            'first-hour':     'First Hour',
            'third-hour':     'Third Hour',
            'sixth-hour':     'Sixth Hour',
            'ninth-hour':     'Ninth Hour',
            'orthros':        'Orthros (Matins)',
            'typika':         'Typika (Obednitsa)',
            'interhour-first': 'Interhour of the First Hour',
            'interhour-third': 'Interhour of the Third Hour',
            'interhour-sixth': 'Interhour of the Sixth Hour',
            'interhour-ninth': 'Interhour of the Ninth Hour'
        };
        return TITLES[normalizedKey] || normalizedKey;
    }
    // ──────────────────────────────────────────────────────────────────────
    // v3.5: _resolveFeastOverrideContext(dateObj, dayOfWeek, menaionResult)
    //
    // Minimal Vespers feast-rank arbitration layer for Phase 1.
    // Governs:
    //   - troparion-or-apolytikion
    //   - theotokion-dismissal
    // ──────────────────────────────────────────────────────────────────────
    function _resolveFeastOverrideContext(dateObj, dayOfWeek, menaionResult) {
    try {
        const rank =
            menaionResult &&
            typeof menaionResult.rank === 'number'
                ? menaionResult.rank
                : null;

        const governingTone =
            menaionResult &&
            typeof menaionResult.tone === 'number' &&
            menaionResult.tone >= 1 &&
            menaionResult.tone <= 8
                ? menaionResult.tone
                : null;

        const toneResult = _computeBaselineTone(dateObj);
        const seasonResult = _computeLiturgicalSeason(dateObj, toneResult);

        const isGreatLentWeekday =
            seasonResult &&
            seasonResult.season === 'great-lent' &&
            dayOfWeek >= 1 &&
            dayOfWeek <= 5;

        const maxQualifyingRank = isGreatLentWeekday ? 2 : 4;

        const hasOverride = Boolean(
            menaionResult &&
            menaionResult.status === 'menaion-resolved' &&
            typeof menaionResult.text === 'string' &&
            menaionResult.text.trim() !== '' &&
            rank !== null &&
            rank >= 1 &&
            rank <= maxQualifyingRank
        );

        return {
            hasOverride:   hasOverride,
            rank:          hasOverride ? rank : null,
            governingTone: hasOverride ? governingTone : null,
            overrideType:  hasOverride ? 'menaion-troparion' : 'none',
            appliesTo:     hasOverride ? ['troparion', 'theotokion-dismissal'] : []
        };
    } catch (err) {
        return {
            hasOverride:   false,
            rank:          null,
            governingTone: null,
            overrideType:  'none',
            appliesTo:     []
        };
    }
}
        // ──────────────────────────────────────────────────────────────────────
    // v3.6: _resolveLittleHourTroparionSlot(dayOfWeek, toneResult, dateObj)
    //
    // Reuses the existing feast-rank override context for the Little Hours.
    //
    // Rule:
    //   - If a qualifying fixed-date Menaion commemoration (rank 1–4)
    //     resolves, return the Menaion troparion.
    //   - Otherwise preserve the existing baseline behaviour by delegating
    //     back to _resolveTroparionSlot().
    //
    // Scope:
    //   - first-hour
    //   - third-hour
    //   - sixth-hour
    //   - ninth-hour
    //
    // Non-throwing. On resolver failure, falls back to baseline behaviour.
    // ──────────────────────────────────────────────────────────────────────
    async function _resolveLittleHourTroparionSlot(dayOfWeek, toneResult, dateObj) {
        let menaionResult = null;
        let overrideContext = {
            hasOverride:   false,
            rank:          null,
            governingTone: null,
            overrideType:  'none',
            appliesTo:     []
        };

        if (
            dateObj &&
            typeof window !== 'undefined' &&
            window.MenaionResolver &&
            typeof window.MenaionResolver.queryTroparion === 'function'
        ) {
            try {
                const mm   = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dd   = String(dateObj.getDate()).padStart(2, '0');
                const mmdd = `${mm}-${dd}`;

                menaionResult   = await window.MenaionResolver.queryTroparion(mmdd);
                overrideContext = _resolveFeastOverrideContext(dateObj, dayOfWeek, menaionResult);
            } catch (err) {
                console.warn('[HorologionEngine] Little Hours Menaion troparion lookup failed:', err.message);
            }
        }

        if (overrideContext.hasOverride) {
            return {
                type:          'text',
                key:           'troparion-of-the-day',
                label:         menaionResult.title || `Troparion of ${menaionResult.name || 'the Feast'}`,
                text:          menaionResult.text,
                source:        'Menaion',
                tone:          overrideContext.governingTone,
                resolvedAs:    'menaion-feast-troparion',
                overrideType:  'menaion-troparion',
                governingTone: overrideContext.governingTone,
                rank:          overrideContext.rank,
                commemoration: menaionResult.name || null
            };
        }

               return await _resolveTroparionSlot(dayOfWeek, toneResult, dateObj);
    }

    // ──────────────────────────────────────────────────────────────────────
    // v4.0: _normalizeOrdinaryTroparionFallbackForOffice(officeKey, resolved)
    //
    // Rewrites the inherited Vespers-oriented weekday-theme-rubric so that
    // Small Compline and the Little Hours emit office-appropriate rubric text.
    //
    // This function ONLY fires for:
    //   resolvedAs === 'weekday-theme-rubric'
    //
    // It does not alter:
    //   - feast overrides
    //   - seasonal overrides
    //   - Vespers output
    // ──────────────────────────────────────────────────────────────────────
    function _normalizeOrdinaryTroparionFallbackForOffice(officeKey, resolved, dayOfWeek = null) {
    resolved = _normalizeUnavailableTroparionFallbackForOffice(officeKey, resolved, dayOfWeek);

    if (!resolved || resolved.resolvedAs !== 'weekday-theme-rubric') {
        return resolved;
    }

    const OFFICE_TEXT = {
            'small-compline':
                'On ordinary weekdays, the proper troparion appointment for Small Compline belongs here. ' +
                'The full weekday text requires the Menaion and is not yet available in this office.',

            'first-hour':
                'On ordinary weekdays, the proper troparion appointment for the First Hour belongs here. ' +
                'The full weekday text requires the Menaion and is not yet available in this office.',

            'third-hour':
                'On ordinary weekdays, the proper troparion appointment for the Third Hour belongs here. ' +
                'The full weekday text requires the Menaion and is not yet available in this office.',

            'sixth-hour':
                'On ordinary weekdays, the proper troparion appointment for the Sixth Hour belongs here. ' +
                'The full weekday text requires the Menaion and is not yet available in this office.',

         'ninth-hour':
                'On ordinary weekdays, the proper troparion appointment for the Ninth Hour belongs here. ' +
                'The full weekday text requires the Menaion and is not yet available in this office.',
 
            'midnight-office':
                'On ordinary weekdays, the proper troparion appointment for the Midnight Office belongs here. ' +
                'The full weekday text requires the Menaion and is not yet available in this office.',

            'typika':
                'On ordinary days, the proper dismissal troparion for the Typika belongs here. ' +
                'The full troparion text requires the Menaion.',

            'interhour-first':
                'On ordinary weekdays, the proper troparion appointment for the Interhour of the First Hour belongs here. ' +
                'Consult the Menaion for the appointed text.',

            'interhour-third':
                'On ordinary weekdays, the proper troparion appointment for the Interhour of the Third Hour belongs here. ' +
                'Consult the Menaion for the appointed text.',

            'interhour-sixth':
                'On ordinary weekdays, the proper troparion appointment for the Interhour of the Sixth Hour belongs here. ' +
                'Consult the Menaion for the appointed text.',

            'interhour-ninth':
                'On ordinary weekdays, the proper troparion appointment for the Interhour of the Ninth Hour belongs here. ' +
                'Consult the Menaion for the appointed text.'
        };

        if (!OFFICE_TEXT[officeKey]) {
            return resolved;
        }

        return {
            ...resolved,
            key:       'troparion-of-the-day',
            label:     'Troparion of the Day',
            text:      OFFICE_TEXT[officeKey],
            officeKey: officeKey
        };
    }
        // ──────────────────────────────────────────────────────────────────────
    // v4.1/v4.3: Little Hours Theotokion normalization + festal rubric override
    //
    // _normalizeTheotokionRubricForOffice(...)
    //   Rewrites deferred/rubric Theotokion outputs for the Little Hours so
    //   that office-facing wording is truthful and office-specific.
    //
    // _resolveLittleHourFestalTheotokionRubric(...)
    //   Reuses the already-resolved troparion-of-the-day item from the same
    //   office section. If that troparion resolved as a qualifying Menaion
    //   feast troparion, the ordinary deferred Theotokion rubric is displaced
    //   by an explicit festal rubric item.
    //
    // Scope:
    //   - first-hour
    //   - third-hour
    //   - sixth-hour
    //   - ninth-hour
    //
    // Does not alter:
    //   - Vespers
    //   - Small Compline
    //   - season logic
    //   - authored/full-text Theotokion paths
    // ──────────────────────────────────────────────────────────────────────
    // v4.5: _normalizeTheotokionRubricForOffice — enriched rubric with tone/weekday context
    //
    // Accepts an optional toneResult and dayOfWeek so the rubric can name the
    // current Octoechos tone and weekday character (including Stavrotheotokion
    // note for Wednesday/Friday). Both are optional: if absent the rubric
    // degrades gracefully to the previous office-only wording.
    //
    // Called from all four Little Hours Theotokion branches. The festal
    // arbitration layer (_resolveLittleHourFestalTheotokionRubric) runs after
    // this function and will displace the rubric when a feast governs the office.
    // ──────────────────────────────────────────────────────────────────────
    function _normalizeTheotokionRubricForOffice(officeKey, resolvedItem, toneResult, dayOfWeek) {
        const NORMALIZABLE_RESOLVED_AS = new Set([
            'first-hour-theotokion-deferred',
            'third-hour-theotokion-deferred',
            'sixth-hour-theotokion-deferred',
            'ninth-hour-theotokion-deferred'
        ]);

        if (
            !resolvedItem ||
            resolvedItem.type !== 'rubric' ||
            !NORMALIZABLE_RESOLVED_AS.has(resolvedItem.resolvedAs)
        ) {
            return resolvedItem;
        }

        const OFFICE_LABELS = {
            'first-hour': { key: 'first-hour-theotokion', label: 'Theotokion of the First Hour',  hour: 'First Hour'  },
            'third-hour': { key: 'third-hour-theotokion', label: 'Theotokion of the Third Hour',  hour: 'Third Hour'  },
            'sixth-hour': { key: 'sixth-hour-theotokion', label: 'Theotokion of the Sixth Hour',  hour: 'Sixth Hour'  },
            'ninth-hour': { key: 'ninth-hour-theotokion', label: 'Theotokion of the Ninth Hour',  hour: 'Ninth Hour'  }
        };

        const config = OFFICE_LABELS[officeKey];
        if (!config) {
            return resolvedItem;
        }

        // Build tone/weekday context string if data is available.
        const WEEKDAY_NAMES = {
            1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday',
            6: 'Saturday', 0: 'Sunday'
        };
        const tone        = (toneResult && toneResult.tone)  ? toneResult.tone  : null;
        const weekdayName = (typeof dayOfWeek === 'number')  ? (WEEKDAY_NAMES[dayOfWeek] || null) : null;
        const isCrossDay  = dayOfWeek === 3 || dayOfWeek === 5; // Wednesday or Friday

        let contextLine = '';
        if (tone && weekdayName) {
            contextLine = isCrossDay
                ? ` (${weekdayName}, Tone ${tone} — a Stavrotheotokion / Cross Theotokion is appointed for this day.)`
                : ` (${weekdayName}, Tone ${tone}.)`;
        } else if (tone) {
            contextLine = ` (Tone ${tone}.)`;
        } else if (weekdayName) {
            contextLine = ` (${weekdayName}.)`;
        }

        const text =
            `The proper Theotokion of the ${config.hour} belongs here.${contextLine} ` +
            `Each of the Little Hours has its own appointed Theotokion from the Horologion, ` +
            `distinct from the Vespers dismissal Theotokion. ` +
            `The full text corpus for the Little Hours Theotokia is not yet imported into this application.`;

        return {
            ...resolvedItem,
            key:       config.key,
            label:     config.label,
            text:      text,
            officeKey: officeKey
};
    }

function _normalizeUnavailableTroparionFallbackForOffice(officeKey, resolved, dayOfWeek = null) {
    if (!resolved || resolved.resolvedAs !== 'menaion-text-unavailable') {
        return resolved;
    }

    if (resolved.type !== 'rubric') {
        return resolved;
    }

    const OFFICE_LABELS = {
        'vespers': 'Weekday Vespers',
        'small-compline': 'Small Compline',
        'first-hour': 'First Hour',
        'third-hour': 'Third Hour',
        'sixth-hour': 'Sixth Hour',
        'ninth-hour': 'Ninth Hour'
    };

    const officeLabel = OFFICE_LABELS[officeKey];
    if (!officeLabel) {
        return resolved;
    }

    const weekdayTheme =
        resolved.weekdayTheme === 'St. John the Baptist'
            ? 'St. John the Baptist and the Prophets'
            : (resolved.weekdayTheme || null);

    const themeSentence = weekdayTheme
        ? ` Weekday theme: ${weekdayTheme}.`
        : '';

    const weekdayName =
    Number.isInteger(dayOfWeek) && dayOfWeek >= 0 && dayOfWeek <= 6
        ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
        : null;

    return {
        ...resolved,
        key: 'troparion-of-the-day',
        label: 'Troparion / Apolytikion',
        text:
            `(${officeLabel}` +
            (weekdayName ? ` — ${weekdayName}` : '') +
            (typeof resolved.tone === 'number' ? `, Tone ${resolved.tone}. ` : '. ') +
            `The appointed Menaion troparion is for ${resolved.commemoration || 'the day’s commemoration'}, ` +
            `but the text is not yet available in the imported corpus.` +
            themeSentence +
            `)`
    };
}
    function _resolveLittleHourFestalTheotokionRubric(officeKey, troparionItem, fallbackRubric) {
        if (
            !troparionItem ||
            troparionItem.resolvedAs !== 'menaion-feast-troparion'
        ) {
            return fallbackRubric;
        }

        const OFFICE_CONFIG = {
            'first-hour': {
                key:   'first-hour-theotokion',
                label: 'Theotokion of the First Hour',
                text:
                    'When a qualifying feast provides the troparion of the day, the ordinary Theotokion of the First Hour is displaced by the proper festal Theotokion or other festal appointment.',
                resolvedAs: 'little-hour-feast-theotokion-rubric'
            },

            'third-hour': {
                key:   'third-hour-theotokion',
                label: 'Theotokion of the Third Hour',
                text:
                    'When a qualifying feast provides the troparion of the day, the ordinary Theotokion of the Third Hour is displaced by the proper festal Theotokion or other festal appointment.',
                resolvedAs: 'little-hour-feast-theotokion-rubric'
            },

            'sixth-hour': {
                key:   'sixth-hour-theotokion',
                label: 'Theotokion of the Sixth Hour',
                text:
                    'When a qualifying feast provides the troparion of the day, the ordinary Theotokion of the Sixth Hour is displaced by the proper festal Theotokion or other festal appointment.',
                resolvedAs: 'little-hour-feast-theotokion-rubric'
            },

            'ninth-hour': {
                key:   'ninth-hour-theotokion',
                label: 'Theotokion of the Ninth Hour',
                text:
                    'When a qualifying feast provides the troparion of the day, the ordinary Theotokion of the Ninth Hour is displaced by the proper festal Theotokion or other festal appointment.',
                resolvedAs: 'little-hour-feast-theotokion-rubric'
            }
        };

        const config = OFFICE_CONFIG[officeKey];
        if (!config) {
            return fallbackRubric;
        }

        return {
            type:          'rubric',
            key:           config.key,
            label:         config.label,
            text:          config.text,
            resolvedAs:    config.resolvedAs,
            overrideType:  'menaion-troparion',
            officeKey:     officeKey,
            source:        'Menaion',
            commemoration: troparionItem.commemoration || null,
            governingTone: troparionItem.governingTone || troparionItem.tone || null,
            rank:          typeof troparionItem.rank === 'number' ? troparionItem.rank : null
        };
    }

    async function _resolveLittleHourSeasonalTroparionSlot(officeKey, dayOfWeek, dateObj, toneResult) {
        // v6.8: Holy Week pre-emption — must run before Menaion feast arbitration.
        // During Holy Week the Triodion/Holy Week overlay governs the troparion for
        // all offices; no Menaion rank (including rank 1–4) displaces the Holy Week text.
        const _hwSeasonCheck = _computeLiturgicalSeason(dateObj, toneResult);
        if (_hwSeasonCheck && _hwSeasonCheck.season === 'holy-week') {
            const _hwDay = _hwSeasonCheck.holyWeekDay;
            await _loadHolyWeekData();
            const _hwResolved = _resolveHolyWeekText('troparion-or-apolytikion', _hwDay);
            if (_hwResolved) {
                return Object.assign({}, _hwResolved, { key: 'troparion-of-the-day' });
            }
            // No text in corpus for this slot/day — return honest Holy Week rubric.
            return {
                type:       'rubric',
                key:        'troparion-of-the-day',
                label:      'Troparion of the Day',
                text:       `Holy Week (${_hwDay}): the appointed troparion is from the Triodion. Text not yet available in corpus.`,
                resolvedAs: 'holy-week-troparion-rubric',
                holyWeekDay: _hwDay
            };
        }

        let resolved = await _resolveLittleHourTroparionSlot(dayOfWeek, toneResult, dateObj);

        // Feast override always wins (outside Holy Week).
        if (resolved && resolved.resolvedAs === 'menaion-feast-troparion') {
            return resolved;
        }

        const seasonResult = _computeLiturgicalSeason(dateObj, toneResult);
        const isGreatLentWeekday =
            seasonResult &&
            seasonResult.season === 'great-lent' &&
            dayOfWeek >= 1 &&
            dayOfWeek <= 5;

        // Only displace the ordinary non-feast weekday fallback path.
        if (
            isGreatLentWeekday &&
            resolved &&
            resolved.resolvedAs === 'weekday-theme-rubric'
        ) {
            const OFFICE_LABELS = {
                'first-hour': 'First Hour',
                'third-hour': 'Third Hour',
                'sixth-hour': 'Sixth Hour',
                'ninth-hour': 'Ninth Hour'
            };

            const WEEKDAY_NAMES = {
                1: 'monday',
                2: 'tuesday',
                3: 'wednesday',
                4: 'thursday',
                5: 'friday'
            };

            const officeLabel = OFFICE_LABELS[officeKey] || 'Little Hour';

            // v5.0: Attempt Triodion text resolution before falling back to rubric.
            // Feast arbitration has already run above and found nothing qualifying.
            // _resolveTriodionTroparion returns null if the week is not yet in corpus.
            const triodionResolved = _resolveTriodionTroparion(dateObj, dayOfWeek, officeKey);
            if (triodionResolved) {
                return triodionResolved;
            }

            // Triodion text not available for this week — emit truthful placeholder.
            return {
                type:         'rubric',
                key:          'troparion-of-the-day',
                label:        'Troparion of the Day',
                text:
                    `On Great Lent weekdays, the seasonal troparion appointment for the ${officeLabel} belongs here. ` +
                    `The ordinary baseline troparion-of-the-day path is displaced by the season. ` +
                    `Triodion text for this week is not yet available in the corpus.`,
                resolvedAs:   'little-hour-lenten-rubric',
                overrideType: 'seasonal-lent',
                season:       'great-lent',
                officeKey:    officeKey,
                weekday:      WEEKDAY_NAMES[dayOfWeek] || null
            };
        }

        resolved = _normalizeUnavailableTroparionFallbackForOffice(officeKey, resolved);
        return _normalizeOrdinaryTroparionFallbackForOffice(officeKey, resolved, dayOfWeek);
    }
    // ──────────────────────────────────────────────────────────────────────
    // ──────────────────────────────────────────────────────────────────────
    // v1.3 → v1.x: _getOrthodoxPascha(gregorianYear)
    //
    // Formerly a self-contained Meeus Julian Paschalion implementation.
    // Now delegated to window.ByzantinePaschalion (js/byzantine-paschalion.js),
    // which is the single source of truth for Orthodox Pascha computation.
    // Cache is owned by ByzantinePaschalion; no local _paschaCache needed.
    // ──────────────────────────────────────────────────────────────────────
    function _getOrthodoxPascha(gregorianYear) {
        return window.ByzantinePaschalion.getOrthodoxPascha(gregorianYear);
    }


    // ──────────────────────────────────────────────────────────────────────
    // v1.3: _computeBaselineTone(dateObj)
    //
    // BASELINE TONE RULE — determines the Octoechos tone (1–8) for a given
    // date by counting weeks from Thomas Sunday.
    //
    // RULE:
    //   1. Compute Orthodox Pascha (P) for the current liturgical year.
    //      The liturgical year that contains 'date' starts after the previous
    //      Pascha. We try the current Gregorian year first; if P > date (i.e.
    //      Pascha hasn't happened yet in the civil year), we use P of the
    //      previous year.
    //
    //   2. Thomas Sunday = P + 7 days. Tone 1 begins on Thomas Sunday.
    //
    //   3. For Saturday Vespers: the tone anticipated is the UPCOMING Sunday's
    //      tone. Saturday evening belongs liturgically to Sunday.
    //      Compute the upcoming Sunday first, then derive tone from that.
    //
    //   4. For all other days: find the most recent Thomas Sunday that is ≤
    //      the date's week-start (the Monday prior, or the current day if it's
    //      Mon–Sat). Tone = weeks elapsed since Thomas Sunday, mod 8, + 1.
    //
    //   5. Bright Week exception: dates from Pascha (inclusive) through
    //      Thomas Saturday (inclusive) are in Bright Week. During this period,
    //      the Octoechos is not used. Return { tone: null, brightWeek: true }.
    //
    // ACCURACY:
    //   This rule is liturgically correct for ordinary weeks with no feast
    //   override. Major feasts can displace the Octoechos tone; that override
    //   logic is deferred to a future feast-rank engine and is NOT attempted
    //   here. The engine labels all output from this function as
    //   'baseline-ordinary-day' to make the limitation explicit.
    //
    // Returns: { tone: number (1–8) | null, brightWeek: boolean,
    //            toneLabel: string, paschaISO: string }
    // ──────────────────────────────────────────────────────────────────────
    function _computeBaselineTone(dateObj) {
        const localDate = new Date(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate()
        );

        // Step 1: find the Pascha that precedes (or equals) localDate.
        // Try current year first; if that year's Pascha is after localDate,
        // fall back to previous year.
        const year = localDate.getFullYear();
        let pascha = _getOrthodoxPascha(year);
        if (pascha > localDate) pascha = _getOrthodoxPascha(year - 1);

        // Step 2: Thomas Sunday = Pascha + 7
        const thomasSunday = new Date(pascha.getFullYear(), pascha.getMonth(), pascha.getDate() + 7);

        // Step 3: Bright Week check (Pascha through Thomas Saturday = Pascha+6)
        const brightWeekEnd = new Date(pascha.getFullYear(), pascha.getMonth(), pascha.getDate() + 6); // Saturday before Thomas
        if (localDate >= pascha && localDate <= brightWeekEnd) {
            return {
                tone:      null,
                brightWeek: true,
                toneLabel:  'Bright Week (Paschal Tone)',
                paschaISO:  _formatLocalISODate(pascha)
            };
        }

        // Step 4: For Saturday, the liturgical day is Sunday (next day).
        // Use the upcoming Sunday date to compute the tone.
        let toneDate = localDate;
        if (localDate.getDay() === 6) {
            toneDate = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate() + 1);
        }

        // Step 5: Find the Sunday of toneDate's week (go back to Sunday).
        const dayOfWeek   = toneDate.getDay(); // 0 = Sunday
        const weekSunday  = new Date(toneDate.getFullYear(), toneDate.getMonth(), toneDate.getDate() - dayOfWeek);

        // Step 6: Count whole weeks from Thomas Sunday to weekSunday.
        const msPerDay    = 86400000;
        const dayDiff     = Math.round((weekSunday.getTime() - thomasSunday.getTime()) / msPerDay);
        const weekCount   = Math.floor(dayDiff / 7);

        // Step 7: Tone = (weekCount mod 8) + 1. Handle negative (pre-Thomas weeks)
        // by using the JS modulo pattern that handles negatives correctly.
        const toneIndex = ((weekCount % 8) + 8) % 8; // 0–7
        const tone      = toneIndex + 1;              // 1–8

        return {
            tone,
            brightWeek: false,
            toneLabel:  `Tone ${tone}`,
            paschaISO:  _formatLocalISODate(pascha)
        };
    }


    // ──────────────────────────────────────────────────────────────────────
    // v1.2: _loadVespersProkeimena()
    //
    // Fetches and caches the weekday prokeimenon table from
    // data/horologion/vespers-prokeimena.json.
    //
    // Builds _prokeimenaByDay: a 7-element array indexed by JS Date.getDay()
    // (0 = Sunday … 6 = Saturday) for O(1) lookup at render time.
    //
    // Non-throwing: on network/parse failure, logs a warning and leaves
    // _prokeimenaByDay null. resolveOffice() detects null and leaves the
    // prokeimenon slot as a placeholder — correct degradation behaviour.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadVespersProkeimena() {
        if (_prokeimenaByDay !== null) return; // already loaded or attempted

        try {
            const response = await fetch(PROKEIMENA_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load prokeimena (HTTP ${response.status}); prokeimenon slot will remain as placeholder.`);
                return;
            }
            const data = await response.json();
            const entries = Array.isArray(data.prokeimena) ? data.prokeimena : [];

            const byDay = new Array(7).fill(null);
            for (const entry of entries) {
                const idx = entry.weekdayIndex;
                if (typeof idx === 'number' && idx >= 0 && idx <= 6) {
                    byDay[idx] = entry;
                }
            }
            _prokeimenaByDay = byDay;
            console.log('[HorologionEngine] Loaded vespers prokeimena table (7 weekday entries).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadVespersProkeimena failed:', err.message, '— prokeimenon slot will remain as placeholder.');
            // _prokeimenaByDay remains null; next call will retry
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v1.3: _loadOctoechosData()
    //
    // Fetches and caches the Octoechos Vespers data from
    // data/horologion/octoechos-vespers.json.
    //
    // Non-throwing: on failure, logs a warning and leaves _octoechosData null.
    // The resolver degrades gracefully — stichera and aposticha slots remain
    // as placeholders rather than failing silently or fabricating content.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadOctoechosData() {
        if (_octoechosData !== null) return; // already loaded or attempted

        try {
            const response = await fetch(OCTOECHOS_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load Octoechos data (HTTP ${response.status}); stichera/aposticha slots will remain as placeholders.`);
                return;
            }
            _octoechosData = await response.json();
            console.log('[HorologionEngine] Loaded Octoechos Vespers data (tones 1–8).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadOctoechosData failed:', err.message, '— stichera/aposticha slots will remain as placeholders.');
            // _octoechosData remains null; next call will retry
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v1.5: _loadKathismaData()
    //
    // Fetches and caches the Vespers kathisma appointment table from
    // data/horologion/vespers-kathisma.json.
    //
    // Non-throwing: on failure, logs a warning and leaves _kathismaData null.
    // The resolver degrades gracefully — the kathisma-reading slot remains
    // as a placeholder rather than failing or fabricating content.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadKathismaData() {
        if (_kathismaData !== null) return; // already loaded or attempted

        try {
            const response = await fetch(KATHISMA_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load kathisma data (HTTP ${response.status}); kathisma-reading slot will remain as placeholder.`);
                return;
            }
            _kathismaData = await response.json();
            console.log('[HorologionEngine] Loaded Vespers kathisma appointment table (Mon–Sat ordinary).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadKathismaData failed:', err.message, '— kathisma-reading slot will remain as placeholder.');
            // _kathismaData remains null; next call will retry
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v5.5: _loadKathismaFullTextData()
    //
    // Fetches and caches the full psalm text corpus for the six kathismata
    // appointed at ordinary weekday Vespers.
    //
    // Non-throwing: on failure, leaves _kathismaFullTextData null.
    // _resolveKathismaSlot degrades to the existing rubric appointment output.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadKathismaFullTextData() {
        if (_kathismaFullTextData !== null) return;

        try {
            const response = await fetch(KATHISMA_FULL_TEXT_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load kathisma full text (HTTP ${response.status}); kathisma-reading will fall back to rubric output.`);
                return;
            }
            _kathismaFullTextData = await response.json();
            console.log('[HorologionEngine] Loaded kathisma full psalm text corpus (kathismata 1, 4, 6, 8, 10, 12).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadKathismaFullTextData failed:', err.message, '— kathisma-reading will fall back to rubric output.');
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v5.5: _resolveKathismaFullText(kathismaNumber, title, psalmsLxx)
    //
    // Returns a type:'kathisma' item with full stasis-organized psalm text,
    // or null if the corpus does not cover this kathisma number.
    // Non-throwing.
    // ──────────────────────────────────────────────────────────────────────
    function _resolveKathismaFullText(kathismaNumber, title, psalmsLxx) {
        try {
            if (!_kathismaFullTextData || !_kathismaFullTextData.kathismata) return null;
            const kathismaData = _kathismaFullTextData.kathismata[String(kathismaNumber)];
            if (!kathismaData || !Array.isArray(kathismaData.stases) || kathismaData.stases.length === 0) return null;
            return {
                type:           'kathisma',
                key:            'kathisma-reading',
                label:          `Kathisma ${kathismaNumber} — ${title}`,
                kathismaNumber: kathismaNumber,
                psalmsLxx:      psalmsLxx,
                stases:         kathismaData.stases,
                source:         'Psalter (OCA/Antiochian English)',
                resolvedAs:     'ordinary-weekday-full-text'
            };
        } catch (err) {
            console.warn('[HorologionEngine] _resolveKathismaFullText failed:', err.message);
            return null;
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v1.5: _resolveKathismaSlot(dayOfWeek, brightWeek)
    //
    // Returns a resolved item for the kathisma-reading slot, or null if
    // the data file has not loaded (graceful degradation to placeholder).
    //
    // dayOfWeek: JS Date.getDay() value (0 = Sunday … 6 = Saturday)
    // brightWeek: boolean — true during Pascha–Thomas Saturday
    //
    // RULE: Standard Byzantine Psalter weekly cycle for ordinary Vespers.
    //   Assignments (LXX psalm numbers):
    //     Monday    → Kathisma  4 (Ps 24–31)
    //     Tuesday   → Kathisma  6 (Ps 37–45)
    //     Wednesday → Kathisma  8 (Ps 55–63)
    //     Thursday  → Kathisma 10 (Ps 70–76)
    //     Friday    → Kathisma 12 (Ps 85–90, 92)
    //     Saturday  → Kathisma  1 (Ps 1–8)  [Saturday Great Vespers]
    //     Sunday    → explicitly deferred (see below)
    //
    // BRIGHT WEEK: No kathisma is read during Bright Week. The Paschal Canon
    //   replaces the Psalter. A rubric stating this is returned.
    //
    // SUNDAY: Practice varies significantly between Great Vespers (vigil)
    //   usage and ordinary Sunday small Vespers. Not safely resolvable with
    //   a single rule. A rubric with an honest deferral note is returned.
    //
    // OVERRIDES NOT IMPLEMENTED (stated openly, not silently absent):
    //   - Great Feasts: kathisma typically omitted or replaced
    //   - Great Lent: different weekly Psalter distribution
    //   - Feast-rank engine: deferred to a future pass
    //
    // FULL TEXT: This pass returns the kathisma appointment (number, title,
    //   psalm citation, incipit) as a rubric. Embedding full psalm text for
    //   each kathisma is a separate data-import task; it is deferred.
    //
    // Returns: a resolved item object (type:'rubric'), or null on data failure.
    // ──────────────────────────────────────────────────────────────────────
    function _resolveKathismaSlot(dayOfWeek, brightWeek, isGreatLent) {
        // If data file failed to load, degrade to placeholder.
        if (_kathismaData === null) return null;

        const assignments = _kathismaData.assignments;
        if (!Array.isArray(assignments)) return null;

        // ── Bright Week: no kathisma ──────────────────────────────────────
        if (brightWeek) {
            return {
                type:       'rubric',
                key:        'kathisma-reading',
                label:      'Kathisma',
                text:       '(Bright Week — no Kathisma. During Bright Week (Pascha Sunday through Thomas Saturday) the Paschal Canon is sung in place of the Psalter. The Kathisma is not read.)',
                resolvedAs: 'bright-week-no-kathisma'
            };
        }

        // Find the assignment for this weekday (weekdayIndex matches getDay())
        const assignment = assignments.find(a => a.weekdayIndex === dayOfWeek);
        if (!assignment) return null;

        // ── Sunday Small Vespers: kathisma rubric ─────────────────────────
        // At Sunday Small Vespers (the brief evening office on Sunday itself),
        // the kathisma is ordinarily omitted. Kathisma 1 ("Blessed is the man")
        // is read at Saturday Great Vespers (all-night vigil), not here.
        // This rubric encodes the ordinary practice honestly without fabrication.
        if (assignment.sunday_deferred) {
            return {
                type:       'rubric',
                key:        'kathisma-reading',
                label:      'Kathisma',
                text:       '(Sunday Small Vespers — Kathisma: at ordinary Sunday Small Vespers, ' +
                            'the kathisma is omitted. Kathisma 1 ("Blessed is the man...") ' +
                            'is appointed at Saturday Great Vespers (the all-night vigil), ' +
                            'not at Sunday Small Vespers. If celebrating Sunday Great Vespers ' +
                            'as a vigil, Kathisma 1 should be read at this point. ' +
                            'Great Lent and festal overrides are not implemented; ' +
                            'this rubric reflects ordinary Sunday Small Vespers practice only.)',
                resolvedAs: 'sunday-small-vespers-kathisma-ordinary-omitted'
            };
        }

        // ── Ordinary weekday: full text when available, rubric fallback ───
        // v5.5: Full psalm text returned on ordinary (non-Lenten) days.
        // Great Lent uses a different Psalter distribution; the ordinary
        // cycle assignment is liturgically inapplicable during Lent.
        const k = assignment.kathismaNumber;
        const title = assignment.title;
        const psalmsLxx = assignment.psalms_lxx;
        const psalmsProt = assignment.psalms_heb_protestant;
        const incipit = assignment.incipit;

        if (!isGreatLent) {
            const fullTextResolved = _resolveKathismaFullText(k, title, psalmsLxx);
            if (fullTextResolved) {
                fullTextResolved.weekday = assignment.weekday;
                if (assignment.variant_note) {
                    fullTextResolved.variantNote = assignment.variant_note;
                }
                return fullTextResolved;
            }
        }

        // Fallback: rubric appointment output.
        // Used during Great Lent and when full-text corpus fails to load.
        const lentenNote = isGreatLent
            ? `(GREAT LENT — the ordinary weekday Psalter cycle is not in use. ` +
              `During Great Lent the entire Psalter is read twice weekly; ` +
              `the specific kathisma appointments differ from the ordinary cycle. ` +
              `Lenten Psalter distribution is not yet implemented in this engine.)`
            : `(BASELINE — ordinary weekday weekly cycle only. ` +
              `Great Feast and Great Lent kathisma overrides are not yet implemented. ` +
              `Full psalm text corpus not yet loaded.)`;

        let text = `${assignment.rubric}\n\n` +
            `Incipit: "${incipit}"\n\n` +
            `(LXX Psalm numbers used throughout, as per Byzantine liturgical practice. ` +
            `Protestant/Hebrew equivalents: Psalms ${psalmsProt}.)\n\n` +
            lentenNote;

        // Append variant note for Friday if present
        if (assignment.variant_note) {
            text += `\n\n(${assignment.variant_note})`;
        }

        return {
            type:           'rubric',
            key:            'kathisma-reading',
            label:          `Kathisma ${k} — ${title}`,
            text:           text,
            kathismaNumber: k,
            psalmsLxx:      psalmsLxx,
            weekday:        assignment.weekday,
            resolvedAs:     isGreatLent ? 'great-lent-ordinary-cycle-inapplicable' : 'ordinary-weekday-baseline'
        };
    }


    // ──────────────────────────────────────────────────────────────────────
    // v1.6: _loadTroparionData()
    //
    // Fetches and caches the Vespers troparion/apolytikion data from
    // data/horologion/vespers-troparion.json.
    //
    // Non-throwing: on failure, logs a warning and leaves _troparionData null.
    // The resolver degrades gracefully — the troparion-or-apolytikion slot
    // remains as a placeholder rather than failing or fabricating content.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadTroparionData() {
        if (_troparionData !== null) return; // already loaded or attempted

        try {
            const response = await fetch(TROPARION_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load troparion data (HTTP ${response.status}); troparion-or-apolytikion slot will remain as placeholder.`);
                return;
            }
            _troparionData = await response.json();
            console.log('[HorologionEngine] Loaded Vespers troparion data (Resurrectional Troparia, tones 1–8).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadTroparionData failed:', err.message, '— troparion-or-apolytikion slot will remain as placeholder.');
            // _troparionData remains null; next call will retry
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v1.6: _resolveTroparionSlot(dayOfWeek, toneResult)
    //
    // Returns a resolved item for the troparion-or-apolytikion slot,
    // or null if the data file has not loaded (graceful degradation).
    //
    // dayOfWeek: JS Date.getDay() value (0 = Sunday … 6 = Saturday)
    // toneResult: object from _computeBaselineTone() — { tone, brightWeek, ... }
    //
    // RULE: Resurrectional Troparion / Apolytikion of the current Octoechos tone.
    //
    // SATURDAY (Great Vespers, for Sunday):
    //   Returns the full Resurrectional Troparion text for the computed tone.
    //   These are the fixed apolytikia of the Octoechos, invariable for each tone.
    //   Source: data/horologion/vespers-troparion.json, keyed by tone number.
    //   resolvedAs: 'resurrectional-troparion-saturday'
    //
    // BRIGHT WEEK (Pascha Sunday through Thomas Saturday):
    //   Returns the Paschal Troparion ("Christ is risen from the dead...").
    //   This is a fixed text independent of tone; toneResult.brightWeek === true.
    //   resolvedAs: 'bright-week-paschal-troparion'
    //
    // WEEKDAY (Monday–Friday) ORDINARY:
    //   The weekday troparion depends on the Menaion (daily saints' calendar).
    //   No text is fabricated. Returns a tone-identified rubric stub that names
    //   the current tone and states honestly that the Menaion is required.
    //   resolvedAs: 'weekday-menaion-required'
    //
    // SUNDAY (v1.8):
    //   Full Resurrectional Troparion of the current Octoechos tone (type:'text').
    //   Same text as Saturday Great Vespers — the Octoechos apolytikion of the tone.
    //   resolvedAs: 'resurrectional-troparion-sunday'
    //
    // FESTAL OVERRIDES:
    //   Not implemented. When a Great Feast falls on any day, its proper
    //   apolytikion replaces the resurrectional troparion. This requires a
    //   feast-rank engine (Menaion + feast calendar). Deferred.
    //   The output for Saturday states this limitation explicitly.
    //
    // Returns: a resolved item object, or null on data load failure.
    // ──────────────────────────────────────────────────────────────────────
    // ── v2.1: _resolveTroparionSlot is now async ──────────────────────────
    // The weekday (Mon–Fri) branch queries MenaionResolver for a fixed-date
    // troparion. All other branches (Bright Week, Saturday, Sunday) are
    // synchronous paths wrapped in an async function — behaviour unchanged.
                     async function _resolveTroparionSlot(dayOfWeek, toneResult, dateObj) {
        // If data file failed to load, degrade to placeholder.
        if (_troparionData === null) return null;

        // ── Bright Week: Paschal Troparion replaces ordinary troparia ─────────
        if (toneResult.brightWeek) {
            const paschal = _troparionData.paschal_troparion;
            if (!paschal) return null;

            return {
                type:       'text',
                key:        'troparion-or-apolytikion',
                label:      paschal.title || 'Paschal Troparion',
                text:       paschal.text,
                source:     'Pentecostarion',
                tone:       null,
                resolvedAs: 'paschal-troparion'
            };
        }

        const tone = toneResult.tone;
        if (!tone) return null;

        let menaionResult = null;
        let overrideContext = {
            hasOverride:   false,
            rank:          null,
            governingTone: null,
            overrideType:  'none',
            appliesTo:     []
        };

        if (
            dateObj &&
            typeof window !== 'undefined' &&
            window.MenaionResolver &&
            typeof window.MenaionResolver.queryTroparion === 'function'
        ) {
            try {
                const mm   = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dd   = String(dateObj.getDate()).padStart(2, '0');
                const mmdd = `${mm}-${dd}`;

                menaionResult   = await window.MenaionResolver.queryTroparion(mmdd);
                overrideContext = _resolveFeastOverrideContext(dateObj, dayOfWeek, menaionResult);
            } catch (err) {
                console.warn('[HorologionEngine] Menaion troparion lookup failed:', err.message);
            }
        }

        // ── Sunday Small Vespers ───────────────────────────────────────────────
        if (dayOfWeek === 0) {
            if (overrideContext.hasOverride) {
                return {
                    type:               'text',
                    key:                'troparion-or-apolytikion',
                    label:              menaionResult.title || `Troparion of ${menaionResult.name || 'the Feast'}`,
                    text:               menaionResult.text,
                    source:             'Menaion',
                    tone:               overrideContext.governingTone,
                    rank:               overrideContext.rank,
                    feastName:          menaionResult.name || 'Feast of the Day',
                    commemoration:      menaionResult.name || null,
                    overrideType:       overrideContext.overrideType,
                    appliesTo:          overrideContext.appliesTo.slice(),
                    governingTone:      overrideContext.governingTone,
                    feastRankOverride:  overrideContext.rank !== null && overrideContext.rank <= 2,
                    overriddenBaseline: 'resurrectional-troparion-sunday',
                    resolvedAs:         'menaion-feast-troparion'
                };
            }

            const troparia = _troparionData.resurrectional_troparia;
            const entry = troparia && troparia[String(tone)];
            if (!entry) return null;

            return {
                type:       'text',
                key:        'troparion-or-apolytikion',
                label:      entry.title,
                text:       entry.text + '\n\n' +
                            `(BASELINE — Sunday Small Vespers, Tone ${tone}. ` +
                            `A qualifying fixed-date Menaion commemoration of rank 1–4 may displace this ` +
                            `resurrectional apolytikion. This Phase 1 arbitration is currently limited ` +
                            `to the troparion and dismissal Theotokion only.)`,
                source:     'Octoechos',
                tone,
                resolvedAs: 'resurrectional-troparion-sunday'
            };
        }

        // ── Saturday Great Vespers ─────────────────────────────────────────────
        if (dayOfWeek === 6) {
            if (overrideContext.hasOverride) {
                return {
                    type:               'text',
                    key:                'troparion-or-apolytikion',
                    label:              menaionResult.title || `Troparion of ${menaionResult.name || 'the Feast'}`,
                    text:               menaionResult.text,
                    source:             'Menaion',
                    tone:               overrideContext.governingTone,
                    rank:               overrideContext.rank,
                    feastName:          menaionResult.name || 'Feast of the Day',
                    commemoration:      menaionResult.name || null,
                    overrideType:       overrideContext.overrideType,
                    appliesTo:          overrideContext.appliesTo.slice(),
                    governingTone:      overrideContext.governingTone,
                    feastRankOverride:  overrideContext.rank !== null && overrideContext.rank <= 2,
                    overriddenBaseline: 'resurrectional-troparion-saturday',
                    resolvedAs:         'menaion-feast-troparion'
                };
            }

            const troparia = _troparionData.resurrectional_troparia;
            const entry = troparia && troparia[String(tone)];
            if (!entry) return null;

            return {
                type:       'text',
                key:        'troparion-or-apolytikion',
                label:      entry.title,
                text:       entry.text + '\n\n' +
                            `(BASELINE — Saturday Great Vespers, Tone ${tone}. ` +
                            `A qualifying fixed-date Menaion commemoration of rank 1–4 may override ` +
                            `the resurrectional troparion. This Phase 1 arbitration is currently limited ` +
                            `to the troparion and dismissal Theotokion only.)`,
                source:     'Octoechos',
                tone,
                resolvedAs: 'resurrectional-troparion-saturday'
            };
        }

        // ── Weekday Vespers (Mon–Fri) ──────────────────────────────────────────
        const weekdayMap = {
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday'
        };
        const weekdayKey = weekdayMap[dayOfWeek];
        if (!weekdayKey) return null;

        const weekdayMeta =
            (_weekdayTroparionMeta &&
             _weekdayTroparionMeta.weekday_themes &&
             _weekdayTroparionMeta.weekday_themes[weekdayKey]) ||
            _WEEKDAY_THEME_FALLBACK[weekdayKey];

        if (!weekdayMeta) return null;

        if (menaionResult && menaionResult.status === 'menaion-text-unavailable') {
            return {
                type:          'rubric',
                key:           'troparion-or-apolytikion',
                label:         'Troparion / Apolytikion',
                text:
                    `(Weekday Vespers — ${_capitalise(weekdayKey)}, Tone ${tone}. ` +
                    `The appointed Menaion troparion is for ${menaionResult.name || 'the day’s commemoration'}, ` +
                    `but the text is not yet available in the imported corpus. ` +
                    `Weekday theme: ${weekdayMeta.theme}.` +
                    (weekdayMeta.fasting_day ? ' This is a fasting day.' : '') +
                    `)`,
                tone,
                weekdayTheme:  weekdayMeta.theme_short || weekdayMeta.theme || null,
                commemoration: menaionResult.name || null,
                resolvedAs:    'menaion-text-unavailable'
            };
        }

        if (overrideContext.hasOverride) {
            return {
                type:          'text',
                key:           'troparion-or-apolytikion',
                label:         menaionResult.title || `Troparion of ${menaionResult.name || 'the Day'}`,
                text:          menaionResult.text,
                source:        'Menaion',
                tone:          overrideContext.governingTone,
                rank:          overrideContext.rank,
                commemoration: menaionResult.name || null,
                weekdayTheme:  weekdayMeta.theme_short || weekdayMeta.theme || null,
                overrideType:  'menaion-troparion',
                appliesTo:     overrideContext.appliesTo.slice(),
                governingTone: overrideContext.governingTone,
                feastRankOverride: overrideContext.rank !== null && overrideContext.rank <= 2,
                menaionName:   menaionResult.name || null,
                menaionRank:   overrideContext.rank,
                resolvedAs:    'menaion-feast-troparion'
            };
        }

        return {
            type:         'rubric',
            key:          'troparion-or-apolytikion',
            label:        'Troparion / Apolytikion',
            text:
                `(Weekday Vespers — ${_capitalise(weekdayKey)}, Tone ${tone}. ` +
                `The proper weekday troparion requires the Menaion and is not yet available here. ` +
                `The liturgical theme of this day is ${weekdayMeta.theme}.` +
                (weekdayMeta.fasting_day ? ' This is a fasting day.' : '') +
                `)`,
            tone,
            weekdayTheme: weekdayMeta.theme_short || weekdayMeta.theme || null,
            resolvedAs:   'weekday-theme-rubric'
        };
    }
    async function _loadTheotokionData() {
        if (_theotokionData !== null) return; // already loaded or attempted

        try {
            const response = await fetch(THEOTOKION_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load theotokion data (HTTP ${response.status}); theotokion-dismissal slot will remain as placeholder.`);
                return;
            }
            _theotokionData = await response.json();
            console.log('[HorologionEngine] Loaded Vespers dismissal Theotokion data (tones 1–8).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadTheotokionData failed:', err.message, '— theotokion-dismissal slot will remain as placeholder.');
            // _theotokionData remains null; next call will retry
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v1.9: _loadWeekdayTheotokionData()
    //
    // Fetches and caches the weekday Octoechos Theotokia data from
    // data/horologion/vespers-weekday-theotokion.json.
    //
    // Shape: { weekday_theotokia: { "1": { monday: {...}, ... "friday": {...} }, ... "8": {...} } }
    // 40 entries total: 8 tones × 5 weekdays (Mon–Fri).
    // Wednesday and Friday entries are Stavrotheotokia.
    //
    // Non-throwing: on failure, logs a warning and leaves _weekdayTheotokionData null.
    // The resolver degrades gracefully — the weekday theotokion-dismissal slot
    // falls back to the v1.7 tone-identified rubric stub behaviour.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadWeekdayTheotokionData() {
        if (_weekdayTheotokionData !== null) return; // already loaded or attempted

        try {
            const response = await fetch(WEEKDAY_THEOTOKION_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load weekday theotokion data (HTTP ${response.status}); weekday theotokion-dismissal will fall back to rubric stub.`);
                return;
            }
            _weekdayTheotokionData = await response.json();
            console.log('[HorologionEngine] Loaded weekday Octoechos Theotokia (tones 1–8, Mon–Fri, 40 entries).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadWeekdayTheotokionData failed:', err.message, '— weekday theotokion-dismissal will fall back to rubric stub.');
            // _weekdayTheotokionData remains null; next call will retry
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v2.0: _loadWeekdayTroparionMeta()
    //
    // Fetches and caches the weekday troparion dependency metadata from
    // data/horologion/vespers-weekday-troparion-meta.json.
    //
    // This file contains NO troparion text. It documents the weekday theme
    // schema (Mon–Fri liturgical themes) and resolution contract. It is used
    // to produce accurate weekday rubric stubs in _resolveTroparionSlot().
    //
    // Non-throwing: on failure the engine falls back to the inline
    // _WEEKDAY_THEME_FALLBACK table, which contains the same theme data.
    // The troparion rubric will still be informative even without this file.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadWeekdayTroparionMeta() {
        if (_weekdayTroparionMeta !== null) return; // already loaded or attempted

        try {
            const response = await fetch(WEEKDAY_TROPARION_META_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load weekday troparion meta (HTTP ${response.status}); falling back to inline theme table.`);
                return;
            }
            _weekdayTroparionMeta = await response.json();
            console.log('[HorologionEngine] Loaded weekday troparion meta (theme dependency contract, Mon–Fri).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadWeekdayTroparionMeta failed:', err.message, '— falling back to inline weekday theme table.');
            // _weekdayTroparionMeta remains null; inline fallback used in resolver
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // ──────────────────────────────────────────────────────────────────────
    // v3.5: _resolveTheotokionSlot(dayOfWeek, toneResult, resolvedTroparionItem)
    //
    // Returns a resolved item for the theotokion-dismissal slot.
    //
    // Phase 1 feast-rank override support:
    // If the troparion came from a qualifying Menaion feast,
    // the dismissal Theotokion follows the Menaion tone.
    // Otherwise, existing Octoechos weekday/Saturday/Sunday behavior is preserved.
    // ──────────────────────────────────────────────────────────────────────
    function _resolveTheotokionSlot(dayOfWeek, toneResult, resolvedTroparionItem) {
        if (_theotokionData === null) return null;

        if (toneResult.brightWeek) {
            return {
                type:       'rubric',
                key:        'theotokion-dismissal',
                label:      'Theotokion',
                text:       '(Bright Week — no dismissal Theotokion. During Bright Week ' +
                            '(Pascha Sunday through Thomas Saturday) the Paschal Troparion ' +
                            'itself serves as the dismissal. No separate Theotokion is sung.)',
                resolvedAs: 'bright-week-no-theotokion'
            };
        }

        const tone = toneResult.tone;
        if (!tone) return null;

        const isFeastOverride =
            resolvedTroparionItem &&
            resolvedTroparionItem.overrideType === 'menaion-troparion';

        const feastTone =
            isFeastOverride &&
            typeof resolvedTroparionItem.governingTone === 'number' &&
            resolvedTroparionItem.governingTone >= 1 &&
            resolvedTroparionItem.governingTone <= 8
                ? resolvedTroparionItem.governingTone
                : null;

        const governingTone = feastTone || tone;

        // Sunday Small Vespers
        if (dayOfWeek === 0) {
            const theotokia = _theotokionData.dismissal_theotokia;
            const entry = theotokia && theotokia[String(governingTone)];
            if (!entry) return null;

            return {
                type:       'text',
                key:        'theotokion-dismissal',
                label:      entry.title,
                text:       isFeastOverride
                    ? entry.text + '\n\n' +
                      `(FEAST-RANK OVERRIDE — dismissal Theotokion governed by the Menaion troparion tone, Tone ${governingTone}.)`
                    : entry.text,
                source:     'Octoechos',
                tone:       governingTone,
                resolvedAs: isFeastOverride ? 'menaion-feast-theotokion' : 'dismissal-theotokion-sunday'
            };
        }

        // Saturday Great Vespers
        if (dayOfWeek === 6) {
            const theotokia = _theotokionData.dismissal_theotokia;
            const entry = theotokia && theotokia[String(governingTone)];
            if (!entry) return null;

            return {
                type:       'text',
                key:        'theotokion-dismissal',
                label:      entry.title,
                text:       isFeastOverride
                    ? entry.text + '\n\n' +
                      `(FEAST-RANK OVERRIDE — dismissal Theotokion governed by the Menaion troparion tone, Tone ${governingTone}.)`
                    : entry.text + '\n\n' +
                      `(BASELINE — Saturday Great Vespers, Tone ${governingTone}. ` +
                      `A major fixed feast may alter the dismissal structure; ` +
                      `full feast-rank arbitration remains deferred outside the Phase 1 troparion/Theotokion layer.)`,
                source:     'Octoechos',
                tone:       governingTone,
                resolvedAs: isFeastOverride ? 'menaion-feast-theotokion' : 'dismissal-theotokion-saturday'
            };
        }

        // Weekday Vespers (Mon–Fri)
        const weekdayMap = {
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday'
        };
        const weekdayKey = weekdayMap[dayOfWeek];
        if (!weekdayKey) return null;

        const weekdayEntry =
            _weekdayTheotokionData &&
            _weekdayTheotokionData.weekday_theotokia &&
            _weekdayTheotokionData.weekday_theotokia[String(governingTone)] &&
            _weekdayTheotokionData.weekday_theotokia[String(governingTone)][weekdayKey];

        if (!weekdayEntry) {
            return {
                type:       'rubric',
                key:        'theotokion-dismissal',
                label:      'Theotokion',
                text:
                    isFeastOverride
                        ? `(Weekday Vespers — ${_capitalise(weekdayKey)}, Tone ${governingTone}. ` +
                          `A qualifying Menaion commemoration governs the dismissal Theotokion tone for this slot, ` +
                          `but the corresponding weekday Theotokion could not be loaded.)`
                        : `(Weekday Vespers — ${_capitalise(weekdayKey)}, Tone ${governingTone}. ` +
                          `The weekday dismissal Theotokion could not be loaded. ` +
                          `In ordinary weeks it normally follows the tone in use; in fuller implementation ` +
                          `it should track the tone of the Menaion troparion when that differs from the Octoechos.)`,
                tone:       governingTone,
                resolvedAs: isFeastOverride ? 'menaion-feast-theotokion-missing' : 'weekday-theotokion-data-missing'
            };
        }

        return {
            type:       'text',
            key:        'theotokion-dismissal',
            label:      weekdayEntry.title || 'Theotokion',
            text:       isFeastOverride
                ? weekdayEntry.text + '\n\n' +
                  `(FEAST-RANK OVERRIDE — dismissal Theotokion governed by the Menaion troparion tone, Tone ${governingTone}.)`
                : weekdayEntry.text + '\n\n' +
                  `(BASELINE — Weekday Vespers, ${_capitalise(weekdayKey)}, Tone ${governingTone}. ` +
                  `This uses the Octoechos weekday Theotokion. In full implementation, ` +
                  `the dismissal Theotokion ideally follows the tone of the Menaion troparion ` +
                  `when that differs from the weekly Octoechos tone.)`,
            source:     'Octoechos',
            tone:       governingTone,
            resolvedAs: isFeastOverride ? 'menaion-feast-theotokion' : 'weekday-octoechos-theotokion'
        };
    }
    function _capitalise(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    // ──────────────────────────────────────────────────────────────────────
    // v2.7: _computeLiturgicalSeason(dateObj, toneResult)
    //
    // Returns an object: { season: string, holyWeekDay: string|null }
    //
    // season values:
    //   'bright-week' — Pascha through Thomas Saturday
    //   'holy-week'   — Palm Sunday (P-7) through Great Saturday (P-1) inclusive
    //   'great-lent'  — Clean Monday (P-48) through Great Friday (P-2) inclusive
    //   'ordinary'    — all other dates
    //
    // holyWeekDay is set only when season === 'holy-week':
    //   'palm-sunday' | 'great-monday' | 'great-tuesday' | 'great-wednesday'
    //   | 'great-thursday' | 'great-friday' | 'great-saturday'
    //
    // Priority order: bright-week > holy-week > great-lent > ordinary.
    // (Great Lent ends at P-2; Holy Week is P-7 through P-1; ranges do not overlap.)
    // ──────────────────────────────────────────────────────────────────────
    function _computeLiturgicalSeason(dateObj, toneResult) {
        if (toneResult.brightWeek) return { season: 'bright-week', holyWeekDay: null };

        const localDate = new Date(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate()
        );

        const year = localDate.getFullYear();
const pascha = _getOrthodoxPascha(year);

        const MS_PER_DAY = 86400000;

        // Holy Week: Palm Sunday (P-7) through Great Saturday (P-1)
        const palmSunday    = new Date(pascha.getTime() - 7 * MS_PER_DAY);
        const greatSaturday = new Date(pascha.getTime() - 1 * MS_PER_DAY);

        if (localDate >= palmSunday && localDate <= greatSaturday) {
            const HOLY_WEEK_DAYS = [
                'palm-sunday',    // P-7 (Sunday)
                'great-monday',   // P-6
                'great-tuesday',  // P-5
                'great-wednesday',// P-4
                'great-thursday', // P-3
                'great-friday',   // P-2
                'great-saturday'  // P-1
            ];
            const offsetDays = Math.round(
                (localDate.getTime() - palmSunday.getTime()) / MS_PER_DAY
            );
            const holyWeekDay = HOLY_WEEK_DAYS[offsetDays] || 'holy-week-unknown';
            return { season: 'holy-week', holyWeekDay };
        }

        // Great Lent: Clean Monday (P-48) through Great Friday (P-2)
        const cleanMonday = new Date(pascha.getTime() - 48 * MS_PER_DAY);
        const greatFriday = new Date(pascha.getTime() -  2 * MS_PER_DAY);

        if (localDate >= cleanMonday && localDate <= greatFriday) {
            return { season: 'great-lent', holyWeekDay: null };
        }

        return { season: 'ordinary', holyWeekDay: null };
    }

    // ──────────────────────────────────────────────────────────────────────
    // v5.0: _loadTriodionData()
    //
    // Fetches and caches data/triodion/triodion-lenten-weekday.json.
    //
    // Shape: { lenten_weekday_troparion: { "1": { monday: { troparion: {...} }, ... } } }
    // Keyed by lent week number (outer) and weekday name (inner).
    //
    // Non-throwing: on failure, logs a warning and leaves _triodionLentenData
    // null. Callers degrade gracefully to the existing placeholder rubric.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadTriodionData() {
        if (_triodionLentenData !== null) return;

        try {
            const response = await fetch(TRIODION_LENTEN_WEEKDAY_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load Triodion lenten weekday data (HTTP ${response.status}); Lenten troparion slots will remain as rubric placeholders.`);
                return;
            }
            _triodionLentenData = await response.json();
            console.log('[HorologionEngine] Loaded Triodion lenten weekday troparion data (v5.0 demonstrator corpus).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadTriodionData failed:', err.message, '— Lenten troparion slots will remain as rubric placeholders.');
            // _triodionLentenData remains null; next call will retry
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v5.0: _resolveTriodionTroparion(dateObj, dayOfWeek, officeKey)
    //
    // Overlay dispatcher for Great Lent weekday troparion resolution.
    // Runs ONLY after feast arbitration has already failed to produce a
    // qualifying override (i.e. no menaion-feast-troparion was returned).
    //
    // Resolution:
    //   1. Compute days elapsed since Clean Monday (Pascha - 48).
    //   2. Derive lent week number (1-based integer).
    //   3. Derive weekday name string from dayOfWeek.
    //   4. Look up _triodionLentenData.lenten_weekday_troparion[week][weekday].
    //   5. If found: return a type:'text' item using the Triodion troparion.
    //   6. If not found (week not yet in corpus): return null so the caller
    //      falls through to the existing truthful placeholder rubric.
    //
    // Non-throwing. Returns null on any failure.
    //
    // Scope: Little Hours (first-hour, third-hour, sixth-hour, ninth-hour),
    //        Small Compline, Vespers weekday troparion path.
    // ──────────────────────────────────────────────────────────────────────
    function _resolveTriodionTroparion(dateObj, dayOfWeek, officeKey) {
        try {
            if (!_triodionLentenData || !_triodionLentenData.lenten_weekday_troparion) {
                return null;
            }

            // Compute Clean Monday = Pascha - 48 days
            const year        = dateObj.getFullYear();
            const pascha      = _getOrthodoxPascha(year);
            const MS_PER_DAY  = 86400000;
            const cleanMonday = new Date(pascha.getTime() - 48 * MS_PER_DAY);

            const localDate   = new Date(
                dateObj.getFullYear(),
                dateObj.getMonth(),
                dateObj.getDate()
            );

            const daysSinceCleanMonday = Math.round(
                (localDate.getTime() - cleanMonday.getTime()) / MS_PER_DAY
            );

            // daysSinceCleanMonday 0 = Clean Monday (week 1)
            // week number: 1-based, each 7 days
            const lentWeek = Math.floor(daysSinceCleanMonday / 7) + 1;

            const WEEKDAY_NAMES = {
                1: 'monday',
                2: 'tuesday',
                3: 'wednesday',
                4: 'thursday',
                5: 'friday'
            };
            const weekdayName = WEEKDAY_NAMES[dayOfWeek];

            if (!weekdayName) return null;

            const weekData = _triodionLentenData.lenten_weekday_troparion[String(lentWeek)];
            if (!weekData) {
                // Week not yet in corpus — degrade honestly
                return null;
            }

            const dayData = weekData[weekdayName];
            if (!dayData || !dayData.troparion || !dayData.troparion.text) {
                return null;
            }

            const t = dayData.troparion;

            return {
                type:       'text',
                key:        'troparion-of-the-day',
                label:      t.label || 'Triodion Troparion',
                text:       t.text,
                source:     t.source || 'Triodion',
                tone:       typeof t.tone === 'number' ? t.tone : null,
                resolvedAs: 'triodion-lenten-troparion',
                overrideType: 'seasonal-lent',
                season:     'great-lent',
                lentWeek:   lentWeek,
                weekday:    weekdayName,
                officeKey:  officeKey
            };
        } catch (err) {
            console.warn('[HorologionEngine] _resolveTriodionTroparion failed:', err.message);
            return null;
        }
    }




    // ──────────────────────────────────────────────────────────────────────
    // v5.1: _loadHolyWeekData()
    //
    // Fetches and caches data/triodion/holy-week/holy-week.json.
    //
    // Shape: { holy_week: { "palm-sunday": { slots: { "troparion-or-apolytikion": {...} } }, ... } }
    // Keyed by holyWeekDay string matching _computeLiturgicalSeason().holyWeekDay.
    //
    // Non-throwing: on failure, logs a warning and leaves _holyWeekData null.
    // All callers degrade gracefully to _buildHolyWeekRubric() on null.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadHolyWeekData() {
        if (_holyWeekData !== null) return;

        try {
            const response = await fetch(HOLY_WEEK_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load Holy Week data (HTTP ${response.status}); Holy Week slots will remain as rubric placeholders.`);
                return;
            }
            _holyWeekData = await response.json();
            console.log('[HorologionEngine] Loaded Holy Week text overlay data (v5.1).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadHolyWeekData failed:', err.message, '— Holy Week slots will remain as rubric placeholders.');
            // _holyWeekData remains null; next call will retry
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v5.1: _resolveHolyWeekText(slotKey, holyWeekDay)
    //
    // Looks up a resolved text item for a Holy Week slot from the corpus.
    // Returns a type:'text' item if corpus data exists for this day + slot,
    // or null if not present (caller falls through to _buildHolyWeekRubric).
    //
    // slotKey:     slot key string ('troparion-or-apolytikion', etc.)
    // holyWeekDay: Holy Week day string from _computeLiturgicalSeason()
    //
    // Non-throwing. Returns null on any failure.
    //
    // Scope: Vespers — troparion-or-apolytikion slot only in v5.1.
    //   All other slots not yet in corpus; null returned for those, causing
    //   the caller to fall through to the existing honest rubric placeholder.
    // ──────────────────────────────────────────────────────────────────────
    function _resolveHolyWeekText(slotKey, holyWeekDay) {
        try {
            if (!_holyWeekData || !_holyWeekData.holy_week) return null;

            const dayData = _holyWeekData.holy_week[holyWeekDay];
            if (!dayData || !dayData.slots) return null;

            const slotData = dayData.slots[slotKey];
            if (!slotData || !slotData.text || slotData.type !== 'text') return null;

            return {
                type:        slotData.type,
                key:         slotKey,
                label:       slotData.label || slotKey,
                text:        slotData.text,
                tone:        typeof slotData.tone === 'number' ? slotData.tone : null,
                source:      slotData.source || 'Triodion',
                resolvedAs:  slotData.resolvedAs || 'holy-week-text',
                holyWeekDay: holyWeekDay
            };
        } catch (err) {
            console.warn('[HorologionEngine] _resolveHolyWeekText failed:', err.message);
            return null;
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v5.2: _loadPentecostarionData()
    //
    // Fetches and caches data/pentecostarion/pentecostarion-bright-week.json.
    //
    // Shape: { bright_week: { "stichera-at-lord-i-have-cried": {...}, "aposticha": {...} } }
    //
    // Non-throwing: on failure, logs a warning and leaves _pentecostarionData null.
    // Callers degrade gracefully to the existing Bright Week rubric on null.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadPentecostarionData() {
        if (_pentecostarionData !== null) return;

        try {
            const response = await fetch(PENTECOSTARION_BRIGHT_WEEK_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load Pentecostarion Bright Week data (HTTP ${response.status}); Bright Week stichera/aposticha will remain as rubric placeholders.`);
                return;
            }
            _pentecostarionData = await response.json();
            console.log('[HorologionEngine] Loaded Pentecostarion Bright Week text overlay data (v5.2).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadPentecostarionData failed:', err.message, '— Bright Week stichera/aposticha will remain as rubric placeholders.');
            // _pentecostarionData remains null; next call will retry
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v5.2: _resolvePentecostarionText(slotKey)
    //
    // Looks up a resolved text item for a Bright Week Vespers slot.
    // Returns a type:'text' item if corpus data exists for this slot,
    // or null if not present (caller keeps existing rubric output).
    //
    // slotKey: 'stichera-at-lord-i-have-cried' | 'aposticha'
    //
    // Non-throwing. Returns null on any failure.
    //
    // Only called when toneResult.brightWeek === true (Pascha through Thomas Sat).
    // Does not affect any other seasonal path.
    // ──────────────────────────────────────────────────────────────────────
    function _resolvePentecostarionText(slotKey) {
        try {
            if (!_pentecostarionData || !_pentecostarionData.bright_week) return null;

            const slotData = _pentecostarionData.bright_week[slotKey];
            if (!slotData || !slotData.text || slotData.type !== 'text') return null;

            return {
                type:       slotData.type,
                key:        slotKey,
                label:      slotData.label || slotKey,
                text:       slotData.text,
                source:     slotData.source || 'Pentecostarion',
                resolvedAs: slotData.resolvedAs || 'bright-week-pentecostarion'
            };
        } catch (err) {
            console.warn('[HorologionEngine] _resolvePentecostarionText failed:', err.message);
            return null;
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v3.0: _loadComplineFixedData()
    //
    // Fetches and caches data/horologion/compline-fixed.json.
    // Non-throwing: on failure, logs a warning and leaves _complineFixedData
    // null. Fixed slots degrade to visible placeholder boxes rather than
    // failing silently.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadComplineFixedData() {
        if (_complineFixedData !== null) return;

        try {
            const response = await fetch(COMPLINE_FIXED_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load compline fixed data (HTTP ${response.status}); fixed slots will remain as placeholders.`);
                return;
            }
            _complineFixedData = await response.json();
            console.log('[HorologionEngine] Loaded Small Compline fixed text data.');
        } catch (err) {
            console.warn('[HorologionEngine] _loadComplineFixedData failed:', err.message, '— fixed slots will remain as placeholders.');
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // v3.0: _resolveComplineSlots(sections, dateObj)
    //
    // Slot resolution pass for Small Compline.
    //
    // Fixed slots resolved from compline-fixed.json:
    //   usual-beginning, psalm-50, psalm-69, psalm-142, doxology, creed,
    //   trisagion-prayers, compline-theotokion, prayer-of-basil, into-thy-hands
    //
    // Variable slot (troparion-of-the-day): resolved via the existing
    // _resolveTroparionSlot() infrastructure. Key is renamed from
    // 'troparion-or-apolytikion' to 'troparion-of-the-day' for correct
    // diagnostic labelling. All fallback paths (weekday-theme rubric,
    // Resurrectional Troparion, Paschal Troparion) are inherited unchanged.
    //
    // Non-throwing. On data file failure, fixed slots remain as placeholders.
    // ──────────────────────────────────────────────────────────────────────
    // ──────────────────────────────────────────────────────────────────────
    // v3.9: _resolveComplineSeasonalTroparionSlot(dayOfWeek, dateObj, toneResult)
    //
    // Small Compline seasonal override layer (Phase 4B).
    //
    // Precedence:
    //   1. existing qualifying feast behaviour already resolved through
    //      _resolveTroparionSlot()
    //   2. Great Lent weekday seasonal rubric override
    //   3. existing ordinary fallback behaviour
    //
    // Scope in this phase:
    //   - small-compline
    //   - troparion-of-the-day
    //   - Great Lent weekdays only (Mon–Fri)
    //
    // This helper does not author Triodion text. It returns a truthful rubric
    // item when the current Small Compline path would otherwise fall through
    // to the ordinary non-feast weekday rubric path.
    // ──────────────────────────────────────────────────────────────────────
    async function _resolveComplineSeasonalTroparionSlot(dayOfWeek, dateObj, toneResult) {
    let resolved = await _resolveTroparionSlot(dayOfWeek, toneResult, dateObj);

    // Preserve any existing feast-winning behaviour.
    if (resolved && resolved.resolvedAs === 'menaion-feast-troparion') {
        return resolved;
    }

    const seasonResult = _computeLiturgicalSeason(dateObj, toneResult);
    const isGreatLentWeekday =
        seasonResult &&
        seasonResult.season === 'great-lent' &&
        dayOfWeek >= 1 &&
        dayOfWeek <= 5;

    // Only displace the ordinary non-feast weekday fallback path.
    if (
        isGreatLentWeekday &&
        resolved &&
        resolved.resolvedAs === 'weekday-theme-rubric'
    ) {
        const WEEKDAY_NAMES = {
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday'
        };

        // v5.0: Attempt Triodion text resolution before falling back to rubric.
        // Feast arbitration has already run above and found nothing qualifying.
        const triodionResolved = _resolveTriodionTroparion(dateObj, dayOfWeek, 'small-compline');
        if (triodionResolved) {
            return triodionResolved;
        }

        // Triodion text not available for this week — emit truthful placeholder.
        return {
            type:         'rubric',
            key:          'troparion-of-the-day',
            label:        'Troparion of the Day',
            text:         'On Great Lent weekdays, the seasonal troparion appointment for Small Compline belongs here. The ordinary baseline troparion-of-the-day path is displaced by the season. Triodion text for this week is not yet available in the corpus.',
            resolvedAs:   'compline-lenten-rubric',
            overrideType: 'seasonal-lent',
            season:       'great-lent',
            officeKey:    'small-compline',
            weekday:      WEEKDAY_NAMES[dayOfWeek] || null,
            source:       'Seasonal'
        };
    }

    resolved = _normalizeUnavailableTroparionFallbackForOffice('small-compline', resolved);
    return _normalizeOrdinaryTroparionFallbackForOffice('small-compline', resolved, dayOfWeek);
}

// ──────────────────────────────────────────────────────────────────────
// v4.4: _resolveComplineFestalTheotokionRubric(officeKey, troparionItem, fallbackRubric)
//
// Small Compline festal Theotokion rubric arbitration.
//
// Precedence:
//   1. feast troparion override already governs the office
//   2. this helper displaces the ordinary Compline Theotokion rubric
//   3. otherwise the normalized ordinary fallback rubric remains unchanged
//
// Scope:
//   - small-compline
//   - Theotokion branch only
//
// Non-throwing.
// ──────────────────────────────────────────────────────────────────────
function _resolveComplineFestalTheotokionRubric(officeKey, troparionItem, fallbackRubric) {
    if (
        !troparionItem ||
        troparionItem.resolvedAs !== 'menaion-feast-troparion'
    ) {
        return fallbackRubric;
    }

    return {
        type:          'rubric',
        key:           'compline-theotokion',
        label:         'Theotokion of Compline',
        text:          'On a qualifying feast, the proper Theotokion appointment for Small Compline follows the festal office. The ordinary Compline Theotokion rubric is displaced here. Full festal text is not yet available in this path.',
        resolvedAs:    'compline-feast-theotokion-rubric',
        overrideType:  'menaion-troparion',
        officeKey:     'small-compline',
        source:        'Menaion',
        commemoration: troparionItem.commemoration || null,
        governingTone: troparionItem.governingTone || troparionItem.tone || null,
        rank:          troparionItem.rank || null
    };
}
 // ── v5.6: Orthros (Matins) fixed-text loader ──────────────────────────
    async function _loadOrthrosFixedData() {
        if (_orthrosFixedData !== null) return;

        try {
            const response = await fetch(ORTHROS_FIXED_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load Orthros fixed data (HTTP ${response.status}); fixed slots will remain as placeholders.`);
                return;
            }
            _orthrosFixedData = await response.json();
            console.log('[HorologionEngine] Loaded Orthros fixed text data.');
        } catch (err) {
            console.warn('[HorologionEngine] _loadOrthrosFixedData failed:', err.message, '— fixed slots will remain as placeholders.');
        }
    }
    // ──────────────────────────────────────────────────────────────────────
    // v5.7: _loadOrthrosKathismaData()
    //
    // Fetches and caches the Orthros kathisma appointment table from
    // data/horologion/orthros-kathisma.json.
    //
    // Non-throwing: on failure, leaves _orthrosKathismaData null.
    // The resolver degrades to honest rubric stubs without crashing.
    // ──────────────────────────────────────────────────────────────────────
    async function _loadOrthrosKathismaData() {
        if (_orthrosKathismaData !== null) return;

        try {
            const response = await fetch(ORTHROS_KATHISMA_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load Orthros kathisma table (HTTP ${response.status}); kathisma slots will degrade to appointment rubrics.`);
                return;
            }
            _orthrosKathismaData = await response.json();
            console.log('[HorologionEngine] Loaded Orthros kathisma appointment table (Mon–Sat ordinary).');
        } catch (err) {
            console.warn('[HorologionEngine] _loadOrthrosKathismaData failed:', err.message, '— kathisma slots will degrade to appointment rubrics.');
        }
    }


    // ──────────────────────────────────────────────────────────────────────
    // v5.7: _resolveOrthrosKathismaPair(slotKey, dayOfWeek, brightWeek, isGreatLent)
    //
    // Returns a resolved item for kathisma-first or kathisma-second, or null
    // if the appointment data has not loaded (graceful degradation).
    //
    // slotKey: 'kathisma-first' | 'kathisma-second'
    // dayOfWeek: JS Date.getDay() (0 = Sunday … 6 = Saturday)
    // brightWeek: boolean — true during Pascha–Thomas Saturday
    // isGreatLent: boolean — true on Great Lent weekdays (Mon–Fri)
    //
    // RULE: Standard Byzantine Psalter weekly cycle for ordinary Orthros.
    //   Each ordinary weekday reads TWO kathismata. Assignment pairs:
    //     Monday    → 4 + 5   (Ps 24–31 + Ps 32–36 LXX)
    //     Tuesday   → 6 + 7   (Ps 37–45 + Ps 46–54 LXX)
    //     Wednesday → 8 + 9   (Ps 55–63 + Ps 64–69 LXX)
    //     Thursday  → 10 + 11 (Ps 70–76 + Ps 77–84 LXX)
    //     Friday    → 12 + 13 (Ps 85–91 + Ps 92–100 LXX)
    //     Saturday  → 14 + 15 (Ps 101–108 + Ps 109–117 LXX)
    //       At Saturday All-Night Vigil, Kathisma 17 (Ps 118) is used instead.
    //     Sunday    → explicitly deferred (practice varies)
    //
    // This is wholly DIFFERENT from the Vespers kathisma cycle
    // (Kathismata 1, 4, 6, 8, 10, 12). Do not conflate these tables.
    //
    // Returns: a resolved item object (type:'rubric'), or null on data failure.
    // ──────────────────────────────────────────────────────────────────────
    function _resolveOrthrosKathismaPair(slotKey, dayOfWeek, brightWeek, isGreatLent) {
        const isFirst = slotKey === 'kathisma-first';

        // ── Bright Week: no kathisma ──────────────────────────────────────
        if (brightWeek) {
            return {
                type:       'rubric',
                key:        slotKey,
                label:      isFirst ? 'First Kathisma' : 'Second Kathisma',
                text:       '(Bright Week — no Kathisma. During Bright Week (Pascha Sunday through Thomas Saturday) the Paschal Canon replaces Psalter reading. The kathismata are not read.)',
                resolvedAs: 'orthros-bright-week-no-kathisma'
            };
        }

        // ── Great Lent: ordinary cycle inapplicable ───────────────────────
        if (isGreatLent) {
            return {
                type:       'rubric',
                key:        slotKey,
                label:      isFirst ? 'First Kathisma (Great Lent)' : 'Second Kathisma (Great Lent)',
                text:       '(GREAT LENT — the ordinary weekday Orthros kathisma cycle is not in use. ' +
                            'The Lenten Typikon prescribes reading the entire Psalter twice weekly, with a ' +
                            'substantially expanded distribution — up to three kathismata per service on ' +
                            'some days. The specific Lenten Orthros kathisma appointments are not yet ' +
                            'implemented in this engine.)',
                resolvedAs: 'orthros-great-lent-kathisma-not-implemented'
            };
        }

        // ── Sunday: deferred ─────────────────────────────────────────────
        if (dayOfWeek === 0) {
            return {
                type:       'rubric',
                key:        slotKey,
                label:      isFirst ? 'First Kathisma (Sunday)' : 'Second Kathisma (Sunday)',
                text:       '(Sunday Orthros — Kathisma: On Sundays when the Polyeleos is appointed ' +
                            '(Psalms 134–135 LXX), it replaces the ordinary Kathisma reading. ' +
                            'On other Sundays the assignment varies by local use and whether a vigil ' +
                            'was served on Saturday. Sunday Orthros kathisma is explicitly deferred ' +
                            'in this baseline.)',
                resolvedAs: 'orthros-sunday-kathisma-deferred'
            };
        }

        // ── Ordinary weekday: resolve from appointment table ──────────────
        if (_orthrosKathismaData === null) return null; // data failed to load — degrade to placeholder

        const assignments = _orthrosKathismaData.assignments;
        if (!Array.isArray(assignments)) return null;

        const assignment = assignments.find(a => a.weekdayIndex === dayOfWeek);
        if (!assignment || assignment.sunday_deferred) return null;

        const kathismaData = isFirst ? assignment.kathismaFirst : assignment.kathismaSecond;
        if (!kathismaData) return null;

        const k          = kathismaData.number;
        const title      = kathismaData.title;
        const psalmsLxx  = kathismaData.psalms_lxx;
        const psalmsProt = kathismaData.psalms_heb_protestant;
        const incipit    = kathismaData.incipit;
        const ordinal    = isFirst ? 'First' : 'Second';

        let text = `Orthros ${ordinal} Kathisma: Kathisma ${k} — ${title}\n\n` +
                   `Psalms ${psalmsLxx} (LXX)\n` +
                   `Incipit: "${incipit}"\n\n` +
                   `(LXX psalm numbers used throughout. Protestant/Hebrew equivalents: Psalms ${psalmsProt}.)\n\n` +
                   `(ORDINARY WEEKDAY — standard Byzantine Orthros weekly cycle. ` +
                   `Great Feast, Great Lent, and vigil kathisma overrides are not yet implemented. ` +
                   `Full psalm text for this kathisma is not yet embedded; read from a Psalter.)`;

        if (kathismaData.note) {
            text += `\n\n(${kathismaData.note})`;
        }
        if (dayOfWeek === 6 && assignment.saturday_note) {
            text += `\n\n(${assignment.saturday_note})`;
        }

        return {
            type:           'rubric',
            key:            slotKey,
            label:          `Kathisma ${k} — ${title}`,
            text:           text,
            kathismaNumber: k,
            psalmsLxx:      psalmsLxx,
            weekday:        assignment.weekday,
            resolvedAs:     'orthros-ordinary-weekday-kathisma-appointment'
        };
    }


    // ── v5.6 / v5.7 / v5.8: Orthros (Matins) slot resolver ──────────────
    //
    // v5.6 baseline. Resolves:
    //   Fixed slots (from orthros-fixed.json):
    //     usual-beginning, psalm-3, psalm-37, psalm-62, psalm-87, psalm-102,
    //     psalm-142, praises-psalms, great-doxology
    //   Variable slots (dynamic resolution):
    //     god-is-the-lord  — tone-aware: God is the Lord (ordinary/Sunday) or
    //                        Alleluia (Great Lent weekdays) or Paschal Troparion
    //                        (Bright Week) or Holy Week rubric.
    //     troparion-of-the-day — delegates to _resolveLittleHourSeasonalTroparionSlot()
    //     orthros-theotokion   — honest rubric stub (Matins Theotokion corpus deferred)
    //
    // v5.7 additions:
    //   kathisma-first, kathisma-second — resolved via _resolveOrthrosKathismaPair()
    //   praises-stichera — honest season-discriminating rubric
    //
    // v5.8 additions:
    //   sessional-hymns — season-aware rubric (5 cases)
    //   canon — structured season-aware rubric (6 cases); no corpus imported
    //
    // All skeleton placeholders now resolved. Non-throwing throughout.
    // ──────────────────────────────────────────────────────────────────────
    async function _resolveOrthrosSlots(sections, dateObj) {
        await Promise.all([
            _loadOrthrosFixedData(),
            _loadOrthrosKathismaData(),
            _loadTroparionData(),
            _loadWeekdayTroparionMeta(),
            _loadTriodionData()
        ]);

        const dayOfWeek    = dateObj.getDay();
        const toneResult   = _computeBaselineTone(dateObj);
        const seasonResult = _computeLiturgicalSeason(dateObj, toneResult);

        // Hoist season booleans once — used by multiple slot branches below.
        const isBrightWeek = toneResult && toneResult.brightWeek;
        const isHolyWeek   = seasonResult && seasonResult.season === 'holy-week';
        const isGreatLentWeekday =
            seasonResult &&
            seasonResult.season === 'great-lent' &&
            dayOfWeek >= 1 &&
            dayOfWeek <= 5;

        const FIXED_SLOT_KEYS = new Set([
            'usual-beginning',
            'psalm-3',
            'psalm-37',
            'psalm-62',
            'psalm-87',
            'psalm-102',
            'psalm-142',
            'praises-psalms',
            'great-doxology'
        ]);

        for (const section of sections) {
            if (!Array.isArray(section.items)) continue;

            for (let i = 0; i < section.items.length; i++) {
                const item = section.items[i];

                // ── Fixed slots ───────────────────────────────────────────
                if (FIXED_SLOT_KEYS.has(item.key)) {
                    const slotData = _orthrosFixedData &&
                        _orthrosFixedData.slots &&
                        _orthrosFixedData.slots[item.key];

                    if (slotData) {
                        section.items[i] = {
                            type:       slotData.type || 'text',
                            key:        item.key,
                            label:      slotData.label || item.label,
                            text:       slotData.text,
                            lxxNumber:  slotData.lxxNumber,
                            items:      Array.isArray(slotData.items) ? slotData.items : undefined,
                            resolvedAs: 'orthros-fixed'
                        };
                    }
                    // If data not loaded: item remains placeholder — correct degradation.
                    continue;
                }

                // ── god-is-the-lord / Alleluia path ──────────────────────
                if (item.key === 'god-is-the-lord') {
                    if (isBrightWeek) {
                        section.items[i] = {
                            type:       'rubric',
                            key:        'god-is-the-lord',
                            label:      'Paschal Troparion (Bright Week)',
                            text:       'Bright Week: The Paschal Troparion ("Christ is risen from the dead, trampling down death by death, and upon those in the tombs bestowing life") is sung three times in place of "God is the Lord." The tone of the week is the Paschal tone.',
                            resolvedAs: 'orthros-bright-week-paschal-path'
                        };
                    } else if (isHolyWeek) {
                        section.items[i] = {
                            type:       'rubric',
                            key:        'god-is-the-lord',
                            label:      'Holy Week — Alleluia',
                            text:       'During Holy Week, "Alleluia" is sung in place of "God is the Lord," as on Great Lent weekdays. The troparion of the Bridegroom (or the appointed day\'s troparion) follows.',
                            resolvedAs: 'orthros-holy-week-alleluia-path'
                        };
                    } else if (isGreatLentWeekday) {
                        section.items[i] = {
                            type:       'rubric',
                            key:        'god-is-the-lord',
                            label:      'Alleluia (Great Lent)',
                            text:       'On Great Lent weekdays, "Alleluia" (Mode 8 / Tone 8) is chanted in place of "God is the Lord." The penitential troparia and the Triodion troparion follow in place of the apolytikion.',
                            resolvedAs: 'orthros-great-lent-alleluia-path'
                        };
                    } else {
                        // Ordinary day or Sunday: God is the Lord
                        const tone = toneResult && toneResult.tone ? toneResult.tone : null;
                        const toneNote = tone
                            ? ` Chanted in Tone ${tone}.`
                            : ' (Tone: computed by Octoechos cycle.)';
                        section.items[i] = {
                            type:       'rubric',
                            key:        'god-is-the-lord',
                            label:      'God is the Lord',
                            text:       'God is the Lord, and hath appeared unto us. Blessed is He that cometh in the name of the Lord.' + toneNote + '\n\nVerse: Give thanks unto the Lord, for He is good; for His mercy endureth forever.\nVerse: All nations compassed me about; but in the name of the Lord will I destroy them.\nVerse: This is the Lord\'s doing; it is marvellous in our eyes.',
                            resolvedAs: 'orthros-god-is-the-lord-ordinary',
                            tone:       tone || undefined
                        };
                    }
                    continue;
                }

                // ── troparion-of-the-day ──────────────────────────────────
              if (item.key === 'troparion-of-the-day') {
                    const resolved = await _resolveLittleHourSeasonalTroparionSlot('orthros', dayOfWeek, dateObj, toneResult);
 
                    if (resolved) {
                        if (dayOfWeek === 0 && resolved.resolvedAs !== 'menaion-feast-troparion') {
 
                            // Sunday non-feast: probe resurrectional_troparia from loaded data.
                            const tone = toneResult && toneResult.tone ? toneResult.tone : null;
                            const troparia = _troparionData && _troparionData.resurrectional_troparia
                                ? _troparionData.resurrectional_troparia
                                : null;
                            const entry = troparia && tone
                                ? (troparia[String(tone)] || troparia[tone] || null)
                                : null;
 
                            if (entry && entry.text) {
                                section.items[i] = {
                                    type:       'text',
                                    key:        'troparion-of-the-day',
                                    label:      entry.title || `Resurrectional Troparion, Tone ${tone}`,
                                    text:       entry.text,
                                    source:     'Octoechos',
                                    tone:       tone,
                                    resolvedAs: 'orthros-sunday-resurrectional-troparion-text'
                                };
                            } else {
                                // Corpus absent or tone missing — honest rubric fallback
                                const toneNote = tone ? ` Current Octoechos tone: Tone ${tone}.` : '';
                                section.items[i] = {
                                    type:       'rubric',
                                    key:        'troparion-of-the-day',
                                    label:      'Troparion of the Day',
                                    text:       'On Sundays, the resurrectional troparion of the Octoechos is appointed according to the tone of the week unless displaced by a qualifying feast.' + toneNote,
                                    resolvedAs: 'orthros-sunday-resurrectional-troparion-rubric',
                                    tone:       tone || undefined
                                };
                            }
 
                        } else {
 
                            section.items[i] = Object.assign({}, resolved, {
                                key: 'troparion-of-the-day'
                            });
 
                        }
                    }
 
                    continue;
                }

                             // ── orthros-theotokion — v6.5: corpus probe + explicit rubric ──
                if (item.key === 'orthros-theotokion') {
                    const troparionItem =
    sections
        .flatMap(sec => Array.isArray(sec.items) ? sec.items : [])
        .find(it => it && it.key === 'troparion-of-the-day') || null;
 
                   const isFeast =
                        troparionItem &&
                        troparionItem.resolvedAs === 'menaion-feast-troparion';
 
                    const feastRankTH =
                        isFeast && typeof troparionItem.rank === 'number'
                            ? troparionItem.rank
                            : null;
 
                    const isMajorFeastForTheotokion =
                        isFeast &&
                        feastRankTH !== null &&
                        feastRankTH >= 1 &&
                        feastRankTH <= 2;
 
                    if (isMajorFeastForTheotokion) {
                        const feastName =
                            troparionItem.commemoration ||
                            troparionItem.label ||
                            'the feast of the day';
 
                        section.items[i] = {
                            type:       'rubric',
                            key:        'orthros-theotokion',
                            label:      item.label || 'Theotokion (Matins)',
                            text:
                                `FEAST — Theotokion: A qualifying Menaion feast (${feastName}) is appointed today. ` +
                                'The Theotokion appointed at Orthros follows the festal office rather than the ordinary Matins appointment. ' +
                                'The festal Orthros Theotokion corpus is not yet embedded in this path. The appointment is correct; the text is deferred.',
                            resolvedAs: 'orthros-feast-theotokion-rubric',
                            commemoration: troparionItem.commemoration || null,
                            governingTone: troparionItem.governingTone || troparionItem.tone || null,
                            rank: typeof troparionItem.rank === 'number' ? troparionItem.rank : null
                        };
                        continue;
                    }
 
                    if (!isBrightWeek && !isHolyWeek && !isGreatLentWeekday && dayOfWeek !== 0) {
                        // Ordinary weekday (Mon–Sat)
                        const WEEKDAY_NAMES_TH = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const tone       = toneResult && toneResult.tone ? toneResult.tone : null;
                        const dayName    = WEEKDAY_NAMES_TH[dayOfWeek] || 'this weekday';
                        const isCrossDay = dayOfWeek === 3 || dayOfWeek === 5;
 
                        // Corpus probe — window.OCTOECHOS.orthros.theotokion.weekday.tones[tone][dayOfWeek]
                        const wdTheotokionCorpus =
                            typeof window !== 'undefined' &&
                            window.OCTOECHOS &&
                            window.OCTOECHOS.orthros &&
                            window.OCTOECHOS.orthros.theotokion &&
                            window.OCTOECHOS.orthros.theotokion.weekday &&
                            window.OCTOECHOS.orthros.theotokion.weekday.tones
                                ? window.OCTOECHOS.orthros.theotokion.weekday.tones
                                : null;
 
                        const wdTheotokionToneBlock = wdTheotokionCorpus && tone
                            ? (wdTheotokionCorpus[tone] || wdTheotokionCorpus[String(tone)] || null)
                            : null;
 
                        const wdTheotokionEntry = wdTheotokionToneBlock && dayOfWeek
                            ? (wdTheotokionToneBlock[dayOfWeek] || wdTheotokionToneBlock[String(dayOfWeek)] || null)
                            : null;
 
                        // Emit text only if a real transcribed string exists.
                        if (typeof wdTheotokionEntry === 'string' && wdTheotokionEntry.length > 0) {
                            section.items[i] = {
                                type:       'text',
                                key:        'orthros-theotokion',
                                label:      isCrossDay ? 'Stavrotheotokion (Matins)' : 'Theotokion (Matins)',
                                text:       wdTheotokionEntry,
                                source:     'Octoechos',
                                tone:       tone,
                                day:        dayOfWeek,
                                family:     'weekday-theotokion',
                                resolvedAs: 'orthros-ordinary-weekday-theotokion-text'
                            };
                            continue;
                        }
 
                        // Null, missing key, or corpus absent — explicit Orthros-specific rubric fallback
                        const toneNote    = tone ? ` Tone ${tone}.` : '';
                        const crossNote   = isCrossDay
                            ? ` On ${dayName} a Stavrotheotokion (Cross Theotokion) is appointed.`
                            : '';
                        section.items[i] = {
                            type:       'rubric',
                            key:        'orthros-theotokion',
                            label:      isCrossDay ? 'Stavrotheotokion (Matins)' : 'Theotokion (Matins)',
                            text:       `ORDINARY WEEKDAY (${dayName}) — Theotokion: The Theotokion appointed at Orthros follows the Octoechos tone for the week.${toneNote}${crossNote} The full Matins Theotokion corpus is not yet transcribed into this path.`,
                            resolvedAs: 'orthros-ordinary-weekday-theotokion-rubric'
                        };
                        continue;
                    }
 
                    // ── Sunday — v6.8: corpus probe ───────────────────────────────────────
                    if (dayOfWeek === 0) {
                        const tone = toneResult && toneResult.tone ? toneResult.tone : null;
                        const sundayTheotokionCorpus =
                            typeof window !== 'undefined' &&
                            window.OCTOECHOS &&
                            window.OCTOECHOS.orthros &&
                            window.OCTOECHOS.orthros.theotokion &&
                            window.OCTOECHOS.orthros.theotokion.sunday &&
                            window.OCTOECHOS.orthros.theotokion.sunday.tones
                                ? window.OCTOECHOS.orthros.theotokion.sunday.tones
                                : null;
                        const sundayTheotokionEntry = sundayTheotokionCorpus && tone
                            ? (sundayTheotokionCorpus[tone] || sundayTheotokionCorpus[String(tone)] || null)
                            : null;

                        if (typeof sundayTheotokionEntry === 'string' && sundayTheotokionEntry.length > 0) {
                            section.items[i] = {
                                type:       'text',
                                key:        'orthros-theotokion',
                                label:      'Theotokion (Matins)',
                                text:       sundayTheotokionEntry,
                                source:     'Octoechos',
                                tone:       tone,
                                family:     'sunday-theotokion',
                                resolvedAs: 'orthros-sunday-theotokion-text'
                            };
                            continue;
                        }

                        // Corpus absent or tone entry null — honest Sunday-specific rubric
                        const toneNote = tone ? ` Octoechos tone: Tone ${tone}.` : '';
                        section.items[i] = {
                            type:       'rubric',
                            key:        'orthros-theotokion',
                            label:      'Theotokion (Matins)',
                            text:       `SUNDAY — Theotokion: The Theotokion at Sunday Orthros follows the resurrectional cycle of the Octoechos.${toneNote} The Sunday Matins Theotokion corpus for this tone is not yet transcribed into this path.`,
                            resolvedAs: 'orthros-sunday-theotokion-rubric'
                        };
                        continue;
                    }

                    // Great Lent, Holy Week, Bright Week — explicit deferred rubric
                    section.items[i] = {
                        type:       'rubric',
                        key:        'orthros-theotokion',
                        label:      item.label || 'Theotokion (Matins)',
                        text:       'THEOTOKION — Deferred: This Orthros Theotokion path is not yet implemented in the current tranche. Ordinary weekday Octoechos Theotokion alone are scaffolded here.',
                        resolvedAs: 'orthros-theotokion-deferred-rubric'
                    };
                    continue;
                }
                if (item.key === 'kathisma-first') {
                    const resolved = _resolveOrthrosKathismaPair(
                        'kathisma-first', dayOfWeek, isBrightWeek, isGreatLentWeekday
                    );
                    if (resolved) section.items[i] = resolved;
                    // null → data load failure → slot remains skeleton placeholder (correct degradation)
                    continue;
                }

                // ── v5.7: kathisma-second ─────────────────────────────────
                if (item.key === 'kathisma-second') {
                    const resolved = _resolveOrthrosKathismaPair(
                        'kathisma-second', dayOfWeek, isBrightWeek, isGreatLentWeekday
                    );
                    if (resolved) section.items[i] = resolved;
                    continue;
                }

                 // ── v5.7: praises-stichera — honest discriminating rubric ─
                // Upgraded from silent pass-through to a rubric that truthfully
                // distinguishes the five liturgical contexts.
                if (item.key === 'praises-stichera') {
                    let sticheraText;
                    let sticheraResolvedAs;

                    const troparionItem =
                        sections
                            .flatMap(sec => Array.isArray(sec.items) ? sec.items : [])
                            .find(it => it && it.key === 'troparion-of-the-day') || null;

                    const isFeast = troparionItem && troparionItem.resolvedAs === 'menaion-feast-troparion';
                    const feastRank =
                        isFeast && typeof troparionItem.rank === 'number'
                            ? troparionItem.rank
                            : null;

                    const isMajorFeastForPraises =
                        isFeast &&
                        feastRank !== null &&
                        feastRank >= 1 &&
                        feastRank <= 2;

                    const sundayPraisesData =
                        typeof window !== 'undefined' &&
                        window.ORTHROS_SUNDAY_PRAISES &&
                        toneResult &&
                        toneResult.tone
                            ? window.ORTHROS_SUNDAY_PRAISES[String(toneResult.tone)] ||
                              window.ORTHROS_SUNDAY_PRAISES[toneResult.tone] ||
                              null
                            : null;

                    const hasSundayPraisesText =
                     dayOfWeek === 0 &&
                     !isMajorFeastForPraises &&
                     !isBrightWeek &&
                      !isHolyWeek &&
                      !isGreatLentWeekday &&
                     Array.isArray(sundayPraisesData) &&
                     sundayPraisesData.length > 0;
                    if (isMajorFeastForPraises) {
                        const feastName = troparionItem.commemoration || troparionItem.label || 'the feast of the day';
                        sticheraText =
                            `FEAST — Praises Stichera: A major Menaion feast (${feastName}) is appointed today. ` +
                            'The Praises stichera are taken from the Menaion for this feast rather than from the ' +
                            'ordinary Octoechos or resurrectional cycle. The feast Menaion Ainoi stichera corpus ' +
                            'is not yet embedded in this path. The appointment is correct; the text is deferred.';
                        sticheraResolvedAs = 'orthros-feast-praises-rubric';
                                        } else if (hasSundayPraisesText) {
                        section.items[i] = {
                            type:       'stichera',
                            key:        'praises-stichera',
                            label:      'Stichera at the Praises',
                            items:      sundayPraisesData.map((entry, idx) => ({
                                type:      'text',
                                sticheron: entry.sticheron || idx + 1,
                                text:      entry.text || ''
                            })),
                            source:     'Octoechos',
                            tone:       toneResult.tone,
                            resolvedAs: 'orthros-sunday-resurrectional-praises-text'
                        };
                        continue;
                    } else if (isBrightWeek) {
                        sticheraText =
                            'BRIGHT WEEK — Praises Stichera: The Paschal stichera are sung at the Praises ' +
                            '("Let everything that hath breath praise the Lord"). The standard Paschal stichera ' +
                            'corpus is appointed for the entire Bright Week at this point. Full Bright Week ' +
                            'Praises stichera text is not yet embedded in this path.';
                        sticheraResolvedAs = 'orthros-bright-week-praises-stichera-rubric';
                    } else if (isHolyWeek) {
                        sticheraText =
                            'HOLY WEEK — Praises Stichera: During Holy Week, stichera at the Praises ' +
                            'are appointed from the Triodion for each specific day. Full Holy Week ' +
                            'Praises stichera text is not yet embedded in this path.';
                        sticheraResolvedAs = 'orthros-holy-week-praises-stichera-rubric';
                    } else if (isGreatLentWeekday) {
                        sticheraText =
                            'GREAT LENT (Weekday) — Praises Stichera: On ordinary Great Lent weekdays ' +
                            'the Praises (Psalms 148–150) are typically read without appended stichera — ' +
                            'the Great Lent feria service (the Alleluia service) does not add Ainoi stichera ' +
                            'on ordinary Lenten weekdays. The service proceeds from the Praises directly ' +
                            'to the Great Doxology (read, not sung, on feria days).';
                        sticheraResolvedAs = 'orthros-great-lent-praises-stichera-rubric';
                     } else if (dayOfWeek === 0) {
                        // Sunday
                        const tone = toneResult && toneResult.tone ? toneResult.tone : null;
                        const toneNote = tone ? ` Current Octoechos tone: Tone ${tone}.` : '';
                        sticheraText =
                            'On Sundays, the Praises stichera are taken from the resurrectional cycle of the ' +
                            'Octoechos according to the tone of the week, unless displaced by a qualifying feast.' +
                            toneNote + '\n\n' +
                            '(Full Sunday Resurrectional Ainoi stichera corpus, Octoechos tones 1–8, is not yet ' +
                            'embedded in this path. The appointment is correct; the text is deferred.)';
                        sticheraResolvedAs = 'orthros-sunday-resurrectional-praises-rubric';
                    } else {
                        // Ordinary weekday (Mon–Sat) — v6.3: probe corpus before rubric
                        const WEEKDAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const WEEKDAY_THEMES = {
                            1: 'the Bodiless Powers (Angels)',
                            2: 'St. John the Baptist and the Prophets',
                            3: 'the Holy Cross and the Theotokos',
                            4: 'the Holy Apostles and St. Nicholas',
                            5: 'the Holy Cross and the Theotokos (penitential)',
                            6: 'All Saints and the Departed'
                        };

                        const tone = toneResult && toneResult.tone ? toneResult.tone : null;
                        const dayName = WEEKDAY_NAMES[dayOfWeek] || 'this weekday';
                        const theme   = WEEKDAY_THEMES[dayOfWeek] || 'the day\'s theme';

                        // Corpus probe — window.OCTOECHOS.orthros.praises.weekday.tones[tone][dayOfWeek]
                        const wdPraisesCorpus =
                            typeof window !== 'undefined' &&
                            window.OCTOECHOS &&
                            window.OCTOECHOS.orthros &&
                            window.OCTOECHOS.orthros.praises &&
                            window.OCTOECHOS.orthros.praises.weekday &&
                            window.OCTOECHOS.orthros.praises.weekday.tones
                                ? window.OCTOECHOS.orthros.praises.weekday.tones
                                : null;

                        const wdPraisesToneBlock = wdPraisesCorpus && tone
                            ? (wdPraisesCorpus[tone] || wdPraisesCorpus[String(tone)] || null)
                            : null;

                        const wdPraisesEntry = wdPraisesToneBlock && dayOfWeek
                            ? (wdPraisesToneBlock[dayOfWeek] || wdPraisesToneBlock[String(dayOfWeek)] || null)
                            : null;

                        // Future-ready structured output:
                        // only fire when a real transcribed array exists.
                        if (Array.isArray(wdPraisesEntry) && wdPraisesEntry.length > 0) {
                            section.items[i] = {
                                type:       'stichera',
                                key:        'praises-stichera',
                                label:      'Stichera at the Praises',
                                items:      wdPraisesEntry.map((entry, idx) => ({
                                    type:      'text',
                                    sticheron: entry && entry.sticheron ? entry.sticheron : idx + 1,
                                    text:      entry && entry.text ? entry.text : ''
                                })),
                                source:     'Octoechos',
                                tone:       tone,
                                day:        dayOfWeek,
                                family:     'weekday-praises-stichera',
                                resolvedAs: 'orthros-ordinary-weekday-praises-text'
                            };
                            continue;
                        }

                        // Null, missing key, or corpus absent — honest rubric fallback
                        sticheraText =
                            `ORDINARY WEEKDAY (${dayName}) — Praises Stichera: On ordinary ferial days ` +
                            `the Praises (Psalms 148–150) are read without appended stichera, and the service ` +
                            `proceeds directly to the Great Doxology (read, not sung). The Octoechos theme ` +
                            `for ${dayName} is ${theme}.\n\n` +
                            `(If a Menaion commemoration of sufficient rank is appointed, stichera at the ` +
                            `Praises would be drawn from the Menaion. This festal override is not yet implemented.)`;
                                                sticheraResolvedAs = 'orthros-ordinary-weekday-praises-stichera-rubric';
                    }

                     section.items[i] = {
                        type:       'rubric',
                        key:        'praises-stichera',
                        label:      'Stichera at the Praises',
                        text:       sticheraText,
                        resolvedAs: sticheraResolvedAs
                    };
                    continue;
                }
 
                // ── Aposticha (ordinary weekday) — v6.4 ──────────────────
                // Bounded tranche: ordinary weekday corpus probe + rubric fallback.
                // All other paths (Sunday, Great Lent, Holy Week, Bright Week)
                // emit an explicit deferred rubric — never a silent pass-through.
                // Corpus: window.OCTOECHOS.orthros.aposticha.weekday.tones[tone][dayOfWeek]
                // Emits structured stichera only when a real non-null array
                // entry exists. Otherwise: honest rubric fallback preserved.
                if (item.key === 'aposticha') {
                    if (!isBrightWeek && !isHolyWeek && !isGreatLentWeekday && dayOfWeek !== 0) {
                        // Ordinary weekday (Mon–Sat)
                        const WEEKDAY_NAMES_AP = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const WEEKDAY_THEMES_AP = {
                            1: 'the Bodiless Powers (Angels)',
                            2: 'St. John the Baptist and the Prophets',
                            3: 'the Holy Cross and the Theotokos',
                            4: 'the Holy Apostles and St. Nicholas',
                            5: 'the Holy Cross and the Theotokos (penitential)',
                            6: 'All Saints and the Departed'
                        };
 
                        const tone    = toneResult && toneResult.tone ? toneResult.tone : null;
                        const dayName = WEEKDAY_NAMES_AP[dayOfWeek] || 'this weekday';
                        const theme   = WEEKDAY_THEMES_AP[dayOfWeek] || 'the day\'s theme';
 
                        // Corpus probe — window.OCTOECHOS.orthros.aposticha.weekday.tones[tone][dayOfWeek]
                        const wdApostichaCorpus =
                            typeof window !== 'undefined' &&
                            window.OCTOECHOS &&
                            window.OCTOECHOS.orthros &&
                            window.OCTOECHOS.orthros.aposticha &&
                            window.OCTOECHOS.orthros.aposticha.weekday &&
                            window.OCTOECHOS.orthros.aposticha.weekday.tones
                                ? window.OCTOECHOS.orthros.aposticha.weekday.tones
                                : null;
 
                        const wdApostichaToneBlock = wdApostichaCorpus && tone
                            ? (wdApostichaCorpus[tone] || wdApostichaCorpus[String(tone)] || null)
                            : null;
 
                        const wdApostichaEntry = wdApostichaToneBlock && dayOfWeek
                            ? (wdApostichaToneBlock[dayOfWeek] || wdApostichaToneBlock[String(dayOfWeek)] || null)
                            : null;
 
                        // Emit structured text only if a real transcribed array exists.
                        if (Array.isArray(wdApostichaEntry) && wdApostichaEntry.length > 0) {
                            section.items[i] = {
                                type:       'stichera',
                                key:        'aposticha',
                                label:      'Aposticha',
                                items:      wdApostichaEntry.map((entry, idx) => ({
                                    type:      'text',
                                    sticheron: entry && entry.sticheron ? entry.sticheron : idx + 1,
                                    text:      entry && entry.text ? entry.text : ''
                                })),
                                source:     'Octoechos',
                                tone:       tone,
                                day:        dayOfWeek,
                                family:     'weekday-aposticha',
                                resolvedAs: 'orthros-ordinary-weekday-aposticha-text'
                            };
                            continue;
                        }
 
                        // Null, missing key, or corpus absent — honest rubric fallback
                        section.items[i] = {
                            type:       'rubric',
                            key:        'aposticha',
                            label:      'Aposticha',
                            text:       `ORDINARY WEEKDAY (${dayName}) — Aposticha: The Aposticha are appointed from the Octoechos (tone ${tone || '?'}, theme: ${theme}) and optionally the Menaion for any commemoration of sufficient rank. Full Aposticha corpus text is not yet embedded in this path.`,
                            resolvedAs: 'orthros-ordinary-weekday-aposticha-rubric'
                        };
                        continue;
                    }
 
                    // Non-ordinary paths (Sunday, feast, seasonal) — explicit deferred rubric
                    section.items[i] = {
                        type:       'rubric',
                        key:        'aposticha',
                        label:      'Aposticha',
                        text:       'APOSTICHA — Deferred: This Orthros Aposticha path is not yet implemented in the current tranche. Ordinary weekday Octoechos Aposticha alone are scaffolded here.',
                        resolvedAs: 'orthros-aposticha-deferred-rubric'
                    };
                    continue;
                }
 
                // ── v6.1 implemented: exapostilarion — Eothinon cycle ──────
                // Sunday Resurrectional Exapostilarion follows the 11-part
                // Eothinon (Morning Gospel) cycle, not the 8-tone Octoechos.
                // Corpus: window.OCTOECHOS.orthros.exapostilarion.sunday.eothinon
                // (js/octoechos/orthros-exapostilarion-eothinon.js).
                // Seasonal suppressions retain explicit rubrics.
                // Ordinary weekdays retain existing deferral.
                if (item.key === 'exapostilarion') {
                    const tone     = toneResult && toneResult.tone ? toneResult.tone : null;
                    const toneNote = tone ? ` Octoechos tone: ${tone}.` : '';

                    if (isBrightWeek) {
                        const _bwText =
                            'Having fallen asleep in the flesh, as a mortal, O King and Lord, on the third day ' +
                            'Thou didst rise again, raising up Adam from corruption, and abolishing death: ' +
                            'O Pascha of incorruption, Salvation of the world!';
                        section.items[i] = {
                            type:       'text',
                            key:        'exapostilarion',
                            label:      'Exapostilarion (Svetilen) — Paschal / Bright Week, Tone III',
                            text:       _bwText + '\n\n' + _bwText + '\n\n' + _bwText,
                            source:     'Pentecostarion',
                            tone:       3,
                            resolvedAs: 'orthros-bright-week-exapostilarion-text'
                        };
                        continue;
                    }

                    if (isHolyWeek) {
                        section.items[i] = {
                            type:       'rubric',
                            key:        'exapostilarion',
                            label:      'Exapostilarion (Svetilen)',
                            text:       'HOLY WEEK — Exapostilarion: The Exapostilarion is appointed from the Triodion for each specific Holy Week day. Full Holy Week Exapostilarion text is not yet embedded in this path.',
                            resolvedAs: 'orthros-holy-week-exapostilarion-rubric'
                        };
                        continue;
                    }

                    if (isGreatLentWeekday) {
                        const _gleWeekdayKeys = [null, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

                        if (dayOfWeek < 1 || dayOfWeek > 5) {
                            section.items[i] = {
                                type:       'rubric',
                                key:        'exapostilarion',
                                label:      'Exapostilarion (Svetilen)',
                                text:       'GREAT LENT — Exapostilarion: No weekday Exapostilarion is implemented for this day in the current tranche.',
                                resolvedAs: 'orthros-great-lent-exapostilarion-day-not-implemented'
                            };
                            continue;
                        }

                        const _gleDayKey = _gleWeekdayKeys[dayOfWeek];
                        const _gleCorpus =
                            window.OCTOECHOS &&
                            window.OCTOECHOS.orthros &&
                            window.OCTOECHOS.orthros.exapostilarion &&
                            window.OCTOECHOS.orthros.exapostilarion.greatLentWeekday
                                ? window.OCTOECHOS.orthros.exapostilarion.greatLentWeekday
                                : null;

                        if (!_gleCorpus) {
                            section.items[i] = {
                                type:       'rubric',
                                key:        'exapostilarion',
                                label:      'Exapostilarion (Svetilen)',
                                text:       'GREAT LENT (Weekday) — Exapostilarion: Corpus not loaded. Ensure js/octoechos/orthros-exapostilarion-great-lent-weekday.js is present in index.html before horologion-engine.js.',
                                resolvedAs: 'orthros-great-lent-exapostilarion-corpus-unavailable'
                            };
                            continue;
                        }

                        if (!tone) {
                            section.items[i] = {
                                type:       'rubric',
                                key:        'exapostilarion',
                                label:      'Exapostilarion (Svetilen)',
                                text:       'GREAT LENT (Weekday) — Exapostilarion: Tone could not be determined for this date.',
                                resolvedAs: 'orthros-great-lent-exapostilarion-tone-unavailable'
                            };
                            continue;
                        }

                        const _gleBody = _gleCorpus.tones[tone] || null;

                        if (!_gleBody) {
                            section.items[i] = {
                                type:       'rubric',
                                key:        'exapostilarion',
                                label:      'Exapostilarion (Svetilen)',
                                text:       `GREAT LENT (Weekday) — Exapostilarion (Tone ${tone}): Hymn body text not yet verified from a complete source witness.`,
                                resolvedAs: 'orthros-great-lent-exapostilarion-text-unverified'
                            };
                            continue;
                        }

                        const _gleFirst  = _gleCorpus.firstEndings[_gleDayKey] || _gleCorpus.firstEndings.monday;
                        const _gleSecond = _gleCorpus.secondEnding;
                        const _gleThird  = _gleCorpus.thirdEnding;

                        const _gleFullText =
                            _gleBody + ' ' + _gleFirst +
                            '\n\n' + _gleBody + ' ' + _gleSecond +
                            '\n\n' + _gleBody + ' ' + _gleThird;

                        section.items[i] = {
                            type:       'text',
                            key:        'exapostilarion',
                            label:      `Exapostilarion (Svetilen) — Tone ${tone}`,
                            text:       _gleFullText,
                            source:     'Octoechos',
                            tone:       tone,
                            resolvedAs: 'orthros-great-lent-weekday-exapostilarion'
                        };
                        continue;
                    }

                    // ── Sunday: resolve via Eothinon cycle ────
                    if (dayOfWeek === 0) {
                        const eothinonResult =
                            (typeof window !== 'undefined' &&
                             window.OrthrosEothinonEngine &&
                             typeof window.OrthrosEothinonEngine.getSundayEothinon === 'function')
                                ? window.OrthrosEothinonEngine.getSundayEothinon(dateObj)
                                : null;

                        const gospelCorpus =
                            window.OCTOECHOS &&
                            window.OCTOECHOS.orthros &&
                            window.OCTOECHOS.orthros.exapostilarion &&
                            window.OCTOECHOS.orthros.exapostilarion.sunday &&
                            window.OCTOECHOS.orthros.exapostilarion.sunday.eothinon &&
                            window.OCTOECHOS.orthros.exapostilarion.sunday.eothinon.gospels
                                ? window.OCTOECHOS.orthros.exapostilarion.sunday.eothinon.gospels
                                : null;

                        // Guard: engine not available
                        if (!eothinonResult) {
                            section.items[i] = {
                                type:       'rubric',
                                key:        'exapostilarion',
                                label:      'Exapostilarion (Svetilen)',
                                text:       'SUNDAY — Exapostilarion: OrthrosEothinonEngine is not available. Cannot determine Eothinon number.',
                                resolvedAs: 'orthros-sunday-exapostilarion-engine-unavailable'
                            };
                            continue;
                        }

                        // Guard: suppressed Sunday (Holy Week, Bright Week, Pascha)
                        if (!eothinonResult.applicable) {
                            section.items[i] = {
                                type:       'rubric',
                                key:        'exapostilarion',
                                label:      'Exapostilarion (Svetilen)',
                                text:       `SUNDAY — Exapostilarion: Eothinon cycle suppressed (reason: ${eothinonResult.reason}). No Resurrectional Exapostilarion appointed on this Sunday.`,
                                resolvedAs: `orthros-sunday-exapostilarion-suppressed-${eothinonResult.reason}`
                            };
                            continue;
                        }

                        const gospelNum = eothinonResult.eothinonNumber; // 1–11

                        // Guard: corpus not loaded
                        if (!gospelCorpus) {
                            section.items[i] = {
                                type:       'rubric',
                                key:        'exapostilarion',
                                label:      'Exapostilarion (Svetilen)',
                                text:       `SUNDAY — Exapostilarion (Eothinon ${gospelNum}): Corpus not loaded. Ensure js/octoechos/orthros-exapostilarion-eothinon.js is present in index.html before horologion-engine.js.`,
                                resolvedAs: 'orthros-sunday-exapostilarion-corpus-unavailable'
                            };
                            continue;
                        }

                        // Guard: key structurally absent from corpus object
                        if (!(gospelNum in gospelCorpus)) {
                            section.items[i] = {
                                type:       'rubric',
                                key:        'exapostilarion',
                                label:      'Exapostilarion (Svetilen)',
                                text:       `SUNDAY — Exapostilarion (Eothinon ${gospelNum}): No entry exists for Eothinon ${gospelNum} in corpus object. Key required at window.OCTOECHOS.orthros.exapostilarion.sunday.eothinon.gospels[${gospelNum}].`,
                                resolvedAs: 'orthros-sunday-exapostilarion-gospel-missing'
                            };
                            continue;
                        }

                        // Guard: entry present but not yet transcribed (null sentinel)
                        if (gospelCorpus[gospelNum] === null || gospelCorpus[gospelNum] === undefined) {
                            section.items[i] = {
                                type:       'rubric',
                                key:        'exapostilarion',
                                label:      'Exapostilarion (Svetilen)',
                                text:       `SUNDAY — Exapostilarion (Eothinon ${gospelNum}): Text not yet transcribed from verified source. Transcribe from Jordanville Horologion 2008 or OCA/Antiochian Orthros into window.OCTOECHOS.orthros.exapostilarion.sunday.eothinon.gospels[${gospelNum}].`,
                                resolvedAs: 'orthros-sunday-exapostilarion-eothinon-text-untranscribed'
                            };
                            continue;
                        }

                        // ── Resolved ──────────────────────────
                        section.items[i] = {
                            type:       'text',
                            key:        'exapostilarion',
                            label:      `Exapostilarion (Svetilen) — Eothinon ${gospelNum}`,
                            text:       gospelCorpus[gospelNum],
                            resolvedAs: `orthros-sunday-resurrectional-exapostilarion-eothinon-${gospelNum}`
                        };
                        continue;
                    }

                    // ── Ordinary weekday deferral (unchanged) ─────
                    const _dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                    const _dayLabel = (_dayNames[dayOfWeek] || 'WEEKDAY').toUpperCase();
                    section.items[i] = {
                        type:       'rubric',
                        key:        'exapostilarion',
                        label:      'Exapostilarion (Svetilen)',
                        text:       _dayLabel + ' — Exapostilarion: The weekday Exapostilarion corpus is not yet implemented. On ferial days the Exapostilarion is appointed from the Octoechos according to the tone and weekday theme.' + toneNote,
                        resolvedAs: 'orthros-ordinary-weekday-exapostilarion-rubric'
                    };
                    continue;
                }

                 // ── v5.8: sessional-hymns — season-aware rubric ──────────
                if (item.key === 'sessional-hymns') {
                    let sessText;
                    let sessResolvedAs;

                    const troparionItem =
    sections
        .flatMap(sec => Array.isArray(sec.items) ? sec.items : [])
        .find(it => it && it.key === 'troparion-of-the-day') || null;
                    const isFeast = troparionItem && troparionItem.resolvedAs === 'menaion-feast-troparion';

const feastRank =
    isFeast && typeof troparionItem.rank === 'number'
        ? troparionItem.rank
        : null;

const isMajorFeastForPraises =
    isFeast &&
    feastRank !== null &&
    feastRank >= 1 &&
    feastRank <= 2;

                    if (isBrightWeek) {
                        sessText =
                            'BRIGHT WEEK — Sessional Hymns: During Bright Week the ordinary Sessional ' +
                            'Hymns (Sedalia) are replaced by the Paschal Sessional Hymn: ' +
                            '"Having beheld the Resurrection of Christ..." This is sung after the ' +
                            'Paschal Canon in place of the weekday Octoechos sedalia. ' +
                            'Full Bright Week Sessional Hymn text is not yet embedded in this path.';
                        sessResolvedAs = 'orthros-bright-week-sessional-hymns-rubric';
                    } else if (isHolyWeek) {
                        const hwDay = seasonResult && seasonResult.holyWeekDay
                            ? seasonResult.holyWeekDay : null;
                        const hwSessResolved = hwDay
                            ? _resolveHolyWeekText('sessional-hymns', hwDay)
                            : null;
                        if (hwSessResolved) {
                            section.items[i] = hwSessResolved;
                            continue;
                        }
                        sessText =
                            'HOLY WEEK — Sessional Hymns: During Holy Week the Sessional Hymns are ' +
                            'appointed specifically from the Triodion for each day, replacing the ' +
                            'ordinary Octoechos sedalia. The texts are day-specific and structurally ' +
                            'distinct from ordinary week sedalia. Full Holy Week Sessional Hymn texts ' +
                            'are not yet embedded in this path.';
                        sessResolvedAs = 'orthros-holy-week-sessional-hymns-rubric';
                    } else if (isGreatLentWeekday) {
                        sessText =
                            'GREAT LENT (Weekday) — Sessional Hymns: On Great Lent weekdays the ' +
                            'Sessional Hymns are appointed from the Triodion (penitential sedalia) ' +
                            'and sometimes from the Menaion for major feasts. The ordinary Octoechos ' +
                            'sedalia cycle is not used on feria Lenten days. Full Lenten Sessional ' +
                            'Hymn texts are not yet embedded in this path.';
                        sessResolvedAs = 'orthros-great-lent-sessional-hymns-rubric';
                                         } else if (dayOfWeek === 0 && !isMajorFeastForPraises) {
                        // Sunday — v6.1: resolve from corpus if available
                        const tone = toneResult && toneResult.tone ? toneResult.tone : null;
                        const corpusTones =
                            typeof window !== 'undefined' &&
                            window.OCTOECHOS &&
                            window.OCTOECHOS.orthros &&
                            window.OCTOECHOS.orthros.sessionalHymns &&
                            window.OCTOECHOS.orthros.sessionalHymns.sunday &&
                            window.OCTOECHOS.orthros.sessionalHymns.sunday.tones
                                ? window.OCTOECHOS.orthros.sessionalHymns.sunday.tones
                                : null;
                        const toneEntry = corpusTones && tone
                            ? (corpusTones[tone] || corpusTones[String(tone)] || null)
                            : null;

                        if (toneEntry && toneEntry.afterKathisma1) {
                            section.items[i] = {
                                type:       'hymn-group',
                                key:        'sessional-hymns',
                                label:      'Sessional Hymns (Sedalia / Kathismata)',
                                source:     'Octoechos',
                                tone:       tone,
                                items: [
                                    { position: 'afterKathisma1', text: toneEntry.afterKathisma1 },
                                    { position: 'afterKathisma2', text: toneEntry.afterKathisma2 || toneEntry.afterKathisma1 }
                                ],
                                resolvedAs: 'orthros-sunday-resurrectional-sessional-hymns-text'
                            };
                            continue; 
                        }

                        // Corpus not loaded or tone missing — honest rubric fallback
                        const toneNote = tone ? ` Current Octoechos tone: Tone ${tone}.` : '';
                        sessText =
                            'On Sundays, the sessional hymns following the kathismata are taken from the ' +
                            'resurrectional cycle of the Octoechos according to the tone of the week, ' +
                            'unless displaced by a major feast.' + toneNote + '\n\n' +
                            '(Sunday Resurrectional Sessional Hymn corpus not loaded or tone entry missing.)';
                        sessResolvedAs = 'orthros-sunday-resurrectional-sessional-hymns-rubric';
                   } else {
                        // Ordinary weekday (Mon–Sat) — v6.2: probe corpus before rubric
                        const WEEKDAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const WEEKDAY_THEMES = {
                            1: 'the Bodiless Powers (Angels)',
                            2: 'St. John the Baptist and the Prophets',
                            3: 'the Holy Cross and the Theotokos',
                            4: 'the Holy Apostles and St. Nicholas',
                            5: 'the Holy Cross and the Theotokos (penitential)',
                            6: 'All Saints and the Departed'
                        };
                        const tone    = toneResult && toneResult.tone ? toneResult.tone : null;
                        const dayName = WEEKDAY_NAMES[dayOfWeek] || 'this weekday';
                        const theme   = WEEKDAY_THEMES[dayOfWeek] || 'the day\'s theme';
                        const toneNote = tone ? ` Tone ${tone}.` : '';

                        // Corpus probe — window.OCTOECHOS.orthros.sessional.weekday.tones[tone][dayOfWeek]
                        const wdCorpus =
                            typeof window !== 'undefined' &&
                            window.OCTOECHOS &&
                            window.OCTOECHOS.orthros &&
                            window.OCTOECHOS.orthros.sessional &&
                            window.OCTOECHOS.orthros.sessional.weekday &&
                            window.OCTOECHOS.orthros.sessional.weekday.tones
                                ? window.OCTOECHOS.orthros.sessional.weekday.tones
                                : null;
                        const wdToneBlock = wdCorpus && tone
                            ? (wdCorpus[tone] || wdCorpus[String(tone)] || null)
                            : null;
                        const wdEntry = wdToneBlock && dayOfWeek
                            ? (wdToneBlock[dayOfWeek] || wdToneBlock[String(dayOfWeek)] || null)
                            : null;

                        if (wdEntry && (wdEntry.afterKathisma1 || wdEntry.afterKathisma2)) {
                            section.items[i] = {
                                type:       'hymn-group',
                                key:        'sessional-hymns',
                                label:      'Sessional Hymns (Sedalia / Kathismata)',
                                source:     'Octoechos',
                                tone:       tone,
                                day:        dayOfWeek,
                                items: [
                                    { position: 'afterKathisma1', text: wdEntry.afterKathisma1 || wdEntry.afterKathisma2 },
                                    { position: 'afterKathisma2', text: wdEntry.afterKathisma2 || wdEntry.afterKathisma1 }
                                ],
                                resolvedAs: 'orthros-ordinary-weekday-sessional-hymns-text'
                            };
                            continue;
                        }

                        // Corpus absent or entry null — honest rubric fallback
                        sessText =
                            `ORDINARY WEEKDAY (${dayName}) — Sessional Hymns (Sedalia): After each ` +
                            `kathisma a Sessional Hymn (Sedalion) is sung seated. On ordinary weekdays ` +
                            `these are drawn from the Octoechos for the current tone and day.` + toneNote + '\n\n' +
                            `The Octoechos theme for ${dayName} is ${theme}. ` +
                            `The appointed sedalia follow this theme.\n\n` +
                            `(If a Menaion commemoration of sufficient rank is appointed, the Menaion ` +
                            `sedalia replace or supplement the Octoechos sedalia. Full Octoechos and ` +
                            `Menaion Sessional Hymn corpora are not yet embedded in this path.)`;
                        sessResolvedAs = 'orthros-ordinary-weekday-sessional-hymns-rubric';
                    }

                    section.items[i] = {
                        type:       'rubric',
                        key:        'sessional-hymns',
                        label:      'Sessional Hymns (Sedalia)',
                        text:       sessText,
                        resolvedAs: sessResolvedAs
                    };
                    continue;
                }

                 // ── v5.8: canon — structured season-aware rubric ──────────
                if (item.key === 'canon') {
                    let canonText;
                    let canonResolvedAs;
                    let canonTone = null;

                    // Canon structure note (used in several cases below)
                    const canonStructureNote =
                        'The Canon consists of nine Odes (Ode 2 is omitted on most days outside ' +
                        'Great Lent; it appears on Tuesdays of Great Lent). Each Ode begins with ' +
                        'an Irmos (model melody) followed by Troparia. After Ode 3 the Sessional ' +
                        'Hymn is read; after Ode 6 the Kontakion and Ikos are sung; Ode 9 concludes ' +
                        'with the Magnificat refrain and the Exapostilarion. Katavasiae (the Irmoi ' +
                        'sung again after Odes 1, 3, 4, 5, 6, 7, 8, 9 or as appointed) close each Ode.';

                    const troparionItem =
    sections
        .flatMap(sec => Array.isArray(sec.items) ? sec.items : [])
        .find(it => it && it.key === 'troparion-of-the-day') || null;
                    const isFeast = troparionItem && troparionItem.resolvedAs === 'menaion-feast-troparion';

                    if (isBrightWeek) {
                        canonText =
                            'BRIGHT WEEK — The Paschal Canon: During Bright Week the Paschal Canon ' +
                            '("It is the Day of Resurrection" — Canon of Pascha, composed by St. John ' +
                            'of Damascus, Tone 1) is sung in its entirety at every Orthros of the week. ' +
                            'It replaces all other canons. All nine Odes are sung with full Paschal ' +
                            'refrains ("Christ is risen from the dead"). The katavasiae are the Irmoi ' +
                            'of the Paschal Canon themselves.\n\n' +
                            canonStructureNote + '\n\n' +
                            '(Full Paschal Canon text is not yet embedded in this path. The appointment ' +
                            'and structure described above are correct.)';
                        canonResolvedAs = 'orthros-bright-week-canon-rubric';
                    } else if (isFeast) {
                        canonText =
                            'The canon appointed at Orthros is the feast canon from the Menaion, unless displaced ' +
                            'by a higher-ranking seasonal canon. The feast Menaion canon corpus is not yet embedded ' +
                            'in this path. The appointment is correct; the text is deferred.\n\n' +
                            canonStructureNote;
                        canonResolvedAs = 'orthros-feast-canon-rubric';
                    } else if (isHolyWeek) {
                        const hwDay = seasonResult && seasonResult.holyWeekDay
                            ? seasonResult.holyWeekDay : null;
                        const hwCanonResolved = hwDay
                            ? _resolveHolyWeekText('canon', hwDay)
                            : null;
                        if (hwCanonResolved) {
                            section.items[i] = hwCanonResolved;
                            continue;
                        }
                        const hwDayLabel = hwDay ? hwDay.replace(/-/g, ' ') : 'Holy Week';
                        canonText =
                            `HOLY WEEK — Canon (${hwDayLabel}): During Holy Week the Canon is appointed ` +
                            'specifically from the Triodion for each day. Palm Sunday uses the Canon ' +
                            'of the Triodion with the Lazarus Saturday Canon at Sunday Orthros. ' +
                            'Great Monday through Great Wednesday use the Canon of the Bridegroom. ' +
                            'Great Thursday: Canon of Holy Thursday (Last Supper). ' +
                            'Great Friday: Canon of the Crucifixion. ' +
                            'Great Saturday: Canon of the Descent into Hades (composed by St. Cosmas).\n\n' +
                            canonStructureNote + '\n\n' +
                            '(Full Holy Week Canon texts are not yet embedded in this path.)';
                        canonResolvedAs = 'orthros-holy-week-canon-rubric';
                    } else if (isGreatLentWeekday) {
                        canonText =
                            'GREAT LENT (Weekday) — Canon: On Great Lent weekdays the Canon is ' +
                            'appointed from the Triodion (penitential canons, often by St. Andrew of ' +
                            'Crete or St. Theophanes). Ode 2 is included on Tuesdays of Great Lent ' +
                            '(otherwise omitted). The Great Canon of St. Andrew of Crete is read in ' +
                            'full across the first four evenings of the first week and in its entirety ' +
                            'on Great Thursday Matins. The katavasiae during Great Lent are typically ' +
                            'from the appointed Triodion canon.\n\n' +
                            canonStructureNote + '\n\n' +
                            '(Full Lenten Canon texts are not yet embedded in this path.)';
                        canonResolvedAs = 'orthros-great-lent-canon-rubric';
                     } else if (dayOfWeek === 0) {
                        // Sunday — v6.1: resolve from corpus if available
                        const tone = toneResult && toneResult.tone ? toneResult.tone : null;
                        canonTone = tone;
                        const canonCorpus =
                            typeof window !== 'undefined' &&
                            window.OCTOECHOS &&
                            window.OCTOECHOS.orthros &&
                            window.OCTOECHOS.orthros.canon &&
                            window.OCTOECHOS.orthros.canon.sunday &&
                            window.OCTOECHOS.orthros.canon.sunday.tones
                                ? window.OCTOECHOS.orthros.canon.sunday.tones
                                : null;
                        const toneData = canonCorpus && tone
                            ? (canonCorpus[tone] || canonCorpus[String(tone)] || null)
                            : null;

                        if (toneData && toneData.odes) {
                            const odeItems = Object.entries(toneData.odes).map(([odeNum, ode]) => ({
                                type:  'hymn-group',
                                key:   `ode-${odeNum}`,
                                label: `Ode ${odeNum}`,
                                items: [
                                    { type: 'text', key: 'irmos',       label: 'Irmos',       text: ode.irmos      || '' },
                                    ...(ode.troparia || []).map((t, idx) => ({
                                        type: 'text', key: `troparion-${idx + 1}`, label: `Troparion ${idx + 1}`, text: t
                                    })),
                                    { type: 'text', key: 'theotokion',  label: 'Theotokion',  text: ode.theotokion || '' }
                                ]
                            }));

                            section.items[i] = {
                                type:       'hymn-group',
                                key:        'canon',
                                label:      'Canon',
                                source:     'Octoechos',
                                tone:       tone,
                                resolvedAs: 'orthros-sunday-resurrectional-canon-text',
                                family:     'sunday-resurrectional-canon',
                                items:      odeItems,
                                metadata:   toneData.metadata || { ode2Omitted: true, provisional: true }
                            };
                            continue;
                        }

                        // Corpus not loaded or tone missing — honest rubric fallback
                        const toneNote = tone ? ` Current Octoechos tone: Tone ${tone}.` : '';
                        canonText =
                            'On Sundays, the canon appointed at Orthros is the resurrectional canon from the ' +
                            'Octoechos according to the tone of the week, unless displaced by a qualifying feast.' +
                            toneNote + '\n\n' +
                            canonStructureNote + '\n\n' +
                            '(Sunday Resurrectional Canon corpus not loaded or tone entry missing.)';
                        canonResolvedAs = 'orthros-sunday-resurrectional-canon-rubric';
                    } else {
                        // Ordinary weekday (Mon–Sat) — v6.2: probe corpus before rubric
                        const WEEKDAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const WEEKDAY_THEMES = {
                            1: 'the Bodiless Powers (Angels)',
                            2: 'St. John the Baptist and the Prophets',
                            3: 'the Holy Cross and the Theotokos',
                            4: 'the Holy Apostles and St. Nicholas',
                            5: 'the Holy Cross and the Theotokos (penitential)',
                            6: 'All Saints and the Departed'
                        };

                        const tone    = toneResult && toneResult.tone ? toneResult.tone : null;
                        const dayName = WEEKDAY_NAMES[dayOfWeek] || 'this weekday';
                        const theme   = WEEKDAY_THEMES[dayOfWeek] || 'the day\'s theme';
                        canonTone = tone;

                        // Corpus probe — window.OCTOECHOS.orthros.canon.weekday.tones[tone][dayOfWeek]
                        const wdCanonCorpus =
                            typeof window !== 'undefined' &&
                            window.OCTOECHOS &&
                            window.OCTOECHOS.orthros &&
                            window.OCTOECHOS.orthros.canon &&
                            window.OCTOECHOS.orthros.canon.weekday &&
                            window.OCTOECHOS.orthros.canon.weekday.tones
                                ? window.OCTOECHOS.orthros.canon.weekday.tones
                                : null;

                        const wdCanonToneBlock = wdCanonCorpus && tone
                            ? (wdCanonCorpus[tone] || wdCanonCorpus[String(tone)] || null)
                            : null;

                        const wdCanonEntry = wdCanonToneBlock && dayOfWeek
                            ? (wdCanonToneBlock[dayOfWeek] || wdCanonToneBlock[String(dayOfWeek)] || null)
                            : null;

                        // Future-ready structured path:
                        // only fire when a real transcribed object exists.
                        if (wdCanonEntry && wdCanonEntry.odes) {
                            const odeItems = Object.entries(wdCanonEntry.odes).map(([odeNum, ode]) => ({
                                type:  'hymn-group',
                                key:   `ode-${odeNum}`,
                                label: `Ode ${odeNum}`,
                                items: [
                                    { type: 'text', key: 'irmos', label: 'Irmos', text: ode.irmos || '' },
                                    ...(ode.troparia || []).map((t, idx) => ({
                                        type: 'text',
                                        key: `troparion-${idx + 1}`,
                                        label: `Troparion ${idx + 1}`,
                                        text: t
                                    })),
                                    ...(ode.menaionTroparia || []).map((t, idx) => ({
                                        type: 'text',
                                        key: `menaion-troparion-${idx + 1}`,
                                        label: `Menaion Troparion ${idx + 1}`,
                                        text: t
                                    })),
                                    ...(ode.theotokion ? [{
                                        type: 'text',
                                        key: 'theotokion',
                                        label: 'Theotokion',
                                        text: ode.theotokion
                                    }] : [])
                                ]
                            }));

                            section.items[i] = {
                                type:       'hymn-group',
                                key:        'canon',
                                label:      'The Canon',
                                source:     'Octoechos',
                                family:     'weekday-canon',
                                tone:       tone,
                                day:        dayOfWeek,
                                metadata:   wdCanonEntry.metadata || { provisional: true },
                                items:      odeItems,
                                resolvedAs: 'orthros-ordinary-weekday-canon-text'
                            };
                            continue;
                        }

                        // Null, missing key, or corpus absent — honest rubric fallback
                        const toneNote = tone ? ` Tone ${tone},` : '';
                        canonText =
                            `ORDINARY WEEKDAY (${dayName}) — Canon: The Canon is appointed from the ` +
                            `Octoechos (${toneNote} theme: ${theme}) and the Menaion (for any saint of ` +
                            `the day). On ordinary weekdays two canons are typically combined — the ` +
                            `Octoechos Canon and the Menaion Canon — with troparia interleaved per the ` +
                            `Typikon. The katavasiae are the Irmoi of the appointed katavasiae series ` +
                            `(varies by season and proximity to feasts).\n\n` +
                            canonStructureNote + '\n\n' +
                            '(Full Octoechos and Menaion Canon texts are not yet embedded in this path. ' +
                            'Appointment, structure, and thematic identity are correct.)';
                        canonResolvedAs = 'orthros-ordinary-weekday-canon-rubric';
                    }

                    section.items[i] = {
                        type:       'rubric',
                        key:        'canon',
                        label:      'The Canon',
                        text:       canonText,
                        tone:       canonTone,
                        resolvedAs: canonResolvedAs
                    };
                    continue;
                }

                // All other items (deferred placeholders, baked rubrics) pass through unchanged.
            }
        }
    }
  // ── v6.3: _loadMidnightOfficeTheotokionData() ─────────────────────────
    async function _loadMidnightOfficeTheotokionData() {
        if (_midnightOfficeTheotokionData !== null) return;
 
        try {
            const response = await fetch(MIDNIGHT_OFFICE_THEOTOKION_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load Midnight Office theotokion data (HTTP ${response.status}); theotokion slot will use rubric fallback.`);
                return;
            }
            _midnightOfficeTheotokionData = await response.json();
            console.log('[HorologionEngine] Loaded Midnight Office theotokion data.');
        } catch (err) {
            console.warn('[HorologionEngine] _loadMidnightOfficeTheotokionData failed:', err.message, '— theotokion slot will use rubric fallback.');
        }
    }
 // ── v6.7: _loadGreatComplineFixedData() ──────────────────────────────
async function _loadGreatComplineFixedData() {
    if (_greatComplineFixedData !== null) return;
    try {
        const response = await fetch(GREAT_COMPLINE_FIXED_URL);
        if (!response.ok) {
            console.warn(`[HorologionEngine] Could not load Great Compline fixed data (HTTP ${response.status}).`);
            return;
        }
        _greatComplineFixedData = await response.json();
        console.log('[HorologionEngine] Loaded Great Compline fixed text data (v6.7).');
    } catch (err) {
        console.warn('[HorologionEngine] _loadGreatComplineFixedData failed:', err.message);
    }
}

// ── v6.7: _resolveGreatComplineSlots(sections, dateObj) ──────────────
async function _resolveGreatComplineSlots(sections, dateObj) {
    await _loadGreatComplineFixedData();

    const dayOfWeek = dateObj.getDay();
    const isFriday = (dayOfWeek === 5);
    // Governed appointment gate for Great Compline (source witness baseline)
    // Appointed:
    //   - Monday–Thursday in Great Lent
    //   - Friday in the 1st, 2nd, 3rd, 4th, and 6th weeks of Lent
    //   - Tuesday and Thursday in the week before Lent
    //   - Monday and Tuesday in Holy Week
    // Not appointed:
    //   - Saturday
    //   - Sunday
    //   - other weekdays outside those bounded periods

    const localDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const MS_PER_DAY = 86400000;
    const pascha = _getOrthodoxPascha(dateObj.getFullYear());
    const cleanMonday = new Date(pascha.getTime() - 48 * MS_PER_DAY);
    const holyMonday = new Date(pascha.getTime() - 6 * MS_PER_DAY);
    const holyTuesday = new Date(pascha.getTime() - 5 * MS_PER_DAY);
    const preLentWeekStart = new Date(cleanMonday.getTime() - 7 * MS_PER_DAY);

    const sameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const daysSinceCleanMonday = Math.round((localDate.getTime() - cleanMonday.getTime()) / MS_PER_DAY);
    const inGreatLentProper = localDate >= cleanMonday && localDate < holyMonday;
    const inPreLentWeek = localDate >= preLentWeekStart && localDate < cleanMonday;
    const inHolyWeekMondayTuesday = sameDay(localDate, holyMonday) || sameDay(localDate, holyTuesday);

    let greatComplineAppointed = false;

    if (inGreatLentProper) {
        if (dayOfWeek >= 1 && dayOfWeek <= 4) {
            greatComplineAppointed = true;
        } else if (dayOfWeek === 5) {
            const lentenWeek = Math.floor(daysSinceCleanMonday / 7) + 1;
            greatComplineAppointed = [1, 2, 3, 4, 6].includes(lentenWeek);
        }
    } else if (inPreLentWeek) {
        greatComplineAppointed = (dayOfWeek === 2 || dayOfWeek === 4);
    } else if (inHolyWeekMondayTuesday) {
        greatComplineAppointed = true;
    }

    if (!greatComplineAppointed) {
        sections.length = 0;
        sections.push({
            id: 'great-compline-not-appointed',
            label: 'Great Compline Not Appointed',
            items: [
                {
                    type: 'rubric',
                    key: 'gc-not-appointed-rubric',
                    text: 'Per the current Great Compline source witness, Great Compline is not appointed for this day. Appointed days in this baseline are: Monday–Thursday in Great Lent; Friday in Lent weeks 1, 2, 3, 4, and 6; Tuesday and Thursday in the week before Lent; and Monday and Tuesday in Holy Week.'
                }
            ]
        });
        return;
    }
    let isFirstWeekOfLent = false;
    try {
        const toneResult = _computeBaselineTone(dateObj);
        const seasonResult = _computeLiturgicalSeason(dateObj, toneResult);
        if (seasonResult && seasonResult.season === 'great-lent') {
            const pascha = _getOrthodoxPascha(dateObj.getFullYear());
            const cleanMonday = new Date(pascha.getTime() - 48 * 86400000);
            const local = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            const daysSince = Math.round((local.getTime() - cleanMonday.getTime()) / 86400000);
            isFirstWeekOfLent = (daysSince >= 0 && daysSince < 7);
        }
    } catch (e) {
        console.warn('[HorologionEngine] _resolveGreatComplineSlots: lent week detection failed:', e.message);
    }

    const FIXED_KEYS = new Set([
            'gc-usual-beginning', 'gc-psalm-4', 'gc-psalm-6', 'gc-psalm-12',
            'gc-inter-doxology-1',
            'gc-psalm-24', 'gc-psalm-30', 'gc-psalm-90',
            'gc-inter-doxology-2',
            'gc-angelic-hymn',
            'gc-god-is-with-us', 'gc-day-being-past', 'gc-creed',
            'gc-litanic-intercessions', 'gc-trisagion-1',
            'gc-kyrie-40-prayer-of-basil',
            'gc-psalm-50', 'gc-psalm-101', 'gc-prayer-of-manasseh',
            'gc-trisagion-2', 'gc-come-worship-2', 'gc-come-worship-trisagion',
            'gc-sixth-tone-troparia',
            'gc-kyrie-40-maradius', 'gc-come-worship-3',
            'gc-psalm-142', 'gc-small-doxology',
            'gc-closing-prayer-block',
            'gc-trisagion-4', 'gc-save-help-protect',
            'gc-supplicatory-prayer-theotokos', 'gc-prayer-antiochus',
            'gc-prayer-joannicius', 'gc-prayer-guardian-angel',
            'gc-ave-maria', 'gc-dismissal-prayers'
        ]);

    const _slot = (key) =>
        _greatComplineFixedData &&
        _greatComplineFixedData.slots &&
        _greatComplineFixedData.slots[key];

    const _applyFixed = (item, key) => {
    const s = _slot(key);
    if (!s) return item;

    const resolved = {
        key: item.key,
        type: s.type || 'text',
        label: s.label || item.label,
        resolvedAs: 'great-compline-fixed'
    };

    if (typeof s.text !== 'undefined') resolved.text = s.text;
    if (Array.isArray(s.items)) resolved.items = s.items;
    if (typeof s.lxxNumber !== 'undefined') resolved.lxxNumber = s.lxxNumber;
    if (typeof s.hebrewNumber !== 'undefined') resolved.hebrewNumber = s.hebrewNumber;
    if (typeof s.rubric !== 'undefined') resolved.rubric = s.rubric;
    if (typeof s.repeat !== 'undefined') resolved.repeat = s.repeat;

    return resolved;
};

    for (const section of sections) {
        if (!Array.isArray(section.items)) continue;

        for (let i = 0; i < section.items.length; i++) {
            const item = section.items[i];

            if (FIXED_KEYS.has(item.key)) {
                section.items[i] = _applyFixed(section.items[i], item.key);
                continue;
            }

            if (item.key === 'gc-psalm-69-week1') {
                if (isFirstWeekOfLent) {
                    section.items[i] = _applyFixed(section.items[i], 'gc-psalm-69-week1');
                } else {
                    section.items[i] = {
                        type: 'rubric',
                        key: item.key,
                        label: 'Psalm 69 — omitted',
                        text: '(Psalm 69 is read only in the first week of Great Lent at this position. Omitted today.)',
                        resolvedAs: 'great-compline-conditional-omitted'
                    };
                }
                continue;
            }

            if (item.key === 'gc-psalm-69-second') {
                if (!isFirstWeekOfLent) {
                    section.items[i] = _applyFixed(section.items[i], 'gc-psalm-69-second');
                } else {
                    section.items[i] = {
                        type: 'rubric',
                        key: item.key,
                        label: 'Psalm 69 — omitted (first week)',
                        text: '(Psalm 69 is omitted in the first week of Great Lent at this position.)',
                        resolvedAs: 'great-compline-conditional-omitted'
                    };
                }
                continue;
            }

            if (item.key === 'gc-lord-of-hosts') {
                if (!isFriday) {
                    section.items[i] = _applyFixed(section.items[i], 'gc-lord-of-hosts');
                } else {
                    const satKontakion = _slot('gc-saturday-kontakion');
                    if (satKontakion) {
                        section.items[i] = {
                            type: satKontakion.type || 'text',
                            key: item.key,
                            label: satKontakion.label || 'Kontakion of the Saturday Commemoration',
                            rubric: satKontakion.rubric,
                            text: satKontakion.text,
                            resolvedAs: 'great-compline-friday-saturday-kontakion'
                        };
                    } else {
                        section.items[i] = {
                            type: 'rubric',
                            key: item.key,
                            label: 'O Lord of Hosts — omitted (Friday)',
                            text: '(On Friday evenings "O Lord of Hosts" is omitted. Saturday kontakion corpus not loaded.)',
                            resolvedAs: 'great-compline-friday-omission'
                        };
                    }
                }
                continue;
            }

            if (item.key === 'gc-prayer-of-ephraim') {
                if (!isFriday) {
                    section.items[i] = _applyFixed(section.items[i], 'gc-prayer-of-ephraim');
                } else {
                    section.items[i] = {
                        type: 'rubric',
                        key: item.key,
                        label: 'Prayer of St. Ephraim — omitted (Friday)',
                        text: '(The Prayer of St. Ephraim the Syrian is not said on Friday evenings.)',
                        resolvedAs: 'great-compline-friday-omission'
                    };
                }
                continue;
            }

         if (item.key === 'gc-weekday-troparia') {
                const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const d = DAY[dayOfWeek] || 'this day';

                // Great Compline is appointed only in bounded seasons.
                // During Great Lent, only rank 1–2 commemorations displace the ordinary weekday troparia.
                const GC_TROPARIA_MAX_QUALIFYING_RANK = 2;
                let gcTropariaFeastOverride = false;
                let gcTropariaSaintName = null;
                let gcTropariaRank = null;

                try {
                    if (window.MenaionResolver && typeof window.MenaionResolver.queryTroparion === 'function') {
                        const month = dateObj.getMonth() + 1;
                        const day   = dateObj.getDate();
                        const mmdd  = String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
                        const mResult = await window.MenaionResolver.queryTroparion(mmdd);

                        const hasCommemoration = mResult &&
                            (mResult.status === 'menaion-resolved' ||
                             mResult.status === 'menaion-text-unavailable');

                        const rank = hasCommemoration && typeof mResult.rank === 'number'
                            ? mResult.rank
                            : null;

                        if (hasCommemoration && rank !== null && rank >= 1 && rank <= GC_TROPARIA_MAX_QUALIFYING_RANK) {
                            gcTropariaFeastOverride = true;
                            gcTropariaSaintName = mResult.name || 'the feast of the day';
                            gcTropariaRank = rank;
                        }
                    }
                } catch (e) {
                    console.warn('[HorologionEngine] gc-weekday-troparia Menaion probe failed:', e.message);
                }

                if (gcTropariaFeastOverride) {
                    const menaionSlot = _slot('gc-weekday-troparia-menaion');

                    if (menaionSlot) {
                        section.items[i] = {
                            type: menaionSlot.type || 'rubric',
                            key: item.key,
                            label: `Weekday Troparia — ${d} (Menaion Feast Override)`,
                            text: `${menaionSlot.text} Feast: ${gcTropariaSaintName} (rank ${gcTropariaRank}).`,
                            resolvedAs: 'great-compline-weekday-troparia-menaion-feast-override',
                            commemoration: gcTropariaSaintName,
                            rank: gcTropariaRank
                        };
                    } else {
                        section.items[i] = {
                            type: 'rubric',
                            key: item.key,
                            label: `Weekday Troparia — ${d} (Menaion Feast Override)`,
                            text: `${d} — A qualifying feast (${gcTropariaSaintName}, rank ${gcTropariaRank}) is commemorated today. The Menaion weekday troparia are appointed here in place of the ordinary Great Compline weekday troparia sequence. Menaion Great Compline troparia slot data is not loaded in this build.`,
                            resolvedAs: 'great-compline-weekday-troparia-menaion-feast-override',
                            commemoration: gcTropariaSaintName,
                            rank: gcTropariaRank
                        };
                    }
                    continue;
                }

                const fixedKey = (dayOfWeek === 1 || dayOfWeek === 3) ? 'gc-weekday-troparia-mon-wed'
                               : (dayOfWeek === 2 || dayOfWeek === 4) ? 'gc-weekday-troparia-tue-thu'
                               : null;
                const fixedEntry = fixedKey ? _slot(fixedKey) : null;

                if (fixedEntry) {
                    section.items[i] = _applyFixed(section.items[i], fixedKey);
                    section.items[i].resolvedAs = fixedKey === 'gc-weekday-troparia-mon-wed'
                        ? 'great-compline-weekday-troparia-mon-wed-text'
                        : 'great-compline-weekday-troparia-tue-thu-text';
                } else {
                    let text, resolvedAs;
                    if (dayOfWeek === 1 || dayOfWeek === 3) {
                        text = `${d} — Weekday Troparia in Tone 2 (Mon/Wed): "Enlighten mine eyes, O Christ God…" Theotokion follows. Full text deferred to corpus tranche.`;
                        resolvedAs = 'great-compline-weekday-troparia-mon-wed-rubric';
                    } else if (dayOfWeek === 2 || dayOfWeek === 4) {
                        text = `${d} — Weekday Troparia in Tone 8 (Tue/Thu): "O Lord, You know the unsleeping vigilance…" Theotokion follows. Full text deferred to corpus tranche.`;
                        resolvedAs = 'great-compline-weekday-troparia-tue-thu-rubric';
                    } else {
                        text = `${d}: Weekday troparia not prescribed for this day in the standard Great Lent cycle. If a feast is appointed, the Troparion of the Feast is substituted.`;
                        resolvedAs = 'great-compline-weekday-troparia-unscheduled';
                    }
                    section.items[i] = {
                        type: 'rubric',
                        key: item.key,
                        label: `Weekday Troparia — ${d}`,
                        text,
                        resolvedAs
                    };
                }
                continue;
            }

            if (item.key === 'gc-canon') {
                // ── gc-canon: route to fixed-data slot paths ──────────────
                // Three governed states:
                //   1. First week of Great Lent → gc-canon-great-canon
                //   2. Rank 1–2 Menaion feast on appointed day → gc-canon-menaion
                //      (saint name injected into rubric text at runtime)
                //   3. All other appointed days → gc-canon-octoechos
                // Governing logic is preserved exactly from prior inline form.

                if (isFirstWeekOfLent) {
                    // ── v7.2: probe null-sentinel corpus before rubric fallback ──
                    const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
                    const dayName = DAY_NAMES[dateObj.getDay()] || null;
                    const greatCanonCorpus = dayName ? _getGcCanonGreatCanon(dayName) : undefined;
                    if (greatCanonCorpus && typeof greatCanonCorpus.text === 'string') {
                        // Corpus text is populated for this evening.
                        section.items[i] = {
                            type:       'text',
                            key:        item.key,
                            label:      greatCanonCorpus.label || `Canon — Great Canon of Saint Andrew of Crete (${dayName.charAt(0).toUpperCase() + dayName.slice(1)})`,
                            text:       greatCanonCorpus.text,
                            day:        dayName,
                            resolvedAs: 'gc-canon-great-canon-text'
                        };
                    } else {
                        // Sentinel is null, or corpus not loaded — honest rubric degradation.
                        const greatCanonSlot = _slot('gc-canon-great-canon');
                        if (greatCanonSlot) {
                            section.items[i] = {
                                type:       greatCanonSlot.type || 'rubric',
                                key:        item.key,
                                label:      greatCanonSlot.label || 'Canon — Great Canon of Saint Andrew of Crete',
                                text:       greatCanonSlot.text,
                                resolvedAs: 'gc-canon-great-canon'
                            };
                        } else {
                            section.items[i] = {
                                type:       'rubric',
                                key:        item.key,
                                label:      'Canon — Great Canon of Saint Andrew of Crete',
                                text:       '(FIRST WEEK OF GREAT LENT — Great Canon slot: data/horologion/great-compline-fixed.json gc-canon-great-canon not loaded.)',
                                resolvedAs: 'gc-canon-great-canon-data-unavailable'
                            };
                        }
                    }
                } else {
                    // Probe Menaion for a qualifying rank 1–2 commemoration.
                    const GC_MAX_QUALIFYING_RANK = 2;
                    let canonItem = null;
                    try {
                        if (window.MenaionResolver && typeof window.MenaionResolver.queryTroparion === 'function') {
                            const month = dateObj.getMonth() + 1;
                            const day   = dateObj.getDate();
                            const mmdd  = String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
                            const mResult = await window.MenaionResolver.queryTroparion(mmdd);
                            const hasCommemoration = mResult &&
                                (mResult.status === 'menaion-resolved' ||
                                 mResult.status === 'menaion-text-unavailable');
                            const rank = hasCommemoration && typeof mResult.rank === 'number'
                                ? mResult.rank : null;
                            const qualifies = hasCommemoration &&
                                rank !== null && rank >= 1 && rank <= GC_MAX_QUALIFYING_RANK;
                            if (qualifies) {
                                const saintName = mResult.name || 'the saint of the day';
                                // ── v7.3: probe null-sentinel Menaion canon corpus ──
                                const menaionCorpus = _getGcCanonMenaion(mmdd);
                                if (menaionCorpus) {
                                    canonItem = {
                                        type:       'text',
                                        key:        item.key,
                                        label:      menaionCorpus.label || `Canon (Menaion) — ${saintName}`,
                                        text:       menaionCorpus.text,
                                        resolvedAs: 'gc-canon-menaion-text'
                                    };
                                } else {
                                    const menaionSlotBase = _slot('gc-canon-menaion');
                                    const menaionText = menaionSlotBase
                                        ? menaionSlotBase.text.replace(
                                            'A qualifying feast (rank 1–2) is commemorated today.',
                                            `${saintName} (rank ${rank}) is commemorated today.`
                                          )
                                        : `A qualifying feast (${saintName}, rank ${rank}) is commemorated today. Menaion canon corpus not loaded.`;
                                    canonItem = {
                                        type:       'rubric',
                                        key:        item.key,
                                        label:      menaionSlotBase ? (menaionSlotBase.label || 'Canon (Menaion)') : 'Canon (Menaion)',
                                        text:       menaionText,
                                        resolvedAs: 'gc-canon-menaion'
                                    };
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('[HorologionEngine] gc-canon Menaion probe failed:', e.message);
                    }
                    if (!canonItem) {
                        // ── v7.1: probe null-sentinel corpus before rubric fallback ──
                        let toneForCanon = null;
                        try {
                            const tr = _computeBaselineTone(dateObj);
                            toneForCanon = tr && tr.tone ? String(tr.tone) : null;
                        } catch (e) {
                            console.warn('[HorologionEngine] gc-canon: tone computation failed:', e.message);
                        }

                        const corpusEntry = toneForCanon !== null
                            ? _getGcCanonOctoechos(toneForCanon)
                            : undefined;

                        if (corpusEntry && typeof corpusEntry.text === 'string') {
                            // Corpus text is populated for this tone.
                            canonItem = {
                                type:       'text',
                                key:        item.key,
                                label:      corpusEntry.label || `Canon (Octoechos — Theotokos, Tone ${toneForCanon})`,
                                text:       corpusEntry.text,
                                tone:       toneForCanon,
                                resolvedAs: 'gc-canon-octoechos-text'
                            };
                        } else {
                            // Sentinel is null, or corpus not loaded — honest rubric degradation.
                            const octoechosSlot = _slot('gc-canon-octoechos');
                            const toneLabel = toneForCanon ? ` Tone ${toneForCanon}.` : '';
                            canonItem = octoechosSlot
                                ? {
                                    type:       octoechosSlot.type || 'rubric',
                                    key:        item.key,
                                    label:      octoechosSlot.label || 'Canon (Octoechos — Theotokos)',
                                    text:       octoechosSlot.text + toneLabel,
                                    tone:       toneForCanon,
                                    resolvedAs: 'gc-canon-octoechos'
                                  }
                                : {
                                    type:       'rubric',
                                    key:        item.key,
                                    label:      'Canon (Octoechos — Theotokos)',
                                    text:       '(Great Compline canon slot: data/horologion/great-compline-fixed.json gc-canon-octoechos not loaded.)',
                                    resolvedAs: 'gc-canon-octoechos-data-unavailable'
                                  };
                        }
                    }
                    section.items[i] = canonItem;
                }
                continue;
            }

            if (item.key === 'gc-closing-theotokion') {
                const isTueThu = (dayOfWeek === 2 || dayOfWeek === 4);
                const theotokKey = isTueThu ? 'gc-theotokion-tue-thu' : 'gc-theotokion-mon-wed-fri';
                const s = _slot(theotokKey);

                if (s) {
                    section.items[i] = {
                        type: 'text',
                        key: item.key,
                        label: s.label || 'Closing Theotokion',
                        text: s.text,
                        resolvedAs: isTueThu ? 'great-compline-cross-theotokion' : 'great-compline-joy-theotokion'
                    };
                } else {
                    section.items[i] = {
                        type: 'rubric',
                        key: item.key,
                        label: 'Closing Theotokion',
                        text: isTueThu
                            ? 'Tue/Thu: Cross Theotokion (Tone 1) — data not loaded.'
                            : 'Mon/Wed/Fri: Theotokion (Tone 2) — data not loaded.',
                        resolvedAs: 'great-compline-theotokion-data-unavailable'
                    };
                }
                continue;
            }
        }
    }
}
   // ── v6.2: _loadMidnightOfficeFixedData() ─────────────────────────────
    async function _loadMidnightOfficeFixedData() {
        if (_midnightOfficeFixedData !== null) return;
 
        try {
            const response = await fetch(MIDNIGHT_OFFICE_FIXED_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load Midnight Office fixed data (HTTP ${response.status}); fixed slots will remain as placeholders.`);
                return;
            }
            _midnightOfficeFixedData = await response.json();
            console.log('[HorologionEngine] Loaded Midnight Office fixed text data.');
        } catch (err) {
            console.warn('[HorologionEngine] _loadMidnightOfficeFixedData failed:', err.message, '— fixed slots will remain as placeholders.');
        }
    }
 
    // ── v6.2: _resolveMidnightOfficeSlots(sections, dateObj) ─────────────
    //
    // Slot resolution pass for the Midnight Office (Mesoniktikon).
    //
    // Fixed slots resolved from midnight-office-fixed.json:
    //   usual-beginning, psalm-50, psalm-117, psalm-118,
    //   trisagion-prayers, prayer-of-the-midnight-office
    //
    // Variable slots (honest rubric stubs — deferred beyond tranche 1):
    //   troparion-of-the-day
    //   midnight-office-theotokion
    //
    // Non-throwing. On data file failure, fixed slots remain as placeholders.
    // ─────────────────────────────────────────────────────────────────────
   async function _resolveMidnightOfficeSlots(sections, dateObj) {
       await Promise.all([
            _loadMidnightOfficeFixedData(),
            _loadMidnightOfficeTheotokionData(),
            _loadTroparionData(),
            _loadWeekdayTroparionMeta(),
            _loadTriodionData()
        ]);
 
        const dayOfWeek  = dateObj.getDay();
        const toneResult = _computeBaselineTone(dateObj);
 
        const FIXED_SLOT_KEYS = new Set([
            'usual-beginning',
            'psalm-50',
            'psalm-117',
            'psalm-118',
            'trisagion-prayers',
            'prayer-of-the-midnight-office'
        ]);
 
        for (const section of sections) {
            if (!Array.isArray(section.items)) continue;
 
            for (let i = 0; i < section.items.length; i++) {
                const item = section.items[i];
 
                // ── Fixed slots ───────────────────────────────────────────
                if (FIXED_SLOT_KEYS.has(item.key)) {
                    const slotData = _midnightOfficeFixedData &&
                        _midnightOfficeFixedData.slots &&
                        _midnightOfficeFixedData.slots[item.key];
 
                    if (slotData) {
    section.items[i] = {
        ...slotData,
        key:        item.key,
        label:      slotData.label || item.label,
        resolvedAs: 'midnight-office-fixed'
    };
}
                    // If data not loaded: item remains placeholder — correct degradation.
                    continue;
                }
 
                // ── troparion-of-the-day — v6.2: delegate to shared stack ─
                if (item.key === 'troparion-of-the-day') {
                    const resolved = await _resolveLittleHourSeasonalTroparionSlot(
                        'midnight-office', dayOfWeek, dateObj, toneResult
                    );
                    if (resolved) {
                        section.items[i] = Object.assign({}, resolved, {
                            key: 'troparion-of-the-day'
                        });
                    }
                    // If null (data load failed): slot remains placeholder.
                    continue;
                }
 
                  // ── midnight-office-theotokion — v6.4: fixed-backed positional slot ──
                if (item.key === 'midnight-office-theotokion') {
                    // Policy (v6.4): positional, office-specific node.
                    // No tone, no day-of-week, no feast override, no Stavrotheotokion.
                    // Probe flat fixed-slot structure: slots["midnight-office-theotokion"].
                    const entry =
                        _midnightOfficeTheotokionData &&
                        _midnightOfficeTheotokionData.slots
                            ? (_midnightOfficeTheotokionData.slots['midnight-office-theotokion'] ?? null)
                            : null;
 
                    if (typeof entry === 'string' && entry.length > 0) {
                        section.items[i] = {
                            type:       'text',
                            key:        'midnight-office-theotokion',
                            label:      'Theotokion of the Midnight Office',
                            text:       entry,
                            source:     'Horologion',
                            resolvedAs: 'midnight-office-theotokion-text'
                        };
                    } else {
                        section.items[i] = {
                            type:       'rubric',
                            key:        'midnight-office-theotokion',
                            label:      'Theotokion of the Midnight Office',
                            text:       'MIDNIGHT OFFICE — Theotokion: The fixed Theotokion of the Midnight Office has not yet been transcribed.',
                            resolvedAs: 'midnight-office-theotokion-not-transcribed'
                        };
                    }
                    continue;
                }
 
                // All other items (baked rubrics) pass through unchanged.
            }
        }
    }
 
    async function _resolveComplineSlots(sections, dateObj) {
    await Promise.all([
        _loadComplineFixedData(),
        _loadTroparionData(),
        _loadWeekdayTroparionMeta(),
        _loadTriodionData()
    ]);

    const dayOfWeek  = dateObj.getDay();
    const toneResult = _computeBaselineTone(dateObj);

    const FIXED_SLOT_KEYS = new Set([
        'usual-beginning',
        'psalm-50',
        'psalm-69',
        'psalm-142',
        'doxology',
        'creed',
        'trisagion-prayers',
        'prayer-of-basil',
        'into-thy-hands'
    ]);

    for (const section of sections) {
        if (!Array.isArray(section.items)) continue;

        for (let i = 0; i < section.items.length; i++) {
            const item = section.items[i];

            // ── Fixed slots ───────────────────────────────────────────
            if (FIXED_SLOT_KEYS.has(item.key)) {
                const slotData = _complineFixedData &&
                    _complineFixedData.slots &&
                    _complineFixedData.slots[item.key];

                if (slotData) {
                    section.items[i] = {
                        type:       slotData.type || 'text',
                        key:        item.key,
                        label:      slotData.label || item.label,
                        text:       slotData.text,
                        lxxNumber:  slotData.lxxNumber,
                        items:      Array.isArray(slotData.items) ? slotData.items : undefined,
                        resolvedAs: 'compline-fixed'
                    };
                }
                continue;
            }

            // ── troparion-of-the-day ──────────────────────────────────
            if (item.key === 'troparion-of-the-day') {
                const resolved = await _resolveComplineSeasonalTroparionSlot(dayOfWeek, dateObj, toneResult);
                if (resolved) {
                    section.items[i] = Object.assign({}, resolved, {
                        key: 'troparion-of-the-day'
                    });
                }
                // If null (data load failed): slot remains placeholder.
                continue;
            }

            // ── compline-theotokion (v4.4) ────────────────────────────
            if (item.key === 'compline-theotokion') {
                const troparionItem =
                    section.items.find(it => it && it.key === 'troparion-of-the-day') || null;

                const fallbackRubric = {
                    type:       'rubric',
                    key:        'compline-theotokion',
                    label:      item.label || 'Theotokion of Compline',
                    text:       'On ordinary days, the proper Theotokion appointment for Small Compline belongs here. The full text for this office is not yet available in this path.',
                    resolvedAs: 'compline-theotokion-deferred'
                };

                section.items[i] =
                    _resolveComplineFestalTheotokionRubric(
                        'small-compline',
                        troparionItem,
                        fallbackRubric
                    );
                continue;
            }

            // All other items (baked rubrics) pass through unchanged.
        }
    }
}
    async function _loadFirstHourFixedData() {
        if (_firstHourFixedData !== null) return;

        try {
            const response = await fetch(FIRST_HOUR_FIXED_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load First Hour fixed data (HTTP ${response.status}); fixed slots will remain as placeholders.`);
                return;
            }
            _firstHourFixedData = await response.json();
            console.log('[HorologionEngine] Loaded First Hour fixed text data.');
        } catch (err) {
            console.warn('[HorologionEngine] _loadFirstHourFixedData failed:', err.message, '— fixed slots will remain as placeholders.');
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // v3.1: _resolveFirstHourSlots(sections, dateObj)
    //
    // Slot resolution pass for the First Hour (Prima).
    //
    // Fixed slots resolved from first-hour-fixed.json:
    //   usual-beginning, psalm-5, psalm-89, psalm-100,
    //   trisagion-prayers, prayer-of-the-first-hour
    //
    // Variable slots:
    //   troparion-of-the-day: delegates to _resolveTroparionSlot()
    //     (same infrastructure as Vespers and Small Compline).
    //   first-hour-theotokion: tone-dependent dismissal Theotokion.
    //     Baseline: deferred — requires Octoechos weekday Theotokion
    //     data keyed for First Hour. Rendered as explicit rubric stub.
    //
    // Non-throwing. On data file failure, fixed slots remain as placeholders.
    // ──────────────────────────────────────────────────────────────────────
    async function _resolveFirstHourSlots(sections, dateObj) {
        await Promise.all([
            _loadFirstHourFixedData(),
            _loadTroparionData(),
            _loadWeekdayTroparionMeta(),
            _loadTriodionData()
        ]);

        const dayOfWeek  = dateObj.getDay();
        const toneResult = _computeBaselineTone(dateObj);

        const FIXED_SLOT_KEYS = new Set([
            'usual-beginning',
            'psalm-5',
            'psalm-89',
            'psalm-100',
            'trisagion-prayers',
            'prayer-of-the-first-hour'
        ]);

        for (const section of sections) {
            if (!Array.isArray(section.items)) continue;

            for (let i = 0; i < section.items.length; i++) {
                const item = section.items[i];

                // ── Fixed slots ───────────────────────────────────────────
                if (FIXED_SLOT_KEYS.has(item.key)) {
                    const slotData = _firstHourFixedData &&
                        _firstHourFixedData.slots &&
                        _firstHourFixedData.slots[item.key];

                    if (slotData) {
                        section.items[i] = {
                            type:       slotData.type || 'text',
                            key:        item.key,
                            label:      slotData.label || item.label,
                            text:       slotData.text,
                            lxxNumber:  slotData.lxxNumber,
                            items:      Array.isArray(slotData.items) ? slotData.items : undefined,
                            resolvedAs: 'first-hour-fixed'
                        };
                    }
                    // If data not loaded: item remains placeholder — correct degradation.
                    continue;
                }

                // ── troparion-of-the-day ──────────────────────────────────
                if (item.key === 'troparion-of-the-day') {
                    const resolved = await _resolveLittleHourSeasonalTroparionSlot('first-hour', dayOfWeek, dateObj, toneResult);
                    if (resolved) {
                        section.items[i] = Object.assign({}, resolved, {
                            key: 'troparion-of-the-day'
                        });
                    }
                    continue;
                }

                // ── first-hour-theotokion — deferred baseline / festal rubric override ──
                if (item.key === 'first-hour-theotokion') {
                    const troparionItem =
                        section.items.find(it => it && it.key === 'troparion-of-the-day') || null;

                    const fallbackRubric = _normalizeTheotokionRubricForOffice('first-hour', {
                        type:       'rubric',
                        key:        'first-hour-theotokion',
                        label:      item.label || 'Theotokion of the First Hour',
                        text:       'On ordinary days, the proper Theotokion appointment for the First Hour belongs here. The full text for this office is not yet available in this path.',
                        resolvedAs: 'first-hour-theotokion-deferred'
                    }, toneResult, dayOfWeek);

                    section.items[i] = _resolveLittleHourFestalTheotokionRubric(
                        'first-hour',
                        troparionItem,
                        fallbackRubric
                    );
                    continue;
                }

                // All other items (baked rubrics) pass through unchanged.
            }
        }
    }
async function _loadThirdHourFixedData() {
        if (_thirdHourFixedData !== null) return;

        try {
            const response = await fetch(THIRD_HOUR_FIXED_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load Third Hour fixed data (HTTP ${response.status}); fixed slots will remain as placeholders.`);
                return;
            }
            _thirdHourFixedData = await response.json();
            console.log('[HorologionEngine] Loaded Third Hour fixed text data.');
        } catch (err) {
            console.warn('[HorologionEngine] _loadThirdHourFixedData failed:', err.message, '— fixed slots will remain as placeholders.');
        }
    }
    async function _resolveThirdHourSlots(sections, dateObj) {
        await Promise.all([
            _loadThirdHourFixedData(),
            _loadTroparionData(),
            _loadWeekdayTroparionMeta(),
            _loadTriodionData()
        ]);

        const dayOfWeek  = dateObj.getDay();
        const toneResult = _computeBaselineTone(dateObj);

        const FIXED_SLOT_KEYS = new Set([
            'usual-beginning',
            'psalm-16',
            'psalm-24',
            'psalm-50',
            'trisagion-prayers',
            'prayer-of-the-third-hour'
        ]);

        for (const section of sections) {
            if (!Array.isArray(section.items)) continue;

            for (let i = 0; i < section.items.length; i++) {
                const item = section.items[i];

                if (FIXED_SLOT_KEYS.has(item.key)) {
                    const slotData = _thirdHourFixedData &&
                        _thirdHourFixedData.slots &&
                        _thirdHourFixedData.slots[item.key];

                    if (slotData) {
                        section.items[i] = {
                            type:       slotData.type || 'text',
                            key:        item.key,
                            label:      slotData.label || item.label,
                            text:       slotData.text,
                            lxxNumber:  slotData.lxxNumber,
                            items:      Array.isArray(slotData.items) ? slotData.items : undefined,
                            resolvedAs: 'third-hour-fixed'
                        };
                    }
                    continue;
                }

                if (item.key === 'troparion-of-the-day') {
                    const resolved = await _resolveLittleHourSeasonalTroparionSlot('third-hour', dayOfWeek, dateObj, toneResult);
                    if (resolved) {
                        section.items[i] = Object.assign({}, resolved, {
                            key: 'troparion-of-the-day'
                        });
                    }
                    continue;
                }

                                if (item.key === 'third-hour-theotokion') {
                    const troparionItem =
                        section.items.find(it => it && it.key === 'troparion-of-the-day') || null;

                    const fallbackRubric = _normalizeTheotokionRubricForOffice('third-hour', {
                        type:       'rubric',
                        key:        'third-hour-theotokion',
                        label:      item.label || 'Theotokion of the Third Hour',
                        text:       'On ordinary days, the proper Theotokion appointment for the Third Hour belongs here. The full text for this office is not yet available in this path.',
                        resolvedAs: 'third-hour-theotokion-deferred'
                    }, toneResult, dayOfWeek);

                    section.items[i] = _resolveLittleHourFestalTheotokionRubric(
                        'third-hour',
                        troparionItem,
                        fallbackRubric
                    );
                    continue;
                }
            }
        }
    }

    async function _loadSixthHourFixedData() {
        if (_sixthHourFixedData !== null) return;

        try {
            const response = await fetch(SIXTH_HOUR_FIXED_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load Sixth Hour fixed data (HTTP ${response.status}); fixed slots will remain as placeholders.`);
                return;
            }
            _sixthHourFixedData = await response.json();
            console.log('[HorologionEngine] Loaded Sixth Hour fixed text data.');
        } catch (err) {
            console.warn('[HorologionEngine] _loadSixthHourFixedData failed:', err.message, '— fixed slots will remain as placeholders.');
        }
    }

    async function _resolveSixthHourSlots(sections, dateObj) {
        await Promise.all([
            _loadSixthHourFixedData(),
            _loadTroparionData(),
            _loadWeekdayTroparionMeta(),
            _loadTriodionData()
        ]);

        const dayOfWeek  = dateObj.getDay();
        const toneResult = _computeBaselineTone(dateObj);

        const FIXED_SLOT_KEYS = new Set([
            'usual-beginning',
            'psalm-53',
            'psalm-54',
            'psalm-90',
            'trisagion-prayers',
            'prayer-of-the-sixth-hour'
        ]);

        for (const section of sections) {
            if (!Array.isArray(section.items)) continue;

            for (let i = 0; i < section.items.length; i++) {
                const item = section.items[i];

                if (FIXED_SLOT_KEYS.has(item.key)) {
                    const slotData = _sixthHourFixedData &&
                        _sixthHourFixedData.slots &&
                        _sixthHourFixedData.slots[item.key];

                    if (slotData) {
                        section.items[i] = {
                            type:       slotData.type || 'text',
                            key:        item.key,
                            label:      slotData.label || item.label,
                            text:       slotData.text,
                            lxxNumber:  slotData.lxxNumber,
                            items:      Array.isArray(slotData.items) ? slotData.items : undefined,
                            resolvedAs: 'sixth-hour-fixed'
                        };
                    }
                    continue;
                }

                if (item.key === 'troparion-of-the-day') {
                    const resolved = await _resolveLittleHourSeasonalTroparionSlot('sixth-hour', dayOfWeek, dateObj, toneResult);
                    if (resolved) {
                        section.items[i] = Object.assign({}, resolved, {
                            key: 'troparion-of-the-day'
                        });
                    }
                    continue;
                }

                                if (item.key === 'sixth-hour-theotokion') {
                    const troparionItem =
                        section.items.find(it => it && it.key === 'troparion-of-the-day') || null;

                    const fallbackRubric = _normalizeTheotokionRubricForOffice('sixth-hour', {
                        type:       'rubric',
                        key:        'sixth-hour-theotokion',
                        label:      item.label || 'Theotokion of the Sixth Hour',
                        text:       'On ordinary days, the proper Theotokion appointment for the Sixth Hour belongs here. The full text for this office is not yet available in this path.',
                        resolvedAs: 'sixth-hour-theotokion-deferred'
                    }, toneResult, dayOfWeek);

                    section.items[i] = _resolveLittleHourFestalTheotokionRubric(
                        'sixth-hour',
                        troparionItem,
                        fallbackRubric
                    );
                    continue;
                }
            }
        }
    }

    async function _loadNinthHourFixedData() {
        if (_ninthHourFixedData !== null) return;

        try {
            const response = await fetch(NINTH_HOUR_FIXED_URL);
            if (!response.ok) {
                console.warn(`[HorologionEngine] Could not load Ninth Hour fixed data (HTTP ${response.status}); fixed slots will remain as placeholders.`);
                return;
            }
            _ninthHourFixedData = await response.json();
            console.log('[HorologionEngine] Loaded Ninth Hour fixed text data.');
        } catch (err) {
            console.warn('[HorologionEngine] _loadNinthHourFixedData failed:', err.message, '— fixed slots will remain as placeholders.');
        }
    }

    async function _resolveNinthHourSlots(sections, dateObj) {
        await Promise.all([
            _loadNinthHourFixedData(),
            _loadTroparionData(),
            _loadWeekdayTroparionMeta(),
            _loadTriodionData()
        ]);

        const dayOfWeek  = dateObj.getDay();
        const toneResult = _computeBaselineTone(dateObj);

        const FIXED_SLOT_KEYS = new Set([
            'usual-beginning',
            'psalm-83',
            'psalm-84',
            'psalm-85',
            'trisagion-prayers',
            'prayer-of-the-ninth-hour'
        ]);

        for (const section of sections) {
            if (!Array.isArray(section.items)) continue;

            for (let i = 0; i < section.items.length; i++) {
                const item = section.items[i];

                if (FIXED_SLOT_KEYS.has(item.key)) {
                    const slotData = _ninthHourFixedData &&
                        _ninthHourFixedData.slots &&
                        _ninthHourFixedData.slots[item.key];

                    if (slotData) {
                        section.items[i] = {
                            type:       slotData.type || 'text',
                            key:        item.key,
                            label:      slotData.label || item.label,
                            text:       slotData.text,
                            lxxNumber:  slotData.lxxNumber,
                            items:      Array.isArray(slotData.items) ? slotData.items : undefined,
                            resolvedAs: 'ninth-hour-fixed'
                        };
                    }
                    continue;
                }

                if (item.key === 'troparion-of-the-day') {
                    const resolved = await _resolveLittleHourSeasonalTroparionSlot('ninth-hour', dayOfWeek, dateObj, toneResult);
                    if (resolved) {
                        section.items[i] = Object.assign({}, resolved, {
                            key: 'troparion-of-the-day'
                        });
                    }
                    continue;
                }

                                               if (item.key === 'ninth-hour-theotokion') {
                    const troparionItem =
                        section.items.find(it => it && it.key === 'troparion-of-the-day') || null;

                    const fallbackRubric = _normalizeTheotokionRubricForOffice('ninth-hour', {
                        type:       'rubric',
                        key:        'ninth-hour-theotokion',
                        label:      item.label || 'Theotokion of the Ninth Hour',
                        text:       'On ordinary days, the proper Theotokion appointment for the Ninth Hour belongs here. The full text for this office is not yet available in this path.',
                        resolvedAs: 'ninth-hour-theotokion-deferred'
                    }, toneResult, dayOfWeek);

                    section.items[i] = _resolveLittleHourFestalTheotokionRubric(
                        'ninth-hour',
                        troparionItem,
                        fallbackRubric
                    );
                    continue;
                }
            }
        }
    }
        // ──────────────────────────────────────────────────────────────────────
    // v3.7: _resolveFestalRubricOverrideSlot(slotKey, slotLabel, resolvedTroparionItem)
    //
    // Reuses the existing feast-override metadata already produced by the
    // Vespers troparion arbitration layer.
    //
    // Scope in this phase:
    //   - stichera-at-lord-i-have-cried
    //   - aposticha
    //
    // Returns:
    //   - rubric item if a qualifying feast governs the slot
    //   - null if no rubric override applies
    //
    // Non-throwing.
    // ──────────────────────────────────────────────────────────────────────
    function _resolveFestalRubricOverrideSlot(slotKey, slotLabel, resolvedTroparionItem) {
        try {
            if (
                !resolvedTroparionItem ||
                resolvedTroparionItem.overrideType !== 'menaion-troparion'
            ) {
                return null;
            }

            const commemoration =
                resolvedTroparionItem.commemoration ||
                resolvedTroparionItem.menaionName ||
                null;

            const rank =
                typeof resolvedTroparionItem.rank === 'number'
                    ? resolvedTroparionItem.rank
                    : (
                        typeof resolvedTroparionItem.menaionRank === 'number'
                            ? resolvedTroparionItem.menaionRank
                            : null
                    );

            const governingTone =
                typeof resolvedTroparionItem.governingTone === 'number'
                    ? resolvedTroparionItem.governingTone
                    : null;

            let text = null;

            if (slotKey === 'stichera-at-lord-i-have-cried') {
                text =
                    `Proper festal stichera from the Menaion should be appointed here` +
                    (commemoration ? ` for ${commemoration}` : '') +
                    `. Ordinary weekday Octoechos stichera are displaced by the qualifying feast.`;
            } else if (slotKey === 'aposticha') {
                text =
                    `Proper festal aposticha from the Menaion should be appointed here` +
                    (commemoration ? ` for ${commemoration}` : '') +
                    `. Ordinary weekday Octoechos aposticha are displaced by the qualifying feast.`;
            } else {
                return null;
            }

            return {
                type:          'rubric',
                key:           slotKey,
                label:         slotLabel,
                text:          text,
                resolvedAs:    'menaion-feast-rubric',
                overrideType:  'menaion-troparion',
                governingTone: governingTone,
                rank:          rank,
                commemoration: commemoration
            };
        } catch (err) {
            return null;
        }
    }
    // ──────────────────────────────────────────────────────────────────────
    // v1.3: _resolveSticheraSlot(tone, weekdayName, slotKey, toneResult)    //
    // Resolves a single stichera-style slot from the Octoechos data.
    //
    // slotKey: 'stichera_at_lord_i_have_cried' or 'aposticha'
    // weekdayName: 'saturday' | 'sunday' | 'monday' | ... | 'friday'
    //
    // Returns a resolved item object, or null if data is unavailable.
    //
    // Resolution tiers (in order):
    //   1. Full data present (saturday stichera for all 8 tones): returns
    //      type:'stichera' item with rubric + verses.
    //   2. Stub entry (weekday, data not yet populated): returns type:'rubric'
    //      item with tone identified and an honest note.
    //   3. No data at all: returns null (caller leaves slot as placeholder).
    //
    // IMPORTANT: This function never fabricates text. If the data entry is
    // a baseline_stub, it says so explicitly and shows the tone.
    // ──────────────────────────────────────────────────────────────────────
    function _resolveSticheraSlot(tone, weekdayName, slotKey, toneResult) {
        if (!_octoechosData || !_octoechosData.tones) return null;

        const toneData = _octoechosData.tones[String(tone)];
        if (!toneData) return null;

        const dayData = toneData[weekdayName];
        if (!dayData) return null;

        // Stub entry: tone is known but weekday text not yet populated
        if (dayData.baseline_stub) {
            const slotLabel = slotKey === 'stichera_at_lord_i_have_cried'
                ? 'Stichera at "Lord, I have cried"'
                : 'Aposticha';
            return {
                type:       'rubric',
                key:        slotKey === 'stichera_at_lord_i_have_cried'
                                ? 'stichera-at-lord-i-have-cried'
                                : 'aposticha',
                label:      slotLabel,
                text:       `(${slotLabel} — ${toneResult.toneLabel}. ` +
                            `Weekday Octoechos stichera are not yet in the baseline data file. ` +
                            `Full weekday Octoechos text is pending a future data pass. ` +
                            `Tone identified: ${toneResult.toneLabel}. ` +
                            `Pascha anchor: ${toneResult.paschaISO}.)`,
                resolvedAs: 'octoechos-tone-known-text-pending',
                tone:       tone,
                toneLabel:  toneResult.toneLabel,
                weekday:    weekdayName
            };
        }

        // Full data present
        const slotData = dayData[slotKey];
        if (!slotData) return null;

        const verses = Array.isArray(slotData.verses) ? slotData.verses : [];
        const verseText = verses.join('\n\n');

        return {
            type:       'stichera',
            key:        slotKey === 'stichera_at_lord_i_have_cried'
                            ? 'stichera-at-lord-i-have-cried'
                            : 'aposticha',
            label:      slotData.rubric || (slotKey === 'stichera_at_lord_i_have_cried'
                            ? `Stichera at "Lord, I have cried," ${toneResult.toneLabel}:`
                            : `Aposticha, ${toneResult.toneLabel}:`),
            text:       verseText,
            count:      slotData.count || verses.length,
            resolvedAs: 'octoechos-baseline-ordinary',
            tone:       tone,
            toneLabel:  toneResult.toneLabel,
            weekday:    weekdayName,
            paschaISO:  toneResult.paschaISO
        };
    }

    // ──────────────────────────────────────────────────────────────────────
    // v2.7: _buildHolyWeekRubric(slotKey, slotLabel, holyWeekDay)
    //
    // Returns a type:'rubric' item for a Holy Week Vespers slot.
    // All text is day-specific and liturgically honest — no fabricated corpus.
    // ──────────────────────────────────────────────────────────────────────
    function _buildHolyWeekRubric(slotKey, slotLabel, holyWeekDay) {
        const DAY_LABELS = {
            'palm-sunday':     'Palm Sunday (Entry into Jerusalem)',
            'great-monday':    'Great and Holy Monday',
            'great-tuesday':   'Great and Holy Tuesday',
            'great-wednesday': 'Great and Holy Wednesday',
            'great-thursday':  'Great and Holy Thursday',
            'great-friday':    'Great and Holy Friday',
            'great-saturday':  'Great and Holy Saturday'
        };
        const dayLabel = DAY_LABELS[holyWeekDay] || 'Holy Week';

        const SLOT_NOTES = {
            'stichera-at-lord-i-have-cried': {
                'palm-sunday':     'At Palm Sunday Vespers, the stichera at "Lord, I have cried" are festal stichera of the Entry into Jerusalem, drawn from the Triodion. The Octoechos weekday stichera are not used.',
                'great-monday':    'At Great Monday Vespers (the Bridegroom service), the stichera at "Lord, I have cried" are the appointed Triodion stichera for this day. The ordinary Octoechos weekday stichera are not used during Holy Week.',
                'great-tuesday':   'At Great Tuesday Vespers (the Bridegroom service), the stichera at "Lord, I have cried" are the appointed Triodion stichera for this day. The ordinary Octoechos weekday stichera are not used during Holy Week.',
                'great-wednesday': 'At Great Wednesday Vespers, the stichera at "Lord, I have cried" are the appointed Triodion stichera for this day. The ordinary Octoechos weekday stichera are not used during Holy Week.',
                'great-thursday':  'At Great Thursday Vespers (combined with the Liturgy of St. Basil the Great), the stichera at "Lord, I have cried" are the festal stichera of the Holy Supper and Betrayal, from the Triodion. The Octoechos is not used.',
                'great-friday':    'At Great Friday Vespers (the service of the Taking Down from the Cross), the stichera at "Lord, I have cried" are the solemn lamentations of Great Friday from the Triodion. The Octoechos is not used.',
                'great-saturday':  'At Great Saturday Vespers (combined with the Liturgy of St. Basil the Great), the stichera at "Lord, I have cried" are the festal stichera of Great Saturday from the Triodion. The Octoechos is not used.'
            },
            'aposticha': {
                'palm-sunday':     'At Palm Sunday Vespers, the aposticha are festal stichera of the Entry into Jerusalem from the Triodion.',
                'great-monday':    'At Great Monday Vespers, the aposticha are the appointed Triodion aposticha for this day.',
                'great-tuesday':   'At Great Tuesday Vespers, the aposticha are the appointed Triodion aposticha for this day.',
                'great-wednesday': 'At Great Wednesday Vespers, the aposticha are the appointed Triodion aposticha for this day.',
                'great-thursday':  'At Great Thursday Vespers, the aposticha are the festal aposticha of the Holy Supper from the Triodion.',
                'great-friday':    'At Great Friday Vespers, the aposticha are the solemn lamentations from the Triodion. This is a major liturgical service; the Epitaphios is brought out at this Vespers.',
                'great-saturday':  'At Great Saturday Vespers, the aposticha are the festal aposticha from the Triodion. This service concludes with the first announcement of the Resurrection.'
            },
            'vesperal-reading': {
                'palm-sunday':     'Paremiae are not appointed at Palm Sunday Vespers in standard practice.',
                'great-monday':    'Paremiae are not appointed at the Bridegroom Vespers of Great Monday.',
                'great-tuesday':   'Paremiae are not appointed at the Bridegroom Vespers of Great Tuesday.',
                'great-wednesday': 'Paremiae are not appointed at Great Wednesday Vespers.',
                'great-thursday':  'At Great Thursday Vespers (combined with the Liturgy of St. Basil), the appointed paremiae are from Exodus, Job, and Isaiah. These are among the most solemn vesperal readings of the liturgical year.',
                'great-friday':    'Paremiae are not appointed at Great Friday Vespers. The vesperal readings proper to Holy Week are read at the Royal Hours earlier in the day.',
                'great-saturday':  'At Great Saturday Vespers (combined with the Liturgy of St. Basil), fifteen paremiae are appointed — the full ancient lectionary of Holy Saturday. This is the longest paremiae series in the Byzantine rite.'
            },
            'troparion-or-apolytikion': {
                'palm-sunday':     'The troparion of Palm Sunday: "When Thou wast baptized in the Jordan, O Lord, the worship of the Trinity was made manifest…" (Tone 1, festal troparion of the Entry into Jerusalem).',
                'great-monday':    'At Great Monday through Wednesday Vespers (Bridegroom services), the dismissal troparion is the Bridegroom troparion: "Behold the Bridegroom cometh at midnight…" (Tone 8). The weekday Menaion troparion is not used.',
                'great-tuesday':   'At Great Tuesday Vespers (Bridegroom service), the dismissal troparion is the Bridegroom troparion: "Behold the Bridegroom cometh at midnight…" (Tone 8).',
                'great-wednesday': 'At Great Wednesday Vespers (Bridegroom service), the dismissal troparion is the Bridegroom troparion: "Behold the Bridegroom cometh at midnight…" (Tone 8).',
                'great-thursday':  'At Great Thursday Vespers, the troparion of Great Thursday is sung: "When the glorious disciples were enlightened at the washing of their feet…" (Tone 6). This is a fixed Holy Week troparion.',
                'great-friday':    'At Great Friday Vespers, the troparion of Great Friday is sung: "The noble Joseph, when he had taken down Thy most pure body from the tree…" (Tone 2). The Epitaphios troparion may also be sung.',
                'great-saturday':  'At Great Saturday Vespers, the troparion of Great Saturday is sung: "The noble Joseph, when he had taken down Thy most pure body from the tree…" (Tone 2), and at the conclusion the Paschal Troparion is intoned for the first time.'
            },
            'theotokion-dismissal': {
                'palm-sunday':     'The dismissal Theotokion of Palm Sunday follows the festal troparion; the ordinary Octoechos weekday Theotokion is not used.',
                'great-monday':    'The dismissal Theotokion at Great Monday Vespers follows the Bridegroom troparion (Tone 8). The ordinary Octoechos weekday Theotokion is not used.',
                'great-tuesday':   'The dismissal Theotokion at Great Tuesday Vespers follows the Bridegroom troparion (Tone 8). The ordinary Octoechos weekday Theotokion is not used.',
                'great-wednesday': 'The dismissal Theotokion at Great Wednesday Vespers follows the Bridegroom troparion (Tone 8). The ordinary Octoechos weekday Theotokion is not used.',
                'great-thursday':  'The dismissal Theotokion at Great Thursday Vespers follows the Great Thursday troparion (Tone 6). The ordinary Octoechos weekday Theotokion is not used.',
                'great-friday':    'The dismissal Theotokion at Great Friday Vespers follows the Great Friday troparion (Tone 2). The ordinary Octoechos Theotokion is not used.',
                'great-saturday':  'The dismissal Theotokion at Great Saturday Vespers follows the Great Saturday troparion. As this service transitions into the Paschal Vigil, the ordinary dismissal Theotokion is not used.'
            }
        };

        const noteText = (SLOT_NOTES[slotKey] && SLOT_NOTES[slotKey][holyWeekDay])
            || `Holy Week override — ${dayLabel}. The ordinary Octoechos content is not used. Triodion corpus pending.`;

        const RESOLVED_AS_MAP = {
            'stichera-at-lord-i-have-cried': 'holy-week-stichera-pending',
            'aposticha':                     'holy-week-aposticha-pending',
            'vesperal-reading':              'holy-week-paremiae-pending',
            'troparion-or-apolytikion':      'holy-week-troparion-pending',
            'theotokion-dismissal':          'holy-week-theotokion-pending'
        };

        return {
            type:        'rubric',
            key:         slotKey,
            label:       `${slotLabel} — ${dayLabel}`,
            text:        `(HOLY WEEK — ${dayLabel}. ${noteText} Triodion corpus not yet available in this engine; the full text will appear here when the corpus is added.)`,
            holyWeekDay: holyWeekDay,
            resolvedAs:  RESOLVED_AS_MAP[slotKey] || 'holy-week-pending'
        };
    }
    // ──────────────────────────────────────────────────────────────────────
    // v1.2 / v1.3: _resolveVespersSlots(sections, dateObj)
    //
    // Ordinary-day slot resolution pass for Vespers.
    //
    // Mutates the deep-copied sections array in place; never touches the cached
    // skeleton. Called from resolveOffice() before the diagnostic count pass.
    //
    // Slots resolved in v1.2:
    //   daily-prokeimenon — weekday data table (7 fixed entries)
    //   vesperal-reading  — explicitly omitted for ordinary days
    //
    // Slots resolved in v1.3:
    //   stichera-at-lord-i-have-cried
    //     Saturday: full resurrectional stichera for all 8 tones (tiers 1).
    //     Weekday: tone identified, text stub (tier 2 — honest note).
    //     Bright Week: rubric noting Paschal Tone in use (not Octoechos).
    //     Festal override: NOT implemented in this pass. The baseline rule
    //     runs unconditionally on ordinary days.
    //
    //   aposticha
    //     Same three tiers as stichera-at-lord-i-have-cried above.
    //
    // Slots resolved in v1.5:
    //   kathisma-reading
    //     Mon–Sat ordinary: standard Byzantine Psalter weekly cycle.
    //       Produces type:'rubric' with kathisma number, title, psalm range
    //       (LXX), and incipit. Full psalm text is NOT included; the rubric
    //       directs the officiant to read the appointed kathisma.
    //     Sunday: explicitly deferred — practice varies by usage; not fabricated.
    //     Bright Week: no kathisma; rubric states this openly.
    //     Festal/Lenten overrides: NOT implemented. This is the ordinary
    //       weekday baseline only. Great Feasts omit or replace the kathisma;
    //       Great Lent uses a different weekly distribution. Neither is
    //       silently applied here.
    //
    // Slots resolved in v1.6:
    //   troparion-or-apolytikion
    //     Saturday: full Resurrectional Troparion text for the current tone
    //       (from data/horologion/vespers-troparion.json). These are the
    //       fixed apolytikia of the Octoechos sung at Saturday Great Vespers.
    //     Bright Week: Paschal Troparion ("Christ is risen") — fixed text.
    //     Weekday (Mon–Fri): tone-identified rubric stub. The weekday troparion
    //       depends on the Menaion (daily saints); no text is fabricated.
    //       The current tone is stated so the celebrant can locate the correct
    //       Menaion entry. This is an honest partial resolution, not silence.
    //     Sunday: explicitly deferred — evaluated as part of the dedicated
    //       Sunday Vespers pass.
    //     Festal overrides: NOT implemented. Feast-rank engine deferred.
    //
    // Slots resolved in v1.7:
    //   theotokion-dismissal
    //     Saturday: full dismissal Theotokion text for the current tone (tones 1–8).
    //       Octoechos apolytikion-paired dismissal Theotokia — invariable per tone.
    //       Distinct from the Dogmatikon (which is part of the Aposticha).
    //     Bright Week: explicit omission rubric — Paschal Troparion serves as
    //       the dismissal; no separate Theotokion is sung.
    //     Weekday (Mon–Fri): tone-identified rubric stub — Menaion required;
    //       weekday Theotokion follows the Menaion troparion, not yet implemented.
    //     Sunday: explicitly deferred — part of the Sunday Vespers pass.
    //     Festal overrides: NOT implemented; stated openly in Saturday output.
    //
    // Slots resolved in v1.8:
    //   stichera-at-lord-i-have-cried (Sunday): resurrectional stichera from
    //     'saturday' Octoechos corpus; label patched for Sunday Small Vespers.
    //     resolvedAs: 'sunday-small-vespers-resurrectional-stichera'
    //   aposticha (Sunday): resurrectional aposticha from 'saturday' corpus.
    //     resolvedAs: 'sunday-small-vespers-resurrectional-aposticha'
    //   kathisma-reading (Sunday): actionable omission rubric — kathisma
    //     ordinarily omitted at Sunday Small Vespers; vigil practice noted.
    //     resolvedAs: 'sunday-small-vespers-kathisma-ordinary-omitted'
    //   troparion-or-apolytikion (Sunday): full Resurrectional Troparion text
    //     from vespers-troparion.json; same text as Saturday Great Vespers.
    //     resolvedAs: 'resurrectional-troparion-sunday'
    //   theotokion-dismissal (Sunday): full dismissal Theotokion text from
    //     vespers-theotokion.json; same text as Saturday Great Vespers.
    //     resolvedAs: 'dismissal-theotokion-sunday'
    //
    // Slots NOT resolved in v1.8 (deferred):
    //   troparion-or-apolytikion (weekday Mon–Fri) — Menaion required
    //   theotokion-dismissal (weekday Mon–Fri) — Menaion required
    //   Feast-rank override engine — deferred beyond Menaion work
    //
    // Slots resolved in v1.9:
    //   theotokion-dismissal (weekday Mon–Fri): full Octoechos weekday Theotokion
    //     text (type:'text') for the current tone + day of week.
    //     Source: data/horologion/vespers-weekday-theotokion.json (40 entries).
    //     Mon/Tue/Thu: standard Octoechos weekday Theotokion.
    //     Wed/Fri: Stavrotheotokion (Cross Theotokion).
    //     Limitation stated in output: tone follows current Octoechos week;
    //       Menaion troparion tone may differ (festal override not implemented).
    //     resolvedAs: 'weekday-octoechos-theotokion'
    //     Graceful degradation: falls back to rubric stub if data file unavailable.
    //
    // Slots NOT resolved in v2.0 (deferred):
    //   troparion-or-apolytikion (weekday Mon–Fri) — Menaion text required;
    //     rubric now includes weekday liturgical theme (v2.0 improvement).
    //     resolvedAs changed to 'weekday-theme-rubric'.
    //   Feast-rank override engine — deferred
    //   Great Lent variable overrides — deferred
    // ──────────────────────────────────────────────────────────────────────
    async function _resolveVespersSlots(sections, dateObj) {
        // Load all data files in parallel
        await Promise.all([
            _loadVespersProkeimena(),
            _loadOctoechosData(),
            _loadKathismaData(),
            _loadKathismaFullTextData(),
            _loadTroparionData(),
            _loadTheotokionData(),
            _loadWeekdayTheotokionData(),
            _loadWeekdayTroparionMeta(),
            _loadTriodionData(),
            _loadHolyWeekData(),
            _loadPentecostarionData()
        ]);

        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

        // v1.3: Compute tone once; used for all stichera/aposticha slots
        const toneResult = _computeBaselineTone(dateObj);

        // Map JS getDay() index to the weekday key used in octoechos-vespers.json
        const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        // Saturday Vespers is the Vespers FOR Sunday; use Sunday's weekday key for data lookup.
        // The tone is already computed with Saturday → Sunday correction in _computeBaselineTone.
        // Saturday Vespers uses 'saturday' corpus (resurrectional stichera for Sunday).
        // Sunday Small Vespers also uses the 'saturday' (resurrectional) corpus —
        // same Octoechos tone week, same resurrectional set. The 'sunday' slot in
        // octoechos-vespers.json carries sunday_deferred:true; we bypass it here
        // by routing Sunday to 'saturday', then patch the label at the call site.
        const octoechosWeekdayKey = (dayOfWeek === 6 || dayOfWeek === 0) ? 'saturday' : WEEKDAY_NAMES[dayOfWeek];

        // v2.3: Pre-resolve the troparion slot on weekday Mon–Fri so that the
        // stichera and aposticha branches can read feastRankOverride without a
        // second Menaion query. On all other days this remains null and the slot
        // loop resolves the troparion item in its normal position.
        let _preResolvedTroparion = null;
        const isWeekday = (dayOfWeek >= 1 && dayOfWeek <= 5);
        if (isWeekday) {
            _preResolvedTroparion = await _resolveTroparionSlot(dayOfWeek, toneResult, dateObj);
        }

        // v2.7: Compute liturgical season once for use across all slot branches.
        const seasonResult       = _computeLiturgicalSeason(dateObj, toneResult);
        const liturgicalSeason   = seasonResult.season;
        const holyWeekDay        = seasonResult.holyWeekDay; // null outside Holy Week
        const isHolyWeek         = (liturgicalSeason === 'holy-week');
        const isGreatLentWeekday = (liturgicalSeason === 'great-lent') && isWeekday;

        for (const section of sections) {
            if (!Array.isArray(section.items)) continue;

            for (let i = 0; i < section.items.length; i++) {
                const item = section.items[i];
                // ── daily-prokeimenon (v1.2) ──────────────────────────────
              if (item.key === 'daily-prokeimenon') {
    const pk = _prokeimenaByDay && _prokeimenaByDay[dayOfWeek];
    if (pk) {
        section.items[i] = {
            type:       'prokeimenon',
            key:        'daily-prokeimenon',
            label:      pk.label,
            tone:       pk.tone,
            rubric:     pk.rubric,
            text:       pk.text,
            textRef:    pk.textRef,
            verse:      pk.verse,
            verseRef:   pk.verseRef,
            resolvedAs: 'ordinary-weekday',
            weekday:    pk.weekday
        };
    }
    // If pk is null (load failed), item remains as-is (placeholder).
}

else if (item.key === 'kathisma-reading') {
    const resolved = _resolveKathismaSlot(dayOfWeek, toneResult.brightWeek, isGreatLentWeekday);
    if (resolved) {
        section.items[i] = resolved;
    }
    // If null (data load failed), item remains as-is (placeholder).
}
                else if (item.key === 'vesperal-reading') {
                    if (isHolyWeek) {
                        // v5.1: attempt Holy Week text overlay before rubric fallback
                        const hwText = _resolveHolyWeekText('vesperal-reading', holyWeekDay);
                        section.items[i] = hwText || _buildHolyWeekRubric(
                            'vesperal-reading',
                            'Paremiae (Vesperal Readings)',
                            holyWeekDay
                        );
                    } else if (isWeekday &&
                        !toneResult.brightWeek &&
                        _preResolvedTroparion &&
                        _preResolvedTroparion.feastRankOverride === true) {
                        // v2.4: rank-1/2 weekday feast — unchanged
                        section.items[i] = {
                            type:        'rubric',
                            key:         'vesperal-reading',
                            label:       'Paremiae (Vesperal Readings)',
                            text:        `(FEAST-RANK OVERRIDE — ${_preResolvedTroparion.menaionName}, ` +
                                         `Rank ${_preResolvedTroparion.menaionRank}. ` +
                                         `Paremiae (Old Testament vesperal readings) are appointed at Vespers for feasts of rank 1 and rank 2. ` +
                                         `The proper festal readings for this commemoration are not yet in the corpus. ` +
                                         `When available, the appointed paremiae from the Menaion for this feast will appear here.)`,
                            menaionName: _preResolvedTroparion.menaionName,
                            menaionRank: _preResolvedTroparion.menaionRank,
                            resolvedAs:  'weekday-feast-paremiae-pending'
                        };
                    } else if (isGreatLentWeekday) {
                        // v2.6: Great Lent weekday — paremiae are appointed at every
                        // weekday Vespers during Great Lent (typically two or three
                        // Old Testament readings). Triodion/Lenten lectionary corpus
                        // not yet available; render an explicit Lenten seasonal rubric.
                        section.items[i] = {
                            type:       'rubric',
                            key:        'vesperal-reading',
                            label:      'Paremiae (Vesperal Readings)',
                            text:       '(GREAT LENT — weekday Vespers. ' +
                                        'Paremiae (Old Testament vesperal readings) are appointed at every weekday Vespers during Great Lent. ' +
                                        'Typically two readings are appointed Monday through Friday, drawn from Genesis and Proverbs. ' +
                                        'The Lenten lectionary corpus is not yet available in this engine. ' +
                                        'When available, the appointed paremiae will appear here.)',
                            resolvedAs: 'great-lent-paremiae-pending'
                        };
                    } else {
                        section.items[i] = {
                            type:       'rubric',
                            key:        'vesperal-reading',
                            label:      'Paremiae (Vesperal Readings)',
                            text:       '(Paremiae — Vesperal Readings — are not appointed at ordinary Vespers. They are read only on feasts of the first and second ranks and during Great Lent. No reading is appointed today.)',
                            resolvedAs: 'omitted-ordinary-day'
                        };
                    }
                }
                // ── stichera-at-lord-i-have-cried (v1.3 / v3.7) ──────────
                else if (item.key === 'stichera-at-lord-i-have-cried') {
                    if (toneResult.brightWeek) {
                        // v5.2: attempt Pentecostarion text before rubric fallback
                        const pentResolved = _resolvePentecostarionText('stichera-at-lord-i-have-cried');
                        section.items[i] = pentResolved || {
                            type:       'rubric',
                            key:        'stichera-at-lord-i-have-cried',
                            label:      'Stichera at "Lord, I have cried"',
                            text:       '(Bright Week — Paschal Tone. During Bright Week (Pascha Sunday through Thomas Saturday), the stichera at "Lord, I have cried" are Paschal hymns, not the ordinary Octoechos stichera.)',
                            resolvedAs: 'bright-week-paschal-tone'
                        };
                    } else if (isHolyWeek) {
                        // v5.1: attempt Holy Week text overlay before rubric fallback
                        const hwText = _resolveHolyWeekText('stichera-at-lord-i-have-cried', holyWeekDay);
                        section.items[i] = hwText || _buildHolyWeekRubric(
                            'stichera-at-lord-i-have-cried',
                            'Stichera at "Lord, I have cried"',
                            holyWeekDay
                        );
                    } else if (isWeekday) {
                        const festalRubricOverride = _resolveFestalRubricOverrideSlot(
                            'stichera-at-lord-i-have-cried',
                            'Stichera at "Lord, I have cried"',
                            _preResolvedTroparion
                        );

                        if (festalRubricOverride) {
                            section.items[i] = festalRubricOverride;
                        } else if (isGreatLentWeekday) {
                            section.items[i] = {
                                type:       'rubric',
                                key:        'stichera-at-lord-i-have-cried',
                                label:      'Stichera at "Lord, I have cried"',
                                text:       '(GREAT LENT — weekday Vespers. ' +
                                            'The ordinary Octoechos weekday stichera are not appointed during Great Lent. ' +
                                            'The stichera at "Lord, I have cried" on Lenten weekdays are drawn from the Triodion. ' +
                                            'The Triodion corpus is not yet available in this engine. ' +
                                            'When available, the appointed Lenten stichera will appear here.)',
                                resolvedAs: 'great-lent-stichera-pending'
                            };
                        } else if (toneResult.tone) {
                            const resolved = _resolveSticheraSlot(
                                toneResult.tone,
                                octoechosWeekdayKey,
                                'stichera_at_lord_i_have_cried',
                                toneResult
                            );
                            if (resolved) {
                                section.items[i] = resolved;
                            }
                            // If null (data load failed), slot remains placeholder
                        }
                    } else if (toneResult.tone) {
                        const resolved = _resolveSticheraSlot(
                            toneResult.tone,
                            octoechosWeekdayKey,
                            'stichera_at_lord_i_have_cried',
                            toneResult
                        );
                        if (resolved) {
                            // v1.8: Sunday Small Vespers label patch.
                            if (dayOfWeek === 0 && resolved.type === 'stichera') {
                                resolved.weekday = 'sunday';
                                resolved.resolvedAs = 'sunday-small-vespers-resurrectional-stichera';
                                if (resolved.label) {
                                    resolved.label = resolved.label.replace(/Saturday/gi, 'Sunday Small Vespers');
                                }
                                resolved.text = (resolved.text || '') +
                                    `\n\n(Sunday Small Vespers — Resurrectional Stichera of ${toneResult.toneLabel}. ` +
                                    `At Sunday Small Vespers, three stichera are typically used ` +
                                    `(the final three of the full set). ` +
                                    `This is the same resurrectional corpus used at Saturday Great Vespers ` +
                                    `for the same tone week. ` +
                                    `Festal and Great Lent overrides are not yet implemented.)`;
                            }
                            section.items[i] = resolved;
                        }
                        // If null (data load failed), slot remains placeholder
                    }
                }

                // ── aposticha (v1.3 / v3.7) ───────────────────────────────
                else if (item.key === 'aposticha') {
                    if (toneResult.brightWeek) {
                        // v5.2: attempt Pentecostarion text before rubric fallback
                        const pentResolved = _resolvePentecostarionText('aposticha');
                        section.items[i] = pentResolved || {
                            type:       'rubric',
                            key:        'aposticha',
                            label:      'Aposticha',
                            text:       '(Bright Week — Paschal Tone. During Bright Week, the Aposticha are Paschal hymns, not the ordinary Octoechos aposticha.)',
                            resolvedAs: 'bright-week-paschal-tone'
                        };
                    } else if (isHolyWeek) {
                        // v5.1: attempt Holy Week text overlay before rubric fallback
                        const hwText = _resolveHolyWeekText('aposticha', holyWeekDay);
                        section.items[i] = hwText || _buildHolyWeekRubric(
                            'aposticha',
                            'Aposticha',
                            holyWeekDay
                        );
                    } else if (isWeekday) {
                        const festalRubricOverride = _resolveFestalRubricOverrideSlot(
                            'aposticha',
                            'Aposticha',
                            _preResolvedTroparion
                        );

                        if (festalRubricOverride) {
                            section.items[i] = festalRubricOverride;
                        } else if (isGreatLentWeekday) {
                            section.items[i] = {
                                type:       'rubric',
                                key:        'aposticha',
                                label:      'Aposticha',
                                text:       '(GREAT LENT — weekday Vespers. ' +
                                            'The ordinary Octoechos weekday aposticha are not appointed during Great Lent. ' +
                                            'The aposticha on Lenten weekdays are drawn from the Triodion. ' +
                                            'The Triodion corpus is not yet available in this engine. ' +
                                            'When available, the appointed Lenten aposticha will appear here.)',
                                resolvedAs: 'great-lent-aposticha-pending'
                            };
                        } else if (toneResult.tone) {
                            const resolved = _resolveSticheraSlot(
                                toneResult.tone,
                                octoechosWeekdayKey,
                                'aposticha',
                                toneResult
                            );
                            if (resolved) {
                                section.items[i] = resolved;
                            }
                            // If null (data load failed), slot remains placeholder
                        }
                    } else if (toneResult.tone) {
                        const resolved = _resolveSticheraSlot(
                            toneResult.tone,
                            octoechosWeekdayKey,
                            'aposticha',
                            toneResult
                        );
                        if (resolved) {
                            // v1.8: Sunday Small Vespers label patch.
                            if (dayOfWeek === 0 && resolved.type === 'stichera') {
                                resolved.weekday = 'sunday';
                                resolved.resolvedAs = 'sunday-small-vespers-resurrectional-aposticha';
                                if (resolved.label) {
                                    resolved.label = resolved.label.replace(/Saturday/gi, 'Sunday Small Vespers');
                                }
                                resolved.text = (resolved.text || '') +
                                    `\n\n(Sunday Small Vespers — Resurrectional Aposticha of ${toneResult.toneLabel}. ` +
                                    `At Sunday Small Vespers, the Resurrectional Aposticha of the tone are appointed. ` +
                                    `This is the same aposticha corpus used at Saturday Great Vespers ` +
                                    `for the same tone week. ` +
                                    `Festal and Great Lent overrides are not yet implemented.)`;
                            }
                            section.items[i] = resolved;
                        }
                        // If null (data load failed), slot remains placeholder
                    }
                }

                // ── troparion-or-apolytikion (v1.6 / v2.3) ───────────────
                // Baseline: Resurrectional Troparion of the current tone
                // for Saturday Great Vespers. Bright Week: Paschal Troparion.
                // Weekdays: pre-resolved above (_preResolvedTroparion) on Mon–Fri;
                //   resolver called directly for Saturday and Sunday.
                // Sunday: Resurrectional Troparion of the tone.
                else if (item.key === 'troparion-or-apolytikion') {
                    if (isHolyWeek) {
                        // v5.1: attempt Holy Week text overlay before rubric fallback
                        const hwText = _resolveHolyWeekText('troparion-or-apolytikion', holyWeekDay);
                        section.items[i] = hwText || _buildHolyWeekRubric(
                            'troparion-or-apolytikion',
                            'Troparion / Apolytikion of the Day',
                            holyWeekDay
                        );
                    } else {
                        // v2.3: on weekdays use the pre-resolved result to avoid a
                        // second Menaion query; on Sat/Sun call the resolver as before.
                        const resolved = isWeekday
                            ? _preResolvedTroparion
                            : await _resolveTroparionSlot(dayOfWeek, toneResult, dateObj);
                        if (resolved) {
                            // v2.6: if resolved is a weekday-theme rubric (no Menaion text)
                            // and this is a Great Lent weekday, replace the ordinary weekday
                            // theme rubric with an explicit Lenten rubric. Menaion-resolved
                            // commemorations during Lent retain their proper troparion.
                            if (isGreatLentWeekday &&
                                resolved.resolvedAs === 'weekday-theme-rubric') {

                                // v5.0: Attempt Triodion text resolution before falling back.
                                // Feast arbitration has already run (_preResolvedTroparion) and
                                // found nothing qualifying. Key is patched to troparion-or-apolytikion
                                // for Vespers slot naming consistency.
                                const triodionResolved = _resolveTriodionTroparion(dateObj, dayOfWeek, 'vespers');
                                if (triodionResolved) {
                                    section.items[i] = Object.assign({}, triodionResolved, {
                                        key: 'troparion-or-apolytikion'
                                    });
                                } else {
                                    // Triodion text not available — emit truthful placeholder.
                                    section.items[i] = {
                                        type:       'rubric',
                                        key:        'troparion-or-apolytikion',
                                        label:      'Troparion / Apolytikion of the Day',
                                        text:       '(GREAT LENT — weekday Vespers. ' +
                                                    'The ordinary weekday Octoechos troparion theme is not used during Great Lent. ' +
                                                    'On Lenten weekdays without a ranked Menaion commemoration, ' +
                                                    'the dismissal troparion follows Lenten practice from the Triodion. ' +
                                                    'Triodion text for this week is not yet available in this engine.)',
                                        resolvedAs: 'great-lent-troparion-pending'
                                    };
                                }
                            } else {
                                section.items[i] = resolved;
                            }
                        }
                        // If null (data load failed), slot remains placeholder.
                    }
                }
                // ── theotokion-dismissal (v1.7 / v2.2) ───────────────────────────
                // Saturday: full dismissal Theotokion (Octoechos, tone-matched).
                // Bright Week: explicit omission rubric.
                // Weekdays: v2.2 — tone follows Menaion troparion for rank 1/2 feasts;
                //   Octoechos baseline tone preserved for all other cases.
                // Sunday: Octoechos tone Theotokion.
                else if (item.key === 'theotokion-dismissal') {
                    // v2.6: Great Lent weekday — ordinary Octoechos weekday Theotokion
                    // is not sung during Great Lent on days without a ranked Menaion
                    // commemoration. If a Menaion troparion is resolved (any rank),
                    // retain that troparion's tone-corrected Theotokion.
                    const troparionItem = section.items.find(it => it.key === 'troparion-or-apolytikion');
                    const hasMenaionTroparion = troparionItem &&
                        (
                            troparionItem.overrideType === 'menaion-troparion' ||
                            troparionItem.resolvedAs === 'menaion-feast-troparion' ||
                            troparionItem.resolvedAs === 'menaion-troparion' ||
                            troparionItem.resolvedAs === 'menaion-resolved'
                        );

                    if (isHolyWeek) {
                        // v5.1: attempt Holy Week text overlay before rubric fallback
                        const hwText = _resolveHolyWeekText('theotokion-dismissal', holyWeekDay);
                        section.items[i] = hwText || _buildHolyWeekRubric(
                            'theotokion-dismissal',
                            'Theotokion',
                            holyWeekDay
                        );
                    } else if (isGreatLentWeekday && !hasMenaionTroparion) {
                        section.items[i] = {
                            type:       'rubric',
                            key:        'theotokion-dismissal',
                            label:      'Theotokion',
                            text:       '(GREAT LENT — weekday Vespers. ' +
                                        'The ordinary Octoechos weekday Theotokion is not appointed on Lenten weekdays without a Menaion commemoration. ' +
                                        'The dismissal Theotokion on Lenten weekdays follows Triodion practice. ' +
                                        'The Triodion corpus is not yet available in this engine. ' +
                                        'When available, the appointed Lenten Theotokion will appear here.)',
                            resolvedAs: 'great-lent-theotokion-pending'
                        };
                    } else {
                        const resolved = _resolveTheotokionSlot(dayOfWeek, toneResult, troparionItem);
                        if (resolved) {
                            section.items[i] = resolved;
                        }
                    }
                }
            }
        }
    }

    function _deepCopySections(sections) {
        try {
            return JSON.parse(JSON.stringify(sections));
        } catch (e) {
            console.error('[HorologionEngine] _deepCopySections: clone failed', e);
            return sections;
        }
}

// ── v6.1: _resolveOrthrosSundayExapostilarion(tone) ──────────────────────────
//
//  Resolver stub for the Sunday resurrectional Exapostilarion (Svetilen).
//  Reads from window.OCTOECHOS.orthros.exapostilarion.sunday.tones[tone].
//  NOT YET wired into _resolveOrthrosSlots() — pipeline integration deferred.
//
//  Call site (future): _resolveOrthrosSlots(), after the Praises stichera block,
//  gated on dayOfWeek === 0 && !isBrightWeek && !isHolyWeek && !isGreatLentWeekday.
//
function _resolveOrthrosSundayExapostilarion(tone) {
    const toneKey = String(tone);
    const corpus  =
        typeof window !== 'undefined' &&
        window.OCTOECHOS &&
        window.OCTOECHOS.orthros &&
        window.OCTOECHOS.orthros.exapostilarion &&
        window.OCTOECHOS.orthros.exapostilarion.sunday &&
        window.OCTOECHOS.orthros.exapostilarion.sunday.tones
            ? window.OCTOECHOS.orthros.exapostilarion.sunday.tones
            : null;

    if (!corpus) {
        return {
            type:       'rubric',
            key:        'exapostilarion',
            label:      'Exapostilarion (Svetilen)',
            text:       'Sunday Resurrectional Exapostilarion: corpus file not loaded.',
            resolvedAs: 'orthros-exapostilarion-corpus-unavailable'
        };
    }

    const text = corpus[toneKey] || corpus[Number(tone)] || null;

    if (!text) {
        return {
            type:       'rubric',
            key:        'exapostilarion',
            label:      'Exapostilarion (Svetilen)',
            text:       `Sunday Resurrectional Exapostilarion: no entry found for Tone ${tone}.`,
            resolvedAs: 'orthros-exapostilarion-tone-missing'
        };
    }

    return {
        type:       'hymn',
        key:        'exapostilarion',
        label:      'Exapostilarion (Svetilen)',
        source:     'Octoechos',
        tone:       Number(tone),
        text:       text,
        resolvedAs: 'orthros-sunday-resurrectional-exapostilarion'
    };
}

// ── v6.9: _loadTypikaFixedData() ─────────────────────────────────────
async function _loadTypikaFixedData() {
    if (_typikaFixedData !== null) return;
    try {
        const response = await fetch(TYPIKA_FIXED_URL);
        if (!response.ok) {
            console.warn(`[HorologionEngine] Could not load Typika fixed data (HTTP ${response.status}); fixed slots will remain as placeholders.`);
            return;
        }
        _typikaFixedData = await response.json();
        console.log('[HorologionEngine] Loaded Typika fixed text data (v6.9).');
    } catch (err) {
        console.warn('[HorologionEngine] _loadTypikaFixedData failed:', err.message, '— fixed slots will remain as placeholders.');
    }
}

// ── v6.9: _resolveTypikaSlots(sections, dateObj) ──────────────────────
async function _resolveTypikaSlots(sections, dateObj) {
    await Promise.all([
        _loadTypikaFixedData(),
        _loadTroparionData(),
        _loadWeekdayTroparionMeta(),
        _loadTriodionData()
    ]);

    const dayOfWeek  = dateObj.getDay();
    const toneResult = _computeBaselineTone(dateObj);

    const FIXED_SLOT_KEYS = new Set([
        'typika-usual-beginning',
        'typika-beatitudes',
        'typika-psalm-102',
        'typika-psalm-145',
        'typika-creed',
        'typika-trisagion-prayers',
        'typika-lords-prayer'
    ]);

    for (const section of sections) {
        if (!Array.isArray(section.items)) continue;

        for (let i = 0; i < section.items.length; i++) {
            const item = section.items[i];

            if (FIXED_SLOT_KEYS.has(item.key)) {
                const slotData = _typikaFixedData &&
                    _typikaFixedData.slots &&
                    _typikaFixedData.slots[item.key];

                if (slotData) {
                    section.items[i] = {
                        type:       slotData.type || 'text',
                        key:        item.key,
                        label:      slotData.label || item.label,
                        text:       slotData.text,
                        lxxNumber:  slotData.lxxNumber,
                        items:      Array.isArray(slotData.items) ? slotData.items : undefined,
                        resolvedAs: 'typika-fixed'
                    };
                }
                continue;
            }

            if (item.key === 'typika-kontakion-rubric' && dayOfWeek === 0) {
                const SUNDAY_RESURRECTIONAL_KONTAKIA = {
                    1: "Thou didst arise from the grave in glory as God * and thus raised up the world with Thee; * and mortal nature singeth Thy praises as God, * and death hath disappeared; * Adam danceth, O Master, * and now Eve, freed from her chains, * rejoiceth as she cries aloud: ** It is Thee, O Christ, who grantest the Resurrection to all.",
                    2: "Thou didst arise from the tomb, * O all-powerful Savior, * and seeing the marvel Hades was struck with fear, * the dead arose, and creation with Adam seeing this rejoiceth with Thee, ** therefore the world doth glorify Thee, my Savior.",
                    3: "Thou didst arise today, O Merciful One, * and hast led us out from the gates of death. * Adam danceth today, and Eve rejoiceth. * The Prophets also, along with Patriarchs, ** ceaselessly praise the divine might of Thine authority.",
                    4: "My Savior and Redeemer * from the grave, as God, * hath raised those born on earth from their chains, * and shattered the gates of Hades; ** and as Lord arisen on the third day.",
                    5: "Thou didst descend into Hades, O my Savior, * and having shattered its gates, as All-powerful, * Thou didst raise the dead with Thyself, as Creator, * and didst deliver Adam from the curse, * O Lover of mankind. ** Therefore, we all cry to Thee: \"Save us, O Lord!\"",
                    6: "Having raised all the dead from the valleys of darkness * by His life-giving hand, * Christ our God hath granted resurrection to the race of mankind. * For He is the Savior of all, * the Resurrection and the Life ** and the God of all.",
                    7: "No longer does the might of death * have power to keep mortals captive; * for Christ hath come down, smashing it and destroying its power. * Now that Hades is bound, the Prophets with one voice joyously declare, * \"The Savior hath appeared to those with faith. ** Come out O ye faithful, to adore the Resurrection!\"",
                    8: "Having risen from the tomb, Thou didst raise the dead and resurrect Adam, * Eve now dances with joy at Thy Resurrection. * And all the ends of the earth keep festival at Thine Arising from the dead, ** O greatly Merciful One."
                };
                const tone = toneResult && toneResult.tone;
                if (tone && SUNDAY_RESURRECTIONAL_KONTAKIA[tone]) {
                    section.items[i] = {
                        type:       'text',
                        key:        'typika-kontakion-rubric',
                        label:      'Kontakion',
                        text:       SUNDAY_RESURRECTIONAL_KONTAKIA[tone],
                        resolvedAs: 'typika-sunday-resurrectional-kontakion-tone-' + tone
                    };
                }
                continue;
            }

            if (item.key === 'troparion-of-the-day') {
                const resolved = await _resolveLittleHourSeasonalTroparionSlot('typika', dayOfWeek, dateObj, toneResult);
                if (resolved) {
                    section.items[i] = Object.assign({}, resolved, {
                        key: 'troparion-of-the-day'
                    });
                }
                continue;
            }
          }
    }
}

// ── v7.0: _loadInterhourFixedData(officeKey) ──────────────────────────
async function _loadInterhourFixedData(officeKey) {
    if (Object.prototype.hasOwnProperty.call(_interhourFixedDataCache, officeKey)) return;

    const URL_MAP = {
        'interhour-first': INTERHOUR_FIRST_FIXED_URL,
        'interhour-third': INTERHOUR_THIRD_FIXED_URL,
        'interhour-sixth': INTERHOUR_SIXTH_FIXED_URL,
        'interhour-ninth': INTERHOUR_NINTH_FIXED_URL
    };

    const url = URL_MAP[officeKey];
    if (!url) {
        console.warn(`[HorologionEngine] _loadInterhourFixedData: unknown officeKey "${officeKey}".`);
        _interhourFixedDataCache[officeKey] = null;
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`[HorologionEngine] Could not load Interhour fixed data for "${officeKey}" (HTTP ${response.status}); fixed slots will remain as placeholders.`);
            _interhourFixedDataCache[officeKey] = null;
            return;
        }
        _interhourFixedDataCache[officeKey] = await response.json();
        console.log(`[HorologionEngine] Loaded Interhour fixed text data: ${officeKey}.`);
    } catch (err) {
        console.warn(`[HorologionEngine] _loadInterhourFixedData(${officeKey}) failed:`, err.message, '— fixed slots will remain as placeholders.');
        _interhourFixedDataCache[officeKey] = null;
    }
}

// ── v7.0: _resolveInterhourSlots(officeKey, sections, dateObj) ────────
async function _resolveInterhourSlots(officeKey, sections, dateObj) {
    await Promise.all([
        _loadInterhourFixedData(officeKey),
        _loadTroparionData(),
        _loadWeekdayTroparionMeta(),
        _loadTriodionData()
    ]);

    const dayOfWeek = dateObj.getDay();
    const toneResult = _computeBaselineTone(dateObj);
    const fixedData = _interhourFixedDataCache[officeKey] || null;

    const PSALM_KEY_MAP = {
        'interhour-first': new Set(['psalm-20', 'psalm-21', 'psalm-22']),
        'interhour-third': new Set(['psalm-34', 'psalm-35', 'psalm-36']),
        'interhour-sixth': new Set(['psalm-60', 'psalm-61', 'psalm-62']),
        'interhour-ninth': new Set(['psalm-86', 'psalm-87', 'psalm-88'])
    };

    const THEOTOKION_KEY_MAP = {
        'interhour-first': 'interhour-first-theotokion',
        'interhour-third': 'interhour-third-theotokion',
        'interhour-sixth': 'interhour-sixth-theotokion',
        'interhour-ninth': 'interhour-ninth-theotokion'
    };

    const psalmKeys = PSALM_KEY_MAP[officeKey] || new Set();
    const theotokionKey = THEOTOKION_KEY_MAP[officeKey] || null;

    const FIXED_SLOT_KEYS = new Set([
        ...psalmKeys,
        'trisagion-prayers',
        theotokionKey
    ].filter(Boolean));

    for (const section of sections) {
        if (!Array.isArray(section.items)) continue;

        for (let i = 0; i < section.items.length; i++) {
            const item = section.items[i];

            if (FIXED_SLOT_KEYS.has(item.key)) {
                const slotData = fixedData &&
                    fixedData.slots &&
                    fixedData.slots[item.key];

                if (slotData) {
                    section.items[i] = {
                        type: slotData.type || 'text',
                        key: item.key,
                        label: slotData.label || item.label,
                        text: slotData.text,
                        lxxNumber: slotData.lxxNumber,
                        items: Array.isArray(slotData.items) ? slotData.items : undefined,
                        resolvedAs: officeKey + '-fixed'
                    };
                }
                continue;
            }

            if (item.key === 'troparion-of-the-day') {
                const resolved = await _resolveLittleHourSeasonalTroparionSlot(officeKey, dayOfWeek, dateObj, toneResult);
                if (resolved) {
                    section.items[i] = Object.assign({}, resolved, {
                        key: 'troparion-of-the-day'
                    });
                }
                continue;
            }
        }
    }
}

return {
    getOfficeSkeleton,
    resolveOffice,
    validateOfficePayload
};
})();

window.HorologionEngine = HorologionEngine;