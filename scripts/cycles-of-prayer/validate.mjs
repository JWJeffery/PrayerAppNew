import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'data/cycles-of-prayer';
const SCHEMA_FILE = 'schema.json';
const KEBAB_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_SUBJECT_TYPES = new Set(['parish', 'category', 'household', 'diocese', 'province']);
const VALID_CYCLE_TYPES = new Set(['dated', 'monthly-recurring', 'annual-recurring', 'ordinal-sunday-monthly', 'week-of-year-recurring', 'day-of-week-recurring']);
const NO_YEAR_CYCLE_TYPES = new Set(['monthly-recurring', 'annual-recurring', 'ordinal-sunday-monthly', 'week-of-year-recurring', 'day-of-week-recurring']);
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Feb allows 29 (leap day), never checked against a real year here
const VALID_SCOPES = new Set(['diocese', 'parish', 'communion']);

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
      add('MEDIUM', name, `${subjectWhere} is type "${subject.type}" but carries a "place" field (only "parish" subjects are tied to a place)`);
    }
    if (subject.type === 'diocese') {
      if (typeof subject.province !== 'string' || subject.province.length === 0) {
        add('CRITICAL', name, `${subjectWhere} is type "diocese" but has no non-empty "province"`);
      }
    } else if (subject.province !== undefined) {
      add('MEDIUM', name, `${subjectWhere} is type "${subject.type}" but carries a "province" field (only "diocese" subjects have a separate province)`);
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

    const cycleType = doc.cycleType === undefined ? 'dated' : doc.cycleType;
    if (!VALID_CYCLE_TYPES.has(cycleType)) {
      add('CRITICAL', name, `"cycleType", when present, must be "dated", "monthly-recurring", "annual-recurring", "ordinal-sunday-monthly", "week-of-year-recurring", or "day-of-week-recurring", got ${JSON.stringify(doc.cycleType)}`);
    }

    const scope = doc.scope === undefined ? 'diocese' : doc.scope;
    if (!VALID_SCOPES.has(scope)) {
      add('CRITICAL', name, `"scope", when present, must be "diocese", "parish", or "communion", got ${JSON.stringify(doc.scope)}`);
    }

    // Filenames are <body-slug>-<diocese-slug>-<year>.json (cycleType
    // 'dated') or <body-slug>-<diocese-slug>.json (cycleType
    // 'monthly-recurring'), with a further -<parish-slug> segment for scope
    // 'parish' and NO diocese segment at all for scope 'communion' -- but
    // slugs may themselves contain hyphens (e.g. "western-oregon"), which
    // makes the filename ambiguous to parse back apart. So validation runs
    // the other direction: build the expected filename FROM the document's
    // own declared fields and compare it to the actual filename, rather than
    // trying to split the filename and guess which hyphen belongs to what.
    if (typeof doc.bodySlug !== 'string' || !KEBAB_SLUG_PATTERN.test(doc.bodySlug)) {
      add('CRITICAL', name, `"bodySlug" must be a non-empty kebab-case slug, got ${JSON.stringify(doc.bodySlug)}`);
    }
    if (scope === 'communion') {
      if (doc.dioceseShort !== undefined || doc.diocese !== undefined) {
        add('HIGH', name, '"diocese"/"dioceseShort" must be absent when scope is "communion" (not scoped to any one diocese)');
      }
    } else if (typeof doc.dioceseShort !== 'string' || !KEBAB_SLUG_PATTERN.test(doc.dioceseShort)) {
      add('CRITICAL', name, `"dioceseShort" must be a non-empty kebab-case slug, got ${JSON.stringify(doc.dioceseShort)}`);
    }

    if (scope === 'parish') {
      if (typeof doc.parish !== 'string' || doc.parish.length === 0) {
        add('CRITICAL', name, 'scope is "parish" but "parish" is missing or empty');
      }
      if (typeof doc.parishShort !== 'string' || !KEBAB_SLUG_PATTERN.test(doc.parishShort)) {
        add('CRITICAL', name, `scope is "parish" but "parishShort" must be a non-empty kebab-case slug, got ${JSON.stringify(doc.parishShort)}`);
      }
    } else if (doc.parish !== undefined || doc.parishShort !== undefined) {
      add('HIGH', name, '"parish"/"parishShort" must be absent unless scope is "parish"');
    }

    const expectedId = name.slice(0, -'.json'.length);
    if (doc.id !== expectedId) {
      add('HIGH', name, `id "${doc.id}" does not match filename (expected "${expectedId}")`);
    }
    if (typeof doc.bodySlug === 'string' && (scope === 'communion' || typeof doc.dioceseShort === 'string')) {
      const slugParts = [doc.bodySlug];
      if (scope !== 'communion') slugParts.push(doc.dioceseShort);
      if (scope === 'parish' && typeof doc.parishShort === 'string') slugParts.push(doc.parishShort);
      const base = slugParts.join('-');
      const expectedName = NO_YEAR_CYCLE_TYPES.has(cycleType)
        ? `${base}.json`
        : `${base}-${doc.year}.json`;
      if (name !== expectedName) {
        add('HIGH', name, `filename does not match expected pattern for cycleType "${cycleType}"/scope "${scope}" (expected "${expectedName}")`);
      }
    }

    const requiredStringFields = scope === 'communion'
      ? ['body', 'source', 'sourceFile', 'ingested']
      : ['body', 'diocese', 'source', 'sourceFile', 'ingested'];
    for (const field of requiredStringFields) {
      if (typeof doc[field] !== 'string' || doc[field].length === 0) {
        add('CRITICAL', name, `missing or empty required string field "${field}"`);
      }
    }
    if (NO_YEAR_CYCLE_TYPES.has(cycleType)) {
      if (doc.year !== undefined) {
        add('HIGH', name, `"year" must be absent for cycleType "${cycleType}" (a standing no-year cycle has no year)`);
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

    if (cycleType === 'annual-recurring') {
      let previousKey = null;
      const seenKeys = new Set();
      for (const [index, entry] of doc.entries.entries()) {
        const where = `entries[${index}]`;

        const monthOk = Number.isInteger(entry.month) && entry.month >= 1 && entry.month <= 12;
        if (!monthOk) {
          add('CRITICAL', name, `${where}.month must be an integer 1-12, got ${JSON.stringify(entry.month)}`);
        }
        const maxDay = monthOk ? DAYS_IN_MONTH[entry.month - 1] : 31;
        if (!Number.isInteger(entry.day) || entry.day < 1 || entry.day > maxDay) {
          add('CRITICAL', name, `${where}.day must be an integer 1-${maxDay} for month ${JSON.stringify(entry.month)}, got ${JSON.stringify(entry.day)}`);
        } else if (monthOk) {
          const key = entry.month * 100 + entry.day;
          if (seenKeys.has(key)) {
            add('HIGH', name, `${where} (month ${entry.month}, day ${entry.day}) is a duplicate of an earlier entry`);
          }
          seenKeys.add(key);
          if (previousKey !== null && key < previousKey) {
            add('HIGH', name, `${where} (month ${entry.month}, day ${entry.day}) is out of ascending order`);
          }
          previousKey = key;
        }

        if (entry.liturgicalNote !== undefined && entry.liturgicalNote !== null && typeof entry.liturgicalNote !== 'string') {
          add('HIGH', name, `${where}.liturgicalNote must be a string or null, got ${JSON.stringify(entry.liturgicalNote)}`);
        }

        validateSubjects(name, where, entry.subjects);
      }
      continue;
    }

    if (cycleType === 'ordinal-sunday-monthly') {
      let previousKey = null;
      const seenKeys = new Set();
      for (const [index, entry] of doc.entries.entries()) {
        const where = `entries[${index}]`;

        const monthOk = Number.isInteger(entry.month) && entry.month >= 1 && entry.month <= 12;
        if (!monthOk) {
          add('CRITICAL', name, `${where}.month must be an integer 1-12, got ${JSON.stringify(entry.month)}`);
        }
        if (!Number.isInteger(entry.ordinal) || entry.ordinal < 1 || entry.ordinal > 5) {
          add('CRITICAL', name, `${where}.ordinal must be an integer 1-5, got ${JSON.stringify(entry.ordinal)}`);
        } else if (monthOk) {
          const key = entry.month * 10 + entry.ordinal;
          if (seenKeys.has(key)) {
            add('HIGH', name, `${where} (month ${entry.month}, ordinal ${entry.ordinal}) is a duplicate of an earlier entry`);
          }
          seenKeys.add(key);
          if (previousKey !== null && key < previousKey) {
            add('HIGH', name, `${where} (month ${entry.month}, ordinal ${entry.ordinal}) is out of ascending order`);
          }
          previousKey = key;
        }

        if (entry.liturgicalNote !== undefined && entry.liturgicalNote !== null && typeof entry.liturgicalNote !== 'string') {
          add('HIGH', name, `${where}.liturgicalNote must be a string or null, got ${JSON.stringify(entry.liturgicalNote)}`);
        }

        validateSubjects(name, where, entry.subjects);
      }
      continue;
    }

    if (cycleType === 'week-of-year-recurring') {
      let previousWeek = null;
      const seenWeeks = new Set();
      for (const [index, entry] of doc.entries.entries()) {
        const where = `entries[${index}]`;

        if (!Number.isInteger(entry.week) || entry.week < 1 || entry.week > 53) {
          add('CRITICAL', name, `${where}.week must be an integer 1-53, got ${JSON.stringify(entry.week)}`);
        } else {
          if (seenWeeks.has(entry.week)) {
            add('HIGH', name, `${where}.week "${entry.week}" is a duplicate of an earlier entry`);
          }
          seenWeeks.add(entry.week);
          if (previousWeek !== null && entry.week < previousWeek) {
            add('HIGH', name, `${where}.week "${entry.week}" is out of ascending order (previous entry was "${previousWeek}")`);
          }
          previousWeek = entry.week;
        }

        if (entry.liturgicalNote !== undefined && entry.liturgicalNote !== null && typeof entry.liturgicalNote !== 'string') {
          add('HIGH', name, `${where}.liturgicalNote must be a string or null, got ${JSON.stringify(entry.liturgicalNote)}`);
        }

        validateSubjects(name, where, entry.subjects);
      }
      continue;
    }

    if (cycleType === 'day-of-week-recurring') {
      const seenWeekdays = new Set();
      for (const [index, entry] of doc.entries.entries()) {
        const where = `entries[${index}]`;

        if (!Number.isInteger(entry.weekday) || entry.weekday < 0 || entry.weekday > 6) {
          add('CRITICAL', name, `${where}.weekday must be an integer 0-6 (Sunday=0), got ${JSON.stringify(entry.weekday)}`);
        } else {
          if (seenWeekdays.has(entry.weekday)) {
            add('HIGH', name, `${where}.weekday "${entry.weekday}" is a duplicate of an earlier entry`);
          }
          seenWeekdays.add(entry.weekday);
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
