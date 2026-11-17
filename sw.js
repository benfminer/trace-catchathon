// Keeps the card working if the phone loses signal in the park.
// Page: network first, fall back to cache. Fonts: cache first.
const CACHE = "catchathon-v2";
const PICS = ["bulbasaur","snorlax","gengar","butterfree","pikachu","jigglypuff","meowth","squirtle","charmander"].map(n => `./img/${n}.png`);

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./index.html", ...PICS])));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const font = /fonts\.(googleapis|gstatic)\.com/.test(req.url);
  if (font) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
  } else if (new URL(req.url).origin === location.origin) {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match("./index.html"))));
  }
});
