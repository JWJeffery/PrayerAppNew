#!/usr/bin/env node
'use strict';

/**
 * Validation gate for saints source-of-truth files:
 * - data/saints/identities.json
 * - data/saints/commemorations.json
 *
 * Fails fast with a non-zero exit code on any error.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IDENTITIES_PATH = path.join(ROOT, 'data/saints/identities.json');
const COMMEMORATIONS_PATH = path.join(ROOT, 'data/saints/commemorations.json');

const ALLOWED_TRADITIONS = new Set(['ANG', 'LAT', 'EOR', 'OOR', 'COE']);
const ALLOWED_CALENDARS = new Set(['gregorian']); // expand later if you add julian/ge\'ez/etc.

function die(msg) {
  console.error(`\n[saints:validate] ERROR: ${msg}\n`);
  process.exit(1);
}

function readJson(p) {
  if (!fs.existsSync(p)) die(`Missing file: ${p}`);
  const raw = fs.readFileSync(p, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    die(`Invalid JSON in ${p}: ${e.message}`);
  }
}

function isPlainObject(x) {
  return x && typeof x === 'object' && !Array.isArray(x);
}

function validateIdentities(identities) {
  if (!Array.isArray(identities)) die('identities.json must be a JSON array');

  const seen = new Set();
  for (let i = 0; i < identities.length; i++) {
    const it = identities[i];
    if (!isPlainObject(it)) die(`identities[${i}] must be an object`);

    if (typeof it.id !== 'string' || !it.id.trim()) die(`identities[${i}].id must be a non-empty string`);
    if (seen.has(it.id)) die(`Duplicate identity id: "${it.id}"`);
    seen.add(it.id);

    if (typeof it.name !== 'string' || !it.name.trim()) die(`identities[${i}]("${it.id}").name must be a non-empty string`);
    if (typeof it.description !== 'string') die(`identities[${i}]("${it.id}").description must be a string (can be empty, but must exist)`);
    if (typeof it.type !== 'string' || !it.type.trim()) die(`identities[${i}]("${it.id}").type must be a non-empty string`);

    if (it.status !== undefined && typeof it.status !== 'string') die(`identities[${i}]("${it.id}").status must be a string if present`);
  }

  return seen;
}

function validateCommemorations(commemorations, identityIds) {
  if (!Array.isArray(commemorations)) die('commemorations.json must be a JSON array');

  const seenKey = new Set();

  for (let i = 0; i < commemorations.length; i++) {
    const c = commemorations[i];
    if (!isPlainObject(c)) die(`commemorations[${i}] must be an object`);

    const id = c.identity_id;
    if (typeof id !== 'string' || !id.trim()) die(`commemorations[${i}].identity_id must be a non-empty string`);
    if (!identityIds.has(id)) die(`commemorations[${i}] references unknown identity_id: "${id}"`);

    const t = c.tradition;
    if (typeof t !== 'string' || !ALLOWED_TRADITIONS.has(t)) {
      die(`commemorations[${i}]("${id}").tradition must be one of: ${Array.from(ALLOWED_TRADITIONS).join(', ')}`);
    }

    const cal = c.calendar;
    if (typeof cal !== 'string' || !ALLOWED_CALENDARS.has(cal)) {
      die(`commemorations[${i}]("${id}").calendar must be one of: ${Array.from(ALLOWED_CALENDARS).join(', ')}`);
    }

    const d = c.date;
    if (!isPlainObject(d)) die(`commemorations[${i}]("${id}").date must be an object like { month, day }`);
    if (!Number.isInteger(d.month) || d.month < 1 || d.month > 12) die(`commemorations[${i}]("${id}").date.month must be 1..12`);
    if (!Number.isInteger(d.day) || d.day < 1 || d.day > 31) die(`commemorations[${i}]("${id}").date.day must be 1..31`);

    // Uniqueness: identity × tradition × calendar × month × day must not duplicate
    const key = `${id}|${t}|${cal}|${d.month}|${d.day}`;
    if (seenKey.has(key)) die(`Duplicate commemoration key: ${key}`);
    seenKey.add(key);

    if (c.rank !== undefined && typeof c.rank !== 'string') die(`commemorations[${i}]("${id}").rank must be a string if present`);
    if (c.status !== undefined && typeof c.status !== 'string') die(`commemorations[${i}]("${id}").status must be a string if present`);
  }
}

function main() {
  const identities = readJson(IDENTITIES_PATH);
  const commemorations = readJson(COMMEMORATIONS_PATH);

  const identityIds = validateIdentities(identities);
  validateCommemorations(commemorations, identityIds);

  console.log('[saints:validate] OK');
}

main();