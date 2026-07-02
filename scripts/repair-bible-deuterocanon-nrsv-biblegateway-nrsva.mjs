#!/usr/bin/env node
import fs from "fs";
import path from "path";

const sourceRoot = "data/bible/translations/nrsv-biblegateway-nrsva";
const rawRoot = path.join(sourceRoot, "raw");
const activeRoot = "data/bible/OT";

const targets = [
  { id: "TOBIT", name: "Tobit", activeFile: "tobit.json", rawFile: "tobit.json", chapters: 14, queryBook: "Tobit" },
  { id: "JUDITH", name: "Judith", activeFile: "judith.json", rawFile: "judith.json", chapters: 16, queryBook: "Judith" },
  { id: "WISDOM", name: "Wisdom", activeFile: "wisdom.json", rawFile: "wisdom.json", chapters: 19, queryBook: "Wisdom" },
  { id: "SIRACH", name: "Sirach", activeFile: "sirach.json", rawFile: "sirach.json", chapters: 51, queryBook: "Sirach" },
  { id: "BARUCH", name: "Baruch", activeFile: "baruch.json", rawFile: "baruch.json", chapters: 5, queryBook: "Baruch" },
  { id: "LETTER_OF_JEREMIAH", name: "Letter of Jeremiah", activeFile: "letterofjeremiah.json", rawFile: "letterofjeremiah.json", chapters: 1, queryBook: "Letter of Jeremiah" },
  { id: "1_MACCABEES", name: "1 Maccabees", activeFile: "1maccabees.json", rawFile: "1maccabees.json", chapters: 16, queryBook: "1 Maccabees" },
  { id: "2_MACCABEES", name: "2 Maccabees", activeFile: "2maccabees.json", rawFile: "2maccabees.json", chapters: 15, queryBook: "2 Maccabees" }
];

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
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
  return firstNumber(chapter, ["chapter", "number", "num", "chapterNumber", "chapter_number", "c"]) ?? parseTrailingNumber(chapter && chapter.id) ?? index + 1;
}

function verseNumber(verse, index) {
  return firstNumber(verse, ["verse", "number", "num", "verseNumber", "verse_number", "v"]) ?? parseTrailingNumber(verse && verse.id) ?? index + 1;
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

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "…")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripTags(value) {
  return decodeHtml(
    String(value || "")
      .replace(/<sup\b[^>]*>.*?<\/sup>/gis, "")
      .replace(/<span\b[^>]*class="[^"]*(chapternum|versenum|crossreference|footnote)[^"]*"[^>]*>.*?<\/span>/gis, "")
      .replace(/<h[1-6]\b[^>]*>.*?<\/h[1-6]>/gis, "")
      .replace(/<div\b[^>]*class="[^"]*footnotes[^"]*"[^>]*>[\s\S]*$/gis, "")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function extractPassageHtml(html) {
  const match =
    html.match(/<div[^>]+class="[^"]*passage-content[^"]*"[^>]*>([\s\S]*?)<div[^>]+class="[^"]*publisher-info-bottom[^"]*"/i) ||
    html.match(/<div[^>]+class="[^"]*passage-content[^"]*"[^>]*>([\s\S]*?)<div[^>]+class="[^"]*copyright-table[^"]*"/i) ||
    html.match(/<div[^>]+class="[^"]*passage-content[^"]*"[^>]*>([\s\S]*?)<\/main>/i);

  return match ? match[1] : html;
}

function extractVerses(html, chapter) {
  const passage = extractPassageHtml(html);
  const byRef = new Map();

  const classPattern = /<span[^>]+class="([^"]*\btext\b[^"]*)"[^>]*>([\s\S]*?)<\/span>/gi;
  let match;

  while ((match = classPattern.exec(passage)) !== null) {
    const className = match[1];
    const body = match[2];
    const refMatch =
      className.match(new RegExp("(?:^|[\\sA-Za-z])" + chapter + "[\\.-]([0-9]+)(?:\\b|$)")) ||
      className.match(new RegExp("[\\.-]" + chapter + "[\\.-]([0-9]+)(?:\\b|$)"));

    if (!refMatch) continue;

    const verse = Number(refMatch[1]);
    const text = stripTags(body);

    if (Number.isFinite(verse) && hasText(text)) {
      const key = refKey(chapter, verse);
      byRef.set(key, [byRef.get(key), text].filter(Boolean).join(" ").replace(/\s+/g, " ").trim());
    }
  }

  if (byRef.size > 0) return byRef;

  const blockPattern = /<span[^>]+class="[^"]*versenum[^"]*"[^>]*>\s*(?:\d+:)?([0-9]+)\s*<\/span>([\s\S]*?)(?=<span[^>]+class="[^"]*versenum|<h[1-6]|<div[^>]+class="[^"]*footnotes|$)/gi;

  while ((match = blockPattern.exec(passage)) !== null) {
    const verse = Number(match[1]);
    const text = stripTags(match[2]);

    if (Number.isFinite(verse) && hasText(text)) {
      const key = refKey(chapter, verse);
      byRef.set(key, [byRef.get(key), text].filter(Boolean).join(" ").replace(/\s+/g, " ").trim());
    }
  }

  return byRef;
}

