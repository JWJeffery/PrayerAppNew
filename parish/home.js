/* Parish home page for readers: service times, rector, address, website, announcements, coming events,
 * and Follow / Join. Reads /api/v1/parishes/{slug} (api/openapi.yaml). No account: nothing about the
 * reader is stored on the server.
 *
 * Following works through one localStorage key, FOLLOW_KEY. This page never rewrites the app's profile
 * (that belongs to js/office-ui.js); it leaves a small follow request that the app applies the next
 * time it opens (consumePendingParishFollowRequest in js/parish-intentions.js). Both keys are read
 * defensively: storage can be blocked or hold anything.
 *
 * Same safety rule as the rest of /parish/ (see common.js): server text goes in with textContent only. */
(function () {
  'use strict';
  var U = window.UO, h = U.h;
  function $(id) { return document.getElementById(id); }

  var API = '/api/v1';
  var FOLLOW_KEY = 'universalOffice.parishFollowRequest.v1';
  var PROFILE_KEY = 'universalOffice.userProfile.v1';
  var SLUG_RE = /^[a-z0-9-]{1,80}$/;

  var slug = (new URLSearchParams(window.location.search).get('p') || '').trim();
  var parishName = '';

  function show(name) {
    ['loading', 'code', 'missing', 'parish'].forEach(function (k) { $('view-' + k).hidden = (k !== name); });
    var focusId = { code: 'h-code', missing: 'h-missing', parish: 'h-parish' }[name];
    if (focusId) { $(focusId).focus(); }
  }

  // ---------- who the reader follows ----------
  function readJson(key) {
    try { var raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  /** { slug, pass } as the app will see it: a waiting request wins over the stored profile. */
  function currentFollow() {
    var req = readJson(FOLLOW_KEY);
    if (req && typeof req === 'object' && (req.slug === null || (typeof req.slug === 'string' && SLUG_RE.test(req.slug)))) {
      return { slug: req.slug, pass: typeof req.pass === 'string' ? req.pass : null };
    }
    var prof = readJson(PROFILE_KEY);
    if (prof && typeof prof === 'object' && typeof prof.parishIntentionsSlug === 'string' && SLUG_RE.test(prof.parishIntentionsSlug)) {
      return { slug: prof.parishIntentionsSlug, pass: typeof prof.parishIntentionsPass === 'string' ? prof.parishIntentionsPass : null };
    }
    return { slug: null, pass: null };
  }
  function writeFollowRequest(newSlug, pass) {
    try {
      window.localStorage.setItem(FOLLOW_KEY, JSON.stringify({ slug: newSlug, pass: newSlug ? (pass || null) : null, at: new Date().toISOString() }));
      return true;
    } catch (e) { return false; }
  }

  /** The administrator's session token from the admin page, or null. Expired or malformed means none. */
  function adminSessionToken() {
    var s = readJson('uoAdminSession');
    if (!s || typeof s.token !== 'string' || !/^[0-9a-f]{64}$/.test(s.token)) { return null; }
    if (s.expires_at && Date.parse(s.expires_at) <= Date.now()) { return null; }
    return s.token;
  }

  // ---------- fetching ----------
  function api(method, path, headers, body) {
    var opts = { method: method, headers: Object.assign({ 'Accept': 'application/json' }, headers || {}), credentials: 'omit', cache: 'no-store' };
    if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch(API + path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j || {} }; });
    }).catch(function () { return { ok: false, status: 0, body: {} }; });
  }

  // ---------- formatting ----------
  function eventWhen(e) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e.date);
    if (!m) { return e.date; }
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    var out = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    var t = /^(\d{2}):(\d{2})$/.exec(e.time || '');
    if (t) { out += ' at ' + new Date(2000, 0, 1, Number(t[1]), Number(t[2])).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
    return out;
  }
  /** The diocese's name in running text, e.g. "Western Diocese of Oregon" (see diocese-names.js); '' when unknown. */
  function dioceseName(key) {
    var found = (window.UO_DIOCESES || []).filter(function (d) { return d.key === key; })[0];
    return found ? window.UO_dioceseName(key, found.label) : '';
  }

  // ---------- rendering ----------
  function render(data) {
    var p = data.parish || {};
    parishName = typeof p.name === 'string' ? p.name : '';
    document.title = parishName ? parishName + ' — parish page' : 'Parish page';
    $('h-parish').textContent = parishName;
    $('parish-diocese').textContent = p.diocese_key ? dioceseName(p.diocese_key) : '';
    $('parish-rector').textContent = p.rector_name ? 'Rector: ' + p.rector_name : '';

    var dl = $('diocese-link-wrap');
    dl.hidden = !(typeof p.diocese_key === 'string' && /^[a-z0-9-]{1,40}\/[a-z0-9-]{1,80}$/.test(p.diocese_key));
    if (!dl.hidden) {
      $('diocese-link').setAttribute('href', 'diocese.html?d=' + encodeURIComponent(p.diocese_key));
      var dn = dioceseName(p.diocese_key);
      $('diocese-link').textContent = dn ? 'The ' + dn + '\u2019s page' : 'The diocese\u2019s page';
    }

    var anns = Array.isArray(data.announcements) ? data.announcements : [];
    U.clear($('list-announcements'));
    anns.forEach(function (a) {
      if (!a || typeof a.text !== 'string') { return; }
      $('list-announcements').appendChild(h('li', { class: 'item pinned' }, [h('p', { class: 'item-text', text: a.text })]));
    });
    $('wrap-announcements').hidden = $('list-announcements').childNodes.length === 0;

    var times = Array.isArray(p.service_times) ? p.service_times : [];
    U.clear($('list-times'));
    // How the rector wrote the lines decides how they are set out, with no bullets:
    //   "Sunday:"                      a line ending in a colon is a day heading for the lines under it;
    //   "8:00 am | Holy Eucharist"     a line with a bar is a time, then what happens at that time;
    //   anything else                  plain text.
    times.forEach(function (t) {
      if (typeof t !== 'string') { return; }
      var bar = t.indexOf('|');
      if (/:\s*$/.test(t)) {
        $('list-times').appendChild(h('li', { class: 'day', text: t.replace(/:\s*$/, '') }));
      } else if (bar > 0 && bar < t.length - 1) {
        $('list-times').appendChild(h('li', { class: 'svc' }, [
          h('span', { class: 'svc-time', text: t.slice(0, bar).trim() }),
          h('span', { class: 'svc-what', text: t.slice(bar + 1).trim() })
        ]));
      } else {
        $('list-times').appendChild(h('li', { text: t }));
      }
    });
    $('wrap-times').hidden = times.length === 0;

    var events = Array.isArray(data.events) ? data.events : [];
    U.clear($('list-events'));
    events.forEach(function (e) {
      if (!e || typeof e.title !== 'string' || typeof e.date !== 'string') { return; }
      var li = h('li', { class: 'item' }, [h('div', { class: 'item-head' }, [h('strong', { text: e.title }), h('span', { class: 'badge', text: eventWhen(e) })])]);
      if (typeof e.note === 'string' && e.note) { li.appendChild(h('p', { class: 'item-text', text: e.note })); }
      $('list-events').appendChild(li);
    });
    $('wrap-events').hidden = events.length === 0;

    var hasAddress = typeof p.address === 'string' && p.address !== '';
    var site = typeof p.website === 'string' && /^https?:\/\/[^\s"<>]+$/i.test(p.website) ? p.website : '';
    $('dt-address').hidden = $('dd-address').hidden = !hasAddress;
    $('dd-address').textContent = hasAddress ? p.address : '';
    $('dt-website').hidden = $('dd-website').hidden = !site;
    U.clear($('dd-website'));
    if (site) { $('dd-website').appendChild(h('a', { href: site, rel: 'noopener noreferrer', target: '_blank', text: site })); }
    $('wrap-contact').hidden = !hasAddress && !site;

    var note = $('admin-note');
    if (data.viewer_admin === true) {
      note.textContent = 'Administrator View';
      note.hidden = false;
    } else { note.hidden = true; }

    syncFollowButtons();
    // An administrator looking in (not following) is not offered Follow: a join-code parish could not be followed without its code.
    if (data.viewer_admin === true && currentFollow().slug !== slug) { $('btn-follow').hidden = true; }
    show('parish');
  }

  function syncFollowButtons() {
    var following = currentFollow().slug === slug;
    $('btn-follow').hidden = following;
    $('btn-unfollow').hidden = !following;
    if (following) { U.say($('follow-status'), 'ok', 'You follow this parish. Its prayer requests appear in the Intercessions when you open the Daily Office.'); }
  }

  // ---------- loading ----------
  function load() {
    if (!SLUG_RE.test(slug)) { show('missing'); return; }
    var follow = currentFollow();
    var headers = (follow.slug === slug && follow.pass) ? { 'X-Parish-Pass': follow.pass } : {};
    // A signed-in global administrator (the session the admin page keeps) is recognised by the server and
    // sees any parish. The token goes only to this site's own API, and only when one exists.
    var adminToken = adminSessionToken();
    if (adminToken) { headers['Authorization'] = 'Bearer ' + adminToken; }
    api('GET', '/parishes/' + encodeURIComponent(slug), headers).then(function (res) {
      if (res.status === 200) { render(res.body); }
      else if (res.status === 401) { show('code'); }
      else if (res.status === 404) { show('missing'); }
      else {
        $('missing-text').textContent = U.problem(res, 'This parish page could not be loaded right now. Please try again in a moment.');
        show('missing');
      }
    });
  }

  $('btn-follow').addEventListener('click', function () {
    var pass = currentFollow().slug === slug ? currentFollow().pass : null;
    // A public parish needs no pass; a code-only parish can only have been shown here with one.
    if (!writeFollowRequest(slug, pass)) { U.say($('follow-status'), 'bad', 'Your browser is blocking storage, so following cannot be saved here.'); return; }
    syncFollowButtons();
  });
  $('btn-unfollow').addEventListener('click', function () {
    if (!writeFollowRequest(null, null)) { U.say($('follow-status'), 'bad', 'Your browser is blocking storage, so this cannot be saved here.'); return; }
    U.say($('follow-status'), 'ok', 'You no longer follow this parish.');
    $('btn-follow').hidden = false; $('btn-unfollow').hidden = true;
  });

  $('form-join').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var code = $('join-code').value.trim();
    if (!code) { U.say($('join-status'), 'bad', 'Please enter the join code.'); return; }
    var btn = $('btn-join'); btn.disabled = true;
    api('POST', '/parishes/' + encodeURIComponent(slug) + '/join', {}, { code: code }).then(function (res) {
      btn.disabled = false;
      if (res.ok && typeof res.body.pass === 'string' && res.body.pass && res.body.pass.length <= 400) {
        if (!writeFollowRequest(slug, res.body.pass)) { U.say($('join-status'), 'bad', 'Your browser is blocking storage, so this cannot be saved here.'); return; }
        load();
      } else if (res.status === 403) {
        U.say($('join-status'), 'bad', 'That code was not accepted. Check it and try again.');
      } else {
        U.say($('join-status'), 'bad', U.problem(res, 'Could not join right now. Please try again.'));
      }
    });
  });

  load();
})();
