#!/usr/bin/env node
/**
 * tools/import_legacy_saints.js
 *
 * One-time importer to migrate legacy runtime cache files:
 *   data/saints/saints-{month}.json
 *
 * Into normalized sources:
 *   data/saints/identities.json
 *   data/saints/commemorations.json
 *
 * Then the generator (tools/build_saints_cache.js) becomes the repeatable way
 * to produce saints-{month}.json going forward.
 *
 * Usage:
 *   node tools/import_legacy_saints.js
 *
 * Safe merge rules:
 * - Uses legacy record `id` as identity id.
 * - Identity fields (name/description/type) are merged conservatively:
 *     * If existing is empty and incoming is non-empty → fill existing.
 *     * If both non-empty but different → warn and keep existing.
 * - Commemorations are emitted ONLY for concrete tradition codes:
 *     ANG, LAT, EOR, OOR, COE
 *   (ECU tags are ignored as a commemoration; ECU is a derived display label.)
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ── Constants ────────────────────────────────────────────────────────────────
const ALL_TRADITIONS = new Set(["ANG", "LAT", "EOR", "OOR", "COE"]);

const MONTH_SLUGS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

const MONTH_NAMES = [
  "", // 1-indexed
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Paths (cwd-independent)
const ROOT = path.resolve(__dirname, "..");
const SAINTS_DIR = path.join(ROOT, "data", "saints");
const IDENTITIES_PATH = path.join(SAINTS_DIR, "identities.json");
const COMMEMORATIONS_PATH = path.join(SAINTS_DIR, "commemorations.json");

// ── Small helpers ────────────────────────────────────────────────────────────
function die(msg) {
  process.stderr.write(msg + "\n");
  process.exit(1);
}

function loadJson(p, fallback) {
  try {
    const txt = fs.readFileSync(p, "utf8");
    return JSON.parse(txt);
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0;
}

function normalizeType(t) {
  if (!isNonEmptyString(t)) return "saint";
  return String(t).trim();
}

function normalizeName(n, idForWarn) {
  if (isNonEmptyString(n)) return String(n).trim();
  process.stderr.write(`WARN: identity "${idForWarn}" missing name; using id as name\n`);
  return idForWarn;
}

function normalizeDescription(d, idForWarn) {
  if (isNonEmptyString(d)) return String(d).trim();
  process.stderr.write(`WARN: identity "${idForWarn}" missing description; inserting placeholder\n`);
  return "TODO: description missing.";
}

/**
 * Parses legacy `day` strings like:
 *  - "February 21"
 *  - "February 21, 2026"
 *  - "February 21 (something)"
 * Returns { month: N, day: D } or null (with warning).
 */
function parseLegacyDay(dayStr, recordIdForWarn) {
  if (!isNonEmptyString(dayStr)) {
    process.stderr.write(`WARN: record "${recordIdForWarn}" missing day string\n`);
    return null;
  }

  const s = String(dayStr).trim();
  // match leading "MonthName <dayNumber>"
  const m = s.match(/^([A-Za-z]+)\s+(\d{1,2})\b/);
  if (!m) {
    process.stderr.write(`WARN: record "${recordIdForWarn}" has unparseable day "${s}"\n`);
    return null;
  }

  const monthName = m[1].toLowerCase();
  const dayNum = parseInt(m[2], 10);

  const monthNum = MONTH_SLUGS[monthName];
  if (!monthNum || !(dayNum >= 1 && dayNum <= 31)) {
    process.stderr.write(`WARN: record "${recordIdForWarn}" has invalid day "${s}"\n`);
    return null;
  }

  return { month: monthNum, day: dayNum };
}

