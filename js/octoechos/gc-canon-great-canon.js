// js/octoechos/gc-canon-great-canon.js
// Great Canon of Saint Andrew of Crete — Great Compline corpus scaffold
// Horologion v7.2
//
// Corpus contract: window.GC_CANON_GREAT_CANON.evenings[dayName]
//   dayName: "monday" | "tuesday" | "wednesday" | "thursday"
//   value: null (sentinel — text not yet transcribed) OR
//          { label: string, text: string }
//
// The engine (_getGcCanonGreatCanon in horologion-engine.js) probes this object
// in the isFirstWeekOfLent branch of the gc-canon routing block and degrades
// to the gc-canon-great-canon rubric slot in great-compline-fixed.json when
// the sentinel is null. No engine redesign will be required when corpus text
// is added: replace null with { label: "...", text: "..." } for that evening.
//
// Usage at Great Compline (first week of Great Lent):
//   Monday evening:    approximately Odes 1–3 (portion I)
//   Tuesday evening:   approximately Odes 4–6 (portion II)
//   Wednesday evening: approximately Odes 7–8 (portion III)
//   Thursday evening:  approximately Odes 9 + closing (portion IV)
// Exact division follows the Lenten Triodion (Faber & Faber / Mother Mary & Ware).
//
// Source target for transcription: Great Canon of Saint Andrew of Crete,
// as found in the Lenten Triodion (trans. Mother Mary & Archimandrite Kallistos Ware).
// DO NOT populate with fabricated or unverified text.
// Friday and Saturday are not appointed for the Great Canon at Great Compline;
// those keys are intentionally absent from this object.

window.GC_CANON_GREAT_CANON = {
    evenings: {
        "monday":    null,
        "tuesday":   null,
        "wednesday": null,
        "thursday":  null
    }
};