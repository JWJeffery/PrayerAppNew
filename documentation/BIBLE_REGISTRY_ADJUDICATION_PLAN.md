# Bible Registry Adjudication Plan

## Status

Draft adjudication plan generated from `data/bible/registry/file-manifest.json`.

This plan does not move Bible files and does not change resolver behavior.

## Summary

- `legacy_ot_nt_runtime_candidates`: 85
- `outside_legacy_resolver_route`: 40
- `text_form_variant_candidates`: 2
- `non_ordinary_shape_collection_witnesses`: 6
- `filename_hygiene_mixed_case`: 41
- `filename_hygiene_curly_apostrophe`: 6
- `known_misclassification_review_candidates`: 4

## Architectural Reading

The current corpus has two different problems that must not be confused.

First, some books are unavailable in the Bible Browser because the legacy resolver does not route outside `OT/` and `NT/`.

Second, some books are unavailable in a given translation because no single English translation covers the whole received corpus universe.

The registry must distinguish these problems.

## Bucket Actions

### legacy_ot_nt_runtime_candidates

Retain as legacy resolver candidates for now; later bind through registry instead of NT/OT guessing.

Runtime change now: `false`

### outside_legacy_resolver_route

Do not move files. Add registry routing and canon-profile membership before Bible Browser exposes them.

Runtime change now: `false`

### text_form_variant_candidates

Bind as text-form candidates such as Greek Esther / Greek Daniel rather than treating them as independent accidental books.

Runtime change now: `false`

### non_ordinary_shape_collection_witnesses

Do not send these through ordinary chapter/verse resolver until a collection-specific schema adapter exists.

Runtime change now: `false`

### filename_hygiene_mixed_case

Do not rename during resolver work. Use registry paths as shield; schedule a later path-hygiene migration only if needed.

Runtime change now: `false`

### filename_hygiene_curly_apostrophe

Do not rename during resolver work. Registry must preserve current exact paths and expose ASCII aliases.

Runtime change now: `false`

### known_misclassification_review_candidates

Human adjudication required. Do not move files yet; correct identity/profile classification first.

Runtime change now: `false`


## Next Work

1. Human-adjudicate book identities and text forms.
2. Create canon-profile drafts from adjudicated identities.
3. Create translation-witness coverage records.
4. Rewire Bible Browser catalog generation to read the registry.
5. Rewire scripture resolver to ask the registry for source paths instead of guessing `OT/` or `NT/`.

## Rule

Do not use “extra books” as a governing category.

Use profile-relative statuses such as `protocanonical`, `deuterocanonical`, `anagignoskomena`, `antilegomena`, `broader_canon`, `appendix`, `liturgical_reading`, `witness_only`, and `excluded`.

