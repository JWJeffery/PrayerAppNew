import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ENGINE_ROOT = '/home/user/divinumofficium/divinum-officium';
const PINNED_COMMIT = '0ce8747d7dba3276fc05937635e02360b49a60a6';

const HOUR_COMMANDS = {
  matins: 'Matutinum',
  lauds: 'Laudes',
  prime: 'Prima',
  terce: 'Tertia',
  sext: 'Sexta',
  none: 'Nona',
  vespers: 'Vespera',
  compline: 'Completorium'
};

function verifyPin() {
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ENGINE_ROOT, encoding: 'utf8' }).trim();
  if (head !== PINNED_COMMIT) {
    throw new Error(`Engine clone is at ${head}, expected pinned commit ${PINNED_COMMIT}`);
  }
}

function toOfficiumDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${m}-${d}-${y}`;
}

// Engine language names, not Universal Office's own 'la'/'en' codes -- this is the exact string
// the Divinum Officium engine expects for lang1/lang2. Both are set to the same value: verified
// live that setting only lang2 (leaving lang1 at its own default of Latin) produces a two-column
// side-by-side render instead of the single-language one this pipeline needs (see
// AUDIT_GOVERNANCE_LEDGER.md's English-lane entry).
const ENGINE_LANGUAGE_NAME = { la: 'Latin', en: 'English' };

function oracleArgs(isoDate, hourKey, language = 'la') {
  const hourCommand = HOUR_COMMANDS[hourKey];
  if (!hourCommand) throw new Error(`Unknown hour key: ${hourKey}`);
  const engineLanguage = ENGINE_LANGUAGE_NAME[language];
  if (!engineLanguage) throw new Error(`Unknown language: ${language}`);
  return {
    hourCommand,
    args: [
      'web/cgi-bin/horas/officium.pl',
      'version=Rubrics 1960',
      `command=pray${hourCommand}`,
      `date=${toOfficiumDate(isoDate)}`,
      `lang1=${engineLanguage}`,
      `lang2=${engineLanguage}`,
      'dioecesis=Generale'
    ],
    options: {
      cwd: ENGINE_ROOT,
      encoding: 'utf8',
      env: { ...process.env, PERL5LIB: 'web/cgi-bin:web/DivinumOfficium' },
      maxBuffer: 16 * 1024 * 1024
    }
  };
}

function stripHeaders(raw) {
  const lines = raw.split('\n');
  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('Set-Cookie:') || lines[i].startsWith('Content-type:')) continue;
    if (lines[i].trim() === '') { bodyStart = i + 1; continue; }
    bodyStart = i;
    break;
  }
  return lines.slice(bodyStart).join('\n');
}

export function runOracle(isoDate, hourKey, language = 'la') {
  const { hourCommand, args, options } = oracleArgs(isoDate, hourKey, language);
  const raw = execFileSync('perl', args, options);
  return { html: stripHeaders(raw), commit: PINNED_COMMIT, hourCommand };
}

// Real concurrency requires the child process to run off Node's single thread while we wait --
// execFileSync blocks it, silently serializing every "concurrent" caller. This is the one the
// full-sweep pool must use.
export async function runOracleAsync(isoDate, hourKey, language = 'la') {
  const { hourCommand, args, options } = oracleArgs(isoDate, hourKey, language);
  const { stdout } = await execFileAsync('perl', args, options);
  return { html: stripHeaders(stdout), commit: PINNED_COMMIT, hourCommand };
}

export { HOUR_COMMANDS, PINNED_COMMIT, verifyPin };

if (import.meta.url === `file://${process.argv[1]}`) {
  verifyPin();
  const [, , isoDate, hourKey, language] = process.argv;
  const { html } = runOracle(isoDate, hourKey, language || 'la');
  process.stdout.write(html);
}
