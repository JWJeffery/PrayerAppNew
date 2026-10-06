/* Approval page for a parish registration (spec 8.5).
 *
 * WHY this is a two-step page and not a link that approves on open (2026-09-30):
 * mail scanners and link previewers open every URL in an email with a GET request. If merely
 * opening the link approved the parish, a scanner would approve it. So the link only opens this
 * page; approval happens on an explicit button press (a POST).
 *
 * The token is in the URL fragment (#...), which browsers never send to the server, so it is
 * not in server logs or Referer headers. It is read once, then removed from the address bar.
 * All text from the server is written with textContent -- never innerHTML.
 */
(function () {
  'use strict';
  var API = '/api/v1';
  var token = (location.hash || '').replace(/^#/, '');
  if (window.history && history.replaceState) {
    history.replaceState(null, '', location.pathname + location.search); // clear the token from the address bar
  }

  var $ = function (id) { return document.getElementById(id); };
  function show(el, on) { el.hidden = !on; }
  function say(kind, text) {
    var s = $('status');
    s.className = 'status ' + kind;
    s.textContent = text;
    show(s, true);
  }
  function post(path, body) {
    return fetch(API + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      credentials: 'omit'
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j }; });
    });
  }

  if (!/^[0-9a-f]{64}$/.test(token)) {
    show($('loading'), false);
    say('bad', 'This approval link is incomplete. Open the link from the email again, in full.');
    return;
  }

  post('/admin/approval-info', { token: token }).then(function (res) {
    show($('loading'), false);
    if (!res.ok || !res.body.parish) {
      say('bad', (res.body && res.body.message) || 'This approval link is invalid, already used, or has expired.');
      return;
    }
    $('parish-name').textContent = res.body.parish.name;
    $('parish-diocese').textContent = res.body.parish.diocese_key || '(not given)';
    show($('review'), true);
  }).catch(function () {
    show($('loading'), false);
    say('bad', 'Could not reach the server. Please try again in a moment.');
  });

  $('approve-btn').addEventListener('click', function () {
    var btn = $('approve-btn');
    btn.disabled = true;
    post('/admin/approve', { token: token }).then(function (res) {
      if (res.ok) {
        show($('review'), false);
        say('ok', 'Approved. The rector has been emailed and can now log in.');
      } else {
        btn.disabled = false;
        say('bad', (res.body && res.body.message) || 'Approval failed.');
      }
    }).catch(function () {
      btn.disabled = false;
      say('bad', 'Could not reach the server. Please try again.');
    });
  });
})();
