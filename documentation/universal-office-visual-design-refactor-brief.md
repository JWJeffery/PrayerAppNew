# Universal Office Visual Design Refactor Brief

## Adopted Direction

The Universal Office needs an app-wide visual design refactor.

The Bible Browser is the pilot implementation. It is the first place where the new design language should be proven before the design system is propagated across the rest of the app.

This is not a cosmetic cleanup. It is the beginning of a coherent app-wide design system.

## Core Thesis

Beauty serves structure. Structure governs beauty.

The app should feel like a serious, beautiful, reverent, trustworthy liturgical-study environment, not a developer utility or a stack of controls around sacred text.

The design must be:

- reader-first
- design-forward
- calm
- accessible to ordinary users
- strong enough for serious theological and liturgical study
- honest about missing work, unsupported data, source status, and tradition-specific structure

## Canonical Guardrail

Visual unity must not flatten canonical or liturgical distinctions.

The app may use one coherent design language, but it must preserve real distinctions among Catholic, Byzantine Catholic, Eastern Orthodox, Oriental Orthodox, Church of the East, Anglican, and other office-family lanes.

When visual convenience and theological structure conflict, theological structure governs.

## User Posture

The ordinary user should see plain-English labels first.

The advanced user should still be able to reach source-aware, research-grade tools.

Primary labels should avoid internal terms such as corpus, runtime, pipeline, and registry unless the user is in an advanced or administrative context.

## Visual Language

The primary visual language should move toward an illuminated parchment interface.

The current dark interface is not the main design north star. Dark mode may eventually exist as an optional secondary mode, but the primary design direction should be warm, light, devotional, and app-like.

The design should move toward:

- warm ivory, parchment, and vellum surfaces
- deep brown ink and action colors
- restrained gold or brass line iconography
- soft shadows and rounded cards
- large calm reading surfaces
- minimal visible chrome
- tabbed sections and drawers instead of toolboxes
- contextual tools instead of persistent clutter
- study drawers for complex interactions
- plain-language empty and warning states
- a premium liturgical app feel rather than a web utility feel

The target reference is the mobile-app concept: ivory backgrounds, brown/gold ecclesial accents, devotional iconography, calm cards, clear tabs, and generous whitespace.

Avoid:

- dense utility sidebars
- generic dashboards
- decorative clutter
- dark-mode-first assumptions
- controls competing with sacred text
- design choices that imply traditions are interchangeable skins

## Bible Browser Pilot

The Bible Browser should become the proving ground for translating the mobile-app visual language into the web app.

The Bible Browser should prove:

- warm parchment reader surface
- soft app-like header
- primary passage command bar
- large reading canvas
- tabbed or card-based secondary tools
- contextual selection toolbar
- cream / parchment study drawer
- research notebook
- reading plan
- source-aware study features

The current feature baseline must be preserved:

- reference lookup
- complex citations
- partial/missing reference handling
- search grammar
- parallel reader
- highlighter colors
- multi-verse notes and highlights
- study-drawer panels
- Fathers lookup
- Fathers save-to-notebook
- Fathers add-to-note
- research index
- Markdown export
- chronological Bible-in-a-year reading plan
- manual completion tracking
- release packaging

## Preferred Interaction Pattern

The study drawer pattern is now preferred for:

- Highlight Options
- Add / Edit Note
- What the Fathers Say
- Saved Fathers item
- future source views

The drawer should remain high, visible, scrollable, and stable.

## App-Wide Refactor Sequence

Phase A: record this brief and guard it with an audit.

Phase B: redesign the Bible Browser static layout around the parchment/mobile-app concept without removing existing behavior.

Phase C: extract reusable design components from the Bible Browser.

Phase D: propagate the system to the app shell.

Phase E: apply the reader-first system to Office pages and other liturgical reading surfaces.

## Browser Refresh Command

When manual browser QA needs a fresh route load, use this exact browser-console command:

`location.href = "/tools/bible?reload=" + Date.now();`
