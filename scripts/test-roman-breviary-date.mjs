// Differential test: JS date/calendar arithmetic vs the pinned Perl engine's Date.pm.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { verifyPin } from './roman-breviary-oracle-run.mjs';
const require = createRequire(import.meta.url);
const D = require('../js/roman-breviary/date.js').date;
const ENGINE = process.env.DO_ENGINE_DIR || '/home/user/divinumofficium/divinum-officium';
verifyPin();
const years = [1962, 1999, 2000, 2008, 2024, 2026, 2027, 2028, 2035, 2038, 2040, 2095, 2100];
const perl = `
use lib '${ENGINE}/web/cgi-bin';
use DivinumOfficium::Date qw(getweek geteaster monthday get_sday nextday day_of_week leapyear);
for my $y (${years.join(',')}) {
  my @e = geteaster($y); print "E $y @e\\n";
  my @ml = (31,28,31,30,31,30,31,31,30,31,30,31); $ml[1]=29 if leapyear($y);
  for my $m (1..12) { for my $d (1..$ml[$m-1]) {
    print join('|', 'D', $y, $m, $d, getweek($d,$m,$y,0,0), getweek($d,$m,$y,1,0), monthday($d,$m,$y,1,0), monthday($d,$m,$y,1,1), monthday($d,$m,$y,0,0), nextday($m,$d,$y), get_sday($m,$d,$y), day_of_week($d,$m,$y)), "\\n";
  } }
}`;
const out = execFileSync('perl', ['-e', perl], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
let n = 0, bad = 0;
for (const line of out.trim().split('\n')) {
  n++;
  if (line.startsWith('E ')) {
    const p = line.split(' ');
    const e = D.geteaster(+p[1]);
    if (e.join(' ') !== p.slice(2).join(' ')) { bad++; console.log('EASTER', line, e); }
    continue;
  }
  const p = line.split('|');
  const [y, m, d] = [+p[1], +p[2], +p[3]];
  const got = [D.getweek(d, m, y, 0, 0), D.getweek(d, m, y, 1, 0), D.monthday(d, m, y, 1, 0), D.monthday(d, m, y, 1, 1), D.monthday(d, m, y, 0, 0), D.nextday(m, d, y), D.get_sday(m, d, y), D.day_of_week(d, m, y)].map(String);
  const exp = p.slice(4);
  if (got.join('|') !== exp.join('|')) { bad++; if (bad < 10) console.log('DIFF', y, m, d, got.join('|'), '!=', exp.join('|')); }
}
console.log(`date test: ${n} records (${years.length} years), mismatches ${bad}`);
process.exit(bad ? 1 : 0);
