/**
 * js/anglican-envelope.js — Phase 3, first slice.
 *
 * Emits a resolved-office envelope for the Anglican lane, in the shape
 * specified by documentation/UNIVERSAL_OFFICE_CORE_CONTRACT.md §4, so the shell
 * can draw the rail and the ordo day-line from real structure instead of a
 * placeholder.
 *
 * WHAT THIS IS, HONESTLY
 *
 * This is the "emit alongside" slice, chosen deliberately over refactoring
 * renderBcpOffice() in one go. That function is 890 lines with 90 template
 * literals, and it decides what the office contains and writes the markup in
 * the same breath — there is no seam between the two. Creating that seam is the
 * real Phase 3. This slice creates the ENVELOPE without touching the render
 * path, so a mistake here shows up as a wrong rail item and never as a broken
 * office.
 *
 * THE KNOWN COST, stated rather than discovered later: the envelope and the
 * HTML are produced by the same pass but independently, so they can drift. The
 * envelope is NOT yet the source of the page. When the refactor lands, the
 * page renders FROM this envelope and the drift disappears. THAT REFACTOR IS
 * STILL OPEN. Nothing below changes that.
 *
 * 2026-09-16 increment: overlays[] and diagnostics[] were EMPTY because a
 * borrowed devotion was not distinguishable from a native block by scraping
 * alone, and a silently-substituted placeholder ("Text not found") was
 * indistinguishable from real content the same way. Both are now populated,
 * without touching the render path:
 *
 *   - office-ui.js now tells this file, at the exact moment it emits an
 *     ecumenical/cross-tradition devotion (Agpeya Opening, the Examen, the
 *     Angelus, Trisagion, Kyrie Pantocrator, Prayer of the Hours, Prayer
 *     Before Reading, the Theotokion), what it just emitted and where --
 *     `context.overlays: [{label, source, anchor}]`. That is real structural
 *     knowledge threaded through the same pass that already knows it, not a
 *     guess made here from the label text. A block whose label matches one of
 *     these is moved from `blocks[]` into `overlays[]` with its real source
 *     and anchor, never left in `blocks[]` as if native (contract §4 rule 3).
 *     Where the corpus itself carries no `tradition` field for a component,
 *     `source` is null and disclosed as such -- never guessed.
 *   - A block whose own emitted window contains a known placeholder string
 *     ("Text not found", "No collect appointed") already means the renderer
 *     had nothing to substitute. That is named here as a `not-yet-mapped`
 *     diagnostic rather than left silent. Rendered output is unchanged.
 *
 * This is still the emit-alongside slice, not the refactor. The envelope and
 * the HTML are still built independently in the same pass and can still
 * drift on anything other than overlay/diagnostic detection. Only the
 * refactor removes that.
 *
 * WHY READING THE EMITTED STRING IS NOT "SCRAPING THE DOM"
 *
 * The handoff forbids building rail items by scraping the rendered page, and it
 * is right to: that invents structure the lane never stated. This does not do
 * that. It reads the lane's own output string at the moment of emission, inside
 * the same function that produced it, before it reaches the DOM — and it reads
 * only the markers the lane itself uses to mark a block: the
 * `<span class="rubric-text">` label the Anglican renderer emits at the head of
 * every block, and the `<h4 class="passage-reference">` citation. Those labels
 * are the tradition's own words, verbatim. Nothing is inferred, translated or
 * supplied.
 *
 * If a block carries no label in the source, it gets no rail entry. A gap stays
 * a gap.
 */

