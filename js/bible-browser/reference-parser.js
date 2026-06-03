(function () {
    "use strict";

    const BIBLE_BOOKS = [
        { key: "genesis", name: "Genesis", corpus: "OT", path: "data/bible/OT/genesis.json", aliases: ["genesis", "gen", "ge", "gn"] },
        { key: "exodus", name: "Exodus", corpus: "OT", path: "data/bible/OT/exodus.json", aliases: ["exodus", "exod", "exo", "ex"] },
        { key: "leviticus", name: "Leviticus", corpus: "OT", path: "data/bible/OT/leviticus.json", aliases: ["leviticus", "lev", "le", "lv"] },
        { key: "numbers", name: "Numbers", corpus: "OT", path: "data/bible/OT/numbers.json", aliases: ["numbers", "num", "nu", "nm", "nb"] },
        { key: "deuteronomy", name: "Deuteronomy", corpus: "OT", path: "data/bible/OT/deuteronomy.json", aliases: ["deuteronomy", "deut", "deu", "dt"] },
        { key: "joshua", name: "Joshua", corpus: "OT", path: "data/bible/OT/joshua.json", aliases: ["joshua", "josh", "jos"] },
        { key: "judges", name: "Judges", corpus: "OT", path: "data/bible/OT/judges.json", aliases: ["judges", "judg", "jdg", "jg"] },
        { key: "ruth", name: "Ruth", corpus: "OT", path: "data/bible/OT/ruth.json", aliases: ["ruth", "ru", "rth"] },
        { key: "1samuel", name: "1 Samuel", corpus: "OT", path: "data/bible/OT/1samuel.json", aliases: ["1 samuel", "1samuel", "first samuel", "i samuel", "1 sam", "1sam", "1 sm", "1sm"] },
        { key: "2samuel", name: "2 Samuel", corpus: "OT", path: "data/bible/OT/2samuel.json", aliases: ["2 samuel", "2samuel", "second samuel", "ii samuel", "2 sam", "2sam", "2 sm", "2sm"] },
        { key: "1kings", name: "1 Kings", corpus: "OT", path: "data/bible/OT/1kings.json", aliases: ["1 kings", "1kings", "first kings", "i kings", "1 kgs", "1kgs", "1 ki", "1ki"] },
        { key: "2kings", name: "2 Kings", corpus: "OT", path: "data/bible/OT/2kings.json", aliases: ["2 kings", "2kings", "second kings", "ii kings", "2 kgs", "2kgs", "2 ki", "2ki"] },
        { key: "1chronicles", name: "1 Chronicles", corpus: "OT", path: "data/bible/OT/1chronicles.json", aliases: ["1 chronicles", "1chronicles", "first chronicles", "i chronicles", "1 chron", "1chron", "1 chr", "1chr"] },
        { key: "2chronicles", name: "2 Chronicles", corpus: "OT", path: "data/bible/OT/2chronicles.json", aliases: ["2 chronicles", "2chronicles", "second chronicles", "ii chronicles", "2 chron", "2chron", "2 chr", "2chr"] },
        { key: "ezra", name: "Ezra", corpus: "OT", path: "data/bible/OT/ezra.json", aliases: ["ezra", "ezr"] },
        { key: "nehemiah", name: "Nehemiah", corpus: "OT", path: "data/bible/OT/nehemiah.json", aliases: ["nehemiah", "neh", "ne"] },
        { key: "esther", name: "Esther", corpus: "OT", path: "data/bible/OT/esther.json", aliases: ["esther", "esth", "est"] },
        { key: "job", name: "Job", corpus: "OT", path: "data/bible/OT/job.json", aliases: ["job", "jb"] },
        { key: "psalms", name: "Psalms", corpus: "OT", path: "data/bible/OT/psalms.json", aliases: ["psalms", "psalm", "ps", "pss"] },
        { key: "proverbs", name: "Proverbs", corpus: "OT", path: "data/bible/OT/proverbs.json", aliases: ["proverbs", "prov", "prv", "pr"] },
        { key: "ecclesiastes", name: "Ecclesiastes", corpus: "OT", path: "data/bible/OT/ecclesiastes.json", aliases: ["ecclesiastes", "eccles", "ecc", "qoh", "qoheleth"] },
        { key: "songofsolomon", name: "Song of Solomon", corpus: "OT", path: "data/bible/OT/songofsolomon.json", aliases: ["song of solomon", "song of songs", "canticles", "song", "sos", "sg"] },
        { key: "isaiah", name: "Isaiah", corpus: "OT", path: "data/bible/OT/isaiah.json", aliases: ["isaiah", "isa", "is"] },
        { key: "jeremiah", name: "Jeremiah", corpus: "OT", path: "data/bible/OT/jeremiah.json", aliases: ["jeremiah", "jer", "je", "jr"] },
        { key: "lamentations", name: "Lamentations", corpus: "OT", path: "data/bible/OT/lamentations.json", aliases: ["lamentations", "lam", "la"] },
        { key: "ezekiel", name: "Ezekiel", corpus: "OT", path: "data/bible/OT/ezekiel.json", aliases: ["ezekiel", "ezek", "eze", "ezk"] },
        { key: "daniel", name: "Daniel", corpus: "OT", path: "data/bible/OT/daniel.json", aliases: ["daniel", "dan", "dn"] },
        { key: "hosea", name: "Hosea", corpus: "OT", path: "data/bible/OT/hosea.json", aliases: ["hosea", "hos", "ho"] },
        { key: "joel", name: "Joel", corpus: "OT", path: "data/bible/OT/joel.json", aliases: ["joel", "jl"] },
        { key: "amos", name: "Amos", corpus: "OT", path: "data/bible/OT/amos.json", aliases: ["amos", "am"] },
        { key: "obadiah", name: "Obadiah", corpus: "OT", path: "data/bible/OT/obadiah.json", aliases: ["obadiah", "obad", "ob"] },
        { key: "jonah", name: "Jonah", corpus: "OT", path: "data/bible/OT/jonah.json", aliases: ["jonah", "jon", "jh"] },
        { key: "micah", name: "Micah", corpus: "OT", path: "data/bible/OT/micah.json", aliases: ["micah", "mic", "mi"] },
        { key: "nahum", name: "Nahum", corpus: "OT", path: "data/bible/OT/nahum.json", aliases: ["nahum", "nah", "na"] },
        { key: "habakkuk", name: "Habakkuk", corpus: "OT", path: "data/bible/OT/habakkuk.json", aliases: ["habakkuk", "hab", "hb"] },
        { key: "zephaniah", name: "Zephaniah", corpus: "OT", path: "data/bible/OT/zephaniah.json", aliases: ["zephaniah", "zeph", "zep"] },
        { key: "haggai", name: "Haggai", corpus: "OT", path: "data/bible/OT/haggai.json", aliases: ["haggai", "hag", "hg"] },
        { key: "zechariah", name: "Zechariah", corpus: "OT", path: "data/bible/OT/zechariah.json", aliases: ["zechariah", "zech", "zec", "zc"] },
        { key: "malachi", name: "Malachi", corpus: "OT", path: "data/bible/OT/malachi.json", aliases: ["malachi", "mal", "ml"] },

        { key: "matthew", name: "Matthew", corpus: "NT", path: "data/bible/NT/matthew.json", aliases: ["matthew", "matt", "mt"] },
        { key: "mark", name: "Mark", corpus: "NT", path: "data/bible/NT/mark.json", aliases: ["mark", "mk", "mrk"] },
        { key: "luke", name: "Luke", corpus: "NT", path: "data/bible/NT/luke.json", aliases: ["luke", "lk", "lu"] },
        { key: "john", name: "John", corpus: "NT", path: "data/bible/NT/john.json", aliases: ["john", "jn", "jhn"] },
        { key: "acts", name: "Acts", corpus: "NT", path: "data/bible/NT/acts.json", aliases: ["acts", "ac"] },
        { key: "romans", name: "Romans", corpus: "NT", path: "data/bible/NT/romans.json", aliases: ["romans", "rom", "ro", "rm"] },
        { key: "1corinthians", name: "1 Corinthians", corpus: "NT", path: "data/bible/NT/1corinthians.json", aliases: ["1 corinthians", "1corinthians", "first corinthians", "i corinthians", "1 cor", "1cor", "1 co", "1co"] },
        { key: "2corinthians", name: "2 Corinthians", corpus: "NT", path: "data/bible/NT/2corinthians.json", aliases: ["2 corinthians", "2corinthians", "second corinthians", "ii corinthians", "2 cor", "2cor", "2 co", "2co"] },
        { key: "galatians", name: "Galatians", corpus: "NT", path: "data/bible/NT/galatians.json", aliases: ["galatians", "gal", "ga"] },
        { key: "ephesians", name: "Ephesians", corpus: "NT", path: "data/bible/NT/ephesians.json", aliases: ["ephesians", "eph"] },
        { key: "philippians", name: "Philippians", corpus: "NT", path: "data/bible/NT/philippians.json", aliases: ["philippians", "phil", "php"] },
        { key: "colossians", name: "Colossians", corpus: "NT", path: "data/bible/NT/colossians.json", aliases: ["colossians", "col"] },
        { key: "1thessalonians", name: "1 Thessalonians", corpus: "NT", path: "data/bible/NT/1thessalonians.json", aliases: ["1 thessalonians", "1thessalonians", "first thessalonians", "i thessalonians", "1 thess", "1thess", "1 th", "1th"] },
        { key: "2thessalonians", name: "2 Thessalonians", corpus: "NT", path: "data/bible/NT/2thessalonians.json", aliases: ["2 thessalonians", "2thessalonians", "second thessalonians", "ii thessalonians", "2 thess", "2thess", "2 th", "2th"] },
        { key: "1timothy", name: "1 Timothy", corpus: "NT", path: "data/bible/NT/1timothy.json", aliases: ["1 timothy", "1timothy", "first timothy", "i timothy", "1 tim", "1tim", "1 ti", "1ti"] },
        { key: "2timothy", name: "2 Timothy", corpus: "NT", path: "data/bible/NT/2timothy.json", aliases: ["2 timothy", "2timothy", "second timothy", "ii timothy", "2 tim", "2tim", "2 ti", "2ti"] },
        { key: "titus", name: "Titus", corpus: "NT", path: "data/bible/NT/titus.json", aliases: ["titus", "tit"] },
        { key: "philemon", name: "Philemon", corpus: "NT", path: "data/bible/NT/philemon.json", aliases: ["philemon", "phlm", "phm"] },
        { key: "hebrews", name: "Hebrews", corpus: "NT", path: "data/bible/NT/hebrews.json", aliases: ["hebrews", "heb"] },
        { key: "james", name: "James", corpus: "NT", path: "data/bible/NT/james.json", aliases: ["james", "jas", "jm"] },
        { key: "1peter", name: "1 Peter", corpus: "NT", path: "data/bible/NT/1peter.json", aliases: ["1 peter", "1peter", "first peter", "i peter", "1 pet", "1pet", "1 pe", "1pe"] },
        { key: "2peter", name: "2 Peter", corpus: "NT", path: "data/bible/NT/2peter.json", aliases: ["2 peter", "2peter", "second peter", "ii peter", "2 pet", "2pet", "2 pe", "2pe"] },
        { key: "1john", name: "1 John", corpus: "NT", path: "data/bible/NT/1john.json", aliases: ["1 john", "1john", "first john", "i john", "1 jn", "1jn"] },
        { key: "2john", name: "2 John", corpus: "NT", path: "data/bible/NT/2john.json", aliases: ["2 john", "2john", "second john", "ii john", "2 jn", "2jn"] },
        { key: "3john", name: "3 John", corpus: "NT", path: "data/bible/NT/3john.json", aliases: ["3 john", "3john", "third john", "iii john", "3 jn", "3jn"] },
        { key: "jude", name: "Jude", corpus: "NT", path: "data/bible/NT/jude.json", aliases: ["jude", "jud"] },
        { key: "revelation", name: "Revelation", corpus: "NT", path: "data/bible/NT/revelation.json", aliases: ["revelation", "revelations", "rev", "re", "apocalypse"] },

        { key: "tobit", name: "Tobit", corpus: "OT", path: "data/bible/OT/tobit.json", aliases: ["tobit", "tob"] },
        { key: "judith", name: "Judith", corpus: "OT", path: "data/bible/OT/judith.json", aliases: ["judith", "jdt"] },
        { key: "wisdom", name: "Wisdom", corpus: "OT", path: "data/bible/OT/wisdom.json", aliases: ["wisdom", "wisdom of solomon", "wis"] },
        { key: "sirach", name: "Sirach", corpus: "OT", path: "data/bible/OT/sirach.json", aliases: ["sirach", "ecclesiasticus", "sir"] },
        { key: "baruch", name: "Baruch", corpus: "OT", path: "data/bible/OT/baruch.json", aliases: ["baruch", "bar"] },
        { key: "1maccabees", name: "1 Maccabees", corpus: "OT", path: "data/bible/OT/1maccabees.json", aliases: ["1 maccabees", "1maccabees", "first maccabees", "i maccabees", "1 macc", "1macc"] },
        { key: "2maccabees", name: "2 Maccabees", corpus: "OT", path: "data/bible/OT/2maccabees.json", aliases: ["2 maccabees", "2maccabees", "second maccabees", "ii maccabees", "2 macc", "2macc"] },
        { key: "3maccabees", name: "3 Maccabees", corpus: "OT", path: "data/bible/OT/3maccabees.json", aliases: ["3 maccabees", "3maccabees", "third maccabees", "iii maccabees", "3 macc", "3macc"] },
        { key: "4maccabees", name: "4 Maccabees", corpus: "OT", path: "data/bible/OT/4maccabees.json", aliases: ["4 maccabees", "4maccabees", "fourth maccabees", "iv maccabees", "4 macc", "4macc"] },
        { key: "1enoch", name: "1 Enoch", corpus: "OT", path: "data/bible/OT/1enoch.json", aliases: ["1 enoch", "1enoch", "enoch", "ethiopic enoch"] },
        { key: "jubilees", name: "Jubilees", corpus: "ET", path: "data/bible/ET/bookofjubileesET.json", aliases: ["jubilees", "book of jubilees"] }
    ];

    function canonicalizeAlias(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[–—]/g, "-")
            .replace(/\./g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    const aliasEntries = [];
    for (const book of BIBLE_BOOKS) {
        const aliases = new Set([book.name, book.key, ...(book.aliases || [])]);
        for (const alias of aliases) {
            aliasEntries.push({ alias: canonicalizeAlias(alias), book });
        }
    }
    aliasEntries.sort((a, b) => b.alias.length - a.alias.length);

    function matchBookAtStart(text) {
        const normalized = canonicalizeAlias(text);
        for (const entry of aliasEntries) {
            if (normalized === entry.alias) {
                return { book: entry.book, rest: "" };
            }
            if (normalized.startsWith(entry.alias + " ")) {
                return { book: entry.book, rest: normalized.slice(entry.alias.length).trim() };
            }
        }
        return null;
    }

    function number(value, label) {
        const n = Number.parseInt(value, 10);
        if (!Number.isFinite(n) || n < 1) throw new Error(`Invalid ${label}: ${value}`);
        return n;
    }

    function parseOneSelector(selector, bookKey, context) {
        const raw = selector.trim();
        const compact = raw.replace(/\s+/g, "");
        if (!compact) throw new Error("Empty reference segment.");

        let m = compact.match(/^(\d+):(\d+)-(\d+):(\d+)$/);
        if (m) {
            const startChapter = number(m[1], "chapter");
            const startVerse = number(m[2], "verse");
            const endChapter = number(m[3], "chapter");
            const endVerse = number(m[4], "verse");
            context.chapter = startChapter;
            return { bookKey, startChapter, startVerse, endChapter, endVerse, raw };
        }

        m = compact.match(/^(\d+):(\d+)-(\d+)$/);
        if (m) {
            const chapter = number(m[1], "chapter");
            const startVerse = number(m[2], "verse");
            const endVerse = number(m[3], "verse");
            context.chapter = chapter;
            return { bookKey, startChapter: chapter, startVerse, endChapter: chapter, endVerse, raw };
        }

        m = compact.match(/^(\d+):(\d+)$/);
        if (m) {
            const chapter = number(m[1], "chapter");
            const verse = number(m[2], "verse");
            context.chapter = chapter;
            return { bookKey, startChapter: chapter, startVerse: verse, endChapter: chapter, endVerse: verse, raw };
        }

        m = compact.match(/^(\d+)-(\d+)$/);
        if (m && context.chapter) {
            const startVerse = number(m[1], "verse");
            const endVerse = number(m[2], "verse");
            return { bookKey, startChapter: context.chapter, startVerse, endChapter: context.chapter, endVerse, raw };
        }

        m = compact.match(/^(\d+)$/);
        if (m && context.chapter) {
            const verse = number(m[1], "verse");
            return { bookKey, startChapter: context.chapter, startVerse: verse, endChapter: context.chapter, endVerse: verse, raw };
        }

        if (m) {
            const chapter = number(m[1], "chapter");
            context.chapter = chapter;
            return { bookKey, startChapter: chapter, startVerse: null, endChapter: chapter, endVerse: null, raw };
        }

        m = compact.match(/^(\d+)-(\d+)$/);
        if (m) {
            const startChapter = number(m[1], "chapter");
            const endChapter = number(m[2], "chapter");
            context.chapter = startChapter;
            return { bookKey, startChapter, startVerse: null, endChapter, endVerse: null, raw };
        }

        throw new Error(`Could not parse reference segment: ${raw}`);
    }

    function parseReference(input) {
        const source = String(input || "").trim();
        if (!source) throw new Error("Enter a Bible reference.");

        const references = [];
        let currentBook = null;
        let context = { chapter: null };

        const majorParts = source.split(";").map(part => part.trim()).filter(Boolean);
        for (const part of majorParts) {
            const match = matchBookAtStart(part);
            let selectorsText = part;

            if (match) {
                currentBook = match.book;
                selectorsText = match.rest;
                context = { chapter: null };
            }

            if (!currentBook) {
                throw new Error(`Reference is missing a book name: ${part}`);
            }
            if (!selectorsText) {
                selectorsText = "1";
            }

            const minorParts = selectorsText.split(",").map(piece => piece.trim()).filter(Boolean);
            for (const selector of minorParts) {
                references.push(parseOneSelector(selector, currentBook.key, context));
            }
        }

        return {
            input: source,
            references
        };
    }

    function getBook(bookKey) {
        return BIBLE_BOOKS.find(book => book.key === bookKey) || null;
    }

    window.UniversalOfficeBibleReferenceParser = {
        BIBLE_BOOKS,
        parseReference,
        getBook,
        matchBookAtStart
    };
})();
