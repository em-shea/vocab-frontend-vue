// Bringing people back to where they were after signing in.
//
// Sign-in is two steps with an email in between: /signin asks for a link, and
// the emailed link opens /verification?code=… later, usually in a new tab. The
// page someone started from travels as ?next= on /signin, is kept in this
// browser when the link is requested, and is used once the code is accepted.
// Keeping it here is enough: the emailed link only works in the browser that
// asked for it anyway (see api/session.js, pending sign-in).
//
// The emailed link itself is built by the backend and is unchanged.

const KEY = 'hhtt.afterSignIn'

// Pages that make no sense to come back to.
const NOT_BACK_TO = ['/signin', '/verification']

/**
 * A safe place to return to, or null. Only paths on this site: anything that
 * could leave it (//other.site, https://…, javascript:) is refused.
 */
export function safeNext (value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  const path = value.split(/[?#]/)[0]
  if (NOT_BACK_TO.includes(path)) return null
  return value
}

/**
 * The route for a "Sign in" link or redirect from the page at `fullPath`.
 * The home page is not worth returning to; sign-in leads to the profile from there.
 */
export function signInRoute (fullPath) {
  const next = safeNext(fullPath)
  const home = next && next.split(/[?#]/)[0] === '/'
  return { name: 'signin', query: next && !home ? { next } : {} }
}

export function rememberNext (value) {
  const next = safeNext(value)
  try {
    if (next) window.localStorage.setItem(KEY, next)
    else window.localStorage.removeItem(KEY)
  } catch { /* storage blocked: sign-in still works, it just lands on the profile */ }
}

/** Where to go after signing in, cleared once read. */
export function takeNext () {
  try {
    const next = safeNext(window.localStorage.getItem(KEY))
    window.localStorage.removeItem(KEY)
    return next
  } catch {
    return null
  }
}
