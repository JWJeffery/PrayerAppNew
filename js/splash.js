/**
 * Opening screen: "The Universal Office" (markup #uo-splash at the top of <body>, styling css/splash.css). It
 * plays for about five seconds, then shows "Tap to continue" and waits: it never moves on by itself. A tap,
 * Enter, Space or Escape moves past it at any time. Shown once per browser session, so reloading a page or
 * coming back to the tab does not replay it; an installed app shows it each time it is launched. People who ask
 * their device for reduced motion get a still version.
 * Skipped in automated browsers (navigator.webdriver) so tests are not held up; add ?splash=force to the
 * address to see it anyway.
 */
(function () {
  'use strict';
  var el = document.getElementById('uo-splash');
  if (!el) { return; }
  var FADE_MS = 600;

  function remove() {
    document.documentElement.classList.remove('uo-splash-on');
    if (el.parentNode) { el.parentNode.removeChild(el); }
  }

  var forced = /[?&]splash=force(&|$)/.test(window.location.search);
  var already = false;
  try { already = window.sessionStorage.getItem('uoSplashShown') === '1'; } catch (e) { /* storage blocked: show it */ }
  if (!forced && (window.navigator.webdriver || already)) { remove(); return; }
  try { window.sessionStorage.setItem('uoSplashShown', '1'); } catch (e) { /* ignore */ }

  document.documentElement.classList.add('uo-splash-on');
  try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ }

  var finished = false;
  function finish() {
    if (finished) { return; }
    finished = true;
    el.classList.add('uo-splash-out');
    window.setTimeout(remove, FADE_MS + 60);
  }
  el.addEventListener('click', finish);
  el.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Escape') { ev.preventDefault(); finish(); }
  });
})();
