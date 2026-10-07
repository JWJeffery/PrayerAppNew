/**
 * The Universal Office -- optional accounts, shared client core (2026-10-07).
 * Used by the app (js/account-ui.js) and by the parish pages (parish/account-panel.js). Plain script, no
 * modules, one global: window.UOAccount.
 *
 * What it does: talks to /api/v1 for sign-in by emailed code, by password and by passkey, for adding or
 * removing a password or passkey, for re-confirming with an emailed code, and for a reader's saved settings.
 * It keeps a bearer token in localStorage under a key the host chooses, and NOTHING else: no password is ever
 * stored, logged or kept after the request.
 *
 * Safety rule (same as the parish pages): this file never writes text into a page. It returns data; the
 * hosts place it with textContent. Every call resolves to { ok, status, body } and never throws.
 */
(function () {
  'use strict';
  var API = '/api/v1';

  function storeGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function storeSet(key, val) { try { window.localStorage.setItem(key, val); return true; } catch (e) { return false; } }
  function storeDel(key) { try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ } }

  function b64uToBytes(s) {
    var b = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) { b += '='; }
    var bin = atob(b), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) { out[i] = bin.charCodeAt(i); }
    return out;
  }
  function bytesToB64u(buf) {
    var bytes = new Uint8Array(buf), bin = '';
    for (var i = 0; i < bytes.length; i++) { bin += String.fromCharCode(bytes[i]); }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /** True when this browser can do passkeys. */
  function passkeysSupported() {
    return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create && navigator.credentials.get);
  }

  /** The options the server sends for navigator.credentials.create / get, with its base64url fields made binary. */
  function toCreateOptions(pk) {
    var o = JSON.parse(JSON.stringify(pk));
    o.challenge = b64uToBytes(pk.challenge);
    o.user = { id: b64uToBytes(pk.user.id), name: pk.user.name, displayName: pk.user.displayName };
    o.excludeCredentials = (pk.excludeCredentials || []).map(function (c) { return { type: c.type, id: b64uToBytes(c.id), transports: c.transports }; });
    return o;
  }
  function toGetOptions(pk) {
    var o = JSON.parse(JSON.stringify(pk));
    o.challenge = b64uToBytes(pk.challenge);
    if (pk.allowCredentials) { o.allowCredentials = pk.allowCredentials.map(function (c) { return { type: c.type, id: b64uToBytes(c.id), transports: c.transports }; }); }
    return o;
  }

  /**
   * @param {string} storageKey  where this host keeps its token (the app and each parish page keep their own)
   * @param {function} [onSignedOut]  called when the server says the saved sign-in has ended
   */
  function create(storageKey, onSignedOut) {
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
    function save(token, expiresAt) { storeSet(storageKey, JSON.stringify({ token: token, expires_at: expiresAt })); }
    function drop() { storeDel(storageKey); }

    function call(method, path, body, noAuth) {
      var s = noAuth ? null : session();
      var headers = { 'Accept': 'application/json' };
      if (s) { headers['Authorization'] = 'Bearer ' + s.token; }
      var opts = { method: method, headers: headers, cache: 'no-store', credentials: 'omit' };
      if (body !== undefined && body !== null) { headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
      return fetch(API + path, opts).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          var res = { ok: r.ok, status: r.status, body: j || {} };
          if (r.status === 401 && s && !noAuth) { drop(); if (onSignedOut) { onSignedOut(); } }
          return res;
        });
      }).catch(function () { return { ok: false, status: 0, body: {} }; });
    }

    /** After any successful sign-in: keep the token. */
    function keep(res) {
      if (res && res.ok && res.body && typeof res.body.token === 'string') { save(res.body.token, res.body.expires_at); }
      return res;
    }

    /** Run a passkey ceremony, turning the browser's refusals into a plain result. */
    function ceremony(fn) {
      if (!passkeysSupported()) { return Promise.resolve({ ok: false, status: 0, body: { error: 'unsupported' } }); }
      return fn().catch(function (e) {
        var cancelled = e && (e.name === 'NotAllowedError' || e.name === 'AbortError');
        return { ok: false, status: 0, body: { error: cancelled ? 'cancelled' : 'failed' } };
      });
    }

    return {
      session: session, save: save, drop: drop, call: call,

      // -- reader sign-in by emailed code
      readerRequestCode: function (email) { return call('POST', '/reader/request-code', { email: email }, true); },
      readerVerifyCode: function (email, code) { return call('POST', '/reader/verify-code', { email: email, code: code }, true).then(keep); },

      // -- password sign-in (as: 'reader' | 'staff' | 'admin')
      passwordLogin: function (email, password, as) { return call('POST', '/auth/password-login', { email: email, password: password, as: as }, true).then(keep); },

      // -- passkey sign-in, no address needed
      passkeyLogin: function (as) {
        return ceremony(function () {
          return call('POST', '/passkey/login/options', {}, true).then(function (opt) {
            if (!opt.ok) { return opt; }
            return navigator.credentials.get({ publicKey: toGetOptions(opt.body.publicKey) }).then(function (cred) {
              var r = cred.response;
              return call('POST', '/passkey/login', {
                token: opt.body.token, as: as, id: bytesToB64u(cred.rawId), clientDataJSON: bytesToB64u(r.clientDataJSON),
                authenticatorData: bytesToB64u(r.authenticatorData), signature: bytesToB64u(r.signature)
              }, true).then(keep);
            });
          });
        });
      },

      me: function () { return call('GET', '/me'); },
      logout: function () { return call('POST', '/auth/logout', {}).then(function (r) { drop(); return r; }); },

      // -- confirming it is you with an emailed code (needed when a sign-in is not recent)
      reauthRequestCode: function () { return call('POST', '/account/reauth/request-code', {}); },
      reauth: function (code) { return call('POST', '/account/reauth', { code: code }); },

      // -- password (currentPassword is optional: a recent sign-in is enough)
      setPassword: function (password, currentPassword) {
        var b = { password: password }; if (currentPassword) { b.current_password = currentPassword; }
        return call('POST', '/account/password', b);
      },
      removePassword: function (currentPassword) { return call('DELETE', '/account/password', currentPassword ? { current_password: currentPassword } : {}); },

      // -- passkeys
      listPasskeys: function () { return call('GET', '/account/passkeys'); },
      addPasskey: function (label, currentPassword) {
        var extra = currentPassword ? { current_password: currentPassword } : {};
        return ceremony(function () {
          return call('POST', '/account/passkeys/options', extra).then(function (opt) {
            if (!opt.ok) { return opt; }
            return navigator.credentials.create({ publicKey: toCreateOptions(opt.body.publicKey) }).then(function (cred) {
              var r = cred.response, b = { token: opt.body.token, clientDataJSON: bytesToB64u(r.clientDataJSON), attestationObject: bytesToB64u(r.attestationObject), label: label || null };
              if (currentPassword) { b.current_password = currentPassword; }
              return call('POST', '/account/passkeys', b);
            });
          });
        });
      },
      removePasskey: function (id, currentPassword) { return call('DELETE', '/account/passkeys/' + encodeURIComponent(id), currentPassword ? { current_password: currentPassword } : {}); },

      // -- a reader's saved settings, and deleting the account
      getProfile: function () { return call('GET', '/reader/profile'); },
      putProfile: function (profile) { return call('PUT', '/reader/profile', { profile: profile }); },
      deleteAccount: function (currentPassword) { return call('DELETE', '/account', currentPassword ? { current_password: currentPassword } : {}); }
    };
  }

  window.UOAccount = { create: create, passkeysSupported: passkeysSupported };
})();
