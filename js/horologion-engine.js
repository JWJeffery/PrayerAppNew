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
// ──────────────────────────────────────────────────────────────────────────
const HorologionEngine = (() => {

    // ── Internal skeleton cache ────────────────────────────────────────────
    // Keys: officeKey strings (e.g. 'vespers')
    // Values: parsed JSON skeleton objects
    const _skeletonCache = {};

    // ── Supported offices in this version ─────────────────────────────────
    const SUPPORTED_OFFICES = ['vespers'];

    // ── Tradition code for this engine ────────────────────────────────────
    const TRADITION = 'BYZC';

    // ── v1.2: Prokeimena data file URL ─────────────────────────────────────
    const PROKEIMENA_URL = 'data/horologion/vespers-prokeimena.json';

    // ── v1.3: Octoechos data file URL ──────────────────────────────────────
    const OCTOECHOS_URL = 'data/horologion/octoechos-vespers.json';

    // ── v1.5: Kathisma appointment table URL ───────────────────────────────
    const KATHISMA_URL = 'data/horologion/vespers-kathisma.json';

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

    // ── v1.3: Pascha cache ─────────────────────────────────────────────────
    // Keyed by Gregorian year string. Avoids recomputing Pascha repeatedly
    // for the same year within a session.
    const _paschaCache = {};


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

        // v1.2 / v1.3: Run ordinary-day slot resolution before diagnostic count
        await _resolveVespersSlots(sections, dateObj);

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
    // v1.3: _computeOrthodoxPascha(gregorianYear)
    //
    // BASELINE TONE CALC — Meeus Julian Paschalion.
    //
    // Returns Orthodox Pascha as a plain JS Date (local midnight).
    //
    // This is a self-contained copy of the same algorithm in
    // js/calendar-eastern-orthodox.js. It is duplicated here because
    // calendar-eastern-orthodox.js is NOT loaded on the main app path
    // (it is admin-only as of v1.3). When/if calendar-eastern-orthodox.js
    // is promoted to the main path, this function should be replaced with
    // a delegation call to EasternOrthodoxCalendar.computeOrthodoxPascha().
    //
    // The Julian-to-Gregorian offset is 13 days for the 21st century and
    // most of the 20th. This function uses a static offset of 13, which is
    // correct for all dates from 1900 through 2099 — the operational range
    // of this application.
    // ──────────────────────────────────────────────────────────────────────
    function _computeOrthodoxPascha(gregorianYear) {
        const y = gregorianYear;
        const a = y % 4;
        const b = y % 7;
        const c = y % 19;
        const d = (19 * c + 15) % 30;
        const e = (2 * a + 4 * b - d + 34) % 7;
        const f = Math.floor((d + e + 114) / 31); // 3 = March, 4 = April
        const g = ((d + e + 114) % 31) + 1;

        // Julian date (f, g) → Gregorian: add 13 days (correct 1900–2099)
        const JULIAN_TO_GREGORIAN_OFFSET_DAYS = 13;
        // Convert Julian date to a JS Date via a neutral calculation:
        // JS Date constructor with year/month/day handles overflow automatically.
        // Month index: f=3 → month 2 (0-based March), f=4 → month 3 (0-based April).
        const julianDay   = new Date(y, f - 1, g);
        const gregMs      = julianDay.getTime() + JULIAN_TO_GREGORIAN_OFFSET_DAYS * 86400000;
        const raw         = new Date(gregMs);
        // Return local midnight (no time component)
        return new Date(raw.getFullYear(), raw.getMonth(), raw.getDate());
    }


    // ──────────────────────────────────────────────────────────────────────
    // v1.3: _getOrthodoxPascha(gregorianYear)
    //
    // Cached wrapper around _computeOrthodoxPascha().
    // ──────────────────────────────────────────────────────────────────────
    function _getOrthodoxPascha(gregorianYear) {
        const key = String(gregorianYear);
        if (!_paschaCache[key]) {
            _paschaCache[key] = _computeOrthodoxPascha(gregorianYear);
        }
        return _paschaCache[key];
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
        let year = localDate.getFullYear();
        let pascha = _getOrthodoxPascha(year);
        if (pascha > localDate) {
            year  = year - 1;
            pascha = _getOrthodoxPascha(year);
        }

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
    function _resolveKathismaSlot(dayOfWeek, brightWeek) {
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

        // ── Ordinary weekday: name the appointed kathisma ─────────────────
        // Produces a rubric that identifies the kathisma and its psalm range.
        // Full text is NOT rendered here; this tells the officiant what to read.
        const k = assignment.kathismaNumber;
        const title = assignment.title;
        const psalmsLxx = assignment.psalms_lxx;
        const psalmsProt = assignment.psalms_heb_protestant;
        const incipit = assignment.incipit;

        let text = `${assignment.rubric}\n\n` +
            `Incipit: "${incipit}"\n\n` +
            `(LXX Psalm numbers used throughout, as per Byzantine liturgical practice. ` +
            `Protestant/Hebrew equivalents: Psalms ${psalmsProt}.)\n\n` +
            `(BASELINE — ordinary weekday weekly cycle only. ` +
            `Great Feast and Great Lent kathisma overrides are not yet implemented. ` +
            `Full psalm text is deferred; read the appointed kathisma from a Psalter.)`;

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
            resolvedAs:     'ordinary-weekday-baseline'
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

        // ── Bright Week: Paschal Troparion ────────────────────────────────
        if (toneResult.brightWeek) {
            const pt = _troparionData.paschal_troparion;
            if (!pt) return null;
            return {
                type:       'text',
                key:        'troparion-or-apolytikion',
                label:      pt.title,
                text:       pt.text,
                resolvedAs: 'bright-week-paschal-troparion'
            };
        }

        const tone = toneResult.tone;
        if (!tone) return null;

        // ── Sunday Small Vespers: Resurrectional Troparion ──────────────────
        // The Resurrectional Troparion of the current Octoechos tone is sung
        // at Sunday Small Vespers. The text is the same as at Saturday Great
        // Vespers — it is the fixed apolytikion of the tone.
        if (dayOfWeek === 0) {
            const troparia = _troparionData.resurrectional_troparia;
            const entry = troparia && troparia[String(tone)];
            if (!entry) return null;

            return {
                type:       'text',
                key:        'troparion-or-apolytikion',
                label:      entry.title,
                text:       entry.text + '\n\n' +
                            `(BASELINE — Sunday Small Vespers, Tone ${tone}. ` +
                            `This is the Resurrectional Troparion (Apolytikion) of the Octoechos. ` +
                            `The same troparion is used at both Saturday Great Vespers and ` +
                            `Sunday Small Vespers for the same tone week. ` +
                            `On Great Feast Sundays, the proper apolytikion of the feast replaces ` +
                            `this text; festal overrides are not yet implemented.)`,
                tone:       tone,
                resolvedAs: 'resurrectional-troparion-sunday'
            };
        }

        // ── Saturday: full Resurrectional Troparion ───────────────────────
        if (dayOfWeek === 6) {
            const troparia = _troparionData.resurrectional_troparia;
            const entry = troparia && troparia[String(tone)];
            if (!entry) return null;

            return {
                type:       'text',
                key:        'troparion-or-apolytikion',
                label:      entry.title,
                text:       entry.text + '\n\n' +
                            `(BASELINE — ordinary Saturday Great Vespers, Tone ${tone}. ` +
                            `This is the fixed Resurrectional Troparion of the Octoechos. ` +
                            `On Great Feast days, the proper apolytikion of the feast replaces this text; ` +
                            `festal overrides are not yet implemented.)`,
                tone:       tone,
                resolvedAs: 'resurrectional-troparion-saturday'
            };
        }

        // ── Weekday (Mon–Fri): query MenaionResolver, fall back to theme rubric ──
        // v2.1: MenaionResolver is queried first for a fixed-date troparion.
        // If a text is found, it is returned as type:'text'.
        // If the month is not imported, no ranked commemoration exists, or the
        // resolver is unavailable, we fall through to the theme-aware rubric
        // (identical to the v2.0 behaviour). Non-throwing.
        const WEEKDAY_NAMES_LC = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const weekdayName = WEEKDAY_NAMES_LC[dayOfWeek] || 'unknown';

        // Resolve weekday theme (used in both resolved and fallback output)
        const themeSource = (_weekdayTroparionMeta && _weekdayTroparionMeta.weekday_themes)
            ? _weekdayTroparionMeta.weekday_themes[weekdayName]
            : _WEEKDAY_THEME_FALLBACK[weekdayName];

        const theme      = themeSource ? themeSource.theme       : 'see Menaion';
        const themeShort = themeSource ? themeSource.theme_short : 'see Menaion';
        const fastingDay = themeSource ? !!themeSource.fasting_day : false;

        const fastingNote = fastingDay
            ? ` (${weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)} is a weekly fasting day; the troparion typically addresses the Cross.)`
            : '';

        // ── v2.1: MenaionResolver query ───────────────────────────────────
        if (dateObj && typeof window !== 'undefined' && window.MenaionResolver) {
            try {
                const mm   = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dd   = String(dateObj.getDate()).padStart(2, '0');
                const mmdd = `${mm}-${dd}`;
                const mr   = await window.MenaionResolver.queryTroparion(mmdd);

                if (mr.status === 'menaion-resolved') {
                    // v2.2: feastRankOverride flag added for rank 1/2 feasts.
                    // The troparion selection path is unchanged — the engine already
                    // returned the Menaion text for any rank. The flag lets the
                    // Theotokion resolver detect when a rank 1/2 feast tone should
                    // drive the dismissal Theotokion. The stale "pilot corpus:
                    // November only" note is removed; all 12 months are now imported.
                    const isFeastRankOverride = typeof mr.rank === 'number' && mr.rank <= 2;
                    return {
                        type:             'text',
                        key:              'troparion-or-apolytikion',
                        label:            mr.title || `Apolytikion — ${mr.name}`,
                        text:             mr.text +
                                          `\n\n(Menaion — ${mr.name}. Tone ${mr.tone}. Rank ${mr.rank}. ` +
                                          `Stichera and paremiae overrides for rank 1/2 feasts are not yet implemented.)`,
                        tone:             mr.tone,
                        weekdayTheme:     theme,
                        fastingDay:       fastingDay,
                        menaionName:      mr.name,
                        menaionRank:      mr.rank,
                        feastRankOverride: isFeastRankOverride,
                        resolvedAs:       'menaion-resolved'
                    };
                }

                if (mr.status === 'menaion-text-unavailable') {
                    return {
                        type:         'rubric',
                        key:          'troparion-or-apolytikion',
                        label:        `Troparion / Apolytikion of the Day — ${mr.name || theme}`,
                        text:         `[${mr.name || theme}]\n\n` +
                                      `Tone ${tone} — Menaion: commemoration identified but troparion text not yet imported.\n\n` +
                                      (mr.note || ''),
                        tone:         tone,
                        weekdayTheme: theme,
                        fastingDay:   fastingDay,
                        resolvedAs:   'menaion-text-unavailable'
                    };
                }

                // 'menaion-not-imported', 'menaion-no-ranked-commemoration',
                // 'menaion-load-error' — fall through to theme rubric below.

            } catch (err) {
                console.warn('[HorologionEngine] MenaionResolver.queryTroparion threw:', err.message);
                // fall through to theme rubric
            }
        }

        // ── Fallback: weekday-theme rubric (v2.0 behaviour) ───────────────
        // Reached when MenaionResolver is unavailable, the month is not yet
        // imported, no ranked commemoration was found, or a load error occurred.
        return {
            type:         'rubric',
            key:          'troparion-or-apolytikion',
            label:        `Troparion / Apolytikion of the Day — ${theme}`,
            text:         `[${theme}${fastingNote}]\n\n` +
                          `Tone ${tone} — Weekday Troparion: Menaion required.\n\n` +
                          `On an ordinary ${weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)}, ` +
                          `Byzantine Vespers appoints the troparion of ${themeShort} from the Menaion. ` +
                          `If a saint of rank 4 or higher is commemorated from the Menaion today, ` +
                          `the saint's own apolytikion is used in its place.\n\n` +
                          `The current Octoechos weekly tone is Tone ${tone}. ` +
                          `The troparion is typically sung in the tone of the saint's apolytikion (Menaion), ` +
                          `which may or may not coincide with Tone ${tone}.\n\n` +
                          `Weekday troparion text resolution requires Menaion data. ` +
                          `The Menaion corpus for this date has not yet been imported.`,
            tone:         tone,
            weekdayTheme: theme,
            fastingDay:   fastingDay,
            resolvedAs:   'weekday-theme-rubric'
        };
    }


    // ──────────────────────────────────────────────────────────────────────
    // v1.7: _loadTheotokionData()
    //
    // Fetches and caches the Vespers dismissal Theotokion data from
    // data/horologion/vespers-theotokion.json.
    //
    // Non-throwing: on failure, logs a warning and leaves _theotokionData null.
    // The resolver degrades gracefully — the theotokion-dismissal slot
    // remains as a placeholder rather than failing or fabricating content.
    // ──────────────────────────────────────────────────────────────────────
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
    // v1.7: _resolveTheotokionSlot(dayOfWeek, toneResult)
    //
    // Returns a resolved item for the theotokion-dismissal slot,
    // or null if the data file has not loaded (graceful degradation).
    //
    // dayOfWeek: JS Date.getDay() value (0 = Sunday … 6 = Saturday)
    // toneResult: object from _computeBaselineTone() — { tone, brightWeek, ... }
    //
    // RULE: Dismissal Theotokion of the current Octoechos tone.
    //
    // SATURDAY (ordinary Great Vespers):
    //   Returns the full dismissal Theotokion text for the computed tone.
    //   These are the apolytikion-paired dismissal Theotokia of the Octoechos,
    //   invariable for each tone. Require no Menaion.
    //   Source: data/horologion/vespers-theotokion.json, keyed by tone string.
    //   resolvedAs: 'dismissal-theotokion-saturday'
    //
    // BRIGHT WEEK (Pascha Sunday through Thomas Saturday):
    //   The Paschal Troparion itself serves as the dismissal during Bright Week;
    //   there is no separate dismissal Theotokion. This is a liturgical omission,
    //   not a data gap. Returns an explanatory rubric.
    //   resolvedAs: 'bright-week-no-theotokion'
    //
    // WEEKDAY (Monday–Friday) ORDINARY — v1.9:
    //   Returns full Octoechos weekday Theotokion text (type:'text') for the
    //   current tone + day. Mon, Tue, Thu: standard weekday Theotokion.
    //   Wed, Fri: Stavrotheotokion (Cross Theotokion), the standard Byzantine
    //   practice for the weekly fasting days.
    //   Source: data/horologion/vespers-weekday-theotokion.json (40 entries).
    //   LIMITATION: The ideal Theotokion follows the tone of the Menaion
    //   troparion, which may differ from the weekly Octoechos tone. This
    //   baseline uses the Octoechos tone — correct when the two agree (ordinary
    //   weeks with no feast). The limitation is stated openly in the output.
    //   resolvedAs: 'weekday-octoechos-theotokion'
    //   Graceful degradation: if weekday data file failed to load, falls back
    //   to the v1.7 tone-identified rubric stub (resolvedAs: 'weekday-menaion-required').
    //
    // SUNDAY:
    //
    // FESTAL OVERRIDES:
    //   Not implemented. When a Great Feast falls on Saturday, its proper
    //   Theotokion replaces the ordinary tone Theotokion. Requires feast-rank
    //   engine. The Saturday output states this limitation explicitly.
    //
    // Returns: a resolved item object, or null on data load failure.
    // ──────────────────────────────────────────────────────────────────────
    function _resolveTheotokionSlot(dayOfWeek, toneResult, resolvedTroparionItem) {
        // If data file failed to load, degrade to placeholder.
        if (_theotokionData === null) return null;

        // ── Bright Week: no dismissal Theotokion ─────────────────────────
        if (toneResult.brightWeek) {
            return {
                type:       'rubric',
                key:        'theotokion-dismissal',
                label:      'Theotokion',
                text:       '(Bright Week — no dismissal Theotokion. ' +
                            'During Bright Week (Pascha Sunday through Thomas Saturday) ' +
                            'the Paschal Troparion ("Christ is risen") itself serves as the dismissal. ' +
                            'No separate Theotokion is sung.)',
                resolvedAs: 'bright-week-no-theotokion'
            };
        }

        const tone = toneResult.tone;
        if (!tone) return null;

        // ── Sunday Small Vespers: dismissal Theotokion ───────────────────────
        // The dismissal Theotokion of the current Octoechos tone is sung at
        // Sunday Small Vespers, paired with the Resurrectional Troparion.
        // The text is the same as at Saturday Great Vespers — the fixed tone
        // Theotokion of the Octoechos, not a Saturday-specific text.
        if (dayOfWeek === 0) {
            const theotokia = _theotokionData.dismissal_theotokia;
            const entry = theotokia && theotokia[String(tone)];
            if (!entry) return null;

            return {
                type:       'text',
                key:        'theotokion-dismissal',
                label:      entry.title,
                text:       entry.text + '\n\n' +
                            `(BASELINE — Sunday Small Vespers, Tone ${tone}. ` +
                            `This is the dismissal Theotokion of the Octoechos, paired with the ` +
                            `Resurrectional Troparion of the same tone. ` +
                            `The same Theotokion is used at both Saturday Great Vespers and ` +
                            `Sunday Small Vespers for the same tone week. ` +
                            `On Great Feast Sundays, a proper Theotokion replaces this text; ` +
                            `festal overrides are not yet implemented.)`,
                tone:       tone,
                resolvedAs: 'dismissal-theotokion-sunday'
            };
        }

        // ── Saturday: full dismissal Theotokion ───────────────────────────
        if (dayOfWeek === 6) {
            const theotokia = _theotokionData.dismissal_theotokia;
            const entry = theotokia && theotokia[String(tone)];
            if (!entry) return null;

            return {
                type:       'text',
                key:        'theotokion-dismissal',
                label:      entry.title,
                text:       entry.text + '\n\n' +
                            `(BASELINE — ordinary Saturday Great Vespers, Tone ${tone}. ` +
                            `This is the dismissal Theotokion of the Octoechos, paired with the ` +
                            `Resurrectional Troparion of the same tone. ` +
                            `Note: this is distinct from the Dogmatikon (major Theotokion of the tone) ` +
                            `sung during the Aposticha. ` +
                            `On Great Feast days, a proper Theotokion replaces this text; ` +
                            `festal overrides are not yet implemented.)`,
                tone:       tone,
                resolvedAs: 'dismissal-theotokion-saturday'
            };
        }

        // ── Weekday (Mon–Fri): Octoechos weekday Theotokion ─────────────────
        // v1.9: full type:'text' resolution from vespers-weekday-theotokion.json.
        // Wednesday and Friday entries are Stavrotheotokia (Cross Theotokia).
        //
        // v2.2: Menaion tone-correction for rank 1/2 feasts.
        // When the resolved troparion is a rank 1/2 Menaion commemoration, the
        // Theotokion lookup uses the Menaion troparion's tone rather than the
        // Octoechos weekly tone. For all other cases the Octoechos tone is used.
        //
        // Graceful degradation: if the weekday data file failed to load,
        // fall back to the v1.7 tone-identified rubric stub.
        const WEEKDAY_NAMES_SHORT = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const weekdayName = WEEKDAY_NAMES_SHORT[dayOfWeek]; // 'monday' … 'friday'

        // v2.2: determine effective Theotokion tone
        // v2.5: Menaion tone-correction now applies to all resolved Menaion
        // commemorations (rank 1–4), not only rank-1/2 feasts. Whenever the
        // troparion was resolved from the Menaion with a valid tone, the
        // weekday Theotokion follows that tone rather than the Octoechos baseline.
        const menaionToneCorrection =
            resolvedTroparionItem &&
            resolvedTroparionItem.resolvedAs === 'menaion-resolved' &&
            typeof resolvedTroparionItem.tone === 'number' &&
            resolvedTroparionItem.tone >= 1 &&
            resolvedTroparionItem.tone <= 8;

        const effectiveTone = menaionToneCorrection ? resolvedTroparionItem.tone : tone;
        const theotokionToneSource = menaionToneCorrection ? 'menaion' : 'octoechos';

        if (_weekdayTheotokionData !== null) {
            const allTones = _weekdayTheotokionData.weekday_theotokia;
            const toneEntry = allTones && allTones[String(effectiveTone)];
            const dayEntry  = toneEntry && toneEntry[weekdayName];

            if (dayEntry) {
                const isStavro = (dayOfWeek === 3 || dayOfWeek === 5);
                const typeLabel = isStavro ? 'Stavrotheotokion' : 'Theotokion';

                const baselineOrOverride = menaionToneCorrection ? 'FEAST-TONE CORRECTION' : 'BASELINE';
                const toneAnnotation = menaionToneCorrection
                    ? `Tone ${effectiveTone} (from Menaion troparion — rank ${resolvedTroparionItem.menaionRank} feast; Octoechos tone was ${tone}).`
                    : `Tone ${effectiveTone} (Octoechos baseline). ` +
                      `LIMITATION: The Theotokion at weekday Vespers ordinarily follows the tone of the ` +
                      `Menaion troparion sung. This baseline is correct when the Menaion troparion ` +
                      `is of the same tone; rank 1/2 feast tone-correction is now applied automatically.`;

                return {
                    type:                'text',
                    key:                 'theotokion-dismissal',
                    label:               dayEntry.title,
                    text:                dayEntry.text + '\n\n' +
                                         `(${baselineOrOverride} — weekday Vespers, ${_capitalise(weekdayName)}. ` +
                                         `${toneAnnotation} ` +
                                         `This is the ${typeLabel} of the Octoechos for this tone and day. ` +
                                         (isStavro
                                             ? `Wednesday and Friday Theotokia are Stavrotheotokia (Theotokia of the Cross), ` +
                                               `reflecting the fasting character of these days in the Byzantine rite. `
                                             : ''),
                    tone:                effectiveTone,
                    weekday:             weekdayName,
                    theotokionToneSource: theotokionToneSource,
                    resolvedAs:          'weekday-octoechos-theotokion'
                };
            }
        }

        // Fallback: weekday data file unavailable — return rubric stub
        return {
            type:       'rubric',
            key:        'theotokion-dismissal',
            label:      'Theotokion',
            text:       `(Tone ${effectiveTone} — Weekday Dismissal Theotokion: data unavailable. ` +
                        `The weekday Theotokion data file (vespers-weekday-theotokion.json) could not be loaded. ` +
                        (menaionToneCorrection
                            ? `Menaion tone-correction was applicable (rank ${resolvedTroparionItem.menaionRank} feast, Tone ${effectiveTone}) but could not be applied.`
                            : `Current Octoechos tone: Tone ${effectiveTone}.`),
            tone:       effectiveTone,
            resolvedAs: 'weekday-menaion-required'
        };
    }
    // ──────────────────────────────────────────────────────────────────────
    // v1.9 internal helper: _capitalise(str)
    // Returns the string with the first character uppercased.
    // Used for weekday name formatting in rubric text.
    // ──────────────────────────────────────────────────────────────────────
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

        let year = localDate.getFullYear();
        let pascha = _getOrthodoxPascha(year);
        if (pascha > localDate) {
            year  = year - 1;
            pascha = _getOrthodoxPascha(year);
        }

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
    // v1.3: _resolveSticheraSlot(tone, weekdayName, slotKey, toneResult)
    //
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
        // Load all data files in parallel (seven loaders as of v2.0)
        await Promise.all([
            _loadVespersProkeimena(),
            _loadOctoechosData(),
            _loadKathismaData(),
            _loadTroparionData(),
            _loadTheotokionData(),
            _loadWeekdayTheotokionData(),
            _loadWeekdayTroparionMeta()
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

                // ── vesperal-reading (v1.2 / v2.4) ───────────────────────
                else if (item.key === 'vesperal-reading') {
                    if (isHolyWeek) {
                        // v2.7: Holy Week override
                        section.items[i] = _buildHolyWeekRubric(
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
                // ── stichera-at-lord-i-have-cried (v1.3 / v2.3) ──────────
                else if (item.key === 'stichera-at-lord-i-have-cried') {
                    if (toneResult.brightWeek) {
                        // Bright Week: Paschal hymns, not Octoechos — unchanged
                        section.items[i] = {
                            type:       'rubric',
                            key:        'stichera-at-lord-i-have-cried',
                            label:      'Stichera at "Lord, I have cried"',
                            text:       '(Bright Week — Paschal Tone. During Bright Week (Pascha Sunday through Thomas Saturday), the Resurrectional Stichera of Tone 1 are replaced by Paschal hymns. Ordinary Octoechos stichera are not used this week.)',
                            resolvedAs: 'bright-week-paschal-tone'
                        };
                        } else if (isHolyWeek) {
                        // v2.7: Holy Week override — replaces ordinary/Lent output
                        section.items[i] = _buildHolyWeekRubric(
                            'stichera-at-lord-i-have-cried',
                            'Stichera at "Lord, I have cried"',
                            holyWeekDay
                        );
                    } else if (isWeekday && _preResolvedTroparion && _preResolvedTroparion.feastRankOverride === true) {
                        // v2.3: rank-1/2 weekday feast — unchanged
                        section.items[i] = {
                            type:       'rubric',
                            key:        'stichera-at-lord-i-have-cried',
                            label:      'Stichera at "Lord, I have cried"',
                            text:       `(FEAST-RANK OVERRIDE — ${_preResolvedTroparion.menaionName}, ` +
                                        `Rank ${_preResolvedTroparion.menaionRank}. ` +
                                        `The ordinary weekday Octoechos stichera (${octoechosWeekdayKey} theme) are displaced by this feast. ` +
                                        `Proper festal stichera for this commemoration are not yet in the corpus. ` +
                                        `When available, the appointed stichera from the Menaion for this feast will appear here.)`,
                            menaionName: _preResolvedTroparion.menaionName,
                            menaionRank: _preResolvedTroparion.menaionRank,
                            resolvedAs:  'weekday-feast-stichera-pending'
                        };
                    } else if (isGreatLentWeekday) {
                        // v2.6: Great Lent weekday — ordinary Octoechos weekday stichera
                        // are not sung during Great Lent. Triodion stichera corpus not yet
                        // available; render an explicit Lenten seasonal rubric.
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
                            toneResult.tone, octoechosWeekdayKey,
                            'stichera_at_lord_i_have_cried', toneResult
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

                // ── aposticha (v1.3 / v2.3) ───────────────────────────────
                else if (item.key === 'aposticha') {
                    if (toneResult.brightWeek) {
                        // Bright Week unchanged
                        section.items[i] = {
                            type:       'rubric',
                            key:        'aposticha',
                            label:      'Aposticha',
                            text:       '(Bright Week — Paschal Tone. During Bright Week, the Aposticha are Paschal hymns, not the ordinary Octoechos aposticha.)',
                            resolvedAs: 'bright-week-paschal-tone'
                        };
                        } else if (isHolyWeek) {
                        // v2.7: Holy Week override
                        section.items[i] = _buildHolyWeekRubric(
                            'aposticha',
                            'Aposticha',
                            holyWeekDay
                        );
                    } else if (isWeekday && _preResolvedTroparion && _preResolvedTroparion.feastRankOverride === true) {
                        // v2.3: rank-1/2 weekday feast — unchanged
                        section.items[i] = {
                            type:       'rubric',
                            key:        'aposticha',
                            label:      'Aposticha',
                            text:       `(FEAST-RANK OVERRIDE — ${_preResolvedTroparion.menaionName}, ` +
                                        `Rank ${_preResolvedTroparion.menaionRank}. ` +
                                        `The ordinary weekday Octoechos aposticha (${octoechosWeekdayKey} theme) are displaced by this feast. ` +
                                        `Proper festal aposticha for this commemoration are not yet in the corpus. ` +
                                        `When available, the appointed aposticha from the Menaion for this feast will appear here.)`,
                            menaionName: _preResolvedTroparion.menaionName,
                            menaionRank: _preResolvedTroparion.menaionRank,
                            resolvedAs:  'weekday-feast-aposticha-pending'
                        };
                    } else if (isGreatLentWeekday) {
                        // v2.6: Great Lent weekday — ordinary Octoechos weekday aposticha
                        // are not sung during Great Lent. Triodion aposticha corpus not yet
                        // available; render an explicit Lenten seasonal rubric.
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
                            toneResult.tone, octoechosWeekdayKey,
                            'aposticha', toneResult
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

                // ── kathisma-reading (v1.5) ───────────────────────────────
                // Baseline: standard Byzantine Psalter weekly cycle, Mon–Sat.
                // Sunday and Bright Week are handled with explicit honest notes.
                // Festal/Lenten overrides are NOT implemented in this pass.
                else if (item.key === 'kathisma-reading') {
                    const resolved = _resolveKathismaSlot(dayOfWeek, toneResult.brightWeek);
                    if (resolved) {
                        section.items[i] = resolved;
                    }
                    // If null (data load failed), slot remains placeholder.
                }

                // ── troparion-or-apolytikion (v1.6 / v2.3) ───────────────
                // Baseline: Resurrectional Troparion of the current tone
                // for Saturday Great Vespers. Bright Week: Paschal Troparion.
                // Weekdays: pre-resolved above (_preResolvedTroparion) on Mon–Fri;
                //   resolver called directly for Saturday and Sunday.
                // Sunday: Resurrectional Troparion of the tone.
                else if (item.key === 'troparion-or-apolytikion') {
                    if (isHolyWeek) {
                        // v2.7: Holy Week override — fires before Menaion query
                        section.items[i] = _buildHolyWeekRubric(
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
                                section.items[i] = {
                                    type:       'rubric',
                                    key:        'troparion-or-apolytikion',
                                    label:      'Troparion / Apolytikion of the Day',
                                    text:       '(GREAT LENT — weekday Vespers. ' +
                                                'The ordinary weekday Octoechos troparion theme is not used during Great Lent. ' +
                                                'On Lenten weekdays without a ranked Menaion commemoration, ' +
                                                'the dismissal troparion follows Lenten practice from the Triodion. ' +
                                                'The Triodion corpus is not yet available in this engine. ' +
                                                'When available, the appointed Lenten troparion will appear here.)',
                                    resolvedAs: 'great-lent-troparion-pending'
                                };
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
                        troparionItem.resolvedAs === 'menaion-resolved';

                    if (isHolyWeek) {
                        // v2.7: Holy Week override
                        section.items[i] = _buildHolyWeekRubric(
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
        // Simple structured clone; avoids mutating cached skeleton
        try {
            return JSON.parse(JSON.stringify(sections));
        } catch (e) {
            console.error('[HorologionEngine] _deepCopySections: clone failed', e);
            return sections;
        }
    }

    function _officeTitleFallback(officeKey) {
        const titles = {
            vespers:           'Vespers',
            orthros:           'Orthros (Matins)',
            'midnight-office': 'Midnight Office',
            'first-hour':      'First Hour',
            'third-hour':      'Third Hour',
            'sixth-hour':      'Sixth Hour',
            'ninth-hour':      'Ninth Hour',
            compline:          'Compline (Small Apodeipnon)'
        };
        return titles[officeKey] || officeKey;
    }


    // ══════════════════════════════════════════════════════════════════════
    // Public API
    // ══════════════════════════════════════════════════════════════════════
    return {
        getOfficeSkeleton,
        resolveOffice,
        validateOfficePayload,
        /** Read-only list of offices supported in v1 */
        SUPPORTED_OFFICES: Object.freeze(SUPPORTED_OFFICES),
        /** Tradition code for this engine */
        TRADITION: TRADITION
    };

})();

// Expose globally for the no-build-step SPA pattern
window.HorologionEngine = HorologionEngine;