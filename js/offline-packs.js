/**
 * Offline packs.
 *
 * The prayer text of every tradition is kept on the device by the service worker (sw.js). The saint
 * icons (about 27 MB) are not; the first time someone opens the Orthodox side, this downloads them once
 * in the background so the Orthodox side also works offline afterwards. It never delays the page,
 * skips itself when the browser asks for reduced data use, and retries on the next visit if it is
 * interrupted. Without a service worker (development, or a browser without support) it does nothing.
 */
(function (root) {
  'use strict';
  const FLAG = 'uo.icons.offline.v1';
  const CACHE = 'uo-icons'; // the same cache the service worker's icon route reads
  let running = false;

  function stored() { try { return root.localStorage.getItem(FLAG) === 'done'; } catch (e) { return false; } }
  function remember() { try { root.localStorage.setItem(FLAG, 'done'); } catch (e) { /* ignore */ } }

  async function downloadIcons() {
    if (running || stored() || !('caches' in root) || !root.navigator.serviceWorker || !root.navigator.serviceWorker.controller) return 'skipped';
    const conn = root.navigator.connection;
    if (conn && conn.saveData) return 'skipped';
    running = true;
    try {
      const res = await fetch('data/icons/commemoration-icons.json');
      if (!res.ok) return 'failed';
      const data = await res.json();
      const urls = new Set();
      Object.values(data.byDate || {}).forEach((list) => list.forEach((i) => i.image && urls.add(new URL(i.image, root.location.origin + '/').pathname)));
      const cache = await root.caches.open(CACHE);
      let ok = 0;
      for (const url of urls) {
        if (await cache.match(url)) { ok++; continue; }
        try {
          const r = await fetch(url);
          if (!r.ok) throw new Error(String(r.status));
          await cache.put(url, r);
          ok++;
        } catch (e) { /* offline or interrupted: try again next visit */ }
      }
      if (ok === urls.size) { remember(); return 'done'; }
      return 'partial';
    } finally { running = false; }
  }

  // Called when someone enters the Orthodox side. Waits until the page is idle.
  function noteOrthodoxEntry() {
    const go = () => { downloadIcons().catch(() => {}); };
    if ('requestIdleCallback' in root) root.requestIdleCallback(go, { timeout: 10000 }); else root.setTimeout(go, 3000);
  }

  root.OfflinePacks = { noteOrthodoxEntry, downloadIcons };
})(typeof window !== 'undefined' ? window : globalThis);
