# Bible Registry Architecture

## Status

Draft architecture record for the Universal Office Bible Browser and scripture resolver.

This record does not move existing Bible corpus files and does not change runtime behavior by itself. It defines the target governance model that future resolver and Bible Browser work must follow.

## Problem

The current Bible corpus was assembled across many Christian traditions and English source witnesses. During intake, files were placed under folders such as `OT`, `NT`, `ET`, `SY`, `AR`, and `ODES`.

That was useful as a collection-stage taxonomy, but it is not a sufficient runtime architecture.

Those folders mix several different axes:

- canonical section
- tradition family
- source language or source tradition
- textual form
- appendix / broader-canon status
- physical storage convenience

The Bible Browser and scripture resolver must not treat folder placement as canon logic.

## Core Principle

Physical storage is not canonical authority.

The governing model is a registry layer. The filesystem is only the current storage backend.

Future database migration should preserve this same conceptual model. Database tables may replace JSON files later, but the entities should remain the same.

## Required Model

The Bible architecture must distinguish:

1. Book identity
2. Text form / recension
3. Canon profile
4. Translation witness
5. Versification scheme
6. Reference map
7. Resolver contract

## Language Rule

Do not use “extra books” as a governing category.

That language is Protestant-default and collapses Catholic, Orthodox, Syriac, Ethiopian, and other received categories into a single outside-the-canon bucket.

Use profile-relative status instead.

## Profile-Relative Status Vocabulary

- `protocanonical`: central ordinary canon in the selected profile.
- `deuterocanonical`: Catholic deuterocanonical status.
- `anagignoskomena`: Orthodox readable / read-in-church status.
- `antilegomena`: disputed, later-received, or historically contested status.
- `broader_canon`: broader-canon status, especially for Ethiopian or other expansive profiles.
- `appendix`: included as an appendix or secondary section in the selected profile.
- `liturgical_reading`: carried because it is read liturgically.
- `witness_only`: present for study/source comparison but not included in the selected canon profile.
- `excluded`: deliberately not included in the selected profile.

Use classes may include:

- `read_in_church`
- `read_devotionally`
- `study_only`
- `not_in_profile`

These are not global theological judgments. They are profile-relative claims.

## Current Storage Posture

Existing files may remain in their current folders during migration.

The registry must eventually answer:

- What work is this?
- What text form is this?
- Which canon profiles include it?
- What display names are valid in each profile?
- What source or translation witnesses exist?
- What versification scheme governs it?
- Can the resolver fetch it?
- If not, why not?

## Resolver Direction

The resolver must stop guessing `OT` or `NT` from book names as its governing model.

Future resolver work should ask the registry for the source path and text-form identity.

Until that migration is complete, the old resolver may remain operational for ordinary OT/NT paths, but it must be understood as a legacy resolver path, not the final Bible Browser architecture.

## LOTH Boundary

LOTH owns appointed readings, source witnesses, and liturgical composition metadata.

PrayerAppNew owns Bible text and scripture resolution.

LOTH should not carry Bible bodies except under an explicit source-governed exception.
