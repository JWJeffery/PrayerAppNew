/**
 * Roman Breviary 1960/1962 -- calendar tables ("Directorium").
 *
 * Port of web/cgi-bin/DivinumOfficium/Directorium.pm (pinned Divinum Officium commit
 * 0ce8747d7dba3276fc05937635e02360b49a60a6, MIT). Reads Tabulae/data.txt, the Kalendaria
 * overlays, Tempora/Generale.txt and the Transfer/Stransfer tables chosen by Easter, composing
 * them through the version inheritance chain. Only the general calendar (Generale) is
 * supported: diocesan tables are deliberately not ported.
 */
(function (root) {
  'use strict';
  const RB = (root.RomanBreviary = root.RomanBreviary || {});
  const { leapyear, geteaster, mod } = RB.date;
  const doRead = RB.doRead;

  // Perl: split(/\s*;;\s*/, $line)  (trailing empty fields dropped)
  function splitSemis(line) {
    const parts = line.split(/\s*;;\s*/);
    while (parts.length && parts[parts.length - 1] === '') parts.pop();
    return parts;
  }

  function createDirectorium(store) {
    let data = null; // version -> {kalendar, transfer, stransfer, base, tbase}
    const kalendar = new Map(); // version -> Map(day -> file)
    const tempora = new Map(); // version -> Map(key -> value)
    const transfers = new Map(); // `${type}:${version}:${year}` -> Map

    function loadData() {
      if (data) return;
      data = {};
      const lines = doRead(store.tabulae('data.txt'));
      if (!lines.length) throw new Error("Can't open Tabulae/data.txt");
      lines.shift();
      for (const line of lines) {
        const f = line.split(',');
        while (f.length && f[f.length - 1] === '') f.pop();
        data[f[0]] = { kalendar: f[1], transfer: f[2], stransfer: f[3], base: f[4], tbase: f[5] };
      }
    }

    function versionData(version) {
      loadData();
      if (!version) throw new Error("Can't load tables for empty version");
      if (!data[version]) throw new Error(`Can't load tables for unknown version ${version}`);
      return data[version];
    }

    function loadKalendar(version) {
      const vd = versionData(version);
      const lines = doRead(store.tabulae(`Kalendaria/${vd.kalendar}.txt`));
      if (!lines.length) throw new Error(`Can't open kalendar ${vd.kalendar} for version ${version}`);
      const m = new Map();
      for (const line of lines) {
        if (!line.includes('=')) continue;
        const f = line.split('=');
        m.set(f[0], f[1]); // Perl: my ($day,$file) = split(/=/)
      }
      kalendar.set(version, m);
    }

    // Hash assignment from a flat list: later pairs override; an odd tail pairs with undef.
    function listToMap(list) {
      const m = new Map();
      for (let i = 0; i < list.length; i += 2) m.set(list[i], list[i + 1]);
      return m;
    }

    function loadTempora(version) {
      const vd = versionData(version);
      const list = [];
      for (const line of doRead(store.tabulae('Tempora/Generale.txt'))) {
        const [l, ver] = splitSemis(line);
        if (!ver || new RegExp(vd.transfer).test(ver)) {
          const i = l === undefined ? -1 : l.indexOf('=');
          if (l !== undefined) list.push(...(i < 0 ? [l] : [l.slice(0, i), l.slice(i + 1)]));
        }
      }
      tempora.set(version, listToMap(list));
    }

    // filter: 1 = Feb 24 - Dec (leap year), 2 = Jan + Feb 23 (leap year), 0 = whole year
    function loadTransferFile(name, filter, type) {
      const lines = doRead(store.tabulae(`${type}/${name}.txt`));
      const re = /^(?:Hy|seant)?(?:01|02-[01]|02-2[01239]|dirge1)/;
      const re2 = /^(?:Hy|seant)?(?:01|02-[01]|02-2[01239]|.*=(01|02-[01]|02-2[0123])|dirge1)/;
      if (filter === 1) return lines.filter((l) => !re2.test(l));
      if (filter === 2) return lines.filter((l) => re.test(l));
      return lines;
    }

    function loadTransfers(version, year, type) {
      year = Number(year);
      const vd = versionData(version);
      const key = `${type}:${version}:${year}`;
      if (transfers.has(key)) return transfers.get(key);
      const isleap = leapyear(year);
      const easterDM = geteaster(year);
      let easter = easterDM[1] * 100 + easterDM[0];
      const letter = mod(easter - 319 + (easterDM[1] === 4 ? 1 : 0), 7);
      const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
      const lines = [];
      lines.push(...loadTransferFile(letters[letter], isleap, type));
      lines.push(...loadTransferFile(String(easter), isleap, type));
      if (isleap) {
        lines.push(...loadTransferFile(easter + 'bis', 0, type));
        easter++;
        if (easter === 332) easter = 401;
        lines.push(...loadTransferFile(letters[mod(letter - 6, 7)], 2, type)); // Perl negative index
        lines.push(...loadTransferFile(String(easter), 2, type));
      }
      const re = new RegExp(vd[type.toLowerCase()]);
      const list = [];
      for (const line of lines) {
        const [l, ver] = splitSemis(line);
        if (!l) continue;
        if (!ver || re.test(ver)) {
          const i = l.indexOf('=');
          list.push(...(i < 0 ? [l] : [l.slice(0, i), l.slice(i + 1)]));
        }
      }
      const m = listToMap(list);
      transfers.set(key, m);
      return m;
    }

    // subject: 'kalendar' | 'tempora' | 'transfer' | 'stransfer'. Returns '' when absent.
    function get_from_directorium(subject, version, key, year) {
      const vd = versionData(version);
      const base = subject === 'kalendar' ? 'base' : 'tbase';
      let m;
      if (subject === 'kalendar') {
        if (!kalendar.has(version)) loadKalendar(version);
        m = kalendar.get(version);
      } else if (subject === 'tempora') {
        if (!tempora.has(version)) loadTempora(version);
        m = tempora.get(version);
      } else if (subject === 'transfer') {
        m = loadTransfers(version, year, 'Transfer');
      } else if (subject === 'stransfer') {
        m = loadTransfers(version, year, 'Stransfer');
      } else throw new Error('unknown subject ' + subject);
      const v = m.get(key);
      if (v) return v;
      if (vd[base]) return get_from_directorium(subject, vd[base], key, year);
      return '';
    }

    // Returns the destination key if the day for season or saint is transferred away, else ''.
    function transfered(str, year, version) {
      str = str.replace(/Sancti(M|Cist|OP)?\//, '');
      if (!str) return '';
      const folderMatch = /^.*?\//.exec(str);
      const strFolder = folderMatch ? folderMatch[0] : '';
      const m = loadTransfers(version, year, 'Transfer');
      for (const [key, val] of m) {
        if (!val) continue;
        if (/(dirge|Hy)/i.test(key)) continue;
        if (/Tempora/i.test(val) && !/Epi1\-0/i.test(val)) continue;
        if (
          !new RegExp('^' + key).test(val) &&
          ((new RegExp(val, 'i').test(str) && new RegExp('^' + strFolder).test(val)) || new RegExp(str, 'i').test(val)) &&
          !/v\s*$/i.test(m.get(key))
        ) {
          return key;
        }
      }
      // (The Perl then loops over the cached Tempora table testing an out-of-scope %transfer, a
      //  no-op; deliberately not ported.)
      const vd = versionData(version);
      return vd.tbase ? transfered(str, year, vd.tbase) : '';
    }

    return { get_from_directorium, transfered, versionData };
  }

  RB.createDirectorium = createDirectorium;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})(typeof globalThis !== 'undefined' ? globalThis : this);
