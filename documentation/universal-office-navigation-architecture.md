# Universal Office Navigation Architecture

Status: canonical app-wide design direction  
Date recorded: 2026-06-05  
Scope: Universal Office web app shell, office modes, Bible Reader, Book of Needs, and Admin

## Purpose

The Universal Office should no longer behave like a collection of separate screens with unrelated navigation. The app should have one recognizable navigation architecture shared across all major modes. Each tradition may use its own language, labels, and liturgical concepts, but the user should not have to relearn how to move around the app when switching from Daily Office to Ethiopian Sa'atat, Church of the East, Horologion, Bible Reader, Book of Needs, or Admin.

This document records the shared navigation contract before the remaining app-wide visual refactor proceeds.

## Canonical navigation model

Every major mode should conform to the same high-level structure:

1. App shell / mode surface
   - The current mode appears inside the same parchment app environment.
   - The user should always understand where they are in the Universal Office.
   - Each mode should have a consistent way back to the mode selector.

2. Top-level return action
   - The user should always have a clear Back to Modes / Home / Modes action.
   - The wording may vary only when the context requires it, but the placement and visual treatment should remain consistent.

3. Left navigation rail and settings drawer
   - Office modes should use a left rail plus settings/context drawer pattern.
   - The rail is the persistent navigation affordance.
   - The drawer contains mode-specific controls: office, date, calendar, rite, display depth, language, or other mode controls.
   - The drawer should not use a completely different interaction model from one office tradition to another.

4. Context/control region
   - Mode-specific controls should appear in predictable grouped cards or drawer sections.
   - For offices, this includes date, office/hour, calendar, rite, display depth, and tradition-specific toggles.
   - For Bible Reader, this includes passage, translation, study tools, notes, and reading plan.
   - For Book of Needs, this includes prayer category, prayer search/selection, and any relevant devotional context.
   - For Admin, this includes project/corpus tools, audits, release support, and administrative navigation.

5. Primary content canvas
   - The actual prayer, Scripture, reading, notebook, or administrative work area is the primary visual object.
   - Controls should support the canvas, not compete with it.
   - Repeated status summaries should not create large empty bands before the primary content.

6. Shared visual language
   - Parchment surface, warm app background, sober book typography, soft bronze/rubric accents, and restrained card shadows are the shared visual language.
   - Decorative gothic treatments, oversized all-caps labels, and mode-specific visual systems should be retired unless intentionally retained for liturgical text ornament within the content canvas.

## Required mode parity

The following modes must eventually share this navigation architecture:

- Mode selector / app home
- Daily Office
- Ethiopian Sa'atat
- Church of the East / Hudra
- Horologion / Byzantine offices
- Bible Reader
- Book of Needs
- Admin Dashboard

## Local language is allowed

Shared navigation architecture does not mean identical labels. Examples:

- Daily Office may say Office Settings.
- Ethiopian Sa'atat may say Sa'atat Options or Active Watch.
- Church of the East may say Hudra, Cycle, Station, or Anaphora.
- Horologion may say Office, Calendar, Display Depth, or Tone when relevant.
- Bible Reader may say Study Tools, Notes, Reading Plan, and Fathers.
- Book of Needs may say Prayer Category or Prayer Collection.
- Admin may say Corpus Tools, Release Tools, Audits, or Registry.

The underlying navigation affordances should still feel like the same app.

## Implementation sequence

1. Establish this navigation contract and audit it.
2. Propagate parchment shell to Book of Needs.
3. Propagate parchment shell to Admin Dashboard.
4. Unify office sidebars into a common drawer grammar.
5. Normalize mode return actions.
6. Normalize mode-level headers and primary canvases.
7. Only after shell/navigation parity is achieved, refine internal content typography mode by mode.

## Non-goals for the next tranche

The next tranche should not rewrite office text rendering, alter liturgical source logic, or change corpus content. Navigation parity is a shell and interaction architecture project first.
