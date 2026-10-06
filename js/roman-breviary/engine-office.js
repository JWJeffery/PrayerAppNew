/**
 * Roman Breviary 1960/1962 -- the engine as the app uses it (engine rebuild, phase 5).
 *
 *   const engine = RomanBreviary.createBreviaryEngine({ loadBundle: (id) => Promise<bundle> });
 *   const envelope = await engine.resolve({ date: '2026-03-05', hour: 'lauds', language: 'la' });
 *
 * Loads the component bundles it needs (once), runs the calendar and hour assembly in the browser,
 * and returns the same "resolved envelope" the display code (roman-breviary-1960-1962-dev-slice.js)
 * has always rendered -- so the screen does not change, only where the text comes from.
 */
(function (root) {
  'use strict';
  const RB = (root.RomanBreviary = root.RomanBreviary || {});

  const HOUR_TO_HORA = {
    matins: 'Matutinum', lauds: 'Laudes', prime: 'Prima', terce: 'Tertia',
    sext: 'Sexta', none: 'Nona', vespers: 'Vespera', compline: 'Completorium'
  };
  const LANGUAGES = { la: 'Latin', en: 'English' };
  // Calendar variants the engine can run. Both use the Rubrics 1960 rules; '2020usa' overlays the
  // general calendar with the saints added since 1960 and the US propers (Tabulae/Kalendaria/NC.txt).
  const CALENDARS = { '1960': 'Rubrics 1960 - 1960', '2020usa': 'Rubrics 1960 - 2020 USA' };

  function createBreviaryEngine({ loadBundle, bundleIds }) {
    const bundles = new Map();
    const loading = new Map();
    const engines = {};

    function load(id) {
      if (!loading.has(id)) {
        loading.set(id, Promise.resolve(loadBundle(id)).then((b) => { bundles.set(id, b); }));
      }
      return loading.get(id);
    }

    // The engine reads data files synchronously, so every bundle of the language is loaded first.
    async function ensureLanguage(code) {
      const prefix = code === 'en' ? ['en/', 'la/', 'shared/'] : ['la/', 'shared/'];
      await Promise.all(bundleIds.filter((id) => prefix.some((p) => id.startsWith(p))).map(load));
    }

    function engineFor(code, calendar) {
      const key = code + '|' + calendar;
      if (!engines[key]) {
        const store = RB.createStore((id) => bundles.get(id));
        const cal = RB.createCalendar(store);
        cal.ctx.lang1 = cal.ctx.lang2 = LANGUAGES[code];
        cal.ctx.version = CALENDARS[calendar];
        const hours = RB.createHours(cal);
        engines[key] = RB.createRenderer(hours);
      }
      return engines[key];
    }

    async function resolve({ date, hour, language = 'la', calendar = '1960' }) {
      const code = LANGUAGES[language] ? language : 'la';
      const cal = CALENDARS[calendar] ? calendar : '1960';
      const hora = HOUR_TO_HORA[hour];
      if (!hora) throw new Error('Unknown hour ' + hour);
      await ensureLanguage(code);
      const [y, m, d] = date.split('-').map(Number);
      const { html, headline } = engineFor(code, cal).render(`${m}-${d}-${y}`, hora);
      const { sections, diagnostics } = RB.parseOfficiumHtml(html);
      let n = 0;
      const { blocks, units } = RB.buildBlocksAndUnits(sections, {}, code, () => `rb1960.${code}.live.${++n}`);
      return {
        unitsData: { units },
        manifestData: {
          tradition: 'roman_catholic', office_family: 'roman_breviary', edition_or_recension: 'rubrics_1960_1962',
          language: code, calendar_scope: cal === '2020usa' ? 'general_2020_usa' : 'general',
          source_pin: { repo: 'DivinumOfficium/divinum-officium', commit: '0ce8747d7dba3276fc05937635e02360b49a60a6' },
          days: { [date]: { rank: headline.replace(/&nbsp;/g, ' '), hours: { [hour]: { label: hora, blocks, diagnostics } } } }
        }
      };
    }

    return { resolve };
  }

  RB.createBreviaryEngine = createBreviaryEngine;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})(typeof globalThis !== 'undefined' ? globalThis : this);
