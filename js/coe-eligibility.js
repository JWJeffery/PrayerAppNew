/**
 * js/coe-eligibility.js
 *
 * COE Layer 3 eligibility boundary.
 *
 * Defines the explicit allowlist of identity IDs that are eligible for
 * Layer 3 (individual saint/person) display in the Church of the East
 * tradition. All other COE-tagged entries must not be surfaced in Layer 3,
 * even if they carry a COE tag in the saints data.
 *
 * Governance status
 * -----------------
 * COE-II is complete as of v2.8.9. All repo-internal COE tag cleanup is done.
 * This file's allowlist is the authoritative eligibility gate and requires no
 * further structural changes at this time.
 *
 * One external-research holdout remains:
 *   mar-augustine / mar-augustine-commemoration
 *   These two identities carry COE tags (8/12, 9/19, 7/27) but cannot be
 *   adjudicated on internal evidence alone. They are NOT in the allowlist and
 *   are therefore excluded from Layer 3 display. Do not alter them on internal
 *   evidence alone. Resolution requires external Syriac manuscript research
 *   (Budge, Wright, Encyclopaedia Iranica). See documentation/COE_II_ARCHITECTURE.md §7.
 *
 * Background
 * ----------
 * The v2.8.2 saints data migration applied COE tags mechanically by renaming
 * the legacy "Church of the East" string field. This produced ~314 COE-tagged
 * identities. The COE-IIB audit (2026-03-06) found that approximately 46% of
 * these have no defensible COE liturgical basis and should have their tag
 * removed. A further 21% belong in Layer 2 (fixed feasts, corporate
 * commemorations, calendar structure) rather than Layer 3.
 * Source-data corrections are complete: 133 unique identity IDs (136 rows)
 * have had their COE tags removed from commemorations.json.
 *
 * Architecture
 * ------------
 * Layer 1 — Season engine:    calendar-east-syriac.js getSeason() / getDayClass()
 * Layer 2 — Fixed feasts:     calendar-east-syriac.js getDayClass() commemorations[]
 * Layer 3 — Individual saints: THIS FILE gates eligibility before display
 *
 * Usage
 * -----
 *   const eligible = CoeEligibility.filter(saintsArray);
 *   // Returns only those entries whose identity id is in the allowlist.
 *
 *   const ok = CoeEligibility.isEligible(saint);
 *   // Returns true if the individual saint record passes the eligibility check.
 *
 * Layer 3 display
 * ---------------
 * Layer 3 is active in renderEastSyriac() as of v2.8.7. The call sequence is:
 *   1. resolveCommemorations(currentDate, 'COE') — populate cache
 *   2. CoeEligibility.filter(coeRaw)             — apply allowlist gate
 *   3. Render .saint-section if eligible length > 0; hide if 0
 * Silence when empty is correct. No fallback. No saint-grid.
 *
 * Do NOT replace this module with a "just filter all COE-tagged entries"
 * approach — that is precisely the pattern COE-IIB exists to prevent.
 *
 * Governance
 * ----------
 * Changes to KEEP_IDS require justification against:
 *   - Hudra manuscript evidence, OR
 *   - Explicit East Syriac identity (Mar- prefix, Persian martyrs, COE patriarchs), OR
 *   - Apostolic / biblical figures with COE liturgical standing, OR
 *   - Pre-schism universal saints with confirmed Hudra presence
 *
 * COE-IIB audit document: documentation/COE_IIB_AUDIT.md
 * COE architecture spec:  documentation/COE_II_ARCHITECTURE.md
 */

'use strict';

