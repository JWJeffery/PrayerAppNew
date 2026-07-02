#!/usr/bin/env node
import fs from "fs";
import path from "path";

const stamp = process.env.DEUTERO02_SOURCE_AUDIT_STAMP || new Date().toISOString();

const sourceRoot = "data/bible/translations/nrsv-biblegateway-nrsva";
const rawRoot = path.join(sourceRoot, "raw");
const manifestPath = path.join(sourceRoot, "greek-additions-manifest.json");
const auditPath = "data/bible/registry/deutero-02-greek-additions-source-active-audit.json";

const targets = [
  {
    id: "GREEK_ESTHER",
    name: "Greek Esther",
    activePath: "data/bible/OT/estherGK.json",
    rawPath: path.join(rawRoot, "estherGK.json"),
    queryBook: "Esther",
    chapters: 16
  },
  {
    id: "GREEK_DANIEL",
    name: "Greek Daniel",
    activePath: "data/bible/OT/danielGK.json",
    rawPath: path.join(rawRoot, "danielGK.json"),
    queryBook: "Daniel",
    chapters: 14
  }
];

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

function extractVerses(html, requestedChapter) {
  const passage = extractPassageHtml(html);
  const byRef = new Map();

  const classPattern = /<span[^>]+class="([^"]*\btext\b[^"]*)"[^>]*>([\s\S]*?)<\/span>/gi;
  let match;

  while ((match = classPattern.exec(passage)) !== null) {
    const className = match[1];
    const body = match[2];

    const refMatch =
      className.match(new RegExp("(?:^|[\\sA-Za-z])" + requestedChapter + "[\\.-]([0-9]+)(?:\\b|$)")) ||
      className.match(new RegExp("[\\.-]" + requestedChapter + "[\\.-]([0-9]+)(?:\\b|$)"));

    if (!refMatch) continue;

    const verse = Number(refMatch[1]);
    const text = stripTags(body);

    if (Number.isFinite(verse) && hasText(text)) {
      const key = refKey(requestedChapter, verse);
      byRef.set(key, [byRef.get(key), text].filter(Boolean).join(" ").replace(/\s+/g, " ").trim());
    }
  }

  if (byRef.size > 0) return byRef;

  const blockPattern = /<span[^>]+class="[^"]*versenum[^"]*"[^>]*>\s*(?:\d+:)?([0-9]+)\s*<\/span>([\s\S]*?)(?=<span[^>]+class="[^"]*versenum|<h[1-6]|<div[^>]+class="[^"]*footnotes|$)/gi;

  while ((match = blockPattern.exec(passage)) !== null) {
    const verse = Number(match[1]);
    const text = stripTags(match[2]);

    if (Number.isFinite(verse) && hasText(text)) {
      const key = refKey(requestedChapter, verse);
      byRef.set(key, [byRef.get(key), text].filter(Boolean).join(" ").replace(/\s+/g, " ").trim());
    }
  }

  return byRef;
}

async function fetchChapter(target, chapter) {
  const query = target.queryBook + " " + chapter;
  const url = "https://www.biblegateway.com/passage/?search=" + encodeURIComponent(query) + "&version=NRSVA";

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 UniversalOfficeSourceAudit/1.0",
        "accept": "text/html,application/xhtml+xml"
      }
    });

    const html = await response.text();
    const verses = response.ok ? extractVerses(html, chapter) : new Map();

    return {
      chapter,
      query,
      url,
      ok: response.ok,
      status: response.status,
      verseCount: verses.size,
      verses: Array.from(verses.entries()).map(([ref, text]) => {
        const [, verseText] = ref.split(":");
        return { chapter, verse: Number(verseText), ref, text };
      }).sort((a, b) => a.verse - b.verse)
    };
  } catch (error) {
    return {
      chapter,
      query,
      url,
      ok: false,
      status: "FETCH_ERROR",
      error: String(error && error.message ? error.message : error),
      verseCount: 0,
      verses: []
    };
  }
}

