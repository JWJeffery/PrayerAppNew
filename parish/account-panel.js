/* "Sign-in options" for the signed-in rector, helper or administrator: add, change or remove a password, and
 * add or remove passkeys. Emailed codes always keep working; nothing here is required.
 * Built on js/account-core.js (UOAccount). Same safety rule as the rest of /parish/ (see common.js): text goes
 * into the page with textContent only, through UO.h(). No password is kept anywhere after a request.
 *
 * UOAccountPanel.mount(container, core) draws the panel and keeps it up to date. */
(function () {
  'use strict';
  var U = window.UO, h = U.h;

  function mount(container, core) {
    var state = { account: null, passkeys: [] };
    var status = h('p', { class: 'status', role: 'status', 'aria-live': 'polite', hidden: true });
    var body = h('div', {});
    U.clear(container);
    [h('h2', { text: 'Sign-in options' }),
     h('p', { class: 'muted' }, ['You can always sign in with an emailed code. If you like, you can also add a password or a passkey (Face ID, a fingerprint or a device PIN) as another way in. Neither is required.']),
     body, status].forEach(function (n) { container.appendChild(n); });

    function say(kind, text) { U.say(status, kind, text); }

    /** Ask the person to prove it is them (emailed code, or their password), then run `again`. */
    function confirmThen(again) {
      var dlg = h('dialog', { class: 'dlg', 'aria-labelledby': 'confirm-title' });
      var msg = h('p', { class: 'status', role: 'status', hidden: true });
      var code = h('input', { type: 'text', inputmode: 'numeric', maxlength: '6', autocomplete: 'one-time-code', 'aria-label': '6-digit code' });
      var sent = false;
      var send = h('button', { type: 'button', class: 'small', text: 'Email me a code' });
      var ok = h('button', { type: 'button', class: 'primary', text: 'Confirm' });
      var cancel = h('button', { type: 'button', text: 'Cancel' });
      var pw = h('input', { type: 'password', autocomplete: 'current-password', 'aria-label': 'Current password' });
      var kids = [h('h2', { id: 'confirm-title', text: 'Please confirm it is you' }),
                  h('p', { text: 'You signed in a while ago. For your security, confirm with an emailed code' + (state.account && state.account.has_password ? ', or with your current password.' : '.') }),
                  h('div', { class: 'row' }, [send]), h('label', { text: '6-digit code' }), code];
      if (state.account && state.account.has_password) { kids.push(h('label', { text: 'Or your current password' }), pw); }
      kids.push(msg, h('div', { class: 'row end' }, [cancel, ok]));
      kids.forEach(function (n) { dlg.appendChild(n); });
      function close() { try { dlg.close(); } catch (e) { /* ignore */ } if (dlg.parentNode) { dlg.parentNode.removeChild(dlg); } }
      send.addEventListener('click', function () {
        send.disabled = true;
        core.reauthRequestCode().then(function (r) {
          send.disabled = false;
          if (r.ok) { sent = true; U.say(msg, 'ok', 'We have sent a code to your email address.'); code.focus(); }
          else { U.say(msg, 'bad', U.problem(r, 'Could not send a code. Please try again.')); }
        });
      });
      ok.addEventListener('click', function () {
        if (pw.value) { close(); again(pw.value); return; }
        if (!code.value.trim()) { U.say(msg, 'bad', sent ? 'Enter the 6-digit code from your email.' : 'Ask for a code first, or enter your password.'); return; }
        ok.disabled = true;
        core.reauth(code.value.trim()).then(function (r) {
          ok.disabled = false;
          if (r.ok) { close(); again(null); } else { U.say(msg, 'bad', U.problem(r, 'That code was not accepted.')); }
        });
      });
      cancel.addEventListener('click', close);
      dlg.addEventListener('cancel', function (ev) { ev.preventDefault(); close(); });
      document.body.appendChild(dlg);
      if (typeof dlg.showModal === 'function') { dlg.showModal(); } else { dlg.setAttribute('open', ''); }
      send.focus();
    }

    /** Run a change; if the server wants a fresh confirmation, ask for it and run it again. */
    function guarded(run, done) {
      function attempt(currentPassword) {
        run(currentPassword).then(function (res) {
          if (res.status === 403 && res.body && res.body.error === 'reauth_required') { confirmThen(attempt); return; }
          done(res);
        });
      }
      attempt(null);
    }

    function refresh() {
      return Promise.all([core.me(), core.listPasskeys()]).then(function (rs) {
        if (rs[0].ok && rs[0].body.account) { state.account = rs[0].body.account; }
        state.passkeys = (rs[1].ok && rs[1].body.passkeys) || [];
        draw();
      });
    }

    function draw() {
      U.clear(body);
      var a = state.account || { has_password: false };

      // ---- password
      var pwBox = h('div', { class: 'card' });
      pwBox.appendChild(h('h3', { text: 'Password' }));
      pwBox.appendChild(h('p', { text: a.has_password ? 'A password is set. You can sign in with it or with an emailed code.' : 'No password set. You sign in with an emailed code.' }));
      var form = h('form', { novalidate: true, hidden: true });
      var p1 = h('input', { type: 'password', id: 'sec-pw1', autocomplete: 'new-password' });
      var p2 = h('input', { type: 'password', id: 'sec-pw2', autocomplete: 'new-password' });
      var save = h('button', { type: 'submit', class: 'primary', text: 'Save password' });
      [h('label', { for: 'sec-pw1', text: 'New password' }), p1,
       h('p', { class: 'field-hint', text: 'At least 15 characters. A phrase of several words is easiest to remember, and spaces are fine. No symbols or numbers are required.' }),
       h('label', { for: 'sec-pw2', text: 'Type it again' }), p2,
       h('div', { class: 'row' }, [save, h('button', { type: 'button', text: 'Cancel', on: { click: function () { form.hidden = true; p1.value = ''; p2.value = ''; } } })])
      ].forEach(function (n) { form.appendChild(n); });
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (p1.value !== p2.value) { say('bad', 'The two passwords do not match.'); return; }
        var pw = p1.value; save.disabled = true;
        guarded(function (cur) { return core.setPassword(pw, cur); }, function (res) {
          save.disabled = false;
          if (res.ok) { p1.value = ''; p2.value = ''; say('ok', 'Your password is saved. You were signed out on your other devices.'); refresh(); }
          else { say('bad', U.problem(res, U.fieldMessage(res, 'Could not save that password.'))); }
        });
      });
      var actions = h('div', { class: 'row' }, [
        h('button', { type: 'button', text: a.has_password ? 'Change password' : 'Add a password', on: { click: function () { form.hidden = false; p1.focus(); } } })
      ]);
      if (a.has_password) {
        actions.appendChild(h('button', { type: 'button', class: 'danger', text: 'Remove password', on: { click: function () {
          U.confirmDialog({ title: 'Remove your password?', message: 'You will sign in with an emailed code or a passkey instead. Your other devices will be signed out.', confirmLabel: 'Remove', danger: true }).then(function (yes) {
            if (!yes) { return; }
            guarded(function (cur) { return core.removePassword(cur); }, function (res) {
              if (res.ok) { say('ok', 'Your password was removed.'); refresh(); } else { say('bad', U.problem(res, 'Could not remove it.')); }
            });
          });
        } } }));
      }
      pwBox.appendChild(actions); pwBox.appendChild(form);
      body.appendChild(pwBox);

      // ---- passkeys
      var pkBox = h('div', { class: 'card' });
      pkBox.appendChild(h('h3', { text: 'Passkeys' }));
      if (!window.UOAccount || !window.UOAccount.passkeysSupported()) {
        pkBox.appendChild(h('p', { class: 'muted', text: 'This browser cannot use passkeys.' }));
      } else {
        pkBox.appendChild(h('p', { text: 'A passkey lets you sign in with Face ID, a fingerprint or your device PIN, with nothing to type or remember. It stays safe even if someone sends you a fake sign-in page.' }));
      }
      if (state.passkeys.length) {
        var ul = h('ul', { class: 'people' });
        state.passkeys.forEach(function (k) {
          ul.appendChild(h('li', {}, [
            h('span', {}, [k.label || 'Passkey', h('span', { class: 'muted small', text: ' · added ' + U.fmtDate(k.created_at) + (k.last_used_at ? ', last used ' + U.fmtDate(k.last_used_at) : '') })]),
            h('button', { type: 'button', class: 'small danger', text: 'Remove', 'aria-label': 'Remove passkey ' + (k.label || ''), on: { click: function () {
              guarded(function (cur) { return core.removePasskey(k.id, cur); }, function (res) {
                if (res.ok) { say('ok', 'Passkey removed.'); refresh(); } else { say('bad', U.problem(res, 'Could not remove it.')); }
              });
            } } })
          ]));
        });
        pkBox.appendChild(ul);
      }
      if (window.UOAccount && window.UOAccount.passkeysSupported()) {
        pkBox.appendChild(h('div', { class: 'row' }, [h('button', { type: 'button', id: 'btn-add-passkey', text: 'Add a passkey', on: { click: function (ev) {
          var btn = ev.currentTarget; btn.disabled = true;
          guarded(function (cur) { return core.addPasskey(deviceLabel(), cur); }, function (res) {
            btn.disabled = false;
            if (res.ok) { say('ok', 'Passkey added. You can now sign in with it.'); refresh(); }
            else if (res.body && res.body.error === 'cancelled') { say('', ''); }
            else { say('bad', U.problem(res, (res.body && res.body.message) || 'Could not add a passkey.')); }
          });
        } } })]));
      }
      body.appendChild(pkBox);
    }

    function deviceLabel() {
      var ua = navigator.userAgent || '';
      var kind = /iPhone|iPad/.test(ua) ? 'iPhone or iPad' : /Android/.test(ua) ? 'Android' : /Macintosh/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'This device';
      return kind + ', ' + new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    refresh();
    return { refresh: refresh };
  }

  window.UOAccountPanel = { mount: mount };
})();
