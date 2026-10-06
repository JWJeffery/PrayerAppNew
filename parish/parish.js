/* Rector dashboard: sign in with an emailed code, manage the parish's prayer requests, settings and
 * helpers, and register a new parish. Talks to /api/v1 (see api/openapi.yaml). No framework.
 *
 * All text that came from the server (or from other people) is written with textContent through
 * UO.h(); see the safety rule at the top of common.js. */
(function () {
  'use strict';
  var U = window.UO, h = U.h;
  function $(id) { return document.getElementById(id); }

  var STORAGE_KEY = 'uoParishSession';
  // Exact wording required by the build spec (6.6); repeated on the privacy page.
  var REMINDER = "Add names only with the person's or family's permission — first names or initials are fine. " +
    "Please don't share overly sensitive information, such as detailed medical, legal, financial or family details. " +
    "When in doubt, keep it general.";
  var CATEGORY = { individual: 'Individual', family: 'Family', situation: 'Situation', institution: 'Institution' };
  var MAX_TEXT = 200;

  var client = U.createClient(STORAGE_KEY, function () { showSignin('Your session has ended. Please sign in again.'); });
  var me = null; // { staff: {...}, parish: {...} } from GET /me

  // ---------- views ----------
  var VIEWS = { signin: 'view-signin', register: 'view-register', dashboard: 'view-dashboard' };
  var HEADINGS = { signin: 'h-signin', register: 'h-register', dashboard: 'h-dash' };
  function show(name) {
    Object.keys(VIEWS).forEach(function (k) { $(VIEWS[k]).hidden = (k !== name); });
    var signedIn = (name === 'dashboard');
    $('logout').hidden = !signedIn;
    $('who').hidden = !signedIn;
    var hd = $(HEADINGS[name]);
    if (hd) { hd.focus(); }
  }
  function showSignin(message) {
    me = null;
    $('form-email').hidden = false;
    $('form-code').hidden = true;
    $('signin-code').value = '';
    U.say($('signin-status'), message ? 'bad' : '', message || '');
    show('signin');
  }

  // ---------- sign in ----------
  var pendingEmail = '';
  $('form-email').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var email = $('signin-email').value.trim();
    if (!email) { U.say($('signin-status'), 'bad', 'Please enter your email address.'); return; }
    var btn = $('btn-send-code'); btn.disabled = true;
    client.call('POST', '/auth/request-code', { email: email }).then(function (res) {
      btn.disabled = false;
      if (res.status === 200) {
        pendingEmail = email;
        $('form-email').hidden = true;
        $('form-code').hidden = false;
        $('code-sent-note').textContent = 'If that address is authorized, we have sent a 6-digit code to it. It expires in 10 minutes. Check your spam folder if it does not arrive.';
        U.say($('signin-status'), '', '');
        $('signin-code').focus();
      } else if (res.status === 422) {
        U.say($('signin-status'), 'bad', 'Please enter a valid email address.');
      } else {
        U.say($('signin-status'), 'bad', U.problem(res, 'Could not send the code. Please try again.'));
      }
    });
  });
  $('form-code').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var code = $('signin-code').value.trim();
    var btn = $('btn-verify'); btn.disabled = true;
    client.call('POST', '/auth/verify-code', { email: pendingEmail, code: code }).then(function (res) {
      btn.disabled = false;
      if (res.ok && typeof res.body.token === 'string') {
        client.save(res.body.token, res.body.expires_at);
        $('signin-code').value = '';
        loadDashboard();
      } else {
        U.say($('signin-status'), 'bad', U.problem(res, 'That code was not accepted. Check it and try again, or ask for a new one.'));
      }
    });
  });
  $('btn-other-email').addEventListener('click', function () {
    $('form-email').hidden = false; $('form-code').hidden = true; U.say($('signin-status'), '', ''); $('signin-email').focus();
  });
  $('logout').addEventListener('click', function () {
    client.call('POST', '/auth/logout', {}).then(function () { client.drop(); showSignin(''); });
  });

  // ---------- registration ----------
  (function fillDioceses() {
    var sel = $('reg-diocese');
    (window.UO_DIOCESES || []).forEach(function (d) { sel.appendChild(h('option', { value: d.key, text: d.label })); });
  })();
  var regEmail = '';
  $('go-register').addEventListener('click', function () { U.say($('register-status'), '', ''); show('register'); });
  ['back-to-signin-1', 'back-to-signin-2'].forEach(function (id) {
    $(id).addEventListener('click', function () { showSignin(''); });
  });
  $('form-register').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var body = {
      parish_name: $('reg-parish').value.trim(),
      contact_name: $('reg-contact').value.trim(),
      email: $('reg-email').value.trim(),
      visibility: (document.querySelector('input[name=reg-visibility]:checked') || {}).value || 'code'
    };
    if ($('reg-diocese').value) { body.diocese_key = $('reg-diocese').value; }
    if (!body.parish_name || !body.contact_name || !body.email) {
      U.say($('register-status'), 'bad', 'Please fill in the parish name, your name and your email address.');
      return;
    }
    var btn = $('btn-register'); btn.disabled = true;
    client.call('POST', '/register', body).then(function (res) {
      btn.disabled = false;
      if (res.status === 200) {
        regEmail = body.email;
        $('form-register').hidden = true;
        $('form-register-code').hidden = false;
        $('reg-code-note').textContent = 'We are sending a 6-digit code to ' + body.email + '. It expires in 10 minutes. Check your spam folder. If nothing arrives within a few minutes, that address may already be registered here \u2014 go back and sign in instead.';
        U.say($('register-status'), '', '');
        $('reg-code').focus();
      } else {
        U.say($('register-status'), 'bad', U.problem(res, U.fieldMessage(res, 'Please check the details and try again.')));
      }
    });
  });
  $('form-register-code').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var btn = $('btn-register-verify'); btn.disabled = true;
    client.call('POST', '/register/verify', { email: regEmail, code: $('reg-code').value.trim() }).then(function (res) {
      btn.disabled = false;
      if (res.status === 200 && res.body.status === 'pending_approval') {
        $('form-register-code').hidden = true;
        $('reg-done').hidden = false;
        U.say($('register-status'), '', '');
      } else {
        U.say($('register-status'), 'bad', U.problem(res, 'That code was not accepted. Check it and try again.'));
      }
    });
  });

  // ---------- dashboard ----------
  function loadDashboard() {
    client.call('GET', '/me').then(function (res) {
      if (res.status === 401) { return; } // the client already sent us to sign-in, with its explanation
      if (!res.ok || res.body.principal !== 'staff') {
        client.drop();
        showSignin(res.ok ? 'That is an administrator sign-in. Please use the admin page.' : U.problem(res, ''));
        return;
      }
      me = res.body;
      var isRector = me.staff.role === 'rector';
      $('h-dash').textContent = me.parish.name;
      $('dash-role').textContent = isRector ? 'Rector' : 'Helper';
      $('dash-sub').textContent = 'Signed in as ' + (me.staff.display_name || me.staff.email) + '.';
      $('who').textContent = me.staff.display_name || me.staff.email;
      $('rector-only').hidden = !isRector;
      $('delete-parish-wrap').hidden = !isRector;
      selectTab('requests');
      show('dashboard');
      loadIntentions();
    });
  }

  var TABS = { requests: 'pane-requests', pages: 'pane-pages', settings: 'pane-settings' };
  function selectTab(name) {
    Object.keys(TABS).forEach(function (k) {
      $('tab-' + k).setAttribute('aria-selected', String(k === name));
      $(TABS[k]).hidden = (k !== name);
    });
    if (name === 'settings') { loadSettings(); }
    if (name === 'pages' && window.UOPages) { window.UOPages.load(client, me); }
  }
  $('tab-requests').addEventListener('click', function () { selectTab('requests'); });
  $('tab-pages').addEventListener('click', function () { selectTab('pages'); });
  $('tab-settings').addEventListener('click', function () { selectTab('settings'); });

  // ---------- prayer requests ----------
  $('add-reminder').textContent = REMINDER;

  function countChars(s) { return Array.from(s).length; }
  function bindCounter(input, counter) {
    function update() {
      var n = countChars(input.value);
      counter.textContent = n + ' / ' + MAX_TEXT;
      counter.className = 'counter' + (n >= MAX_TEXT - 20 ? ' warn' : '');
    }
    input.addEventListener('input', update);
    update();
    return update;
  }
  var updateAddCounter = bindCounter($('add-text'), $('add-counter'));

  function expiryBadge(item) {
    var d = U.daysUntil(item.expires_at);
    var when = U.fmtDate(item.expires_at);
    if (item.expired) {
      var ago = Math.floor((Date.now() - Date.parse(item.expires_at)) / 86400000); // whole days since it expired
      var agoText = ago <= 0 ? 'today' : (ago === 1 ? 'yesterday' : ago + ' days ago');
      return h('span', { class: 'badge gone', text: 'Expired ' + agoText + ' (' + when + ')' });
    }
    var label = d <= 0 ? 'Expires today' : 'Expires in ' + d + (d === 1 ? ' day' : ' days');
    return h('span', { class: 'badge' + (d <= 3 ? ' soon' : ''), text: label + ' (' + when + ')' });
  }

  function itemNode(item) {
    var li = h('li', { class: 'item' + (item.expired ? ' expired' : ''), 'data-id': item.id });
    li.appendChild(h('div', { class: 'item-head' }, [h('span', { class: 'chip', text: CATEGORY[item.category] || item.category }), expiryBadge(item)]));
    li.appendChild(h('p', { class: 'item-text', text: item.text }));
    if (item.extension_count > 0) {
      li.appendChild(h('p', { class: 'muted small', text: 'Extended ' + item.extension_count + (item.extension_count === 1 ? ' time' : ' times') + '.' }));
    }
    var actions = h('div', { class: 'item-actions' }, [h('span', { class: 'label', text: 'Extend by:' })]);
    [7, 21, 45].forEach(function (days) {
      actions.appendChild(h('button', { type: 'button', class: 'small', text: days + ' days', 'aria-label': 'Extend by ' + days + ' days',
        on: { click: function () { extend(item, days); } } }));
    });
    actions.appendChild(h('button', { type: 'button', class: 'small', text: 'Edit', on: { click: function () { editItem(li, item); } } }));
    actions.appendChild(h('button', { type: 'button', class: 'small danger', text: 'Remove', on: { click: function () { removeItem(item); } } }));
    li.appendChild(actions);
    return li;
  }

  function loadIntentions() {
    client.call('GET', '/staff/intentions').then(function (res) {
      if (!res.ok) { if (res.status !== 401) { U.say($('list-status'), 'bad', U.problem(res, 'Could not load your prayer requests.')); } return; }
      var list = res.body.intentions || [];
      var cur = list.filter(function (i) { return !i.expired; });
      var exp = list.filter(function (i) { return i.expired; });
      U.clear($('list-current')); U.clear($('list-expired'));
      cur.forEach(function (i) { $('list-current').appendChild(itemNode(i)); });
      exp.forEach(function (i) { $('list-expired').appendChild(itemNode(i)); });
      $('empty-current').hidden = cur.length > 0;
      $('expired-wrap').hidden = exp.length === 0;
    });
  }

  function extend(item, days) {
    client.call('POST', '/staff/intentions/' + item.id + '/extend', { days: days }).then(function (res) {
      if (res.ok) { U.say($('list-status'), 'ok', 'Extended by ' + days + ' days.'); loadIntentions(); }
      else { U.say($('list-status'), 'bad', U.problem(res, 'Could not extend that request.')); }
    });
  }

  function removeItem(item) {
    U.confirmDialog({ title: 'Remove this request?', message: 'It will be deleted right away and cannot be brought back.', confirmLabel: 'Remove', danger: true })
      .then(function (yes) {
        if (!yes) { return; }
        client.call('DELETE', '/staff/intentions/' + item.id).then(function (res) {
          if (res.ok) { U.say($('list-status'), 'ok', 'Removed.'); loadIntentions(); }
          else { U.say($('list-status'), 'bad', U.problem(res, 'Could not remove that request.')); }
        });
      });
  }

  function editItem(li, item) {
    U.clear(li);
    var cat = h('select', { id: 'edit-cat-' + item.id, 'aria-label': 'Kind of request' });
    Object.keys(CATEGORY).forEach(function (k) { cat.appendChild(h('option', { value: k, text: CATEGORY[k] })); });
    cat.value = item.category;
    var text = h('textarea', { id: 'edit-text-' + item.id, maxlength: String(MAX_TEXT), rows: '3', 'aria-label': 'The request' });
    text.value = item.text;
    var counter = h('p', { class: 'counter', 'aria-live': 'polite' });
    bindCounter(text, counter);
    var status = h('p', { class: 'status', role: 'status', hidden: true });
    var save = h('button', { type: 'button', class: 'primary small', text: 'Save' });
    var cancel = h('button', { type: 'button', class: 'small', text: 'Cancel', on: { click: loadIntentions } });
    save.addEventListener('click', function () {
      if (!text.value.trim()) { U.say(status, 'bad', 'The request cannot be empty.'); return; }
      save.disabled = true;
      client.call('PATCH', '/staff/intentions/' + item.id, { category: cat.value, text: text.value }).then(function (res) {
        save.disabled = false;
        if (res.ok) { U.say($('list-status'), 'ok', 'Saved.'); loadIntentions(); }
        else { U.say(status, 'bad', U.problem(res, U.fieldMessage(res, 'Could not save.'))); }
      });
    });
    [h('p', { class: 'reminder', text: REMINDER }), h('label', { for: cat.id, text: 'Kind of request' }), cat,
     h('label', { for: text.id, text: 'The request' }), text, counter, h('div', { class: 'row' }, [save, cancel]), status]
      .forEach(function (n) { li.appendChild(n); });
    text.focus();
  }

  $('form-add').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var text = $('add-text').value;
    var daysRaw = $('add-days').value.trim();
    var days = daysRaw === '' ? 21 : Number(daysRaw);
    if (!text.trim()) { U.say($('add-status'), 'bad', 'Please write the request first.'); return; }
    if (!Number.isInteger(days) || days < 1 || days > 45) { U.say($('add-status'), 'bad', 'Days must be a whole number from 1 to 45.'); return; }
    var btn = $('btn-add'); btn.disabled = true;
    client.call('POST', '/staff/intentions', { category: $('add-category').value, text: text, days: days }).then(function (res) {
      btn.disabled = false;
      if (res.status === 201) {
        $('add-text').value = ''; updateAddCounter();
        U.say($('add-status'), 'ok', 'Added. It will show for ' + days + ' days.');
        loadIntentions();
      } else if (res.status === 409) {
        U.say($('add-status'), 'bad', 'Your parish already has 100 active requests. Remove some first.');
      } else {
        U.say($('add-status'), 'bad', U.problem(res, U.fieldMessage(res, 'Could not add that request.')));
      }
    });
  });

  // ---------- settings ----------
  function loadSettings() {
    U.say($('vis-status'), '', ''); U.say($('code-status'), '', ''); U.say($('people-status'), '', ''); U.say($('leave-status'), '', '');
    if (me.staff.role !== 'rector') { return; }
    setVisibilityUi(me.parish.visibility);
    loadPeople();
  }
  function setVisibilityUi(vis) {
    var r = document.querySelector('input[name=set-visibility][value=' + vis + ']');
    if (r) { r.checked = true; }
    $('code-wrap').hidden = (vis !== 'code');
    if (vis === 'code') { loadJoinCode(); }
  }
  function loadJoinCode() {
    client.call('GET', '/staff/parish/join-code').then(function (res) {
      if (res.ok) { $('join-code').textContent = res.body.join_code; }
      else { $('join-code').textContent = ''; U.say($('code-status'), 'bad', U.problem(res, 'Could not load the join code.')); }
    });
  }
  $('btn-save-vis').addEventListener('click', function () {
    var chosen = document.querySelector('input[name=set-visibility]:checked');
    if (!chosen) { return; }
    client.call('PATCH', '/staff/parish', { visibility: chosen.value }).then(function (res) {
      if (!res.ok) { U.say($('vis-status'), 'bad', U.problem(res, 'Could not save that setting.')); return; }
      me.parish.visibility = res.body.parish.visibility;
      setVisibilityUi(me.parish.visibility);
      U.say($('vis-status'), 'ok', me.parish.visibility === 'code'
        ? 'Saved. Only people with the join code can follow your parish.'
        : 'Saved. Anyone can now follow your parish.');
    });
  });
  $('btn-copy-code').addEventListener('click', function () {
    var code = $('join-code').textContent;
    var done = function (ok) { U.say($('code-status'), ok ? 'ok' : 'bad', ok ? 'Copied.' : 'Could not copy automatically. Select the code and copy it.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(code).then(function () { done(true); }, function () { done(false); }); }
    else { done(false); }
  });
  $('btn-rotate-code').addEventListener('click', function () {
    U.confirmDialog({ title: 'Make a new join code?',
      message: 'Everyone who follows your parish will be signed out of your prayer list until they enter the new code. The old code stops working immediately.',
      confirmLabel: 'Make a new code', danger: true }).then(function (yes) {
      if (!yes) { return; }
      client.call('POST', '/staff/parish/join-code/rotate', {}).then(function (res) {
        if (res.ok) { $('join-code').textContent = res.body.join_code; U.say($('code-status'), 'ok', 'Here is your new code. The old one no longer works.'); }
        else { U.say($('code-status'), 'bad', U.problem(res, 'Could not make a new code.')); }
      });
    });
  });

  function loadPeople() {
    client.call('GET', '/staff/delegates').then(function (res) {
      var ul = $('people'); U.clear(ul);
      if (!res.ok) { U.say($('people-status'), 'bad', U.problem(res, 'Could not load the list of people.')); return; }
      (res.body.staff || []).forEach(function (p) {
        var name = p.display_name ? p.display_name + ' — ' + p.email : p.email;
        var li = h('li', {}, [h('span', {}, [h('strong', { text: p.role === 'rector' ? 'Rector' : 'Helper' }), ' ' + name + (p.is_you ? ' (you)' : '')])]);
        if (p.role === 'delegate') {
          li.appendChild(h('button', { type: 'button', class: 'small danger', text: 'Remove', 'aria-label': 'Remove ' + (p.display_name || p.email),
            on: { click: function () { removePerson(p); } } }));
        }
        ul.appendChild(li);
      });
    });
  }
  function removePerson(p) {
    U.confirmDialog({ title: 'Remove this helper?', message: (p.display_name || p.email) + ' will be signed out and lose access to your parish\'s prayer list.', confirmLabel: 'Remove', danger: true })
      .then(function (yes) {
        if (!yes) { return; }
        client.call('DELETE', '/staff/delegates/' + p.id).then(function (res) {
          if (res.ok) { U.say($('people-status'), 'ok', 'Removed.'); loadPeople(); }
          else { U.say($('people-status'), 'bad', U.problem(res, 'Could not remove that person.')); }
        });
      });
  }
  $('form-delegate').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var email = $('del-email').value.trim();
    if (!email) { U.say($('people-status'), 'bad', 'Please enter the helper\'s email address.'); return; }
    var body = { email: email };
    if ($('del-name').value.trim()) { body.display_name = $('del-name').value; }
    var btn = $('btn-add-delegate'); btn.disabled = true;
    client.call('POST', '/staff/delegates', body).then(function (res) {
      btn.disabled = false;
      if (res.status === 201) { $('del-email').value = ''; $('del-name').value = ''; U.say($('people-status'), 'ok', 'Added. They can sign in with their email address now.'); loadPeople(); }
      else if (res.status === 409 && res.body.error === 'limit_reached') { U.say($('people-status'), 'bad', 'A parish can have at most 5 helpers.'); }
      else if (res.status === 409) { U.say($('people-status'), 'bad', 'That address cannot be added. It may already be in use.'); }
      else { U.say($('people-status'), 'bad', U.problem(res, U.fieldMessage(res, 'Could not add that person.'))); }
    });
  });

  $('btn-leave').addEventListener('click', function () {
    U.confirmDialog({ title: 'Delete your membership?', message: 'You will lose access to this parish. The parish and its requests stay as they are.', confirmLabel: 'Delete my membership', danger: true })
      .then(function (yes) {
        if (!yes) { return; }
        client.call('DELETE', '/staff/me').then(function (res) {
          if (res.ok) { client.drop(); showSignin('Your membership has been deleted.'); }
          else if (res.status === 409) { U.say($('leave-status'), 'bad', 'You are the only rector, so you cannot leave yet. To close the parish instead, use "Delete parish and all data" below.'); }
          else { U.say($('leave-status'), 'bad', U.problem(res, 'Could not delete your membership.')); }
        });
      });
  });
  $('btn-delete-parish').addEventListener('click', function () {
    var phrase = 'DELETE ' + me.parish.slug;
    U.confirmDialog({ title: 'Delete the whole parish?', message: 'This permanently deletes your parish, every prayer request and every helper\'s access. It cannot be undone.',
      confirmLabel: 'Delete everything', danger: true, typeToConfirm: phrase }).then(function (yes) {
      if (!yes) { return; }
      client.call('DELETE', '/staff/parish', { confirm: phrase }).then(function (res) {
        if (res.ok) { client.drop(); showSignin('Your parish and all its data have been deleted.'); }
        else { U.say($('leave-status'), 'bad', U.problem(res, 'Could not delete the parish.')); }
      });
    });
  });

  // ---------- start ----------
  if (client.session()) { loadDashboard(); } else { show('signin'); }
})();
