// Oracle for the Roman Breviary calendar core (engine rebuild, phase 2).
//
// Runs the pinned Divinum Officium engine's own precedence() step for a range of dates and
// records the resulting liturgical state (winner, commemorations, scriptura, commune, rank,
// day names, Lauds scheme, Vespers indices ...), in ONE Perl process per chunk. This is the
// exact "which office is it today" answer the new JS engine must reproduce.
//
// The engine clone must be at the pinned commit (same rule as roman-breviary-oracle-run.mjs).
// The tool works on a patched COPY of officium.pl written inside the engine clone as
// web/cgi-bin/horas/officium_state.pl (untracked); the engine's own files are never modified.
//
// Usage: node scripts/roman-breviary-oracle-state.mjs --from 2026-01-01 --to 2027-12-31 \
//          [--hora Laudes|Vespera] [--out path.json] [--chunk 60]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PINNED_COMMIT, verifyPin } from './roman-breviary-oracle-run.mjs';

export const ENGINE_ROOT = process.env.DO_ENGINE_DIR || '/home/user/divinumofficium/divinum-officium';
const TARGET = 'precedence($date1);    #fills our hashes et variables';

const DUMP = String.raw`{
  my @dates = split(/,/, $ENV{DO_DATES});
  my $hora_wanted = $ENV{DO_HORA} || 'Laudes';
  require JSON::PP;
  my $js = JSON::PP->new->canonical->utf8(0)->allow_nonref;
  foreach my $d (@dates) {
    $hora = $hora_wanted;
    # precedence() does not reset these; a fresh process starts with them unset. Reset so that
    # each date is computed as if in its own process (verified against fresh runs).
    ($vespera, $cvespera, $svesp, $tvesp, $rank, $commemorated, $initia, $laudesonly) = (undef) x 8;
    ($comrank, $litaniaflag, $octavam) = (0, 0, '');
    # The engine caches parsed data files per version with date-dependent conditionals already
    # evaluated, and keeps a global $monthday between calls. A fresh process has neither.
    %setupstring_caches_by_version = ();
    $monthday = undef;
    precedence($d);
    my %o = (
      date => $d, hora => $hora, dayofweek => $dayofweek,
      dayname => [@dayname],
      winner => $winner, commemoratio => $commemoratio, commemoratio1 => $commemoratio1,
      scriptura => $scriptura, commune => $commune, communetype => $communetype,
      rank => $rank, comrank => $comrank, duplex => $duplex, laudes => $laudes,
      vespera => $vespera, cvespera => $cvespera, svesp => $svesp, tvesp => $tvesp,
      tname => $tname, sname => $sname,
      trank => [@trank], srank => [@srank],
      commemoentries => [@commemoentries], ccommemoentries => [@ccommemoentries],
      transfervigil => $transfervigil, rule => $rule, communerule => $communerule,
      winner_rank => $winner{Rank}, commemoratio_rank => $commemoratio{Rank},
      globals => { votive => $votive, dioecesis => $dioecesis, version => $version, missanumber => $missanumber, missa => $missa, lang2 => $lang2 },
    );
    print "ORACLE-STATE " . $js->encode(\%o) . "\n";
  }
  exit;
}`;

function toOfficiumDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${m}-${d}-${y}`;
}

function* datesBetween(from, to) {
  const d = new Date(from + 'T00:00:00Z');
  const end = new Date(to + 'T00:00:00Z');
  while (d <= end) {
    yield d.toISOString().slice(0, 10);
    d.setUTCDate(d.getUTCDate() + 1);
  }
}

export function installPatchedOfficium() {
  verifyPin();
  const src = fs.readFileSync(path.join(ENGINE_ROOT, 'web/cgi-bin/horas/officium.pl'), 'utf8');
  if (src.split(TARGET).length !== 2) throw new Error('officium.pl: injection target not found exactly once');
  const out = path.join(ENGINE_ROOT, 'web/cgi-bin/horas/officium_state.pl');
  fs.writeFileSync(out, src.replace(TARGET, DUMP));
  return out;
}

export function runStateChunk(isoDates, hora = 'Laudes') {
  const script = installPatchedOfficium();
  const raw = execFileSync(
    'perl',
    [script, `version=${process.env.DO_VERSION || 'Rubrics 1960'}`, 'command=prayLaudes', `date=${toOfficiumDate(isoDates[0])}`,
      'lang1=Latin', 'lang2=Latin', 'dioecesis=Generale'],
    {
      cwd: ENGINE_ROOT,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, PERL5LIB: 'web/cgi-bin:web/DivinumOfficium', DO_HORA: hora, DO_DATES: isoDates.map(toOfficiumDate).join(',') }
    }
  );
  const rows = [];
  for (const line of raw.split('\n')) {
    if (line.startsWith('ORACLE-STATE ')) rows.push(JSON.parse(line.slice('ORACLE-STATE '.length)));
  }
  if (rows.length !== isoDates.length) throw new Error(`expected ${isoDates.length} rows, got ${rows.length}`);
  return rows.map((r, i) => ({ iso: isoDates[i], ...r }));
}

export function runStateRange(from, to, hora = 'Laudes', chunk = 60) {
  const all = [...datesBetween(from, to)];
  const rows = [];
  for (let i = 0; i < all.length; i += chunk) rows.push(...runStateChunk(all.slice(i, i + chunk), hora));
  return rows;
}

function arg(name, dflt) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : dflt;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const from = arg('from'), to = arg('to');
  if (!from || !to) { console.error('need --from and --to'); process.exit(2); }
  const hora = arg('hora', 'Laudes');
  const out = arg('out', null);
  const rows = runStateRange(from, to, hora, Number(arg('chunk', '60')));
  const doc = { schema_version: 'roman_breviary_oracle_state_v1', engine_commit: PINNED_COMMIT, version: process.env.DO_VERSION || 'Rubrics 1960 - 1960', hora, from, to, days: rows };
  if (out) { fs.writeFileSync(out, JSON.stringify(doc)); console.log(`wrote ${rows.length} days to ${out}`); }
  else console.log(JSON.stringify(rows[0], null, 1));
}
