// The parser now lives in js/roman-breviary/blocks.js (shared with the app's own engine path);
// this module keeps the old import path working for the audit scripts.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export const { parseOfficiumHtml } = require('../js/roman-breviary/blocks.js');
