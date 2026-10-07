/* Administrator page: sign in with an emailed code, then approve, suspend, restore or delete parishes.
 * Never shows prayer text (the API does not return it). All server text goes through textContent
 * (UO.h); see common.js. */
(function () {
  'use strict';
  var U = window.UO, h = U.h;
  function $(id) { return document.getElementById(id); }

  var client = U.createClient('uoAdminSession', function () { showSignin('Your session has ended. Please sign in again.'); });
  var core = window.UOAccount.create('uoAdminSession');   // the same saved sign-in, for password, passkey and sign-in options
  var dioceseLabel = {};
  (window.UO_DIOCESES || []).forEach(function (d) { dioceseLabel[d.key] = d.label; });

  function show(name) {
    var dash = (name === 'dashboard');
    $('view-signin').hidden = dash; $('view-dashboard').hidden = !dash; $('view-dioceses').hidden = !dash; $('view-admins').hidden = !dash; $('view-security').hidden = !dash;
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

  // ---------- other ways to sign in: password, passkey (optional) ----------
  if (!window.UOAccount.passkeysSupported()) { $('passkey-row').hidden = true; }
  $('form-password').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var email = $('pw-email').value.trim(), pw = $('pw-password').value;
    if (!email || !pw) { U.say($('signin-status'), 'bad', 'Please enter your email address and password.'); return; }
    var btn = $('btn-pw-signin'); btn.disabled = true;
    core.passwordLogin(email, pw, 'admin').then(function (res) {
      btn.disabled = false;
      if (res.ok) { $('pw-password').value = ''; $('who').textContent = email; load(true); }
      else { U.say($('signin-status'), 'bad', U.problem(res, 'That email and password were not accepted. You can always use an emailed code instead.')); }
    });
  });
  $('btn-passkey-signin').addEventListener('click', function () {
    var btn = $('btn-passkey-signin'); btn.disabled = true;
    core.passkeyLogin('admin').then(function (res) {
      btn.disabled = false;
      if (res.ok) { $('who').textContent = 'Administrator'; load(true); }
      else if (res.body && res.body.error === 'cancelled') { U.say($('signin-status'), '', ''); }
      else { U.say($('signin-status'), 'bad', U.problem(res, 'That passkey was not accepted for an administrator account. You can use an emailed code instead.')); }
    });
  });

  function pill(status) { return h('span', { class: 'pill ' + status, text: status }); }
  function cell(label, kids) { return h('td', { 'data-label': label }, kids); }

  function rowFor(p) {
    var actions = h('td', { 'data-label': 'Actions' });
    var box = h('div', { class: 'item-actions' });
    if (p.status === 'pending') { box.appendChild(h('button', { type: 'button', class: 'small primary', text: 'Approve', 'aria-label': 'Approve ' + p.name, on: { click: function () { act(p, 'approve'); } } })); }
    if (p.status === 'approved') { box.appendChild(h('button', { type: 'button', class: 'small', text: 'Suspend', 'aria-label': 'Suspend ' + p.name, on: { click: function () { act(p, 'suspend'); } } })); }
    if (p.status === 'suspended') { box.appendChild(h('button', { type: 'button', class: 'small', text: 'Restore', 'aria-label': 'Restore ' + p.name, on: { click: function () { act(p, 'unsuspend'); } } })); }
    box.appendChild(h('a', { href: 'home.html?p=' + encodeURIComponent(p.slug), class: 'small', text: 'View page', 'aria-label': 'View the page of ' + p.name }));
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
      loadAdmins();
      window.UOAccountPanel.mount($('security-panel'), core);
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

  // ---------- diocesan pages ----------
  (window.UO_DIOCESES || []).forEach(function (d) { $('dio-select').appendChild(h('option', { value: d.key, text: d.label })); });
  function dioPath(suffix) { return '/admin/dioceses/' + $('dio-select').value + (suffix || ''); }
  function dioLines(text) { return text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean); }

  function loadDiocese() {
    var key = $('dio-select').value;
    $('dio-edit').hidden = !key;
    if (!key) { return; }
    fetch('/api/v1/dioceses/' + key, { headers: { 'Accept': 'application/json' }, credentials: 'omit', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) { U.say($('dio-status'), 'bad', 'Could not load that diocese.'); return; }
        var d = data.diocese || {};
        $('dio-bishop').value = d.bishop_name || '';
        $('dio-site').value = d.website || '';
        $('dio-dates').value = (d.convention_dates || []).join('\n');
        U.clear($('dp-list'));
        (data.prayers || []).forEach(function (p) {
          $('dp-list').appendChild(h('li', { class: 'item' }, [
            h('p', { class: 'item-text', text: p.text }),
            h('div', { class: 'item-actions' }, [
              h('span', { class: 'badge', text: 'Until ' + U.fmtDate(p.expires_at) }),
              h('button', { type: 'button', class: 'small danger', text: 'Remove', 'aria-label': 'Remove this prayer item', on: { click: function () {
                client.call('DELETE', dioPath('/prayers/' + p.id)).then(function (res) {
                  if (res.ok) { U.say($('dio-status'), 'ok', 'Removed.'); loadDiocese(); }
                  else { U.say($('dio-status'), 'bad', U.problem(res, 'Could not remove it.')); }
                });
              } } })
            ])
          ]));
        });
        $('dp-empty').hidden = (data.prayers || []).length > 0;
      })
      .catch(function () { U.say($('dio-status'), 'bad', 'Could not load that diocese.'); });
  }
  $('dio-select').addEventListener('change', function () { U.say($('dio-status'), '', ''); loadDiocese(); });
  $('form-diocese').addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!$('dio-select').value) { return; }
    var btn = $('btn-save-diocese'); btn.disabled = true;
    client.call('PUT', dioPath(), { bishop_name: $('dio-bishop').value, website: $('dio-site').value.trim(), convention_dates: dioLines($('dio-dates').value) }).then(function (res) {
      btn.disabled = false;
      if (res.ok) { U.say($('dio-status'), 'ok', 'Saved.'); loadDiocese(); }
      else { U.say($('dio-status'), 'bad', U.problem(res, U.fieldMessage(res, 'Could not save.'))); }
    });
  });
  $('form-dprayer').addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!$('dio-select').value || !$('dp-text').value.trim()) { U.say($('dio-status'), 'bad', 'Please write the item first.'); return; }
    var days = $('dp-days').value.trim() === '' ? 21 : Number($('dp-days').value);
    var btn = $('btn-add-dprayer'); btn.disabled = true;
    client.call('POST', dioPath('/prayers'), { text: $('dp-text').value, days: days }).then(function (res) {
      btn.disabled = false;
      if (res.status === 201) { $('dp-text').value = ''; U.say($('dio-status'), 'ok', 'Added.'); loadDiocese(); }
      else if (res.status === 409) { U.say($('dio-status'), 'bad', 'This diocese already has 60 prayer items. Remove some first.'); }
      else { U.say($('dio-status'), 'bad', U.problem(res, U.fieldMessage(res, 'Could not add it.'))); }
    });
  });

  // ---------- administrators ----------
  function loadAdmins() {
    client.call('GET', '/admin/admins').then(function (res) {
      if (!res.ok) { if (res.status !== 401) { U.say($('admins-status'), 'bad', U.problem(res, 'Could not load the administrators.')); } return; }
      var list = res.body.admins || [], you = res.body.you || '', canManage = res.body.can_manage === true;
      U.clear($('admin-list'));
      list.forEach(function (a) {
        var label = h('span', {}, [a.email, a.email === you ? ' (you)' : '']);
        var tag = h('span', { class: 'chip', text: a.owner ? 'Owner' : 'Administrator' });
        var kids = [h('span', {}, [label, ' ', tag])];
        if (canManage && !a.owner) {
          kids.push(h('button', { type: 'button', class: 'small danger', text: 'Remove', 'aria-label': 'Remove ' + a.email, on: { click: function () { removeAdmin(a); } } }));
        }
        $('admin-list').appendChild(h('li', {}, kids));
      });
      $('form-admin-add').hidden = !canManage;
    });
  }
  function removeAdmin(a) {
    U.confirmDialog({ title: 'Remove this administrator?', message: a.email + ' will lose administrator access immediately, and any sign-in they have is ended.',
      confirmLabel: 'Remove', danger: true }).then(function (yes) {
      if (!yes) { return; }
      client.call('DELETE', '/admin/admins/' + a.id).then(function (res) {
        if (res.ok) { U.say($('admins-status'), 'ok', 'Removed.'); loadAdmins(); }
        else { U.say($('admins-status'), 'bad', U.problem(res, 'Could not remove that administrator.')); }
      });
    });
  }
  $('form-admin-add').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var email = $('admin-new-email').value.trim();
    if (!email) { U.say($('admins-status'), 'bad', 'Please enter an email address.'); return; }
    var btn = $('btn-admin-add'); btn.disabled = true;
    client.call('POST', '/admin/admins', { email: email }).then(function (res) {
      btn.disabled = false;
      if (res.status === 201) { $('admin-new-email').value = ''; U.say($('admins-status'), 'ok', 'Added. They have been emailed how to sign in.'); loadAdmins(); }
      else if (res.status === 409) { U.say($('admins-status'), 'bad', 'That address is already an administrator.'); }
      else if (res.status === 403) { U.say($('admins-status'), 'bad', 'Only an owner can add administrators.'); }
      else { U.say($('admins-status'), 'bad', U.problem(res, U.fieldMessage(res, 'Could not add that administrator.'))); }
    });
  });

  if (client.session()) { $('who').textContent = 'Administrator'; load(true); } else { show('signin'); }
})();
