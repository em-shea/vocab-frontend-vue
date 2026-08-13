import axios from 'axios'
import { getIdToken } from './session'

// The single place the app talks to the API.
//
// The Vue 2 app made 16 inline axios calls across its views, each rebuilding the
// base URL and auth header by hand, against an axios loaded from a CDN. This
// replaces all of that: axios is a real dependency, the base URL comes from the
// build mode, and authorised calls attach the token in one interceptor.

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// The API Gateway Cognito authorizer expects the raw JWT. It is NOT a Bearer
// token - prefixing it makes every authorised request fail with 401.
client.interceptors.request.use(async (config) => {
  if (config.auth !== false) {
    const token = await getIdToken()
    if (token) {
      config.headers.Authorization = token
    }
  }
  return config
})

// Endpoints, named for what they do rather than where they live, so views never
// hold URL strings.
export const api = {
  // --- public ---
  sampleVocab: () => client.get('/sample_vocab', { auth: false }),
  reviewWords: ({ listId, dateRange } = {}) =>
    client.get('/review', { auth: false, params: { list_id: listId, date_range: dateRange } }),
  signUp: (payload) => client.post('/set_subs', payload, { auth: false }),
  unsubscribe: (payload) => client.post('/unsub', payload, { auth: false }),

  // --- signed in ---
  user: () => client.get('/user'),
  userActivity: () => client.get('/user_activity'),
  updateUser: (payload) => client.post('/update_user', payload),
  updateLastLogin: (payload) => client.post('/update_login', payload),
  updateSubscriptions: (subscriptions) => client.post('/subscriptions', { subscriptions }),
  quizzes: (dateRange) => client.get('/quizzes', { params: { date_range: dateRange } }),
  saveQuiz: (payload) => client.post('/quizzes', payload),
  sentences: () => client.get('/sentences'),
  saveSentence: (payload) => client.post('/sentences', payload)
}

export default client
