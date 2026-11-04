// Service Worker to handle Web Share Target API file sharing
self.addEventListener('install', (event) => {
  (event as any).waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  (event as any).waitUntil((self as any).clients.claim());
});

self.addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);

  // If this is a POST to the share target
  if (event.request.method === 'POST') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const file = formData.get('ticket');
          const title = formData.get('title') || '';
          const text = formData.get('text') || '';
          const shareUrl = formData.get('url') || '';

          // Cache the shared file in CacheStorage to read it from App.tsx
          if (file && typeof file !== 'string') {
            const cache = await caches.open('shared-ticket-cache');
            await cache.put('/shared-ticket-file', new Response(file, {
              headers: {
                'content-type': file.type || 'application/octet-stream',
                'x-file-name': encodeURIComponent(file.name || 'shared_ticket')
              }
            }));
          } else if (text || shareUrl) {
            const cache = await caches.open('shared-ticket-cache');
            await cache.put('/shared-ticket-text', new Response(JSON.stringify({ text, shareUrl, title }), {
              headers: { 'content-type': 'application/json' }
            }));
          }
        } catch (err) {
          console.error('Error handling shared file in SW:', err);
        }

        // Redirect user back to the app on the ticket tab
        return Response.redirect('./?shared=true', 303);
      })()
    );
    return;
  }

  // Normal request pass-through
  event.respondWith(fetch(event.request));
});

