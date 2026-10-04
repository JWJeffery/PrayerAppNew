// Generates web-release/sw.js with Workbox (workbox-build, MIT, Google).
//
// What stays on the device:
//   - precached at install (versioned by content hash; an unchanged file is never downloaded twice):
//     the app (index.html, js, css, components, fonts) and all prayer text (data/), including the
//     Roman Breviary component bundles and the Bible text the lectionaries read;
//   - cached as used (not at install): images, and the saint icons (images/icons), which are fetched
//     the first time the Orthodox side shows them (see js/offline-packs.js for the one-tap "keep all
//     icons offline" download), the Bible browser's translation files, and web fonts.
// Left out entirely: admin tools, build metadata, documentation.
import path from 'node:path';
import { generateSW } from 'workbox-build';

export async function buildServiceWorker(releaseDir) {
  const { count, size, warnings } = await generateSW({
    globDirectory: releaseDir,
    swDest: path.join(releaseDir, 'sw.js'),
    globPatterns: ['index.html', 'manifest.webmanifest', 'js/**/*', 'css/**/*', 'components/**/*', 'assets/fonts/**/*', 'images/app/**/*', 'data/**/*'],
    globIgnores: [
      'data/bible/translations/**',
      'data/roman-breviary-1960-1962/bible-bindings/**',
      '**/*.map', '**/*.md'
    ],
    maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
    // index.html asks for css/js with ?v=NNN cache-busters; the precache is versioned by hash instead.
    ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^v$/],
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/admin/, /^\/data\//, /^\/images\//],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: false, // a new version waits until the open tabs close, so a page never mixes versions
    runtimeCaching: [
      { urlPattern: ({ url }) => url.pathname.startsWith('/images/icons/'), handler: 'CacheFirst',
        options: { cacheName: 'uo-icons', expiration: { maxEntries: 800 } } },
      { urlPattern: ({ url }) => url.pathname.startsWith('/images/'), handler: 'CacheFirst',
        options: { cacheName: 'uo-images', expiration: { maxEntries: 80 } } },
      { urlPattern: ({ url }) => url.pathname.startsWith('/data/bible/translations/'), handler: 'CacheFirst',
        options: { cacheName: 'uo-bible-translations', expiration: { maxEntries: 200 } } },
      { urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com', handler: 'StaleWhileRevalidate',
        options: { cacheName: 'uo-font-css' } },
      { urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com', handler: 'CacheFirst',
        options: { cacheName: 'uo-font-files', expiration: { maxEntries: 40 }, cacheableResponse: { statuses: [0, 200] } } }
    ]
  });
  return { count, size, warnings };
}

if (process.argv[1] && process.argv[1].endsWith('build-service-worker.mjs')) {
  const dir = path.resolve(process.argv[2] || 'web-release');
  buildServiceWorker(dir).then((r) => console.log(`sw.js: ${r.count} files precached, ${(r.size / 1048576).toFixed(1)} MB`, r.warnings));
}
