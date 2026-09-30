/* Administrator page: sign in with an emailed code, then approve, suspend, restore or delete parishes.
 * Never shows prayer text (the API does not return it). All server text goes through textContent
 * (UO.h); see common.js. */
(function () {
  'use strict';
  var U = window.UO, h = U.h;
  function $(id) { return document.getElementById(id); }

  var client = U.createClient('uoAdminSession', function () { showSignin('Your session has ended. Please sign in again.'); });
  var dioceseLabel = {};
  (window.UO_DIOCESES || []).forEach(function (d) { dioceseLabel[d.key] = d.label; });

  function show(name) {
    var dash = (name === 'dashboard');
    $('view-signin').hidden = dash; $('view-dashboard').hidden = !dash;
    $('logout').hidden = !dash; $('btn-refresh').hidden = !dash; $('who').hidden = !dash;
    var hd = $(dash ? 'h-dash' : 'h-signin'); if (hd) { hd.focus(); }
  }
  function showSignin(message) {
    $('form-email').hidden = false; $('form-code').hidden = true; $('signin-code').value = '';
    U.say($('signin-status'), message ? 'bad' : '', message || '');
    show('signin');
  }

  var pendingEmail = '';
  $('form-email').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var email = $('signin-email').value.trim();
    if (!email) { U.say($('signin-status'), 'bad', 'Please enter the email address.'); return; }
    var btn = $('btn-send-code'); btn.disabled = true;
    client.call('POST', '/admin/auth/request-code', { email: email }).then(function (res) {
      btn.disabled = false;
      if (res.status === 200) {
        pendingEmail = email; $('form-email').hidden = true; $('form-code').hidden = false;
        U.say($('signin-status'), '', ''); $('signin-code').focus();
      } else if (res.status === 422) { U.say($('signin-status'), 'bad', 'Please enter a valid email address.'); }
      else { U.say($('signin-status'), 'bad', U.problem(res, 'Could not send the code. Please try again.')); }
    });
  });
  $('form-code').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var btn = $('btn-verify'); btn.disabled = true;
    client.call('POST', '/admin/auth/verify-code', { email: pendingEmail, code: $('signin-code').value.trim() }).then(function (res) {
      btn.disabled = false;
      if (res.ok && typeof res.body.token === 'string') {
        client.save(res.body.token, res.body.expires_at);
        $('who').textContent = (res.body.admin && res.body.admin.email) || 'Administrator';
        $('signin-code').value = '';
        load(true);
      } else { U.say($('signin-status'), 'bad', U.problem(res, 'That code was not accepted.')); }
    });
  });
  $('btn-other-email').addEventListener('click', function () {
    $('form-email').hidden = false; $('form-code').hidden = true; U.say($('signin-status'), '', ''); $('signin-email').focus();
  });
  $('logout').addEventListener('click', function () {
    client.call('POST', '/auth/logout', {}).then(function () { client.drop(); showSignin(''); });
  });
  $('btn-refresh').addEventListener('click', function () { load(false); });

  function pill(status) { return h('span', { class: 'pill ' + status, text: status }); }
  function cell(label, kids) { return h('td', { 'data-label': label }, kids); }

  function rowFor(p) {
    var actions = h('td', { 'data-label': 'Actions' });
    var box = h('div', { class: 'item-actions' });
    if (p.status === 'pending') { box.appendChild(h('button', { type: 'button', class: 'small primary', text: 'Approve', 'aria-label': 'Approve ' + p.name, on: { click: function () { act(p, 'approve'); } } })); }
    if (p.status === 'approved') { box.appendChild(h('button', { type: 'button', class: 'small', text: 'Suspend', 'aria-label': 'Suspend ' + p.name, on: { click: function () { act(p, 'suspend'); } } })); }
    if (p.status === 'suspended') { box.appendChild(h('button', { type: 'button', class: 'small', text: 'Restore', 'aria-label': 'Restore ' + p.name, on: { click: function () { act(p, 'unsuspend'); } } })); }
    box.appendChild(h('button', { type: 'button', class: 'small danger', text: 'Delete', 'aria-label': 'Delete ' + p.name, on: { click: function () { remove(p); } } }));
    actions.appendChild(box);
    return h('tr', {}, [
      cell('Parish', [h('strong', { text: p.name }), h('br'), h('span', { class: 'muted small', text: p.slug })]),
      cell('Status', [pill(p.status)]),
      cell('Diocese', [p.diocese_key ? (dioceseLabel[p.diocese_key] || p.diocese_key) : '—']),
      cell('Rector', [p.rector_name || '—', h('br'), h('span', { class: 'muted small email', text: p.rector_email || '' })]),
      cell('Staff', [String(p.staff_count)]),
      cell('Active requests', [String(p.active_intentions)]),
      cell('Registered', [U.fmtDate(p.created_at)]),
      actions
    ]);
  }

  function load(first) {
    client.call('GET', '/admin/parishes').then(function (res) {
      if (res.status === 401) { return; } // client already sent us back to sign-in
      if (res.status === 403) { client.drop(); showSignin('That sign-in is not an administrator.'); return; }
      if (!res.ok) { U.say($('admin-status'), 'bad', U.problem(res, 'Could not load the parishes.')); if (first) { show('dashboard'); } return; }
      var list = res.body.parishes || [];
      var body = $('parish-rows'); U.clear(body);
      list.forEach(function (p) { body.appendChild(rowFor(p)); });
      $('parish-table').hidden = list.length === 0;
      $('empty').hidden = list.length !== 0;
      if (first) { show('dashboard'); }
    });
  }

  function act(p, what) {
    var done = { approve: 'Approved. The rector has been emailed.', suspend: 'Suspended.', unsuspend: 'Restored.' }[what];
    client.call('POST', '/admin/parishes/' + p.id + '/' + what, {}).then(function (res) {
      if (res.ok) { U.say($('admin-status'), 'ok', p.name + ': ' + done); load(false); }
      else { U.say($('admin-status'), 'bad', U.problem(res, 'Could not do that.')); }
    });
  }
  function remove(p) {
    var phrase = 'DELETE ' + p.slug;
    U.confirmDialog({ title: 'Delete this parish?', message: p.name + ' will be permanently deleted with all of its prayer requests and staff. This cannot be undone.',
      confirmLabel: 'Delete permanently', danger: true, typeToConfirm: phrase }).then(function (yes) {
      if (!yes) { return; }
      client.call('DELETE', '/admin/parishes/' + p.id, { confirm: phrase }).then(function (res) {
        if (res.ok) { U.say($('admin-status'), 'ok', p.name + ' was deleted.'); load(false); }
        else { U.say($('admin-status'), 'bad', U.problem(res, 'Could not delete it.')); }
      });
    });
  }

  if (client.session()) { $('who').textContent = 'Administrator'; load(true); } else { show('signin'); }
})();
