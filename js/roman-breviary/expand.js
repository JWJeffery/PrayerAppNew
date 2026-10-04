/**
 * Roman Breviary 1960/1962 -- turning an hour's script into finished text (engine rebuild, phase 3 stage B).
 *
 * Port of the remaining text work of the pinned Divinum Officium commit
 * 0ce8747d7dba3276fc05937635e02360b49a60a6 (MIT): resolve_refs/adjust_refs/getantcross (horas.pl),
 * expand/getunit/setcell/setcross/setvrbar (webdia.pl), the script functions of horasscripts.pl
 * (&psalm, &Gloria, &Alleluia, &Dominus_vobiscum, ...), lectio (via matins.js), and the text
 * helpers of LanguageTextTools.pm / horascommon.pl (process_inline_alleluias, suppress_alleluia,
 * spell_var, omit_regexp).
 *
 * Output: the same cell HTML that the Perl engine prints for the first column (one <TR><TD> per
 * unit), which scripts/parse-officium-html.mjs already turns into the app's blocks.
 *
 * Only the branches reachable for Rubrics 1960 plain text are ported (no chant notation, no
 * Monastic/Cistercian/Tridentine variants); the differential test against the Perl output keeps the
 * omissions honest. Settings are the engine's defaults for the website (noflexa, noinnumbers, ...).
 */
