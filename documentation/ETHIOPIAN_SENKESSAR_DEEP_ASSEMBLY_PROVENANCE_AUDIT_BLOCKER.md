# Production Blocker: Ethiopian Senkessar Deep Assembly Provenance Audit

**Authorized by:** Josh  
**Status:** Major production blocker  
**Applies to:** Ethiopian Sa'atat; Ethiopian Senkessar / Synaxarium runtime readings  
**Blocks:** Public shipment of the Ethiopian Sa'atat lane with daily Senkessar readings enabled  
**Does not block:** Current Catholic office completion work  
**Resolution sequence:** Defer active remediation until after the Catholic offices are completed  
**Recorded:** 2026-07-04

## Summary

The Ethiopian Senkessar / Deep Assembly corpus must be treated as not source-trusted pending provenance audit.

The existing governance correctly records that the Deep Assembly corpus was created to complete a runtime liturgical slot in the Ethiopian Sa'atat lane. The app already contained an `eth-saints-commemoration` slot intended to resolve the Ethiopian calendar date and render the day's Senkessar reading, but the corpus was underfilled before the Deep Assembly project.

However, renewed review has identified a more serious issue than prose quality: some entries may include figures, details, or thematic connective material that cannot presently be traced to a reliable Senkessar/Synaxarium source. The older "multiple witnesses per day" or "four-witness" pattern must therefore be treated as a deprecated production heuristic, not as source authority.

## Governing concern

The project cannot ship office-embedded synaxarial material that may contain invented or untraced saints, displaced saints from other days, or unsupported biographical detail.

This is a production blocker because the Ethiopian Sa'atat renderer treats the Senkessar material as liturgical-reading content, not as optional commentary. The current governance already requires pre-shipment review of source fidelity, prose origin, hagiographical quality, Ethiopian Orthodox devotional grammar, avoidance of hallucinated specificity, oral readability, and length suitability. It also states that reverence does not excuse inaccuracy and that unsupported claims must not be made.

## Source-control rule

The corrected corpus must be rebuilt or audited against a source-controlled daily roster.

The primary English control witness should be the Ethiopian Synaxarium / Book of the Saints of the Ethiopian Orthodox Tewahedo Church, translated by Sir E. A. Wallis Budge. The available source file identifies itself as a Budge translation of the Ethiopian Orthodox Tewahedo Synaxarium and includes all thirteen Ethiopian months from Meskerem through Paguemen.

The source roster governs the entry. No day requires four saints or four witnesses. No figure may be retained merely to satisfy a structural pattern.

## Required blocker resolution

After Catholic office completion, complete the following before Ethiopian Sa'atat shipment:

1. Build a complete Ethiopian Senkessar manifest covering all thirteen Ethiopian months.
2. For every day, identify the source-controlled roster from Budge or another explicitly named source.
3. Classify every named figure in the current Deep Assembly corpus as:
   - `source_attested_same_day`
   - `source_attested_other_day`
   - `parallel_tradition_attested`
   - `external_source_known`
   - `untraced`
   - `probable_hallucination`
   - `human_review_required`
4. Classify every paragraph as:
   - `source_summary`
   - `source_paraphrase`
   - `editorial_condensation`
   - `theological_reflection`
   - `invented_connective_tissue`
   - `unsupported_biographical_detail`
5. Remove or quarantine any untraced figure, displaced figure, or unsupported narrative detail unless a reliable source is recovered.
6. Rebuild daily office readings from the attested source roster first, then edit for oral readability and hagiographical quality.
7. Do not rewrite the full corpus before completing the provenance audit.

## Scheduling rule

This blocker is acknowledged now with this scheduling rule: defer active remediation until after the Catholic offices are completed.

This blocker is acknowledged now but is not the next active workstream.

The current priority remains completion of the Catholic offices. The Ethiopian Senkessar audit is to be queued as a post-Catholic-offices production blocker. Until resolved, the Ethiopian Sa'atat lane may remain internally functional, but it must not be represented as shipment-ready with trustworthy daily Senkessar readings.

## Governing formula

The Ethiopian Senkessar Deep Assembly corpus solved a real runtime gap, but its older production method may have allowed literary completeness to outrun source control. The corpus is therefore quarantined as a major production blocker: preserve it, audit it, source-test it, and rebuild where necessary after the Catholic offices are completed.