async function fetchSourceSnapshot(target) {
  const chapters = [];

  for (let chapter = 1; chapter <= target.chapters; chapter += 1) {
    console.log("Fetching " + target.id + " " + chapter + " from BibleGateway NRSVA");
    chapters.push(await fetchChapter(target, chapter));
  }

  return {
    schema: "biblegateway-nrsva-greek-additions-source-snapshot-v1",
    id: target.id,
    name: target.name,
    translation: "NRSVA",
    normalizedLane: "NRSV",
    sourceWitness: "BibleGateway NRSVA",
    sourceUrlTemplate: "https://www.biblegateway.com/passage/?search={book}%20{chapter}&version=NRSVA",
    capturedAt: stamp,
    activePath: target.activePath,
    chapters,
    rowCount: chapters.reduce((sum, chapter) => sum + chapter.verses.length, 0),
    unavailableChapters: chapters.filter((chapter) => chapter.verseCount === 0).map((chapter) => ({
      chapter: chapter.chapter,
      query: chapter.query,
      url: chapter.url,
      ok: chapter.ok,
      status: chapter.status,
      error: chapter.error || null
    }))
  };
}

function activeRows(activeData) {
  const rows = [];

  chaptersOf(activeData).forEach((chapter, chapterIndex) => {
    const c = chapterNumber(chapter, chapterIndex);

    versesOf(chapter).forEach((verse, verseIndex) => {
      const v = verseNumber(verse, verseIndex);
      rows.push({
        ref: refKey(c, v),
        text: verse && verse.text
      });
    });
  });

  return rows;
}

function sourceRows(snapshot) {
  return (snapshot.chapters || []).flatMap((chapter) => chapter.verses || []);
}

function mapByRef(rows) {
  return new Map(rows.map((row) => [row.ref, row]));
}

function compare(target, snapshot) {
  const active = readJson(target.activePath);
  const activeList = activeRows(active);
  const sourceList = sourceRows(snapshot);

  const activeMap = mapByRef(activeList);
  const sourceMap = mapByRef(sourceList);

  const activeNrsVRows = activeList.filter((row) => hasText(row.text?.NRSV));
  const activeMissingNrsVRows = activeList.filter((row) => !hasText(row.text?.NRSV)).map((row) => row.ref);
  const sourceRefsWithoutActive = sourceList.filter((row) => !activeMap.has(row.ref)).map((row) => row.ref);
  const activeRefsWithoutSource = activeList.filter((row) => !sourceMap.has(row.ref)).map((row) => row.ref);

  const matchingRefs = [];
  const mismatches = [];

  for (const sourceRow of sourceList) {
    const activeRow = activeMap.get(sourceRow.ref);
    if (!activeRow) continue;

    const activeText = activeRow.text?.NRSV;
    if (!hasText(activeText)) continue;

    if (activeText === sourceRow.text) {
      matchingRefs.push(sourceRow.ref);
    } else {
      mismatches.push({
        ref: sourceRow.ref,
        activeText,
        sourceText: sourceRow.text
      });
    }
  }

  return {
    id: target.id,
    name: target.name,
    activePath: target.activePath,
    rawSourcePath: target.rawPath,
    sourceWitness: "BibleGateway NRSVA",
    activeRows: activeList.length,
    activeNrsVRows: activeNrsVRows.length,
    activeMissingNrsVRowsCount: activeMissingNrsVRows.length,
    activeMissingNrsVRows,
    sourceRows: sourceList.length,
    unavailableChapters: snapshot.unavailableChapters,
    sourceRefsWithoutActiveCount: sourceRefsWithoutActive.length,
    sourceRefsWithoutActive,
    activeRefsWithoutSourceCount: activeRefsWithoutSource.length,
    activeRefsWithoutSource,
    matchingRefsCount: matchingRefs.length,
    mismatchCount: mismatches.length,
    mismatches,
    determination: {
      sameAddressExactMatches: matchingRefs.length,
      sameAddressMismatches: mismatches.length,
      sourceShapeBoundaryRows: activeRefsWithoutSource.length + sourceRefsWithoutActive.length,
      repairReadiness: mismatches.length === 0 && activeMissingNrsVRows.length === 0
        ? "no_text_repair_indicated_by_same_address_audit"
        : "source_active_shape_review_required_before_any_text_repair"
    }
  };
}

