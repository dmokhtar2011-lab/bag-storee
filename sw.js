self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
    for (const client of windows) {
      if (client.url.startsWith(self.registration.scope) && 'focus' in client) return client.focus();
    }
    return clients.openWindow('./index.html');
  }));
});
