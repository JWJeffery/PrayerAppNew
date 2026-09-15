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
 * page renders FROM this envelope and the drift disappears.
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

    /**
     * Build the envelope from the Anglican renderer's own emitted markup.
     *
     * @param {string} html    the accumulated office markup, pre-DOM
     * @param {object} context {calendarSummary, officeFamily, rite}
     */
    function emit(html, context) {
        var blocks = [];
        var source = String(html || '');

        /* Labels and citations, in emission order. Both patterns are the
           renderer's own; neither is a heuristic about content. */
        var pattern = /<span class="rubric-text">([\s\S]*?)<\/span>|<h4 class="passage-reference">([\s\S]*?)<\/h4>/g;
        var m;
        while ((m = pattern.exec(source)) !== null) {
            if (m[1] !== undefined) {
                var label = decode(m[1].replace(/<[^>]+>/g, ''));
                if (!label) continue;
                blocks.push({ label: label, role: roleFor(label), units: [] });
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

        return {
            tradition: 'ANG',
            officeFamily: (context && context.officeFamily) || null,
            context: {
                calendarSummary: (context && context.calendarSummary) || null,
                rankSummary: null      /* the Anglican lane supplies none */
            },
            blocks: blocks,
            overlays: [],              /* not yet distinguished in the markup */
            diagnostics: []            /* ditto — both wait for the refactor */
        };
    }

    window.AnglicanEnvelope = {
        emit: emit,

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
