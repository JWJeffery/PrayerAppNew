import crypto from 'node:crypto';
import { createRequire } from 'node:module';
// The section-to-block logic now lives in js/roman-breviary/blocks.js (shared with the app's own engine
// path); this module keeps the old import and the content-addressed unit keys for the audit scripts.
const require = createRequire(import.meta.url);
const RB = require('../js/roman-breviary/blocks.js');

function contentAddressedKey(kind, citation, text, language = 'la') {
  const hash = crypto.createHash('sha1').update(`${kind}|${citation}|${text}`).digest('hex');
  return `rb1960.${language}.unit.${hash}`;
}

export function buildBlocksAndUnits(sections, sourceMeta, language = 'la') {
  return RB.buildBlocksAndUnits(sections, sourceMeta, language, contentAddressedKey);
}
