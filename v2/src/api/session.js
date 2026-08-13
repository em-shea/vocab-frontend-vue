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

/** Starts the passwordless flow. Cognito emails a one-time code. */
export function startSignIn (email) {
  const user = new CognitoUser({ Username: email, Pool: pool(), Storage: window.localStorage })
  user.setAuthenticationFlowType('CUSTOM_AUTH')
  return new Promise((resolve, reject) => {
    user.initiateAuth(new AuthenticationDetails({ Username: email }), {
      onSuccess: () => resolve({ user, challenge: false }),
      onFailure: (err) => reject(err),
      customChallenge: () => resolve({ user, challenge: true })
    })
  })
}

/** Answers the emailed code. Cognito allows three attempts before failing. */
export function answerSignInChallenge (user, code) {
  return new Promise((resolve, reject) => {
    user.sendCustomChallengeAnswer(code, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
      // A wrong code re-issues the challenge rather than failing outright.
      customChallenge: () => reject(new Error('Incorrect code.'))
    })
  })
}

export function signOut () {
  const user = currentUser()
  if (user) {
    user.signOut()
  }
}