async function main() {
  const snapshots = [];
  const books = [];

  for (const target of targets) {
    if (!fs.existsSync(target.activePath)) {
      throw new Error("Missing active path: " + target.activePath);
    }

    const snapshot = await fetchSourceSnapshot(target);
    writeJson(target.rawPath, snapshot);
    snapshots.push(snapshot);
    books.push(compare(target, snapshot));
  }

  const manifest = {
    schema: "biblegateway-nrsva-greek-additions-source-manifest-v1",
    source_name: "BibleGateway NRSVA",
    source_url_template: "https://www.biblegateway.com/passage/?search={book}%20{chapter}&version=NRSVA",
    capturedAt: stamp,
    normalized_active_lane: "text.NRSV",
    scope: "DEUTERO-02 Greek Esther and Greek Daniel source-active shape audit",
    rawSources: targets.map((target) => ({
      id: target.id,
      activePath: target.activePath,
      rawSourcePath: target.rawPath,
      queryBook: target.queryBook,
      chapters: target.chapters
    })),
    notes: [
      "These source snapshots are audit witnesses only.",
      "This tranche does not mutate active Bible text.",
      "Same-address repair must not be performed until source-active shape findings are reviewed."
    ]
  };

  writeJson(manifestPath, manifest);

  const totals = {
    books: books.length,
    activeRows: books.reduce((sum, book) => sum + book.activeRows, 0),
    activeNrsVRows: books.reduce((sum, book) => sum + book.activeNrsVRows, 0),
    activeMissingNrsVRows: books.reduce((sum, book) => sum + book.activeMissingNrsVRowsCount, 0),
    sourceRows: books.reduce((sum, book) => sum + book.sourceRows, 0),
    sourceRefsWithoutActive: books.reduce((sum, book) => sum + book.sourceRefsWithoutActiveCount, 0),
    activeRefsWithoutSource: books.reduce((sum, book) => sum + book.activeRefsWithoutSourceCount, 0),
    matchingRefs: books.reduce((sum, book) => sum + book.matchingRefsCount, 0),
    mismatches: books.reduce((sum, book) => sum + book.mismatchCount, 0),
    unavailableChapters: books.reduce((sum, book) => sum + book.unavailableChapters.length, 0)
  };

  const audit = {
    schema: "deutero-02-greek-additions-source-active-audit-v1",
    id: "deutero_02_greek_additions_source_active_audit_2026_07_02",
    status: totals.sourceRows > 0 ? "PASS_SOURCE_ACTIVE_SHAPE_FINDINGS_RECORDED" : "FAIL_NO_SOURCE_ROWS_CAPTURED",
    auditedAt: stamp,
    sourceManifest: manifestPath,
    sourceWitness: "BibleGateway NRSVA",
    scope: {
      tranche: "DEUTERO-02",
      books: ["GREEK_ESTHER", "GREEK_DANIEL"],
      activeFiles: ["data/bible/OT/estherGK.json", "data/bible/OT/danielGK.json"],
      lane: "text.NRSV"
    },
    determination: {
      summary: "DEUTERO-02 source-active shape audit recorded BibleGateway NRSVA candidate source snapshots for estherGK.json and danielGK.json. This is audit-only; no active Bible text was mutated. Findings must be reviewed before any source-backed text repair or adapter mapping.",
      allowedClaims: [
        "deutero_02_greek_additions_source_active_shape_audited",
        "deutero_02_bible_text_not_mutated"
      ],
      blockedClaims: [
        "deutero_02_text_repaired",
        "deutero_02_same_address_complete_without_review",
        "deutero_02_source_row_split_without_adapter_policy",
        "deutero_02_synthetic_fill",
        "deuterocanon_textually_trusted",
        "deuterocanon_complete"
      ]
    },
    books,
    totals
  };

  writeJson(auditPath, audit);
  console.log(JSON.stringify(audit, null, 2));

  process.exit(audit.status.startsWith("PASS") ? 0 : 1);
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
