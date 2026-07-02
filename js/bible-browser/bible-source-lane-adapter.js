(function bibleSourceLaneAdapterFactory(root) {
  const LANES = {
    DRB_ORIGINAL: {
      id: "DRB_ORIGINAL",
      label: "Douay-Rheims",
      translationKey: "DRB",
      use: "internal_bible_browser",
      manifestPath: "data/bible/translations/drb-original-douay-rheims/manifest.json",
      basePath: "data/bible/translations/drb-original-douay-rheims",
      filePrefix: "raw/",
        sourceShapeAdapterPath: "data/bible/translations/drb-original-douay-rheims/source-shape-adapter.json",
      bookMap: {
        GENESIS: "genesis.json",
        EXODUS: "exodus.json",
        LEVITICUS: "leviticus.json",
        NUMBERS: "numbers.json",
        DEUTERONOMY: "deuteronomy.json",
        JOSHUA: "josue.json",
        JUDGES: "judges.json",
        RUTH: "ruth.json",
        "1_SAMUEL": "1-kings.json",
        "2_SAMUEL": "2-kings.json",
        "1_KINGS": "3-kings.json",
        "2_KINGS": "4-kings.json",
        "1_CHRONICLES": "1-paralipomenon.json",
        "2_CHRONICLES": "2-paralipomenon.json",
        EZRA: "1-esdras.json",
        NEHEMIAH: "2-esdras.json",
        TOBIT: "tobias.json",
        JUDITH: "judith.json",
        ESTHER: "esther.json",
        JOB: "job.json",
        PSALMS: "psalms.json",
        PROVERBS: "proverbs.json",
        ECCLESIASTES: "ecclesiastes.json",
        SONG_OF_SOLOMON: "canticle-of-canticles.json",
        WISDOM: "wisdom.json",
        SIRACH: "ecclesiasticus.json",
        ISAIAH: "isaie.json",
        JEREMIAH: "jeremie.json",
        LAMENTATIONS: "lamentations.json",
        BARUCH: "baruch.json",
        EZEKIEL: "ezechiel.json",
        DANIEL: "daniel.json",
        HOSEA: "osee.json",
        JOEL: "joel.json",
        AMOS: "amos.json",
        OBADIAH: "abdias.json",
        JONAH: "jonas.json",
        MICAH: "micheas.json",
        NAHUM: "nahum.json",
        HABAKKUK: "habacuc.json",
        ZEPHANIAH: "sophonias.json",
        HAGGAI: "aggeus.json",
        ZECHARIAH: "zacharias.json",
        MALACHI: "malachie.json",
        "1_MACCABEES": "1-machabees.json",
        "2_MACCABEES": "2-machabees.json",
        MATTHEW: "matthew.json",
        MARK: "mark.json",
        LUKE: "luke.json",
        JOHN: "john.json",
        ACTS: "acts.json",
        ROMANS: "romans.json",
        "1_CORINTHIANS": "1-corinthians.json",
        "2_CORINTHIANS": "2-corinthians.json",
        GALATIANS: "galatians.json",
        EPHESIANS: "ephesians.json",
        PHILIPPIANS: "philippians.json",
        COLOSSIANS: "colossians.json",
        "1_THESSALONIANS": "1-thessalonians.json",
        "2_THESSALONIANS": "2-thessalonians.json",
        "1_TIMOTHY": "1-timothy.json",
        "2_TIMOTHY": "2-timothy.json",
        TITUS: "titus.json",
        PHILEMON: "philemon.json",
        HEBREWS: "hebrews.json",
        JAMES: "james.json",
        "1_PETER": "1-peter.json",
        "2_PETER": "2-peter.json",
        "1_JOHN": "1-john.json",
        "2_JOHN": "2-john.json",
        "3_JOHN": "3-john.json",
        JUDE: "jude.json",
        REVELATION: "apocalypse.json"
      }
    },
    VULGATE_CLEMENTINE: {
      id: "VULGATE_CLEMENTINE",
      label: "Vulgate Clementine",
      translationKey: "Vulgate",
      use: "internal_bible_browser_and_roman_breviary_binding",
      manifestPath: "data/bible/translations/vulgate-clementine/manifest.json",
      basePath: "data/bible/translations/vulgate-clementine",
      filePrefix: "raw/",
      bookMap: {
        JOB: "job.json",
        "1_CORINTHIANS": "1-corinthians.json"
      }
    },
    VULGATE_PSALTER: {
      id: "VULGATE_PSALTER",
      label: "Vulgate Psalter",
      translationKey: "VulgatePsalter",
      use: "roman_breviary_psalter_binding",
      manifestPath: "data/bible/translations/vulgate-psalter/manifest.json",
      basePath: "data/bible/translations/vulgate-psalter",
      filePrefix: "raw/",
      bookMap: {
        PSALMS: "psalms.json"
      }
    },
    NABRE_INTERNAL: {
      id: "NABRE_INTERNAL",
      label: "NABRE",
      translationKey: "NABRE",
      use: "internal_bible_browser",
      manifestPath: "data/bible/translations/nabre-internal-source-lane/manifest.json",
      basePath: "data/bible/translations/nabre-internal-source-lane",
      filePrefix: "source/generated_data/books/",
      bookMap: {
        GENESIS: "Genesis.json",
        EXODUS: "Exodus.json",
        LEVITICUS: "Leviticus.json",
        NUMBERS: "Numbers.json",
        DEUTERONOMY: "Deuteronomy.json",
        JOSHUA: "Joshua.json",
        JUDGES: "Judges.json",
        RUTH: "Ruth.json",
        "1_SAMUEL": "1Samuel.json",
        "2_SAMUEL": "2Samuel.json",
        "1_KINGS": "1Kings.json",
        "2_KINGS": "2Kings.json",
        "1_CHRONICLES": "1Chronicles.json",
        "2_CHRONICLES": "2Chronicles.json",
        EZRA: "Ezra.json",
        NEHEMIAH: "Nehemiah.json",
        TOBIT: "Tobit.json",
        JUDITH: "Judith.json",
        ESTHER: "Esther.json",
        JOB: "Job.json",
        PSALMS: "Psalms.json",
        PROVERBS: "Proverbs.json",
        ECCLESIASTES: "Ecclesiastes.json",
        SONG_OF_SOLOMON: "SongofSongs.json",
        WISDOM: "Wisdom.json",
        SIRACH: "Sirach.json",
        ISAIAH: "Isaiah.json",
        JEREMIAH: "Jeremiah.json",
        LAMENTATIONS: "Lamentations.json",
        BARUCH: "Baruch.json",
        EZEKIEL: "Ezekiel.json",
        DANIEL: "Daniel.json",
        HOSEA: "Hosea.json",
        JOEL: "Joel.json",
        AMOS: "Amos.json",
        OBADIAH: "Obadiah.json",
        JONAH: "Jonah.json",
        MICAH: "Micah.json",
        NAHUM: "Nahum.json",
        HABAKKUK: "Habakkuk.json",
        ZEPHANIAH: "Zephaniah.json",
        HAGGAI: "Haggai.json",
        ZECHARIAH: "Zechariah.json",
        MALACHI: "Malachi.json",
        "1_MACCABEES": "1Maccabees.json",
        "2_MACCABEES": "2Maccabees.json",
        MATTHEW: "Matthew.json",
        MARK: "Mark.json",
        LUKE: "Luke.json",
        JOHN: "John.json",
        ACTS: "Acts.json",
        ROMANS: "Romans.json",
        "1_CORINTHIANS": "1Corinthians.json",
        "2_CORINTHIANS": "2Corinthians.json",
        GALATIANS: "Galatians.json",
        EPHESIANS: "Ephesians.json",
        PHILIPPIANS: "Philippians.json",
        COLOSSIANS: "Colossians.json",
        "1_THESSALONIANS": "1Thessalonians.json",
        "2_THESSALONIANS": "2Thessalonians.json",
        "1_TIMOTHY": "1Timothy.json",
        "2_TIMOTHY": "2Timothy.json",
        TITUS: "Titus.json",
        PHILEMON: "Philemon.json",
        HEBREWS: "Hebrews.json",
        JAMES: "James.json",
        "1_PETER": "1Peter.json",
        "2_PETER": "2Peter.json",
        "1_JOHN": "1John.json",
        "2_JOHN": "2John.json",
        "3_JOHN": "3John.json",
        JUDE: "Jude.json",
        REVELATION: "Revelation.json"
      }
    }
  };

  function normalizeBookId(bookId) {
    return String(bookId || "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  function getLane(laneId) {
    return LANES[laneId] || null;
  }

  function listLanes() {
    return Object.values(LANES).map(({ id, label, translationKey, use }) => ({ id, label, translationKey, use }));
  }

  function sourcePathFor(lane, bookId) {
    const normalized = normalizeBookId(bookId);
    const file = lane.bookMap[normalized];
    if (!file) return null;
    return `${lane.basePath}/${lane.filePrefix}${file}`;
  }

  function chapterNumber(chapter) {
    return Number(chapter?.chapter ?? chapter?.number ?? chapter?.num ?? chapter?.chapterNumber ?? chapter?.chapter_number);
  }

  function verseNumber(verse) {
    return Number(verse?.verse ?? verse?.number ?? verse?.num ?? verse?.verseNumber ?? verse?.verse_number);
  }

  function verseText(verse) {
    const raw = verse?.text ?? verse?.content ?? verse?.verseText ?? verse?.verse_text;
    return typeof raw === "string" ? raw.trim() : "";
  }

  function chaptersOf(bookJson) {
    if (Array.isArray(bookJson?.chapters)) return bookJson.chapters;
    if (bookJson?.chapters && typeof bookJson.chapters === "object") return Object.values(bookJson.chapters);
    return [];
  }

  function versesOf(chapter) {
    if (Array.isArray(chapter?.verses)) return chapter.verses;
    if (chapter?.verses && typeof chapter.verses === "object") return Object.values(chapter.verses);
    return [];
  }

  function extractRange(bookJson, chapter, verseStart, verseEnd) {
    const wantedChapter = Number(chapter);
    const start = Number(verseStart);
    const end = Number(verseEnd || verseStart);

    const chapterNode = chaptersOf(bookJson).find((candidate) => chapterNumber(candidate) === wantedChapter);
    if (!chapterNode) return [];

    return versesOf(chapterNode)
      .filter((verse) => {
        const n = verseNumber(verse);
        return Number.isFinite(n) && n >= start && n <= end;
      })
      .map((verse) => ({
        chapter: wantedChapter,
        verse: verseNumber(verse),
        text: verseText(verse)
      }))
      .filter((verse) => verse.text);
  }

  function refKey(chapter, verse) {
    return String(Number(chapter)) + ":" + String(Number(verse));
  }

  function rowByRef(bookJson) {
    const rows = new Map();

    for (const chapter of chaptersOf(bookJson)) {
      const c = chapterNumber(chapter);
      for (const verse of versesOf(chapter)) {
        const v = verseNumber(verse);
        if (Number.isFinite(c) && Number.isFinite(v)) {
          rows.set(refKey(c, v), {
            chapter: c,
            verse: v,
            text: verseText(verse)
          });
        }
      }
    }

    return rows;
  }

  function activeRefsFor(chapter, verseStart, verseEnd) {
    const wantedChapter = Number(chapter);
    const start = Number(verseStart);
    const end = Number(verseEnd || verseStart);
    const refs = [];

    for (let verse = start; verse <= end; verse += 1) {
      refs.push(refKey(wantedChapter, verse));
    }

    return refs;
  }

  function adapterRuleFor(sourceShapeAdapter, bookId, activeRef) {
    const bookRules = sourceShapeAdapter?.books?.[bookId];
    return bookRules?.activeRefs?.[activeRef] || null;
  }

  function extractRefs(bookJson, refs) {
    const rows = rowByRef(bookJson);
    return refs
      .map((ref) => rows.get(ref))
      .filter((row) => row && row.text);
  }

  function extractRangeWithSourceShape(bookJson, request, bookId, sourceShapeAdapter) {
    const activeRefs = activeRefsFor(
      request.chapter,
      request.verseStart ?? request.verse,
      request.verseEnd ?? request.verseStart ?? request.verse
    );

    const sourceRefs = [];
    const sourceShapeEvents = [];

    function pushSourceRef(ref) {
      if (!sourceRefs.includes(ref)) sourceRefs.push(ref);
    }

    for (const activeRef of activeRefs) {
      const rule = adapterRuleFor(sourceShapeAdapter, bookId, activeRef);
      if (rule && Array.isArray(rule.nativeRefs) && rule.nativeRefs.length) {
        for (const nativeRef of rule.nativeRefs) pushSourceRef(nativeRef);
        sourceShapeEvents.push({
          activeRef,
          nativeRefs: rule.nativeRefs.slice(),
          policy: "covered_by_native_drb_source_unit",
          basis: rule.basis || "source_shape_adapter"
        });
      } else {
        pushSourceRef(activeRef);
      }
    }

    return {
      sourceShapeAdapter: sourceShapeEvents.length ? sourceShapeAdapter.id || null : null,
      sourceShapeEvents,
      verses: extractRefs(bookJson, sourceRefs)
    };
  }

  async function loadJson(pathValue, options = {}) {
    if (options.readJson) return options.readJson(pathValue);

    if (typeof require === "function") {
      const fs = require("fs");
      return JSON.parse(fs.readFileSync(pathValue, "utf8"));
    }

    const response = await fetch(pathValue);
    if (!response.ok) throw new Error(`Failed to load ${pathValue}: ${response.status}`);
    return response.json();
  }

  async function resolvePassage(request, options = {}) {
    const lane = getLane(request?.laneId);
    if (!lane) throw new Error(`Unknown source lane: ${request?.laneId || ""}`);

    const bookId = normalizeBookId(request.bookId);
    const sourcePath = sourcePathFor(lane, bookId);
    if (!sourcePath) throw new Error(`Book ${bookId} is not mapped for lane ${lane.id}`);

    const chapter = Number(request.chapter);
    const verseStart = Number(request.verseStart ?? request.verse);
    const verseEnd = Number(request.verseEnd ?? request.verseStart ?? request.verse);

    const bookJson = await loadJson(sourcePath, options);

    let sourceShapeAdapter = null;
    if (lane.sourceShapeAdapterPath) {
      sourceShapeAdapter = await loadJson(lane.sourceShapeAdapterPath, options);
    }

    const resolved = sourceShapeAdapter
      ? extractRangeWithSourceShape(bookJson, { chapter, verseStart, verseEnd }, bookId, sourceShapeAdapter)
      : {
          sourceShapeAdapter: null,
          sourceShapeEvents: [],
          verses: extractRange(bookJson, chapter, verseStart, verseEnd)
        };

    const verses = resolved.verses;

    return {
      laneId: lane.id,
      label: lane.label,
      translationKey: lane.translationKey,
      use: lane.use,
      bookId,
      chapter,
      verseStart,
      verseEnd,
      sourcePath,
      sourceShapeAdapter: resolved.sourceShapeAdapter,
      sourceShapeEvents: resolved.sourceShapeEvents,
      verses,
      text: verses.map((verse) => verse.text).join(" ")
    };
  }

  const api = {
    lanes: LANES,
    listLanes,
    getLane,
    sourcePathFor,
    resolvePassage,
    _internals: {
      normalizeBookId,
      extractRange,
      extractRangeWithSourceShape,
      extractRefs,
      activeRefsFor,
      chaptersOf,
      versesOf,
      verseNumber,
      verseText
    }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.UniversalOfficeBibleSourceLaneAdapter = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
