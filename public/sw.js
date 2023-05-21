this.addEventListener('activate', () => {
  console.log('service worker activated')
})

this.addEventListener('push', async (event) => {
  const message = await event.data.json()
  let { title, description, image } = message
  console.log({ message })
  await event.waitUntil(
    this.registration.showNotification(title, {
      body: description,
      icon: image,
      actions: [{ title: 'say hi', action: '' }],
    })
  )
})
