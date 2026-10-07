/**
 * Opening screen: "The Universal Office" for five seconds (markup #uo-splash at the top of <body>, styling
 * css/splash.css). Shown once per browser session, so reloading a page or coming back to the tab does not
 * replay it; an installed app shows it each time it is launched. A tap, Enter, Space or Escape moves past it
 * early (never trapping anyone), and people who ask their device for reduced motion get a still version.
 * Skipped in automated browsers (navigator.webdriver) so tests are not held up; add ?splash=force to the
 * address to see it anyway.
 */
(function () {
  'use strict';
  var el = document.getElementById('uo-splash');
  if (!el) { return; }
  var SHOW_MS = 5000, FADE_MS = 600;

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

  var finished = false, timer = null;
  function finish() {
    if (finished) { return; }
    finished = true;
    if (timer) { window.clearTimeout(timer); }
    el.classList.add('uo-splash-out');
    window.setTimeout(remove, FADE_MS + 60);
  }
  timer = window.setTimeout(finish, SHOW_MS);
  el.addEventListener('click', finish);
  el.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Escape') { ev.preventDefault(); finish(); }
  });
})();
