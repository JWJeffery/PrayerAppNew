const HEADER_RE = /^<FONT SIZE='\+1' COLOR="red"><B><I>(.*?)<\/I><\/B><\/FONT>(?:\s*<FONT SIZE='-1' >\{(.*?)\}<\/FONT>)?\s*$/;
const CITATION_ONLY_RE = /^<FONT COLOR="red"><I>(.*?)<\/I><\/FONT>\s*$/;
const ANTIPHON_RE = /^<FONT COLOR="red"><I>Ant\.<\/I><\/FONT>\s*(.*)$/;
const VERSICLE_RE = /^<FONT COLOR="red"><I>℣\.<\/I><\/FONT>\s*(.*)$/;
const RESPONSE_RE = /^<FONT COLOR="red"><I>℟\.<\/I><\/FONT>\s*(.*)$/;
const VERSE_RE = /^<FONT SIZE='1' COLOR="red">([^<]+)<\/FONT>\s*(.*)$/;
const DROPCAP_RE = /^<FONT SIZE='\+2' COLOR="red"><B><I>([A-ZÆŒ])<\/I><\/B><\/FONT>(.*)$/;
const PSALMUS_RE = /^Psalmus\s+(.+)$/;
const NOCTURNUS_RE = /^Nocturnus\s+([IVX]+)$/;
const RUBRIC_PAREN_RE = /^<FONT SIZE='1' COLOR="red">(\(.*?\))<\/FONT>\s*$/;
const PLAIN_RUBRIC_RE = /^<FONT SIZE='1' COLOR="red">(.*)<\/FONT>\s*$/;

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
}

const OMITTED_RE = /^<FONT SIZE='-1' >(.*?)\{omittitur\}<\/FONT>\s*$/;

function splitLines(tdInnerHtml) {
  const cleaned = tdInnerHtml.replace(/<DIV ALIGN='right'>[\s\S]*?<\/DIV>/g, '');
  return cleaned
    .split(/<br\s*\/?>/i)
    .map(l => l.trim())
    .filter(l => l.length > 0 && l !== '&nbsp;');
}

function extractTdBlocks(html) {
  const blocks = [];
  const tdRe = /<TR><TD[^>]*ID='([A-Za-z]+)(\d+)'[^>]*>([\s\S]*?)<\/TD>\s*<\/TR>/g;
  let m;
  while ((m = tdRe.exec(html))) {
    blocks.push({ hourPrefix: m[1], seq: Number(m[2]), rawInner: m[3] });
  }
  return blocks;
}

function extractRankLine(html) {
  const m = html.match(/<P ALIGN=CENTER><FONT COLOR="grey">(.*?)<\/FONT><\/P>/);
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

    for (const line of rawLines) {
      let m;

      if ((m = OMITTED_RE.exec(line))) {
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
        if (annotation && /omittitur/i.test(annotation)) {
          diagnostics.push({ type: 'section-omitted', section: label, note: annotation });
          current = ensureSection(label, annotation);
          current.omitted = true;
          continue;
        }
        current = ensureSection(label, annotation);
        if (/psalmi/i.test(label)) psalmodyHeader = { label, annotation };
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
        current.lines.push({ type: 'verse', num: stripTags(m[1]), text: stripTags(m[2]) });
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
