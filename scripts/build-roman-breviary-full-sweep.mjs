import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runOracleAsync, verifyPin, HOUR_COMMANDS, PINNED_COMMIT } from './roman-breviary-oracle-run.mjs';
import { parseOfficiumHtml } from './parse-officium-html.mjs';
import { buildBlocksAndUnits } from './build-roman-breviary-oracle-blocks.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = path.join(__dirname, '..', 'data', 'roman-breviary-1960-1962');

const HOUR_LABELS = {
  matins: 'Matutinum',
  lauds: 'Laudes',
  prime: 'Prima',
  terce: 'Tertia',
  sext: 'Sexta',
  none: 'Nona',
  vespers: 'Vespera',
  compline: 'Completorium'
};

function* datesInYear(year) {
  const d = new Date(Date.UTC(year, 0, 1));
  while (d.getUTCFullYear() === year) {
    yield d.toISOString().slice(0, 10);
    d.setUTCDate(d.getUTCDate() + 1);
  }
}

async function pool(items, concurrency, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

async function buildYear(year, concurrency) {
  const dates = [...datesInYear(year)];
  const jobs = [];
  for (const date of dates) {
    for (const hourKey of Object.keys(HOUR_COMMANDS)) {
      jobs.push({ date, hourKey });
    }
  }

  const units = {};
  const days = {};
  let errorCount = 0;
  const errors = [];

  await pool(jobs, concurrency, async ({ date, hourKey }) => {
    let html;
    try {
      ({ html } = await runOracleAsync(date, hourKey));
    } catch (err) {
      errorCount++;
      errors.push({ date, hourKey, error: err.message });
      return;
    }
    const { rankLine, sections, diagnostics } = parseOfficiumHtml(html);
    const { blocks, units: sectionUnits } = buildBlocksAndUnits(sections, {
      repo: 'DivinumOfficium/divinum-officium',
      commit: PINNED_COMMIT,
      date,
      hour: hourKey
    });

    for (const [key, unit] of Object.entries(sectionUnits)) {
      if (!units[key]) units[key] = unit;
    }

    if (!days[date]) days[date] = { rank: rankLine, hours: {} };
    days[date].hours[hourKey] = {
      label: HOUR_LABELS[hourKey],
      blocks: blocks.map(({ role, label, nocturn, nocturnLabel, unit_refs, omitted }) => ({
        role, label, ...(nocturn ? { nocturn, nocturnLabel } : {}), unit_refs, ...(omitted ? { omitted } : {})
      })),
      diagnostics
    };
  });

  return { units, days, errorCount, errors, dayCount: dates.length };
}

async function main() {
  verifyPin();
  const years = process.argv.slice(2).map(Number).filter(Boolean);
  const targetYears = years.length ? years : [2026, 2027];
  const concurrency = Number(process.env.ORACLE_CONCURRENCY || 12);

  for (const year of targetYears) {
    const startedAt = Date.now();
    const { units, days, errorCount, errors, dayCount } = await buildYear(year, concurrency);
    const elapsedS = ((Date.now() - startedAt) / 1000).toFixed(1);

    const manifest = {
      schema_version: 'roman_breviary_1960_1962_manifest_v2',
      source_pin: { repo: 'DivinumOfficium/divinum-officium', commit: PINNED_COMMIT },
      tradition: 'roman_catholic',
      office_family: 'roman_breviary',
      edition_or_recension: 'rubrics_1960_1962',
      language: 'la',
      calendar_scope: 'general',
      year,
      days
    };
    const unitsFile = {
      schema_version: 'roman_breviary_1960_1962_units_v2',
      source_pin: { repo: 'DivinumOfficium/divinum-officium', commit: PINNED_COMMIT },
      tradition: 'roman_catholic',
      office_family: 'roman_breviary',
      edition_or_recension: 'rubrics_1960_1962',
      language: 'la',
      units
    };

    fs.writeFileSync(path.join(DATA_ROOT, 'manifests', `${year}.json`), JSON.stringify(manifest, null, 2));
    fs.writeFileSync(path.join(DATA_ROOT, 'units', `${year}.json`), JSON.stringify(unitsFile, null, 2));

    console.log(`Year ${year}: ${dayCount} days x 8 hours, ${Object.keys(units).length} unique units, ${errorCount} errors, ${elapsedS}s`);
    if (errors.length) console.log('ERRORS:', JSON.stringify(errors.slice(0, 20)));
  }
}

main();