(function () {
    'use strict';

    /* Contract §7: the role taxonomy is CLOSED by governance — 13 roles plus
       `other`, with `creed` and `doxology` added by the 2026-09-04 amendment.
       The shell renders generic treatment from these and nothing else.

       Mapping a label to a role is the one judgement this file makes, so it is
       made conservatively: anything not recognised is `other`, never a guess at
       a nearby role. Overloading a role to smuggle in tradition-specific
       meaning is forbidden by the same section, so these map on liturgical
       function only. */
    var ROLE_BY_LABEL = {
        'opening sentence':      'opening',
        'opening blessing':      'opening',
        'confession of sin':     'penitential',
        'the invitatory':        'invitatory',
        'invitatory':            'invitatory',
        'antiphon':              'antiphon',
        'the psalm':             'psalmody',
        'the psalms':            'psalmody',
        'the lesson':            'reading',
        'the first lesson':      'reading',
        'the second lesson':     'reading',
        'the gospel':            'reading',
        'the collect':           'collect',
        'the collects':          'collect',
        'the lord\u2019s prayer': 'lords-prayer',
        'the lord\'s prayer':    'lords-prayer',
        'the apostles\u2019 creed': 'creed',
        'the nicene creed':      'creed',
        'the general thanksgiving': 'thanksgiving',
        'the dismissal':         'dismissal',
        'dismissal':             'dismissal',
        'suffrages':             'suffrages',
        'the suffrages':         'suffrages'
    };

    function roleFor(label) {
        var key = String(label || '').trim().toLowerCase();
        return ROLE_BY_LABEL[key] || 'other';
    }

    /* Plain string replacement, not a throwaway <textarea> per label.
       The first version created and discarded a DOM node for every block on
       every render — measurable waste in the one place this file runs, and
       pointless: the renderer emits a known, fixed set of entities. Anything
       outside this set is left exactly as it is rather than guessed at, so an
       unrecognised entity survives verbatim into the rail instead of being
       mangled. */
    var ENTITIES = {
        '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
        '&#39;': "'", '&apos;': "'", '&nbsp;': ' ',
        '&rsquo;': '\u2019', '&lsquo;': '\u2018',
        '&rdquo;': '\u201d', '&ldquo;': '\u201c',
        '&mdash;': '\u2014', '&ndash;': '\u2013', '&hellip;': '\u2026'
    };

    function decode(s) {
        return String(s).replace(/&[a-z]+;|&#\d+;/gi, function (m) {
            return Object.prototype.hasOwnProperty.call(ENTITIES, m.toLowerCase())
                ? ENTITIES[m.toLowerCase()]
                : m;
        }).trim();
    }

    /* Contract §11: three real codes, each with its own wording -- never one
       generic "gap" message. This file currently only ever detects
       `not-yet-mapped` (a placeholder the renderer already produces when it
       has nothing to substitute); `source-blocked` and `coverage-gap` are
       recorded here for the shell's benefit but nothing yet emits them. */
    var DIAGNOSTIC_WORDING = {
        'not-yet-mapped': 'No proper is appointed for this day in the corpus. Nothing has been substituted.',
        'source-blocked': 'This exists in scope but cannot yet be shown.',
        'coverage-gap':   'A known gap, stated rather than hidden.'
    };

    /* A known placeholder string is not content — it is the renderer already
       telling us, in English prose meant for a person, that it had nothing to
       put here. Naming that as a diagnostic discloses a gap that was already
       being shown; it invents nothing and changes no rendered output. */
    var PLACEHOLDER_MARKERS = ['Text not found', 'No collect appointed'];

    /**
     * Build the envelope from the Anglican renderer's own emitted markup.
     *
     * @param {string} html    the accumulated office markup, pre-DOM
     * @param {object} context {calendarSummary, officeFamily, rite,
     *                          overlays: [{label, source, anchor}]}
     *                         `overlays` is real structural knowledge from
     *                         office-ui.js, naming exactly which labels it
     *                         just emitted as borrowed/ecumenical devotion and
     *                         why -- not a guess this file makes from the
     *                         label text alone.
     */
    function emit(html, context) {
        var blocks = [];
        var source = String(html || '');
        var overlayHints = (context && Array.isArray(context.overlays)) ? context.overlays : [];
        var overlayByLabel = {};
        overlayHints.forEach(function (o) {
            if (o && o.label) overlayByLabel[o.label] = o;
        });

        /* Labels and citations, in emission order. Both patterns are the
           renderer's own; neither is a heuristic about content. __start
           records where each block's own span of markup begins, so a
           placeholder string can be attributed to the block whose window it
           falls in; it is stripped before anything is returned. */
        var pattern = /<span class="rubric-text">([\s\S]*?)<\/span>|<h4 class="passage-reference">([\s\S]*?)<\/h4>/g;
        var m;
        while ((m = pattern.exec(source)) !== null) {
            if (m[1] !== undefined) {
                var label = decode(m[1].replace(/<[^>]+>/g, ''));
                if (!label) continue;
                blocks.push({ label: label, role: roleFor(label), units: [], __start: m.index });
            } else if (m[2] !== undefined && blocks.length) {
                /* A citation belongs to the block it follows. With no preceding
                   label there is no block to attach it to, and it is dropped
                   rather than given one. */
                var citation = decode(m[2].replace(/<[^>]+>/g, ''));
                if (citation) {
                    blocks[blocks.length - 1].units.push({
                        kind: 'scripture',
                        citation: citation
                    });
                }
            }
        }

        /* Diagnostics, computed before blocks are split into native/overlay:
           each block's window runs from its own label to the next block's
           label, or the end of the source. */
        var diagnostics = [];
        for (var i = 0; i < blocks.length; i++) {
            var windowEnd = (i + 1 < blocks.length) ? blocks[i + 1].__start : source.length;
            var windowText = source.slice(blocks[i].__start, windowEnd);
            var hasPlaceholder = PLACEHOLDER_MARKERS.some(function (marker) {
                return windowText.indexOf(marker) !== -1;
            });
            if (hasPlaceholder) {
                diagnostics.push({
                    code: 'not-yet-mapped',
                    message: DIAGNOSTIC_WORDING['not-yet-mapped'],
                    block: blocks[i].label
                });
            }
        }

        /* Overlays: never left in blocks[] as if native (contract §4 rule 3,
           §9, §10). A block is an overlay only when office-ui.js said so at
           emission time -- matched on label, which these labels ("Agpeya
           Opening", "The Examen", "Theotokion", etc.) do not share with any
           native BCP block. */
        var overlays = [];
        var nativeBlocks = [];
        blocks.forEach(function (b) {
            var hint = overlayByLabel[b.label];
            if (hint) {
                overlays.push({
                    label: b.label,
                    /* null = the corpus itself carries no tradition field for
                       this component. Disclosed, never guessed. */
                    source: hint.source || null,
                    anchor: hint.anchor || null
                });
            } else {
                delete b.__start;
                nativeBlocks.push(b);
            }
        });

        return {
            tradition: 'ANG',
            officeFamily: (context && context.officeFamily) || null,
            context: {
                calendarSummary: (context && context.calendarSummary) || null,
                rankSummary: null      /* the Anglican lane supplies none */
            },
            blocks: nativeBlocks,
            overlays: overlays,
            diagnostics: diagnostics
        };
    }

    /**
     * The direct-knowledge path -- Phase 3's actual refactor, added when
     * renderBcpOffice() was converted to build blocks[]/overlays[]/
     * diagnostics[] itself, at the moment of emission, rather than this file
     * scraping them back out of the rendered HTML string afterward. `env` is
     * exactly {blocks, overlays, diagnostics} as the renderer built it; this
     * function's only job is to wrap that in the envelope shape and attach
     * `context`, reusing the same role taxonomy and never re-deriving
     * anything `emit()` above used to infer. `emit()` itself is kept,
     * unchanged, only because it is still the reference implementation for
     * any lane that has not been converted yet -- it is no longer called by
     * the Anglican lane.
     */
    function assemble(env, context) {
        return {
            tradition: 'ANG',
            officeFamily: (context && context.officeFamily) || null,
            context: {
                calendarSummary: (context && context.calendarSummary) || null,
                rankSummary: null      /* the Anglican lane supplies none */
            },
            blocks: (env && env.blocks) || [],
            overlays: (env && env.overlays) || [],
            diagnostics: (env && env.diagnostics) || []
        };
    }

    window.AnglicanEnvelope = {
        emit: emit,
        assemble: assemble,
        roleFor: roleFor,

        /* The shell listens for this rather than polling. Publishing is
           separate from emitting so a failure to publish can never affect the
           office that was already rendered. */
        publish: function (envelope) {
            try {
                window.__universalOfficeEnvelope = envelope;
                document.dispatchEvent(new CustomEvent('universal-office-envelope', {
                    detail: envelope
                }));
            } catch (e) {
                /* Never let envelope publication break a rendered office. */
            }
        }
    };
}());
