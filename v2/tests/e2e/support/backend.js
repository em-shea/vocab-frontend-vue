// Stand-ins for everything the app talks to.
//
// Nothing in these tests reaches the network: Cognito and the API are answered
// here, and any other outside request is refused and recorded so a test fails
// if the app starts calling something new.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export const EMAIL = 'learner@example.com'
export const HSK1 = '1ebcad3f-5dfd-6bfe-bda4-acde48001122'
export const HSK2 = '1ebcad3f-adc0-6f42-b8b1-acde48001122'

// Stand-in recording links, shaped like the real S3 ones. Nothing fetches them
// unless a test presses play.
export const audioFor = (simplified) => `https://vocab-static.s3.amazonaws.com/audio/test-${encodeURIComponent(simplified)}.mp3`

const word = (id, simplified, traditional, pinyin, definition) => ({
  word_id: id,
  word: { simplified, traditional, pinyin, definition, audio_file_key: audioFor(simplified) }
})

export const SAMPLE_VOCAB = {
  [HSK1]: [
    word('w1', '爱护', '愛護', 'ài hù', 'to cherish'),
    word('w2', '学习', '學習', 'xué xí', 'to study')
  ],
  [HSK2]: [word('w3', '帮助', '幫助', 'bāng zhù', 'to help')]
}

// What GET /review returns: oldest first, keyed by list id.
const sent = (listId, date, simplified, traditional, pinyin, definition, level, audio = audioFor(simplified)) => ({
  list_id: listId,
  date_sent: date,
  word: { simplified, traditional, pinyin, definition, audio_file_key: audio, difficulty_level: 'Beginner', hsk_level: level }
})

export const REVIEW = {
  [HSK1]: [
    sent(HSK1, '2026-11-10', '朋友', '朋友', 'péng you', 'friend', '1'),
    sent(HSK1, '2026-11-11', '学习', '學習', 'xué xí', 'to study; to learn', '1'),
    sent(HSK1, '2026-11-12', '爱护', '愛護', 'ài hù', 'to cherish, "to treasure"', '1')
  ],
  [HSK2]: [sent(HSK2, '2026-11-12', '帮助', '幫助', 'bāng zhù', 'to help', '2')]
}

// Enough words for a quiz: two one-character words and six two-character ones,
// with two that share a definition, the case that once produced two options
// reading the same.
export const QUIZ_REVIEW = {
  [HSK1]: [
    sent(HSK1, '2026-11-05', '朋友', '朋友', 'péng you', 'friend', '1'),
    sent(HSK1, '2026-11-06', '学习', '學習', 'xué xí', 'to study', '1'),
    sent(HSK1, '2026-11-07', '爱护', '愛護', 'ài hù', 'to cherish', '1'),
    sent(HSK1, '2026-11-08', '帮助', '幫助', 'bāng zhù', 'to help', '1'),
    sent(HSK1, '2026-11-09', '老师', '老師', 'lǎo shī', 'teacher', '1'),
    sent(HSK1, '2026-11-10', '喜欢', '喜歡', 'xǐ huan', 'to like', '1'),
    sent(HSK1, '2026-11-11', '是', '是', 'shì', 'to be', '1'),
    sent(HSK1, '2026-11-12', '系', '係', 'xì', 'to be', '1')
  ],
  [HSK2]: REVIEW[HSK2]
}

// Practice sentences (/sentences): what GET /user_activity and GET /sentences
// return. The newest date is the server's today; one of today's words already
// has a sentence, and one sentence is from before the 10 days the activity
// covers, so its word is not known.
const activityWord = (id, simplified, traditional, pinyin, definition) => ({
  list_id: HSK1,
  word: { word_id: id, simplified, traditional, pinyin, definition, audio_file_key: audioFor(simplified), difficulty_level: 'Beginner', hsk_level: '1' }
})
const written = (id, sentence, date) => ({ sentence_id: id, sentence, character_set: 'simplified', date_created: date })
const studyWord = activityWord('w-study', '学习', '學習', 'xué xí', 'to study; to learn')
export const ACTIVITY = {
  '2026-11-20': {
    review_words: [
      { ...activityWord('w-friend', '朋友', '朋友', 'péng you', 'friend'), date_sent: '2026-11-20' },
      {
        ...activityWord('w-cherish', '爱护', '愛護', 'ài hù', 'to cherish'),
        date_sent: '2026-11-20',
        sentence: { ...written('s-today', '请爱护你的书。', '2026-11-20'), list_id: HSK1, word: {} }
      }
    ]
  },
  '2026-11-19': {
    review_words: [{
      ...studyWord,
      date_sent: '2026-11-19',
      sentence: { ...written('s-yesterday', '我每天学习汉语。', '2026-11-19'), list_id: HSK1, word: studyWord.word }
    }]
  },
  '2026-11-18': { review_words: [] }
}
export const SENTENCES = [
  written('s-old', '中文很好听。', '2025-03-02'),
  written('s-yesterday', '我每天学习汉语。', '2026-11-19'),
  written('s-today', '请爱护你的书。', '2026-11-20')
]

