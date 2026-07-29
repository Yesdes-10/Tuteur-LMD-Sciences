const CACHE_NAME = "tuteur-lmd-v2";
const ASSETS_TO_CACHE = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./api.js",
  "./logo.png",
  "./manifest.json",
  "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"
];

// 1. Installation et mise en cache initiale
self.addEventListener("install", (event) => {
  // Force le Service Worker à s'activer immédiatement sans attendre la fermeture des onglets
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Mise en cache des fichiers de base");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activation et nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Suppression de l'ancien cache :", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Prend le contrôle immédiat des clients ouverts
  );
});

// 3. Interception des requêtes avec stratégie "Cache d'abord, Réseau en secours"
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Ne jamais mettre en cache les requêtes dynamiques vers l'API Google Gemini
  if (url.includes("googleapis.com")) {
    return; 
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Retourne le fichier depuis le cache (ultrarapide/hors-ligne)
      }
      
      // Si absent du cache, on va le chercher sur le réseau
      return fetch(event.request).catch(() => {
        console.warn("[Service Worker] Requête réseau échouée pour :", url);
        // Possibilité ici d'ajouter une page de secours offline.html si nécessaire
      });
    })
  );
});