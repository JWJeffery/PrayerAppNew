import crypto from 'node:crypto';
import { parseOfficiumHtml } from './parse-officium-html.mjs';

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

function contentAddressedKey(kind, citation, text, language = 'la') {
  const hash = crypto.createHash('sha1').update(`${kind}|${citation}|${text}`).digest('hex');
  return `rb1960.${language}.unit.${hash}`;
}

const NOCTURN_LABEL_WORD_BY_LANGUAGE = { la: 'Nocturnus', en: 'Nocturn' };

export function buildBlocksAndUnits(sections, sourceMeta, language = 'la') {
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

    const key = contentAddressedKey(kind, citation, text, language);
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
