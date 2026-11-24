// Daily word notifications. Loaded into the generated service worker with
// importScripts (see workbox.importScripts in vite.config.js).
self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch { data = { body: event.data?.text() } }
  event.waitUntil(self.registration.showNotification(data.title || 'Haohaotiantian', {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'daily-word',
    data: { url: data.url || '/profile' }
  }))
})

// Opening a notification focuses an open tab of the site if there is one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/profile', self.location.origin).href
  event.waitUntil((async () => {
    const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const tab = tabs.find((c) => new URL(c.url).origin === self.location.origin)
    if (tab) {
      await tab.focus()
      return tab.navigate(url)
    }
    return self.clients.openWindow(url)
  })())
})
