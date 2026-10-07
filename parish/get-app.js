/* Shows the "Get the app" link in a parish page's header, only to someone on a phone or tablet who has not
 * installed the app. The link opens the app, which then shows the install steps for that device
 * (js/install-prompt.js, entry point ?install=1). No text from anywhere else is written into the page. */
(function () {
  'use strict';
  var link = document.getElementById('get-app-link');
  if (!link) { return; }
  var ua = navigator.userAgent || '';
  var phone = /iPhone|iPad|iPod|Android/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var installed = false;
  try { installed = !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; } catch (e) { /* ignore */ }
  if (phone && !installed) { link.hidden = false; }
})();
