/*
 * Network-only service worker.
 *
 * It exists so Chromium treats the game as installable, but it deliberately
 * does NOT cache anything. Every request goes to the network, so a new GitHub
 * Pages deployment or a changed voice file can never be served stale.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Intentionally empty: the browser performs its normal network request.
});
