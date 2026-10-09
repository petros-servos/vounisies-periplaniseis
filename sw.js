// Service worker για web push notifications -- Βουνίσιες Περιπλανήσεις
// Πρέπει να βρίσκεται στη ρίζα του site (ίδιος φάκελος με το index.html),
// ώστε το scope του να καλύπτει όλη τη σελίδα.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Βουνίσιες Περιπλανήσεις', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Βουνίσιες Περιπλανήσεις';
  const options = {
    body: data.body || '',
    icon: data.icon || 'icon-192.png',
    badge: data.badge || 'icon-192.png',
    data: { url: data.url || './' },
    vibrate: [100, 50, 100],
    // Μένει στην οθόνη (notification shade) μέχρι ο χρήστης να την κλείσει
    // χειροκίνητα -- δεν εξαφανίζεται μόνη της μετά από λίγα δευτερόλεπτα.
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';

  async function openOrFocus() {
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientList) {
      if ('focus' in client) {
        // Σε κάποιες συσκευές/browsers το navigate() μπορεί να αποτύχει
        // (π.χ. αν το client δεν υποστηρίζει navigation) -- τότε απλά
        // κάνουμε focus στο ήδη ανοιχτό παράθυρο αντί να μείνει "νεκρό" το tap.
        try {
          const navigated = await client.navigate(url);
          return navigated.focus();
        } catch (e) {
          return client.focus();
        }
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  }

  // Αν αποτύχει τελείως η παραπάνω λογική, τουλάχιστον δοκίμασε να ανοίξεις
  // νέο παράθυρο -- έτσι ποτέ δεν μένει το tap χωρίς καμία ενέργεια.
  event.waitUntil(
    openOrFocus().catch(() => {
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
