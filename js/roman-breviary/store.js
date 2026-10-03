/**
 * Roman Breviary 1960/1962 -- data store over the JSON components.
 *
 * The engine reads Divinum Officium data files by name. This module serves them synchronously
 * from the component bundles produced by scripts/build-roman-breviary-components.mjs, rebuilding
 * each file's exact text. Bundles are supplied by the host (Node: read from disk; browser: fetched
 * and preloaded), so the engine itself never touches the network or the file system.
 *
 *   const store = RomanBreviary.createStore(bundleLoader);   // bundleLoader('la/sancti') -> bundle|undefined
 *   store.horas('Latin', 'Sancti/11-02.txt')   -> text | undefined
 *   store.tabulae('Kalendaria/1960.txt')        -> text | undefined
 *   store.setup('horas.dialog')                 -> text | undefined
 *   store.exists('Latin', 'Tempora/Adv1-0.txt') -> boolean
 */
(function (root) {
  'use strict';
  const RB = (root.RomanBreviary = root.RomanBreviary || {});

  const LANG_DIR = { Latin: 'la', English: 'en' };

  // Exact inverse of the converter (scripts/build-roman-breviary-components.mjs rebuildText).
  function rebuildText(entry) {
    if (entry.kind !== 'sectioned') return entry.text;
    let s = entry.preamble;
    for (const sec of entry.sections) s += sec.header + '\n' + sec.body;
    return entry.ends_with_newline ? s : s.slice(0, -1);
  }

  // Perl do_read(): strip a BOM, split on \r?\n, drop trailing empty fields; '' -> [].
  function doRead(text) {
    if (text === undefined || text === null || text === '') return [];
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const lines = text.split(/\r?\n/);
    while (lines.length && lines[lines.length - 1] === '') lines.pop();
    return lines;
  }

  function bundleId(lang, relpath) {
    const parts = relpath.split('/');
    let group = parts[0].toLowerCase();
    if (parts[0] === 'Psalterium' && parts[1] === 'Psalmorum') group = 'psalmorum';
    return `${LANG_DIR[lang]}/${group}`;
  }

  function createStore(bundleLoader) {
    const bundles = new Map();
    const texts = new Map();
    function bundle(id) {
      if (!bundles.has(id)) bundles.set(id, bundleLoader(id) || null);
      return bundles.get(id);
    }
    function lookup(id, key) {
      const b = bundle(id);
      const e = b && b.files[key];
      if (!e) return undefined;
      const ck = id + '\u0000' + key;
      if (!texts.has(ck)) texts.set(ck, rebuildText(e));
      return texts.get(ck);
    }
    return {
      horas: (lang, relpath) => (LANG_DIR[lang] ? lookup(bundleId(lang, relpath), relpath) : undefined),
      exists: (lang, relpath) => (LANG_DIR[lang] ? lookup(bundleId(lang, relpath), relpath) !== undefined : false),
      tabulae: (relpath) => lookup('shared/tabulae', relpath),
      ordinarium: (relpath) => lookup('shared/ordinarium', relpath),
      setup: (name) => lookup('shared/setup', name)
    };
  }

  RB.rebuildText = rebuildText;
  RB.doRead = doRead;
  RB.createStore = createStore;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})(typeof globalThis !== 'undefined' ? globalThis : this);
