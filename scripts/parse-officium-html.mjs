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

export function parseOfficiumHtml(html) {
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
