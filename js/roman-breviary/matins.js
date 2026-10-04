/**
 * Roman Breviary 1960/1962 -- Matins (Matutinum).
 *
 * Port of the Matins subroutines of web/cgi-bin/horas/specmatins.pl of the pinned Divinum Officium
 * commit 0ce8747d7dba3276fc05937635e02360b49a60a6 (MIT): invitatory, hymn, psalmody by nocturn,
 * absolutions and blessings, and lectio() (choice of each lesson, its responsory, Te Deum).
 * Branches for Monastic, Cistercian, Dominican, Tridentine and Divino Afflatu offices are omitted;
 * they cannot run for the Rubrics 1960 versions (see hours.js and the differential test).
 *
 * hours.js supplies the shared helpers through `api`.
 */
(function (root) {
  'use strict';
  const RB = (root.RomanBreviary = root.RomanBreviary || {});

  const LT = { DEFAULT: 0, FERIAL: 1, SUNDAY: 2, SANCTORAL: 3, OCTAVEII: 4, OCTAVE: 5 };

  function createMatins(api) {
    const { ctx, ss, S, N, T, perlSplit, off, setfont, FONT, chompd } = api;
    const D = RB.date;
    const { get_from_directorium } = api.cal.directorium;
    const push = (...x) => api.push(...x);
    const W = () => ctx.winnerHash;
    let langOverride = null; // Perl passes an explicit 'Latin' to one lectio() call inside the blessings check
    const LANG = () => langOverride || api.LANG();
    const V = () => ctx.version;
    const isUndef = (x) => x === undefined || x === null;

    // A mutable copy of an office (Perl: %w = %winner), layered over the original.
    function layer(base) {
      const own = new Map();
      return {
        base,
        isEmpty: !base || base.isEmpty,
        has: (k) => own.has(k) || (base && base.has(k)),
        get: (k) => (own.has(k) ? own.get(k) : base ? base.get(k) : undefined),
        set: (k, v) => own.set(k, v),
        keys: () => [...new Set([...(base ? base.keys() : []), ...own.keys()])]
      };
    }
    const splitN = (str, n) => {
      // Perl split("\n", $str, n): at most n fields, trailing empty fields kept only within the limit
      const parts = S(str).split('\n');
      if (parts.length <= n) return parts;
      return [...parts.slice(0, n - 1), parts.slice(n - 1).join('\n')];
    };
    const rule = () => S(ctx.rule);

    function dayofweek2i() {
      let i = ctx.dayofweek || 1;
      if (i > 3) i -= 3;
      return i;
    }

    // ------------------------------------------------------------------ invitatory
    function invitatorium() {
      const invit = off(ss.setupstring(LANG(), 'Psalterium/Special/Matutinum Special.txt'));
      let name = api.gettempora('Invitatorium');
      let comment;
      if (T(name)) { name = `Invit ${name}`; comment = 1; } else { name = 'Invit'; comment = 0; }
      let i = /^Invit$/i.test(name) ? ctx.dayofweek : 0;
      if (i === 0 && /^Invit$/i.test(name) && (ctx.month < 4 || (T(ctx.monthday) && /^1[0-9][0-9]\-/.test(S(ctx.monthday))))) i = 7;
      const invitArr = perlSplit(S(invit.get(name)), /\n/);
      let ant = chompd(invitArr[i]);
      let [w, c] = api.getproprium('Invit', 1);
      if (T(w)) { ant = chompd(w); comment = c; }
      api.setcomment(ctx.label, 'Source', comment, api.translate('Antiphona'));
      ant = ant.replace(/^.*?=\s*/, '');
      ant = chompd(ant);
      ant = `Ant. ${ant}`;
      ant = api.postprocess_ant(ant);
      const antParts = ant.split('*');
      const ant2 = `Ant. ${S(antParts[1])}`;

      const text0 = api.cal.store.horas(LANG(), 'Psalterium/Invitatorium.txt');
      const lines = RB.doRead(text0);
      let t = lines.join('\n');
      const sub = (pattern, replacement, flags) => { t = RB.perlSubstitute(t, pattern, replacement, flags); };
      if (/Invit2/i.test(rule())) {
        sub(' \\*.*?(\\(\\:\\:\\)\\})?$', ' \\1', 'm');
      } else if (/Quad[56]/i.test(S(ctx.dayname[0])) && /tempora/i.test(S(ctx.winner)) && !/Gloria responsory|Invit6/i.test(rule())) {
        sub('&Gloria', '&Gloria2', '');
        sub('^(v\\.|\\{\\([cf][1-4]b?\\))\\s*.* \\^ (.)', '\\1 \\u\\2', 'm');
        sub('\\$ant2\\s*(?=\\$)', '', 's');
      } else if (!T(w) && ctx.dayofweek === 1 && !(T(W().get('Invit')) || T(off(ctx.communeHash).get('Invit'))) && /(Epi|Pent|Quadp)/i.test(S(ctx.dayname[0]))) {
        sub('^(v\\.|\\{\\([cf][1-4]b?\\))\\s*.* \\+ (.)', '\\1 \\u\\2', 'm');
      }
      t = t.replace(/[+*^=_] /g, '');
      t = t.replace(/\$ant2/g, () => ant2);
      t = t.replace(/\$ant/g, () => ant);
      push(t);
    }

    // ------------------------------------------------------------------ hymn
    function hymnusmatutinum() {
      const { version, day, month, year } = ctx;
      let hymn = '';
      let name = 'Hymnus';
      let comment;
      if (!W().has('Hymnus Matutinum')) name += api.checkmtv(version, W());
      const [h, c] = api.getproprium(`${name} Matutinum`, 1);
      if (T(h)) {
        const hs = api.hymnshiftFns();
        let hh = h;
        if (hs.shift || hs.shiftmerge) {
          const [h1] = api.getproprium(`${name} Vespera`, 1);
          hh = h1;
        } else if (hs.merge) {
          const [h1] = api.getproprium(`${name} Vespera`, 1);
          hh = S(hh).replace(/^(v\. )/, '');
          let h1s = S(h1);
          const idx = h1s.lastIndexOf('_');
          h1s = idx >= 0 ? h1s.slice(0, idx) + '_\n' + hh : h1s;
          hh = h1s;
        }
        hymn = hh;
        comment = c;
      } else {
        name = api.gettempora('Hymnus matutinum');
        name = T(name) ? `Hymnus ${name}` : `Day${ctx.dayofweek} Hymnus`;
        comment = T(name) ? 1 : 5;
        if (/^Day0 Hymnus$/i.test(name) && (month < 4 || (T(ctx.monthday) && /^1[0-9][0-9]\-/.test(S(ctx.monthday)) && !/Cist/i.test(version)))) name += '1';
      }
      api.setcomment(ctx.label, 'Source', comment);
      return [hymn, name];
    }

    // ------------------------------------------------------------------ type of readings for 1960
    function gettype1960() {
      const { version, rank } = ctx;
      let type = LT.DEFAULT;
      if (/196/.test(version) && !/(C9|Defunctorum)/i.test(S(ctx.votive))) {
        const dn1 = S(ctx.dayname[1]);
        if (/post Nativitatem/i.test(dn1)) type = LT.OCTAVEII;
        else if (N(rank) < 2 || /(feria|vigilia|die)/i.test(dn1)) type = LT.FERIAL;
        else if (!/Monastic/i.test(version) && (!/1962/.test(version) || !/Pasc.-0/.test(S(ctx.winner))) && (/dominica.*?semiduplex/i.test(dn1) || /Pasc1\-0/i.test(S(ctx.winner)))) type = LT.SUNDAY;
        else if (N(rank) < 5) type = LT.SANCTORAL;
      }
      if (/9 lectiones 1960|12 lectiones/i.test(rule())) type = LT.DEFAULT;
      return type;
    }

    function tedeum_required(num) {
      const { version, winner, commune, duplex, dayofweek } = ctx;
      const r = rule();
      const dn1 = S(ctx.dayname[1]);
      return (
        ((num === 9 && /9 lectiones/i.test(r)) ||
          (num === 3 && (!/9 lectiones/i.test(r) || duplex === 1 || (/19(?:55|6[02])/.test(version) && gettype1960() !== LT.DEFAULT)))) &&
        !/no Te Deum/.test(r) &&
        !/C9/.test(S(commune)) &&
        (!/^Tempora.*(?:Adv|Quad)/.test(S(winner))) &&
        ((!dayofweek && !/(Vigilia)/.test(dn1)) ||
          (/Sancti|Commune/i.test(S(winner)) && !/(Vigilia)/.test(dn1)) ||
          /Feria Te Deum/i.test(r) ||
          /Pasc|Nat|C10/.test(S(winner)) ||
          (/^Tempora/.test(S(winner)) && N(ctx.rank) > 5 && dayofweek) ||
          (!/19(?:55|6)/.test(version) && /Pent01-[56]|Pent02-[1-4]/.test(S(winner))) ||
          (/Divino/.test(version) && /Pent02-6|Pent03-[1-5]/.test(S(winner))))
      );
    }

    function contract_scripture(num, respFlag) {
      if (num !== 2 || /(C9|Defunctorum)/i.test(S(ctx.votive))) return 0;
      if (!/196/.test(ctx.version)) return 0;
      if (/C10/i.test(S(ctx.commune))) return 1;
      if ((ctx.ltype1960 === LT.SANCTORAL || ctx.ltype1960 === LT.SUNDAY) && (!/scriptura1960/i.test(rule()) || T(respFlag)) && (!/feria/i.test(S(ctx.dayname[1])) || T(ctx.commemoratio))) return 1;
      return 0;
    }

    function cujus_q(str) {
      if (/Quorum Festum/.test(rule())) return 1;
      if (/C11|08-15|09-08|12-08/.test(S(ctx.commune))) return 4;
      if (/basilic/i.test(str)) return -2;
      if (/S. P. N. Benedicti Abbatis/.test(str)) return 5;
      let j = 0;
      if (/(virgin|vidu[aæ]|poenitentis|pœnitentis|C6|C7)/i.test(str)) { if (!/C[2-5]/.test(str)) j += 2; }
      if (/(?:ss\.|bb\.|sanctorum|sociorum)/i.test(str)) j++;
      return j;
    }

    // ------------------------------------------------------------------ absolutions and blessings
    function get_absolutio_et_benedictiones(num) {
      const ben = off(ss.setupstring(LANG(), 'Psalterium/Benedictions.txt'));
      const abs = perlSplit(S(ben.get('Absolutiones')), /\n/);
      const eva = perlSplit(S(ben.get('Evangelica')), /\n/);
      const wr = S(W().get('Rank'));
      const winner = S(ctx.winner);
      let bens;
      if (num && (/9 lectiones/i.test(rule()) || /12 lectiones/i.test(rule()))) {
        const rpn = /12 lectio/.test(rule()) ? 3 : 2;
        bens = perlSplit(S(ben.get(`Nocturn ${num}`)), /\n/);
        if (num === 3 && /Sancti|Quad5-5/.test(winner)) {
          if (/12-25/.test(winner)) {
            bens = perlSplit(S(ben.get('Nocturn 3 12-25')), /\n/);
          } else if (/(?:\bss?\.|\bbb?\.|sanctorum)/i.test(wr) || (/C11|08-15|09-08|12-08/.test(S(ctx.commune)) && !/Cist/i.test(ctx.version))) {
            bens[1] = bens[3 + cujus_q(wr)];
          }
        }
        if (num === 3 && !/12-25/.test(winner)) bens[0] = eva[0];
        if (num === 3 && !/12-25/.test(winner) && !/Cist/i.test(ctx.version)) {
          langOverride = 'Latin';
          let w;
          try { w = lectio(9); } finally { langOverride = null; }
          if (/!(?:Matt|Marc|Luc|Joannes)/.test(S(w))) {
            const ev9 = perlSplit(S(ben.get('Evangelica9')), /\n/);
            bens[rpn] = ev9[0];
          }
        }
        bens.unshift(abs[num - 1]);
      } else if (/(C1[02])/.test(winner)) {
        const mm = /(C1[02])/.exec(winner);
        const mariae = off(ss.setupstring(LANG(), `Commune/${mm[1]}.txt`));
        bens = perlSplit(S(mariae.get('Benedictio')), /\n/);
      } else {
        bens = perlSplit(S(ben.get('Nocturn 3')), /\n/);
        if (/vigil|quatt|ciner/i.test(wr) || /Quad[1-5]-[^0]|Quad6-1|Pasc5-1|Pasc[07]/.test(winner) || (/Nat(?:29|3[01])/.test(winner) && !/196[02]/.test(ctx.version))) {
          bens[0] = eva[0];
        } else if (/dominica/i.test(wr)) {
          const ev9 = perlSplit(S(ben.get('Evangelica9')), /\n/);
          bens[2] = ev9[0];
        } else if ((/Sancti/.test(winner) && /\bss?\.|b\./i.test(wr)) || /C11/.test(S(ctx.commune))) {
          bens[1] = bens[3 + cujus_q(wr)];
        } else {
          const i = dayofweek2i();
          bens = perlSplit(S(ben.get(`Nocturn ${i}`)), /\n/);
        }
        bens.unshift(abs[dayofweek2i() - 1]);
      }
      return bens;
    }

    function lectiones(num) {
      const a = get_absolutio_et_benedictiones(num);
      if (!/Limit.*?Benedictio/i.test(rule()) && !/Cist/i.test(ctx.version)) {
        if (!/sine absolutio/i.test(rule())) push('$rubrica Pater secreto');
        if (!/sine absolutio/i.test(rule())) push('$Pater noster Et');
        if (!/^Ordo Praedicatorum/.test(ctx.version) && !/sine absolutio/i.test(rule())) push(`Absolutio. ${a[0]}`, '$Amen');
      } else if (!/Cist/i.test(ctx.version) || /Matutinum Romanum/i.test(rule())) {
        push('$Pater totum secreto');
      }
      push('\n');
      const rpn = num && /12 lectio/.test(rule()) ? 4 : !/Lectio brevis/.test(rule()) ? 3 : 1;
      const n = num || 1;
      for (let i = 1; i <= rpn; i++) {
        const l = (n - 1) * rpn + i;
        let idx = i;
        if (/Lectio brevis sine absolutio/.test(rule())) idx = 0;
        if (!/Limit.*?Benedictio/i.test(rule())) {
          push(api.prayer('Jube domne'));
          push(`Benedictio. ${a[idx]}`, '$Amen');
        }
        push(`&lectio(${l})`, '\n');
      }
    }

    // ------------------------------------------------------------------ psalmody
    function antmatutinumPaschal(psalmiIn, proper) {
      let psalmi = psalmiIn.slice();
      const dn0 = S(ctx.dayname[0]);
      if (ctx.dayofweek || (/Pasc6/.test(dn0) && /196/.test(ctx.version))) {
        if (!proper || /\/C10/.test(S(ctx.winner))) {
          psalmi = psalmi.map((x) => S(x).replace(/.*?(?=;;)/, ''));
          psalmi[0] = api.alleluia_ant() + psalmi[0];
          if (ctx.dayofweek && /9 lectio/i.test(rule()) && (!/196/.test(ctx.version) || N(ctx.rank) > 3) && N(ctx.rank) >= 2) {
            psalmi[5] = api.alleluia_ant() + psalmi[5];
            psalmi[10] = api.alleluia_ant() + psalmi[10];
          }
        } else if (!/tempora/i.test(S(ctx.winner))) {
          const perNoct = 5;
          for (let i = 0; i <= 3; i++) {
            psalmi[i * perNoct + 1] = S(psalmi[i * perNoct + 1]).replace(/.*;;/, ';;');
            psalmi[i * perNoct + 2] = S(psalmi[i * perNoct + 2]).replace(/.*;;/, ';;');
          }
        }
      } else if (/Pasc[1-5]/i.test(dn0) && /Dominica/.test(S(ctx.dayname[1])) && !/Praedicatorum|Monastic/i.test(ctx.version)) {
        const pm = off(ss.setupstring(LANG(), 'Psalterium/Psalmi/Psalmi matutinum.txt'));
        const a = perlSplit(S(pm.get('Pasch0')), /\n/);
        for (let i = 0; i < psalmi.length; i++) psalmi[i] = S(psalmi[i]).replace(/.*;;/, () => S(a[i]));
        if (/196/.test(ctx.version)) for (let i = 1; i < psalmi.length; i++) psalmi[i] = S(psalmi[i]).replace(/.*;;/, ';;');
      }
      return psalmi;
    }

    function getantmatutinum() {
      const nocturns = [1, 2, 3];
      let ppN = 3;
      const target = 15;
      const flag = 0;
      const [wprop, cprop] = api.getproprium('Ant Matutinum', flag);
      if (!T(wprop)) return [undefined, undefined];
      let w = wprop;
      const wpropArr = perlSplit(S(wprop), /\n/);
      const wArr = [];
      if (wpropArr.length < target) {
        for (const noc of nocturns) {
          if (wpropArr.length < ppN) ppN = wpropArr.length;
          for (let k = 0; k < ppN; k++) wArr.push(wpropArr.shift());
          if (!noc) break;
          const [vers] = api.getproprium(`Nocturn ${noc} Versum`, 1);
          wArr.push(...perlSplit(S(vers), /\n/));
        }
        w = wArr.join('\n');
      }
      return [w, cprop];
    }

    function nocturn(num, psalmi, select) {
      if (num) push('!' + api.translate('Nocturn') + ' ' + 'I'.repeat(num));
      else push('!' + api.translate('Ad Nocturnum'));
      const psalmiN = [];
      for (let i = 0; i <= select.length - 3; i++) psalmiN.push(psalmi[select[i]]);
      const duplexf = /196/.test(ctx.version) || (N(ctx.duplex) > 2 && !/Matins simplex/.test(rule()) && !/C12/.test(S(ctx.winner)));
      api.antetpsalm(psalmiN, duplexf);
      const last = select[select.length - 1];
      let vs;
      if (/^\d+$/.test(String(last))) vs = [psalmi[select[select.length - 2]], psalmi[last]];
      else vs = [select[select.length - 2], select[select.length - 1]];
      if (api.alleluia_required(ctx.dayname[0], ctx.votive)) {
        vs[0] = api.ensure_single_alleluia(S(vs[0]));
        vs[1] = api.ensure_single_alleluia(S(vs[1]));
      }
      push('\n', vs[0], vs[1], '\n');
    }

    function psalmi_matutinum() {
      const { dayofweek, version } = ctx;
      const pm = off(ss.setupstring(LANG(), 'Psalterium/Psalmi/Psalmi matutinum.txt'));
      let psalmi = perlSplit(S(pm.get(`Day${dayofweek}`)), /\n/);
      let comment = 1;
      let prefix = api.translate('Antiphonae');
      if (dayofweek === 0 && /Adv/i.test(S(ctx.dayname[0]))) psalmi = perlSplit(S(pm.get('Adv 0 Ant Matutinum')), /\n/);
      if (ctx.laudes === 2 && dayofweek === 3 && !/trident/i.test(version) && !/12-24/i.test(S(ctx.winner))) psalmi = perlSplit(S(pm.get('Day31')), /\n/);
      const name = api.gettempora('Psalmi Matutinum');
      if (T(name) && !/Trident/i.test(version) && (/tempora/i.test(S(ctx.winner)) || name === 'Nat' || name === 'Epi')) {
        if (dayofweek === 0) {
          for (let i = 1; i <= 3; i++) {
            const [a, b] = splitN(pm.get(`${name} ${i} Versum`), 2);
            psalmi[(i - 1) * 5 + 3] = a;
            psalmi[(i - 1) * 5 + 4] = b;
          }
          if (/1960/.test(version)) { psalmi[13] = psalmi[3]; psalmi[14] = psalmi[4]; }
        } else {
          let i = dayofweek;
          if (i > 3) i -= 3;
          const [a, b] = splitN(pm.get(`${name} ${i} Versum`), 2);
          psalmi[13] = a;
          psalmi[14] = b;
        }
      }
      const [w, c] = getantmatutinum();
      if (T(w)) {
        psalmi = perlSplit(S(w), /\n/);
        comment = c;
        prefix += ' ' + api.translate('et Psalmi');
      }
      if (/Pasc[1-6]/i.test(S(ctx.dayname[0])) && !/C9|C12/.test(S(ctx.votive))) psalmi = antmatutinumPaschal(psalmi, S(w).length);
      let rm;
      if ((rm = /Ant Matutinum ([0-9]+) special/i.exec(rule()))) {
        const ind = +rm[1];
        let wa = S(W().get(`Ant Matutinum ${ind}`)).replace(/\s*$/, '');
        if (T(wa)) {
          if (ind === 12 && /Pasc/i.test(S(ctx.dayname[0]))) psalmi[10] = S(psalmi[10]).replace(/^.*?;;/, () => `${wa};;`);
          else psalmi[ind] = S(psalmi[ind]).replace(/^.*?;;/, () => `${wa};;`);
        }
      }
      api.setcomment(ctx.label, 'Source', comment, prefix);

      if (/9 lectio/i.test(rule()) && !gettype1960() && N(ctx.rank) >= 2) {
        if (!W().has('Ant Matutinum')) {
          const dn0 = S(ctx.dayname[0]);
          if ((name === 'Pasch' || name === 'Asc') && N(ctx.rank) < 5 && !/(?:in|post).*octava.*Ascensio/i.test(S(W().get('Rank')))) {
            const dname = /Dominica/i.test(S(W().get('Rank'))) ? 'Dominica' : 'Feria';
            const spec = perlSplit(S(pm.get(`Pasch Ant ${dname}`)), /\n/);
            for (const i of [3, 4, 8, 9, 13, 14]) psalmi[i] = spec[i];
          } else if (/tempora/i.test(S(ctx.winner)) && /^(?:Adv|Quad|Pasch)$/i.test(name)) {
            for (let i = 1; i <= 3; i++) {
              const [a, b] = splitN(pm.get(`${name} ${i} Versum`), 2);
              psalmi[(i - 1) * 5 + 3] = a;
              psalmi[(i - 1) * 5 + 4] = b;
            }
          }
        }
        for (let k = 1; k <= 3; k++) {
          const sel = [];
          for (let i = (k - 1) * 5; i <= k * 5 - 1; i++) sel.push(i);
          nocturn(k, psalmi, sel);
          lectiones(k);
        }
        push('\n');
        return;
      }

      // Office of three lessons
      let vers;
      const vn = dayofweek2i();
      if (/Pasc[1-6]/i.test(S(ctx.dayname[0])) && !/Trident/i.test(version) && !/C9|C12/.test(S(ctx.votive))) {
        if (/196/.test(version) && name === 'Asc') {
          const r = off(ss.setupstring(LANG(), 'Tempora/Pasc5-4.txt'));
          vers = r.get(`Nocturn ${vn} Versum`);
        } else vers = pm.get(`Pasch ${vn} Versum`);
      }
      const psalmIndices = [0, 1, 2];
      if (!T(vers)) {
        vers = `${psalmi[13]}\n${psalmi[14]}`;
        comment = 5;
      }
      if (psalmi.length > 9) psalmIndices.push(5, 6, 7, 10, 11, 12);
      if (ctx.month === 12 && ctx.day === 24) { vers = pm.get('Nat24 Versum'); comment = 1; }
      if (/Pasc[07]/i.test(S(ctx.dayname[0]))) { vers = `${psalmi[3]}\n${psalmi[4]}`; comment = 2; }
      if (/votive nocturn/i.test(rule())) {
        let i = dayofweek2i();
        i--;
        i *= 5;
        psalmIndices.length = 0;
        for (let k = i; k <= i + 2; k++) psalmIndices.push(k);
      }
      psalmIndices.push(...perlSplit(S(vers), /\n/));
      nocturn(0, psalmi, psalmIndices);
      lectiones(0);
    }

    // ------------------------------------------------------------------ lessons
    function initiarule(month, day, year) {
      const key = String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      return S(get_from_directorium('stransfer', ctx.version, key, year)).replace(/(XX-XX)?;;.*$/, '');
    }

    function tferifile(wl, winit, start, i) {
      wl.set(`Lectio${start}`, winit.get(`Lectio${i}`));
      if (winit.has(`Responsory${i}`) && (/Initia cum Responsory/i.test(S(winit.get('Rule'))) || /Dominica/i.test(S(winit.get('Rank'))) || /Dominica/i.test(S(winit.get('Scriptura'))))) {
        wl.set(`Responsory${start}`, winit.get(`Responsory${i}`));
      } else if (!wl.has(`Responsory${start}`)) {
        wl.set(`Responsory${start}`, ctx.scripturaHash.get(`Responsory${i}`));
      }
      return wl;
    }

    function resolveitable(wl, fileIn) {
      let file = fileIn;
      let winit = off(null);
      const lim0 = /12 lect/.test(rule()) ? 4 : 3;
      if (!/\~B$/.test(file) || !T(ctx.initia)) {
        const replace = /\~R$/.test(file) ? 1 : 0;
        file = file.replace(/~[ABR]$/, '');
        const files = perlSplit(file, /~/);
        let lim = lim0;
        let start = 1;
        if (T(ctx.initia) && !replace) {
          start = files.length < 2 ? lim0 : 2;
          if (!/(9|12) lectiones/i.test(rule()) && /Sancti/i.test(S(ctx.winner))) { lim = 1; start = 1; }
        }
        let i = 1;
        while (files.length && i <= lim) {
          const f = files.shift();
          winit = off(ss.setupstring(LANG(), `Tempora/${f}.txt`));
          wl = tferifile(wl, winit, start, 1);
          i++;
          start++;
        }
        i = 2;
        while (start <= lim0) {
          wl = tferifile(wl, winit, start, i);
          i++;
          start++;
        }
      } else {
        file = file.replace(/~[ABR]$/, '');
        const files = perlSplit(file, /~/);
        let lim = 1;
        let start = 2;
        if (files.length > 1 && !(!/(9|12) lectiones/i.test(rule()) && /Sancti/i.test(S(ctx.winner)))) { lim = 2; start = 3; }
        winit = wl.has('Lectio2') ? wl : ctx.scripturaHash;
        let i = 1;
        while (start < 4) {
          wl = tferifile(wl, winit, start, i);
          i++;
          start++;
        }
        i = 1;
        start = 1;
        while (files.length && i <= lim) {
          const f = files.shift();
          winit = off(ss.setupstring(LANG(), `Tempora/${f}.txt`));
          wl = tferifile(wl, winit, start, 1);
          i++;
          start++;
        }
      }
      return wl;
    }

    // Perl prevdayl1(): reproduces its defects (the assignment `$day = 0` sets the global day to 0).
    function prevdayl1(s) {
      const sFirst = S(s).split(',')[0];
      const monthtab = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31.3, 31];
      const d = ctx.day - 1;
      const m = ctx.month;
      ctx.day = 0; // `if ($day = 0)` assigns
      const kd = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const w1 = off(ss.setupstring(LANG(), `Sancti/${kd}.txt`));
      const l = w1.get('Lectio1');
      return new RegExp(`!.*?${sFirst} 1:`, 'i').test(S(l)) ? 1 : 0;
    }

    function StJamesRule(wl, num, sArg) {
      let w1 = off(null);
      if (/Dominica/i.test(S(wl.get('Rank'))) && prevdayl1(sArg)) {
        const kd = `${ctx.dayname[0]}-1`;
        w1 = off(ss.setupstring(LANG(), `Tempora/${kd}.txt`));
      }
      let sm;
      if (/Jacobi|Joannis/.test(S(wl.get('Rank'))) && (sm = new RegExp(`!.*?(${sArg}) `, 'i').exec(S(ctx.scripturaHash.get('Lectio1'))))) {
        w1 = ctx.scripturaHash;
      }
      if (!w1.has(`Lectio${num}`)) return wl;
      wl.set(`Lectio${num}`, w1.get(`Lectio${num}`));
      return wl;
    }

    function responsory_gloria(wIn, num) {
      let w = S(wIn).replace(/&Gloria1?/g, '&Gloria1');
      if ((num === 1 && /(?:Adv1|Pasc0)-0/i.test(S(ctx.winner)) && !/cist/i.test(ctx.version)) || /requiem Gloria/i.test(rule())) return w;
      const rpn = /12 lectio/.test(rule()) ? 4 : 3;
      if (num % rpn === 0 || (!/^Monastic|Praedicatorum/.test(ctx.version) && num % rpn === rpn - 1 && tedeum_required(num + 1))) {
        if (!/&Gloria/i.test(w)) {
          w = w.replace(/[\s_]*$/gs, '');
          w = w.replace(/(R\..*?)$/, (m0, a) => `${a}\n&Gloria1\n${a}`);
        }
      } else {
        w = w.replace(/.&Gloria.*/s, '');
      }
      return w;
    }

    function matins_lectio_responsory_alleluia(r) {
      r = S(r).replace(/\s*~\s*/gs, ' ');
      const resp = perlSplit(r, /\n/);
      resp[1] = api.ensure_single_alleluia(S(resp[1]));
      if (!(/cist/i.test(ctx.version) && /&Gloria/i.test(S(resp[4])))) resp[3] = api.ensure_single_alleluia(S(resp[3]));
      resp[resp.length - 1] = api.ensure_single_alleluia(S(resp[resp.length - 1]));
      return resp.join('\n');
    }

    // The text of lesson `num`, with its responsory, as expanded for "&lectio(n)".
    function lectio(numIn) {
      const { version } = ctx;
      let num = numIn;
      ctx.ltype1960 = gettype1960();
      if (/C12/i.test(S(ctx.winner))) ctx.ltype1960 = LT.DEFAULT;
      if (ctx.ltype1960 === LT.SUNDAY && num === 3) num = 7;
      else if (num === 3 && ((ctx.ltype1960 === LT.SANCTORAL && !/(C9|Defunctorum)/i.test(S(ctx.votive))) ||
        (!/196|Cist/.test(version) && !/1 et 2 lectiones/i.test(rule()) && /Sancti/i.test(S(ctx.winner)) && N(ctx.rank) < 2 && !/vigil|(vide|ex) C10/i.test(S(W().get('Rank')))))) {
        num = 4;
      }
      let wl = layer(W());
      const nocturnOf = (n) => Math.floor((n - 1) / (/12 lectiones/i.test(rule()) ? 4 : 3)) + 1;
      let nocturn = nocturnOf(num);
      let homilyflag = ctx.commemoratioHash.has('Lectio1') && /\!(Matt|Mark|Marc|Luke|Luc|Joannes|John)\s+[0-9]+\:[0-9]+\-[0-9]+/i.test(S(ctx.commemoratioHash.get('Lectio1'))) ? 1 : 0;
      const r = () => rule();

      // Lectio1 OctNat/TempNat: Dec 29 through Jan 05
      if (nocturn === 1 && /Lectio1 (Oct|Temp)Nat/i.test(r())) {
        let temp;
        if (ctx.month === 12 && ctx.day < 29) {
          temp = off(ss.officestring(LANG(), 'Sancti/12-25.txt'));
        } else {
          let tfile = 'Tempora/Nat' + String(ctx.day).padStart(2, '0') + '.txt';
          const t = get_from_directorium('tempora', version, tfile);
          tfile = T(t) ? t : tfile;
          temp = off(ss.officestring(LANG(), tfile));
        }
        const tl = layer(temp);
        if (contract_scripture(2)) tl.set('Lectio2', S(tl.get('Lectio2')) + S(tl.get('Lectio3')));
        wl.set(`Lectio${num}`, tl.get(`Lectio${num}`));
        wl.set(`Responsory${num}`, tl.get(`Responsory${num}`));
      }

      // Lectio1 tempora: Octave of Epiphany
      if (nocturn === 1 && /Lectio1 tempora/i.test(r()) && ctx.scripturaHash.has('Lectio1')) {
        const scrip = ctx.scripturaHash;
        wl.set(`Lectio${num}`, scrip.get(`Lectio${num}`));
        wl.set(`Responsory${num}`, scrip.get(`Responsory${num}`));
      }

      // scriptura1960
      if (num < 3 && /196/.test(version) && /scriptura1960/i.test(r()) && ctx.scripturaHash.has(`Lectio${num}`)) {
        const c = ctx.scripturaHash;
        wl.set(`Lectio${num}`, c.get(`Lectio${num}`));
        if (num === 2 && !/(C9|Defunctorum)/i.test(S(ctx.votive)) && (!/feria/i.test(S(ctx.dayname[1])) || T(ctx.commemoratio))) {
          let l2 = S(wl.get('Lectio2'));
          const m = /(.*?)\_/s.exec(l2);
          if (m) wl.set('Lectio2', m[1]);
          wl.set('Lectio2', S(wl.get('Lectio2')) + S(c.get('Lectio3')));
        }
      }

      // initia table
      if (nocturn === 1 && !/1963/.test(version) && !/C12/.test(S(ctx.winner))) {
        const file = initiarule(ctx.month, ctx.day, ctx.year);
        if (T(file)) wl = resolveitable(wl, file);
      }

      let sm;
      if (num < 4 && (sm = /StJamesRule=((?:1 )?[a-z,\|á]+)\s/i.exec(r()))) wl = StJamesRule(wl, num, sm[1]);

      if (/C12/i.test(S(ctx.winner))) {
        if ((/1960/.test(version) || (/Sancti/i.test(S(ctx.winner)) && N(ctx.rank) < 2)) && num === 4) num = 3;
        num = num % 3;
        if (num === 0) num = 3;
      }
      let w = wl.get(`Lectio${num}`);

      if (nocturn === 1 && /Lectio1 Quad/i.test(r()) && !/Quad(\d|p3\-[3456])/i.test(S(ctx.dayname[0]))) {
        w = '';
        ctx.rule = S(ctx.rule).replace(/in 1 Nocturno L.*loco/, '');
      }

      if (/12 lectiones/i.test(r()) && !/Lectio1 (Oct|Temp)(Nat|ora)/i.test(r()) && ((num === 4 && !wl.has('Lectio1')) || (num === 9 && !wl.has('Lectio10')))) w = '';

      if (homilyflag && /vigilia/i.test(S(ctx.commemoratioHash.get('Rank')))) homilyflag = 9;

      const commune = S(ctx.commune);
      const communeH = off(ctx.communeHash);
      if (!T(w) && ((/^ex/i.test(S(ctx.communetype)) && /Tempora/i.test(commune) && N(ctx.rank) > 3) ||
        (nocturn === 1 && homilyflag === 1 && communeH.has(`Lectio${num}`) && !/in 1 Nocturno/i.test(r())))) {
        wl = layer(communeH);
        w = wl.get(`Lectio${num}`);
      }

      if (!T(w) && /sancti/i.test(S(ctx.winner)) && /^C/.test(commune) && ((/^ex/i.test(S(ctx.communetype)) && N(ctx.rank) > 3) || new RegExp(`in ${nocturn} Nocturno Lectiones ex`, 'i').test(r()))) {
        let com = communeH;
        let lecnum = `Lectio${num}`;
        let lm;
        if ((lm = new RegExp(`in ${nocturn} Nocturno Lectiones ex (Commune|C\\d+[a-z]*) in (\\d+) loco`, 'i').exec(r()))) {
          const loco = +lm[2];
          if (lm[1] !== 'Commune') com = off(ss.setupstring(LANG(), `Commune/${lm[1]}.txt`));
          if (loco > 1) lecnum += ` in ${loco} loco`;
          w = com.get(lecnum);
        } else if (com.has(lecnum)) {
          w = com.get(lecnum);
        }
        if (T(w) && contract_scripture(num)) {
          lecnum = lecnum.replace(/Lectio2/, 'Lectio3');
          w = S(w) + S(com.get(lecnum));
        }
      }

      // fill with Scriptura
      const scrip = ctx.scripturaHash;
      if (!T(w) && ((num < 4 && scrip.has(`Lectio${num}`)) || (num === 4 && /12 lect/i.test(r()) && scrip.has('Lectio3')))) {
        wl = layer(scrip);
        const infile = initiarule(ctx.month, ctx.day, ctx.year);
        if (T(infile) && !/C12/.test(S(ctx.winner))) wl = resolveitable(wl, infile);
        w = wl.get(`Lectio${num}`);
      } else if (!T(w) && num === 4 && ctx.commemoratioHash.has(`Lectio${num}`) && /1960/i.test(version)) {
        wl = layer(ctx.commemoratioHash);
        w = wl.get(`Lectio${num}`);
      }

      if (contract_scripture(num)) {
        const m = /(.*?)\_/s.exec(S(w));
        if (m) w = m[1];
        const w1 = wl.get('Lectio3');
        w = S(w) + S(w1);
      }

      if (!T(w) && communeH.has(`Lectio${num}`)) {
        const c = communeH;
        w = c.get(`Lectio${num}`);
        if (contract_scripture(num)) w = S(w) + S(c.get('Lectio3'));
      }

      if (/Special Lectio \d/.test(S(communeH.get('Rule'))) && new RegExp(`Special Lectio ${num}`).test(S(communeH.get('Rule')))) {
        const mariae = off(ss.setupstring(LANG(), 'Commune/C10.txt'));
        const gc10 = () => {
          if (!/196/.test(version) && ctx.month === 9 && ctx.day > 8 && ctx.day < 15) return 'Lectio M101';
          return `Lectio M${String(ctx.month).padStart(2, '0')}`;
        };
        w = mariae.get(gc10());
      }

      const wo = w;

      // (pre-1960 tests for the ninth lesson of a commemorated saint cannot hold for 1960.)
      // Simplex / diverged third lesson of a sanctoral office: look at the legend of the saint of
      // the day and at commemorations.
      if ((ctx.ltype1960 === LT.SANCTORAL || N(ctx.rank) < 2) && /Sancti/i.test(S(ctx.winner)) && num === 4) {
        wl = layer(W());
        let L9winnerflag = 0;
        if ((/Simplex/i.test(S(wl.get('Rank'))) || (/1955/.test(version) && N(ctx.rank) === 1.5)) && wl.has('Lectio94') && !/Cist/i.test(version)) { w = wl.get('Lectio94'); L9winnerflag = 1; }
        else if (wl.has('Lectio93')) { w = wl.get('Lectio93'); L9winnerflag = 1; }
        const j0 = homilyflag ? 1 : num === 12 ? 9 : 7;
        const cm = S(ctx.commemoratio);
        const cmh = ctx.commemoratioHash;
        if (((/tempora/i.test(cm) && !/Nat(29|30|31)/i.test(cm)) || /01\-05\./.test(cm)) && (homilyflag === 1 || cmh.has(`Lectio${j0}`)) && N(ctx.comrank) > 1 && !/Cist/i.test(version) && (N(ctx.rank) > 4 || (N(ctx.rank) >= 3 && /Trident/i.test(version)) || homilyflag === 1)) {
          wl = layer(cmh);
          let jj = j0;
          let wc = wl.get(`Lectio${jj}`);
          if (!T(wc)) { jj = 1; wc = wl.get('Lectio1'); }
          if (T(wc)) {
            const cmm = off(ss.setupstring(LANG(), 'Psalterium/Comment.txt'));
            const comm = perlSplit(S(cmm.get('Lectio')), /\n/);
            const comment = /Feria/.test(S(cmh.get('Rank'))) ? comm[0] : /01\-05\./.test(cm) ? comm[3] : comm[1];
            w = setfont(FONT.redfont, comment) + `\n${wc}`;
          }
        }
        if (T(ctx.transfervigil)) {
          let tv = ctx.transfervigil;
          if (!api.fileExists(tv)) tv = tv.replace(/v\.txt/, '.txt');
          const tro = off(ss.setupstring(LANG(), tv));
          if (tro.has('Lectio Vigilia')) w = tro.get('Lectio Vigilia');
        } else if (homilyflag === 9) {
          const tro = cmh;
          if (tro.has('Lectio1')) {
            const trorank = S(tro.get('Rank')).replace(/;;.*/, '');
            w = '!' + api.translate('Commemoratio') + `: ${trorank}\n` + tro.get('Lectio1');
          }
        }
        if (!L9winnerflag && ((/sancti/i.test(cm) && /S\. /i.test(S(cmh.get('Rank')))) || /infra octavam/i.test(S(cmh.get('Rank')))) && (!/tempora/i.test(S(ctx.winner)) || N(W().get('Rank')) < 5) && (!/1955/.test(version) || N(ctx.comrank) > 4) && !/Cist/i.test(version)) {
          wl = layer(cmh);
          let wc = wl.get('Lectio94');
          if (!T(wc) && !/infra octav/i.test(S(cmh.get('Rank'))) && !/Monastic/.test(version)) {
            wc = '';
            for (let ji = 4; ji < 7; ji++) {
              const w1 = wl.get(`Lectio${ji}`);
              if (!T(w1) || (ji > 4 && /\!/.test(S(w1)))) break;
              const mm = /(.*?)\_/s.exec(wc);
              if (mm) wc = mm[1];
              wc += w1;
            }
          }
          if (!T(wc)) wc = wl.get('Lectio93');
          if (!T(wc) && /infra octav/i.test(S(cmh.get('Rank'))) && !/Monastic/.test(version)) {
            const commemo1 = (ctx.commemoentries || [])[1];
            if (T(commemo1)) {
              wl = layer(off(ss.setupstring(LANG(), commemo1 + '.txt')));
              wc = T(wl.get('Lectio94')) ? wl.get('Lectio94') : (S(wl.get('Lectio4')) + S(wl.get('Lectio5')) + S(wl.get('Lectio6'))) || wl.get('Lectio93');
            }
          }
          if (T(wc)) {
            if (!/^\!/.test(S(wc))) {
              if (wl.has('Rank')) {
                const wcr = perlSplit(S(wl.get('Rank')), ';;');
                w = '!' + api.translate('Commemoratio') + `: ${wcr[0]}\n` + wc;
              } else {
                const cmm = off(ss.setupstring(LANG(), 'Psalterium/Comment.txt'));
                const comm = perlSplit(S(cmm.get('Lectio')), /\n/);
                w = setfont(FONT.redfont, comm[2]) + `\n${wc}`;
              }
            } else w = wc;
          }
        }
        if (/Octav.*(Epi|Corp)/i.test(S(W().get('Rank'))) && !/!.*Vigil/i.test(S(w))) w = wo;
        if (wl.has('Lectio Vigilia')) w = wl.get('Lectio Vigilia');
      }

      if (ctx.ltype1960 === LT.SANCTORAL && num === 4) {
        if (W().has('Lectio94')) {
          wl = layer(W());
          w = wl.get('Lectio94');
        } else {
          let i = 5;
          while (i < 7) {
            const w1 = wl.get(`Lectio${i}`);
            if (!T(w1) || /\!/.test(S(w1))) break;
            const mm = /(.*?)\_/s.exec(S(w));
            if (mm) w = mm[1];
            w = S(w) + w1;
            i++;
          }
          // Perl: "%w = %w1;" assigns an (undeclared, empty) %w1, which empties %w
          wl = layer(null);
        }
      }
      if ((ctx.ltype1960 || (/Sancti/i.test(S(ctx.winner)) && N(ctx.rank) < 2)) && num > 2) num = 3;

      w = S(w).replace(/¶/, '');
      w = w.replace(/&teDeum\n*/g, '');

      if (!/Limit.*?Benedictio/i.test(r()) && !W().has('In Finem Lectio')) {
        w = w.replace(/~?\s*$/, '\n$Tu autem');
      }

      // responsory
      if (!tedeum_required(num)) {
        let s;
        let na = num;
        if (/1960/.test(version) && /tempora/i.test(S(ctx.winner)) && ctx.dayofweek === 0 && /(Adv|Quad)/i.test(S(ctx.dayname[0])) && na === 3) na = 9;
        if (contract_scripture(num, 1) && !/Monastic|Ordo Praedicatorum/i.test(version)) na = 3;
        if (/1955|1960/.test(version) && wl.has(`Responsory${na} 1960`)) {
          s = wl.get(`Responsory${na} 1960`);
        } else if (/Responsory Feria/i.test(r()) || (/1960/.test(version) && /scriptura1960/i.test(r()) && !W().has(`Responsory${na}`))) {
          if (scrip.has(`Responsory${na}`)) s = scrip.get(`Responsory${na}`);
          else {
            s = scrip.get(`Lectio${na}`);
            if (/\n\_(.*?)/s.test(S(s))) s = '_' + /\n\_(.*?)/s.exec(S(s))[1]; else s = '';
          }
          if (!T(s) && /1960/.test(version) && scrip.has(`Responsory${na} 1960`)) s = scrip.get(`Responsory${na} 1960`);
        } else {
          if (wl.has(`Responsory${na}`)) s = wl.get(`Responsory${na}`);
          else if (/1960/.test(version) && communeH.has(`Responsory${na}`)) s = communeH.get(`Responsory${na}`);
          if (W().has(`Responsory${na}`)) s = '';
        }
        if (!T(s)) {
          let ww = W();
          if (/C9/.test(S(ctx.winner)) && na === 9) na = 91;
          if (ww.has(`Responsory${na}`)) s = ww.get(`Responsory${na}`);
          if (!T(s)) { ww = communeH; if (ww.has(`Responsory${na}`)) s = ww.get(`Responsory${na}`); }
        }
        if (api.alleluia_required(ctx.dayname[0], ctx.votive)) s = matins_lectio_responsory_alleluia(s);
        s = responsory_gloria(s, num);
        w = w.replace(/\s*$/, `\n_\n${s}`);
      }

      w = w.replace(/^\_/, '');
      if (!/^!/m.test(w)) w = w.replace(/^(?=\p{L})/u, 'v. ');
      else if (!/^\d/m.test(w)) w = w.replace(/^!.*?\n(?=\p{L})/gmu, (m0) => m0 + 'v. ');

      let item = api.translate('Lectio');
      if (!/%s/.test(item)) item += ' %s';
      if (!/Lectio brevis sine absolutio/.test(r())) w = (!/Limit.*?Benedictio/i.test(r()) ? '_\n' : '') + setfont(FONT.largefont, item.replace(/%s/, String(num))) + `\n${w}`;
      const wlines = perlSplit(w, /\n+/);
      w = '';
      let initial = ctx.nonumbers;
      for (let line of wlines) {
        let mm;
        if ((mm = /^([0-9]+)\s+(.*)/s.exec(line))) {
          let rest = mm[2];
          let numTxt = '\n' + setfont(FONT.smallfont, mm[1]);
          if (!ctx.nonumbers) rest = rest.replace(/^./, (c) => c.toUpperCase());
          if (initial) { numTxt = '\nv. '; initial = 0; }
          else if (ctx.nonumbers) numTxt = '';
          line = `${numTxt} ${rest}`;
        } else {
          if (/^!/.test(line) && ctx.nonumbers) initial = 1;
          line = `\n${line}`;
        }
        w += line;
      }
      // handle parentheses in non-Latin
      if (!/Latin/i.test(LANG())) {
        w = api.process_inline_alleluias(w, /Pasc/.test(S(ctx.dayname[0])));
        w = w.replace(/\(([^(]*?[.,\d][^(]*?)\)/g, (_m, t) => (t.length < 20 || /[0-9][.,]/.test(t) ? setfont(FONT.smallfont, t) : `(${t})`));
      }
      w = api.replaceNdot(w);
      if (tedeum_required(num)) w += '\n_\n&teDeum\n';
      return w;
    }

    return { invitatorium, hymnusmatutinum, psalmi_matutinum, lectio, gettype1960, tedeum_required, contract_scripture, initiarule };
  }

  RB.createMatins = createMatins;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})(typeof globalThis !== 'undefined' ? globalThis : this);
