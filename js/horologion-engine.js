// ── js/horologion-engine.js ────────────────────────────────────────────────
//
// Horologion Engine v1.7
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

        // ── Sunday: explicitly deferred ──────────────────────────────────
        if (assignment.sunday_deferred) {
            return {
                type:       'rubric',
                key:        'kathisma-reading',
                label:      'Kathisma',
                text:       '(Sunday Vespers — Kathisma appointment deferred. Sunday Vespers kathisma practice varies significantly by usage: at full Great Vespers (all-night vigil) Kathisma 1 is standard; at ordinary Sunday small Vespers the kathisma is often omitted or varies by local use. A single baseline rule cannot be safely applied. This slot will be resolved in a future pass.)',
                resolvedAs: 'sunday-deferred'
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
    // SUNDAY:
    //   Explicitly deferred. Sunday Vespers troparion handling is part of
    //   the dedicated Sunday Vespers pass. Not fabricated.
    //   resolvedAs: 'sunday-deferred'
    //
    // FESTAL OVERRIDES:
    //   Not implemented. When a Great Feast falls on any day, its proper
    //   apolytikion replaces the resurrectional troparion. This requires a
    //   feast-rank engine (Menaion + feast calendar). Deferred.
    //   The output for Saturday states this limitation explicitly.
    //
    // Returns: a resolved item object, or null on data load failure.
    // ──────────────────────────────────────────────────────────────────────
    function _resolveTroparionSlot(dayOfWeek, toneResult) {
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

        // ── Sunday: explicitly deferred ───────────────────────────────────
        if (dayOfWeek === 0) {
            return {
                type:       'rubric',
                key:        'troparion-or-apolytikion',
                label:      'Troparion / Apolytikion of the Day',
                text:       `(Sunday Vespers — Troparion deferred. ` +
                            `Current tone: Tone ${tone}. ` +
                            `Sunday Vespers troparion handling is part of the dedicated Sunday Vespers pass ` +
                            `and is not resolved in this baseline. The Resurrectional Troparion of Tone ${tone} ` +
                            `is appointed for Sunday, but Sunday Vespers overall is not yet fully implemented.)`,
                tone:       tone,
                resolvedAs: 'sunday-deferred'
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

        // ── Weekday (Mon–Fri): tone-identified stub ───────────────────────
        // The weekday troparion is drawn from the Menaion (saints of the day).
        // There is no single week-cycle rule that safely identifies it without
        // Menaion data. The tone is known; the text is not fabricated.
        return {
            type:       'rubric',
            key:        'troparion-or-apolytikion',
            label:      'Troparion / Apolytikion of the Day',
            text:       `(Tone ${tone} — Weekday Troparion: Menaion required. ` +
                        `The troparion at weekday Vespers is appointed by the Menaion ` +
                        `(the saints and commemorations of this day). ` +
                        `The current Octoechos tone is Tone ${tone}. ` +
                        `Full weekday troparion resolution requires Menaion data, which is not yet implemented. ` +
                        `The Resurrectional Troparion of Tone ${tone} is NOT used at ordinary weekday Vespers.)`,
            tone:       tone,
            resolvedAs: 'weekday-menaion-required'
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
    // WEEKDAY (Monday–Friday) ORDINARY:
    //   The dismissal Theotokion at weekday Vespers follows the tone of whichever
    //   Menaion troparion was sung. Since weekday troparion text is Menaion-driven
    //   and not yet implemented, the weekday Theotokion cannot be resolved without
    //   fabricating a link that does not exist. Returns a tone-identified stub.
    //   resolvedAs: 'weekday-menaion-required'
    //
    // SUNDAY:
    //   Explicitly deferred — part of the dedicated Sunday Vespers pass.
    //   resolvedAs: 'sunday-deferred'
    //
    // FESTAL OVERRIDES:
    //   Not implemented. When a Great Feast falls on Saturday, its proper
    //   Theotokion replaces the ordinary tone Theotokion. Requires feast-rank
    //   engine. The Saturday output states this limitation explicitly.
    //
    // Returns: a resolved item object, or null on data load failure.
    // ──────────────────────────────────────────────────────────────────────
    function _resolveTheotokionSlot(dayOfWeek, toneResult) {
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

        // ── Sunday: explicitly deferred ───────────────────────────────────
        if (dayOfWeek === 0) {
            return {
                type:       'rubric',
                key:        'theotokion-dismissal',
                label:      'Theotokion',
                text:       `(Sunday Vespers — Theotokion deferred. ` +
                            `Current tone: Tone ${tone}. ` +
                            `Sunday Vespers Theotokion handling is part of the dedicated Sunday Vespers pass ` +
                            `and is not resolved in this baseline.)`,
                tone:       tone,
                resolvedAs: 'sunday-deferred'
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

        // ── Weekday (Mon–Fri): tone-identified stub ───────────────────────
        // The dismissal Theotokion at weekday Vespers follows the tone of the
        // Menaion troparion. Since weekday troparion text is not yet implemented,
        // the Theotokion cannot be determined without fabrication. Tone is known.
        return {
            type:       'rubric',
            key:        'theotokion-dismissal',
            label:      'Theotokion',
            text:       `(Tone ${tone} — Weekday Dismissal Theotokion: Menaion required. ` +
                        `The dismissal Theotokion at weekday Vespers follows the tone of the troparion sung. ` +
                        `The current Octoechos tone is Tone ${tone}. ` +
                        `Because weekday troparion text is Menaion-driven and not yet implemented, ` +
                        `the corresponding Theotokion cannot be resolved without fabrication. ` +
                        `Full resolution requires Menaion data.)`,
            tone:       tone,
            resolvedAs: 'weekday-menaion-required'
        };
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
    // Slots NOT resolved in v1.7 (deferred):
    //   theotokion-dismissal (weekday Menaion-driven) — requires Menaion
    //   theotokion-dismissal (Sunday) — part of Sunday Vespers pass
    //   All Sunday Vespers slots — dedicated Sunday pass pending
    // ──────────────────────────────────────────────────────────────────────
    async function _resolveVespersSlots(sections, dateObj) {
        // Load all five data files in parallel
        await Promise.all([
            _loadVespersProkeimena(),
            _loadOctoechosData(),
            _loadKathismaData(),
            _loadTroparionData(),
            _loadTheotokionData()
        ]);

        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

        // v1.3: Compute tone once; used for all stichera/aposticha slots
        const toneResult = _computeBaselineTone(dateObj);

        // Map JS getDay() index to the weekday key used in octoechos-vespers.json
        const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        // Saturday Vespers is the Vespers FOR Sunday; use Sunday's weekday key for data lookup.
        // The tone is already computed with Saturday → Sunday correction in _computeBaselineTone.
        const octoechosWeekdayKey = (dayOfWeek === 6) ? 'saturday' : WEEKDAY_NAMES[dayOfWeek];

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

                // ── vesperal-reading (v1.2, ordinary day = omitted) ───────
                else if (item.key === 'vesperal-reading') {
                    section.items[i] = {
                        type:       'rubric',
                        key:        'vesperal-reading',
                        label:      'Paremiae (Vesperal Readings)',
                        text:       '(Paremiae — Vesperal Readings — are not appointed at ordinary Vespers. They are read only on feasts of the first and second ranks and during Great Lent. No reading is appointed today.)',
                        resolvedAs: 'omitted-ordinary-day'
                    };
                }

                // ── stichera-at-lord-i-have-cried (v1.3) ─────────────────
                else if (item.key === 'stichera-at-lord-i-have-cried') {
                    if (toneResult.brightWeek) {
                        // Bright Week: Paschal hymns, not Octoechos
                        section.items[i] = {
                            type:       'rubric',
                            key:        'stichera-at-lord-i-have-cried',
                            label:      'Stichera at "Lord, I have cried"',
                            text:       '(Bright Week — Paschal Tone. During Bright Week (Pascha Sunday through Thomas Saturday), the Resurrectional Stichera of Tone 1 are replaced by Paschal hymns. Ordinary Octoechos stichera are not used this week.)',
                            resolvedAs: 'bright-week-paschal-tone'
                        };
                    } else if (toneResult.tone) {
                        const resolved = _resolveSticheraSlot(
                            toneResult.tone, octoechosWeekdayKey,
                            'stichera_at_lord_i_have_cried', toneResult
                        );
                        if (resolved) {
                            section.items[i] = resolved;
                        }
                        // If null (data load failed), slot remains placeholder
                    }
                }

                // ── aposticha (v1.3) ──────────────────────────────────────
                else if (item.key === 'aposticha') {
                    if (toneResult.brightWeek) {
                        section.items[i] = {
                            type:       'rubric',
                            key:        'aposticha',
                            label:      'Aposticha',
                            text:       '(Bright Week — Paschal Tone. During Bright Week, the Aposticha are Paschal hymns, not the ordinary Octoechos aposticha.)',
                            resolvedAs: 'bright-week-paschal-tone'
                        };
                    } else if (toneResult.tone) {
                        const resolved = _resolveSticheraSlot(
                            toneResult.tone, octoechosWeekdayKey,
                            'aposticha', toneResult
                        );
                        if (resolved) {
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

                // ── troparion-or-apolytikion (v1.6) ──────────────────────
                // Baseline: Resurrectional Troparion of the current tone
                // for Saturday Great Vespers. Bright Week: Paschal Troparion.
                // Weekdays: tone-identified stub (Menaion required for text).
                // Sunday: explicitly deferred.
                // Festal overrides: NOT implemented in this pass.
                else if (item.key === 'troparion-or-apolytikion') {
                    const resolved = _resolveTroparionSlot(dayOfWeek, toneResult);
                    if (resolved) {
                        section.items[i] = resolved;
                    }
                    // If null (data load failed), slot remains placeholder.
                }

                // ── theotokion-dismissal (v1.7) ───────────────────────────
                // Saturday: full dismissal Theotokion (Octoechos, tone-matched).
                // Bright Week: explicit omission rubric.
                // Weekdays: tone-identified stub (Menaion required for text).
                // Sunday: explicitly deferred.
                // Festal overrides: NOT implemented in this pass.
                else if (item.key === 'theotokion-dismissal') {
                    const resolved = _resolveTheotokionSlot(dayOfWeek, toneResult);
                    if (resolved) {
                        section.items[i] = resolved;
                    }
                    // If null (data load failed), slot remains placeholder.
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