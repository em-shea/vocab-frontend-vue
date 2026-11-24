// Asking people to install the site as an app (Emily, 2026-11-24): after their
// first finished task (a quiz, a sentence or stroke order practice), on the
// profile. Chrome, Edge and Android offer their own install prompt, which we
// hold until the button is pressed; iPhone and iPad have none, so they get the
// Share → Add to Home Screen steps. Never shown once installed, and a "Not now"
// keeps it away for 30 days.
import { ref } from 'vue'

const DISMISSED_KEY = 'hhtt.installDismissed'
const QUIET_DAYS = 30

const deferred = ref(null)
const installed = ref(false)

// Called once at start-up: the browser's event can fire before the profile opens.
export function listenForInstall () {
  if (typeof window === 'undefined') return
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred.value = event
  })
  window.addEventListener('appinstalled', () => {
    installed.value = true
    deferred.value = null
  })
}

function standalone () {
  return window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true
}

function iosSafari () {
  const ua = navigator.userAgent
  // iPadOS reports itself as a Mac; touch gives it away.
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  return ios && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

// 'prompt' (the browser's own install), 'ios' (show the steps) or 'none'.
export function installMode () {
  if (typeof window === 'undefined' || installed.value || standalone()) return 'none'
  if (deferred.value) return 'prompt'
  return iosSafari() ? 'ios' : 'none'
}

export function dismissedRecently (now = Date.now()) {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY))
    return Boolean(at) && now - at < QUIET_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export function dismiss (now = Date.now()) {
  try { localStorage.setItem(DISMISSED_KEY, String(now)) } catch { /* private mode: shows again next time */ }
}

// Resolves true if the person accepted.
export async function promptInstall () {
  const event = deferred.value
  if (!event) return false
  deferred.value = null
  event.prompt()
  const { outcome } = await event.userChoice
  if (outcome === 'accepted') installed.value = true
  return outcome === 'accepted'
}

// Anything finished: a saved quiz, or a sentence or stroke order practice on
// any day /user_activity covers.
export function hasFinishedTask (quizzes = [], activity = {}) {
  if (quizzes.length) return true
  return Object.values(activity ?? {}).some((day) =>
    (day?.review_words ?? []).some((w) => w?.written === true || w?.sentence?.sentence) || day?.quiz)
}
