#!/usr/bin/env node
import fs from "fs";
import path from "path";

const repoRoot = process.cwd();

const targets = [
  {
    id: "TOBIT",
    activeFile: "tobit.json",
    aliases: ["tobit", "tobias"]
  },
  {
    id: "JUDITH",
    activeFile: "judith.json",
    aliases: ["judith"]
  },
  {
    id: "WISDOM",
    activeFile: "wisdom.json",
    aliases: ["wisdom", "wisdomofsolomon", "wisdom-of-solomon", "wisdom of solomon"]
  },
  {
    id: "SIRACH",
    activeFile: "sirach.json",
    aliases: ["sirach", "ecclesiasticus"]
  },
  {
    id: "BARUCH",
    activeFile: "baruch.json",
    aliases: ["baruch"]
  },
  {
    id: "LETTER_OF_JEREMIAH",
    activeFile: "letterofjeremiah.json",
    aliases: ["letterofjeremiah", "letter-of-jeremiah", "letter of jeremiah", "epistleofjeremiah", "epistle-of-jeremiah", "epistle of jeremiah"]
  },
  {
    id: "1_MACCABEES",
    activeFile: "1maccabees.json",
    aliases: ["1maccabees", "1-maccabees", "1 maccabees", "1machabees", "1-machabees", "1 machabees", "firstmaccabees", "first-maccabees"]
  },
  {
    id: "2_MACCABEES",
    activeFile: "2maccabees.json",
    aliases: ["2maccabees", "2-maccabees", "2 maccabees", "2machabees", "2-machabees", "2 machabees", "secondmaccabees", "second-maccabees"]
  }
];

const expectedLanes = ["DRB", "KJV", "NABRE", "NRSV", "Rotherham"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

function laneFromPath(filePath) {
  const lower = filePath.toLowerCase();

  if (lower.includes("drb") || lower.includes("douay") || lower.includes("rheims")) return "DRB";
  if (lower.includes("kjv")) return "KJV";
  if (lower.includes("nabre")) return "NABRE";
  if (lower.includes("nrsv") || lower.includes("nrsva") || lower.includes("nrsvue")) return "NRSV";
  if (lower.includes("rotherham")) return "Rotherham";

  return "unknown";
}

function walkJsonFiles(startDir) {
  const out = [];

  function walk(current) {
    if (!fs.existsSync(current)) return;

    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      const base = path.basename(current);
      if (base === ".git" || base === "node_modules") return;
      for (const entry of fs.readdirSync(current)) {
        walk(path.join(current, entry));
      }
      return;
    }

    if (stat.isFile() && current.endsWith(".json")) {
      out.push(path.relative(repoRoot, current));
    }
  }

  walk(path.join(repoRoot, startDir));
  return out.sort();
}

function firstNumber(source, keys) {
  for (const key of keys) {
    const value = source && source[key];
    if (value !== undefined && value !== null && value !== "") {
      const number = Number(value);
      if (Number.isFinite(number)) return number;
    }
  }
  return null;
}

function parseTrailingNumber(value) {
  const match = String(value || "").match(/(\d+)\s*$/);
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isFinite(number) ? number : null;
}

function chapterNumber(chapter, index) {
  return (
    firstNumber(chapter, ["chapter", "number", "num", "chapterNumber", "chapter_number", "c"]) ??
    parseTrailingNumber(chapter && chapter.id) ??
    index + 1
  );
}

function verseNumber(verse, index) {
  return (
    firstNumber(verse, ["verse", "number", "num", "verseNumber", "verse_number", "v"]) ??
    parseTrailingNumber(verse && verse.id) ??
    index + 1
  );
}

function chaptersOf(data) {
  if (Array.isArray(data?.chapters)) return data.chapters;
  if (data?.chapters && typeof data.chapters === "object") return Object.values(data.chapters);
  if (Array.isArray(data)) return data;
  return [];
}

function versesOf(chapter) {
  if (Array.isArray(chapter?.verses)) return chapter.verses;
  if (chapter?.verses && typeof chapter.verses === "object") return Object.values(chapter.verses);
  return [];
}

function refKey(chapter, verse) {
  return String(chapter) + ":" + String(verse);
}