function listLegacySaintFiles() {
  const entries = fs.readdirSync(SAINTS_DIR, { withFileTypes: true });
  const files = entries
    .filter(e => e.isFile())
    .map(e => e.name)
    // only saints-*.json (exclude audit files; exclude normalized sources)
    .filter(name =>
      /^saints-[a-z]+\.json$/i.test(name) &&
      name.toLowerCase() !== "saints_audit.json" &&
      name.toLowerCase() !== "saints_audit.csv"
    )
    .sort((a, b) => a.localeCompare(b, "en"));

  if (files.length === 0) {
    die(`ERROR: no legacy files found in ${path.relative(ROOT, SAINTS_DIR)} matching saints-*.json`);
  }
  return files;
}

function monthFromFilename(filename) {
  const m = filename.toLowerCase().match(/^saints-([a-z]+)\.json$/);
  if (!m) return null;
  const slug = m[1];
  return MONTH_SLUGS[slug] || null;
}

function mergeIdentity(existing, incoming, id) {
  // Merge name
  if (!isNonEmptyString(existing.name) && isNonEmptyString(incoming.name)) {
    existing.name = incoming.name;
  } else if (isNonEmptyString(existing.name) && isNonEmptyString(incoming.name) && existing.name !== incoming.name) {
    process.stderr.write(`WARN: identity "${id}" name conflict; keeping existing\n`);
  }

  // Merge description
  if (!isNonEmptyString(existing.description) && isNonEmptyString(incoming.description)) {
    existing.description = incoming.description;
  } else if (isNonEmptyString(existing.description) && isNonEmptyString(incoming.description) && existing.description !== incoming.description) {
    process.stderr.write(`WARN: identity "${id}" description conflict; keeping existing\n`);
  }

  // Merge type
  if (!isNonEmptyString(existing.type) && isNonEmptyString(incoming.type)) {
    existing.type = incoming.type;
  } else if (isNonEmptyString(existing.type) && isNonEmptyString(incoming.type) && existing.type !== incoming.type) {
    process.stderr.write(`WARN: identity "${id}" type conflict; keeping existing\n`);
  }

  return existing;
}

