/* Diocesan page for readers: the bishop, convention dates, the bishop's prayer list, the diocese's
 * registered parishes, and "pray for a parish today". Reads /api/v1/dioceses/{body}/{name}.
 *
 * "Pray for a parish today" has two sources, shown separately and never mixed:
 *   1. Rotation: the diocese's registered parishes in name order, one per calendar day, so every
 *      parish comes round in turn. Deterministic: the same device date always gives the same parish.
 *   2. The diocese's own Cycle of Prayer (data/cycles-of-prayer/, a dated cycle): when this week's
 *      subjects include a registered parish, that parish is linked. Other cycle types, and years
 *      with no file, simply show nothing here.
 *
 * Same safety rule as the rest of /parish/ (see common.js): server text goes in with textContent only. */
(function () {
  'use strict';
  var U = window.UO, h = U.h;
  function $(id) { return document.getElementById(id); }

  var KEY_RE = /^[a-z0-9-]{1,40}\/[a-z0-9-]{1,80}$/;
  var SLUG_RE = /^[a-z0-9-]{1,80}$/;
  var key = (new URLSearchParams(window.location.search).get('d') || '').trim();

  function show(name) {
    ['loading', 'missing', 'diocese'].forEach(function (k) { $('view-' + k).hidden = (k !== name); });
    var f = { missing: 'h-missing', diocese: 'h-diocese' }[name];
    if (f) { $(f).focus(); }
  }

  function label() {
    var found = (window.UO_DIOCESES || []).filter(function (d) { return d.key === key; })[0];
    return found ? found.label : key.split('/')[1].replace(/-/g, ' ');
  }

  /** Same slug js/cycles-of-prayer.js cycleOfPrayerParishSlug() derives from a parish subject. */
  function subjectSlug(subject) {
    var raw = subject.type === 'parish' ? (String(subject.place) + ' ' + String(subject.name)) : String(subject.name);
    return raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function localDayNumber() {
    var n = new Date();
    return Math.floor(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) / 86400000);
  }
  function localIso() {
    var n = new Date();
    return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
  }

  function parishPageHref(slug) { return 'home.html?p=' + encodeURIComponent(slug); }

  /** The parish this reader follows, as the app will see it (a waiting Follow / Stop request wins over the
      stored profile). Read-only and defensive, the same reading parish/home.js does. */
  function followedSlug() {
    function read(key) { try { var raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
    var req = read('universalOffice.parishFollowRequest.v1');
    if (req && typeof req === 'object' && (req.slug === null || typeof req.slug === 'string')) {
      return (typeof req.slug === 'string' && SLUG_RE.test(req.slug)) ? req.slug : null;
    }
    var prof = read('universalOffice.userProfile.v1');
    return (prof && typeof prof.parishIntentionsSlug === 'string' && SLUG_RE.test(prof.parishIntentionsSlug)) ? prof.parishIntentionsSlug : null;
  }

  function renderRotation(parishes) {
    // The reader's own parish is already prayed for in the Intercessions, so "pray for a parish today" is
    // always a different one.
    var own = followedSlug();
    parishes = parishes.filter(function (p) { return p.slug !== own; });
    if (!parishes.length) { return false; }
    var pick = parishes[localDayNumber() % parishes.length];
    $('today-rotation-name').textContent = pick.name;
    $('today-rotation-link').setAttribute('href', parishPageHref(pick.slug));
    $('today-rotation').hidden = false;
    return true;
  }

  /** This week's entry of a dated cycle: the latest entry dated on or before today, within the last 7 days. */
  function currentWeekEntry(doc) {
    if (!doc || !Array.isArray(doc.entries)) { return null; }
    var today = localIso(), best = null;
    doc.entries.forEach(function (e) {
      if (e && typeof e.date === 'string' && e.date <= today && (!best || e.date > best.date)) { best = e; }
    });
    if (!best) { return null; }
    var age = (Date.parse(today) - Date.parse(best.date)) / 86400000;
    return age <= 6 ? best : null;
  }

  function renderCycle(parishes) {
    var short = key.split('/')[1];
    var year = new Date().getFullYear();
    var path = '../data/cycles-of-prayer/' + key.split('/')[0] + '-' + short + '-' + year + '.json';
    return fetch(path, { credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (doc) {
        var entry = currentWeekEntry(doc);
        if (!entry || !Array.isArray(entry.subjects)) { return false; }
        var registered = {};
        parishes.forEach(function (p) { if (p.corpus_parish_slug) { registered[p.corpus_parish_slug] = p; } });
        var match = null, names = [];
        entry.subjects.forEach(function (s) {
          if (!s || typeof s.name !== 'string') { return; }
          names.push(s.type === 'parish' && s.place ? s.place + ', ' + s.name : s.name);
          if (!match && s.type === 'parish' && registered[subjectSlug(s)]) { match = registered[subjectSlug(s)]; }
        });
        if (!names.length) { return false; }
        $('today-cycle-name').textContent = names.join(' · ');
        $('today-cycle-note').textContent = 'This week in the diocese’s own Cycle of Prayer.';
        $('today-cycle-link-wrap').hidden = !match;
        if (match) { $('today-cycle-link').setAttribute('href', parishPageHref(match.slug)); }
        $('today-cycle').hidden = false;
        return true;
      });
  }

  function textList(listId, wrapId, items) {
    U.clear($(listId));
    items.forEach(function (t) { if (typeof t === 'string' && t) { $(listId).appendChild(h('li', { text: t })); } });
    $(wrapId).hidden = $(listId).childNodes.length === 0;
  }

  function render(data) {
    var d = data.diocese || {};
    $('h-diocese').textContent = label();
    document.title = label() + ' — diocese page';
    $('bishop-line').textContent = d.bishop_name ? 'Bishop: ' + d.bishop_name : '';
    var site = typeof d.website === 'string' && /^https?:\/\/[^\s"<>]+$/i.test(d.website) ? d.website : '';
    $('site-line').hidden = !site;
    if (site) { $('site-link').setAttribute('href', site); $('site-link').textContent = site; }

    textList('list-prayers', 'wrap-prayers', (data.prayers || []).map(function (p) { return p && p.text; }));
    textList('list-dates', 'wrap-dates', d.convention_dates || []);

    var parishes = (Array.isArray(data.parishes) ? data.parishes : []).filter(function (p) {
      return p && typeof p.name === 'string' && typeof p.slug === 'string' && SLUG_RE.test(p.slug);
    });
    $('h-parishes').textContent = 'Parishes of the ' + window.UO_dioceseName(key, label()) + ' using the Universal Office';
    U.clear($('list-parishes'));
    parishes.forEach(function (p) {
      $('list-parishes').appendChild(h('li', {}, [h('a', { href: parishPageHref(p.slug), text: p.name })]));
    });
    $('empty-parishes').hidden = parishes.length > 0;

    var rotation = renderRotation(parishes);
    renderCycle(parishes).then(function (cycle) { $('wrap-today').hidden = !(rotation || cycle); });
    show('diocese');
  }

  if (!KEY_RE.test(key)) { show('missing'); return; }
  fetch('/api/v1/dioceses/' + key, { headers: { 'Accept': 'application/json' }, credentials: 'omit' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) { if (data && data.diocese) { render(data); } else { show('missing'); } })
    .catch(function () { $('missing-text').textContent = 'This diocese page could not be loaded right now. Please try again in a moment.'; show('missing'); });
})();
