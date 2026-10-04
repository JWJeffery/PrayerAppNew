/**
 * Roman Breviary 1960/1962 -- data-file reader.
 *
 * Port of web/cgi-bin/DivinumOfficium/SetupString.pl (pinned Divinum Officium commit
 * 0ce8747d7dba3276fc05937635e02360b49a60a6, MIT). Implements the data-file mini-language:
 * [Section] headers with conditions, in-line conditional lines with their scopes, "@file:section"
 * inclusions with substitutions, whole-file inclusions, and officestring() month-week
 * composition. Latin only (the engine decides occurrence from the Latin files); no missa.
 *
 * `ctx` is the engine's mutable state (the Perl globals the conditionals read): version, day,
 * month, year, dayofweek, hora, dayname[], winner, commemoratio, commune, rule, winnerHash,
 * votive, monthday ... The parsed-file cache belongs to one computation and must be cleared
 * (clearCache) whenever the date changes, exactly as a fresh Perl process would start empty.
 */
(function (root) {
  'use strict';
  const RB = (root.RomanBreviary = root.RomanBreviary || {});
  const { day_of_week, monthday: monthdayFn } = RB.date;
  const doRead = RB.doRead;

  const T = (x) => !(x === undefined || x === null || x === '' || x === '0' || x === 0 || x === false); // Perl truthiness
  const S = (x) => (x === undefined || x === null ? '' : String(x));
  // Perl split(/sep/, str): trailing empty fields are removed.
  function perlSplit(str, sep) {
    if (str === undefined || str === null || str === '') return [];
    const parts = str.split(sep);
    while (parts.length && parts[parts.length - 1] === '') parts.pop();
    return parts;
  }

  const SCOPE_NULL = 0, SCOPE_LINE = 1, SCOPE_CHUNK = 2, SCOPE_NEST = 3;
  const RESOLVE_NONE = 0, RESOLVE_WHOLEFILE = 1, RESOLVE_ALL = 2;

  const STOPWORD_WEIGHTS = { sed: 1, vero: 1, atque: 2, attamen: 3, si: 0, deinde: 1 };
  const BACKSCOPED = { sed: 1, vero: 1, atque: 2, attamen: 3 };
  const STOP = 'sed|vero|atque|attamen|si|deinde';
  const SCOPE =
    '(?:\\bloco\\s+(?:hu[ij]us\\s+versus|horum\\s+versuum)\\b)?\\s*' +
    '(?:\\b(?:(?:dicitur|dicuntur)(?:\\s+semper)?|(?:hic\\s+versus\\s+)?omittitur|(?:hoc\\s+versus\\s+)?omittitur|' +
    '(?:h\\u00e6c\\s+versus\\s+)?omittuntur|(?:hi\\s+versus\\s+)?omittuntur|(?:haec\\s+versus\\s+)?omittuntur)\\b)?';
  const COND = '\\(\\s*((?:' + STOP + ')\\b)*(.*?)(' + SCOPE + ')?\\s*\\)';
  const CONDITIONAL_LINE_RE = new RegExp('^\\s*' + COND + '\\s*(.*)$', 'i');
  const CONDITIONAL_AFTER_HEADER_RE = new RegExp('^\\s*' + COND, 'i');
  const SECTION_RE = /^\s*\[([\p{L}\p{N}_ #,:-]+)\]/iu;
  const BLANKLINE_RE = /^\s*_?\s*$/;
  // Inclusion directive: "@file:keywords:substitutions" on its own line.
  const INCLUSION_SRC = '^\\s*@([^\\n:]+)?(?::([^\\n:]+?))?[^\\S\\n\\r]*(?::(.*))?$\\n?';


  // Perl regex source -> JS RegExp (unicode mode). Differences handled:
  //  - without /m Perl's `$` matches at the very end OR just before a final newline;
  //  - \w \W are Unicode-aware in Perl (accented Latin letters are word characters);
  //  - Perl accepts identity escapes of punctuation (\, \& \!) that JS 'u' mode rejects.
  // Everything else the data files use (classes, lazy quantifiers, \s, ^, flags g i m s) is the same.
  function perlRegExp(src, flags) {
    const f = flags.replace(/[^gims]/g, '') + 'u';
    const SYNTAX = '^$\\.*+?()[]{}|/';
    let out = '';
    let inClass = false;
    for (let i = 0; i < src.length; i++) {
      const c = src[i];
      if (c === '\\') {
        const n = src[++i];
        if (n === undefined) out += '\\\\';
        else if (n === 'w') out += inClass ? '\\p{L}\\p{N}\\p{M}_' : '[\\p{L}\\p{N}\\p{M}_]';
        else if (n === 'W') out += inClass ? '\\W' : '[^\\p{L}\\p{N}\\p{M}_]';
        else if (/[A-Za-z0-9]/.test(n) || SYNTAX.includes(n) || (inClass && n === '-')) out += '\\' + n;
        else out += n; // punctuation identity escape
      } else if (inClass) {
        if (c === ']') inClass = false;
        out += c;
      } else if (c === '[') {
        inClass = true;
        out += c;
      } else if (c === '$' && !f.includes('m')) {
        out += '(?=\\n?(?![\\s\\S]))';
      } else out += c;
    }
    return new RegExp(out, f);
  }

  // s/pattern/replacement/flags with the replacement read as a Perl double-quoted string:
  // $1..$9 and \1..\9 are capture groups; \n \t are escapes; \u \l \U \L \E change case.
  function perlSubstitute(text, pattern, replacement, flags) {
    const re = perlRegExp(pattern, flags);
    const expand = (groups) => {
      let out = '';
      let mode = ''; // 'U' | 'L' | ''
      let next = ''; // 'u' | 'l' | ''
      const add = (str) => {
        if (!str) return;
        let t = mode === 'U' ? str.toUpperCase() : mode === 'L' ? str.toLowerCase() : str;
        if (next) {
          t = (next === 'u' ? t[0].toUpperCase() : t[0].toLowerCase()) + t.slice(1);
          next = '';
        }
        out += t;
      };
      for (let i = 0; i < replacement.length; i++) {
        const c = replacement[i];
        if (c === '\\' && i + 1 < replacement.length) {
          const n = replacement[++i];
          if (n === 'n') add('\n');
          else if (n === 't') add('\t');
          else if (n === 'U' || n === 'L') mode = n;
          else if (n === 'E') mode = '';
          else if (n === 'u' || n === 'l') next = n;
          else if (/[0-9]/.test(n)) add(groups[+n]);
          else add(n);
        } else if (c === '$' && /[0-9]/.test(replacement[i + 1] || '')) {
          add(groups[+replacement[++i]]);
        } else add(c);
      }
      return out;
    };
    return text.replace(re, (...args) => {
      const groups = [];
      for (const a of args) {
        if (typeof a === 'number') break;
        groups.push(a);
      }
      return expand(groups);
    });
  }

  function createSetupString(store, ctx, directorium) {
    const cache = new Map(); // fullpath -> Map(section -> raw text)   (per computation)

    // ---------------------------------------------------------------- conditionals
    function getTempusId() {
      const dn0 = S(ctx.dayname[0]);
      const { day, month, dayofweek, version, hora } = ctx;
      const vesp = /Vespera/i.test(hora) || /Completorium/i.test(hora);
      const octOrNov = /^(10|11)\d\-/.test(S(ctx.monthday));
      let m;
      if (/^Adv/.test(dn0)) return 'Adventus';
      if (/^Nat/.test(dn0)) return month === 1 && (day >= 6 || (day === 5 && vesp)) ? 'Epiphaniæ' : 'Nativitatis';
      if (/^Epi/.test(dn0)) {
        if (month === 1 && day <= 13) return 'Epiphaniæ';
        if (month === 1 || (month === 2 && (day === 1 || (day === 2 && !vesp)))) return 'post Epiphaniam post partum';
        if (month === 2) return 'post Epiphaniam';
        return 'post Pentecosten in hieme';
      }
      if ((m = /^Quadp(\d)/.exec(dn0)) && (+m[1] < 3 || dayofweek < 3)) {
        return month === 1 || (month === 2 && (day === 1 || (day === 2 && !vesp))) ? 'Septuagesimæ post partum' : 'Septuagesimæ';
      }
      if ((m = /^Quad(\d)/.exec(dn0)) && +m[1] < 5) return 'Quadragesimæ';
      if (/^Quad/.test(dn0)) return 'Passionis';
      if (/^Pasc0/.test(dn0) && vesp && dayofweek === 6) return 'Vigilia Paschalis';
      if (/^Pasc0/.test(dn0)) return 'Octava Paschæ';
      if ((m = /^Pasc(\d)/.exec(dn0)) && (+m[1] < 5 || (+m[1] === 5 && (dayofweek < 3 || (!vesp && dayofweek === 3))))) return 'post Octavam Paschæ';
      if (/^Pasc6-(5|6)/.test(dn0)) return 'post Octavam Ascensionis';
      if ((m = /^Pasc(\d)/.exec(dn0)) && +m[1] < 7) return 'Octava Ascensionis';
      if (/^Pasc/.test(dn0)) return 'Octava Pentecostes';
      if (/^Pent01/.test(dn0) && dayofweek === 4) return 'Corpus Christi post Pentecosten';
      if ((m = /^Pent0(\d)/.exec(dn0)) && ((+m[1] === 1 && dayofweek > 4 && !(dayofweek === 6 && vesp)) || (+m[1] === 2 && (dayofweek < 5 || (dayofweek === 6 && vesp)))) && !/19(?:55|6)/.test(version)) return 'Octava Corpus Christi post Pentecosten';
      if (/^Pent02/.test(dn0) && dayofweek === 5 && !/1570/.test(version)) return 'SSmi Cordis post Pentecosten';
      if ((m = /^Pent0(\d)/.exec(dn0)) && ((+m[1] === 2 && dayofweek > 5 && !(dayofweek === 6 && vesp)) || (+m[1] === 3 && (dayofweek < 6 || (dayofweek === 6 && vesp)))) && /Divino/i.test(version)) return 'Octava SSmi Cordis post Pentecosten';
      if (/^Pent/.test(dn0) && !octOrNov) return 'post Pentecosten';
      return 'post Pentecosten in hieme';
    }

    function getDaynameForCondition() {
      const { day, month, year, winner, version, commemoratio, dayofweek, hora } = ctx;
      const vesp = /Vespera/i.test(hora) || /Completorium/i.test(hora);
      const w = S(winner);
      const winnerRule = S(ctx.winnerHash && ctx.winnerHash.get ? ctx.winnerHash.get('Rule') : undefined);
      if (month === 1 && (day === 6 || (day === 5 && vesp))) return 'Epiphaniæ';
      if (month === 1 && (day === 13 || (day === 12 && vesp))) return 'Baptismatis Domini';
      if (/Quad6\-[456]/.test(w)) return 'Tridui Sacri';
      if (/Quad6\-4/.test(w)) return 'in Cœna Domini';
      if (/Quad6\-5/.test(w)) return 'in Parasceve';
      if (/Quad6\-6/.test(w)) return 'Sabbato Sancto';
      if (/Pasc0\-0/.test(w) && vesp && dayofweek === 6) return 'Vigilia Paschalis';
      if (/10\-DU/.test(w) || /10\-DU/.test(S(commemoratio))) return 'regis DNJC';
      if (month === 11 && (day === 2 || (day === 3 && dayofweek === 1) || (day === 1 && day_of_week(11, 1, year) !== 6 && vesp))) return 'Omnium Defunctorum';
      if (month === 11 && day === 3) return 'Malachiae';
      if (month === 11 && day === 4) return 'Caroli';
      if (month === 12 && day === 6) return 'Nicolai';
      if (month === 12 && day === 28) return 'Nat28';
      if (month === 12 && day === 29) return 'Nat29';
      if (/Doctor/i.test(S(ctx.dayname[1])) || /Doctor/i.test(S(ctx.dayname[2]))) return 'doctorum';
      if (month === 8 && (day === 6 || (day === 5 && vesp))) return 'transfigurationis';
      if (/09-15$|09-DT|Quad5-5$/.test(w)) return 'septem doloris';
      if (/12-25/.test(w)) return 'Nativitatis';
      if (/Epi1-[1-6]/.test(S(ctx.dayname[0]))) return 'post Dominicam infra Octavam Epiphaniæ';
      if (/Epi1-[1-6]/.test(S(ctx.dayname[0]))) return 'post Epi1-0';
      if (/08-20|00-VB/.test(w)) return 'Bernardi';
      if (/3 lectio/i.test(winnerRule)) return '3 lectionum';
      if (/3 lectio/i.test(winnerRule)) return '3 lect';
      return '';
    }

    const subjects = {
      rubricis: () => ctx.version,
      rubrica: () => ctx.version,
      tempore: getTempusId,
      missa: () => ctx.missanumber,
      communi: () => ctx.version,
      die: getDaynameForCondition,
      feria: () => ctx.dayofweek + 1,
      commune: () => ctx.commune,
      votiva: () => ctx.votive,
      officio: () => ctx.dayname[1],
      ad: () => (ctx.missa ? 'missam' : ctx.hora),
      mense: () => ctx.month,
      dioecesis: () => ctx.dioecesis,
      tonus: () => ctx.chantTone,
      toni: () => ctx.chantTone
    };
    const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
    const predicates = {
      tridentina: (s) => /Trident/.test(S(s)),
      monastica: (s) => /Monastic/.test(S(s)),
      innovata: (s) => /2020 USA|NewCal/i.test(S(s)),
      innovatis: (s) => /2020 USA|NewCal/i.test(S(s)),
      paschali: (s) => /Paschæ|Ascensionis|Octava Pentecostes/i.test(S(s)),
      'post septuagesimam': (s) => /Septua|Quadra|Passio/i.test(S(s)),
      prima: (s) => +s === 1,
      secunda: (s) => +s === 2,
      tertia: (s) => +s === 3,
      longior: (s) => +s === 1,
      brevior: (s) => +s === 2,
      'summorum pontificum': (s) => /194[2-9]]|195[45]|196/.test(S(s)),
      feriali: (s) => /feria|vigilia/i.test(S(s)),
      'in solemnitatibus': (s) => /solemnis|resurrectionis/i.test(S(s)),
      'in hieme': (s) => /hieme|Adventus|Nativitatis|Epiphani|gesimæ|Passionis/i.test(S(s)),
      'in æstate': (s) => !/hieme|Adventus|Nativitatis|Epiphani|gesimæ|Passionis/i.test(S(s))
    };

    function vero(condition) {
      condition = S(condition).replace(/^\s*/, '').replace(/\s*$/, '');
      if (!condition) return 1; // the empty condition is true
      const autParts = perlSplit(condition, /\baut\b/);
      AUTEM: for (const autPart of autParts) {
        let negation = 0;
        const segs = autPart.split(/\b(et|nisi)\b/); // captures the separators, like Perl
        // Perl's split drops trailing empty fields
        while (segs.length && segs[segs.length - 1] === '') segs.pop();
        for (let seg of segs) {
          if (/nisi/.test(seg)) negation = 1;
          if (/et|nisi/.test(seg)) continue; // (Perl tests the unanchored regex, as here)
          seg = seg.replace(/^\s*(.*?)\s*$/, '$1').replace(/\s+/g, ' ');
          let parts = seg === '' ? [] : seg.split(/\s+/);
          let subject = parts[0];
          let predicate = parts.length > 1 ? parts.slice(1).join(' ') : undefined;
          if (!T(predicate)) {
            predicate = subject;
            subject = '';
          }
          if (T(subject) && !has(subjects, S(subject).toLowerCase())) {
            predicate = subject + ' ' + predicate;
            subject = '';
          }
          if (!T(subject)) subject = 'tempore';
          const predicateText = predicate;
          let pfn = predicate === undefined ? undefined : predicates[S(predicate).toLowerCase()];
          if (!pfn) {
            const re = new RegExp(S(predicateText), 'i');
            pfn = (s) => re.test(S(s));
          }
          const sfn = subjects[S(subject).toLowerCase()];
          const subjResult = sfn ? sfn() : undefined;
          // next AUTEM unless $subject && (&$predicate(&$subject()) xor $negation)
          if (!(sfn && (Boolean(pfn(subjResult)) !== Boolean(negation)))) continue AUTEM;
        }
        return 1;
      }
      return 0;
    }

    function parseConditional(stopwords, condition, scope) {
      let strength = 0;
      for (const w of S(stopwords).toLowerCase().split(/\s+/)) strength += STOPWORD_WEIGHTS[w] || 0;
      const result = vero(condition);
      let implicitBackscope = false;
      for (const w of S(stopwords).toLowerCase().split(/\s+/)) implicitBackscope = implicitBackscope || has(BACKSCOPED, w);
      scope = S(scope);
      const backscope = /versuum|omittuntur/i.test(scope)
        ? SCOPE_NEST
        : /versus|omittitur/i.test(scope)
          ? SCOPE_CHUNK
          : !/semper/i.test(scope) && implicitBackscope
            ? SCOPE_LINE
            : SCOPE_NULL;
      let forwardscope;
      if (/omittitur|omittuntur/i.test(scope)) forwardscope = SCOPE_NULL;
      else if (/dicuntur/i.test(scope)) forwardscope = backscope === SCOPE_CHUNK ? SCOPE_CHUNK : SCOPE_NEST;
      else forwardscope = backscope === SCOPE_CHUNK || backscope === SCOPE_NEST ? SCOPE_CHUNK : SCOPE_LINE;
      return { strength, result, backscope, forwardscope };
    }

    function processConditionalLines(lines) {
      const output = [];
      const COND_NOT_YET = 0, COND_AFFIRMATIVE = 1, COND_DUMMY = 2;
      let stack = [[COND_AFFIRMATIVE, SCOPE_NEST]];
      const offsets = [-1];
      const top = () => stack[stack.length - 1];

      for (const orig of lines) {
        let line = orig;
        const m = CONDITIONAL_LINE_RE.exec(line);
        if (m) {
          const c = parseConditional(m[1] || '', m[2], m[3]);
          let { strength, result, backscope, forwardscope } = c;
          line = m[4];

          if (top()[0] === COND_AFFIRMATIVE || strength >= offsets.length - 1) {
            if (strength >= offsets.length - 1) {
              stack = [];
            } else if (strength >= offsets.length - 1 - (stack.length - 1)) {
              stack.length = offsets.length - 1 - strength; // $#stack = $#offsets - $strength - 1
            }
            if (result) {
              const fence = offsets.length - 1 >= strength ? offsets[strength] : -1;
              if (backscope === SCOPE_LINE) {
                if (output.length - 1 > fence) output.pop();
              } else if (backscope === SCOPE_CHUNK) {
                while (output.length - 1 > fence && !BLANKLINE_RE.test(output[output.length - 1])) output.pop();
                while (output.length - 1 > fence && BLANKLINE_RE.test(output[output.length - 1])) output.pop();
              } else if (backscope === SCOPE_NEST) {
                output.length = fence + 1; // $#output = $fence
              }
            }
            if (forwardscope === SCOPE_NULL) {
              forwardscope = SCOPE_NEST;
              result = 1;
            }
            if (result) for (let i = 0; i <= strength; i++) offsets[i] = output.length - 1;
            while (strength < offsets.length - 1 - (stack.length - 1) - 1) stack.push([COND_DUMMY, forwardscope]);
            stack.push([result ? COND_AFFIRMATIVE : COND_NOT_YET, forwardscope]);
          }
          if (!T(line)) continue; // "next unless $line"
        }

        line = line.replace(/^~/, '');
        if (top()[0] === COND_AFFIRMATIVE) output.push(line);

        while (top()[1] === SCOPE_LINE || (top()[1] === SCOPE_CHUNK && BLANKLINE_RE.test(line))) {
          do {
            stack.pop();
          } while (stack.length && top()[0] === COND_DUMMY);
          if (stack.length === 0) stack.push([COND_AFFIRMATIVE, SCOPE_NEST]);
        }
      }
      return output;
    }

    // ---------------------------------------------------------------- parsing and inclusion
    function inclusionRegex() {
      return new RegExp(INCLUSION_SRC, 'gm');
    }

    function parseFile(fileLines, fname) {
      const sections = new Map();
      let key = '__preamble';
      let useThis = true;
      for (let line of fileLines) {
        let hm;
        if (line[0] === '[' && (hm = SECTION_RE.exec(line))) {
          const rest = line.slice(hm[0].length);
          const cm = CONDITIONAL_AFTER_HEADER_RE.exec(rest);
          const cond = cm ? cm[2] : undefined;
          if (!T(cond) || vero(cond)) {
            useThis = true;
            key = hm[1];
            sections.set(key, []);
          } else useThis = false;
        } else if (useThis) {
          if (line[0] === '@' && key !== '__preamble') {
            line = line.replace(new RegExp(INCLUSION_SRC, 'm'), (_m, a, b, c) => '@' + (a || fname) + ':' + (b || key) + (T(c) ? ':' + c : ''));
          }
          if (!sections.has(key)) sections.set(key, []);
          sections.get(key).push(line);
        }
      }
      const out = new Map();
      for (const [k, ls] of sections) out.set(k, processConditionalLines(ls).concat(['']).join('\n'));
      return out;
    }

    function doInclusionSubstitutions(text, subs) {
      const re = /(?:s\/([^/]*)\/([^/]*)\/([gism]*))|(?:(!?)(\d+)(?:-(\d+))?)/g;
      let m;
      while ((m = re.exec(S(subs)))) {
        if (m[5] && +m[5]) {
          const s = +m[5] - 1;
          const l = m[6] ? +m[6] - s : 1;
          const t1 = perlSplit(text, /\n/);
          const t2 = t1.splice(s, l);
          text = (m[4] ? t1 : t2).join('\n') + '\n';
        } else if (m[1] !== undefined) {
          text = perlSubstitute(text, m[1], m[2], m[3] || '');
        }
      }
      return text;
    }

    // Perl checklatinfile(\$file): true if Latin/<file>.txt exists. When it does not, Cistercian and
    // Monastic/Dominican folder names fall back to the Roman ones (SanctiM/x -> Sancti/x) and the
    // caller's name is rewritten. Returns {ok, file} with the possibly rewritten name.
    function checklatinfile(fileIn) {
      let file = fileIn;
      const txt = /\.txt$/.test(file) ? '.txt' : '';
      file = file.replace(/\.txt$/, '');
      const exists = (f) => store.exists('Latin', f + '.txt');
      if (exists(file)) return { ok: true, file: fileIn };
      let f2 = file.replace(/(Sancti|Tempora|Commune)(?:Cist)(.*)/, '$1M$2');
      const cistChanged = f2 !== file;
      if (cistChanged) {
        file = f2;
        if (exists(file)) return { ok: true, file: file + txt };
      }
      f2 = file.replace(/(Sancti|Tempora|Commune)(?:M|OP)(.*)/, '$1$2');
      if (f2 !== file) {
        file = f2;
        if (exists(file)) return { ok: true, file: file + txt };
      }
      return { ok: false, file: cistChanged ? fileIn : fileIn };
    }

    function loadParsed(lang, fname) {
      const fullpath = lang + '/' + fname;
      if (cache.has(fullpath)) return cache.get(fullpath);
      const text = store.horas(lang, fname);
      let sections = new Map();
      if (text !== undefined) sections = parseFile(doRead(text), fname.replace(/\.txt$/, ''));
      if (sections.size === 0) return null;
      // Latin has no lower layer: only the preamble gains a newline when present, and an
      // [Officium] section overrides the first field of [Rank].
      if (sections.has('__preamble')) sections.set('__preamble', sections.get('__preamble') + '\n');
      if (sections.has('Officium')) {
        const newrank = perlSplit(sections.get('Rank'), ';;');
        newrank[0] = S(sections.get('Officium')).replace(/\s+$/, '');
        sections.set('Rank', newrank.join(';;'));
      }
      cache.set(fullpath, sections);
      return sections;
    }

    // An "office": the section hash returned by setupstring(). get() resolves @-inclusions lazily.
    class Office {
      constructor(lang, ofname, raw, mode, fullpath) {
        this.lang = lang;
        this.fname = ofname;
        this.raw = raw; // Map: section -> raw text (conditionals processed, @ lines normalised)
        this.mode = mode;
        this.fullpath = fullpath;
        this.resolved = new Map();
        this.overrides = new Map();
      }
      has(k) {
        return this.overrides.has(k) || this.raw.has(k);
      }
      keys() {
        return [...new Set([...this.raw.keys(), ...this.overrides.keys()])];
      }
      set(k, v) {
        this.overrides.set(k, v);
      }
      get(k) {
        if (this.overrides.has(k)) return this.overrides.get(k);
        if (!this.raw.has(k)) return undefined;
        if (this.resolved.has(k)) return this.resolved.get(k);
        let text = this.raw.get(k);
        if (this.mode === RESOLVE_ALL && this._shouldResolve(k, text)) text = this._resolve(k, text);
        text = this._safeguard(k, text);
        this.resolved.set(k, text);
        return text;
      }
      _shouldResolve(k, text) {
        return !k.includes('Commemoratio') && ((!k.includes('LectioE') && !k.includes('Evangelium')) || text.includes('Commune'));
      }
      _resolve(k, text) {
        let iiij = 0;
        let changed = true;
        while (text.includes('@') && changed) {
          let count = 0;
          text = text.replace(inclusionRegex(), (_m, a, b, c) => {
            count++;
            return getLoadtimeInclusion(this, a, b || k, c);
          });
          changed = count > 0;
          if (!changed) break;
          if (iiij++ > 6) {
            ctx.error = (ctx.error || '') + `Error in resolving ${this.fname} : ${k}<br>`;
            return 'Cannot resolve too deeply nested Hashes';
          }
        }
        return text;
      }
      _safeguard(k, text) {
        if (k === 'Officium') return text.replace(/\s+$/, '');
        if (k === 'Rank' && this.has('Officium')) {
          const off = S(this.get('Officium'));
          return text.replace(/^.*?;;/, () => off + ';;');
        }
        return text;
      }
      toObject() {
        const o = {};
        for (const k of this.keys()) o[k] = this.get(k);
        return o;
      }
    }

    function getLoadtimeInclusion(office, ftitle, section, substitutions) {
      // Paschaltide: use the special common for apostles/martyrs, but never in Hymnus/Oratio/Lectio...
      const callerfname = office.fname.replace(/\.txt$/, '');
      if (S(ctx.dayname[0]).includes('Pasc') && !ctx.missa && !/C[123]/.test(callerfname) && !/Hymnus|Oratio|Lectio|Secreta|Postcommunio|Versum/i.test(section)) {
        if (ftitle !== undefined) ftitle = ftitle.replace(/(C[123][abcd]*)(?![p\d])/g, '$1p');
      }
      const incl = T(ftitle) ? setupstring(office.lang, ftitle + '.txt', RESOLVE_WHOLEFILE) : office;
      let text;
      if (incl && incl.has(section)) {
        text = S(incl.get(section)).replace(/\n+$/, '\n');
      }
      if (T(text)) return doInclusionSubstitutions(text, substitutions);
      return `${S(ftitle)}:${section} is missing!`;
    }

    function setupstring(lang, ofname, mode) {
      if (mode === undefined) mode = RESOLVE_ALL;
      let fname = ofname;
      if (lang === 'Latin') fname = checklatinfile(ofname).file;
      const parsed = loadParsed(lang, fname);
      if (!parsed) return null;
      const fullpath = lang + '/' + fname;
      const raw = new Map(parsed);
      if (mode !== RESOLVE_NONE) {
        // Whole-file inclusions from the preamble.
        const pre = raw.get('__preamble');
        if (pre !== undefined && pre.includes('@')) {
          const re = inclusionRegex();
          let m;
          while ((m = re.exec(pre))) {
            const inclFname = S(m[1]) + '.txt';
            if (fullpath.includes(inclFname)) break; // cyclic
            const incl = setupstring(lang, inclFname, RESOLVE_WHOLEFILE);
            if (incl) for (const k of incl.keys()) if (!T(raw.get(k))) raw.set(k, incl.get(k));
          }
        }
        raw.delete('__preamble');
      }
      return new Office(lang, fname, raw, mode, fullpath);
    }

    // ---------------------------------------------------------------- officestring
    function officestring(lang, fname, flag) {
      const version = ctx.version;
      if (!/^Tempora[^/]*\/(?:Pent|Epi)/.test(fname) || /^Tempora[^/]*\/Pent0[1-5]/.test(fname)) {
        const s = setupstring(lang, fname);
        if (!s) return null;
        if (/196/.test(version) && /Feria.*?(III|IV) Adv/i.test(S(s.get('Rank'))) && ctx.day > 16) {
          s.set('Rank', S(s.get('Rank')).replace(/;;2\.1/, ';;4.9'));
        } else if (/cist/i.test(version) && /Feria.*?(III|IV) Adv/i.test(S(s.get('Rank'))) && ctx.day > 16) {
          s.set('Rank', S(s.get('Rank')).replace(/;;1\.15/, ';;2.1'));
        }
        return s;
      }
      ctx.monthday = monthdayFn(ctx.day, ctx.month, ctx.year, (/196/.test(version) ? 1 : 0) + 0, flag ? 1 : 0);
      const s = setupstring(lang, fname);
      if (!ctx.monthday) return s;
      if (!s) return null;
      const rank = perlSplit(S(s.get('Rank')), ';;');
      let m = 0, w = 0, mm;
      if ((mm = /([0-9][0-9])([0-9])\-[0-9]/.exec(ctx.monthday))) {
        m = +mm[1];
        w = +mm[2];
      }
      const weeks = ['I.', 'II.', 'III.', 'IV.', 'V.'];
      let monthName = '';
      if (m) {
        const cm = setupstring(lang, 'Psalterium/Comment.txt');
        const months = perlSplit(S(cm && cm.get('Menses')), /\n/);
        monthName = months[m - 8];
      }
      let weekName = '';
      if (w) weekName = weeks[w - 1];
      rank[0] = S(rank[0]) + ` ${S(weekName)} ${S(monthName)}`;
      s.set('Rank', rank.join(';;'));
      const mo = setupstring(lang, 'Tempora/' + ctx.monthday + '.txt');
      if (mo) {
        // Perl: `$version =~ //i && $key =~ /Rank/i` uses an empty pattern (= the last successful
        // match); recorded here as written in the oracle comparison.
        for (const k of mo.keys()) {
          if (ctx.officestringKeepRank && /Rank/i.test(k)) continue;
          s.set(k, mo.get(k));
        }
      }
      return s;
    }

    function getdialog(name) {
      if (!getdialog.loaded) {
        const text = store.setup('horas.dialog');
        getdialog.sections = text === undefined ? new Map() : parseFile(doRead(text), 'horas');
        getdialog.loaded = true;
      }
      const v = getdialog.sections.get(name);
      return v === undefined ? v : v.replace(/\n$/, '');
    }

    function clearCache() {
      cache.clear();
    }

    return { setupstring, officestring, checklatinfile, getdialog, clearCache, vero, processConditionalLines, parseFile, doInclusionSubstitutions, RESOLVE_ALL, RESOLVE_WHOLEFILE, RESOLVE_NONE };
  }

  RB.createSetupString = createSetupString;
  RB.perlSubstitute = perlSubstitute;
  RB.perlRegExp = perlRegExp;
  RB.perlSplit = perlSplit;
  RB.perlTrue = T;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})(typeof globalThis !== 'undefined' ? globalThis : this);