(function (global) {

    /**
     * Allowlist of identity IDs eligible for COE Layer 3 display.
     *
     * These are the KEEP_CANDIDATE entries from the COE-IIB audit,
     * excluding:
     *   - NEEDS_REVIEW entries (pending Hudra evidence or Phase 4 consolidation)
     *   - Secondary observances (relic feasts, synaxis variants) that belong in Layer 2
     *   - Duplicate identity IDs that require Phase 4 consolidation before display
     *
     * Grouped by category for auditability. Do not collapse into a flat array
     * without preserving this structure — the grouping is documentation.
     */
    const _COE_NATIVE = new Set([
        // Doctors and founders of the East Syriac tradition
        'mar-narsai',
        'mar-babai-the-great',
        'mar-balai',
        'mar-abdisho',
        'saint-john-bar-malkeh',
        'mar-timothy-i',

        // Apostles to the East and the Addai-Mari chain
        'mar-addai',
        'saint-addai-the-apostle',
        'mar-mari',
        'mar-mari-the-apostle',
        'st-mari-the-bishop',

        // Catholicoi and patriarchs
        'mar-papa-bar-aggai',
        'mar-awa-i',
        'mar-awa',
        'mar-awa-catholicos',
        'saint-awa-catholicos',
        'mar-dadisho',
        'mar-sabrisho',
        'mar-abraham',
        'mar-gregory-the-wonderworker',

        // Bishops of Nisibis
        'saint-ya-qub-james-of-nisibis',
        'saint-jacob-of-nisibis',
        'mar-yakob-of-nisibis',

        // East Syriac monastics
        'mar-augin',
        'mar-augin-saint-eugene',
        'mar-awgin-and-his-disciples',
        'mar-abraham-of-kashkar',
        'mar-abraham-the-great',
        'saint-sawrisho-of-beth-garmi',
        'mar-saba',
        'mar-shalita',
        'mar-mushi',
        'mar-abda',
        'mar-yohannan',
        'mar-elias',
        'mar-ishaia',
        'mar-zeia',
        'mar-adar',
        'mar-michael',
        'mar-barsabba',
        'mar-shmon',
        'mar-shimon',
        'mar-shmon-the-second',
        'mar-menas',

        // Persian / Mesopotamian martyrs
        'mar-shimon-bar-sabbae',
        'mar-shimun-bar-sabbae',
        'mar-qardagh',
        'mar-kardagh',
        'mar-pethion',
        'saint-pethion',
        'mar-giwargis',
        'mar-pinhas',
        'mar-sliwa',
        'mar-archelaus',
        'martyrs-of-the-east',
        'saint-shamuni-and-sons',
        'virgin-martyr-febronia-of-nisibis',
        'saint-hardut',
        'saint-faraj-of-shiraz',
        'mar-george-the-martyr',

        // Other COE-only figures
        'saint-ahudemmeh',
        'mar-behnam-and-sarah',
        'mar-isaac-of-nineveh',
        'saint-isaac-of-nineveh',
        'mar-zaia',

        // Ephrem (three identity forms pending Phase 4 consolidation — include all until resolved)
        'saint-ephrem-the-syrian',
        'saint-ephraim-the-syrian',
        'saint-ephrem-of-edessa',
    ]);

    const _APOSTOLIC = new Set([
        // Apostle Thomas — foundational COE figure
        'saint-thomas-the-apostle',
        'mar-toma-apostle-thomas',

        // The Twelve and apostolic figures
        'saint-matthew-the-apostle',
        'saint-mark-the-evangelist',
        'saint-luke-the-evangelist',
        'saint-john-the-apostle',
        'saints-peter-and-paul-apostles',
        'saint-andrew-the-apostle',
        'saint-barnabas-the-apostle',
        'saint-bartholomew-the-apostle',
        'saint-philip-the-apostle',
        'saint-jude-thaddeus',
        'saints-simon-and-jude',
        'saint-james-the-brother-of-the-lord',
        'saint-stephen-protomartyr',
        'saint-matthias-the-apostle',
        'saint-timothy',
        'saint-simon-the-zealot',
        'mar-ya-qub-saint-james',

        // OT prophets and biblical figures
        'prophet-elias-elijah',
        'prophet-elisha',
        'prophet-joel',
        'jeremiah-the-prophet',
        'prophet-daniel-and-the-three-holy-youths',
        'saint-dismas',
        'saint-simeon-the-elder',
        'saint-john-the-baptist',
    ]);

    /**
     * Combined eligibility set. All IDs in either _COE_NATIVE or _APOSTOLIC
     * are eligible for Layer 3 display.
     */
    const _KEEP_IDS = new Set([..._COE_NATIVE, ..._APOSTOLIC]);

    // ── Public API ─────────────────────────────────────────────────────────────

    /**
     * Return true if the given saint record is eligible for COE Layer 3 display.
     *
     * @param {object} saint - A cached saint record from saints-<month>.json
     * @param {string} saint.id - The identity_id
     * @returns {boolean}
     */
    function isEligible(saint) {
        if (!saint || typeof saint.id !== 'string') return false;
        return _KEEP_IDS.has(saint.id);
    }

    /**
     * Filter an array of saint records to those eligible for COE Layer 3 display.
     *
     * @param {Array} saints - Array of cached saint records
     * @returns {Array} Filtered array containing only eligible records
     */
    function filter(saints) {
        if (!Array.isArray(saints)) return [];
        return saints.filter(isEligible);
    }

    /**
     * Return the full set of eligible IDs (read-only copy).
     * Intended for diagnostic use only.
     *
     * @returns {Set<string>}
     */
    function eligibleIds() {
        return new Set(_KEEP_IDS);
    }

    // ── Export ─────────────────────────────────────────────────────────────────

    global.CoeEligibility = {
        isEligible,
        filter,
        eligibleIds,
    };

}(typeof globalThis !== 'undefined' ? globalThis : window));