async function fetchChapter(target, chapter) {
  const url = "https://www.biblegateway.com/passage/?search=" + encodeURIComponent(target.queryBook + " " + chapter) + "&version=NRSVA";
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 UniversalOfficeSourceAudit/1.0",
      "accept": "text/html,application/xhtml+xml"
    }
  });

  if (!response.ok) throw new Error("Fetch failed " + response.status + " for " + url);

  const html = await response.text();
  const verses = extractVerses(html, chapter);

  return {
    chapter,
    url,
    verseCount: verses.size,
    verses: Array.from(verses.entries()).map(([ref, text]) => {
      const [, verseText] = ref.split(":");
      return { chapter, verse: Number(verseText), ref, text };
    }).sort((a, b) => a.verse - b.verse)
  };
}

async function fetchBook(target) {
  const chapters = [];

  for (let chapter = 1; chapter <= target.chapters; chapter += 1) {
    const result = await fetchChapter(target, chapter);
    if (result.verseCount === 0) throw new Error("No verses parsed for " + target.id + " chapter " + chapter + " from " + result.url);
    chapters.push(result);
  }

  return {
    schema: "biblegateway-nrsva-source-snapshot-v1",
    id: target.id,
    name: target.name,
    translation: "NRSVA",
    normalizedLane: "NRSV",
    sourceWitness: "BibleGateway NRSVA",
    sourceUrlTemplate: "https://www.biblegateway.com/passage/?search={book}%20{chapter}&version=NRSVA",
    capturedAt: process.env.NRSVA_IMPORT_STAMP || new Date().toISOString(),
    chapters,
    rowCount: chapters.reduce((sum, c) => sum + c.verses.length, 0)
  };
}

function sourceRowsByRef(snapshot) {
  const map = new Map();
  for (const chapter of snapshot.chapters || []) {
    for (const verse of chapter.verses || []) {
      if (hasText(verse.text)) map.set(verse.ref, verse.text);
    }
  }
  return map;
}

function activeRows(activeData) {
  const rows = [];
  chaptersOf(activeData).forEach((chapter, chapterIndex) => {
    const c = chapterNumber(chapter, chapterIndex);
    versesOf(chapter).forEach((verse, verseIndex) => {
      const v = verseNumber(verse, verseIndex);
      rows.push({ chapter, verse, ref: refKey(c, v) });
    });
  });
  return rows;
}

