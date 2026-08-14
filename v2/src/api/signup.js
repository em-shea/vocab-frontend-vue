import { CognitoUserPool } from 'amazon-cognito-identity-js'
import { api } from './client'

// Anonymous sign-up.
//
// Two steps, in this order, matching the existing backend:
//
//   1. Create the Cognito user. Sign-in is a one-time emailed code, so the
//      password here is a throwaway the user never sees or needs.
//   2. POST /set_subs with the resulting sub, creating the DynamoDB user record
//      and its first subscription.
//
// /set_subs is public and create-only: it rejects a user that already exists,
// so a duplicate address surfaces from step 1 as UsernameExistsException rather
// than silently modifying somebody's subscriptions.

function pool () {
  return new CognitoUserPool({
    UserPoolId: import.meta.env.VITE_USER_POOL_ID,
    ClientId: import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID,
    Storage: window.localStorage
  })
}

function throwawayPassword () {
  // Never used to sign in — the custom auth flow emails a code instead. Cognito
  // still requires one at sign-up.
  const bytes = new Uint8Array(24)
  window.crypto.getRandomValues(bytes)
  return 'Aa1!' + btoa(String.fromCharCode(...bytes)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)
}

function cognitoSignUp (email) {
  return new Promise((resolve, reject) => {
    pool().signUp(email, throwawayPassword(), [], null, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

/**
 * Subscribe a new address to one vocab list.
 * @returns the created user's Cognito sub.
 */
export async function signUp ({ email, list, characterSet }) {
  if (!list) throw new Error('No vocab list selected.')

  const result = await cognitoSignUp(email)
  const cognitoId = result.userSub

  await api.signUp({
    cognito_id: cognitoId,
    email,
    character_set_preference: characterSet,
    subscriptions: [{
      list_id: list.list_id,
      list_name: list.list_name,
      character_set: characterSet
    }]
  })

  return cognitoId
}