(function (root) {
  'use strict';
  const RB = (root.RomanBreviary = root.RomanBreviary || {});
  const { perlSplit, perlTrue: T, perlSubstitute, perlRegExp } = RB;

  const S = (x) => (x === undefined || x === null ? '' : String(x));
  const N = (x) => {
    const m = /^\s*[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/.exec(S(x));
    return m ? parseFloat(m[0]) : 0;
  };
  const chompd = (s) => S(s).replace(/\n$/, '').replace(/\r/g, '');
  const WORD = '[\\p{L}\\p{N}\\p{M}_]';

  // Website defaults of the settings the text code consults (see the oracle's "globals").
  const SETTINGS = { nofancychars: 0, noflexa: 1, noinnumbers: 1, nonumbers: 0, psalmvar: 0, priest: 0 };

  function createRenderer(H) {
    const { api } = H;
    const { ctx, ss, setfont, FONT } = api;
    const store = api.cal.store;
    const off = api.off;

    // ------------------------------------------------------------------ language tables
    // Latin only for now; "lang" is carried through so English can be added without reshaping.
    const getLang = () => ctx.lang1;
    const tables = {};
    function loadTables() {
      api.loadLanguage();
      const comm = {};
      let omits = [];
      for (const l of ['Latin', 'English']) {
        const c = off(ss.setupstring(l, 'Psalterium/Comment.txt'));
        const p = perlSplit(S(c.get('Preces')), '\n')[1];
        const f = perlSplit(S(c.get('Suffragium')), '\n')[0];
        omits.push(S(p) + '|' + S(f));
        comm[l] = c;
      }
      // Perl: /\b(?:...)\b/ -- Unicode word boundaries
      tables.omit = new RegExp(`(?<!${WORD})(?:${omits.join('|')})(?!${WORD})`, 'u');
      tables.alleluia = api.language.alleluiaRe;
    }

    const prayerText = (name) => api.prayer(name);
    const translate = (name) => api.translate(name);
    const rubric = (name) => {
      const r = off(ss.setupstring(getLang(), 'Psalterium/Common/Rubricae.txt')).get(name);
      return T(r) ? r : name;
    };
    const prex = (name) => {
      const r = api.language.preces.get(name);
      return T(r) ? r : name;
    };

    // ------------------------------------------------------------------ small state predicates
    const dn0 = () => S(ctx.dayname[0]);
    function triduum_gloria_omitted() {
      return /Quad6/i.test(dn0()) && N(ctx.dayofweek) > 3 && N(ctx.vespera) !== 1;
    }
    function Septuagesima_vesp() {
      const d = N(ctx.dayofweek);
      return d === 6 && /Vespera/i.test(S(ctx.hora)) &&
        ((N(ctx.vespera) === 1 && /Quadp1/.test(dn0())) || (N(ctx.vespera) === 3 && /Quadp1-0/.test(S(ctx.cwinner))));
    }

    // ------------------------------------------------------------------ cross after the antiphon's words
    function depunct(item) {
      item = item.replace(/[.,:?!"';*()]/g, '');
      item = item.replace(/[áÁ]/g, 'a').replace(/[éÉ]/g, 'e').replace(/[íí]/g, 'i');
      item = item.replace(/[Jj]/g, (c) => (c === 'J' ? 'I' : 'i'));
      item = item.replace(/[óöõÓÖÔ]/g, 'o').replace(/[úüûÚÜÛ]/g, 'u').replace(/æ/g, 'ae').replace(/œ/g, 'oe');
      return item;
    }
    function getantcross(psalmlineIn, antlineIn) {
      const psalmline0 = perlSplit(psalmlineIn.replace(/^\s+/, ''), /\s+/);
      const antline = perlSplit(antlineIn.replace(/^\s+/, ''), /\s+/);
      let pind = 0, aind = 0;
      let psalmline = '';
      while (aind < antline.length && pind < psalmline0.length) {
        let item1 = psalmline0[pind];
        pind++;
        item1 = depunct(item1);
        if (!T(item1)) continue;
        let item2 = antline[aind];
        aind++;
        item2 = depunct(item2);
        if (!T(item2)) { pind--; continue; }
        if (!perlRegExp(item2, 'i').test(item1)) return psalmlineIn;
        psalmline += ' ' + psalmline0[pind - 1];
      }
      if (aind < antline.length && pind === psalmline0.length) return psalmlineIn;
      while (pind < psalmline0.length && !T(depunct(psalmline0[pind]))) { psalmline += ' ' + psalmline0[pind]; pind++; }
      psalmline += ' /:‡:/';
      while (pind < psalmline0.length) { psalmline += ' ' + psalmline0[pind]; pind++; }
      return psalmline;
    }

    // ------------------------------------------------------------------ verse formatting (handleverses, plain text)
    function handleverses(lines) {
      return lines.map((l) => {
        let t = l;
        // nonumbers is off; noinnumbers is on: drop the subverse letter and any inline "(n)"
        if (SETTINGS.nonumbers) {
          t = t.replace(/^(?:\d+:)?\d+[a-z]?\s*/, '').replace(/\s*\(\d+[a-z]?\)/, '');
        } else if (SETTINGS.noinnumbers) {
          t = t.replace(/(\d)[a-z]/, '$1').replace(/\(\d+[a-z]?\)/, '');
        }
        if (!SETTINGS.nonumbers) {
          t = t.replace(/^(?:\d+:)?\d+[a-z]?/, (m) => `/:${m}:/`);
          t = t.replace(/\(\d+[a-z]?\)/, (m) => `/:${m}:/`);
        }
        t = t.replace(/(\([^\n]*?\))/, (m) => `/:${m}:/`);
        if (SETTINGS.noflexa) {
          t = t.replace(/‡\s+([^\n]*?)\*\s*/g, '* $1');
          t = t.replace(/†\s*/g, '');
        } else {
          t = t.replace(/\s‡\s/g, ' † ');
        }
        return t;
      });
    }

    // ------------------------------------------------------------------ &psalm
    const counters = { psalmnum1: 0 };
    function psalm(args) {
      let [psnum] = args;
      let rest = args.slice(1);
      let nogloria = false;
      let v1 = 0, v2 = 1000, c1 = '', c2 = '';
      let antline;
      if (rest.length < 3) {
        if (/^1$/.test(S(rest[0]))) { nogloria = true; rest = rest.slice(1); }
        antline = rest[1];
      } else {
        let m = /^(\d+)([a-z])?/.exec(S(rest[0]));
        if (m) { v1 = +m[1]; c1 = m[2] || ''; }
        m = /^(\d+)([a-z])?/.exec(S(rest[1]));
        if (m) { v2 = +m[1]; c2 = m[2] || ''; }
        antline = rest[3];
      }
      psnum = S(psnum).replace(/^-(.*)/, '$1');
      const fname = `Psalm${psnum}.txt`;
      const rel = `Psalterium/Psalmorum/${fname}`;
      let lines = RB.doRead(store.horas(getLang(), rel) !== undefined ? store.horas(getLang(), rel) : store.horas('Latin', rel));
      if (!lines.length) return `Psalm${psnum} not found`;

      let title = `${translate('Psalmus')} ${psnum}`;
      if (v1) title += `(${v1}${c1}-${v2}${c2})`;
      let source;
      if (N(psnum) > 150 && N(psnum) < 300) {
        const m = /\(?(.*?) \* (.*?)\)?\s*$/.exec(lines.shift());
        if (m) { title = m[1]; source = m[2]; }
        if (v1) source = S(source).replace(/:[^]*$/, `:${v1}-${v2}`);
      }
      if (v1) {
        lines = lines.filter((l) => {
          const m = /^(?:\d+:)?(\d+)([a-z])?/.exec(l);
          if (!m) return false;
          const v = +m[1], c = m[2] || '';
          return (v === v1 && (!c1 || c >= c1)) || (v === v2 && (!c2 || c <= c2)) || (v > v1 && v < v2);
        });
      }
      if (T(antline) && N(psnum) !== 232) {
        lines[0] = S(lines[0]).replace(/^(\d+:\d+[a-z]? )(.*)/, (_m, a, b) => a + getantcross(b, antline));
        if (/\/:‡:\/$/.test(lines[0])) {
          lines[0] = lines[0].replace(/\/:‡:\/$/, '');
          lines[1] = S(lines[1]).replace(/^(\d+:\d+[a-z]? )/, '$1/:‡:/ ');
        }
      }
      lines = handleverses(lines);
      // put initial at begin (Quicumque has no verse numbers)
      if (SETTINGS.nonumbers || N(psnum) === 234) lines[0] = S(lines[0]).replace(/^(?=\p{L})/u, 'v. ');
      let output = `!${title}`;
      if (!(230 < N(psnum) && N(psnum) < 234)) output += ` [${++counters.psalmnum1}]`;
      if (T(source)) output += `\n!${source}`;
      output += '\n' + lines.join('\n') + '\n';
      if (N(psnum) !== 210 && !nogloria) output += '&Gloria\n';
      if (N(psnum) === 94) output = output.replace(/\$ant/g, `Ant. ${S(antline)}`);
      output = output.replace(/94C/, '94');
      return output;
    }

    // ------------------------------------------------------------------ the other script functions
    let precesferialesLocal = 0;
    const scriptFunctions = {
      teDeum: () => `\n!Te Deum\n${prayerText('Te Deum')}`,
      Deus_in_adjutorium: () => prayerText('Deus in adjutorium'),
      Alleluia: () => {
        const t = perlSplit(prayerText('Alleluia'), '\n');
        return /Quad/i.test(dn0()) && !Septuagesima_vesp() ? t[1] : t[0];
      },
      Gloria: () => {
        if (triduum_gloria_omitted()) return '';
        if (/Requiem gloria/i.test(S(ctx.rule))) return prayerText('Requiem');
        return prayerText('Gloria');
      },
      Gloria1: () => {
        if (/(Quad5|Quad6)/i.test(dn0()) && !/Sancti/i.test(S(ctx.winner)) && !/Gloria responsory/i.test(S(ctx.rule))) return '';
        return prayerText('Gloria1');
      },
      Gloria2: () => {
        if (/(Quad[56])/i.test(dn0())) return '';
        if (/Requiem gloria/i.test(S(ctx.rule))) return prayerText('Requiem');
        return prayerText('Gloria');
      },
      Dominus_vobiscum: () => {
        const t = perlSplit(prayerText('Dominus'), '\n');
        let text;
        if (T(SETTINGS.priest)) text = `${t[0]}\n${t[1]}`;
        else {
          if (!precesferialesLocal) text = `${t[2]}\n${t[3]}`;
          else text = S(t[4]);
          precesferialesLocal = 0;
        }
        return text;
      },
      Dominus_vobiscum1: () => {
        if ((T(api.preces('Dominicales et Feriales')) || T(ctx.litaniaflag)) && !T(SETTINGS.priest)) precesferialesLocal = 1;
        return scriptFunctions.Dominus_vobiscum();
      },
      Dominus_vobiscum2: () => {
        if (!T(SETTINGS.priest)) precesferialesLocal = 1;
        return scriptFunctions.Dominus_vobiscum();
      },
      Benedicamus_Domino: () => {
        const text = prayerText('Benedicamus Domino');
        if (/(Laudes|Vespera)/i.test(S(ctx.hora)) && ((/Pasc0/i.test(dn0())) || Septuagesima_vesp())) {
          return text.replace(/\.\s*\n/g, () => ', ' + prayerText('Alleluia Duplex').toLowerCase() + '\n');
        }
        return text;
      },
      Divinum_auxilium: () => {
        const text = perlSplit(prayerText('Divinum auxilium'), /\n/);
        text[text.length - 2] = `V. ${text[text.length - 2]}`;
        text[text.length - 1] = S(text[text.length - 1]).replace(/^[^\n]*\. /, '');
        text[text.length - 1] = `R. ${text[text.length - 1]}`;
        return text.join('\n');
      },
      Domine_labia: () => prayerText('Domine labia'),
      lectio: (n) => H.matins.lectio(+n),
      // used by the office of All Souls: a section of the day's own text, or a heading expanded as in specials()
      special: (name) => {
        const w = api.cal.ctx.winnerHash;
        if (w.has(name)) return chompd(w.get(name)) + '\n';
        if (/^#/.test(name)) return H.specials([name], 1).join('\n');
        return `${name} is missing`;
      },
      psalm: (...a) => psalm(a)
    };

    // parse_script_arguments: numeric literals and single-quoted strings
    function parseScriptArguments(listStr) {
      if (listStr === undefined) return [];
      return listStr.split(/,(?=(?:[^']|'[^']*')*$)/).map((p) => {
        const m = /'(.*)'|(-?\d+)/.exec(p);
        return m ? (T(m[1]) ? m[1] : m[2]) : undefined; // Perl: $1 || $2
      });
    }

    // ------------------------------------------------------------------ expand
    function expand(lineIn, antlineIn) {
      let line = lineIn.replace(/^\s+/, '').replace(/\s+$/, '');
      const sm = /^([&$](?:rubrica |Preces )?)/.exec(line);
      if (!sm) return line;
      const sigil = sm[1];
      line = line.slice(sigil.length);
      if (sigil === '&') {
        const m = /^(.*?)(?:[(](.*)[)])?$/s.exec(line);
        const args = [...parseScriptArguments(m[2]), getLang()];
        if (T(antlineIn)) args.push(S(antlineIn).replace(/^\s*Ant\. /i, ''));
        const fn = scriptFunctions[m[1]];
        if (!fn) throw new Error(`Invalid script function ${m[1]}`);
        return S(fn(...args));
      }
      if (sigil === '$rubrica ') return rubric(line);
      if (sigil === '$Preces ') return prex(`Preces ${line}`);
      return prayerText(line);
    }

    // ------------------------------------------------------------------ resolve_refs
    function setcross(line) {
      return line.replace(/ (\+{1,3}) /g, (_m, p) =>
        ` <span style='color:red; font-size:1.25em'>${SETTINGS.nofancychars ? p : p === '+++' ? '✙︎' : p === '++' ? '+' : '✠'}</span> `);
    }
    function setvrbar(line) {
      if (SETTINGS.nofancychars) return line;
      return line.replace(/^V\./, '℣.').replace(/^R\./, '℟.');
    }

    function adjust_refs(name) {
      if (/&Gloria/.test(name) && /Requiem gloria/i.test(S(ctx.rule))) return '$Requiem';
      if ((/&Gloria$/i.test(name) && triduum_gloria_omitted()) ||
        ((/&Gloria[12]/i.test(name) && /(Quad[56])/i.test(dn0())) && !/Sancti/i.test(S(ctx.winner)) && !/Gloria responsory/i.test(S(ctx.rule)))) {
        return setfont(FONT.smallfont, translate('Gloria omittitur'));
      }
      if (!T(SETTINGS.priest) && ((/&Dominus_vobiscum1/i.test(name) && T(api.preces('Dominicales et Feriales'))) || /&Dominus_vobiscum2/i.test(name))) {
        return perlSplit(prayerText('Dominus'), '\n')[4];
      }
      return name;
    }

    function resolve_refs(text) {
      const t = perlSplit(text, '\n');
      if (!t.length) return '';
      if (tables.omit.test(t[0])) {
        t[0] = t[0].replace(/^\s*#/, '!!!');
      } else {
        const m = /^\s*(#[^\n]*)(\{[^\n]*\})?\s*$/.exec(t[0]);
        if (m) t[0] = '!!' + translate(m[1]).slice(1) + S(m[2]);
      }
      const resolved = [];
      let merged = '';
      for (let it = 0; it < t.length; it++) {
        let line = adjust_refs(t[it]);
        line = line.replace(/\s+$/, '').replace(/^\s+/, '');
        const mergeWithNext = /~$/.test(line);
        if (mergeWithNext) line = line.replace(/~$/, '');
        if (/^[#$&]/.test(line)) {
          line = line.replace(/\./g, '');
          if (/psalm/.test(line) && it > 0 && /^\s*Ant\. /i.test(t[it - 1])) {
            line = expand(line, t[it - 1]);
            if (/‡/.test(line) && resolved.length) resolved[resolved.length - 1] += ' ' + setfont(FONT.smallfont, '‡');
          } else {
            line = expand(line);
          }
          if (!/<input/i.test(line)) line = resolve_refs(line);
        }
        if (/^Ant\./.test(line)) line = perlSubstitute(line, '(\\w)$', '$1.', '');
        let pm = /^(R\.br\.|R\.|V\.|Ant\.|Benedictio\.|Absolutio\.|Responsorium\.)([^\n]*)/.exec(line);
        if (pm) {
          let h = setvrbar(pm[1]);
          h = h.replace(/(Benedictio|Absolutio)/, (m) => translate(m));
          line = setfont(FONT.redfont, h) + pm[2];
        }
        line = setcross(line);
        let m;
        if ((m = /^!!!([^\n]*)/.exec(line))) {
          line = setfont(FONT.smallblack, m[1]);
        } else if ((m = /^!!([^\n]*)/.exec(line))) {
          let l = m[1];
          let suffix = '';
          const sm = /(\{[^:].*?\})/.exec(l);
          if (sm) { suffix = setfont(FONT.smallblack, sm[1]); l = l.replace(sm[0], ''); }
          line = setfont(FONT.largefont, l) + ` ${suffix}\n`;
        } else if ((m = /^!([^\n]*)/.exec(line))) {
          let l = m[1];
          let suffix = '';
          let sm = /(\s*\{[^:].*?\})/.exec(l);
          if (sm) { suffix = setfont(FONT.smallblack, sm[1]); l = l.replace(sm[0], ''); }
          sm = /(\s*\[[^:].*?\])/.exec(l);
          if (sm) { suffix = setfont(FONT.smallblack, sm[1]); l = l.replace(sm[0], ''); }
          line = setfont(FONT.redfont, l) + suffix;
        } else if ((m = /^r\.\s*(.\.?)([^\n]*)/s.exec(line))) {
          line = setfont(FONT.largefont, m[1]) + m[2];
        } else if ((m = /^v\.\s*([^\n]*)/.exec(line)) || (m = /\{:.*?:\}\s*v\.\s*([^\n]*)/.exec(line))) {
          const first = m[1];
          line = setfont(FONT.initiale, first.slice(0, 1)) + first.slice(1);
        }
        if (/\/:[^\n]*«[^\n]*»[^\n]*:\//.test(line)) line = line.replace(/«\s?([^\n]*?)\s?»/g, "<span class='nigra'>$1</span>");
        line = line.replace(/\/:([^\n]*?):\//g, (_m, a) => setfont(FONT.smallfont, a));
        line = line.replace(/\[([æaeiou]m?)\]/g, (_m, a) => setfont('italic', a));
        if (mergeWithNext) merged += line + ' ';
        else { resolved.push(merged + line); merged = ''; }
      }
      resolved.push('');
      let block = resolved.join('<br/>\n');
      block = block.replace(/<br\/>\s*<br\/>/gi, '<br/>');
      block = block.replace(/<\/P>\s*<br\/>/gi, '</P>');
      return block;
    }

    // ------------------------------------------------------------------ cell text post-processing
    function spell_var(t) {
      // version "Rubrics 1960" matches /196/: i for j, outside tags
      return t.split(/(<[^<>]*>)/).map((part) => {
        if (part.startsWith('<')) return part;
        return part.replace(/[Jj]/g, (c) => (c === 'J' ? 'I' : 'i')).replace(/H-Iesu/g, 'H-Jesu').replace(/er eúmdem/g, 'er eúndem');
      }).join('');
    }

    function activate_links(text) {
      const hora = S(ctx.hora);
      const re = /%(.*?)%/i;
      if (/Matutinum/i.test(hora)) return text.replace(re, (_m, a) => `<A HREF="#" onclick="hset('Laudes');">${a}</A>`);
      if (/Vespera/i.test(hora)) return text.replace(re, (_m, a) => `<A HREF="#" onclick="defunctorum('Vespera');">${a}</A>`);
      if (/Laudes/i.test(hora)) return text.replace(re, (_m, a) => `<A HREF="#" onclick="defunctorum('Matutinum');">${a}</A>`);
      return text;
    }

    function topnext_cell(text, searchind) {
      const a = perlSplit(text, '<br/>');
      if (a.length > 2) {
        const hora = S(ctx.hora);
        return `<DIV ALIGN='right'><FONT SIZE='1' COLOR='green'><A HREF='#${hora}top'>Top</A>&nbsp;&nbsp;<A HREF='#${hora}${searchind + 1}'>Next</A></FONT></DIV>\n`;
      }
      return '';
    }

    function setcell(textIn, state) {
      if (!T(textIn) || /^[_\s]+$/.test(textIn)) return '';
      let text = resolve_refs(textIn);
      if (!T(text)) return '';
      const hora = S(ctx.hora);
      if (!/{omittitur}/.test(text)) state.searchind++;
      let out = `<TR><TD VALIGN='TOP' WIDTH='100%'${/{omittitur}/.test(text) ? '' : ` ID='${hora}${state.searchind}'`}>`;
      out += topnext_cell(text, state.searchind);
      if (/%(.*?)%/.test(text)) text = activate_links(text);

      const alle = tables.alleluia;
      text = api.process_inline_alleluias(text, /Pasc/.test(dn0()));
      if (/Quadp|Quad[1-5]|Quad6-[0-5]/i.test(dn0()) && !Septuagesima_vesp()) {
        text = text.replace(new RegExp(`[,.]?\\s*(?:${alle})`, 'igu'), '');
      }
      text = text.replace(/<br\/>\s*<br\/>/gi, '<br/>');
      if (/Latin(-bea)?$/i.test(getLang())) text = spell_var(text);
      text = text.replace(/wait[0-9]+/gi, '');
      text = text.replace(/_/g, ' ');
      text = text.replace(/\{:.*?:\}/gs, '');
      text = text.replace(/`/g, '');
      text = text.replace(/\s([»!?;:])/g, '&nbsp;$1');
      text = text.replace(/«\s/g, '«&nbsp;');
      text = text.replace(/\s&\s/, ' &amp; ');
      text = text.replace(/↊|&#x218a;/gu, "<span style='color:grey; display:inline-block; transform: rotate(180deg) translate(-40%, 15%);'>2</span><span style='color:grey; display:inline-block; transform: translate(-100%, 16%);'>.</span>");
      text = text.replace(/§/g, '†');
      out += setfont(FONT.blackfont, text) + '</TD>\n</TR>\n';
      return out;
    }

    // getunit: the script split into units at blank lines
    function* units(scriptLines) {
      let ind = 0;
      while (ind < scriptLines.length) {
        let t = '';
        while (ind < scriptLines.length) {
          const line = chompd(scriptLines[ind]);
          ind++;
          if (T(line) && !/^\s+$/.test(line)) { t += `${line}\n`; continue; }
          if (!T(t)) continue;
          break;
        }
        if (T(t)) yield t;
      }
    }

    // The cells of one hour, as the Perl engine prints them for the first column.
    function render(date, horaName) {
      const scriptLines = H.script(date, horaName);
      loadTables();
      counters.psalmnum1 = 0;
      precesferialesLocal = 0;
      const state = { searchind: 0 };
      let html = '';
      for (const u of units(scriptLines)) html += setcell(u, state);
      return { html, script: scriptLines };
    }

    return { render, resolve_refs, expand, psalm, units, setcell, scriptFunctions, getantcross, spell_var };
  }

  RB.createRenderer = createRenderer;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})(typeof globalThis !== 'undefined' ? globalThis : this);
