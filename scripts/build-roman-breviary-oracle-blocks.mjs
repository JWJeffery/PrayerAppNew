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

function roleForLabel(label) {
  for (const [re, role] of ROLE_BY_LABEL) if (re.test(label)) return role;
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

    const role = roleForLabel(section.label);
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
      nocturn: section.nocturn || undefined,
      unit_refs: [key]
    });
  }

  return { blocks, units };
}
