import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'data/cycles-of-prayer';
const SCHEMA_FILE = 'schema.json';
const KEBAB_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_SUBJECT_TYPES = new Set(['parish', 'category']);
const VALID_CYCLE_TYPES = new Set(['dated', 'monthly-recurring']);

const verbose = process.argv.includes('--verbose');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${filePath} is not valid JSON: ${error.message}`);
  }
}

const findings = [];
function add(severity, file, detail) {
  findings.push({ severity, file, detail });
}

function validateSubjects(name, where, subjects) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    add('CRITICAL', name, `${where}.subjects must be a non-empty array`);
    return;
  }
  for (const [subjectIndex, subject] of subjects.entries()) {
    const subjectWhere = `${where}.subjects[${subjectIndex}]`;

    if (!VALID_SUBJECT_TYPES.has(subject.type)) {
      add('CRITICAL', name, `${subjectWhere}.type must be "parish" or "category", got ${JSON.stringify(subject.type)}`);
      continue;
    }
    if (typeof subject.name !== 'string' || subject.name.length === 0) {
      add('CRITICAL', name, `${subjectWhere}.name must be a non-empty string`);
    }
    if (subject.type === 'parish') {
      if (typeof subject.place !== 'string' || subject.place.length === 0) {
        add('CRITICAL', name, `${subjectWhere} is type "parish" but has no non-empty "place"`);
      }
    } else if (subject.place !== undefined) {
      add('MEDIUM', name, `${subjectWhere} is type "category" but carries a "place" field (categories are not tied to a congregation)`);
    }
    if (subject.note !== undefined && typeof subject.note !== 'string') {
      add('MEDIUM', name, `${subjectWhere}.note, when present, must be a string`);
    }
  }
}

function main() {
  if (!fs.existsSync(ROOT)) {
    console.error(`FAIL cycles-of-prayer validation: ${ROOT} does not exist`);
    process.exit(1);
  }

  const files = fs.readdirSync(ROOT)
    .filter((name) => name.endsWith('.json') && name !== SCHEMA_FILE)
    .sort();

  for (const name of files) {
    const filePath = path.join(ROOT, name);
    let doc;
    try {
      doc = readJson(filePath);
    } catch (error) {
      add('CRITICAL', name, error.message);
      continue;
    }

    // Filenames are <body-slug>-<diocese-slug>-<year>.json (cycleType
    // 'dated') or <body-slug>-<diocese-slug>.json (cycleType
    // 'monthly-recurring'), but both slugs may themselves contain hyphens
    // (e.g. "western-oregon"), which makes the filename ambiguous to parse
    // back apart. So validation runs the other direction: build the
    // expected filename FROM the document's own declared fields and compare
    // it to the actual filename, rather than trying to split the filename
    // and guess which hyphen belongs to what.
    for (const field of ['bodySlug', 'dioceseShort']) {
      if (typeof doc[field] !== 'string' || !KEBAB_SLUG_PATTERN.test(doc[field])) {
        add('CRITICAL', name, `"${field}" must be a non-empty kebab-case slug, got ${JSON.stringify(doc[field])}`);
      }
    }

    const cycleType = doc.cycleType === undefined ? 'dated' : doc.cycleType;
    if (!VALID_CYCLE_TYPES.has(cycleType)) {
      add('CRITICAL', name, `"cycleType", when present, must be "dated" or "monthly-recurring", got ${JSON.stringify(doc.cycleType)}`);
    }

    const expectedId = name.slice(0, -'.json'.length);
    if (doc.id !== expectedId) {
      add('HIGH', name, `id "${doc.id}" does not match filename (expected "${expectedId}")`);
    }
    if (typeof doc.bodySlug === 'string' && typeof doc.dioceseShort === 'string') {
      const expectedName = cycleType === 'monthly-recurring'
        ? `${doc.bodySlug}-${doc.dioceseShort}.json`
        : `${doc.bodySlug}-${doc.dioceseShort}-${doc.year}.json`;
      if (name !== expectedName) {
        add('HIGH', name, `filename does not match expected pattern for cycleType "${cycleType}" (expected "${expectedName}")`);
      }
    }

    for (const field of ['body', 'diocese', 'source', 'sourceFile', 'ingested']) {
      if (typeof doc[field] !== 'string' || doc[field].length === 0) {
        add('CRITICAL', name, `missing or empty required string field "${field}"`);
      }
    }
    if (cycleType === 'monthly-recurring') {
      if (doc.year !== undefined) {
        add('HIGH', name, '"year" must be absent for cycleType "monthly-recurring" (a standing monthly cycle has no year)');
      }
    } else if (!Number.isInteger(doc.year)) {
      add('CRITICAL', name, '"year" must be an integer');
    }
    if (doc.notes !== undefined && !Array.isArray(doc.notes)) {
      add('HIGH', name, '"notes", when present, must be an array');
    }

    if (!Array.isArray(doc.entries) || doc.entries.length === 0) {
      add('CRITICAL', name, '"entries" must be a non-empty array');
      continue;
    }

    if (cycleType === 'monthly-recurring') {
      let previousDay = null;
      const seenDays = new Set();
      for (const [index, entry] of doc.entries.entries()) {
        const where = `entries[${index}]`;

        if (!Number.isInteger(entry.day) || entry.day < 1 || entry.day > 31) {
          add('CRITICAL', name, `${where}.day must be an integer 1-31, got ${JSON.stringify(entry.day)}`);
        } else {
          if (seenDays.has(entry.day)) {
            add('HIGH', name, `${where}.day "${entry.day}" is a duplicate of an earlier entry`);
          }
          seenDays.add(entry.day);
          if (previousDay !== null && entry.day < previousDay) {
            add('HIGH', name, `${where}.day "${entry.day}" is out of ascending order (previous entry was "${previousDay}")`);
          }
          previousDay = entry.day;
        }

        if (entry.liturgicalNote !== undefined && entry.liturgicalNote !== null && typeof entry.liturgicalNote !== 'string') {
          add('HIGH', name, `${where}.liturgicalNote must be a string or null, got ${JSON.stringify(entry.liturgicalNote)}`);
        }

        validateSubjects(name, where, entry.subjects);
      }
      continue;
    }

    let previousDate = null;
    const seenDates = new Set();
    for (const [index, entry] of doc.entries.entries()) {
      const where = `entries[${index}]`;

      if (typeof entry.date !== 'string' || !DATE_PATTERN.test(entry.date)) {
        add('CRITICAL', name, `${where}.date must be an ISO date string (YYYY-MM-DD), got ${JSON.stringify(entry.date)}`);
      } else {
        if (seenDates.has(entry.date)) {
          add('HIGH', name, `${where}.date "${entry.date}" is a duplicate of an earlier entry`);
        }
        seenDates.add(entry.date);
        if (previousDate !== null && entry.date < previousDate) {
          add('HIGH', name, `${where}.date "${entry.date}" is out of chronological order (previous entry was "${previousDate}")`);
        }
        previousDate = entry.date;
      }

      if (entry.liturgicalNote !== null && typeof entry.liturgicalNote !== 'string') {
        add('HIGH', name, `${where}.liturgicalNote must be a string or null, got ${JSON.stringify(entry.liturgicalNote)}`);
      }

      validateSubjects(name, where, entry.subjects);
    }
  }

  const blocking = findings.filter((finding) => finding.severity === 'CRITICAL' || finding.severity === 'HIGH');

  if (blocking.length > 0) {
    console.error(`FAIL cycles-of-prayer validation: files=${files.length} blocking=${blocking.length} findings=${findings.length}`);
    for (const finding of findings) {
      console.error(`${finding.severity} | ${finding.file} | ${finding.detail}`);
    }
    process.exit(1);
  }

  if (verbose) {
    console.log(JSON.stringify({ status: 'PASS', filesChecked: files.length, findings: findings.length }, null, 2));
  } else {
    console.log(`PASS cycles-of-prayer validation: files=${files.length} blocking=0`);
  }
}

main();
