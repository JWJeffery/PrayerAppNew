/* Diocese editor page: sign in with an emailed code (or the optional password or passkey), then keep your own
 * diocese's page: the bishop, website, convention dates and the bishop's prayer list. The diocese always comes
 * from the server's record of who you are, never from this page. Same safety rule as the rest of /parish/ (see
 * common.js): server text goes in with textContent only, through UO.h. */
(function () {
  'use strict';
  var U = window.UO, h = U.h;
  function $(id) { return document.getElementById(id); }

  var client = U.createClient('uoDioceseSession', function () { showSignin('Your session has ended. Please sign in again.'); });
  var core = window.UOAccount.create('uoDioceseSession');   // the same saved sign-in, for password, passkey and sign-in options
  var dioceseKey = '';

  function show(name) {
    var edit = (name === 'edit');
    $('view-signin').hidden = edit; $('view-edit').hidden = !edit; $('view-security').hidden = !edit;
    $('logout').hidden = !edit; $('who').hidden = !edit; $('view-link').hidden = !edit;
    var hd = $(edit ? 'h-edit' : 'h-signin'); if (hd) { hd.focus(); }
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
    if (!email) { U.say($('signin-status'), 'bad', 'Please enter your email address.'); return; }
    var btn = $('btn-send-code'); btn.disabled = true;
    client.call('POST', '/diocese/auth/request-code', { email: email }).then(function (res) {
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
    client.call('POST', '/diocese/auth/verify-code', { email: pendingEmail, code: $('signin-code').value.trim() }).then(function (res) {
      btn.disabled = false;
      if (res.ok && typeof res.body.token === 'string') {
        client.save(res.body.token, res.body.expires_at);
        $('who').textContent = pendingEmail;
        $('signin-code').value = '';
        load();
      } else { U.say($('signin-status'), 'bad', U.problem(res, 'That code was not accepted.')); }
    });
  });
  $('btn-other-email').addEventListener('click', function () {
    $('form-email').hidden = false; $('form-code').hidden = true; U.say($('signin-status'), '', ''); $('signin-email').focus();
  });
  $('logout').addEventListener('click', function () {
    client.call('POST', '/auth/logout', {}).then(function () { client.drop(); showSignin(''); });
  });

  // ---------- other ways to sign in: password, passkey (optional) ----------
  if (!window.UOAccount.passkeysSupported()) { $('passkey-row').hidden = true; }
  $('form-password').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var email = $('pw-email').value.trim(), pw = $('pw-password').value;
    if (!email || !pw) { U.say($('signin-status'), 'bad', 'Please enter your email address and password.'); return; }
    var btn = $('btn-pw-signin'); btn.disabled = true;
    core.passwordLogin(email, pw, 'diocese').then(function (res) {
      btn.disabled = false;
      if (res.ok) { $('pw-password').value = ''; $('who').textContent = email; load(); }
      else { U.say($('signin-status'), 'bad', U.problem(res, 'That email and password were not accepted. You can always use an emailed code instead.')); }
    });
  });
  $('btn-passkey-signin').addEventListener('click', function () {
    var btn = $('btn-passkey-signin'); btn.disabled = true;
    core.passkeyLogin('diocese').then(function (res) {
      btn.disabled = false;
      if (res.ok) { load(); }
      else if (res.body && res.body.error === 'cancelled') { U.say($('signin-status'), '', ''); }
      else { U.say($('signin-status'), 'bad', U.problem(res, 'That passkey was not accepted for a diocese account. You can use an emailed code instead.')); }
    });
  });

  // ---------- the page ----------
  function dioLines(text) { return text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean); }
  function dioceseLabel() {
    var found = (window.UO_DIOCESES || []).filter(function (d) { return d.key === dioceseKey; })[0];
    return found ? found.label : dioceseKey.split('/')[1].replace(/-/g, ' ');
  }

  /** Who am I? Then show the page for that diocese. Anything but a diocese session goes back to sign-in. */
  function load() {
    client.call('GET', '/me').then(function (res) {
      if (res.status === 401) { return; }   // client already sent us back to sign-in
      if (!res.ok || res.body.principal !== 'diocese' || typeof res.body.diocese_key !== 'string') {
        client.drop(); showSignin('That sign-in is not a diocese account.'); return;
      }
      dioceseKey = res.body.diocese_key;
      $('who').textContent = res.body.email || '';
      $('h-edit').textContent = dioceseLabel() + ': your diocese’s page';
      $('view-link').setAttribute('href', 'diocese.html?d=' + encodeURIComponent(dioceseKey).replace('%2F', '/'));
      show('edit');
      loadDiocese();
      window.UOAccountPanel.mount($('security-panel'), core);
    });
  }

  function loadDiocese() {
    fetch('/api/v1/dioceses/' + dioceseKey, { headers: { 'Accept': 'application/json' }, credentials: 'omit', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) { U.say($('dio-status'), 'bad', 'Could not load the page.'); return; }
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
                client.call('DELETE', '/diocese/prayers/' + p.id).then(function (res) {
                  if (res.ok) { U.say($('dio-status'), 'ok', 'Removed.'); loadDiocese(); }
                  else { U.say($('dio-status'), 'bad', U.problem(res, 'Could not remove it.')); }
                });
              } } })
            ])
          ]));
        });
        $('dp-empty').hidden = (data.prayers || []).length > 0;
      })
      .catch(function () { U.say($('dio-status'), 'bad', 'Could not load the page.'); });
  }

  $('form-diocese').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var btn = $('btn-save-diocese'); btn.disabled = true;
    client.call('PUT', '/diocese/page', { bishop_name: $('dio-bishop').value, website: $('dio-site').value.trim(), convention_dates: dioLines($('dio-dates').value) }).then(function (res) {
      btn.disabled = false;
      if (res.ok) { U.say($('dio-status'), 'ok', 'Saved.'); loadDiocese(); }
      else { U.say($('dio-status'), 'bad', U.problem(res, U.fieldMessage(res, 'Could not save.'))); }
    });
  });
  $('form-dprayer').addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!$('dp-text').value.trim()) { U.say($('dio-status'), 'bad', 'Please write the item first.'); return; }
    var days = $('dp-days').value.trim() === '' ? 21 : Number($('dp-days').value);
    var btn = $('btn-add-dprayer'); btn.disabled = true;
    client.call('POST', '/diocese/prayers', { text: $('dp-text').value, days: days }).then(function (res) {
      btn.disabled = false;
      if (res.status === 201) { $('dp-text').value = ''; U.say($('dio-status'), 'ok', 'Added.'); loadDiocese(); }
      else if (res.status === 409) { U.say($('dio-status'), 'bad', 'This diocese already has 60 prayer items. Remove some first.'); }
      else { U.say($('dio-status'), 'bad', U.problem(res, U.fieldMessage(res, 'Could not add it.'))); }
    });
  });

  if (client.session()) { load(); } else { show('signin'); }
})();