async function main() {
  fs.mkdirSync(rawRoot, { recursive: true });
  const repairBooks = [];

  for (const target of targets) {
    console.log("Fetching " + target.id + " from BibleGateway NRSVA");

    const snapshot = await fetchBook(target);
    const rawPath = path.join(rawRoot, target.rawFile);
    writeJson(rawPath, snapshot);

    const activePath = path.join(activeRoot, target.activeFile);
    const active = readJson(activePath);
    const sourceMap = sourceRowsByRef(snapshot);
    const rows = activeRows(active);

    const beforeNrsV = rows.filter((row) => hasText(row.verse.text?.NRSV)).length;
    const changedRefs = [];
    const sourceRefsWithoutActive = [];
    const activeRefsWithoutSource = [];
    const activeRefSet = new Set(rows.map((row) => row.ref));

    for (const ref of sourceMap.keys()) {
      if (!activeRefSet.has(ref)) sourceRefsWithoutActive.push(ref);
    }

    for (const row of rows) {
      const sourceText = sourceMap.get(row.ref);

      if (!sourceText) {
        activeRefsWithoutSource.push(row.ref);
        continue;
      }

      row.verse.text = row.verse.text && typeof row.verse.text === "object" && !Array.isArray(row.verse.text) ? row.verse.text : {};

      if (row.verse.text.NRSV !== sourceText) {
        row.verse.text.NRSV = sourceText;
        changedRefs.push(row.ref);
      }
    }

    writeJson(activePath, active);

    const afterRows = activeRows(readJson(activePath));
    const afterNrsV = afterRows.filter((row) => hasText(row.verse.text?.NRSV)).length;

    repairBooks.push({
      id: target.id,
      activePath,
      rawSourcePath: rawPath,
      sourceWitness: "BibleGateway NRSVA",
      sourceRows: sourceMap.size,
      activeRows: rows.length,
      activeNrsVRowsBefore: beforeNrsV,
      activeNrsVRowsAfter: afterNrsV,
      changedRefsCount: changedRefs.length,
      changedRefsSample: changedRefs.slice(0, 40),
      sourceRefsWithoutActive,
      activeRefsWithoutSource,
      verification: [
        "BibleGateway NRSVA source snapshot captured locally",
        "active text.NRSV filled only for exact same chapter:verse source refs present in the active grid",
        "source refs absent from active grid and active refs absent from source are recorded, not synthesized"
      ]
    });
  }

  writeJson(path.join(sourceRoot, "manifest.json"), {
    schema: "bible-translation-source-manifest-v1",
    translation_key: "NRSV",
    source_name: "BibleGateway NRSVA",
    source_url_template: "https://www.biblegateway.com/passage/?search={book}%20{chapter}&version=NRSVA",
    source_language: "English",
    capturedAt: process.env.NRSVA_IMPORT_STAMP || new Date().toISOString(),
    normalized_active_lane: "text.NRSV",
    raw_path: rawRoot,
    scope: "DEUTERO-01 Catholic deuterocanon source witness for Tobit, Judith, Wisdom, Sirach, Baruch, Letter of Jeremiah, 1 Maccabees, and 2 Maccabees",
    notes: [
      "Used for source-address repair of existing active-grid NRSV rows only.",
      "No source row is split or synthesized into an active row.",
      "Rows absent from the active grid are recorded as source-scope/source-shape absences."
    ]
  });

  const repairRecord = {
    schema: "deutero-01-catholic-nrsv-biblegateway-nrsva-repair-v1",
    id: "deutero_01_catholic_nrsv_biblegateway_nrsva_repair_2026_07_02",
    status: "source_backed_same_address_repair_completed",
    repairedAt: process.env.NRSVA_IMPORT_STAMP || new Date().toISOString(),
    sourceManifest: path.join(sourceRoot, "manifest.json"),
    sourceWitness: "BibleGateway NRSVA",
    scope: { tranche: "DEUTERO-01", books: targets.map((t) => t.id), lane: "text.NRSV" },
    rule: "Fill active text.NRSV only from exact same-address BibleGateway NRSVA source rows. Do not synthesize, do not split, and do not force active-grid symmetry.",
    books: repairBooks
  };

  repairRecord.totals = {
    books: repairBooks.length,
    sourceRows: repairBooks.reduce((sum, b) => sum + b.sourceRows, 0),
    activeRows: repairBooks.reduce((sum, b) => sum + b.activeRows, 0),
    activeNrsVRowsBefore: repairBooks.reduce((sum, b) => sum + b.activeNrsVRowsBefore, 0),
    activeNrsVRowsAfter: repairBooks.reduce((sum, b) => sum + b.activeNrsVRowsAfter, 0),
    changedRefs: repairBooks.reduce((sum, b) => sum + b.changedRefsCount, 0),
    sourceRefsWithoutActive: repairBooks.reduce((sum, b) => sum + b.sourceRefsWithoutActive.length, 0),
    activeRefsWithoutSource: repairBooks.reduce((sum, b) => sum + b.activeRefsWithoutSource.length, 0)
  };

  writeJson("data/bible/registry/deutero-01-catholic-nrsv-biblegateway-nrsva-repair.json", repairRecord);
  console.log(JSON.stringify({ status: repairRecord.status, totals: repairRecord.totals }, null, 2));

  if (repairRecord.totals.books !== 8 || repairRecord.totals.sourceRows === 0 || repairRecord.totals.changedRefs === 0) process.exit(1);
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
