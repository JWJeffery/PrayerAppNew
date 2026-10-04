/**
 * Service worker registration and the "update available" prompt.
 *
 * A new release is downloaded in the background and then waits (so a page never mixes old and new
 * files). When it is ready, a small notice offers to switch now; "Later" leaves it for the next time
 * the app is opened. Does nothing in development, where there is no sw.js.
 */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator) || !(location.protocol === 'https:' || location.hostname === 'localhost')) return;

  var reloading = false;
  var shown = false;

  function showPrompt(worker) {
    if (shown || document.getElementById('uo-update-prompt')) return;
    shown = true;
    var style = document.createElement('style');
    style.textContent =
      '#uo-update-prompt{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:100000;max-width:min(92vw,28rem);' +
      'display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;justify-content:center;padding:.75rem 1rem;border:1px solid #b08d57;' +
      'border-radius:8px;background:#1b1612;color:#eadfc8;font:15px/1.4 system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.5)}' +
      '#uo-update-prompt button{font:inherit;padding:.35rem .9rem;border-radius:6px;border:1px solid #b08d57;cursor:pointer;background:transparent;color:#eadfc8}' +
      '#uo-update-prompt button.uo-primary{background:#b08d57;color:#1b1612;font-weight:600}' +
      '#uo-update-prompt button:focus-visible{outline:2px solid #eadfc8;outline-offset:2px}';
    document.head.appendChild(style);

    var box = document.createElement('div');
    box.id = 'uo-update-prompt';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    var text = document.createElement('span');
    text.textContent = 'A new version of The Universal Office is ready.';
    var update = document.createElement('button');
    update.type = 'button';
    update.className = 'uo-primary';
    update.textContent = 'Update now';
    var later = document.createElement('button');
    later.type = 'button';
    later.textContent = 'Later';
    box.appendChild(text);
    box.appendChild(update);
    box.appendChild(later);
    document.body.appendChild(box);

    update.addEventListener('click', function () {
      update.disabled = true;
      update.textContent = 'Updating…';
      worker.postMessage({ type: 'SKIP_WAITING' });
    });
    later.addEventListener('click', function () { box.remove(); });
  }

  function watch(reg) {
    // A worker that finished installing while an older one still controls the page is an update.
    function onInstalled(worker) {
      if (navigator.serviceWorker.controller) showPrompt(worker);
    }
    if (reg.waiting) onInstalled(reg.waiting);
    reg.addEventListener('updatefound', function () {
      var worker = reg.installing;
      if (!worker) return;
      worker.addEventListener('statechange', function () {
        if (worker.state === 'installed') onInstalled(worker);
      });
    });
  }

  // When the new worker takes over, reload once so the page runs the new files.
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (reloading || !shown) return; // first install also fires this; only reload after an accepted update
    reloading = true;
    location.reload();
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (reg) {
      watch(reg);
      // Look for a new release when the app comes back to the foreground, and hourly while open.
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') reg.update().catch(function () {}); });
      setInterval(function () { reg.update().catch(function () {}); }, 60 * 60 * 1000);
    }).catch(function () { /* no sw.js (development) */ });
  });
})();
