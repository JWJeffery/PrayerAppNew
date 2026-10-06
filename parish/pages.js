/* Rector dashboard, "Parish page" tab: the parish's details, announcements and coming events.
 * Talks to /api/v1/staff/parish/profile, /staff/announcements and /staff/events (api/openapi.yaml).
 * Loaded before parish.js, which calls UOPages.load(client, me) when the tab is opened.
 *
 * Same safety rule as the rest of /parish/ (see common.js): text from the server is written with
 * textContent through UO.h() only. */
(function () {
  'use strict';
  var U = window.UO, h = U.h;
  function $(id) { return document.getElementById(id); }
  var client = null, me = null, bound = false;
  var MAX_ANN = 300;

  function lines(text) { return text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean); }

  // ---------- parish details ----------
  function loadProfile() {
    var isRector = me.staff.role === 'rector';
    ['prof-rector', 'prof-address', 'prof-website', 'prof-times'].forEach(function (id) { $(id).disabled = !isRector; });
    $('btn-save-profile').hidden = !isRector;
    $('profile-readonly-note').hidden = isRector;
    $('pages-public-link').setAttribute('href', 'home.html?p=' + encodeURIComponent(me.parish.slug));
    client.call('GET', '/staff/parish/profile').then(function (res) {
      if (!res.ok) { if (res.status !== 401) { U.say($('profile-status'), 'bad', U.problem(res, 'Could not load your parish details.')); } return; }
      var p = res.body.profile || {};
      $('prof-rector').value = p.rector_name || '';
      $('prof-address').value = p.address || '';
      $('prof-website').value = p.website || '';
      $('prof-times').value = (p.service_times || []).join('\n');
    });
  }

  function saveProfile(ev) {
    ev.preventDefault();
    var body = { rector_name: $('prof-rector').value, address: $('prof-address').value,
                 website: $('prof-website').value.trim(), service_times: lines($('prof-times').value) };
    var btn = $('btn-save-profile'); btn.disabled = true;
    client.call('PUT', '/staff/parish/profile', body).then(function (res) {
      btn.disabled = false;
      if (res.ok) { U.say($('profile-status'), 'ok', 'Saved. Readers see the change the next time they open your page.'); loadProfile(); }
      else { U.say($('profile-status'), 'bad', U.problem(res, U.fieldMessage(res, 'Could not save. Please check the details.'))); }
    });
  }

  // ---------- announcements ----------
  function annBadge(a) {
    var d = U.daysUntil(a.expires_at), when = U.fmtDate(a.expires_at);
    if (a.expired) { return h('span', { class: 'badge gone', text: 'Expired (' + when + ')' }); }
    var label = d <= 0 ? 'Shows until today' : 'Shows for ' + d + (d === 1 ? ' more day' : ' more days');
    return h('span', { class: 'badge' + (d <= 1 ? ' soon' : ''), text: label + ' (until ' + when + ')' });
  }

  function annNode(a) {
    var li = h('li', { class: 'item' + (a.expired ? ' expired' : '') });
    li.appendChild(h('div', { class: 'item-head' }, [annBadge(a)]));
    li.appendChild(h('p', { class: 'item-text', text: a.text }));
    var actions = h('div', { class: 'item-actions' }, [h('span', { class: 'label', text: 'Extend by:' })]);
    [3, 7, 21].forEach(function (days) {
      actions.appendChild(h('button', { type: 'button', class: 'small', text: days + ' days', 'aria-label': 'Extend by ' + days + ' days',
        on: { click: function () {
          client.call('POST', '/staff/announcements/' + a.id + '/extend', { days: days }).then(function (res) {
            if (res.ok) { U.say($('announce-status'), 'ok', 'Extended by ' + days + ' days.'); loadAnnouncements(); }
            else { U.say($('announce-status'), 'bad', U.problem(res, 'Could not extend that announcement.')); }
          });
        } } }));
    });
    actions.appendChild(h('button', { type: 'button', class: 'small danger', text: 'Remove', on: { click: function () {
      U.confirmDialog({ title: 'Remove this announcement?', message: 'It disappears from your parish page right away.', confirmLabel: 'Remove', danger: true })
        .then(function (yes) {
          if (!yes) { return; }
          client.call('DELETE', '/staff/announcements/' + a.id).then(function (res) {
            if (res.ok) { U.say($('announce-status'), 'ok', 'Removed.'); loadAnnouncements(); }
            else { U.say($('announce-status'), 'bad', U.problem(res, 'Could not remove that announcement.')); }
          });
        });
    } } }));
    li.appendChild(actions);
    return li;
  }

  function loadAnnouncements() {
    client.call('GET', '/staff/announcements').then(function (res) {
      if (!res.ok) { if (res.status !== 401) { U.say($('announce-status'), 'bad', U.problem(res, 'Could not load announcements.')); } return; }
      var list = res.body.announcements || [];
      U.clear($('list-announce'));
      list.forEach(function (a) { $('list-announce').appendChild(annNode(a)); });
      $('empty-announce').hidden = list.length > 0;
    });
  }

  function addAnnouncement(ev) {
    ev.preventDefault();
    var text = $('ann-text').value, daysRaw = $('ann-days').value.trim();
    var days = daysRaw === '' ? 7 : Number(daysRaw);
    if (!text.trim()) { U.say($('announce-status'), 'bad', 'Please write the announcement first.'); return; }
    if (!Number.isInteger(days) || days < 1 || days > 45) { U.say($('announce-status'), 'bad', 'Days must be a whole number from 1 to 45.'); return; }
    var btn = $('btn-add-announce'); btn.disabled = true;
    client.call('POST', '/staff/announcements', { text: text, days: days }).then(function (res) {
      btn.disabled = false;
      if (res.status === 201) {
        $('ann-text').value = ''; updateAnnCounter();
        U.say($('announce-status'), 'ok', 'Posted. It will show for ' + days + ' days.');
        loadAnnouncements();
      } else if (res.status === 409) {
        U.say($('announce-status'), 'bad', 'Five announcements are already showing. Remove one first.');
      } else {
        U.say($('announce-status'), 'bad', U.problem(res, U.fieldMessage(res, 'Could not post that announcement.')));
      }
    });
  }

  function updateAnnCounter() {
    var n = Array.from($('ann-text').value).length;
    $('ann-counter').textContent = n + ' / ' + MAX_ANN;
    $('ann-counter').className = 'counter' + (n >= MAX_ANN - 30 ? ' warn' : '');
  }

  // ---------- events ----------
  function eventWhen(e) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e.date);
    if (!m) { return e.date; }
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    var out = d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    var t = /^(\d{2}):(\d{2})$/.exec(e.time || '');
    if (t) { out += ', ' + new Date(2000, 0, 1, Number(t[1]), Number(t[2])).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
    return out;
  }

  function eventNode(e) {
    var li = h('li', { class: 'item' });
    li.appendChild(h('div', { class: 'item-head' }, [h('strong', { text: e.title }), h('span', { class: 'badge', text: eventWhen(e) })]));
    if (e.note) { li.appendChild(h('p', { class: 'item-text', text: e.note })); }
    li.appendChild(h('div', { class: 'item-actions' }, [
      h('button', { type: 'button', class: 'small', text: 'Edit', on: { click: function () { editEvent(li, e); } } }),
      h('button', { type: 'button', class: 'small danger', text: 'Remove', on: { click: function () {
        U.confirmDialog({ title: 'Remove this event?', message: 'It disappears from your parish page right away.', confirmLabel: 'Remove', danger: true })
          .then(function (yes) {
            if (!yes) { return; }
            client.call('DELETE', '/staff/events/' + e.id).then(function (res) {
              if (res.ok) { U.say($('event-status'), 'ok', 'Removed.'); loadEvents(); }
              else { U.say($('event-status'), 'bad', U.problem(res, 'Could not remove that event.')); }
            });
          });
      } } })
    ]));
    return li;
  }

  function editEvent(li, e) {
    U.clear(li);
    var title = h('input', { type: 'text', maxlength: '120', 'aria-label': 'What is happening' }); title.value = e.title;
    var date = h('input', { type: 'date', 'aria-label': 'Date' }); date.value = e.date;
    var time = h('input', { type: 'time', 'aria-label': 'Time (optional)' }); time.value = e.time || '';
    var note = h('input', { type: 'text', maxlength: '200', 'aria-label': 'A line of detail (optional)' }); note.value = e.note || '';
    var status = h('p', { class: 'status', role: 'status', hidden: true });
    var save = h('button', { type: 'button', class: 'primary small', text: 'Save' });
    save.addEventListener('click', function () {
      save.disabled = true;
      client.call('PATCH', '/staff/events/' + e.id, { title: title.value, date: date.value, time: time.value || null, note: note.value || null }).then(function (res) {
        save.disabled = false;
        if (res.ok) { U.say($('event-status'), 'ok', 'Saved.'); loadEvents(); }
        else { U.say(status, 'bad', U.problem(res, U.fieldMessage(res, 'Could not save.'))); }
      });
    });
    [h('label', { text: 'What is happening' }), title, h('label', { text: 'Date' }), date, h('label', { text: 'Time (optional)' }), time,
     h('label', { text: 'A line of detail (optional)' }), note,
     h('div', { class: 'row' }, [save, h('button', { type: 'button', class: 'small', text: 'Cancel', on: { click: loadEvents } })]), status]
      .forEach(function (n) { li.appendChild(n); });
    title.focus();
  }

  function loadEvents() {
    client.call('GET', '/staff/events').then(function (res) {
      if (!res.ok) { if (res.status !== 401) { U.say($('event-status'), 'bad', U.problem(res, 'Could not load events.')); } return; }
      var list = res.body.events || [];
      U.clear($('list-events'));
      list.forEach(function (e) { $('list-events').appendChild(eventNode(e)); });
      $('empty-events').hidden = list.length > 0;
    });
  }

  function addEvent(ev) {
    ev.preventDefault();
    var body = { title: $('ev-title').value, date: $('ev-date').value, time: $('ev-time').value || null, note: $('ev-note').value || null };
    if (!body.title.trim() || !body.date) { U.say($('event-status'), 'bad', 'Please give the event a name and a date.'); return; }
    var btn = $('btn-add-event'); btn.disabled = true;
    client.call('POST', '/staff/events', body).then(function (res) {
      btn.disabled = false;
      if (res.status === 201) {
        ['ev-title', 'ev-date', 'ev-time', 'ev-note'].forEach(function (id) { $(id).value = ''; });
        U.say($('event-status'), 'ok', 'Added.');
        loadEvents();
      } else if (res.status === 409) {
        U.say($('event-status'), 'bad', 'Your parish already has 60 coming events. Remove some first.');
      } else {
        U.say($('event-status'), 'bad', U.problem(res, U.fieldMessage(res, 'Could not add that event.')));
      }
    });
  }

  window.UOPages = {
    load: function (c, who) {
      client = c; me = who;
      if (!bound) {
        bound = true;
        $('form-profile').addEventListener('submit', saveProfile);
        $('form-announce').addEventListener('submit', addAnnouncement);
        $('ann-text').addEventListener('input', updateAnnCounter);
        $('form-event').addEventListener('submit', addEvent);
        updateAnnCounter();
      }
      loadProfile(); loadAnnouncements(); loadEvents();
    }
  };
})();
