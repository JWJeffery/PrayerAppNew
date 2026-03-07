// ── js/horologion-engine.js ────────────────────────────────────────────────
//
// Horologion Engine v1.3
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

    // ── v1.2: Weekday prokeimena lookup array (null until first fetch) ──────
    // Populated lazily by _loadVespersProkeimena(). Indexed by JS Date.getDay()
    // (0 = Sunday … 6 = Saturday). Built from vespers-prokeimena.json entries.
    let _prokeimenaByDay = null;

    // ── v1.3: Octoechos data object (null until first fetch) ───────────────
    // Populated lazily by _loadOctoechosData().
    // Shape: { tones: { "1": { saturday: {...}, monday: {...}, ... }, ... } }
    let _octoechosData = null;

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
    // Slots NOT resolved in v1.3 (deferred):
    //   kathisma-reading      — requires Psalter weekly cycle
    //   troparion-or-apolytikion — requires Menaion or weekly cycle
    //   theotokion-dismissal  — depends on apolytikion tone
    // ──────────────────────────────────────────────────────────────────────
    async function _resolveVespersSlots(sections, dateObj) {
        // Load both data files in parallel
        await Promise.all([
            _loadVespersProkeimena(),
            _loadOctoechosData()
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

                // ── kathisma-reading, troparion, theotokion (deferred) ────
                // Not resolved in v1.3. See function documentation above.
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