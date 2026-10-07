/**
 * "Install this app" invitation (2026-10-07).
 *
 * A small, dismissible banner on every screen of the app, shown only to people on a phone or tablet who
 * are using the website in a browser and have not installed it. It shows the right instructions for their
 * device:
 *   - iPhone / iPad: Apple gives websites no install button, so it shows the Share -> "Add to Home Screen" steps.
 *   - Android: when the browser offers its own install prompt (Chrome and most others), an Install button
 *     opens it; otherwise the menu steps are shown.
 * It never appears on the first visit (second visit onward, a few seconds after load, so it cannot cover the
 * prayers someone came to read), "Not now" hides it for 3 weeks, "Don't show again" hides it for good, and
 * it stays hidden once the app is installed (running installed, or the browser reports an install).
 * A permanent "Install this app" section in the profile panel (#install-section) always shows the steps,
 * including on computers, whatever was dismissed.
 *
 * Safety rule (same as the rest of the app and the parish pages): text goes in with textContent only; no
 * innerHTML, no inline styles or handlers (styling is css/install-prompt.css). Storage can be unavailable
 * (private windows): every read and write is wrapped, and the banner simply shows less often.
 */
(function () {
  'use strict';

  var KEYS = { visits: 'uoInstall.visits', snooze: 'uoInstall.snoozeUntil', never: 'uoInstall.never', installed: 'uoInstall.installed' };
  var SNOOZE_MS = 21 * 24 * 60 * 60 * 1000;
  var SHOW_DELAY_MS = 6000;       // after load, so the banner never covers the first thing someone reads
  var ANDROID_WAIT_MS = 4000;     // how long to wait for the browser's own install offer before showing the menu steps
  var MIN_VISITS = 2;

  function get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function set(key, val) { try { window.localStorage.setItem(key, val); } catch (e) { /* ignore */ } }

  // ---- What device and browser is this? -------------------------------------------------------------------
  var ua = (navigator.userAgent || '');
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);   // iPadOS reports itself as a Mac
  var isAndroid = /Android/.test(ua);
  var isMobile = isIOS || isAndroid;
  var isSafariOnIOS = isIOS && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);

  function isInstalled() {
    try { if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) { return true; } } catch (e) { /* ignore */ }
    if (window.navigator.standalone === true) { return true; }   // iOS home-screen app
    return get(KEYS.installed) === '1';
  }

  // ---- The browser's own install offer (Chrome, Edge, Samsung Internet and most Android browsers) ----------
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (ev) {
    ev.preventDefault();     // keep it for our own button
    deferred = ev;
    refresh();
  });
  window.addEventListener('appinstalled', function () {
    set(KEYS.installed, '1');
    deferred = null;
    removeBanner();
    refresh();
  });

  function askBrowserToInstall() {
    if (!deferred) { return Promise.resolve(false); }
    var offer = deferred;
    deferred = null;          // an offer can be used once
    try {
      offer.prompt();
      return Promise.resolve(offer.userChoice).then(function (c) { return !!c && c.outcome === 'accepted'; }, function () { return false; });
    } catch (e) { return Promise.resolve(false); }
  }

  // ---- Tiny DOM helpers (textContent only) -----------------------------------------------------------------
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text !== undefined && text !== null) { e.textContent = text; }
    return e;
  }
  function button(label, cls, onClick) {
    var b = el('button', cls, label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  /** The Share icon (a square with an arrow rising from it), drawn so the steps can point at the real thing. */
  function shareIcon() {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', '18'); svg.setAttribute('height', '18');
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'uo-install-share');
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1');
    path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2'); path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    return svg;
  }

  /** The steps for this device, as a list element. */
  function stepsFor(kind) {
    var ol = el('ol', 'uo-install-steps');
    var li;
    if (kind === 'ios') {
      li = el('li'); li.appendChild(document.createTextNode('Tap the Share button ')); li.appendChild(shareIcon());
      li.appendChild(document.createTextNode(' in your browser (at the bottom of an iPhone screen, the top of an iPad).')); ol.appendChild(li);
      ol.appendChild(el('li', null, 'Scroll down and tap “Add to Home Screen”.'));
      ol.appendChild(el('li', null, 'Tap “Add”. The app is now on your home screen.'));
    } else if (kind === 'android') {
      ol.appendChild(el('li', null, 'Open your browser’s menu (the three dots ⋮).'));
      ol.appendChild(el('li', null, 'Tap “Install app” or “Add to Home screen”.'));
      ol.appendChild(el('li', null, 'Tap “Install”. The app is now on your home screen.'));
    } else {
      ol.appendChild(el('li', null, 'In Chrome or Edge, click the install icon at the right end of the address bar, or open the browser menu and choose “Install The Universal Office”.'));
      ol.appendChild(el('li', null, 'In Safari on a Mac, choose File → “Add to Dock”.'));
      ol.appendChild(el('li', null, 'In Firefox, there is no install option; the website works the same without it.'));
    }
    return ol;
  }

  function kindNow() { return isIOS ? 'ios' : (isAndroid ? 'android' : 'desktop'); }
  function iosHint() {
    return isIOS && !isSafariOnIOS ? el('p', 'uo-install-hint', 'Not seeing “Add to Home Screen”? Open this page in Safari and try again.') : null;
  }

  // ---- The banner ----------------------------------------------------------------------------------------
  var banner = null;
  function removeBanner() { if (banner && banner.parentNode) { banner.parentNode.removeChild(banner); } banner = null; }

  function dismiss(forever) {
    if (forever) { set(KEYS.never, '1'); } else { set(KEYS.snooze, String(Date.now() + SNOOZE_MS)); }
    removeBanner();
  }

  function buildBanner() {
    var box = el('div', 'uo-install-banner');
    box.id = 'uo-install-banner';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', 'Install The Universal Office');
    var title = el('p', 'uo-install-title', 'Install The Universal Office');
    var lede = el('p', 'uo-install-lede', 'Keep it on your home screen, one tap away, like any other app.');
    box.appendChild(title); box.appendChild(lede);

    var actions = el('div', 'uo-install-actions');
    if (deferred) {
      actions.appendChild(button('Install', 'uo-install-primary', function () {
        askBrowserToInstall().then(function (accepted) { if (accepted) { removeBanner(); } else { dismiss(false); } });
      }));
    } else {
      box.appendChild(stepsFor(kindNow()));
      var hint = iosHint(); if (hint) { box.appendChild(hint); }
    }
    actions.appendChild(button('Not now', 'uo-install-secondary', function () { dismiss(false); }));
    actions.appendChild(button('Don’t show again', 'uo-install-link', function () { dismiss(true); }));
    box.appendChild(actions);
    return box;
  }

  // Arriving from a "Get the app" link (?install=1, e.g. on a parish page): show the steps straight away,
  // once, whatever was dismissed before. The marker is removed from the address so it never sticks.
  var asked = false;
  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get('install') === '1') {
      asked = true;
      params.delete('install');
      var qs = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    }
  } catch (e) { /* ignore */ }

  function eligible() {
    if (!isMobile || isInstalled()) { return false; }
    if (asked) { return true; }
    if (get(KEYS.never) === '1') { return false; }
    var until = Number(get(KEYS.snooze) || 0);
    if (until && Date.now() < until) { return false; }
    return (parseInt(get(KEYS.visits) || '0', 10) || 0) >= MIN_VISITS;
  }

  function showBanner() {
    if (banner || !eligible() || !document.body) { return; }
    banner = buildBanner();
    document.body.appendChild(banner);
  }

  // ---- The permanent section in the profile panel --------------------------------------------------------
  function drawSection() {
    var host = document.getElementById('install-section');
    if (!host) { return; }
    while (host.firstChild) { host.removeChild(host.firstChild); }
    host.appendChild(el('p', 'uo-install-section-title', 'Install this app'));
    if (isInstalled()) {
      host.appendChild(el('p', 'uo-install-lede', 'This device already has The Universal Office installed.'));
      return;
    }
    host.appendChild(el('p', 'uo-install-lede', 'Keep it on your home screen or desktop, one tap away, like any other app.'));
    if (deferred) {
      host.appendChild(button('Install', 'uo-install-primary', function () { askBrowserToInstall().then(refresh); }));
      return;
    }
    host.appendChild(stepsFor(kindNow()));
    var hint = iosHint(); if (hint) { host.appendChild(hint); }
  }

  function refresh() {
    drawSection();
    if (banner) {            // the browser's offer may have arrived after the banner was drawn with menu steps
      removeBanner();
      showBanner();
    }
  }

  // ---- Start -----------------------------------------------------------------------------------------------
  function start() {
    // One visit per browser session, however many pages or reloads.
    try {
      if (!window.sessionStorage.getItem('uoInstall.counted')) {
        window.sessionStorage.setItem('uoInstall.counted', '1');
        set(KEYS.visits, String((parseInt(get(KEYS.visits) || '0', 10) || 0) + 1));
      }
    } catch (e) { /* storage unavailable: the banner then waits for a visit it can count */ }
    drawSection();
    if (asked) {
      // Asked for (a "Get the app" link): no waiting, apart from a moment for an Android browser's own offer.
      window.setTimeout(showBanner, isAndroid && !deferred ? 1500 : 300);
      return;
    }
    window.setTimeout(function () {
      if (isAndroid && !deferred) {
        // Give the browser a moment to offer its own install; if it does not, show the menu steps instead.
        window.setTimeout(showBanner, ANDROID_WAIT_MS);
      } else {
        showBanner();
      }
    }, SHOW_DELAY_MS);
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); } else { start(); }

  // Exposed for the tests and for any future "Install" link elsewhere in the app.
  window.UOInstall = { refresh: refresh, isInstalled: isInstalled, _state: function () { return { visits: get(KEYS.visits), never: get(KEYS.never), snooze: get(KEYS.snooze), hasOffer: !!deferred }; } };
})();
