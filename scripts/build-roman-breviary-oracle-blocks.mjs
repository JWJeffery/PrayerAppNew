import crypto from 'node:crypto';
import { parseOfficiumHtml } from './parse-officium-html.mjs';

const ROLE_BY_LABEL = [
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

function roleForSection(section) {
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

function contentAddressedKey(kind, citation, text) {
  const hash = crypto.createHash('sha1').update(`${kind}|${citation}|${text}`).digest('hex');
  return `rb1960.la.unit.${hash}`;
}

export function buildBlocksAndUnits(sections, sourceMeta) {
  const units = {};
  const blocks = [];

  for (const section of sections) {
    if (section.omitted) {
      blocks.push({ role: 'rubric', label: section.label, unit_refs: [], omitted: true });
      continue;
    }
    if (section.lines.length === 0) continue;

    const role = roleForSection(section);
    const kind = role === 'rubric' ? 'rubric' : role;
    const citation = sectionCitation(section);
    const text = sectionText(section);
    if (!text) continue;

    const key = contentAddressedKey(kind, citation, text);
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
      ...(section.nocturn ? { nocturn: section.nocturn, nocturnLabel: `Nocturnus ${section.nocturn}` } : {}),
      unit_refs: [key]
    });
  }

  return { blocks, units };
}
