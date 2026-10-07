/**
 * The Universal Office -- optional account section of the profile panel (2026-10-07).
 * Lets someone keep their settings on every device by creating a free account: sign in with an emailed code,
 * and, if they like, also add a password or a passkey. All of it is optional; the app works exactly as before
 * for anyone who never touches it.
 *
 * Plain script (no modules). Loaded after js/account-core.js and before js/office-ui.js, which calls
 * accountProfileChanged(profile) whenever the local settings are saved and accountStartup() once at start.
 *
 * THREE RULES this file keeps:
 *  1. It never writes text into the page except with textContent / createElement (no innerHTML).
 *  2. It never throws into the app: every network failure leaves the app working with its local settings.
 *  3. It never syncs the soft "super user" flag, and it never keeps a password: a password lives only in the
 *     input box until the request is sent.
 */
(function () {
  'use strict';
  var KEY_SESSION = 'universalOffice.account.v1';
  var KEY_SYNC = 'universalOffice.account.syncedAt.v1';
  var NEVER_SYNC = { isSuperUser: true };
  var core = null;
  var me = null;            // { email, account: { has_password, passkeys } } while signed in
  var applying = false;     // true while saved settings are being applied here, so they are not uploaded again
  var uploadTimer = null;
  var passkeys = [];

  function $(id) { return document.getElementById(id); }
  function el(tag, props, kids) {
    var e = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === false || v === null || v === undefined) { return; }
      if (k === 'text') { e.textContent = v; }
      else if (k === 'class') { e.className = v; }
      else if (k === 'on') { Object.keys(v).forEach(function (ev) { e.addEventListener(ev, v[ev]); }); }
      else if (v === true) { e.setAttribute(k, ''); }
      else { e.setAttribute(k, String(v)); }
    });
    (kids || []).forEach(function (c) { if (c !== null && c !== undefined) { e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); } });
    return e;
  }
  function getCore() {
    if (!core && window.UOAccount) { core = window.UOAccount.create(KEY_SESSION, function () { me = null; render(); }); }
    return core;
  }
  function say(text, kind) {
    var n = $('account-status');
    if (!n) { return; }
    n.textContent = text || '';
    n.className = 'app-account-status' + (kind ? ' ' + kind : '');
    n.hidden = !text;
  }
  function problem(res, fallback) {
    if (res.status === 0) { return 'Could not reach the server. Check your connection and try again.'; }
    if (res.status === 429) { return 'Too many attempts. Please wait a little while and try again.'; }
    if (res.status >= 500) { return 'Something went wrong on our side. Please try again in a moment.'; }
    var f = res.body && res.body.fields;
    if (f && typeof f === 'object') { var k = Object.keys(f)[0]; if (k && typeof f[k] === 'string') { return f[k]; } }
    return fallback;
  }

  // ---- the settings that are saved: everything in the profile except the flags that must stay on this device ----
  function syncable(profile) {
    var out = {};
    Object.keys(profile || {}).forEach(function (k) {
      var v = profile[k];
      if (NEVER_SYNC[k] || !/^[A-Za-z][A-Za-z0-9_]{0,59}$/.test(k)) { return; }
      if (v === null || typeof v === 'boolean' || typeof v === 'number' || (typeof v === 'string' && v.length <= 600)) { out[k] = v; }
    });
    return out;
  }
  function sameSettings(a, b) { return JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b)); }
  function sortKeys(o) { var r = {}; Object.keys(o || {}).sort().forEach(function (k) { r[k] = o[k]; }); return r; }
  function setSyncedAt(iso) { try { window.localStorage.setItem(KEY_SYNC, iso || ''); } catch (e) { /* ignore */ } }
  function getSyncedAt() { try { return window.localStorage.getItem(KEY_SYNC) || ''; } catch (e) { return ''; } }

  function upload() {
    if (!me || !getCore() || typeof getUserProfileDefaults !== 'function') { return Promise.resolve(); }
    return getCore().putProfile(syncable(getUserProfileDefaults())).then(function (res) {
      if (res.ok) { setSyncedAt(res.body.updated_at); renderSavedLine(); }
      else if (res.status !== 401) { say(problem(res, 'Your settings could not be saved to your account just now. They are still saved on this device.'), 'bad'); }
    });
  }

  /** Called by office-ui.js whenever the local settings are saved. */
  window.accountProfileChanged = function () {
    if (!me || applying) { return; }
    clearTimeout(uploadTimer);
    uploadTimer = setTimeout(function () { uploadTimer = null; upload(); }, 1500);
  };

  function applyServerProfile(profile) {
    if (typeof getUserProfileDefaults !== 'function' || typeof persistUserProfileDefaults !== 'function') { return; }
    applying = true;
    try {
      var merged = Object.assign({}, getUserProfileDefaults());
      Object.keys(syncable(profile)).forEach(function (k) { merged[k] = profile[k]; });
      persistUserProfileDefaults(merged);
    } finally { applying = false; }
  }

  /** After signing in: bring this device and the account into agreement. */
  function reconcile() {
    return getCore().getProfile().then(function (res) {
      if (!res.ok) { return; }
      var server = res.body.profile, local = syncable(getUserProfileDefaults());
      if (!server) { return upload(); }                                   // nothing saved yet: save this device's settings
      if (sameSettings(server, local)) { setSyncedAt(res.body.updated_at); renderSavedLine(); return; }
      return askWhichSettings(server, res.body.updated_at);
    });
  }

  function askWhichSettings(server, updatedAt) {
    var box = $('account-choice');
    if (!box) { applyServerProfile(server); setSyncedAt(updatedAt); return; }
    box.hidden = false;
    while (box.firstChild) { box.removeChild(box.firstChild); }
    box.appendChild(el('p', { text: 'Your account already has saved settings, and they differ from the ones on this device. Which would you like to keep?' }));
    box.appendChild(el('div', { class: 'app-account-row' }, [
      el('button', { type: 'button', class: 'mode-btn app-profile-save', text: 'Use my saved settings', on: { click: function () {
        applyServerProfile(server); setSyncedAt(updatedAt); box.hidden = true; say('Your saved settings are now on this device.', 'ok'); renderSavedLine();
      } } }),
      el('button', { type: 'button', class: 'mode-btn app-profile-reset', text: 'Keep this device’s settings', on: { click: function () {
        box.hidden = true; upload().then(function () { say('This device’s settings are now saved to your account.', 'ok'); });
      } } })
    ]));
  }

  /** At app start: if signed in, quietly take any newer settings saved from another device. */
  window.accountStartup = function () {
    var c = getCore();
    if (!c || !c.session()) { return; }
    c.me().then(function (res) {
      if (!res.ok || res.body.principal !== 'reader') { return; }
      me = { email: res.body.email, account: res.body.account };
      c.getProfile().then(function (p) {
        if (p.ok && p.body.profile && p.body.updated_at && p.body.updated_at > getSyncedAt()) { applyServerProfile(p.body.profile); setSyncedAt(p.body.updated_at); }
        render();
      });
    });
  };

  // ---- the section ----------------------------------------------------------------------------------------------
  function renderSavedLine() {
    var n = $('account-saved');
    if (!n) { return; }
    var at = getSyncedAt();
    n.textContent = at ? 'Your settings are saved to your account (last saved ' + new Date(at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) + ').' : 'Your settings are saved to your account.';
  }

  window.accountSectionOpened = function () { getCore(); render(); };

  function render() {
    var body = $('account-body');
    if (!body || !getCore()) { return; }
    while (body.firstChild) { body.removeChild(body.firstChild); }
    if (!me) { renderSignedOut(body); } else { renderSignedIn(body); }
  }

  function field(id, label, type, extra) {
    var input = el('input', Object.assign({ type: type, id: id, autocomplete: 'off' }, extra || {}));
    return [el('label', { for: id, text: label }), input];
  }

  function renderSignedOut(body) {
    body.appendChild(el('p', { class: 'app-account-intro', text: 'Create a free account to keep your settings on every device. It is optional, and the app works fully without one.' }));
    var tabs = el('div', { class: 'app-account-tabs', role: 'group', 'aria-label': 'How to sign in' });
    var panel = el('div', { class: 'app-account-panel' });
    var methods = [['code', 'Emailed code'], ['password', 'Password']];
    if (window.UOAccount && window.UOAccount.passkeysSupported()) { methods.push(['passkey', 'Passkey']); }
    function show(which) {
      Array.prototype.forEach.call(tabs.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-m') === which)); });
      while (panel.firstChild) { panel.removeChild(panel.firstChild); }
      say('', '');
      if (which === 'code') { codeForm(panel); } else if (which === 'password') { passwordForm(panel); } else { passkeyForm(panel); }
    }
    methods.forEach(function (m) { tabs.appendChild(el('button', { type: 'button', 'data-m': m[0], class: 'app-account-tab', text: m[1], on: { click: function () { show(m[0]); } } })); });
    body.appendChild(tabs); body.appendChild(panel);
    show('code');
  }

  function afterSignIn(res) {
    if (!res.ok) { return false; }
    me = null;
    getCore().me().then(function (m) {
      if (m.ok && m.body.principal === 'reader') { me = { email: m.body.email, account: m.body.account }; }
      render();
      if (me) { reconcile(); }
    });
    return true;
  }

  function codeForm(panel) {
    var f1 = el('form', { novalidate: true, id: 'account-form-email' });
    var email = field('account-email', 'Your email address', 'email', { autocomplete: 'email', inputmode: 'email' });
    var send = el('button', { type: 'submit', class: 'mode-btn app-profile-save', text: 'Email me a code' });
    email.concat([el('div', { class: 'app-account-row' }, [send])]).forEach(function (n) { f1.appendChild(n); });
    var f2 = el('form', { novalidate: true, id: 'account-form-code', hidden: true });
    var code = field('account-code', '6-digit code from your email', 'text', { inputmode: 'numeric', maxlength: '6', autocomplete: 'one-time-code' });
    var verify = el('button', { type: 'submit', class: 'mode-btn app-profile-save', text: 'Sign in' });
    code.concat([el('div', { class: 'app-account-row' }, [verify])]).forEach(function (n) { f2.appendChild(n); });
    f1.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var addr = email[1].value.trim();
      if (!addr) { say('Please enter your email address.', 'bad'); return; }
      send.disabled = true;
      getCore().readerRequestCode(addr).then(function (res) {
        send.disabled = false;
        if (res.ok) { f1.hidden = true; f2.hidden = false; say('We have emailed a code to ' + addr + '. It expires in 10 minutes. Check your spam folder if it does not arrive.', 'ok'); code[1].focus(); }
        else { say(problem(res, 'Could not send a code. Please check the address and try again.'), 'bad'); }
      });
    });
    f2.addEventListener('submit', function (ev) {
      ev.preventDefault();
      verify.disabled = true;
      getCore().readerVerifyCode(email[1].value.trim(), code[1].value.trim()).then(function (res) {
        verify.disabled = false;
        if (!afterSignIn(res)) { say(problem(res, 'That code was not accepted. Check it and try again, or ask for a new one.'), 'bad'); }
      });
    });
    panel.appendChild(f1); panel.appendChild(f2);
  }

  function passwordForm(panel) {
    var f = el('form', { novalidate: true, id: 'account-form-password' });
    var email = field('account-pw-email', 'Email address', 'email', { autocomplete: 'username', inputmode: 'email' });
    var pw = field('account-pw', 'Password', 'password', { autocomplete: 'current-password' });
    var go = el('button', { type: 'submit', class: 'mode-btn app-profile-save', text: 'Sign in' });
    email.concat(pw, [el('div', { class: 'app-account-row' }, [go]),
      el('p', { class: 'app-account-hint', text: 'No password yet, or forgotten it? Use “Emailed code”: it always works, and you can set a new password afterwards.' })]).forEach(function (n) { f.appendChild(n); });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!email[1].value.trim() || !pw[1].value) { say('Please enter your email address and password.', 'bad'); return; }
      go.disabled = true;
      getCore().passwordLogin(email[1].value.trim(), pw[1].value, 'reader').then(function (res) {
        go.disabled = false; pw[1].value = '';
        if (!afterSignIn(res)) { say('That email and password were not accepted. You can always use an emailed code instead.', 'bad'); }
      });
    });
    panel.appendChild(f);
  }

  function passkeyForm(panel) {
    panel.appendChild(el('p', { text: 'Sign in with Face ID, a fingerprint or your device PIN. You need to have added a passkey to your account first.' }));
    var go = el('button', { type: 'button', class: 'mode-btn app-profile-save', id: 'account-passkey-signin', text: 'Sign in with a passkey' });
    go.addEventListener('click', function () {
      go.disabled = true;
      getCore().passkeyLogin('reader').then(function (res) {
        go.disabled = false;
        if (afterSignIn(res)) { return; }
        if (res.body && res.body.error === 'cancelled') { say('', ''); return; }
        say('That passkey was not accepted. Use an emailed code instead, then add a passkey from here.', 'bad');
      });
    });
    panel.appendChild(el('div', { class: 'app-account-row' }, [go]));
  }

  // ---- signed in --------------------------------------------------------------------------------------------------
  function confirmThen(again) {
    var box = $('account-confirm');
    if (!box) { return; }
    box.hidden = false;
    while (box.firstChild) { box.removeChild(box.firstChild); }
    var code = el('input', { type: 'text', id: 'account-reauth-code', inputmode: 'numeric', maxlength: '6', autocomplete: 'one-time-code', 'aria-label': '6-digit code' });
    var cur = el('input', { type: 'password', id: 'account-reauth-pw', autocomplete: 'current-password', 'aria-label': 'Current password' });
    var send = el('button', { type: 'button', class: 'mode-btn app-profile-reset', text: 'Email me a code' });
    var ok = el('button', { type: 'button', class: 'mode-btn app-profile-save', text: 'Confirm' });
    send.addEventListener('click', function () { getCore().reauthRequestCode().then(function (r) { say(r.ok ? 'We have emailed you a code.' : problem(r, 'Could not send a code.'), r.ok ? 'ok' : 'bad'); }); });
    ok.addEventListener('click', function () {
      if (cur.value) { var pw = cur.value; box.hidden = true; again(pw); return; }
      getCore().reauth(code.value.trim()).then(function (r) { if (r.ok) { box.hidden = true; again(null); } else { say(problem(r, 'That code was not accepted.'), 'bad'); } });
    });
    [el('p', { text: 'You signed in a while ago. For your security, please confirm it is you.' }), send, el('label', { for: 'account-reauth-code', text: '6-digit code' }), code]
      .concat(me && me.account && me.account.has_password ? [el('label', { for: 'account-reauth-pw', text: 'Or your current password' }), cur] : [], [el('div', { class: 'app-account-row' }, [ok])])
      .forEach(function (n) { box.appendChild(n); });
  }
  function guarded(run, done) {
    function attempt(cur) { run(cur).then(function (res) { if (res.status === 403 && res.body && res.body.error === 'reauth_required') { confirmThen(attempt); return; } done(res); }); }
    attempt(null);
  }
  function refreshMe() {
    return Promise.all([getCore().me(), getCore().listPasskeys()]).then(function (rs) {
      if (rs[0].ok && rs[0].body.principal === 'reader') { me = { email: rs[0].body.email, account: rs[0].body.account }; }
      passkeys = (rs[1].ok && rs[1].body.passkeys) || [];
      render();
    });
  }

  function renderSignedIn(body) {
    body.appendChild(el('p', { class: 'app-account-who' }, ['Signed in as ', el('strong', { text: me.email }), '.']));
    body.appendChild(el('p', { id: 'account-saved', class: 'app-account-hint' }));
    renderSavedLine();

    // password
    var has = me.account && me.account.has_password;
    var form = el('form', { novalidate: true, hidden: true, id: 'account-form-setpw' });
    var p1 = field('account-new-pw', 'New password', 'password', { autocomplete: 'new-password' });
    var p2 = field('account-new-pw2', 'Type it again', 'password', { autocomplete: 'new-password' });
    var save = el('button', { type: 'submit', class: 'mode-btn app-profile-save', text: 'Save password' });
    p1.concat([el('p', { class: 'app-account-hint', text: 'At least 15 characters. A phrase of several words is easiest to remember, and spaces are fine.' })], p2, [el('div', { class: 'app-account-row' }, [save])]).forEach(function (n) { form.appendChild(n); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (p1[1].value !== p2[1].value) { say('The two passwords do not match.', 'bad'); return; }
      var pw = p1[1].value; save.disabled = true;
      guarded(function (cur) { return getCore().setPassword(pw, cur); }, function (res) {
        save.disabled = false;
        if (res.ok) { say('Your password is saved. You were signed out on your other devices.', 'ok'); refreshMe(); }
        else { say(problem(res, 'Could not save that password.'), 'bad'); }
      });
    });
    var pwRow = el('div', { class: 'app-account-row' }, [
      el('button', { type: 'button', class: 'mode-btn app-profile-reset', id: 'account-pw-toggle', text: has ? 'Change password' : 'Add a password', on: { click: function () { form.hidden = false; p1[1].focus(); } } })
    ]);
    if (has) {
      pwRow.appendChild(el('button', { type: 'button', class: 'mode-btn app-profile-reset', text: 'Remove password', on: { click: function () {
        guarded(function (cur) { return getCore().removePassword(cur); }, function (res) { if (res.ok) { say('Your password was removed.', 'ok'); refreshMe(); } else { say(problem(res, 'Could not remove it.'), 'bad'); } });
      } } }));
    }
    body.appendChild(el('h4', { text: 'Password' }));
    body.appendChild(el('p', { class: 'app-account-hint', text: has ? 'A password is set. You can sign in with it or with an emailed code.' : 'Optional. Without one, you sign in with an emailed code.' }));
    body.appendChild(pwRow); body.appendChild(form);

    // passkeys
    if (window.UOAccount && window.UOAccount.passkeysSupported()) {
      body.appendChild(el('h4', { text: 'Passkeys' }));
      body.appendChild(el('p', { class: 'app-account-hint', text: 'Sign in with Face ID, a fingerprint or your device PIN. Nothing to type or remember.' }));
      if (passkeys.length) {
        var ul = el('ul', { class: 'app-account-list' });
        passkeys.forEach(function (k) {
          ul.appendChild(el('li', {}, [el('span', { text: k.label || 'Passkey' }),
            el('button', { type: 'button', class: 'mode-btn app-profile-reset', text: 'Remove', 'aria-label': 'Remove passkey ' + (k.label || ''), on: { click: function () {
              guarded(function (cur) { return getCore().removePasskey(k.id, cur); }, function (res) { if (res.ok) { say('Passkey removed.', 'ok'); refreshMe(); } else { say(problem(res, 'Could not remove it.'), 'bad'); } });
            } } })]));
        });
        body.appendChild(ul);
      }
      body.appendChild(el('div', { class: 'app-account-row' }, [el('button', { type: 'button', class: 'mode-btn app-profile-reset', id: 'account-add-passkey', text: 'Add a passkey', on: { click: function (ev) {
        var btn = ev.currentTarget; btn.disabled = true;
        guarded(function (cur) { return getCore().addPasskey(deviceLabel(), cur); }, function (res) {
          btn.disabled = false;
          if (res.ok) { say('Passkey added. You can now sign in with it.', 'ok'); refreshMe(); }
          else if (res.body && res.body.error === 'cancelled') { say('', ''); }
          else { say((res.body && res.body.message) || problem(res, 'Could not add a passkey.'), 'bad'); }
        });
      } } })]));
    }

    // leaving
    body.appendChild(el('h4', { text: 'Sign out or delete' }));
    body.appendChild(el('div', { class: 'app-account-row' }, [
      el('button', { type: 'button', class: 'mode-btn app-profile-reset', id: 'account-signout', text: 'Sign out', on: { click: function () {
        getCore().logout().then(function () { me = null; passkeys = []; setSyncedAt(''); say('You are signed out. Your settings stay on this device.', 'ok'); render(); });
      } } }),
      el('button', { type: 'button', class: 'mode-btn app-profile-reset', id: 'account-delete', text: 'Delete my account', on: { click: function () {
        if (!window.confirm('Delete your account? Your saved settings, password and passkeys are removed from our server. Your settings stay on this device.')) { return; }
        guarded(function (cur) { return getCore().deleteAccount(cur); }, function (res) {
          if (res.ok) { getCore().drop(); me = null; passkeys = []; setSyncedAt(''); say('Your account was deleted.', 'ok'); render(); }
          else { say(problem(res, 'Could not delete the account.'), 'bad'); }
        });
      } } })
    ]));
    refreshPasskeysQuietly();
  }

  var passkeyLoadDone = false;
  function refreshPasskeysQuietly() {
    if (passkeyLoadDone) { return; }
    passkeyLoadDone = true;
    getCore().listPasskeys().then(function (r) { passkeyLoadDone = false; if (r.ok && (r.body.passkeys || []).length !== passkeys.length) { passkeys = r.body.passkeys || []; render(); } });
  }
  function deviceLabel() {
    var ua = navigator.userAgent || '';
    var kind = /iPhone|iPad/.test(ua) ? 'iPhone or iPad' : /Android/.test(ua) ? 'Android' : /Macintosh/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'This device';
    return kind + ', ' + new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
})();