/**
 * Sets SENTENCES_ENABLED for one page, by rewriting the flags module as the dev
 * server sends it. The build itself is untouched. The flag is on in the code
 * since 2026-11-21; switching it off checks old links still resolve.
 */
async function sentencesSwitched (page, on) {
  await page.route(/\/src\/featureFlags\.js(\?.*)?$/, async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replace(/SENTENCES_ENABLED = (true|false)/, `SENTENCES_ENABLED = ${on}`)
    await route.fulfill({ response, body })
  })
}
export const sentencesSwitchedOn = (page) => sentencesSwitched(page, true)
export const sentencesSwitchedOff = (page) => sentencesSwitched(page, false)

export const USER = {
  email_address: EMAIL,
  character_set_preference: 'simplified',
  language_preference: 'en',
  subscriptions: [{ list_id: HSK1, list_name: 'HSK Level 1', character_set: 'simplified', status: 'subscribed' }]
}

// --- Profile (/profile, /profile-settings) ---------------------------------

// Dates as the backend keys them: UTC, counted back from today.
// GET /leaderboard as public_profile_service.get_leaderboard returns it.
export const LEADERBOARD = {
  week_start: '2026-11-23',
  today: '2026-11-25',
  last_week_start: '2026-11-16',
  last_week: [
    { handle: 'ab3cd4ef', name: '小安', name_pinyin: 'xiǎo ān', joined: '2024-09', rank: 1,
      streak: { current: 5, best: 12 }, week: { active_days: 6, actions: 11 }, badges: ['new_user', 'first_quiz'] },
    { handle: 'k7mq2xpa', name: '林冲', name_pinyin: 'Lín Chōng', joined: '2021-02', rank: 2,
      streak: { current: 41, best: 41 }, week: { active_days: 6, actions: 8 }, badges: ['new_user', 'first_sentence'] },
    { handle: 'zz9yy8xx', name: null, name_pinyin: null, joined: '2026-11', rank: 3,
      streak: { current: 1, best: 1 }, week: { active_days: 2, actions: 2 }, badges: ['new_user'] }
  ],
  entries: [
    { handle: 'k7mq2xpa', name: '林冲', name_pinyin: 'Lín Chōng', joined: '2021-02', rank: 1,
      streak: { current: 41, best: 41 }, week: { active_days: 3, actions: 9 },
      badges: ['new_user', 'first_quiz', 'first_sentence', 'first_stroke_order'] },
    { handle: 'ab3cd4ef', name: '小安', name_pinyin: 'xiǎo ān', joined: '2024-09', rank: 2,
      streak: { current: 5, best: 12 }, week: { active_days: 3, actions: 4 },
      badges: ['new_user', 'first_quiz'] },
    { handle: 'zz9yy8xx', name: null, name_pinyin: null, joined: '2026-11', rank: 3,
      streak: { current: 1, best: 1 }, week: { active_days: 1, actions: 1 }, badges: ['new_user'] }
  ]
}

export const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)

// What GET /user_activity returns: the user record, subscriptions, and ten
// days of activity keyed by date (vocab: get_user_activity/app.py).
export function userActivity ({ quizToday = false, subscriptions = USER.subscriptions, alias = '小安', aliasPinyin = 'xiǎo ān' } = {}) {
  const activity = {}
  for (let n = 0; n < 10; n++) activity[daysAgo(n)] = { review_words: [] }
  activity[daysAgo(1)].review_words = [
    sent(HSK1, daysAgo(1), '学习', '學習', 'xué xí', 'to study; to learn', '1'),
    sent(HSK2, daysAgo(1), '帮助', '幫助', 'bāng zhù', 'to help', '2')
  ]
  activity[daysAgo(0)].review_words = [sent(HSK1, daysAgo(0), '爱护', '愛護', 'ài hù', 'to cherish', '1')]
  if (quizToday) activity[daysAgo(0)].quiz = profileQuiz('q-today', daysAgo(0), 8, 10)
  return {
    ...USER,
    user_id: 'sub-123',
    user_alias: alias,
    user_alias_pinyin: aliasPinyin,
    user_alias_emoji: 'Not set',
    date_created: '2021-06-16T23:07:11.623880',
    subscriptions,
    activity
  }
}

