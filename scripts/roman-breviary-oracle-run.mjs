import { execFileSync } from 'node:child_process';

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

export function runOracle(isoDate, hourKey) {
  const hourCommand = HOUR_COMMANDS[hourKey];
  if (!hourCommand) throw new Error(`Unknown hour key: ${hourKey}`);

  const raw = execFileSync(
    'perl',
    [
      'web/cgi-bin/horas/officium.pl',
      'version=Rubrics 1960',
      `command=pray${hourCommand}`,
      `date=${toOfficiumDate(isoDate)}`,
      'lang2=Latin',
      'dioecesis=Generale'
    ],
    {
      cwd: ENGINE_ROOT,
      encoding: 'utf8',
      env: { ...process.env, PERL5LIB: 'web/cgi-bin:web/DivinumOfficium' },
      maxBuffer: 16 * 1024 * 1024
    }
  );

  const lines = raw.split('\n');
  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('Set-Cookie:') || lines[i].startsWith('Content-type:')) continue;
    if (lines[i].trim() === '') { bodyStart = i + 1; continue; }
    bodyStart = i;
    break;
  }
  return { html: lines.slice(bodyStart).join('\n'), commit: PINNED_COMMIT, hourCommand };
}

export { HOUR_COMMANDS, PINNED_COMMIT, verifyPin };

if (import.meta.url === `file://${process.argv[1]}`) {
  verifyPin();
  const [, , isoDate, hourKey] = process.argv;
  const { html } = runOracle(isoDate, hourKey);
  process.stdout.write(html);
}
