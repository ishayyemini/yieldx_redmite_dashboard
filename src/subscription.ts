import tokens from './tokens.json'

export const subscribe = async (): Promise<PushSubscription | null> => {
  const registration = await navigator.serviceWorker?.ready

  let subscription = await registration?.pushManager.getSubscription()
  if (!subscription)
    subscription = await registration.pushManager
      .subscribe({
        applicationServerKey: tokens.WEBPUSH_PUBLIC_KEY,
        userVisibleOnly: true,
      })
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
