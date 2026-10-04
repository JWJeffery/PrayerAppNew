/**
 * Roman Breviary 1960/1962 -- filling an hour's template with the day's content (specials).
 *
 * Port of specials() and the modules it calls -- web/cgi-bin/horas/specials.pl and specials/{psalmi,
 * capitulis,hymni,preces,orationes}.pl, plus helpers from horascommon.pl and LanguageTextTools.pm --
 * of the pinned Divinum Officium commit 0ce8747d7dba3276fc05937635e02360b49a60a6 (MIT).
 *
 * Output of specials(): the hour's script as an array of lines, with "#Heading{comment}" lines,
 * "&psalm(n)" and "$Prayer" references still unexpanded (expanding them is the next stage).
 *
 * Only the branches that can run for the Rubrics 1960 versions are ported (Latin text, general
 * calendar, no missa, no chant notation); everything else in the Perl tests the version string
 * for Monastic/Cistercian/Dominican/Tridentine/Divino Afflatu offices and is dead here. The
 * differential test against the Perl script array is what keeps the omissions honest.
 *
 * Status (engine rebuild phase 3): Lauds. Other hours throw until ported.
 */
(function (root) {
  'use strict';
  const RB = (root.RomanBreviary = root.RomanBreviary || {});
  const D = RB.date;
  const { perlSplit, perlTrue: T } = RB;

  const S = (x) => (x === undefined || x === null ? '' : String(x));
  const N = (x) => {
    const m = /^\s*[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/.exec(S(x));
    return m ? parseFloat(m[0]) : 0;
  };
  const chompd = (s) => S(s).replace(/\n$/, '').replace(/\r/g, '');
  const trimEnd = (s) => S(s).replace(/\s+$/, '');

  // Font specifications (values observed in the Perl engine's defaults).
  const FONT = {
    largefont: '+1 bold italic red',
    redfont: ' italic red',
    smallfont: '1 red',
    smallblack: '-1',
    blackfont: '',
    initiale: '+2 bold italic red'
  };

  function setfont(istr, text) {
    if (!T(istr)) return text;
    let size = 0;
    let m = /^\.*?([0-9\-+]+)/i.exec(istr);
    if (m) size = m[1];
    let color = '';
    m = /([a-z]+)\s*$/i.exec(istr);
    if (m) color = m[1];
    m = /(#[0-9a-f]+)\s*$/i.exec(istr) || /([a-z]+)\s*$/i.exec(istr);
    if (m) color = m[1];
    if (color === 'italic') color = '';
    let font = '<FONT ';
    if (T(size)) font += `SIZE='${size}' `;
    if (color && !/black/i.test(color)) font += `COLOR="${color}"`;
    font += '>';
    if (!T(text)) return font;
    let bold = '', bolde = '', italic = '', italice = '';
    if (/bold/.test(istr)) { bold = '<B>'; bolde = '</B>'; }
    if (/italic/.test(istr)) { italic = '<I>'; italice = '</I>'; }
    return `${font}${bold}${italic}${text}${italice}${bolde}</FONT>`;
  }

  function createHours(cal) {
    const { ctx, ss } = cal;
    const { get_from_directorium } = cal.directorium;
    // Perl `-e "$datafolder/Latin/$name"`: a literal existence test, no '.txt' added
    const fileExists = (name) => cal.store.exists('Latin', name);
    const off = (x) => x || { has: () => false, get: () => undefined, keys: () => [], set() {}, isEmpty: true };
    let s = []; // the Perl global @s
    let hora = '';
    ctx.priest = 0;

    // ------------------------------------------------------------------ language (Latin)
    const language = {};
    function loadLanguage() {
      language.translateMap = off(ss.setupstring('Latin', 'Psalterium/Common/Translate.txt'));
      language.prayers = off(ss.setupstring('Latin', 'Psalterium/Common/Prayers.txt'));
      language.preces = off(ss.setupstring('Latin', 'Psalterium/Special/Preces.txt'));
      const alleluia = (S(language.prayers.get('Alleluia')).replace(/^v\. (.*?)\..*/s, '$1'));
      language.alleluiaWord = alleluia;
      const latin = alleluia.toLowerCase();
      // Perl builds the list from every language in play (Latin, English fallback).
      const eng = off(ss.setupstring('English', 'Psalterium/Common/Prayers.txt'));
      const engWord = S(eng.get('Alleluia')).replace(/^v\. (.*?)\..*/s, '$1').toLowerCase();
      const alts = [latin, engWord].filter((x, i, a) => a.indexOf(x) === i).join('|') + '|allel[uú][ij]a';
      language.alleluiaRe = alts;
    }
    function translate(name) {
      let prefix = '';
      const m = /^([$&])/.exec(name);
      if (m) { prefix = m[1]; name = name.slice(1); }
      const t = S(language.translateMap.get(name)).replace(/\s*$/, '');
      return prefix + (T(t) ? t : name);
    }
    function prayer(name) {
      const v = language.prayers.get(name);
      return T(v) ? v : name;
    }
    const alleluia = () => language.alleluiaWord;
    function alleluia_ant() {
      const u = alleluia();
      const l = u.toLowerCase();
      return `${u}, * ${l}, ${l}.`;
    }
    const alleluiaRegex = (flags = 'i') => new RegExp('(?:' + language.alleluiaRe + ')', flags);
    function ensure_single_alleluia(text) {
      if (!T(text)) return text;
      const re = new RegExp('(?:' + language.alleluiaRe + ')\\p{P}?\\)?\\s*$', 'iu');
      if (re.test(text)) return text;
      return text.replace(/\p{P}?\s*$/u, ', ' + alleluia().toLowerCase() + '.');
    }
    function ensure_double_alleluia(text) {
      const dbl = S(prayer('Alleluia Duplex')).replace(/\s+$/, '');
      const re = new RegExp('(?:' + language.alleluiaRe + ')[,.] (?:' + language.alleluiaRe + ')\\p{P}?\\s*$', 'iu');
      if (!re.test(text)) {
        text = text.replace(/\s*\*\s*(.)/, (_m, c) => ' ' + c.toLowerCase());
        text = text.replace(/\p{P}?\s*$/u, ', * ' + alleluia() + ', ' + (alleluia() + '.').toLowerCase());
      }
      return text;
    }
    const alleluia_required = (dayname0, votive) => /Pasc/i.test(S(dayname0)) && !/C(?:9|12)/.test(S(votive));
    function postprocess_ant(ant) {
      if (!T(ant)) return ant;
      if (alleluia_required(ctx.dayname[0], ctx.votive)) ant = ensure_single_alleluia(ant);
      return ant;
    }
    function postprocess_vr(vr) {
      if (!T(vr)) return vr;
      if (alleluia_required(ctx.dayname[0], ctx.votive)) {
        const idx = vr.search(/^\s*R\/?\./m);
        let versicle = vr, response = '';
        if (idx >= 0) { versicle = vr.slice(0, idx); response = vr.slice(idx); }
        versicle = ensure_single_alleluia(versicle);
        response = ensure_single_alleluia(response);
        return versicle + '\n' + response;
      }
      return vr;
    }
    // Perl postprocess_short_resp(): the "R.br." ... third "R." range uses a three-dot flip-flop
    // (right side not tested on the line that turns it on); (/^V\./ .. /^R\./) is a two-dot one.
    function postprocess_short_resp(capit) {
      for (let i = 0; i < capit.length; i++) capit[i] = capit[i].replace(/&Gloria1?/, '&Gloria1');
      if (alleluia_required(ctx.dayname[0], ctx.votive)) {
        let rlines = 0;
        let st1 = false, st2 = false;
        for (let i = 0; i < capit.length; i++) {
          const l = capit[i];
          let inOuter;
          if (!st1) {
            if (/^R\.br\./.test(l)) { st1 = true; inOuter = true; } else inOuter = false;
          } else {
            inOuter = true;
            if (/^R\./.test(l) && ++rlines >= 3) st1 = false;
          }
          if (inOuter) {
            let inInner;
            if (!st2) {
              if (/^V\./.test(l)) { st2 = true; inInner = true; if (/^R\./.test(l)) st2 = false; } else inInner = false;
            } else {
              inInner = true;
              if (/^R\./.test(l)) st2 = false;
            }
            if (inInner && /^R\./.test(l)) capit[i] = 'R. ' + prayer('Alleluia Duplex');
            else if (/^R\./.test(l)) capit[i] = ensure_double_alleluia(l);
          } else if (/^[VR]\./.test(l)) {
            capit[i] = ensure_single_alleluia(l);
          }
        }
      }
      return capit;
    }

    // ------------------------------------------------------------------ helpers
    const W = () => ctx.winnerHash;
    function subdirname(subdir) {
      return subdir + '/';
    }

    function gettempora(caller) {
      const { version, dayofweek, day } = ctx;
      const dn0 = S(ctx.dayname[0]);
      let tname =
        /^Adv[34]$/.test(dn0) && caller === 'Invitatorium' ? 'Adv3'
          : /^Adv/.test(dn0) && caller !== 'Doxology' && caller !== 'Nunc dimittis' ? 'Adv'
            : /^Quad[56]/.test(dn0) && caller !== 'Doxology' ? 'Quad5'
              : /^Quad(?!p)/.test(dn0) && caller !== 'Doxology' ? 'Quad'
                : /^Pasc6/.test(dn0) || (/Pasc5/i.test(dn0) && dayofweek > 3 && !/^Dominica/.test(S(ctx.dayname[1]))) ? 'Asc'
                  : /^Pasc[0-5]/.test(dn0) ? 'Pasch'
                    : /^Pasc7/.test(dn0) ? 'Pent'
                      : '';
      if ((caller === 'Psalmi minor' || caller === 'Invitatorium' || caller === 'Hymnus matutinum') && (tname === 'Asc' || tname === 'Pent')) tname = 'Pasch';
      if (caller === 'Lectio brevis Prima' && !/cist/i.test(version)) tname = tname || 'Per Annum';
      if (caller === 'Hymnus major' && !tname) {
        tname = !/cist|praedicatorum/i.test(version) || (ctx.hora === 'Vespera' && dayofweek === 6) ? `Day${dayofweek}` : 'Day0';
      }
      if (/^Capitulum|major$/.test(caller) && !tname) {
        tname = dayofweek === 0 || (caller === 'Capitulum minor' && /Duplex/i.test(S(ctx.dayname[1])) && !/(Dominica|Vigilia)/i.test(S(ctx.dayname[1]))) ? 'Dominica' : 'Feria';
      }
      if (caller === 'Doxology' || caller === 'Prima responsory' || (/monastic|196/i.test(version) && caller !== 'Psalmi minor' && caller !== 'Nunc dimittis')) {
        if (/^Nat/.test(dn0)) tname = day >= 6 && day < 13 ? 'Epi' : 'Nat';
        else if (/^Epi[01]/i.test(dn0) && day < 14) tname = 'Epi';
      }
      if ((caller === 'MM Capitulum' || caller === 'Nunc dimittis') && tname) {
        tname = ' ' + tname;
        if (caller === 'Nunc dimittis' && /^Quad[34]/.test(dn0)) tname += '3';
      }
      return tname;
    }

    // Pushes the headline (with an optional {comment}) onto @s.
    function setcomment(label, comment, ind, prefix) {
      if (ind > -1) {
        if (/Source/i.test(comment) && T(ctx.votive) && !/hodie/i.test(ctx.votive)) ind = 7;
        label = translate(label);
        const cm = off(ss.setupstring('Latin', 'Psalterium/Comment.txt'));
        const comm = perlSplit(S(cm.get(comment)), /\n/);
        comment = comm[ind];
        if (T(prefix)) comment = `${prefix} ${comment}`;
        if (/\}\s*/.test(label)) label = label.replace(/\}\s*$/, ` ${comment}}`);
        else label += `{${comment}}`;
      }
      s.push(label);
    }

    function tryoldhymn(source, name) {
      let name1 = name.replace(/Hymnus\S*/, (m) => m + 'M');
      return (T(ctx.oldhymns) || /(Monastic|1570|Praedicatorum)/i.test(ctx.version)) && source.has(name1) ? name1 : name;
    }

    function replaceNdot(str, name) {
      if (!/N\./.test(str)) return str;
      let c = W();
      if (!T(name)) name = c.get('Name');
      if (!T(name)) {
        c = off(ctx.commemoratioHash);
        name = c.get('Name');
      }
      let names = perlSplit(S(name), /\n/);
      if (/^[OÓ],?\s|O Doctor optime/.test(str) && /Ant=/.test(S(name))) names = names.filter((x) => /Ant=/.test(x));
      else if (/Oratio=/.test(S(name))) names = names.filter((x) => /Oratio=/.test(x));
      let n0 = S(names[0]).replace(/^.*?=/, '');
      if (T(n0)) {
        n0 = n0.replace(/[\r\n]/g, '');
        str = str.replace(/N\. .*? N\./, () => n0);
        str = str.replace(/N\./g, () => n0);
      }
      return str;
    }

    // Returns [text, c] like the Perl list.
    function getproprium(name, flag) {
      let w = '';
      let c = 0;
      const wh = W();
      if (wh.has(name)) {
        if (/^Hymnus/.test(name)) name = tryoldhymn(wh, name);
        w = wh.get(name);
        c = /Sancti/.test(S(ctx.winner)) ? 3 : 2;
      }
      if (T(w)) return [w, c];
      if (!T(w) && T(ctx.communetype) && (/^ex/i.test(ctx.communetype) || T(flag))) {
        let com = off(ctx.communeHash);
        let cn = ctx.commune;
        const substitute =
          name === 'Nocturn 1 Versum' ? 'Versum 1'
            : name === 'Responsory TertiaM' ? 'Nocturn 1 Versum'
              : name === 'Versum Tertia' || name === 'Responsory SextaM' ? 'Nocturn 2 Versum'
                : name === 'Versum Sexta' || name === 'Responsory NonaM' ? 'Nocturn 3 Versum'
                  : name === 'Versum Nona' ? 'Versum 2'
                    : '';
        let loopcounter = 0;
        while (!T(w) && loopcounter < 5) {
          loopcounter++;
          let m;
          if (com.has(name)) {
            if (/^Hymnus/.test(name)) name = tryoldhymn(com, name);
            w = com.get(name);
            c = 4;
            break;
          } else if (/^C/i.test(S(cn)) && substitute && com.has(substitute)) {
            w = com.get(substitute);
            c = 4;
            name += ` ex ${substitute}`;
            break;
          } else if (!/^C/i.test(S(cn)) && ((m = /;;(ex|vide)\s*(C[0-9a-z]+)/i.exec(S(com.get('Rank')))) || (m = /;;(ex|vide)\s*(SanctiM?\/.*?)\s/i.exec(S(com.get('Rank')))))) {
            const ctype = m[1];
            if (ctype === 'vide' && !T(flag)) break;
            const fn = m[2];
            cn = /^Sancti/i.test(fn) ? fn : subdirname('Commune') + fn;
            com = off(ss.setupstring('Latin', `${cn}.txt`));
            continue;
          } else break;
        }
        if (T(w)) {
          w = replaceNdot(w);
        }
      }
      return [w, c];
    }

    function checkmtv(version, winnerHash) {
      return (/1955|196/.test(version) || /;mtv/i.test(S(winnerHash.get('Rule')))) && /C[45]/.test(S(winnerHash.get('Rule'))) ? '1' : '';
    }

    function getanthoras() {
      const { version, winner, rule, communerule, dayofweek, rank } = ctx;
      const tflag = /Trident|Monastic/i.test(version) && /Sancti/i.test(S(winner)) ? 1 : 0;
      if (!/Antiphonas horas/i.test(S(rule)) && !/Antiphonas horas/i.test(S(communerule)) && !tflag) return ['', undefined];
      const vm = /(1960|Newcal)/.exec(version);
      if (vm && (dayofweek > 0 || vm[1] === '1960') && N(rank) < 6) return ['', undefined];
      let w = W().get('Ant Laudes');
      let c = /Sancti/.test(S(winner)) ? 3 : 2;
      if (!T(w) && (/ex\s*/i.test(S(ctx.communetype)) || /Trident|Monastic/i.test(version))) {
        w = off(ctx.communeHash).get('Ant Laudes');
        c = 4;
      }
            const arr = perlSplit(S(w), /\n/);
      const hora = ctx.hora;
      let ind = hora === 'Prima' ? 0 : hora === 'Tertia' ? 1 : hora === 'Sexta' ? 2 : 4;
      if (ind < 3 && /cist/i.test(version)) ind++;
      let res = '';
      if (arr.length > 3) res = arr[ind];
      return [res, c];
    }

    function getfrompsalterium(item, ind) {
      const cm = off(ss.setupstring('Latin', 'Psalterium/Special/Major Special.txt'));
      const name = gettempora('getfrompsalterium major') + ` ${item}`;
      let w = cm.get(`${name} ${ind}`);
      if (!T(w)) w = cm.get(`${name} 1`);
      if (!T(w)) w = cm.get(`${name} 3`);
      if (!T(w)) w = cm.get(`${name} 2`);
      return w;
    }

    function getseant() {
      const key = `seant${String(ctx.month).padStart(2, '0')}-${String(ctx.day).padStart(2, '0')}`;
      const d = get_from_directorium('stransfer', ctx.version, key, ctx.year);
      if (T(d)) {
        const w = off(ss.setupstring('Latin', `Tempora/${d}.txt`));
        return S(w.get('Ant 3'));
      }
      return '';
    }

    // Returns [text, c].
    function getantvers(item, ind) {
      let w = '';
      let c = 0;
      [w, c] = getproprium(`${item} ${ind}`, 1);
      if (!T(w) && ind > 1) {
        const i = 4 - ind;
        [w, c] = getproprium(`${item} ${i}`, 1);
      }
      if (!T(w) && ctx.hora === 'Vespera' && /Ant/i.test(item) && /Tempora\/Quadp[12]/i.test(S(ctx.winner))) {
        w = getseant();
        if (T(w)) c = 0;
      }
      if (!T(w)) {
        w = getfrompsalterium(item, ind);
        c = 0;
      }
      if (T(w)) {
        if (/Versum/i.test(item)) w = postprocess_vr(w);
        else w = postprocess_ant(w);
      } else w = `${item} ${ind} missing`;
      return [w, c];
    }

    function checkcommemoratio(h) {
      for (const k of ['Commemoratio', 'Commemoratio 1', 'Commemoratio 2', 'Commemoratio 3']) {
        const v = h.get(k);
        if (T(v)) return v;
      }
      return '';
    }

    function checksuffragium() {
      const { rule, version, rank, duplex } = ctx;
      const dn0 = S(ctx.dayname[0]);
      const winner = S(ctx.winner);
      const ranklimit = /cist/i.test(version) ? 4 : 3;
      if (
        /no suffragium/i.test(S(rule)) ||
        !T(ctx.dayname[0]) ||
        /Nat05|Quad6|Pasc[067]/i.test(dn0) ||
        (!/cist/i.test(version) && /Adv|Nat|Quad5/i.test(dn0)) ||
        (/sancti/i.test(winner) && N(rank) >= ranklimit) ||
        (/tempora/i.test(winner) && N(duplex) > 2) ||
        (/octav/i.test(S(W().get('Rank'))) && !/post Octavam/i.test(S(W().get('Rank')))) ||
        T(ctx.octavcount) || /octav/i.test(S(off(ctx.commemoratioHash).get('Rank'))) ||
        (/cist/i.test(version) && /C1a?/i.test(S(ctx.commune))) ||
        (/cist/i.test(version) && /08-2[89]/i.test(winner)) ||
        (/altovadensis/i.test(version) && N(ctx.collectcount) > 2) ||
        (/altovadensis/i.test(version) && N(rank) > 2.5) ||
        /C12/.test(winner)
      ) return 0;
      if (T(ctx.commemoratio)) {
        const r = perlSplit(S(off(ctx.commemoratioHash).get('Rank')), ';;');
        const rl = /^Trident/.test(version) ? 7 : ranklimit;
        if (N(r[2]) >= rl || /in.*Octav/i.test(S(off(ctx.commemoratioHash).get('Rank'))) || /octav/i.test(checkcommemoratio(off(ctx.commemoratioHash)))) return 0;
        const entries = [].concat(ctx.commemoentries || [], ctx.ccommemoentries || []);
        if (entries.length) {
          for (let commemo of entries) {
            if (!fileExists(commemo) && !/txt$/i.test(commemo)) commemo = commemo + '.txt';
            const c = off(ss.officestring('Latin', commemo, 0));
            const cr = perlSplit(S(c.get('Rank')), ';;');
            if (N(cr[2]) >= rl || /in.*Octav/i.test(S(c.get('Rank'))) || /octav/i.test(checkcommemoratio(c))) return 0;
          }
        }
      }
      return 1;
    }

    // Preces -----------------------------------------------------------------
    function preces(item) {
      const { winner, rule, duplex, version, dayofweek, commemoratio } = ctx;
      const dn0 = S(ctx.dayname[0]);
      if (/C12/i.test(S(winner)) || /Omit.*? Preces/i.test(S(rule)) || N(duplex) > 2 || /Pasc[67]/i.test(dn0)) return 0;
      ctx.precesferiales = 0;
      if (
        dayofweek &&
        !(dayofweek === 6 && /vespera/i.test(ctx.hora)) &&
        ((!/sancti/i.test(S(winner)) && (/Preces/i.test(S(rule)) || /Adv|Quad(?!p)/i.test(dn0) || cal.emberday())) ||
          (!/1955|1960|Newcal/.test(version) && /vigil/i.test(S(W().get('Rank'))) && !/Epi|Pasc/i.test(S(ctx.dayname[1])))) &&
        (!/1955|1960|Newcal/.test(version) || /[35]/.test(String(dayofweek)) || cal.emberday())
      ) {
        ctx.precesferiales = 1;
        return 1;
      }
      if (/Dominicales/i.test(item)) {
        let dominicales = 1;
        if (T(commemoratio)) {
          const r = perlSplit(S(off(ctx.commemoratioHash).get('Rank')), ';;');
          const ranklimit = /^Trident/.test(version) ? 7 : 3;
          if (N(r[2]) >= ranklimit || /Octav/i.test(S(off(ctx.commemoratioHash).get('Rank'))) || /octav/i.test(checkcommemoratio(off(ctx.commemoratioHash)))) {
            dominicales = 0;
          } else if ((ctx.commemoentries || []).length) {
            for (let commemo of ctx.commemoentries) {
              if (!fileExists(commemo) && !/txt$/i.test(commemo)) commemo += '.txt';
              const c = off(ss.officestring('Latin', commemo, 0));
              const cr = perlSplit(S(c.get('Rank')), ';;');
              if (N(cr[2]) >= ranklimit || /Octav/i.test(S(c.get('Rank'))) || /octav/i.test(checkcommemoratio(c))) dominicales = 0;
            }
          }
        }
        if (dominicales && (!/octav/i.test(S(W().get('Rank'))) || /post octav/i.test(S(W().get('Rank')))) && !/Octav/i.test(checkcommemoratio(W()))) {
          ctx.precesferiales = preces('Feriales');
          return 1;
        }
      }
      return 0;
    }

    function getpreces(horaName, flag) {
      let src, key;
      if (/^(?:Tertia|Sexta|Nona)$/.test(horaName)) { src = 'Minor'; key = 'Feriales'; }
      else if (/^(?:Laudes|Vespera)$/.test(horaName)) { src = 'Major'; key = `feriales ${horaName}`; }
      else if (horaName === 'Completorium') { src = 'Minor'; key = 'Dominicales'; }
      else if (flag) { throw new Error('Prima preces not ported yet'); }
      else { src = 'Prima'; key = 'feriales Prima'; }
      const brevis = off(ss.setupstring('Latin', `Psalterium/Special/${src} Special.txt`));
      return brevis.get(`Preces ${key}`);
    }

    // Psalmody ----------------------------------------------------------------
    // Psalmody of Prime, Terce, Sext, None (and Compline) for the Rubrics 1960 versions.
    function psalmi_minor() {
      const { version, dayofweek, winner, rank, laudes, day, year } = ctx;
      const hora = ctx.hora;
      const rule = S(ctx.rule), communerule = S(ctx.communerule);
      const psalmiMap = off(ss.setupstring('Latin', 'Psalterium/Psalmi/Psalmi minor.txt'));
      let ant, psalms, prefix;
      let psalmi = perlSplit(S(psalmiMap.get(hora)), /\n/);
      let i = 2 * dayofweek;
      if (hora === 'Completorium' && dayofweek === 6 && /Dominica/i.test(S(W().get('Rank'))) && !/Nat/.test(S(ctx.dayname[0]))) i = 12;
      if (/Psalmi\s*(minores)*\s*Dominica/i.test(rule) || (/Psalmi\s*(minores)*\s*Dominica/i.test(communerule) && !/Psalmi\s*(?:minores)*\s*ex Psalterio/i.test(rule))) i = 0;
      if (/19(?:55|60|62)/.test(version) && (/horas1960 feria/i.test(rule) || (/Sancti/i.test(S(winner)) && N(rank) < 5) || ((/sancti/i.test(S(winner)) || /Nat[23]/i.test(S(winner))) && N(rank) < 6 && hora !== 'Completorium'))) i = 2 * dayofweek;
      if (hora === 'Completorium' && dayofweek === 6 && /Dominica/i.test(S(W().get('Rank'))) && !/Nat/.test(S(ctx.dayname[0]))) i = 12;
      ant = chompd(psalmi[i]);
      psalms = chompd(psalmi[i + 1]);
      if ((/196/.test(version) && /117/.test(psalms) && laudes === 2) || /Prima=53/i.test(rule)) psalms = psalms.replace(/117/, '53');
      let comment = 0;

      if (hora === 'Completorium' && !/Trident|Monastic/.test(version)) {
        if (/tempora/i.test(S(winner)) && dayofweek > 0 && /Dominica/i.test(S(W().get('Rank'))) && N(rank) < 6) {
          // (nothing)
        } else if ((/Psalmi\s*(minores)*\s*Dominica/i.test(rule) || /Psalmi\s*(minores)*\s*Dominica/i.test(communerule)) && (!/1960/.test(version) || N(rank) >= 6)) {
          ant = chompd(psalmi[0]);
          psalms = chompd(psalmi[1]);
          prefix = '';
          comment = 6;
        }
        const w = W();
        ant = T(w.get(`Ant Completorium${ctx.vespera}`)) ? w.get(`Ant Completorium${ctx.vespera}`) : ant;
      }

      if (/tempora/i.test(S(winner)) || /pasc/i.test(S(ctx.dayname[0]))) {
        let ind = hora === 'Prima' ? 0 : hora === 'Tertia' ? 1 : hora === 'Sexta' ? 2 : hora === 'Nona' ? 4 : -1;
        let name = gettempora('Psalmi minor');
        if (name === 'Adv') {
          name = ctx.dayname[0];
          if (day > 16 && day < 24 && dayofweek && !/cist/i.test(version)) {
            const k = dayofweek + 1;
            name = `Adv4${k}`;
          }
        }
        if (name === 'Pasch' && (!/Pasc7/i.test(S(ctx.dayname[0])) || /Completorium/i.test(hora))) ind = 0;
        if (T(name) && ind >= 0) {
          const antl = perlSplit(S(psalmiMap.get(name)), /\n/);
          ant = chompd(antl[ind]);
          comment = 1;
        }
      }

      const w = W();
      ant = S(ant).replace(/^.*?=\s*/, '');
      let feastflag = 0;
      if (hora !== 'Completorium') {
        let [pw, pc] = getproprium(`Ant ${hora}`, 0);
        if (!T(pw) && !/Psalmi\s*(?:minores)*\s*ex Psalterio/i.test(rule) && !(/1955|1960/.test(version) && N(rank) < 6 && dayofweek > 0)) {
          [pw, pc] = getanthoras();
        }
        if (T(pw)) {
          ant = chompd(pw);
          comment = pc;
        }
        if ((/Psalmi\s*(?:minores)*\s*Dominica/i.test(rule) || /Psalmi\s*(?:minores)*\s*Dominica/i.test(communerule)) && !/Psalmi\s*(?:minores)*\s*ex Psalterio/i.test(rule) && !(/1955|196/.test(version) && N(rank) < 6 && dayofweek > 0)) {
          feastflag = !/Trident|Monastic/i.test(version) ? 1 : 2;
        }
        if (/1955|1960/.test(version) && N(rank) < 6) feastflag = 0;
        if (/Dominica/i.test(S(W().get('Rank'))) && !/Nat|Pasc6/i.test(S(ctx.dayname[0]))) feastflag = 0;
        if (feastflag === 1) prefix = translate('Psalmi Dominica, antiphonae') + ' ';
        else if (feastflag === 2) prefix = translate('Antiphona') + ' ';
      } else {
        if (/^Monastic/.test(version)) ant = '';
      }
      setcomment(ctx.label, 'Source', comment, prefix);

      if (/Minores sine Antiphona/i.test(S(w.get('Rule')))) ant = '';
      const am = /(.*?)\;\;/s.exec(S(ant));
      if (am) ant = am[1];

      if (hora === 'Prima') {
        if (laudes !== 2 || /1960/.test(version)) psalms = psalms.replace(/,?\[\d+\]/g, '');
        else psalms = psalms.replace(/[\[\]]/g, '');
      }
      const psalm = perlSplit(psalms, /,/);
      if (!/Trident|Monastic/.test(version)) {
        if (hora === 'Prima' && feastflag) psalm[0] = 53;
        if (hora === 'Prima' && laudes === 2 && /Dominica/i.test(S(ctx.dayname[1])) && !/196/.test(version)) {
          psalm[0] = 99;
          psalm.unshift(92);
        }
      }
      if ((!/1955|196/.test(version) || /Pent01/i.test(S(ctx.dayname[0]))) && hora === 'Prima' && (/(Epi|Pent)/i.test(S(ctx.dayname[0])) || !/Divino/i.test(version)) && dayofweek === 0 && !/Non dicitur Quicumque/i.test(rule) &&
        (/(Adv|Pent01|Pasc1)/i.test(S(ctx.dayname[0])) || checksuffragium() || (/Epi[2-6]|Quad|Pasc[1-5]|Pent0[3-9]|Pent[12]/i.test(S(ctx.dayname[0])) && /trident/i.test(version)) || (/Adv|Epi[2-6]|Quad|Pasc[1-5]|Pent/i.test(S(ctx.dayname[0])) && /cist/i.test(version))) &&
        (/Tempora/i.test(S(winner)) || !/cist/i.test(version))) {
        psalm.push(234);
      }
      return [`${ant};;${psalm.join(';')}`];
    }

    function psalmi_major() {
      const { version, rule, laudes, rank, winner, dayofweek, vespera, duplex, commune, month, day, communetype, votive } = ctx;
      const psalmiMap = off(ss.setupstring('Latin', 'Psalterium/Psalmi/Psalmi major.txt'));
      let name = ctx.hora;
      if (ctx.hora === 'Laudes') name += laudes;
      let psalmi = [];
      let prefix, comment;
      psalmi = perlSplit(S(psalmiMap.get(`Day${dayofweek} ${name}`)), /\n/);
      comment = 0;
      prefix = translate('Psalmi et antiphonae') + ' ';
      let antiphones = [];

      if (ctx.hora === 'Laudes' && month === 12 && day > 16 && day < 24 && dayofweek > 0) {
        antiphones = perlSplit(S(psalmiMap.get(`Day${dayofweek} Laudes3`)), /\n/);
      }

      let w = '';
      let c;
      const wh = W();
      if (ctx.hora === 'Vespera' && vespera === 3) {
        if (wh.has('Ant Vespera 3')) {
          w = wh.get('Ant Vespera 3');
          c = /Tempora/.test(S(winner)) ? 2 : 3;
        } else if (!wh.has('Ant Vespera') && /ex/.test(S(communetype))) {
          [w, c] = getproprium('Ant Vespera 3', 1);
        }
      }
      if (!T(w) && wh.has(`Ant ${ctx.hora}`)) {
        w = wh.get(`Ant ${ctx.hora}`);
        c = /Tempora/.test(S(winner)) ? 2 : 3;
      }
      if (T(ctx.antecapitulum)) {
        w = ctx.antecapitulum;
        c = 3;
      } else if (T(w)) {
        // (Antiphonas winner)
      } else if (T(communetype) && /ex/.test(communetype)) {
        [w, c] = getproprium(`Ant ${ctx.hora}`, 1);
      }
      if (T(w)) {
        antiphones = perlSplit(S(w), /\n/);
        comment = c;
      }
      let p;
      if (
        (/Psalmi Dominica/i.test(S(rule)) || (T(off(ctx.communeHash).get('Rule')) && /Psalmi Dominica/i.test(S(off(ctx.communeHash).get('Rule'))))) &&
        !/;;\s*[0-9]+/.test(S(antiphones[0])) &&
        !/Psalmi Feria/i.test(S(rule))
      ) {
        prefix = translate('Psalmi, antiphonae') + ' ';
        let h = ctx.hora;
        if (ctx.hora === 'Laudes') h += '1';
        p = perlSplit(S(psalmiMap.get(`Day0 ${h}`)), /\n/);
      } else {
        p = psalmi;
      }
      const lim = 5;
      if (antiphones.length) {
        for (let i = 0; i < lim; i++) {
          let aflag = 0;
          const pm = /;;(.*)/s.exec(S(p[i]));
          let pp = pm ? pm[1] : 'missing';
          // (Vespers 5th-psalm rules: Vespers only)
          if (ctx.hora === 'Vespera' && i === 4) throw new Error('Vespers psalm-5 rules not ported yet');
          const am = /(.*?);;/s.exec(S(antiphones[i]));
          psalmi[i] = /;;[0-9;\n]+/.test(S(antiphones[i])) && !aflag ? antiphones[i] : am ? `${am[1]};;${pp}` : `${antiphones[i]};;${pp}`;
        }
      }

      if (
        alleluia_required(ctx.dayname[0], votive) &&
        (!W().has(`Ant ${ctx.hora}`) || /C10/.test(S(commune))) &&
        !T(ctx.antecapitulum) &&
        !/ex/i.test(S(communetype))
      ) {
        psalmi[0] = S(psalmi[0]).replace(/.*(?=;;)/, () => alleluia_ant());
        psalmi[1] = S(psalmi[1]).replace(/.*(?=;;)/, '');
        psalmi[2] = S(psalmi[2]).replace(/.*(?=;;)/, '');
        psalmi[psalmi.length - 1] = S(psalmi[psalmi.length - 1]).replace(/.*(?=;;)/, '');
        psalmi[3] = S(psalmi[3]).replace(/.*(?=;;)/, '');
      }

      if ((/Adv|Quad/.test(S(ctx.dayname[0])) || cal.emberday()) && ctx.hora === 'Laudes') prefix = `Laudes:${laudes} ${prefix}`;
      setcomment(ctx.label, 'Source', comment, prefix);
      return psalmi;
    }

    function antetpsalm(psalmiRef, duplexf) {
      let lastant;
      for (let i = 0; i < psalmiRef.length; i++) {
        const parts = S(psalmiRef[i]);
        const k = parts.indexOf(';;');
        let ant = k < 0 ? parts : parts.slice(0, k);
        const psalms = k < 0 ? undefined : parts.slice(k + 2);
        if (T(ant)) {
          if (T(lastant)) {
            s.pop();
            s.push(`Ant. ${lastant}`, '\n');
          }
          ant = ant.replace(/~?\n/g, ' ');
          ant = postprocess_ant(ant);
          let antp = ant;
          if (!(T(duplexf) && !/cist/i.test(ctx.version))) {
            antp = antp.replace(/\s+\*.*/, '');
            antp = antp.replace(/\,$/, '.');
          }
          s.push(`Ant. ${antp}`);
          lastant = ant.replace(/\* /, '');
        }
        const p = perlSplit(psalms, ';');
        for (let j = 0; j < p.length; j++) {
          let pj = p[j];
          pj = pj.replace(/(\(.*?\-.*?\))(.*\')$/, '$2$1');
          pj = pj.replace(/[(\-]/g, ',');
          pj = pj.replace(/\)/, '');
          if (j < p.length - 1) pj = '-' + pj;
          pj = pj.replace(/\-\'/, "'-");
          s.push(`&psalm(${pj})`, '\n');
        }
      }
      if (T(lastant)) s[s.length - 1] = `Ant. ${lastant}`;
    }

    function psalmi() {
      ctx.psalmnum1 = 0;
      ctx.psalmnum2 = 0;
      if (ctx.hora === 'Matutinum') throw new Error('Matins psalmody not ported yet');
      let duplexf = /196/.test(ctx.version);
      let ps;
      if (/^(?:Laudes|Vespera)$/i.test(ctx.hora)) {
        ps = psalmi_major();
        duplexf = duplexf || (N(ctx.duplex) > 2 && !/C12/.test(S(ctx.winner)));
      } else ps = psalmi_minor();
      antetpsalm(ps, duplexf);
    }

    // Chapter, hymn, canticle ----------------------------------------------------
    function capitulum_major() {
      let name = 'Capitulum Laudes';
      if (/12-25/.test(S(ctx.winner)) && ctx.vespera === 1) name = 'Capitulum Vespera 1';
      if (/C12/.test(S(ctx.winner)) && ctx.hora === 'Vespera') name = 'Capitulum Vespera';
      let [capit, c] = getproprium(name, 1);
      if (!T(capit)) {
        const cm = off(ss.setupstring('Latin', 'Psalterium/Special/Major Special.txt'));
        name = gettempora('Capitulum major') + ` ${ctx.hora}`;
        capit = cm.get(name);
      }
      setcomment(ctx.label, 'Source', c);
      return capit;
    }

    function minor_reponsory() {
      const capit = off(ss.setupstring('Latin', 'Psalterium/Special/Minor Special.txt'));
      let name = gettempora('Capitulum minor') + ` ${ctx.hora}`;
      if (ctx.hora === 'Completorium') name = 'Completorium';
      let resp, vers;
      if (T((resp = capit.get(`Responsory ${name}`)))) {
        resp = S(resp).replace(/\s*$/, '');
      } else if (T((resp = capit.get(`Responsory breve ${name}`))) && T((vers = capit.get(`Versum ${name}`)))) {
        vers = S(vers).replace(/\s*$/, '');
        resp = S(resp).replace(/\s*$/, `\n_\n${vers}`);
      }
      if (ctx.hora === 'Completorium') throw new Error('Compline responsory not ported yet');
      const nm = `Responsory ${ctx.hora}`;
      let [wr] = getproprium(nm, 1);
      if (!T(wr)) {
        const replace = { Tertia: 'Versum Tertia', Sexta: 'Versum Sexta', Nona: 'Versum Nona' };
        [wr] = getproprium(`Responsory Breve ${ctx.hora}`, 1);
        if (T(wr)) wr = S(wr).replace(/\s*$/, '\n_\n');
        const [v] = getproprium(replace[ctx.hora], 1);
        wr = S(wr) + S(v);
      }
      resp = T(wr) ? wr : resp;
      const capitArr = perlSplit(S(resp), /\n/);
      postprocess_short_resp(capitArr);
      return capitArr.join('\n');
    }

    function capitulum_minor() {
      const capitMap = off(ss.setupstring('Latin', 'Psalterium/Special/Minor Special.txt'));
      let name = gettempora('Capitulum minor') + ` ${ctx.hora}`;
      if (ctx.hora === 'Completorium') name = 'Completorium';
      const capit = S(capitMap.get(name)).replace(/\s*$/, '');
      const comment = /Dominica|Feria/.test(name) ? 5 : 1;
      name = `Capitulum ${ctx.hora}`;
      if (ctx.hora === 'Tertia' && !/C12/.test(S(ctx.votive))) name = name.replace(/Tertia/, 'Laudes');
      const [w, c] = getproprium(name, 1);
      if (ctx.hora !== 'Completorium') setcomment(ctx.label, 'Source', T(w) ? c : comment);
      return (T(w) ? w : capit) + '\n_\n' + minor_reponsory();
    }

    function hymnshiftFns() {
      const key = 'Hy' + D.get_sday(ctx.month, ctx.day, ctx.year);
      const v = S(get_from_directorium('transfer', ctx.version, key, ctx.year));
      return { shift: /2/.test(v), shiftmerge: /3/.test(v) };
    }

    function hymnusmajor() {
      const { version, vespera } = ctx;
      let hymn = '';
      let name = 'Hymnus';
      const winnerHash = W();
      if (ctx.hora === 'Vespera') name += checkmtv(version, winnerHash);
      if (
        !winnerHash.has(`${name} Vespera`) && vespera === 3 && !winnerHash.has(`${name} Vespera 3`) &&
        ((vespera === 3 && winnerHash.has('Hymnus Vespera 3')) || winnerHash.has('Hymnus Vespera'))
      ) name = 'Hymnus';
      const hs = hymnshiftFns();
      let cr = 0;
      if (hs.shift) {
        if (ctx.hora === 'Laudes') name += ' Matutinum';
        if (ctx.hora === 'Vespera') name += ' Laudes';
      } else if (hs.shiftmerge && ctx.hora === 'Laudes') {
        [hymn, cr] = getproprium(`${name} Laudes`, 1);
        const [h1] = getproprium(`${name} Matutinum`, 1);
        hymn = S(hymn).replace(/^(v\. )/, '');
        let h1s = S(h1);
        // $h1 =~ s/\_(?!.*\_).*/\_\n$hymn/s : replace from the last underscore to the end
        const idx = h1s.lastIndexOf('_');
        h1s = idx >= 0 ? h1s.slice(0, idx) + '_\n' + hymn : h1s;
        hymn = h1s;
      } else name += ` ${ctx.hora}`;
      cr = 0;
      if (ctx.hora === 'Vespera' && vespera === 3) [hymn, cr] = getproprium(`${name} 3`, 1);
      if (!T(hymn)) [hymn, cr] = getproprium(name, 1);
      if (!T(hymn)) {
        name = gettempora('Hymnus major') + ` ${ctx.hora}`;
        if (
          /Day0/i.test(name) && !/praedicatorum/i.test(version) && /Laudes/i.test(name) &&
          (/Epi[2-6]/.test(S(ctx.dayname[0])) || /Quadp/i.test(S(ctx.dayname[0])) || /Novembris/i.test(S(winnerHash.get('Rank'))) || (/Octobris/i.test(S(winnerHash.get('Rank'))) && !/cist/i.test(version)))
        ) name += ' hiemalis';
      }
      return [hymn, name];
    }

    function gethymn() {
      let section = translate('Hymnus');
      let hymn, name, hymnsource, versum, cr;
      if (ctx.hora === 'Laudes' || ctx.hora === 'Vespera') {
        [hymn, name] = hymnusmajor();
        name = `Hymnus ${name}`;
        if (!T(hymn)) hymnsource = 'Major';
        section = `_\n!${section}`;
        const ind = ctx.hora === 'Laudes' ? 2 : ctx.vespera;
        [versum, cr] = getantvers('Versum', ind);
      } else {
        name = `Hymnus ${ctx.hora}`;
        if (ctx.hora === 'Tertia' && /Pasc7/.test(S(ctx.dayname[0]))) name = name.replace(/ /, ' Pasc7 ');
        hymnsource = ctx.hora === 'Prima' ? 'Prima' : 'Minor';
        section = '#' + section;
      }
      if (T(hymnsource)) {
        const h = off(ss.setupstring('Latin', `Psalterium/Special/${hymnsource} Special.txt`));
        name = tryoldhymn(h, name);
        hymn = h.get(name);
      }
      // (doxology only for versions before 1960/1962)
      hymn = S(hymn).replace(/^(?:v\.\s*)?(\p{Lu})/u, 'v. $1');
      hymn = hymn.replace(/\*\s*/g, '');
      hymn = hymn.replace(/_\n(?!!)/g, '_\nr. ');
      let output = `${section}\n${hymn}`;
      if (T(versum)) output += `_\n${versum}`;
      return output;
    }

    function ant123_special() {
      const { month, day, winner, version, vespera } = ctx;
      let ant, duplexf;
      if (month === 12 && day > 16 && day < 24 && /tempora/i.test(S(winner))) {
        const specials = off(ss.setupstring('Latin', 'Psalterium/Special/Major Special.txt'));
        if (ctx.hora === 'Laudes' && (day === 21 || (day === 23 && !/Praedicatorum/.test(version)))) ant = specials.get(`Adv Ant ${day}L`);
        else if (ctx.hora === 'Vespera') { ant = specials.get(`Adv Ant ${day}`); duplexf = 1; }
      } else if (/^Sancti/.test(S(winner)) && !/Trident/.test(version) && vespera === 3) {
        const pm = papal_rule(W().get('Rule'));
        if (pm && /C/i.test(pm[1])) ant = papal_antiphon_dum_esset();
      }
      return [ant, duplexf];
    }

    function canticum(item) {
      const num = ctx.hora === 'Laudes' ? 2 : ctx.hora === 'Completorium' ? 4 : 3;
      let ant, ant2;
      let duplexf = /196/.test(ctx.version) ? 1 : 0;
      if (ctx.hora === 'Completorium') throw new Error('Compline canticle not ported yet');
      const comment = /sancti/i.test(S(ctx.winner)) ? 3 : 2;
      setcomment(item, 'Source', comment, translate('Antiphona'));
      duplexf = duplexf || (N(ctx.duplex) > 2 ? 1 : 0);
      const key = num === 3 ? ctx.vespera : num;
      let df;
      [ant, df] = ant123_special();
      if (!T(ant)) {
        [ant] = getantvers('Ant', key);
      } else duplexf = duplexf || df;
      const psalmiList = [`${ant};;${229 + num}`];
      antetpsalm(psalmiList, duplexf);
      if (T(ant2)) s[s.length - 1] = `Ant. ${ant2}`;
    }

    // Papal commons --------------------------------------------------------------
    // Returns the Perl list ($plural, $class, $name) as [plural, class, name] or null.
    function papal_rule(rule, commemoration) {
      const classchar = commemoration ? 'C' : 'O';
      const m = new RegExp(`${classchar}Papa(e)?([CMD])=(.*?);`, 'i').exec(S(rule));
      return m ? [m[1], m[2], m[3]] : null;
    }
    function papal_prayer(plural, klass, name, type) {
      type = type || 'Oratio';
      const common = off(ss.setupstring('Latin', 'Commune/C4.txt'));
      const num = plural ? 91 : 9;
      let prayer = S(common.get(`${type}${num}`));
      prayer = prayer.replace(/ N\.([a-z ]+N\.)*/, () => ' ' + name);
      if (!/M/i.test(klass)) prayer = prayer.replace(/\s*\((.|~[\s\n\r]*)*?\)/, '');
      else prayer = prayer.replace(/[()]/g, '');
      return prayer;
    }
    function papal_antiphon_dum_esset() {
      return off(ss.setupstring('Latin', 'Commune/C4.txt')).get('Ant 3 summi Pontificis');
    }

    // Collects and commemorations ---------------------------------------------------
    function nooctnat() {
      return /19(?:55|6)/.test(ctx.version) && (ctx.month < 12 || ctx.day < 25);
    }

    function do_inclusion_substitutions(text, subs) {
      return ss.doInclusionSubstitutions ? ss.doInclusionSubstitutions(text, subs) : text;
    }

    function getrefs(w, ind, rule) {
      const { dayofweek } = ctx;
      let file = '', item = '';
      let flag = 0;
      let sec = off(null);
      let c = off(null);
      const re = /(.*?)\@([a-z0-9/\-]+?)\:([a-z0-9 ]*)(?::(.*))?(.*)/is;
      let m;
      while ((m = re.exec(w))) {
        let before = m[1];
        file = m[2];
        item = m[3];
        let after = m[5];
        const substitutions = m[4];
        item = item.replace(/\s*$/, '');
        if (/^feria$/i.test(file)) {
          const sm = off(ss.setupstring('Latin', 'Psalterium/Major Special.txt'));
          let a = chompd(sm.get(`Day${dayofweek} Ant ${ind}`));
          if (!T(a)) a = `Day${dayofweek} Ant ${ind} missing`;
          let v = chompd(sm.get(`Day${dayofweek} Versum ${ind}`));
          if (!T(v)) a = `Day${dayofweek} Versus ${ind} missing`;
          a = a.replace(/\s*\*\s*/, ' ');
          w = before + `_\nAnt. ${a}` + `_\n${v}` + `_\n${after}`;
          continue;
        }
        if (/Pasc/i.test(S(ctx.dayname[0]))) file = file.replace(/(C[23])/g, '$1p');
        sec = off(ss.setupstring('Latin', `${file}.txt`));
        let mm;
        if ((mm = /(commemoratio|Octava)/i.exec(item))) {
          const ita = mm[1];
          let a = sec.get(ita);
          if (!T(a)) a = sec.get(`${ita} ${ind}`);
          if (!T(a)) { const i = ind === 2 ? 1 : 2; a = sec.get(`${ita} ${i}`); }
          if (!T(a)) a = `${file} ${item} ${ind} missing\n`;
          flag = 1;
          let om;
          if ((om = /\!.*?(octava|commemoratio)(.*?)\n/i.exec(a))) {
            const oct = om[2];
            if (new RegExp(oct).test(S(ctx.octavam))) flag = 0;
            else ctx.octavam = S(ctx.octavam) + oct;
          }
          if (flag) {
            a = do_inclusion_substitutions(a, substitutions);
            a = `${a}_\n`;
          } else a = '';
          w = `${before}${a}${after}`;
          continue;
        }
        if (/oratio/i.test(item)) {
          let rm;
          if ((rm = /;;(ex|vide)\s+(.*)\s*$/i.exec(S(sec.get('Rank'))))) {
            let f = rm[2];
            if (/^C[1-3]a?$/.test(f) && /Pasc/i.test(S(ctx.dayname[0]))) f += 'p';
            f = `${f}.txt`;
            if (/^C/.test(f)) f = subdirname('Commune') + f;
            c = off(ss.setupstring('Latin', f));
            let rm2;
            if ((rm2 = /;;(ex|vide)\s+(.*)\s*$/i.exec(S(c.get('Rank'))))) {
              let f2 = rm2[2];
              if (/^C[1-3]a?$/.test(f2) && /Pasc/i.test(S(ctx.dayname[0]))) f2 += 'p';
              f2 = `${f2}.txt`;
              if (/^C/.test(f2)) f2 = subdirname('Commune') + f2;
              const c2 = off(ss.setupstring('Latin', f2));
              const merged = new Map();
              c.set('Oratio', T(c.get('Oratio')) ? c.get('Oratio') : c2.get('Oratio'));
              for (const i of [1, 2, 3]) {
                if (!T(c.get(`Ant ${i}`))) c.set(`Ant ${i}`, c2.get(`Ant ${i}`));
                if (!T(c.get(`Versum ${i}`))) c.set(`Versum ${i}`, c2.get(`Versum ${i}`));
              }
            }
          } else c = off(null);
          let a = chompd(sec.get(`Ant ${ind}`)) || chompd(c.get(`Ant ${ind}`));
          if (!T(a)) {
            if (/tempora/i.test(file)) a = getfrompsalterium('Ant', ind);
            a = a || `${file} Ant ${ind} missing\n`;
          }
          a = postprocess_ant(a);
          let v = chompd(sec.get(`Versum ${ind}`)) || chompd(c.get(`Versum ${ind}`));
          if (!T(v)) {
            if (/tempora/i.test(file)) v = getfrompsalterium('Versum', ind);
            v = v || `${file} Versus ${ind} missing\n`;
          }
          v = postprocess_vr(v);
          let o = '';
          if (!/proper/.test(item)) {
            let i = item.replace(/\sgregem.*/i, '');
            o = sec.get(i) || c.get(i);
            if (!T(o)) o = `${file}:${item} missing\n`;
            else if (!/\$Oremus/i.test(o)) o = `$Oremus\n${o}`;
          }
          const pm = papal_rule(rule, true);
          const name = pm ? pm[2] : undefined;
          if (T(name)) {
            if (!/Trident/i.test(ctx.version)) {
              if (/Gregem/i.test(item)) {
                o = papal_prayer(pm[0], pm[1], name);
                let am;
                if ((am = /(!Commem.*)/is.exec(S(after)))) after = am[1];
                else after = '';
                o = '$Oremus\n' + o;
              }
            } else if (/N\./.test(o)) o = replaceNdot(o, name);
          } else if (/N\./.test(o) && T(sec.get('Name'))) {
            o = replaceNdot(o, sec.get('Name'));
          }
          a = do_inclusion_substitutions(a, substitutions);
          v = do_inclusion_substitutions(v, substitutions);
          o = do_inclusion_substitutions(o, substitutions);
          a = a.replace(/\s*\*\s*/, ' ');
          if (!T(before)) before = '!' + translate('Commemoratio') + ` ${S(sec.get('Officium'))}`;
          w = before + `\nAnt. ${a}\n` + `_\n${v}` + `_\n${o}` + `_\n${after}`;
          continue;
        }
        let a = sec.get(item);
        if (T(after) && !/^\s*$/.test(after)) after = `_\n${after}`;
        if (T(before) && !/^\s*$/.test(before)) before += '_\n';
        if (!T(a)) a = `${file} ${item} missing\n`;
        a = do_inclusion_substitutions(a, substitutions);
        w = before + a + after;
      }
      w = w.replace(/\_\n\_/g, '_');
      return w;
    }

    function vigilia_commemoratio(fname) {
      const { version, month, day } = ctx;
      if (/1955|1960/.test(version)) {
        const dt = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (!/(08\-14|06\-23|06\-28|08\-09)/.test(dt)) return '';
      }
      if (!/\.txt$/.test(fname)) fname += '.txt';
      if (!/(Tempora|Sancti)/i.test(fname)) fname = `Sancti/${fname}`;
      const w = off(ss.setupstring('Latin', fname));
      const wrank = perlSplit(S(w.get('Rank')), ';;');
      const vigilString = translate('Vigil');
      let wv;
      if (new RegExp(vigilString, 'i').test(S(w.get('Rank')))) {
        wv = w.get('Oratio');
        if (!T(wv) && /(?:ex|vide) C1v/.test(S(w.get('Rank')))) {
          const com = off(ss.setupstring('Latin', subdirname('Commune') + 'C1v.txt'));
          wv = com.get('Oratio');
          wv = replaceNdot(wv, w.get('Name'));
        }
      } else if (w.has('Oratio Vigilia')) wv = w.get('Oratio Vigilia');
      if (!T(wv)) return '';
      let c = '!' + translate('Commemoratio') + ': ' + translate('Vigilia') + '\n';
      if (new RegExp(vigilString, 'i').test(S(w.get('Rank')))) c = c.replace(/\:.*/, `: ${S(wrank[0])}`);
      let m;
      if ((m = /(\!.*?\n)(.*)/s.exec(S(wv)))) { c = m[1]; wv = m[2]; }
      const p = off(ss.setupstring('Latin', 'Psalterium/Special/Major Special.txt'));
      let a = S(p.get('Feria Ant 2'));
      const v = S(p.get('Feria Versum 2'));
      a = a.replace(/\s*\*\s*/, ' ');
      return c + `Ant. ${a}` + `_\n${v}` + `_\n$Oremus\nv. ${wv}`;
    }

    function getcommemoratio(wday, ind) {
      const w = off(ss.officestring('Latin', wday, ind === 1 ? 1 : 0));
      let c = off(null);
      const { rule, version, rank, winner } = ctx;
      let rm;
      if ((rm = /no\s+(\w+)?\s*commemoratio/i.exec(S(rule))) && (!T(rm[1]) || new RegExp(rm[1], 'i').test(wday)) && !(ctx.hora === 'Vespera' && ctx.vespera === 3 && ind === 1)) return '';
      if (/1960/.test(version) && ctx.hora === 'Vespera' && ind === 3 && N(rank) >= 6 && !/Adv|Quad|Passio|Epi|Corp|Nat|Cord|Asc|Dominica|;;6/i.test(S(w.get('Rank')))) return '';
      const rankA = perlSplit(S(w.get('Rank')), ';;');
      if (N(rankA[2]) < 2.1 && N(rankA[2]) !== 1.15 && (/Feria/.test(S(rankA[1])) || (/Infra Octav/i.test(S(rankA[0])) && N(rank) >= 5 && /Sancti/i.test(S(winner)) && (wday !== ctx.cwinner || !/Trident/.test(version))))) return undefined;
      let mm;
      if ((mm = /(ex|vide)\s+(.*)\s*$/i.exec(S(rankA[3])))) {
        let file = mm[2];
        const cm = /Comex=(.*?);/i.exec(S(w.get('Rule')));
        if (cm && N(rank) < 5) file = cm[1];
        if (/^C[1-3](?![v\d])/.test(file) && /Pasc/i.test(S(ctx.dayname[0]))) file = file.replace(/p?$/, 'p');
        file = `${file}.txt`;
        if (/^C/.test(file)) file = subdirname('Commune') + file;
        c = off(ss.setupstring('Latin', file));
        if (/C10/.test(S(ctx.cwinner)) && /C6/.test(file)) c.set('Versum 3', c.get('Versum 1'));
        let m2;
        if ((m2 = /;;(ex|vide)\s+(.*)\s*$/i.exec(S(c.get('Rank'))))) {
          let f2 = m2[2];
          if (/^C[1-3](?![v\d])/.test(f2) && /Pasc/i.test(S(ctx.dayname[0]))) f2 = f2.replace(/p?$/, 'p');
          f2 = `${f2}.txt`;
          if (/^C/.test(f2)) f2 = subdirname('Commune') + f2;
          const c2 = off(ss.setupstring('Latin', f2));
          if (!T(c.get('Oratio'))) c.set('Oratio', c2.get('Oratio'));
          for (const i of [1, 2, 3]) {
            if (!T(c.get(`Ant ${i}`))) c.set(`Ant ${i}`, c2.get(`Ant ${i}`));
            if (!T(c.get(`Versum ${i}`))) c.set(`Versum ${i}`, c2.get(`Versum ${i}`));
          }
          if (/C10/.test(S(ctx.cwinner)) && /C6/.test(f2)) c.set('Versum 3', c.get('Versum 1'));
        }
      } else c = off(null);
      if (!T(rank)) rankA[0] = w.get('Officium');
      let o = w.get('Oratio');
      if (/N\./.test(S(o)) && T(w.get('Name'))) o = replaceNdot(o, w.get('Name'));
      if (!T(o) && /Oratio Dominica/i.test(S(w.get('Rule')))) {
        wday = wday.replace(/\-[0-9]/, '-0').replace(/Epi1\-0/, 'Epi1-0a');
        const w1 = off(ss.officestring('Latin', wday, 0));
        o = w1.has('OratioW') && w1.get('OratioW') !== undefined ? w1.get('OratioW') : w1.get('Oratio');
      }
      if (!T(o)) o = w.get(`Oratio ${ind}`) || w.get(`Oratio ${4 - ind}`) || c.get('Oratio');
      let popeclass = '';
      const pm = !/Trident/i.test(version) ? papal_rule(w.get('Rule')) : null;
      if (pm) {
        popeclass = pm[1];
        o = papal_prayer(pm[0], pm[1], pm[2]);
      } else if (/N\./.test(S(o))) {
        const nm = w.get('Name') || (papal_rule(w.get('Rule')) || [])[2];
        if (T(nm)) o = replaceNdot(o, nm);
      }
      if (!T(o)) return '';
      if (!/^[$&#/!{]/.test(o)) o = o.replace(/^(?:v. )?/, 'v. ');
      let a = w.get(`Ant ${ind}`);
      if (!T(a) || (/Epi1\-0a|01-12t/.test(S(winner)) && ctx.hora === 'Vespera' && ctx.vespera === 3)) {
        if (!/Epi[2-6]-0/.test(wday)) a = w.get(`Ant ${4 - ind}`);
        else {
          const v = off(ss.setupstring('Latin', 'Psalterium/Special/Major Special.txt'));
          a = v.get('Feria Ant 3');
        }
      }
      if (!T(a)) a = c.get(`Ant ${ind}`);
      const name = w.get('Name');
      a = replaceNdot(S(a), name);
      if (T(popeclass) && /C/.test(popeclass) && ind === 3) a = papal_antiphon_dum_esset();
      if (/tempora/i.test(wday)) {
        if (ctx.month === 12 && ((ctx.hora === 'Vespera' && ctx.day >= 17 && ctx.day <= 23) || (ctx.hora === 'Laudes' && (ctx.day === 21 || ctx.day === 23)))) {
          const v = off(ss.setupstring('Latin', 'Psalterium/Special/Major Special.txt'));
          a = ctx.hora === 'Vespera' ? v.get(`Adv Ant ${ctx.day}`) : v.get(`Adv Ant ${ctx.day}L`);
        }
      }
      if (!T(a)) return '';
      a = postprocess_ant(a);
      let v = w.get(`Versum ${ind}`);
      if (/Epi1\-0a|01\-12t/.test(S(winner))) v = ctx.vespera === 1 && ctx.day === 10 ? c.get('Versum 2') : c.get('Versum Tertia');
      if (!T(v)) v = w.get(`Versum ${4 - ind}`) || c.get(`Versum ${ind}`) || c.get(`Versum ${4 - ind}`) || getfrompsalterium('Versum', ind) || 'versus missing';
      v = postprocess_vr(v);
      let out = '!' + translate('Commemoratio');
      a = a.replace(/\s*\*\s*/, ' ');
      out += ` ${S(rankA[0])}\nAnt. ${a}\n_\n${v}\n_\n$Oremus\n${o}\n`;
      return out;
    }

    function delconclusio(ostr, conclusio) {
      if (/\$Per/s.test(ostr) && /\$Qui/s.test(ostr) && !/196/.test(ctx.version)) {
        let m;
        if ((m = /^([\s\S]*?)(\n\$Per [^\n\r]*?\s*)$/.exec(ostr))) {
          conclusio = m[2];
          ostr = m[1].replace(/\$Qui [^\n\r]*\s*/, '');
        } else if ((m = /^([\s\S]*?)(\n\$Qui [^\n\r]*?\s*)$/.exec(ostr))) {
          conclusio = m[2];
          ostr = m[1].replace(/\$Per [^\n\r]*\s*/, '');
        }
      } else {
        const m = /^(\$(?!Oremus).*?(\n|$)((_|\s*)(\n|$))*)/m.exec(ostr);
        if (m) {
          ostr = ostr.replace(/^(\$(?!Oremus).*?(\n|$)((_|\s*)(\n|$))*)/m, '');
          conclusio = m[1];
        }
      }
      return [ostr, conclusio];
    }

    function oratio(params) {
      params = params || {};
      const { rank, version, dayofweek } = ctx;
      ctx.collectcount = 1;
      let addconclusio;
      let wh = W();
      const ind = ctx.hora === 'Vespera' ? ctx.vespera : 2;
      let w;
      setcomment(ctx.label, ...(params.special ? ['Preces', 2] : ['Source', (/Sancti/.test(S(ctx.winner)) ? 1 : 0) + 2]));

      if (/Epi1/i.test(S(ctx.dayname[0])) && /Infra octavam Epiphaniæ Domini/i.test(S(ctx.rule)) && /1955|196/.test(version)) {
        ctx.rule = S(ctx.rule) + 'Oratio Dominica\n';
      }
      let wtmp = wh; // "%w"
      if ((/Oratio Dominica/i.test(S(ctx.rule)) && (!wh.has('Oratio') || ctx.hora === 'Vespera')) ||
        (/Quattuor/i.test(S(wh.get('Rank'))) && !/Pasc7/.test(S(ctx.dayname[0])) && !/196|cist/i.test(version) && ctx.hora === 'Vespera')) {
        let name = `${ctx.dayname[0]}-0`;
        if (/(?:Epi1|Nat)/i.test(name) && version !== 'Monastic - 1930') name = 'Epi1-0a';
        wtmp = off(ss.setupstring('Latin', subdirname('Tempora') + `${name}.txt`));
      }
      if (dayofweek > 0 && wh.has('OratioW') && N(rank) < 5) w = wtmp.get('OratioW');
      else w = wtmp.get('Oratio');

      if (ctx.hora === 'Matutinum' && wh.has('Oratio Matutinum')) w = wtmp.get('Oratio Matutinum');
      else if (!T(w) || wh.has(`Oratio ${ind}`)) w = wtmp.get(`Oratio ${ind}`);

      if (!T(w)) {
        const c = off(ctx.communeHash);
        let i = ind;
        w = c.get(`Oratio ${i}`);
        if (!T(w)) { i = 4 - i; w = c.get(`Oratio ${i}`); }
        if (!T(w)) w = c.get('Oratio');
      }
      let i = ind;
      if (!T(w)) {
        if (i === 2) { i = 3; w = wtmp.get(`Oratio ${i}`); }
        else w = wtmp.get('Oratio 2');
        if (!T(w)) { i = 4 - i; w = wtmp.get(`Oratio ${i}`); }
      }
      const pm = !/Trident/i.test(version) ? papal_rule(wtmp.get('Rule')) : null;
      if (pm) w = papal_prayer(pm[0], pm[1], pm[2]);

      if (!T(w) && T(ctx.commune)) {
        const com = off(ctx.communeHash);
        w = com.get('Oratio');
        if (!T(w)) w = com.get(`Oratio ${ind}`);
      }
      if (/Tempora/.test(S(ctx.winner)) && !T(w)) {
        const name = `${ctx.dayname[0]}-0`;
        wtmp = off(ss.officestring('Latin', subdirname('Tempora') + `${name}.txt`));
        w = wtmp.get('Oratio');
        if (!T(w)) w = wtmp.get('Oratio 2');
      }
      w = S(w);
      if (/N\./.test(w)) {
        let name;
        const pm2 = papal_rule(wtmp.get('Rule'));
        if (wtmp.has('Name')) name = wtmp.get('Name');
        else if (pm2) name = pm2[2];
        if (T(name)) w = replaceNdot(w, name);
        else w = w.replace(/N\./g, () => setfont(FONT.redfont, 'N.'));
      }

      const commRegexStr = '!(' + translate('Commemoratio') + '|Commemoratio)';
      let pre;
      let mm;
      if ((mm = new RegExp('(.*?)' + commRegexStr, 'is').exec(w)) && !/(laudes|vespera)/i.test(ctx.hora)) {
        w = mm[1];
        w = w.replace(/\s*_\s*/, '');
      } else if (ctx.hora === 'Laudes' && new RegExp(commRegexStr, 'i').test(w) && (mm = /(.*?)(precedenti|sequenti)/is.exec(w))) {
        w = mm[1];
        w = w.replace(/\s*_\s*/, '');
      }
      if (!T(w)) w = 'Oratio missing';
      const horamajor = ctx.hora === 'Laudes' || ctx.hora === 'Vespera';

      if (!/Limit.*?Oratio/i.test(S(ctx.rule))) {
        if (!/^Monastic/.test(version) || ctx.hora !== 'Matutinum' || !/12 lectiones/.test(S(ctx.rule))) {
          if (/Monastic/.test(version) && (!/C12/.test(S(ctx.winner)) || !/cist/i.test(version))) {
            throw new Error('monastic Kyrie branch');
          } else if (/C12/.test(S(ctx.winner)) && !/19[56]|cist/i.test(version)) {
            s.push('$Kyrie');
          }
          if (T(ctx.priest)) s.push('&Dominus_vobiscum');
          else if (!T(ctx.precesferiales)) s.push('&Dominus_vobiscum');
          else {
            const text = perlSplit(S(prayer('Dominus')), /\n/);
            s.push(text[4]);
            ctx.precesferiales = 0;
          }
        }
        const oremus = translate('Oremus');
        s.push(`v. ${oremus}`);
      }

      if (horamajor && /Sub unica conc/i.test(S(wh.get('Rule')))) {
        if (!/196/.test(version)) {
          let m2;
          if ((m2 = /^([\s\S]*?)(\n\$Per [^\n\r]*?\s*)$/.exec(w))) { addconclusio = m2[2]; w = m2[1]; }
          if ((m2 = /^([\s\S]*?)(\n\$Qui [^\n\r]*?\s*)$/.exec(w))) { addconclusio = m2[2]; w = m2[1]; }
        } else w = w.replace(/\$(Per|Qui) .*?\n/, '');
      }
      if (!/^\{/s.test(w)) {
        if (!/^[$&#/!{]/.test(w)) w = w.replace(/^(?:v. )?/, 'v. ');
      }
      s.push(w);
      if (/omit .*? commemoratio/i.test(S(ctx.rule))) return;

      // ---------------- commemorations
      const cc = {};
      let ccind = 0;
      ctx.octavcount = 0;
      const octavestring = '!.*?(O[ckt]t[aá]|' + translate('Octava') + ')';
      const sundaystring = 'Dominic[aæ]|' + translate('Dominica');
      wh = W();
      if (horamajor && N(rank) < 7) {
        let c;
        let cobj = off(null);
        let cvesp = [2];
        if (!((N(rank) >= (!/cist/i.test(version) ? 6 : 7) && !/Pasc[07]|Pent01/.test(S(ctx.dayname[0]))) || (/196/.test(version) && /nocomm1960/i.test(S(wh.get('Rule')))))) {
          if (wh.has(`Commemoratio ${ctx.vespera}`)) c = getrefs(wh.get(`Commemoratio ${ctx.vespera}`), ctx.vespera, wh.get('Rule'));
          else if (wh.has('Commemoratio') && (ctx.vespera !== 3 || /Tempora|C12/i.test(S(ctx.winner)) || /!.*O[ckt]ta/i.test(S(wh.get('Commemoratio'))))) c = getrefs(wh.get('Commemoratio'), ctx.vespera, wh.get('Rule'));
          else c = '';
          if (T(c) && T(ctx.octvespera) && new RegExp(octavestring, 'i').test(c)) throw new Error('octvespera branch (Vespers)');
          if (T(c)) {
            const redn = setfont(FONT.largefont, 'N.');
            c = c.replace(/ N\. /g, ` ${redn} `);
            c = c.replace(/\n!/g, '\n!!');
            c = c.replace(/!!Oratio/gi, '!Oratio');
            c = c.replace(/\$Oremus\s*\n(v\. )?/g, '$Oremus\nv. ');
            const ic = c.split('!!');
            while (ic.length && ic[ic.length - 1] === '') ic.pop();
            for (let item of ic) {
              if (!T(item) || /^\s*$/.test(item) || (new RegExp(octavestring + '|!.*?' + sundaystring, 'i').test(item) && nooctnat()) ||
                (/19(?:55|6)/.test(version) && /!.*?Vigil/i.test(item) && /Sancti/i.test(S(ctx.winner)) && !/08\-14|06\-23|06\-28|08\-09/.test(S(ctx.winner)))) continue;
              if (!/^!/.test(item)) item = `!${item}`;
              ccind++;
              const key = new RegExp(sundaystring, 'i').test(item) ? 3000 : new RegExp(octavestring, 'i').test(item) ? ccind + 7900 : ccind + 9900;
              cc[key] = item;
            }
          }
          if (T(ctx.transfervigil)) {
            let tv = ctx.transfervigil;
            if (!fileExists(tv)) tv = tv.replace(/v\.txt/, '.txt');
            ctx.transfervigil = tv;
            c = vigilia_commemoratio(tv);
            if (T(c)) { ccind++; cc[ccind + 8500] = c; }
          }
        }
        if (ctx.hora === 'Vespera') throw new Error('Vespers commemorations not ported yet');
        for (const cv of cvesp) {
          const centries = cv === 1 ? ctx.ccommemoentries || [] : ctx.commemoentries || [];
          for (let commemo of centries) {
            let key = 0;
            if (!fileExists(commemo) && !/txt$/i.test(commemo)) commemo += '.txt';
            let co = off(ss.officestring('Latin', commemo, 0));
            if (/in.*octavam|post Octavam Asc/i.test(S(co.get('Rank'))) && T(ctx.octvespera)) c = getcommemoratio(commemo, ctx.octvespera);
            else c = getcommemoratio(commemo, cv);
            const c2 = cv === 2 ? vigilia_commemoratio(commemo) : '';
            if (!T(c)) c = c2;
            if (T(c)) {
              const cr = perlSplit(S(co.get('Rank')), ';;');
              if (new RegExp(sundaystring, 'i').test(S(cr[0])) || /01-05\.txt/.test(commemo)) key = !/trident/i.test(version) || (/1906/.test(version) && N(cr[2]) > 5) ? 7000 : /altovadensis/i.test(version) ? 3900 : 2900;
              else key = N(cr[2]) * 1000;
              ccind++;
              key = pstr(10000 - key + ccind);
              cc[key] = c;
            } else continue;
            if (!((N(rank) >= (!/cist/i.test(version) ? 6 : 7) && !/Pasc[07]/.test(S(ctx.dayname[0]))) || /no commemoratio/i.test(S(ctx.rule)) || (/196/.test(version) && /nocomm1960/i.test(S(co.get('Rule')))))) {
              if (co.has(`Commemoratio ${cv}`)) c = getrefs(co.get(`Commemoratio ${cv}`), cv, co.get('Rule'));
              else if (co.has('Commemoratio') && (cv !== 3 || /Tempora/i.test(commemo) || new RegExp(octavestring, 'i').test(S(co.get('Commemoratio'))))) c = getrefs(co.get('Commemoratio'), cv, co.get('Rule'));
              else c = '';
              if (T(c) && T(ctx.octvespera) && new RegExp(octavestring).test(c)) throw new Error('octvespera branch');
              if (T(c)) {
                const redn = setfont(FONT.largefont, 'N.');
                c = c.replace(/ N\. /g, ` ${redn} `);
                c = c.replace(/\n!/g, '\n!!');
                c = c.replace(/!!Oratio/gi, '!Oratio');
                c = c.replace(/\$Oremus\s*\n(v\. )?/g, '$Oremus\nv. ');
                const ic = c.split('!!');
                while (ic.length && ic[ic.length - 1] === '') ic.pop();
                for (let item of ic) {
                  if (!T(item) || /^\s*$/.test(item) || (new RegExp(octavestring + '|!.*?' + sundaystring, 'i').test(item) && nooctnat()) ||
                    (/19(?:55|6)/.test(version) && /!.*?Vigil/i.test(item) && /Sancti/i.test(commemo) && !/08\-14|06\-23|06\-28|08\-09/.test(commemo)) ||
                    (N(rank) >= 5 && new RegExp(octavestring, 'i').test(item) && (ctx.month !== 12 || ctx.day < 18) && /trident/i.test(version) && !/cist/i.test(version) && !/Pent02\-0/.test(commemo))) continue;
                  if (!/^!/.test(item)) item = `!${item}`;
                  ccind++;
                  const k2 = new RegExp(sundaystring, 'i').test(item) ? 3000 : new RegExp(octavestring, 'i').test(item) ? ccind + 7900 : ccind + 9900;
                  cc[k2] = item;
                }
              }
            }
            if (dayofweek !== 0 && cv === 2 && co.has('Oratio Vigilia')) {
              c = vigilia_commemoratio(commemo);
              if (T(c)) { ccind++; cc[ccind + 8500] = c; }
            }
          }
        }
        // 1960: on II. class and higher days at most one commemoration
        const rankA = perlSplit(S(wh.get('Rank')), ';;');
        if (/1960/.test(version) && (N(rankA[2]) >= 5 || (/Feria/i.test(S(ctx.dayname[1])) && N(rankA[2]) >= 4)) && ccind > 1) {
          const keys = Object.keys(cc).sort(perlStringSort);
          const first = cc[keys[0]];
          for (const k of Object.keys(cc)) delete cc[k];
          cc[keys[0]] = first;
          ccind = 1;
        }
      }
      for (const key of Object.keys(cc).sort(perlStringSort)) {
        if (S(s[s.length - 1]).length > 3) s.push('_');
        if (N(key) >= 900) {
          const [ostr, ac] = delconclusio(cc[key], addconclusio);
          addconclusio = ac;
          s.push(ostr);
          ctx.collectcount++;
        }
      }
      if ((!checksuffragium() || /Quad5|Quad6/i.test(S(ctx.dayname[0])) || /1955|196/.test(version)) && T(addconclusio)) s.push(addconclusio);
    }
    const pstr = (n) => String(parseFloat(Number(n).toPrecision(15)));
    // Perl's default sort() is a string sort.
    function perlStringSort(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

    function getsuffragium() {
      const { version } = ctx;
      let comment = /altovadensis/i.test(version) ? 5 : /cisterciensis/i.test(version) ? 4 : /trident/i.test(version) ? 3 : /pasc/i.test(S(ctx.dayname[0])) ? 2 : 1;
      let key = 'Suffragium';
      if (comment === 2) key += ' Paschale';
      else if (comment > 2) key += ` ${ctx.hora}`;
      const suffr = off(ss.setupstring('Latin', 'Psalterium/Special/Major Special.txt'));
      let sf = suffr.get(key);
      if (T(ctx.churchpatron)) sf = S(sf).replace(/r\. N\./, ctx.churchpatron);
      return [sf, comment];
    }

    // ------------------------------------------------------------------ ordinarium and specials
    function getordinarium(hora) {
      let command = hora.replace(/Vesperae/, 'Vespera');
      if (/Tertia|Sexta|Nona/i.test(command)) command = 'Minor';
      const text = ss.store ? undefined : undefined;
      const raw = cal.store.ordinarium(`${command}.txt`);
      const lines = RB.doRead(raw);
      const script = ss.processConditionalLines(lines);
      script.unshift('#Prelude', '');
      return script;
    }

    function specials(script) {
      ctx.octavam = '';
      const wh = W();
      const i = hora === 'Laudes' ? ' 2' : hora === 'Vespera' ? ` ${ctx.vespera}` : '';
      if (wh.has(`Special ${hora}${i}`)) {
        // loadspecial: the whole hour is a stored text
        let str = S(wh.get(`Special ${hora}${i}`));
        return perlSplit(str, /\n/);
      }
      s = [];
      const t = script.slice();
      let tind = 0;
      let specialflag, skipflag;
      let litaniaflag = ctx.litaniaflag;
      while (tind < t.length) {
        let item = t[tind++];
        item = S(item).replace(/\s*$/, '');
        if (!/^\s*\#/.test(item)) {
          if (!skipflag) s.push(item);
          continue;
        }
        if (skipflag) s.push('\n');
        const label = item;
        ctx.label = label;
        skipflag = 0;

        // Capitulum replaced by a versicle
        let rm;
        if (/Capitulum/.test(item) && (rm = /Capitulum Versum 2(.*);?$/im.exec(S(ctx.rule)))) {
          const cv2hora = rm[1];
          if (/nisi ad Laudes/i.test(cv2hora) && hora === 'Laudes') continue;
          if (!((/ad Laudes tantum/i.test(cv2hora) && hora !== 'Laudes') || (/ad Laudes et Vesperas/i.test(cv2hora) && !/^(?:Laudes|Vespera)$/.test(hora)))) {
            if (hora !== 'Completorium') {
              const c = off(ctx.communeHash);
              let v2 = wh.get('Versum 2');
              if (v2 === undefined || v2 === null) v2 = c.get('Versum 2');
              s.push('#' + translate('Versus in loco'), v2, '');
            }
            skipflag = 1;
            continue;
          }
        }

        // Omit this section if the rule says so
        const im = /\#(.+?)(\s|$)/.exec(item);
        const ite = im ? im[1] : undefined;
        let omm;
        if (
          new RegExp('Omit.*? ' + S(ite), 'i').test(S(ctx.rule)) &&
          !(/Capitulum/.test(item) && (omm = /Capitulum Versum 2( etiam ad Vesperas)?/i.exec(S(ctx.rule))) && ((omm[1] && hora === 'Vespera') || hora === 'Laudes')) &&
          (!/Omit ad Matutinum/.test(S(ctx.rule)) || hora === 'Matutinum')
        ) {
          skipflag = 1;
          let comment;
          if (/incipit/i.test(item) && !/Cist|1955|196/i.test(ctx.version)) comment = 2;
          else comment = 1;
          if (!new RegExp('Omit.*? ' + ite + ' mute', 'i').test(S(ctx.rule))) setcomment(label, 'Preces', comment);
          if (/incipit/i.test(item) && !/1955|196/.test(ctx.version) && !/C12/.test(S(ctx.winner)) && !(/cist/i.test(ctx.version) && /C9/.test(S(ctx.winner)))) {
            if (hora === 'Laudes') s.push('$rubrica Secreto a Laudibus');
            else s.push('$rubrica Secreto');
            s.push('$Pater noster', '$Ave Maria');
            if (/^(?:Matutinum|Prima)$/.test(hora)) s.push('$Credo');
          }
          continue;
        }

        if (/Prelude/.test(item)) {
          if (wh.has(`Prelude ${hora}`)) s.push(wh.get(`Prelude ${hora}`));
          continue;
        }

        if (/Ave only/i.test(S(ctx.rule)) && /incipit/i.test(item)) {
          setcomment(label, 'Preces', 2);
          while (!/^\s*\#/.test(S(t[tind]))) {
            if (!/(Pater|Credo)/.test(S(t[tind]))) s.push(t[tind]);
            else if (/Ave/.test(S(t[tind]))) s.push('$Ave Maria');
            tind++;
          }
          continue;
        }

        if (/Commemoratio officii parvi/.test(item)) throw new Error('officium parvum not ported');

        if (/preces/i.test(item)) {
          skipflag = !preces(item) ? 1 : 0;
          setcomment(label, 'Preces', skipflag);
          if (ctx.precesferiales && /Dominicales/i.test(item)) {
            if (!skipflag) s.push('$rubrica Preces flexis genibus');
          }
          if (!skipflag) s.push(getpreces(hora, /Dominicales/i.test(item) ? 1 : 0));
          continue;
        }

        if (/invitatorium/i.test(item)) throw new Error('Invitatorium not ported');

        if (/psalm/i.test(item)) {
          psalmi();
          continue;
        }

        if (/Capitulum/i.test(item) && hora === 'Prima') throw new Error('Prima capitulum not ported');
        if (/Lectio brevis/i.test(item) && hora === 'Completorium') throw new Error('Compline lectio brevis not ported');
        if (/Capitulum/i.test(item) && /^(?:Tertia|Sexta|Nona|Completorium)$/i.test(hora)) {
          if (hora === 'Completorium') s.push(translate(item));
          s.push(capitulum_minor());
          continue;
        }

        if (/Capitulum/i.test(item) && /^(?:Laudes|Vespera)$/.test(hora)) s.push(capitulum_major());

        if (/Regula/i.test(item)) throw new Error('Regula not ported');
        if (/Lectio brevis/i.test(item) && hora === 'Prima') throw new Error('Prima lectio brevis not ported');

        if (/Hymnus/.test(item)) {
          s.push(gethymn());
          continue;
        }

        if (/Canticum/.test(item)) {
          canticum(item);
          continue;
        }

        if (/Oratio/.test(item)) {
          const primeOrCompline = /^(?:Prima|Completorium)$/i.test(hora);
          const triduum = /Limit.*?Oratio/.test(S(ctx.rule));
          const oparams = {};
          if (primeOrCompline && triduum) {
            skipflag = 1;
            oparams.special = 1;
          }
          if (!primeOrCompline || triduum) {
            oratio(oparams);
            continue;
          }
        }

        if (/Suffragium/i.test(item) && /^(?:Laudes|Vespera)$/.test(hora)) {
          if (!checksuffragium() || (!/Cist/i.test(ctx.version) && /Quad5/i.test(S(ctx.dayname[0]))) || /Quad6/i.test(S(ctx.dayname[0]))) {
            setcomment(label, 'Suffragium', 0);
            s.push('\n');
            continue;
          }
          const [suffr, c] = getsuffragium();
          setcomment(label, 'Suffragium', c);
          s.push(suffr);
          continue;
        }

        if (/Martyrologium/.test(item)) throw new Error('Martyrologium not ported');
        if (item === '#Commemoratio defunctorum') throw new Error('Commemoratio defunctorum not ported');
        if (/Antiphona finalis/.test(item)) throw new Error('Antiphona finalis not ported');

        // Litaniae majores flag (St Mark's day)
        let flag = 0;
        if (ctx.votive === 'Hodie') {
          const { month, day, dayofweek } = ctx;
          const dn0 = S(ctx.dayname[0]);
          if (month === 4 && day === 25 && (!/Pasc0/.test(dn0) || dayofweek > 1)) flag = 1;
          if (month === 4 && day === 27 && /Pasc0/.test(dn0) && dayofweek === 2) flag = 1;
          if (!/1960/.test(ctx.version) && month === 4 && day === 25 && /Pasc0/.test(dn0) && dayofweek === 1) flag = 1;
          if (/1960/.test(ctx.version) && month === 4 && day === 26 && /Pasc0/.test(dn0) && dayofweek === 2) flag = 1;
          if (/Laudes Litania/i.test(S(ctx.rule)) && /Sancti/.test(S(ctx.winner)) && day !== 25) ctx.rule = S(ctx.rule).replace(/Laudes Litania/gi, '');
        }

        s.push(translate(label));

        if (/Conclusio/i.test(item) && hora === 'Laudes' && (ctx.month === 4 || !/1960/.test(ctx.version)) &&
          (/Laudes Litania/i.test(S(ctx.rule)) || /Laudes Litania/i.test(S(off(ctx.commemoratioHash).get('Rule'))) || /Laudes Litania/i.test(S(off(ctx.scripturaHash).get('Rule'))) || flag)) {
          const wp = off(ss.setupstring('Latin', 'Psalterium/Special/Preces.txt'));
          const lname = 'Litania';
          s.push('$Domine exaudi', '&Benedicamus_Domino', '');
          const lit = perlSplit(S(wp.get(lname)), /\n\n/);
          lit.push('', '');
          // @lit[0, -1, 1, -2, 2]
          const L = lit.length;
          s.push(lit[0], lit[L - 1], lit[1], lit[L - 2], lit[2]);
          skipflag = 1;
          litaniaflag = 1;
          ctx.litaniaflag = 1;
        }

        if (/Conclusio/.test(item) && /Special Conclusio/i.test(S(ctx.rule))) {
          s.push(wh.get('Conclusio'));
          skipflag = 1;
          specialflag = 1;
        }

        if (/Conclusio/.test(item) && !/C9/i.test(S(ctx.commune)) && !/C9/i.test(S(ctx.votive))) {
          const dirge = cal.dirge ? cal.dirge(hora) : 0;
          if ((T(dirge) || (/Vesperae Defunctorum/.test(S(wh.get('Rule'))) && ctx.vespera === 3)) && hora === 'Vespera') {
            s.push(prayer('DefunctV'));
            skipflag = 1;
            specialflag = 1;
          } else if ((T(dirge) || /Matutinum et Laudes Defunctorum/.test(S(wh.get('Rule')))) && hora === 'Laudes') {
            s.push(prayer('DefunctM'));
            skipflag = 1;
            specialflag = 1;
          }
        }
      }
      return s;
    }

    // Public entry: the script for one hour of one date.
    function script(date, horaName) {
      hora = horaName;
      if (horaName === 'Vesperae') hora = 'Vespera';
      ctx.hora = hora;
      ctx.precesferiales = undefined;
      ctx.collectcount = undefined;
      ctx.octavcount = undefined;
      ctx.antecapitulum = undefined;
      ctx.cwinner = undefined;
      ctx.octvespera = undefined;
      ctx.churchpatron = undefined;
      cal.precedence(date);
      loadLanguage();
      const ord = getordinarium(hora);
      return specials(ord);
    }

    return { script, specials, getordinarium, translate, prayer, loadLanguage, ctx, getantvers, getproprium, getfrompsalterium, postprocess_ant };
  }

  RB.createHours = createHours;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})(typeof globalThis !== 'undefined' ? globalThis : this);
