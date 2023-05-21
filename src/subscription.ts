const applicationServerKey =
  'BGUCo-8mwzWAiWSB3bnD5fCX6CsrINsTgZSLPvfGgV5y9l5UxW6Gx_7fBtLS91GdeWKQZkNJLbmPHFEEErVdHV8'

export const subscribe = async (): Promise<PushSubscription | null> => {
  const registration = await navigator.serviceWorker?.ready

  let subscription = await registration?.pushManager.getSubscription()
  if (!subscription)
    subscription = await registration.pushManager
      .subscribe({ applicationServerKey, userVisibleOnly: true })
      .catch(() => {
        if (Notification.permission !== 'granted') {
          console.log('Permission was not granted.') // TODO show nicer notification error
          Notification.requestPermission().then((result) => {
            console.log(result)
          })
        }
        return null
      })

  return subscription
}
