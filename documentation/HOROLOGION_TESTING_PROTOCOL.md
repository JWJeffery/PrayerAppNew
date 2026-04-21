# Horologion Testing Protocol (v1 — post Great Compline tranche)

## Standard Validation Flow

1. Corpus Check
- window.GC_CANON_OCTOECHOS.tones[tone]
- must exist
- must include { label, text }

2. Resolver Check
- window.HorologionEngine.resolveOffice(date, 'great-compline')

3. Slot Identification
- locate gc-canon slot
- confirm:
  - resolvedAs === 'gc-canon-octoechos-text'
  - type === 'text'

4. Content Validation
- must include:
  - Ode I
  - Ode IX
  - tone-specific opening line

## Pass Conditions

- not rubric fallback
- full text present
- correct tone
- correct resolver path

## Critical Lessons Learned

- Engine: window.HorologionEngine
- Signature: resolveOffice(date, officeKey)
- Incorrect date ≠ broken corpus
- Tone-cycle scanning is required for validation
- Claude test scripts are unreliable — architect writes tests
- Do not paste large patches into chat (token waste)

## Source Rule Clarification — Great Compline Tranche

- Public-domain sources are preferred by default
- User-provided witnesses (including copyrighted editions such as Lambertsen) are valid for transcription work

Constraints:
- No paraphrase
- No reconstruction
- No synthesis