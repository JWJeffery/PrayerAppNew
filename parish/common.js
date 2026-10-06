/* Shared helpers for the parish pages (rector dashboard, admin page).
 *
 * SAFETY RULE for everything in /parish/ (2026-09-30): text that came from anywhere else -- prayer
 * requests, parish names, people's names, emails -- is written ONLY with textContent /
 * createTextNode (through h() below). Never innerHTML, insertAdjacentHTML, document.write or
 * setAttribute('on...'). The Content-Security-Policy in parish/.htaccess also forbids inline script,
 * so even a slip could not run code -- but the rule is the first line of defence, not the CSP.
 * scripts/audit-parish-intentions.mjs fails the build if these files use any of those APIs.
 */
(function () {
  'use strict';
  var API = '/api/v1';

  /** Build an element. props: text, class, on:{event:fn}, value, other keys become attributes. */
  function h(tag, props, kids) {
    var e = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === false || v === null || v === undefined) { return; }
      if (k === 'text') { e.textContent = v; }
      else if (k === 'class') { e.className = v; }
      else if (k === 'on') { Object.keys(v).forEach(function (ev) { e.addEventListener(ev, v[ev]); }); }
      else if (k === 'value') { e.value = v; }
      else if (v === true) { e.setAttribute(k, ''); }
      else { e.setAttribute(k, String(v)); }
    });
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined) { return; }
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }

  function clear(node) { while (node.firstChild) { node.removeChild(node.firstChild); } }

  // Browser storage can be unavailable (private windows, blocked site data): never let it break the page.
  function storeGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function storeSet(key, val) { try { window.localStorage.setItem(key, val); return true; } catch (e) { return false; } }
  function storeDel(key) { try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ } }

  /**
   * API client bound to one storage key. The bearer token lives in localStorage under that key.
   * WHY localStorage and not a cookie (2026-09-30): the API is cookie-free by design (native-app
   * friendly, no CSRF surface); these pages are same-origin, under a strict CSP that forbids inline
   * script, and have an explicit Log out. The native app will use secure storage instead.
   */
  function createClient(storageKey, onUnauthorized) {
    function session() {
      var raw = storeGet(storageKey);
      if (!raw) { return null; }
      try {
        var s = JSON.parse(raw);
        if (s && typeof s.token === 'string' && /^[0-9a-f]{64}$/.test(s.token)) {
          if (s.expires_at && Date.parse(s.expires_at) <= Date.now()) { storeDel(storageKey); return null; }
          return s;
        }
      } catch (e) { /* fall through */ }
      storeDel(storageKey);
      return null;
    }
    function call(method, path, body) {
      var s = session();
      var headers = { 'Accept': 'application/json' };
      if (s) { headers['Authorization'] = 'Bearer ' + s.token; }
      var opts = { method: method, headers: headers, cache: 'no-store', credentials: 'omit' };
      if (body !== undefined && body !== null) { headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
      return fetch(API + path, opts).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          var res = { ok: r.ok, status: r.status, body: j || {}, retryAfter: parseInt(r.headers.get('Retry-After') || '0', 10) || 0 };
          if (r.status === 401 && s && path !== '/auth/verify-code') {
            storeDel(storageKey);
            if (onUnauthorized) { onUnauthorized(); }
          }
          return res;
        });
      }).catch(function () { return { ok: false, status: 0, body: {}, retryAfter: 0 }; });
    }
    return {
      call: call,
      session: session,
      save: function (token, expiresAt) { storeSet(storageKey, JSON.stringify({ token: token, expires_at: expiresAt })); },
      drop: function () { storeDel(storageKey); }
    };
  }

  /** Plain-language message for a failed API result. */
  function problem(res, fallback) {
    if (res.status === 0) { return 'Could not reach the server. Check your connection and try again.'; }
    if (res.status === 429) { return 'Too many attempts. Please wait a little while and try again.'; }
    if (res.status >= 500) { return 'Something went wrong on our side. Please try again in a moment.'; }
    return fallback;
  }

  /** First field-level message from a 422, else the fallback. */
  function fieldMessage(res, fallback) {
    var f = res.body && res.body.fields;
    if (f && typeof f === 'object') {
      var k = Object.keys(f)[0];
      if (k && typeof f[k] === 'string') { return f[k]; }
    }
    return (res.body && typeof res.body.message === 'string' && res.status !== 422) ? res.body.message : fallback;
  }

  /** Show a status message in an element (role=status region). kind: 'ok' | 'bad' | '' */
  function say(node, kind, text) {
    node.className = 'status' + (kind ? ' ' + kind : '');
    node.textContent = text;
    node.hidden = !text;
  }

  var MS_DAY = 86400000;
  function daysUntil(iso) { return Math.ceil((Date.parse(iso) - Date.now()) / MS_DAY); }
  function fmtDate(iso) {
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /**
   * Modal confirmation built on <dialog>. Resolves true/false. If typeToConfirm is given, the
   * confirm button stays disabled until that exact text is typed (used for irreversible deletes).
   */
  function confirmDialog(opts) {
    return new Promise(function (resolve) {
      var dlg = h('dialog', { class: 'dlg', 'aria-labelledby': 'dlg-title' });
      var input = null;
      var ok = h('button', { type: 'button', class: opts.danger ? 'danger' : 'primary', text: opts.confirmLabel || 'Confirm' });
      var cancel = h('button', { type: 'button', text: 'Cancel' });
      var body = [h('h2', { id: 'dlg-title', text: opts.title }), h('p', { text: opts.message })];
      if (opts.typeToConfirm) {
        input = h('input', { type: 'text', autocomplete: 'off', 'aria-label': 'Type ' + opts.typeToConfirm + ' to confirm', spellcheck: 'false' });
        body.push(h('p', { class: 'muted' }, ['Type ', h('strong', { text: opts.typeToConfirm }), ' to confirm:']), input);
        ok.disabled = true;
        input.addEventListener('input', function () { ok.disabled = input.value !== opts.typeToConfirm; });
      }
      body.push(h('div', { class: 'row end' }, [cancel, ok]));
      body.forEach(function (n) { dlg.appendChild(n); });
      var settled = false;
      function done(v) { if (settled) { return; } settled = true; try { dlg.close(); } catch (e) { /* ignore */ } if (dlg.parentNode) { dlg.parentNode.removeChild(dlg); } resolve(v); }
      ok.addEventListener('click', function () { done(true); });
      cancel.addEventListener('click', function () { done(false); });
      dlg.addEventListener('cancel', function (ev) { ev.preventDefault(); done(false); });
      document.body.appendChild(dlg);
      if (typeof dlg.showModal === 'function') { dlg.showModal(); } else { dlg.setAttribute('open', ''); }
      (input || cancel).focus();
    });
  }

  window.UO = { h: h, clear: clear, createClient: createClient, problem: problem, fieldMessage: fieldMessage, say: say,
                daysUntil: daysUntil, fmtDate: fmtDate, confirmDialog: confirmDialog, storeGet: storeGet, storeSet: storeSet, storeDel: storeDel };
})();
