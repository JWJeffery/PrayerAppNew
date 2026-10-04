/**
 * Roman Breviary 1960/1962 -- from the engine's cell HTML to the app's blocks.
 *
 * parseOfficiumHtml(): HTML cells -> sections (moved unchanged from scripts/parse-officium-html.mjs).
 * buildBlocksAndUnits(): sections -> blocks + units (moved unchanged from
 * scripts/build-roman-breviary-oracle-blocks.mjs); keyFn(kind, citation, text, language) names a unit
 * (the audit scripts pass a content hash; the browser passes a counter).
 * Both scripts now import this file, so the audited path and the app's path are the same code.
 */
(function (root) {
  'use strict';
  const RB = (root.RomanBreviary = root.RomanBreviary || {});

const HEADER_RE = /^<FONT SIZE='\+1' COLOR="red"><B><I>(.*?)<\/I><\/B><\/FONT>(?:\s*<FONT SIZE='-1' >\{(.*?)\}<\/FONT>)?\s*$/;
const FOOTNOTE_SUFFIX_RE = /<FONT SIZE='-1' >\s*\[\d+\]<\/FONT>\s*$/;
const CITATION_ONLY_RE = /^<FONT COLOR="red"><I>(.*?)<\/I><\/FONT>\s*$/;
const ANTIPHON_RE = /^<FONT COLOR="red"><I>Ant\.<\/I><\/FONT>\s*(.*)$/;
const VERSICLE_RE = /^<FONT COLOR="red"><I>℣\.<\/I><\/FONT>\s*(.*)$/;
const RESPONSE_RE = /^<FONT COLOR="red"><I>℟\.<\/I><\/FONT>\s*(.*)$/;
const VERSE_RE = /^<FONT SIZE='1' COLOR="red">([^<]+)<\/FONT>\s*(.*)$/;
const DROPCAP_RE = /^<FONT SIZE='\+2' COLOR="red"><B><I>([A-ZÆŒ])<\/I><\/B><\/FONT>(.*)$/;
// Latin and English forms, verified against live engine output for both languages (see
// AUDIT_GOVERNANCE_LEDGER.md's English-lane reconnaissance entry) rather than assumed -- these are
// the only two word-based (non-formatting-based) markers in this file, so this is the one place a
// third language would need a new alternative added.
const PSALMUS_RE = /^(?:Psalmus|Psalm)\s+(.+)$/;
const NOCTURNUS_RE = /^(?:Nocturnus|Nocturn)\s+([IVX]+)$/;
const RUBRIC_PAREN_RE = /^<FONT SIZE='1' COLOR="red">(\(.*?\))<\/FONT>\s*$/;
const PLAIN_RUBRIC_RE = /^<FONT SIZE='1' COLOR="red">(.*)<\/FONT>\s*$/;

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
}

const OMITTED_RE = /^<FONT SIZE='-1' >(.*?)\{omittitur\}<\/FONT>\s*$/;
const OMITTED_RE_EN = /^<FONT SIZE='-1' >(.*?)\{omit\}<\/FONT>\s*$/;

function splitLines(tdInnerHtml) {
  const cleaned = tdInnerHtml.replace(/<DIV ALIGN='right'>[\s\S]*?<\/DIV>/g, '');
  return cleaned
    .split(/<br\s*\/?>/i)
    .map(l => l.trim())
    .filter(l => l.length > 0 && l !== '&nbsp;');
}

function extractTdBlocks(html) {
  const blocks = [];
  // ID is optional: a row that renders only a "{omittitur}"/"{omit}" placeholder for a
  // structurally-omitted section (e.g. Preces Feriales on a non-feria day) has no ID='...' attribute
  // at all in this engine's own HTML, unlike every other row. Requiring one here silently dropped
  // those placeholder rows out of the parse entirely -- no diagnostic, no omitted-block record, just
  // gone -- discovered while validating the English lane against the Latin one for the same
  // date/hour and finding blocks Latin was missing that English happened to pick up only because its
  // own omitted-placeholder rows for the same sections DO carry an ID. Latin's already-committed
  // manifests/units were built under this bug and are not regenerated here -- see
  // AUDIT_GOVERNANCE_LEDGER.md's English-lane entry for what's affected and why it's flagged rather
  // than silently fixed retroactively.
  const tdRe = /<TR><TD[^>]*?(?:ID='([A-Za-z]+)(\d+)')?[^>]*>([\s\S]*?)<\/TD>\s*<\/TR>/g;
  let m;
  while ((m = tdRe.exec(html))) {
    blocks.push({ hourPrefix: m[1] || null, seq: m[2] ? Number(m[2]) : null, rawInner: m[3] });
  }
  return blocks;
}

function extractRankLine(html) {
  const m = html.match(/<P ALIGN=CENTER><FONT[^>]*>(.*?)<\/FONT>/);
  return m ? stripTags(m[1]) : null;
}

function parseOfficiumHtml(html) {
  const rankLine = extractRankLine(html);
  const tdBlocks = extractTdBlocks(html);

  const sections = [];
  let current = null;
  let pendingCitation = null;
  let pendingNocturn = null;
  let diagnostics = [];
  const rubricResumeStack = [];
  let psalmodyHeader = null;

  function ensureSection(label, annotation) {
    if (current && current.label === label && current.nocturn === pendingNocturn) return current;
    current = { label, annotation: annotation || null, nocturn: pendingNocturn, lines: [], rubricNotes: [] };
    sections.push(current);
    return current;
  }

  for (const td of tdBlocks) {
    const rawLines = splitLines(td.rawInner);

    for (const rawLine of rawLines) {
      const line = rawLine.replace(FOOTNOTE_SUFFIX_RE, '').trim();
      let m;

      if ((m = OMITTED_RE.exec(line)) || (m = OMITTED_RE_EN.exec(line))) {
        const label = m[1];
        diagnostics.push({ type: 'section-omitted', section: label, note: `${label}{omittitur}` });
        current = ensureSection(label, null);
        current.omitted = true;
        continue;
      }

      if ((m = HEADER_RE.exec(line))) {
        const label = m[1];
        const annotation = m[2] || null;
        pendingNocturn = null;
        if (annotation && /omittitur|omit/i.test(annotation)) {
          diagnostics.push({ type: 'section-omitted', section: label, note: annotation });
          current = ensureSection(label, annotation);
          current.omitted = true;
          continue;
        }
        current = ensureSection(label, annotation);
        if (/psalmi|psalms/i.test(label)) psalmodyHeader = { label, annotation };
        continue;
      }

      if (!current) {
        current = ensureSection('(untitled)', null);
      }

      if ((m = RUBRIC_PAREN_RE.exec(line))) {
        current.rubricNotes.push(stripTags(m[1]));
        continue;
      }

      if ((m = ANTIPHON_RE.exec(line))) {
        current.lines.push({ type: 'antiphon', text: stripTags(m[1]) });
        continue;
      }

      if ((m = VERSICLE_RE.exec(line))) {
        current.lines.push({ type: 'versicle', text: stripTags(m[1]) });
        continue;
      }

      if ((m = RESPONSE_RE.exec(line))) {
        current.lines.push({ type: 'response', text: stripTags(m[1]) });
        continue;
      }

      if ((m = CITATION_ONLY_RE.exec(line))) {
        const inner = m[1];
        let pm;
        if ((pm = NOCTURNUS_RE.exec(inner))) {
          pendingNocturn = pm[1];
          const hdr = psalmodyHeader || { label: current.label, annotation: current.annotation };
          current = ensureSection(hdr.label, hdr.annotation);
          continue;
        }
        if ((pm = PSALMUS_RE.exec(inner))) {
          current.lines.push({ type: 'psalm-citation', text: `Ps. ${pm[1]}` });
          continue;
        }
        current.lines.push({ type: 'citation', text: stripTags(inner) });
        continue;
      }

      if ((m = VERSE_RE.exec(line))) {
        const num = stripTags(m[1]);
        const text = stripTags(m[2]);
        // A verse-number-plus-text line (e.g. "92:1 Dóminus regnávit...") keeps its established
        // shape below. But this exact tag pattern is also how Divinum Officium renders standalone,
        // no-trailing-text annotations -- and empirically, across every date this build actually
        // uses (both languages, full 2 years, verified by direct corpus sweep -- see
        // AUDIT_GOVERNANCE_LEDGER.md), every single one of those is a genuine rubric instruction
        // ("Gloria omittitur", "The first verse of the following hymn is said genuflecting.", etc),
        // never a scripture citation slipping through. Before this fix these were silently
        // swallowed: `text` empty, `lineText()` returns '' for a 'verse' line and it vanishes from
        // the rendered office with no trace, not even a diagnostic.
        //
        // Deliberately NOT routed through PLAIN_RUBRIC_RE's own resume-on-next-dropcap mechanism
        // below: checked what actually follows each of the 11 distinct real cases in this corpus
        // (both languages, both years) and it's a genuine mix -- "Gloria omittitur" and "Romæ
        // præcedens Versus..." are followed by an antiphon/versicle, not a dropcap, so they would
        // never resume and would silently swallow everything after them into a fake rubric section
        // until some later dropcap happened to appear. Kept as an inline note in the CURRENT
        // section instead -- no section-switching, so nothing downstream can be corrupted by what
        // does or doesn't follow.
        if (!text) {
          current.lines.push({ type: 'rubric-note', text: num });
          continue;
        }
        current.lines.push({ type: 'verse', num, text });
        continue;
      }

      if ((m = DROPCAP_RE.exec(line))) {
        current.lines.push({ type: 'para', text: m[1] + stripTags(m[2]) });
        if (current.isRubricSection && rubricResumeStack.length) {
          current = rubricResumeStack.pop();
        }
        continue;
      }

      if (line.startsWith('*')) {
        current.lines.push({ type: 'response-cont', text: stripTags(line.slice(1)) });
        continue;
      }

      if ((m = PLAIN_RUBRIC_RE.exec(line))) {
        const note = stripTags(m[1]);
        const resumeTo = current;
        current = { label: `(rubric) ${note}`, annotation: null, nocturn: pendingNocturn, lines: [], rubricNotes: [note], isRubricSection: true };
        sections.push(current);
        rubricResumeStack.push(resumeTo);
        continue;
      }

      const plain = stripTags(line);
      if (plain) current.lines.push({ type: 'text', text: plain });
    }
  }

  return { rankLine, sections, diagnostics };
}

// Latin and English label vocabularies, each verified against live engine output (12+ sample dates
// across all 8 hours -- see AUDIT_GOVERNANCE_LEDGER.md's English-lane entry) rather than assumed.
// The two lists are deliberately the same *shape* -- same specificity, same exact-vs-prefix choices
// -- so a label that falls through to 'other' in Latin (e.g. bare "Capitulum", never seen alone in
// sampling; only in compounds like "Capitulum Hymnus Versus") falls through the same way in English
// ("Chapter", same compounds). Latin's `/^Preces/` (matches "Preces Feriales") has a real but
// non-obvious English counterpart -- "Weekday Intercessions", not a literal translation -- confirmed
// by finding the one sample date (2026-02-25, a Lenten feria) where it actually fires and reading
// both languages' output for that exact date/hour side by side, not guessed from the Latin root word.
const ROLE_BY_LABEL_LA = [
  [/^Invitatorium$/, 'opening'],
  [/^Psalmi/, 'psalmody'],
  [/^Lectio \d+$/, 'reading'],
  [/^Oratio/, 'prayer'],
  [/^Conclusio$/, 'dismissal'],
  [/^\(rubric\)/, 'rubric'],
  [/^Hymnus$/, 'hymn'],
  [/^Capitulum$/, 'reading'],
  [/^Canticum/, 'canticle'],
  [/^Preces/, 'intercession']
];

const ROLE_BY_LABEL_EN = [
  [/^Invitatory$/, 'opening'],
  [/^Psalms/, 'psalmody'],
  [/^Reading \d+$/, 'reading'],
  [/^Prayer/, 'prayer'],
  [/^Conclusion$/, 'dismissal'],
  [/^\(rubric\)/, 'rubric'],
  [/^Hymn$/, 'hymn'],
  [/^Chapter$/, 'reading'],
  [/^Canticle/, 'canticle'],
  [/Intercession/, 'intercession']
];

const ROLE_BY_LABEL_BY_LANGUAGE = { la: ROLE_BY_LABEL_LA, en: ROLE_BY_LABEL_EN };

function roleForSection(section, language = 'la') {
  const ROLE_BY_LABEL = ROLE_BY_LABEL_BY_LANGUAGE[language] || ROLE_BY_LABEL_LA;
  if (section.label === '(untitled)') {
    // No real header appeared before this content (e.g. explanatory notes before any section, or
    // a special once-a-year office like Good Friday's "Completorium singulare" that doesn't use
    // the normal bold-header convention at all). Pure prose notes are genuinely rubric text;
    // anything with real prayer content (verses, antiphons, responses) is not, and gets the
    // generic fallback rather than being mislabeled as a rubric.
    const hasSubstantiveContent = section.lines.some(l =>
      ['verse', 'para', 'antiphon', 'response', 'versicle'].includes(l.type)
    );
    return hasSubstantiveContent ? 'other' : 'rubric';
  }
  for (const [re, role] of ROLE_BY_LABEL) if (re.test(section.label)) return role;
  return 'other';
}

function lineText(line) {
  switch (line.type) {
    case 'antiphon': return `Ant. ${line.text}`;
    case 'psalm-citation': return line.text;
    case 'citation': return null;
    case 'versicle': return `V. ${line.text}`;
    case 'response': return `R. ${line.text}`;
    case 'response-cont': return `* ${line.text}`;
    case 'verse': return line.text;
    // A standalone rubric annotation kept inline in whatever section it occurs in (see
    // parse-officium-html.mjs's VERSE_RE handling) -- parenthesized so it reads as an aside, not
    // as a continuation of the surrounding prayer text.
    case 'rubric-note': return `(${line.text})`;
    case 'para': return line.text;
    case 'text': return line.text;
    default: return line.text || null;
  }
}

function sectionCitation(section) {
  const citationLine = section.lines.find(l => l.type === 'citation');
  return citationLine ? citationLine.text : '';
}

function sectionText(section) {
  return section.lines
    .map(lineText)
    .filter(t => t !== null && t !== '')
    .join('\n');
}


const NOCTURN_LABEL_WORD_BY_LANGUAGE = { la: 'Nocturnus', en: 'Nocturn' };

function buildBlocksAndUnits(sections, sourceMeta, language = 'la', keyFn) {
  const units = {};
  const blocks = [];
  const nocturnWord = NOCTURN_LABEL_WORD_BY_LANGUAGE[language] || 'Nocturnus';

  for (const section of sections) {
    if (section.omitted) {
      blocks.push({ role: 'rubric', label: section.label, unit_refs: [], omitted: true });
      continue;
    }
    if (section.lines.length === 0) continue;

    const role = roleForSection(section, language);
    const kind = role === 'rubric' ? 'rubric' : role;
    const citation = sectionCitation(section);
    const text = sectionText(section);
    if (!text) continue;

    const key = keyFn(kind, citation, text, language);
    if (!units[key]) {
      units[key] = {
        key,
        kind,
        citation,
        text,
        source: sourceMeta
      };
    }

    blocks.push({
      role,
      label: section.label,
      ...(section.nocturn ? { nocturn: section.nocturn, nocturnLabel: `${nocturnWord} ${section.nocturn}` } : {}),
      unit_refs: [key]
    });
  }

  return { blocks, units };
}

  RB.parseOfficiumHtml = parseOfficiumHtml;
  RB.buildBlocksAndUnits = buildBlocksAndUnits;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})(typeof globalThis !== 'undefined' ? globalThis : this);