// One saved quiz as GET /quizzes returns it (models.Quiz).
export const profileQuiz = (id, date, correct, total, listId = HSK1) => ({
  quiz_id: id,
  date_created: date,
  list_id: listId,
  character_set: 'simplified',
  question_quantity: total,
  correct_answers: correct,
  quiz_data: []
})

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
    reviewFails: options.reviewFails ?? false,
    reviewEmpty: options.reviewEmpty ?? false,
    review: options.review ?? REVIEW,
    saveQuizFails: options.saveQuizFails ?? false,
    // Profile (/profile, /profile-settings)
    userActivity: options.userActivity ?? null,
    userActivityFails: options.userActivityFails ?? false,
    user: options.user ?? null,
    userFails: options.userFails ?? false,
    quizzes: options.quizzes ?? [],
    quizzesFails: options.quizzesFails ?? false,
    updateUserFails: options.updateUserFails ?? false,
    // Practice sentences (/sentences)
    activity: options.activity ?? null, // sentences: just the activity map; wrapped in USER
    activityFails: options.activityFails ?? false,
    sentences: options.sentences ?? SENTENCES,
    sentencesFails: options.sentencesFails ?? false,
    saveWritingFails: options.saveWritingFails ?? false,
    progressFails: options.progressFails ?? false,
    saveSentenceFails: options.saveSentenceFails ?? false,
    cognito: [],   // X-Amz-Target action names, in order
    api: [],       // { method, path, headers, body }
    unexpected: [] // anything else that tried to leave the page
  }

  // --- lists, unsubscribe and subscribed screens ---
  state.subscriptionsFail = options.subscriptionsFail ?? false
  state.unsubFails = options.unsubFails ?? false

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
    state.api.push({
      method,
      path,
      query: Object.fromEntries(new URL(request.url()).searchParams),
      headers: request.headers(),
      body: request.postDataJSON?.() ?? null
    })

    const json = (payload, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', headers: cors, body: JSON.stringify(payload) })

    if (method === 'GET' && path === '/sample_vocab') return json(SAMPLE_VOCAB)
    if (method === 'GET' && path === '/review') {
      if (state.reviewFails) return json({ message: 'Internal server error' }, 500)
      const listId = new URL(request.url()).searchParams.get('list_id')
      return json({ [listId]: state.reviewEmpty ? [] : (state.review[listId] ?? []) })
    }
    // Profile (/profile, /profile-settings)
    if (method === 'GET' && path === '/user_activity') {
      // Shared by /profile and /sentences: a whole record (userActivity), or
      // just the activity map (activity), or the profile's default.
      if (state.userActivityFails || state.activityFails) return json({ message: 'Internal server error' }, 500)
      return json(state.userActivity ?? (state.activity ? { ...USER, activity: state.activity } : userActivity()))
    }
    if (method === 'GET' && path === '/quizzes') {
      if (state.quizzesFails) return json({ success: false, message: 'Failed to retrieve quiz results', data: null }, 502)
      return json({ success: true, message: 'Successfully retrieved quiz results', data: state.quizzes })
    }
    if (method === 'GET' && path === '/user' && state.userFails) return json({ message: 'Internal server error' }, 500)
    if (method === 'GET' && path === '/user' && state.user) return json(state.user)
    if (method === 'POST' && path === '/update_user' && state.updateUserFails) return json({ success: false }, 502)
    // --- lists, unsubscribe and subscribed screens ---
    // Shapes from vocab: get_user_data, update_subscriptions and unsubscribe.
    if (method === 'POST' && path === '/subscriptions') {
      if (state.subscriptionsFail) return json({ success: false, message: 'Failed to update subscriptions.', data: null }, 502)
      return json({ success: true, message: 'Successfully updated subscriptions.', data: null })
    }
    if (method === 'POST' && path === '/unsub') {
      if (state.unsubFails) return json({ success: false }, 502)
      return json({ success: true })
    }
    if (method === 'GET' && path === '/user') return json(USER)
    if (method === 'POST' && path === '/update_login') return json({ success: true })
    if (method === 'POST' && path === '/update_user') return json({ success: true })
    if (method === 'POST' && path === '/set_subs') return json({ success: true })
    if (method === 'POST' && path === '/quizzes') {
      if (state.saveQuizFails) return json({ message: 'Failed to put quiz results record.' }, 502)
      return json({ success: true })
    }
    // Practice sentences (/sentences). /sentences wraps its answer as
    // { success, message, data }; /user_activity is handled above.
    if (method === 'GET' && path === '/sentences') {
      if (state.sentencesFails) return json({ success: false, message: 'Failed to retrieve user sentences.', data: null }, 502)
      return json({ success: true, message: 'Successfully retrieved user sentences.', data: { sentences: state.sentences } })
    }
    if (method === 'POST' && path === '/sentences') {
      if (state.saveSentenceFails) return json({ success: false, message: 'Failed to save sentence.', data: null }, 502)
      return json({ success: true, message: 'Successfully saved sentence.', data: null })
    }
    if (method === 'GET' && path === '/progress') {
      if (state.progressFails) return json({ success: false, message: 'Failed to retrieve progress.', data: null }, 502)
      return json({ success: true, message: 'Successfully retrieved progress.', data: options.progress ?? {
        lists: [{ list_id: HSK1, total: 150, seen: 48, proficient: 6 }],
        proficient_rule: { min_quiz_answers: 2, min_quiz_accuracy: 0.8, sentence: true, stroke_order: true, quizzes_only_before: '2026-11-23' },
        streak: streakFixture()
      } })
    }
    if (method === 'POST' && path === '/writing') {
      if (state.saveWritingFails) return json({ success: false, message: 'Failed to save writing practice.', data: null }, 502)
      return json({ success: true, message: 'Successfully saved writing practice.', data: { date: '2026-11-20' } })
    }
    // Public profiles and leaderboard (vocab public_profile_service).
    if (method === 'GET' && path === '/leaderboard') {
      if (options.leaderboardFails) return json({ success: false, message: 'Failed to retrieve leaderboard.', data: null }, 502)
      return json({ success: true, message: 'Successfully retrieved leaderboard.', data: options.leaderboard ?? LEADERBOARD })
    }
    if (method === 'GET' && path === '/public_profile') {
      const handle = new URL(request.url()).searchParams.get('handle')
      const entry = (options.leaderboard ?? LEADERBOARD).entries.find((e) => e.handle === handle)
      if (!entry) return json({ success: false, message: 'Profile not found.', data: null }, 404)
      const { rank, ...profile } = entry
      return json({ success: true, message: 'Successfully retrieved profile.', data: profile })
    }
    if (method === 'POST' && path === '/public_profile') {
      const isPublic = request.postDataJSON()?.public
      return json({ success: true, message: 'Public profile updated.', data: { public: isPublic, handle: 'k7mq2xpa' } })
    }
    return json({ message: `No stand-in for ${method} ${path}` }, 404)
  })

  // Stroke data for handwriting practice, served from the installed
  // hanzi-writer-data package instead of jsDelivr.
  state.strokes = []
  await page.route(/^https:\/\/cdn\.jsdelivr\.net\/npm\/hanzi-writer-data@[^/]+\/(.+)\.json$/, async (route) => {
    const char = decodeURIComponent(route.request().url().match(/\/([^/]+)\.json$/)[1])
    state.strokes.push(char)
    if (options.strokesFail) return route.fulfill({ status: 404, body: 'not found' })
    try {
      const file = fileURLToPath(new URL(`../../../node_modules/hanzi-writer-data/${char}.json`, import.meta.url))
      return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: await readFile(file, 'utf8') })
    } catch {
      return route.fulfill({ status: 404, headers: cors, body: 'not found' })
    }
  })

  // Anything else leaving localhost is a surprise. Refuse it and remember it.
  await page.route(
    (url) => !['localhost', '127.0.0.1'].includes(url.hostname) &&
      !/cognito-idp\..*amazonaws\.com$|haohaotiantian\.com$|^cdn\.jsdelivr\.net$/.test(url.hostname),
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

// A streak as GET /progress returns it (streak_service.get_streak): five days,
// one of them covered by a spare day, today not done yet.
export function streakFixture (statuses = ['missed', 'done', 'done', 'saved', 'done', 'done', 'open'], extra = {}) {
  const today = new Date()
  const iso = (back) => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - back)).toISOString().slice(0, 10)
  return {
    current: 4, best: 12, buffer: 2, buffer_max: 3, today: iso(0), today_done: statuses[6] === 'done',
    recent: statuses.map((status, i) => ({ date: iso(6 - i), actions: status === 'done' ? 1 : 0, status })),
    ...extra
  }
}
