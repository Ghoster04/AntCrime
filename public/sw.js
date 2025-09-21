// Service Worker para AntiCrime 04 PWA
const CACHE_NAME = 'anticrime04-v1.0.0';
const STATIC_CACHE = 'anticrime04-static-v1';
const DYNAMIC_CACHE = 'anticrime04-dynamic-v1';

// Arquivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico'
];

// URLs da API para cache dinâmico
const API_BASE = 'http://localhost:8000';

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 AntiCrime04 SW: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Cacheando arquivos estáticos...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ AntiCrime04 SW: Instalação completa!');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Erro na instalação do SW:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 AntiCrime04 SW: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ AntiCrime04 SW: Ativação completa!');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para diferentes tipos de requisições
  if (url.pathname.startsWith('/static/') || url.pathname === '/') {
    // Cache First para arquivos estáticos
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (url.hostname === 'localhost' && url.port === '8000') {
    // Network First para API (com fallback offline)
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else {
    // Network Only para outros recursos
    event.respondWith(fetch(request));
  }
});

// Estratégia Cache First
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Cache hit:', request.url);
      return cachedResponse;
    }
    
    console.log('🌐 Network request:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Erro no cache first:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Estratégia Network First
async function networkFirst(request, cacheName) {
  try {
    console.log('🌐 Network first:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📦 Network failed, trying cache:', request.url);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para APIs críticas
    if (request.url.includes('/auth/login')) {
      return new Response(
        JSON.stringify({ error: 'Offline - Não é possível fazer login' }), 
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (request.url.includes('/emergencias')) {
      return new Response(
        JSON.stringify({ error: 'Offline - Emergências não disponíveis' }), 
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
  console.log('📨 Push notification received');
  
  const options = {
    body: 'Nova emergência detectada!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('AntiCrime 04 - PRM', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/emergencias')
    );
  } else if (event.action === 'close') {
    // Apenas fechar
  } else {
    // Clique padrão
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sincronização em background (para futuras implementações)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Implementar sincronização de dados offline
      Promise.resolve()
    );
  }
});

console.log('🛡️ AntiCrime04 Service Worker carregado!');
