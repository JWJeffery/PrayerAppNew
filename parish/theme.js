/* Light / dark for the parish pages. Follows the same stored choice as the app's own Auto / Light / Dark
 * control (localStorage 'universalOfficeShellTheme'), and shows the same three-way control in the top bar.
 * "Auto" on these pages means the device's own light or dark setting.
 *
 * Loaded in <head> so the theme is set before the page paints. Storage can be blocked: every access is
 * wrapped, and the page then simply follows the device. */
(function () {
  'use strict';
  var KEY = 'universalOfficeShellTheme';
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  var chosen = null;   // the choice made on this page, kept in case storage is blocked
  function stored() {
    if (chosen) { return chosen; }
    try { var v = window.localStorage.getItem(KEY); return (v === 'light' || v === 'dark') ? v : 'auto'; }
    catch (e) { return 'auto'; }
  }
  function resolve(pref) {
    if (pref !== 'auto') { return pref; }
    return (media && media.matches) ? 'light' : 'dark';
  }
  function apply() {
    var pref = stored();
    root.setAttribute('data-theme', resolve(pref));
    var group = document.querySelector('.theme-control');
    if (group) {
      Array.prototype.forEach.call(group.querySelectorAll('button[data-theme-choice]'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-choice') === pref));
      });
    }
  }
  function choose(pref) {
    chosen = pref;
    try {
      if (pref === 'auto') { window.localStorage.removeItem(KEY); } else { window.localStorage.setItem(KEY, pref); }
    } catch (e) { /* the choice just lasts for this page */ }
    apply();
  }

  apply();
  if (media) {
    var again = function () { if (stored() === 'auto') { apply(); } };
    if (media.addEventListener) { media.addEventListener('change', again); }
    else if (media.addListener) { media.addListener(again); }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('.topbar nav');
    if (!nav || nav.querySelector('.theme-control')) { return; }
    var group = document.createElement('div');
    group.className = 'theme-control';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Appearance');
    [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].forEach(function (pair) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'theme-btn';
      b.textContent = pair[1];
      b.setAttribute('data-theme-choice', pair[0]);
      b.addEventListener('click', function () { choose(pair[0]); });
      group.appendChild(b);
    });
    nav.insertBefore(group, nav.firstChild);
    apply();
  });
})();