function textFromVerse(verse) {
  if (!verse || typeof verse !== "object") return "";
  if (typeof verse.text === "string") return verse.text.trim();
  if (typeof verse.content === "string") return verse.content.trim();
  if (typeof verse.verseText === "string") return verse.verseText.trim();
  if (typeof verse.verse_text === "string") return verse.verse_text.trim();
  if (verse.text && typeof verse.text === "object") {
    for (const value of Object.values(verse.text)) {
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return "";
}

function extractRows(data) {
  const rows = [];

  chaptersOf(data).forEach((chapter, chapterIndex) => {
    const c = chapterNumber(chapter, chapterIndex);

    versesOf(chapter).forEach((verse, verseIndex) => {
      const v = verseNumber(verse, verseIndex);
      const text = textFromVerse(verse);

      if (Number.isFinite(c) && Number.isFinite(v) && text) {
        rows.push({
          ref: refKey(c, v),
          text
        });
      }
    });
  });

  return rows;
}

function activeRowsFor(activeFile) {
  const filePath = path.join("data/bible/OT", activeFile);
  const data = readJson(filePath);
  const rows = [];

  chaptersOf(data).forEach((chapter, chapterIndex) => {
    const c = chapterNumber(chapter, chapterIndex);

    versesOf(chapter).forEach((verse, verseIndex) => {
      const v = verseNumber(verse, verseIndex);
      const ref = refKey(c, v);
      const text = verse.text && typeof verse.text === "object" && !Array.isArray(verse.text) ? verse.text : {};

      rows.push({
        ref,
        text
      });
    });
  });

  return rows;
}

function candidateForPath(filePath, target) {
  const normalizedPath = normalize(filePath);
  const aliasMatched = target.aliases.some((alias) => normalizedPath.includes(normalize(alias)));

  if (!aliasMatched) return null;

  let data;
  try {
    data = readJson(filePath);
  } catch (error) {
    return {
      path: filePath,
      laneHint: laneFromPath(filePath),
      readable: false,
      reason: error.message
    };
  }

  const rows = extractRows(data);

  return {
    path: filePath,
    laneHint: laneFromPath(filePath),
    readable: true,
    rowCount: rows.length,
    sampleRefs: rows.slice(0, 10).map((row) => row.ref)
  };
}

const allTranslationJson = walkJsonFiles("data/bible/translations");
const auditBooks = [];

for (const target of targets) {
  const activeRows = activeRowsFor(target.activeFile);
  const activeRefSet = new Set(activeRows.map((row) => row.ref));

  const laneCounts = {};
  const missingByLane = {};

  for (const lane of expectedLanes) {
    const missing = [];
    let count = 0;

    for (const row of activeRows) {
      if (hasText(row.text[lane])) count += 1;
      else missing.push(row.ref);
    }

    laneCounts[lane] = count;
    missingByLane[lane] = missing;
  }

  const candidates = allTranslationJson
    .map((filePath) => candidateForPath(filePath, target))
    .filter(Boolean)
    .filter((candidate) => candidate.readable && candidate.rowCount > 0)
    .sort((a, b) => {
      if (a.laneHint !== b.laneHint) return a.laneHint.localeCompare(b.laneHint);
      return b.rowCount - a.rowCount;
    });

  const nrsvCandidates = candidates.filter((candidate) => candidate.laneHint === "NRSV");
  const drbCandidates = candidates.filter((candidate) => candidate.laneHint === "DRB");
  const nabreCandidates = candidates.filter((candidate) => candidate.laneHint === "NABRE");
  const kjvCandidates = candidates.filter((candidate) => candidate.laneHint === "KJV");

  let repairFinding = "needs_review";
  if (missingByLane.NRSV.length > 0 && nrsvCandidates.length === 0) {
    repairFinding = "nrsv_missing_rows_but_no_local_nrsv_source_candidate_found";
  } else if (missingByLane.NRSV.length > 0 && nrsvCandidates.length > 0) {
    repairFinding = "nrsv_missing_rows_with_local_candidate_source_available_for_manual_exactness_review";
  } else if (missingByLane.NRSV.length === 0) {
    repairFinding = "nrsv_lane_complete_in_active_grid";
  }

  auditBooks.push({
    id: target.id,
    activeFile: target.activeFile,
    activeRows: activeRows.length,
    laneCounts,
    missingCounts: Object.fromEntries(expectedLanes.map((lane) => [lane, missingByLane[lane].length])),
    missingSamples: Object.fromEntries(expectedLanes.map((lane) => [lane, missingByLane[lane].slice(0, 25)])),
    candidateCounts: {
      DRB: drbCandidates.length,
      KJV: kjvCandidates.length,
      NABRE: nabreCandidates.length,
      NRSV: nrsvCandidates.length
    },
    candidateSamples: {
      DRB: drbCandidates.slice(0, 5),
      KJV: kjvCandidates.slice(0, 5),
      NABRE: nabreCandidates.slice(0, 5),
      NRSV: nrsvCandidates.slice(0, 10)
    },
    repairFinding
  });
}

const report = {
  schema: "deuterocanon-catholic-source-candidate-audit-v1",
  id: "deutero_01_catholic_source_candidate_audit_2026_07_02",
  status: "completed_source_candidate_audit_no_text_mutation",
  auditedAt: process.env.DEUTERO01_AUDIT_STAMP || new Date().toISOString(),
  scope: {
    tranche: "DEUTERO-01",
    books: targets.map((target) => target.id),
    expectedLanes
  },
  rule: "Repair only from source-address/source-shape/source-scope evidence. Do not synthesize text, force active-grid symmetry, or split source units without adapter policy.",
  books: auditBooks
};

report.totals = {
  targetBooks: auditBooks.length,
  activeRows: auditBooks.reduce((sum, book) => sum + book.activeRows, 0),
  booksWithNrsVMissingRows: auditBooks.filter((book) => book.missingCounts.NRSV > 0).length,
  booksWithLocalNrsVCandidates: auditBooks.filter((book) => book.candidateCounts.NRSV > 0).length,
  booksWithNrsVSourceBlockedLocally: auditBooks.filter((book) => book.repairFinding === "nrsv_missing_rows_but_no_local_nrsv_source_candidate_found").length
};

report.nextAction =
  report.totals.booksWithNrsVSourceBlockedLocally > 0
    ? "Acquire or identify usable NRSV/NRSVA source witness for missing Catholic deuterocanon rows before text repair."
    : "Run exact NRSV source-to-active repair review for candidate-backed Catholic deuterocanon rows.";

writeJson("data/bible/registry/deuterocanon-catholic-source-candidate-audit.json", report);

console.log(JSON.stringify(report, null, 2));

if (report.totals.targetBooks !== 8) {
  process.exit(1);
}
