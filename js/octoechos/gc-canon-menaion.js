// js/octoechos/gc-canon-menaion.js
// Menaion Great Compline canon corpus — date-keyed scaffold
// Horologion v7.3
//
// Corpus contract: window.GC_CANON_MENAION.dates["MM-DD"]
//   key present: { label: string, text: string }  → corpus text emitted
//   key absent:  (no entry)                        → engine degrades to
//                gc-canon-menaion rubric slot in great-compline-fixed.json
//
// The engine (_getGcCanonMenaion in horologion-engine.js) probes this object
// after confirming a rank 1–2 Menaion commemoration on the appointed day.
// No engine redesign, schema change, or resolver change is required when
// corpus text is added: simply add a "MM-DD" key with { label, text }.
//
// Key format:  two-digit month + hyphen + two-digit day  e.g. "09-14"
//
// This object is intentionally sparse. Absence of a key is the sentinel
// for "not yet transcribed." Do not add placeholder or null values.
//
// Source target for transcription: The Great Menaion (OCA / Jordanville /
// Antiochian editions). Each entry should carry the full canon for that
// feast as it appears at Great Compline. DO NOT populate with fabricated
// or unverified text.
//
// Feast entries will be added date by date as transcription proceeds.
// Friday and Saturday Great Compline is typically not appointed; entries
// for those dates are permitted if a qualifying feast falls on such a day.

window.GC_CANON_MENAION = {
    dates: {
        // ── Entries added here as corpus transcription proceeds ──────────
        // Example format (do not uncomment — illustrative only):
        // "09-14": {
        //     label: "Canon — The Universal Exaltation of the Precious and Life-Giving Cross",
        //     text:  "Ode I. Irmos: … Troparia: …"
        // },
    }
};