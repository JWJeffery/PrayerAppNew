// ── js/horologion-engine.js ───────────────────────────────────────────────────
//
// Horologion Engine v1
// Architecture layer: ENGINE (not UI, not calendar)
//
// This module owns:
//   - Loading and caching office skeletons from data/horologion/*.json
//   - Resolving a normalized office payload from a skeleton + date context
//   - Validating a payload and returning diagnostics
//
// This module does NOT own:
//   - Rendering HTML (that belongs to the office-ui.js adapter functions)
//   - Calendar logic (that belongs to CalendarEngine or equivalent)
//   - BCP, COE, or Ethiopian office logic (those have their own paths)
//
// Exposed globally as: window.HorologionEngine
//
// Supported offices (v1): vespers
// Planned (not yet built): orthros, midnight-office, first-hour, third-hour,
//                          sixth-hour, ninth-hour, compline (apodeipnon)
//
// ─────────────────────────────────────────────────────────────────────────────

const HorologionEngine = (() => {

    // ── Internal skeleton cache ───────────────────────────────────────────────
    // Keys: officeKey strings (e.g. 'vespers')
    // Values: parsed JSON skeleton objects
    const _skeletonCache = {};

    // ── Supported offices in this version ────────────────────────────────────
    const SUPPORTED_OFFICES = ['vespers'];

    // ── Tradition code for this engine ───────────────────────────────────────
    const TRADITION = 'BYZC';


    // ─────────────────────────────────────────────────────────────────────────
    // _formatLocalISODate(date)
    //
    // Returns a YYYY-MM-DD string using the *local* calendar date, not UTC.
    // toISOString() is intentionally avoided here because it converts to UTC
    // first and can shift the civil date by a full day for users west of UTC.
    // ─────────────────────────────────────────────────────────────────────────
    function _formatLocalISODate(date) {
        const y  = date.getFullYear();
        const m  = String(date.getMonth() + 1).padStart(2, '0');
        const d  = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // getOfficeSkeleton(officeKey, traditionVariant)
    //
    // Loads the static JSON skeleton for the given office from:
    //   data/horologion/<officeKey>.json
    //
    // Returns a Promise resolving to the parsed skeleton object.
    // Rejects if the file is missing or unparseable.
    // Results are cached so subsequent calls skip the network.
    // ─────────────────────────────────────────────────────────────────────────
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


    // ─────────────────────────────────────────────────────────────────────────
    // resolveOffice(date, officeKey, context)
    //
    // Returns a normalized office payload ready for the UI adapter to render.
    // This function is NON-THROWING: all failure modes return a payload with
    // status: "error" rather than rejecting. The UI adapter must check
    // payload.status === "error" and render accordingly.
    //
    // Parameters:
    //   date      — JS Date object or ISO string 'YYYY-MM-DD'
    //   officeKey — e.g. 'vespers'
    //   context   — optional object for future use (feast rank, tone week, etc.)
    //
    // All unresolved variable slots are preserved as-is from the skeleton with
    // status:'unresolved'. They are NEVER silently omitted or fabricated.
    //
    // v1 resolution is baseline only: the skeleton is returned as-is with
    // diagnostic counts attached.
    // ─────────────────────────────────────────────────────────────────────────
    async function resolveOffice(date, officeKey, context = {}) {
        // ── Normalise date ────────────────────────────────────────────────────
        let dateObj;
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string') {
            // Parse as local date to avoid UTC-shift: treat 'YYYY-MM-DD' as
            // midnight local time, not midnight UTC.
            const parts = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (parts) {
                dateObj = new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]));
            } else {
                dateObj = new Date(date);
            }
        } else {
            return _errorPayload(officeKey, null,
                '[HorologionEngine] resolveOffice: date must be a Date object or ISO string.');
        }

        if (isNaN(dateObj.getTime())) {
            return _errorPayload(officeKey, null,
                `[HorologionEngine] resolveOffice: invalid date value "${date}".`);
        }

        const isoDate = _formatLocalISODate(dateObj);
        const normalizedKey = (officeKey || '').toLowerCase().trim();

        // ── Load skeleton (non-throwing via error payload) ────────────────────
        let skeleton;
        try {
            skeleton = await getOfficeSkeleton(normalizedKey);
        } catch (err) {
            return _errorPayload(normalizedKey, isoDate,
                `Failed to load skeleton: ${err.message}`);
        }

        // ── Deep-copy sections so we never mutate the cached skeleton ─────────
        const sections = _deepCopySections(skeleton.sections || []);

        // ── Diagnostic pass ───────────────────────────────────────────────────
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


    // ─────────────────────────────────────────────────────────────────────────
    // validateOfficePayload(payload)
    //
    // Checks a payload object for required fields and structural integrity.
    // Returns: { valid: boolean, errors: string[], warnings: string[] }
    // Does not throw.
    // ─────────────────────────────────────────────────────────────────────────
    function validateOfficePayload(payload) {
        const errors = [];
        const warnings = [];

        if (!payload || typeof payload !== 'object') {
            return { valid: false, errors: ['Payload is null or not an object.'], warnings: [] };
        }

        const requiredFields = ['tradition', 'officeKey', 'date', 'title', 'status', 'sections', 'diagnostics'];
        for (const field of requiredFields) {
            if (payload[field] === undefined || payload[field] === null) {
                errors.push(`Missing required field: "${field}"`);
            }
        }

        if (payload.sections !== undefined && !Array.isArray(payload.sections)) {
            errors.push('"sections" must be an array.');
        }

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

        const validStatuses = ['complete', 'partial', 'error'];
        if (payload.status && !validStatuses.includes(payload.status)) {
            warnings.push(`Unexpected status value: "${payload.status}". Expected one of: ${validStatuses.join(', ')}.`);
        }

        if (Array.isArray(payload.diagnostics?.warnings)) {
            payload.diagnostics.warnings.forEach(w => warnings.push(w));
        }

        return { valid: errors.length === 0, errors, warnings };
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────────────────────

    function _errorPayload(officeKey, isoDate, message) {
        console.error('[HorologionEngine]', message);
        return {
            tradition:  TRADITION,
            officeKey:  officeKey || '(unknown)',
            date:       isoDate   || '(unknown)',
            title:      _officeTitleFallback(officeKey) || '(unknown)',
            variant:    'error',
            status:     'error',
            sections:   [],
            diagnostics: {
                implementedSlots: 0,
                placeholderSlots: 0,
                warnings: [message]
            }
        };
    }

    function _deepCopySections(sections) {
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


    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────
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