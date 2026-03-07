Saints Data Rules

Last Realigned: 2026-03-06

This document defines the authoritative structure, editing rules, and workflow for saints data.
Its purpose is to prevent semantic drift, reduce merge conflicts, and ensure deterministic builds.

The saints system is composed of two normalized source files:

    data/saints/identities.json

    data/saints/commemorations.json

Monthly cache files (data/saints/saints-<month>.json) are generated artifacts and must never
be edited manually. All 12 monthly files are present as of v2.8.2.


1. Data Model Overview

Identity

An identity represents the stable historical or devotional entity being commemorated.

It answers the question: Who is this?

Examples:

    A saint
    A martyr
    A church dedication
    A biblical figure
    A feast tied to a person or season

Identity data is canonical and stable across traditions and dates.
One identity may have multiple commemorations.

Commemoration

A commemoration represents the appearance of an identity on a liturgical calendar.

It answers the question: When and where is this observed?

A commemoration is scoped by:

    identity_id
    date
    tradition
    calendar

One identity may have multiple commemorations across different traditions and dates.


2. Field Authority Rules

These rules define which file controls which kind of information.

Identity Field Authority (identities.json)

The following fields are authoritative in identities.json:

    id
    name
    description
    type
    Any identity-level metadata

id

    Immutable.
    Never change an existing id.
    If something truly requires replacement, create a new identity and migrate
    commemorations explicitly.

name

    Canonical display name.
    Use the most widely recognized, stable form.
    Do not pack honorifics, long titles, or devotional language into the name.
    Avoid redundant prefixes like "Saint" unless it is intrinsic to identity.

    Good:
        John Chrysostom
        Polycarp of Smyrna

    Avoid:
        St. John Chrysostom, Archbishop of Constantinople and Doctor of the Church

description

    Short.
    Factual.
    Tradition-neutral.
    Avoid devotional tone.
    Avoid long biographies.
    This field is not a full hagiography.

type

    Must reflect a stable historical category.
    Current values in use: saint, martyr, bishop, monastic, confessor, apostle,
    prophet, virgin, feast, commemoration, marian_feast.
    Do not use vague placeholders if a specific type is known.
    Do not collapse these into a generic value. Type distinctions are preserved
    in the generated cache and must not be flattened at the UI layer.
    Type describes what the identity is, not how it is celebrated.

Commemoration Field Authority (commemorations.json)

Commemorations define:

    Date
    Tradition
    Calendar
    Rank (if applicable)
    Notes specific to that observance

Commemorations do not redefine identity-level metadata.


3. Duplicate and Conflict Rules

Identity Conflicts

If two identities appear to represent the same historical person:

    Determine which id is canonical.
    Merge commemorations under that identity.
    Remove the duplicate identity.
    Run regeneration.
    Commit both source changes and regenerated files.

Never leave split identities representing the same person.
See saints-cleanup-queue.md §B for the current duplicate candidate list (Phase 4 work).

Commemoration Duplicates

A commemoration is considered duplicate only if all of the following match:

    identity_id
    date
    tradition
    calendar

If all match, one should be removed.
If only the date matches but the tradition differs, that is not a duplicate.
If a tradition legitimately celebrates an identity on multiple dates (e.g., translation
of relics), both may be kept if historically attested.


4. Calendar Rules

Current canonical calendar: "gregorian"

Do not alter gregorian dates to reflect another calendar system.
If support for additional calendars is added in the future, it must be modeled
explicitly rather than rewriting gregorian data.


5. Generated Files

The following files are generated artifacts:

    data/saints/saints-january.json
    data/saints/saints-february.json
    data/saints/saints-march.json
    data/saints/saints-april.json
    data/saints/saints-may.json
    data/saints/saints-june.json
    data/saints/saints-july.json
    data/saints/saints-august.json
    data/saints/saints-september.json
    data/saints/saints-october.json
    data/saints/saints-november.json
    data/saints/saints-december.json

All 12 files are present. They are display/cache artifacts, not canonical source.

Rules:

    Never edit generated monthly files manually.

    Always regenerate using:
        npm run saints:regen

    To regenerate a single month:
        node tools/build_saints_cache.js <month>

    Generated files must be committed alongside source changes.

    CI will fail if generated files do not match source data.


6. Required Workflow for Saints Changes

When modifying saints data:

    Edit only:
        identities.json
        commemorations.json

    Run:
        npm run saints:regen

    Confirm changes in:
        saints-<month>.json (affected months)

    Commit:
        Modified source files
        Regenerated monthly files

    Open PR.

The CI gate will:
    Validate schema
    Rebuild cache
    Fail if generated files differ from committed output


7. Cleanup and Normalization Policy

When cleaning legacy or conflicting data:

    Work in small batches (10–30 identities at a time).
    Do not attempt large rewrites in a single PR.

    Prioritize:
        High-frequency identities (appear in many commemorations)
        Import conflict cases
        Duplicate identity collisions (see saints-cleanup-queue.md §B — Phase 4)

    Each cleanup PR should clearly state:
        Which identities were normalized
        What rule was applied
        Why changes were made (briefly)

Current phase status (see saints-cleanup-queue.md for full detail):

    Phase 1 — description and type normalization for high-frequency identities: in progress
    Phase 2 — Reclassify calendrical feast entries (Section D1): not started
    Phase 3 — Review secondary observances (Section D2): not started
    Phase 4 — Consolidate duplicate ids (Section B): not started
    Phase 5 — Reclassify type: commemoration entries (Section C): not started


8. Core Principle

Structure is enforced by CI.
Meaning is enforced by discipline.

The goal is:

    Deterministic builds
    Stable canonical identities
    Accurate cross-tradition commemorations
    Minimal semantic drift over time

When in doubt, prefer:

    Stability over cleverness
    Neutrality over devotional phrasing
    Explicit modeling over implicit assumptions

End of document.
