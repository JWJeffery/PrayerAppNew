// Oracle for the Roman Breviary calendar tables (engine rebuild, phase 2): for every day of the
// given years, the pinned engine's get_from_directorium() and transfered() answers.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { verifyPin } from './roman-breviary-oracle-run.mjs';

export const ENGINE_ROOT = process.env.DO_ENGINE_DIR || '/home/user/divinumofficium/divinum-officium';
const TARGET = 'precedence($date1);    #fills our hashes et variables';
const DUMP = String.raw`{
  my @years = split(/,/, $ENV{DO_YEARS});
  require JSON::PP;
  my $js = JSON::PP->new->canonical->utf8(0)->allow_nonref;
  my $v = 'Rubrics 1960 - 1960';
  foreach my $y (@years) {
    my @ml = (31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31); $ml[1] = 29 if leapyear($y);
    for my $m (1 .. 12) { for my $d (1 .. $ml[$m - 1]) {
      my $sday = get_sday($m, $d, $y);
      my $week = getweek($d, $m, $y, 0, 0);
      my $dow = day_of_week($d, $m, $y);
      my $tday = "Tempora/$week" . (($week !~ /Nat/i) ? "-$dow" : "");
      my %o = (y => $y, m => $m, d => $d, sday => $sday, tday => $tday,
        kal => get_from_directorium('kalendar', $v, $sday),
        perm => get_from_directorium('tempora', $v, $sday, 0),
        tr => get_from_directorium('transfer', $v, $sday, $y),
        str => get_from_directorium('stransfer', $v, $sday, $y),
        ttr => get_from_directorium('transfer', $v, $tday, $y),
        tperm => get_from_directorium('tempora', $v, $tday, 0),
        trd_s => transfered("Sancti/$sday", $y, $v),
        trd_t => transfered($tday, $y, $v),
        nextday => nextday($m, $d, $y));
      print "ORACLE-DIR " . $js->encode(\%o) . "\n";
    } }
  }
  exit;
}`;

export function runDir(years) {
  verifyPin();
  const src = fs.readFileSync(path.join(ENGINE_ROOT, 'web/cgi-bin/horas/officium.pl'), 'utf8');
  if (src.split(TARGET).length !== 2) throw new Error('injection target not found exactly once');
  const script = path.join(ENGINE_ROOT, 'web/cgi-bin/horas/officium_dir.pl');
  fs.writeFileSync(script, src.replace(TARGET, DUMP));
  const raw = execFileSync('perl', [script, 'version=Rubrics 1960', 'command=prayLaudes', 'date=1-1-2026', 'lang1=Latin', 'lang2=Latin', 'dioecesis=Generale'], {
    cwd: ENGINE_ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024,
    env: { ...process.env, PERL5LIB: 'web/cgi-bin:web/DivinumOfficium', DO_YEARS: years.join(',') }
  });
  const rows = [];
  for (const line of raw.split('\n')) if (line.startsWith('ORACLE-DIR ')) rows.push(JSON.parse(line.slice(11)));
  return rows;
}
