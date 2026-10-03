// Oracle for the Roman Breviary data-file reader (engine rebuild, phase 2).
//
// For a list of dates and Latin data files, runs the pinned Divinum Officium engine's own
// setupstring() and officestring() under the same global state precedence() starts with, and
// records an md5 per section of the resolved result. The JS reader must reproduce every digest.
// Same engine-clone rules as roman-breviary-oracle-state.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { verifyPin } from './roman-breviary-oracle-run.mjs';

export const ENGINE_ROOT = process.env.DO_ENGINE_DIR || '/home/user/divinumofficium/divinum-officium';
const TARGET = 'precedence($date1);    #fills our hashes et variables';

const DUMP = String.raw`{
  my @dates = split(/,/, $ENV{DO_DATES});
  my @files = split(/,/, $ENV{DO_FILES});
  my $hora_wanted = $ENV{DO_HORA} || 'Laudes';
  require JSON::PP; require Digest::MD5;
  my $js = JSON::PP->new->canonical->utf8(0)->allow_nonref;
  foreach my $d (@dates) {
    $hora = $hora_wanted;
    %setupstring_caches_by_version = ();
    $monthday = undef;
    ($winner, $commemoratio, $commemoratio1, $commune, $scriptura) = ('') x 5;
    (%winner, %commemoratio, %commemoratio1, %commune, %scriptura) = ();
    $date1 = $d; $d =~ s/\//-/g;
    ($month, $day, $year) = split('-', $d);
    $dayofweek = day_of_week($day, $month, $year);
    @dayname = (getweek($day, $month, $year, 0, $missa), '', '');
    foreach my $f (@files) {
      foreach my $kind ('setup', 'office0', 'office1') {
        $monthday = undef;
        my $h = $kind eq 'setup' ? setupstring('Latin', $f)
              : $kind eq 'office0' ? officestring('Latin', $f)
              : officestring('Latin', $f, 1);
        my %o = (date => $d, hora => $hora, file => $f, kind => $kind, found => ($h && %$h) ? 1 : 0, monthday => $monthday);
        if ($h && %$h) { foreach my $k (keys %$h) { $o{sections}{$k} = $ENV{DO_FULL} ? (defined $h->{$k} ? $h->{$k} : '') : Digest::MD5::md5_hex(Encode::encode('UTF-8', defined $h->{$k} ? $h->{$k} : '')); } }
        print "ORACLE-FILE " . $js->encode(\%o) . "\n";
      }
    }
  }
  exit;
}`;

export function runFiles(isoDates, files, hora = 'Laudes', full = false) {
  verifyPin();
  const src = fs.readFileSync(path.join(ENGINE_ROOT, 'web/cgi-bin/horas/officium.pl'), 'utf8');
  if (src.split(TARGET).length !== 2) throw new Error('injection target not found exactly once');
  const script = path.join(ENGINE_ROOT, 'web/cgi-bin/horas/officium_files.pl');
  fs.writeFileSync(script, src.replace(TARGET, 'use Encode;\n' + DUMP));
  const toO = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${m}-${d}-${y}`; };
  const raw = execFileSync(
    'perl',
    [script, 'version=Rubrics 1960', 'command=prayLaudes', `date=${toO(isoDates[0])}`, 'lang1=Latin', 'lang2=Latin', 'dioecesis=Generale'],
    {
      cwd: ENGINE_ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024,
      env: { ...process.env, PERL5LIB: 'web/cgi-bin:web/DivinumOfficium', DO_HORA: hora, DO_FULL: full ? '1' : '', DO_DATES: isoDates.map(toO).join(','), DO_FILES: files.join(',') }
    }
  );
  const rows = [];
  for (const line of raw.split('\n')) if (line.startsWith('ORACLE-FILE ')) rows.push(JSON.parse(line.slice(12)));
  return rows;
}
