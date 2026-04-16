// js/octoechos/gc-canon-theotokos.js
// Octoechos Great Compline Theotokos Canon corpus — null-sentinel scaffold
// Horologion v7.1
//
// Corpus contract: window.GC_CANON_OCTOECHOS.tones[tone]
//   tone: string "1"–"8"
//   value: null (sentinel — text not yet transcribed) OR
//          { label: string, text: string }
//
// The engine (_getGcCanonOctoechos in horologion-engine.js) probes this object
// and degrades to the gc-canon-octoechos rubric slot when the sentinel is null.
// To populate a tone: replace null with { label: "...", text: "..." }.
// No engine change, no schema change, no resolver change is required.
//
// Source target for transcription: Octoechos (Lambertsen, Vols. I–IV),
// Great Compline canon to the Theotokos per tone.
// DO NOT populate with fabricated or unverified text.

window.GC_CANON_OCTOECHOS = {
    tones: {
        "1": null,
        "2": null,
        "3": null,
        "4": null,
        "5": null,
        "6": null,
        "7": null,
        "8": null
    }
};