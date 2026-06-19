# Roman LOTH Composition Map and Source Navigation

Status: accepted architecture/governance note  
Date: 2026-05-25  
Scope: Roman Office / Liturgy of the Hours, source governance, user formation, printed-source navigation, public-domain Roman-family release planning

## Decision

Universal Office should not merely display prayer text. It should disclose liturgical composition.

A rendered office should eventually support a composition map showing the governing layers used to assemble the hour: ordinary, psalter, seasonal proper, sanctoral proper, commons, local calendar, recurring fixed material, and source-governance status as applicable.

This serves two legitimate user postures:

1. Prayer-forward users who want to enter the hour with minimal friction.
2. Understanding-forward users who need to know what they are doing before they can pray with trust.

The app must support both without implying that explanation is secondary to prayer or that structural understanding is merely a help feature. For some users, understanding is the vestibule of prayer.

## Ribbon Placement

The LOTH source page should incorporate ribbon-placement guidance for the four-volume set.

Ribbon placement should be treated as source-navigation metadata and as a physical-book expression of liturgical composition, not merely as incidental user-help prose.

Ribbon guidance should be modeled semantically as well as source-specifically. The key Roman-family layers include:

- Ordinary
- Psalter week
- Proper of Seasons
- Proper of Saints
- Commons
- Night Prayer or other recurring fixed material
- Any edition-specific recurring aids or source locations

This should later inform both printed-source guidance and digital composition-map UI.

## Roman Office Release Strategy

The current LOTH implementation remains an internal architectural proving ground. Its purpose is to mature the Roman office engine, source governance, composition logic, source-page model, ribbon/source navigation, diagnostics, and prayer-flow UI against the real complexity of the modern Liturgy of the Hours.

After the current internal LOTH architecture is stabilized, the project should create a public-domain Roman-family version using releaseable English sources. This public-domain version should reuse the Roman office engine and composition-map architecture rather than becoming a separate one-off corpus.

## Architectural Guardrail

Do not hardwire the Roman office engine to the current current LOTH text.

The engine must distinguish:

- Office-family architecture
- Source edition
- Calendar and rubrical regime
- Textual corpus
- Navigation affordances
- Source status
- Public/runtime delivery status

The current LOTH text is a source constraint. The Roman office engine is reusable infrastructure.

## Implementation Roadmap Notes

- Add `sourceNavigation` / `ribbonPlacement` support for Roman LOTH source pages.
- Define a semantic ribbon-layer vocabulary for Roman-family sources.
- Add composition-map output for LOTH-resolved offices.
- Ensure LOTH diagnostics can identify which layer supplied each rendered element.
- Mark current LOTH corpus work as an internal / external architecture-prototype track.
- Add future public-domain Roman Office corpus track after internal LOTH stabilization.
- Confirm that Roman office engine logic is source-edition-aware and not hardwired to the current LOTH text.
