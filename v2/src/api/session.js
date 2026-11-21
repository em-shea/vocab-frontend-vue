import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'

// Cognito access, wrapped in promises.
//
// The Vue 2 app configured Amplify in main.js but then made every actual call
// through amazon-cognito-identity-js directly, so it shipped two auth libraries
// and used one. Amplify is dropped here; this is the lighter path it was
// already relying on.
//
// Kept separate from the Pinia store so the API client can read a token without
// importing the store, which would be circular.

function pool () {
  return new CognitoUserPool({
    UserPoolId: import.meta.env.VITE_USER_POOL_ID,
    ClientId: import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID,
    Storage: window.localStorage
  })
}

export function currentUser () {
  return pool().getCurrentUser()
}

/** Resolves the current session, or null when nobody is signed in. */
export function getSession () {
  return new Promise((resolve) => {
    const user = currentUser()
    if (!user) {
      resolve(null)
      return
    }
    user.getSession((err, session) => {
      if (err || !session || !session.isValid()) {
        resolve(null)
        return
      }
      resolve(session)
    })
  })
}

/** The raw JWT for the API Gateway authorizer, or null. */
export async function getIdToken () {
  const session = await getSession()
  return session ? session.getIdToken().getJwtToken() : null
}

// --- pending sign-in -------------------------------------------------------
//
// The emailed link opens /verification?code=… as a fresh page load, usually in
// a new tab, so the in-memory CognitoUser from /signin is gone by the time the
// code arrives. Cognito needs the same username and challenge Session string to
// accept the answer, so both are kept in localStorage between the two pages.
//
// The key and shape match the Vue 2 app's, so a link requested on the old site
// just before cutover still completes on the new one.

const PENDING_KEY = 'localSessionData'

export function savePendingSignIn ({ username, session }) {
  window.localStorage.setItem(PENDING_KEY, JSON.stringify({ username, session }))
}

/** The sign-in awaiting its emailed code, or null. */
export function loadPendingSignIn () {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PENDING_KEY))
    return stored?.username && stored?.session ? stored : null
  } catch {
    return null
  }
}

export function clearPendingSignIn () {
  window.localStorage.removeItem(PENDING_KEY)
}

/**
 * Starts the passwordless flow. Cognito emails a one-time link, and the
 * challenge is remembered so /verification can answer it.
 */
export function startSignIn (email) {
  const user = new CognitoUser({ Username: email, Pool: pool(), Storage: window.localStorage })
  user.setAuthenticationFlowType('CUSTOM_AUTH')
  return new Promise((resolve, reject) => {
    user.initiateAuth(new AuthenticationDetails({ Username: email }), {
      onSuccess: () => resolve({ challenge: false }),
      onFailure: (err) => reject(err),
      customChallenge: () => {
        savePendingSignIn({ username: email, session: user.Session })
        resolve({ challenge: true })
      }
    })
  })
}

/**
 * Answers the pending challenge with the emailed code.
 *
 * Rejects with code 'NoPendingSignIn' when there is nothing to answer (the link
 * was opened in a different browser from the one that asked for it) and
 * 'IncorrectCode' when Cognito re-issues the challenge instead of accepting.
 */
export function answerSignInChallenge (code) {
  const pending = loadPendingSignIn()
  if (!pending) {
    return Promise.reject(Object.assign(new Error('No sign-in in progress.'), { code: 'NoPendingSignIn' }))
  }
  const user = new CognitoUser({ Username: pending.username, Pool: pool(), Storage: window.localStorage })
  user.setAuthenticationFlowType('CUSTOM_AUTH')
  user.Session = pending.session
  return new Promise((resolve, reject) => {
    user.sendCustomChallengeAnswer(code, {
      onSuccess: (session) => {
        clearPendingSignIn()
        resolve(session)
      },
      onFailure: (err) => reject(err),
      // A wrong code re-issues the challenge rather than failing outright. Keep
      // the new Session so a corrected link can still be answered.
      customChallenge: () => {
        savePendingSignIn({ username: pending.username, session: user.Session })
        reject(Object.assign(new Error('Incorrect code.'), { code: 'IncorrectCode' }))
      }
    })
  })
}

export function signOut () {
  const user = currentUser()
  if (user) {
    user.signOut()
  }
}
