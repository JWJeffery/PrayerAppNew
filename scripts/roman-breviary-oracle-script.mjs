// Oracle for the Roman Breviary hour assembly (engine rebuild, phase 3).
//
// Runs the pinned Divinum Officium engine's own horas() for a range of dates and hours in ONE Perl
// process, and records the "script" array that specials() produces for the hour (the template
// lines of Ordinarium/<hour>.txt filled with the day's content, before @/$/& references are
// expanded and before HTML is made). Optionally also records the resolved HTML cells.
//
// Works on patched COPIES of officium.pl and horas.pl written next to the originals inside the
// engine clone (untracked); the engine's own files are never modified.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { verifyPin } from './roman-breviary-oracle-run.mjs';

export const ENGINE_ROOT = process.env.DO_ENGINE_DIR || '/home/user/divinumofficium/divinum-officium';
const HORAS_DIR = path.join(ENGINE_ROOT, 'web/cgi-bin/horas');
const TARGET = 'precedence($date1);    #fills our hashes et variables';
const REQ = 'require "$Bin/horas.pl";';
const PRINT = 'print_content($lang1, \\@script1, $lang2, \\@script2, $version !~ /(1570|1955|196|Altovadensis)/);';

const LOOP = String.raw`{
  my @dates = split(/,/, $ENV{DO_DATES});
  my @horas_wanted = split(/,/, $ENV{DO_HORAS});
  require JSON::PP;
  our $js = JSON::PP->new->canonical->utf8(0)->allow_nonref;
  load_languages_data($lang1, $lang2, $langfb, $version, $missa);
  our $oracle_html = $ENV{DO_HTML} ? 1 : 0;
  foreach my $d (@dates) {
    foreach my $h (@horas_wanted) {
      %setupstring_caches_by_version = ();
      $monthday = undef;
      ($vespera, $cvespera, $svesp, $tvesp, $rank, $commemorated, $initia, $laudesonly) = (undef) x 8;
      ($comrank, $litaniaflag, $octavam) = (0, 0, '');
      $searchind = 0;
      # horas.pl declares 'my $ant, $ant2;' and 'my $ant, $duplexf;', which make $ant2/$duplexf package
      # globals that keep a value between hours; a fresh request would start with them unset.
      $ant2 = undef; $duplexf = undef;
      $psalmnum1 = 0; $psalmnum2 = 0; $incipitTone = undef; $expandind = 0;
      $hora = $h;
      our $oracle_ctx = { date => $d, hora => $h };
      # horas() sometimes calls precedence() with no argument, which reads the CGI 'date' parameter
      # (the command-line date); keep that parameter equal to the date being computed.
      $q->param('date', $d); $q->param('date1', $d);
      precedence($d);
      setsecondcol();
      # officium.pl loads the language tables AFTER precedence() has filled the day's variables, and
      # Prayers.txt holds conditional lines that depend on them; so reload for every date.
      load_languages_data($lang1, $lang2, $langfb, $version, $missa);
      horas($h);
    }
  }
  exit;
}`;

const DUMP = String.raw`{
  my @copy = @script1;
  my $html = '';
  if ($oracle_html) {
    my $buf = '';
    open(my $fh, '>:utf8', \$buf) or die;
    my $old = select($fh);
    print_content($lang1, \@script1, $lang2, \@script2, $version !~ /(1570|1955|196|Altovadensis)/);
    select($old);
    close($fh);
    utf8::decode($buf);
    $html = $buf;
  }
  my %o = (%$oracle_ctx, script => \@copy, html => $html, globals => { largefont => $largefont, redfont => $redfont, smallfont => $smallfont, smallblack => $smallblack, blackfont => $blackfont, initiale => $initiale, priest => $priest, expand => $expand, only => $only, langfb => $langfb, precesferiales => $precesferiales, oldhymns => $oldhymns, nofancychars => $nofancychars, column => $column, lang1 => $lang1, lang2 => $lang2, dioecesis => $dioecesis, votive => $votive, psalmvar => $psalmvar, nonumbers => $nonumbers, noflexa => $noflexa, noinnumbers => $noinnumbers, officium => $officium, command => $command, textwidth => $textwidth, border => $border, background => $background });
  print "ORACLE-SCRIPT " . $js->encode(\%o) . "\n";
}`;

export function installPatched() {
  verifyPin();
  const off = fs.readFileSync(path.join(HORAS_DIR, 'officium.pl'), 'utf8');
  const horas = fs.readFileSync(path.join(HORAS_DIR, 'horas.pl'), 'utf8');
  if (off.split(TARGET).length !== 2 || off.split(REQ).length !== 2) throw new Error('officium.pl injection targets not found exactly once');
  if (horas.split(PRINT).length !== 2) throw new Error('horas.pl print_content target not found exactly once');
  fs.writeFileSync(path.join(HORAS_DIR, 'horas_script.pl'), horas.replace(PRINT, DUMP));
  const script = path.join(HORAS_DIR, 'officium_script.pl');
  fs.writeFileSync(script, off.replace(REQ, 'require "$Bin/horas_script.pl";').replace(TARGET, LOOP));
  return script;
}

const toO = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${m}-${d}-${y}`; };

export function runScripts(isoDates, horas = ['Laudes'], opts = {}) {
  const script = installPatched();
  const raw = execFileSync(
    'perl',
    [script, 'version=Rubrics 1960', 'command=prayLaudes', `date=${toO(isoDates[0])}`, 'lang1=Latin', 'lang2=Latin', 'dioecesis=Generale'],
    {
      cwd: ENGINE_ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024,
      env: { ...process.env, PERL5LIB: 'web/cgi-bin:web/DivinumOfficium', DO_DATES: isoDates.map(toO).join(','), DO_HORAS: horas.join(','), DO_HTML: opts.html ? '1' : '' }
    }
  );
  const rows = [];
  for (const line of raw.split('\n')) if (line.startsWith('ORACLE-SCRIPT ')) rows.push(JSON.parse(line.slice(14)));
  return rows;
}
