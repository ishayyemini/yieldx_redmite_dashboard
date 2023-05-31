this.addEventListener('install', () => {
  this.skipWaiting()
})

this.addEventListener('push', async (event) => {
  const message = await event.data.json()
  let { deviceID, lastUpdated, expectedUpdateAt, mode, server } = message
  const fullInfo = deviceID && lastUpdated && expectedUpdateAt && mode
  const t = (n) => n.toString().padStart(2, '0')
  const time = (date) =>
    `${t(new Date(date).getHours())}:${t(new Date(date).getMinutes())}`

  await event.waitUntil(
    this.registration.showNotification('RedMite Device Error', {
      badge: '../android-top-bar-icon.png',
      icon: '../favicon.ico',
      body: fullInfo
        ? `Device ${deviceID} was expected to update at ${time(
            expectedUpdateAt
          )}. Current status is "${mode}" since ${time(lastUpdated)}.`
        : "Device didn't update",
      tag: `${deviceID}|${server}`,
    })
  )
})

this.addEventListener('notificationclick', (event) => {
  // event.notification.close()
  event.waitUntil(
    this.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === '/' && 'focus' in client) return client.focus()
      }
      if (this.clients.openWindow) return this.clients.openWindow('/')
    })
  )
})
