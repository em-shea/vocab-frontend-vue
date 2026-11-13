// Stand-ins for everything the app talks to.
//
// Nothing in these tests reaches the network: Cognito and the API are answered
// here, and any other outside request is refused and recorded so a test fails
// if the app starts calling something new.

export const EMAIL = 'learner@example.com'
export const HSK1 = '1ebcad3f-5dfd-6bfe-bda4-acde48001122'
export const HSK2 = '1ebcad3f-adc0-6f42-b8b1-acde48001122'

const word = (id, simplified, traditional, pinyin, definition) => ({
  word_id: id,
  word: { simplified, traditional, pinyin, definition, audio_file_key: '' }
})

export const SAMPLE_VOCAB = {
  [HSK1]: [
    word('w1', '爱护', '愛護', 'ài hù', 'to cherish'),
    word('w2', '学习', '學習', 'xué xí', 'to study')
  ],
  [HSK2]: [word('w3', '帮助', '幫助', 'bāng zhù', 'to help')]
}

export const USER = {
  email_address: EMAIL,
  character_set_preference: 'simplified',
  language_preference: 'en',
  subscriptions: [{ list_id: HSK1, list_name: 'HSK Level 1', character_set: 'simplified', status: 'subscribed' }]
}

// The Cognito SDK decodes tokens but cannot verify signatures, so an unsigned
// token with the right claims is enough to look signed in.
const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
export function fakeToken (claims = {}) {
  const now = Math.floor(Date.now() / 1000)
  return `${b64({ alg: 'none' })}.${b64({ sub: 'sub-123', email: EMAIL, iat: now, exp: now + 3600, ...claims })}.sig`
}

/**
 * Installs the stand-ins on a page. Returns a log of what the app asked for,
 * and knobs for making the backend misbehave.
 */
export async function mockBackend (page, options = {}) {
  const state = {
    validCode: options.validCode ?? 'good-code',
    knownUser: options.knownUser ?? true,
    existingUser: options.existingUser ?? false,
    cognito: [],   // X-Amz-Target action names, in order
    api: [],       // { method, path, headers, body }
    unexpected: [] // anything else that tried to leave the page
  }

  await page.route(/^https:\/\/cognito-idp\.[a-z0-9-]+\.amazonaws\.com\//, async (route) => {
    const request = route.request()
    const action = (request.headers()['x-amz-target'] ?? '').split('.').pop()
    const body = request.postDataJSON() ?? {}
    state.cognito.push(action)

    const json = (payload, status = 200) =>
      route.fulfill({ status, contentType: 'application/x-amz-json-1.1', body: JSON.stringify(payload) })
    const fail = (type, message) => json({ __type: type, message }, 400)

    if (action === 'InitiateAuth') {
      if (!state.knownUser) return fail('UserNotFoundException', 'User does not exist.')
      return json({
        ChallengeName: 'CUSTOM_CHALLENGE',
        Session: `session-${state.cognito.length}`,
        ChallengeParameters: { USERNAME: body.AuthParameters?.USERNAME }
      })
    }
    if (action === 'RespondToAuthChallenge') {
      if (body.ChallengeResponses?.ANSWER !== state.validCode) {
        return fail('NotAuthorizedException', 'Invalid session for the user.')
      }
      return json({
        AuthenticationResult: {
          IdToken: fakeToken(),
          AccessToken: fakeToken({ username: EMAIL }),
          RefreshToken: 'refresh',
          ExpiresIn: 3600,
          TokenType: 'Bearer'
        }
      })
    }
    if (action === 'SignUp') {
      if (state.existingUser) return fail('UsernameExistsException', 'User already exists')
      return json({ UserConfirmed: true, UserSub: 'sub-new' })
    }
    return fail('NotImplemented', `No stand-in for Cognito ${action}`)
  })

  await page.route(/^https:\/\/api\.(staging\.)?haohaotiantian\.com\//, async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const method = request.method()
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    state.api.push({ method, path, headers: request.headers(), body: request.postDataJSON?.() ?? null })

    const json = (payload, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', headers: cors, body: JSON.stringify(payload) })

    if (method === 'GET' && path === '/sample_vocab') return json(SAMPLE_VOCAB)
    if (method === 'GET' && path === '/user') return json(USER)
    if (method === 'POST' && path === '/update_login') return json({ success: true })
    if (method === 'POST' && path === '/update_user') return json({ success: true })
    if (method === 'POST' && path === '/set_subs') return json({ success: true })
    return json({ message: `No stand-in for ${method} ${path}` }, 404)
  })

  // Anything else leaving localhost is a surprise. Refuse it and remember it.
  await page.route(
    (url) => !['localhost', '127.0.0.1'].includes(url.hostname) &&
      !/cognito-idp\..*amazonaws\.com$|haohaotiantian\.com$/.test(url.hostname),
    (route) => {
      state.unexpected.push(route.request().url())
      return route.abort()
    }
  )

  return state
}

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*'
}

/** Puts a valid session in the browser before the app loads. */
export async function signedIn (page) {
  await page.addInitScript(({ id, access, email, clientId }) => {
    const prefix = `CognitoIdentityServiceProvider.${clientId}`
    window.localStorage.setItem(`${prefix}.LastAuthUser`, email)
    window.localStorage.setItem(`${prefix}.${email}.idToken`, id)
    window.localStorage.setItem(`${prefix}.${email}.accessToken`, access)
    window.localStorage.setItem(`${prefix}.${email}.refreshToken`, 'refresh')
    window.localStorage.setItem(`${prefix}.${email}.clockDrift`, '0')
  }, { id: fakeToken(), access: fakeToken({ username: EMAIL }), email: EMAIL, clientId: 'mi4ig9h25fg7v9dvmlk6mgodd' })
}

/**
 * Collects problems a visitor would not report but would feel: console errors
 * and uncaught exceptions. Call `expectClean()` at the end of a test.
 */
export function watchForErrors (page) {
  const problems = []
  page.on('console', (msg) => { if (msg.type() === 'error') problems.push(`console: ${msg.text()}`) })
  page.on('pageerror', (err) => problems.push(`uncaught: ${err.message}`))
  return problems
}

/** True when the page scrolls sideways, the defect responsive layouts ship with. */
export const overflowsSideways = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
