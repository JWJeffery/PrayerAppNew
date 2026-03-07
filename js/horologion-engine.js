// ─u2500 js/horologion-engine.js ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n//
// Horologion Engine v1
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
// ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n
const HorologionEngine = (() => {

    // ─u2500 Internal skeleton cache ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n    // Keys: officeKey strings (e.g. 'vespers')
    // Values: parsed JSON skeleton objects
    const _skeletonCache = {};

    // ─u2500 Supported offices in this version ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500
    const SUPPORTED_OFFICES = ['vespers'];

    // ─u2500 Tradition code for this engine ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n    const TRADITION = 'BYZC';

    // ── v1.2: Prokeimena data file URL ─────────────────────────────────────────
    const PROKEIMENA_URL = 'data/horologion/vespers-prokeimena.json';

    // ── v1.2: Weekday prokeimena lookup array (null until first fetch) ──────────
    // Populated lazily by _loadVespersProkeimena(). Indexed by JS Date.getDay()
    // (0 = Sunday … 6 = Saturday). Built from vespers-prokeimena.json entries.
    let _prokeimenaByDay = null;

    // ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n    // getOfficeSkeleton(officeKey, traditionVariant)
    //
    // Loads the static JSON skeleton for the given office from:
    //   data/horologion/<officeKey>.json
    //
    // Returns a Promise resolving to the parsed skeleton object.
    // Throws (rejects) if the file is missing or not parseable.
    // Results are cached in _skeletonCache so subsequent calls are synchronous.
    // ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n    async function getOfficeSkeleton(officeKey, traditionVariant = 'byzantine') {
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


    // ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n    // resolveOffice(date, officeKey, context)
    //
    // Returns a normalized office payload ready for the UI adapter to render.
    //
    // Parameters:
    //   date      —JS Date object or ISO string 'YYYY-MM-DD'
    //   officeKey —e.g. 'vespers'
    //   context   —optional object for future use (feast rank, tone week, etc.)
    //
    // The payload shape is defined in data/horologion/schema.json.
    // All unresolved variable slots are preserved as-is from the skeleton with
    // status:'unresolved' —they are NEVER silently omitted or fabricated.
    //
    // In v1, resolution is baseline only: the skeleton is returned as-is with
    // diagnostic counts attached. Future versions will accept a context object
    // carrying tone week, feast rank, Octoechos data, Menaion data, etc. and
    // will fill in the placeholder slots accordingly.
    // ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n    async function resolveOffice(date, officeKey, context = {}) {
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
            // Return an error payload rather than throwing —keeps UI rendering predictable
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

        // v1.2: Run ordinary-day slot resolution before diagnostic count
        await _resolveVespersSlots(sections, dateObj);

        // Diagnostic pass —count resolved vs placeholder slots
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
                    warnings.push(`Unresolved slot [${section.id}] →${item.key}: ${item.label || item.key}`);
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


    // ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n    // validateOfficePayload(payload)
    //
    // Checks a payload object for required fields and structural integrity.
    // Returns a diagnostics object:
    //   { valid: boolean, errors: string[], warnings: string[] }
    //
    // This is designed to be called by the UI adapter or from the browser
    // console for debugging. It does not throw.
    // ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n    function validateOfficePayload(payload) {
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


    // ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n    // Internal helpers
    // ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n
    // ──────────────────────────────────────────────────────────────────────────
    // v1.2: _formatLocalISODate(dateObj)
    //
    // Returns YYYY-MM-DD using local wall-clock date, not UTC.
    // toISOString() returns UTC which can shift the date by one day for users
    // west of UTC during evening hours — incorrect for a liturgical application.
    // ──────────────────────────────────────────────────────────────────────────
    function _formatLocalISODate(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }


    // ──────────────────────────────────────────────────────────────────────────
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
    // ──────────────────────────────────────────────────────────────────────────
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


    // ──────────────────────────────────────────────────────────────────────────
    // v1.2: _resolveVespersSlots(sections, dateObj)
    //
    // Ordinary-day slot resolution pass for Vespers.
    //
    // Mutates the deep-copied sections array in place; never touches the cached
    // skeleton. Called from resolveOffice() before the diagnostic count pass.
    //
    // Slots resolved in this pass:
    //
    //   daily-prokeimenon
    //     The weekday Vespers prokeimena are fixed by day of week and are
    //     independent of the Octoechos tone cycle. Looked up from the
    //     _prokeimenaByDay table (vespers-prokeimena.json). If the data file
    //     is unavailable the slot degrades gracefully to a placeholder.
    //     Feast-rank overrides (Menaion / Triodion) are deferred to v1.3+.
    //
    //   vesperal-reading
    //     Paremiae (OT readings) are NOT appointed at ordinary weekday Vespers.
    //     This slot is resolved explicitly as a rubric-style omission notice
    //     rather than left as an ambiguous placeholder. When festal or Lenten
    //     reading resolution is added (v1.3+), that layer should run before this
    //     function and mark the slot already resolved so this branch skips it.
    //
    //   aposticha — NOT resolved here.
    //     Aposticha stichera are keyed by BOTH day-of-week AND Octoechos tone
    //     week. The tone week cannot be derived from the date alone without a
    //     Paschal reference anchor. Fabricating tone-independent text would be
    //     liturgically incorrect. Left as explicit placeholder until the
    //     Octoechos engine is built.
    //
    //   stichera-at-lord-i-have-cried, kathisma-reading,
    //   troparion-or-apolytikion, theotokion-dismissal — NOT resolved here.
    //   All require Octoechos or Menaion data not yet available.
    // ──────────────────────────────────────────────────────────────────────────
    async function _resolveVespersSlots(sections, dateObj) {
        await _loadVespersProkeimena();

        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

        for (const section of sections) {
            if (!Array.isArray(section.items)) continue;

            for (let i = 0; i < section.items.length; i++) {
                const item = section.items[i];

                // ── daily-prokeimenon ────────────────────────────────────────
                if (item.key === 'daily-prokeimenon') {
                    const pk = _prokeimenaByDay && _prokeimenaByDay[dayOfWeek];
                    if (pk) {
                        // Replace placeholder with a resolved prokeimenon item.
                        // type:'prokeimenon' is a first-class resolved type.
                        // The UI adapter renders it via the text/fallback branch
                        // (paragraph), which is correct for the baseline display.
                        // A future adapter update may add specialized prokeimenon
                        // rendering (rubric + main verse + response verse).
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

                // ── vesperal-reading (ordinary day = omitted) ────────────────
                else if (item.key === 'vesperal-reading') {
                    // On ordinary days Paremiae are not appointed.
                    // Resolve as a rubric-style notice — not a placeholder.
                    // The 'resolvedAs' field allows future layers to distinguish
                    // this slot from one that was resolved with actual readings.
                    section.items[i] = {
                        type:       'rubric',
                        key:        'vesperal-reading',
                        label:      'Paremiae (Vesperal Readings)',
                        text:       '(Paremiae — Vesperal Readings — are not appointed at ordinary Vespers. They are read only on feasts of the first and second ranks and during Great Lent. No reading is appointed today.)',
                        resolvedAs: 'omitted-ordinary-day'
                    };
                }

                // ── aposticha, stichera, kathisma, troparion, theotokion ─────
                // Not resolved in v1.2. See function documentation above.
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
            vespers:        'Vespers',
            orthros:        'Orthros (Matins)',
            'midnight-office': 'Midnight Office',
            'first-hour':   'First Hour',
            'third-hour':   'Third Hour',
            'sixth-hour':   'Sixth Hour',
            'ninth-hour':   'Ninth Hour',
            compline:       'Compline (Small Apodeipnon)'
        };
        return titles[officeKey] || officeKey;
    }


    // ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n    // Public API
    // ─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─u2500─n    return {
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