// ── Main import ──────────────────────────────────────────────────────────────
function main() {
  // Load existing normalized sources if present (merge into them)
  const identities = loadJson(IDENTITIES_PATH, []);
  const commemorations = loadJson(COMMEMORATIONS_PATH, []);

  if (!Array.isArray(identities)) die("ERROR: data/saints/identities.json must be an array");
  if (!Array.isArray(commemorations)) die("ERROR: data/saints/commemorations.json must be an array");

  // Index existing identities
  const identityMap = new Map();
  for (const i of identities) {
    if (!i || typeof i !== "object" || !isNonEmptyString(i.id)) {
      die(`ERROR: identities.json contains invalid identity: ${JSON.stringify(i)}`);
    }
    identityMap.set(i.id, i);
  }

  // Index existing commemorations for dedup
  const commKeySet = new Set();
  for (const c of commemorations) {
    if (!c?.identity_id || !c?.tradition || !c?.date) {
      die(`ERROR: commemorations.json contains invalid commemoration: ${JSON.stringify(c)}`);
    }
    const key = `${c.identity_id}::${c.date.month}::${c.date.day}::${c.tradition}`;
    commKeySet.add(key);
  }

  const legacyFiles = listLegacySaintFiles();

  let importedIdentityCount = 0;
  let importedCommCount = 0;

  const perMonth = new Map(); // monthNum -> { recs, comms }
  for (const f of legacyFiles) {
    const monthNum = monthFromFilename(f);
    if (!monthNum) continue;

    const filePath = path.join(SAINTS_DIR, f);
    const arr = loadJson(filePath, null);
    if (!Array.isArray(arr)) {
      process.stderr.write(`WARN: ${f} is not an array; skipping\n`);
      continue;
    }

    let monthRecCount = 0;
    let monthCommCount = 0;

    for (const rec of arr) {
      monthRecCount++;

      const id = rec?.id;
      if (!isNonEmptyString(id)) {
        process.stderr.write(`WARN: ${f} contains record missing id; skipping: ${JSON.stringify(rec)}\n`);
        continue;
      }

      // Build/merge identity
      const incomingIdentity = {
        id: id.trim(),
        name: normalizeName(rec?.name, id.trim()),
        description: normalizeDescription(rec?.description, id.trim()),
        type: normalizeType(rec?.type),
      };

      if (identityMap.has(incomingIdentity.id)) {
        const existing = identityMap.get(incomingIdentity.id);
        mergeIdentity(existing, incomingIdentity, incomingIdentity.id);
      } else {
        identityMap.set(incomingIdentity.id, incomingIdentity);
        importedIdentityCount++;
      }

      // Parse day into normalized date
      const parsed = parseLegacyDay(rec?.day, incomingIdentity.id);
      if (!parsed) continue;

      // Determine commemoration traditions from tags
      const tags = Array.isArray(rec?.tags) ? rec.tags : [];
      const traditions = tags
        .map(t => (typeof t === "string" ? t.trim().toUpperCase() : ""))
        .filter(t => ALL_TRADITIONS.has(t));

      if (traditions.length === 0) {
        // Legacy data may have ecumenical-ish things without explicit tags; warn and skip comms
        process.stderr.write(`WARN: record "${incomingIdentity.id}" on "${rec?.day}" has no concrete tradition tags; skipping commemorations\n`);
        continue;
      }

      // Emit one commemoration per tradition tag
      for (const tr of new Set(traditions)) {
        const key = `${incomingIdentity.id}::${parsed.month}::${parsed.day}::${tr}`;
        if (commKeySet.has(key)) continue;

                commemorations.push({
          identity_id: incomingIdentity.id,
          tradition: tr,
          calendar: "gregorian",
          date: { month: parsed.month, day: parsed.day },
        });

        commKeySet.add(key);
        importedCommCount++;
        monthCommCount++;
      }
    }

    perMonth.set(monthNum, { records: arr.length, commsAdded: monthCommCount });

    // Minimal per-file reporting
    process.stdout.write(
      `imported ${f}: scanned ${monthRecCount} records, added ${monthCommCount} commemorations\n`
    );
  }

  // Materialize identities array, sorted deterministically
  const mergedIdentities = [...identityMap.values()].map(i => ({
    id: i.id,
    name: normalizeName(i.name, i.id),
    description: normalizeDescription(i.description, i.id),
    type: normalizeType(i.type),
    ...(i.status ? { status: i.status } : {}), // preserve if present
    ...(i.verification_status ? { verification_status: i.verification_status } : {}), // preserve if present
    ...(i.notes ? { notes: i.notes } : {}),
  }));

  mergedIdentities.sort((a, b) => a.id.localeCompare(b.id, "en"));

  // Deterministic comm sort
  commemorations.sort((a, b) => {
    if (a.date.month !== b.date.month) return a.date.month - b.date.month;
    if (a.date.day !== b.date.day) return a.date.day - b.date.day;
    if (a.tradition !== b.tradition) return a.tradition.localeCompare(b.tradition, "en");
    return a.identity_id.localeCompare(b.identity_id, "en");
  });

  // Write back normalized sources
  writeJson(IDENTITIES_PATH, mergedIdentities);
  writeJson(COMMEMORATIONS_PATH, commemorations);

  // Summary
  process.stdout.write("\n");
  process.stdout.write(`identities: now ${mergedIdentities.length} total (added ${importedIdentityCount})\n`);
  process.stdout.write(`commemorations: now ${commemorations.length} total (added ${importedCommCount})\n`);

  // Month coverage summary (based on commemorations.json after import)
  const monthsPresent = [...new Set(commemorations.map(c => c.date.month))].sort((a, b) => a - b);
  const monthLabels = monthsPresent.map(m => MONTH_NAMES[m]).join(", ");
  process.stdout.write(`months present in commemorations: ${monthLabels || "(none)"}\n`);
}

main();