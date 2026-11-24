// Daily word notifications (web push) for this device.
//
// The toggle only appears where it can work: a browser with service workers,
// the Push API and notifications, and a build with VITE_VAPID_PUBLIC_KEY.
// On iPhone that means the app installed to the home screen (iOS 16.4+), so
// Safari in a tab gets a hint to install instead.
import { api } from '../api/client'

const KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export function pushState () {
  if (typeof window === 'undefined' || !KEY) return 'off'
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  if (supported) return Notification.permission === 'denied' ? 'blocked' : 'ok'
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const installed = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone
  return ios && !installed ? 'install' : 'off'
}

function keyBytes (base64) {
  const padded = (base64 + '='.repeat((4 - base64.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
}

async function registration () {
  return navigator.serviceWorker.ready
}

export async function isSubscribed () {
  if (pushState() !== 'ok') return false
  const sub = await (await registration()).pushManager.getSubscription()
  return Boolean(sub)
}

// Resolves true when on, false when the person said no to the browser prompt.
export async function subscribe () {
  if (await Notification.requestPermission() !== 'granted') return false
  const reg = await registration()
  const sub = await reg.pushManager.getSubscription() ??
    await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(KEY) })
  await api.setPush('subscribe', sub.toJSON())
  return true
}

export async function unsubscribe () {
  const sub = await (await registration()).pushManager.getSubscription()
  if (!sub) return
  await api.setPush('unsubscribe', { endpoint: sub.endpoint })
  await sub.unsubscribe()
}
