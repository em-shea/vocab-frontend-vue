import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../../src/api/session', () => ({
  getSession: vi.fn(),
  getIdToken: vi.fn(),
  startSignIn: vi.fn(),
  answerSignInChallenge: vi.fn(),
  loadPendingSignIn: vi.fn(),
  signOut: vi.fn()
}))
vi.mock('../../src/api/client', () => ({
  api: { user: vi.fn(), updateLastLogin: vi.fn() }
}))

import * as session from '../../src/api/session'
import { api } from '../../src/api/client'
import { useAuthStore } from '../../src/stores/auth'

const USER = { email_address: 'a@example.com', subscriptions: [{ status: 'subscribed' }, { status: 'unsubscribed' }] }

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
  api.user.mockResolvedValue({ data: USER })
  api.updateLastLogin.mockResolvedValue({})
})

describe('auth store', () => {
  it('asks Cognito for a link, trimming stray whitespace from the address', async () => {
    await useAuthStore().requestSignInLink('  a@example.com ')
    expect(session.startSignIn).toHaveBeenCalledWith('a@example.com')
  })

  it('signs in, loads the user and records the login', async () => {
    session.answerSignInChallenge.mockResolvedValue({})
    const auth = useAuthStore()
    await auth.completeSignIn('code-1')
    expect(session.answerSignInChallenge).toHaveBeenCalledWith('code-1')
    expect(auth.signedIn).toBe(true)
    expect(auth.email).toBe('a@example.com')
    expect(auth.activeSubscriptions).toHaveLength(1)
    expect(api.updateLastLogin).toHaveBeenCalledTimes(1)
  })

  it('stays signed in when recording the login fails', async () => {
    session.answerSignInChallenge.mockResolvedValue({})
    api.updateLastLogin.mockRejectedValue(new Error('500'))
    const auth = useAuthStore()
    await expect(auth.completeSignIn('code-1')).resolves.toBeUndefined()
    expect(auth.signedIn).toBe(true)
  })

  it('stays signed out when the code is wrong', async () => {
    session.answerSignInChallenge.mockRejectedValue(Object.assign(new Error('x'), { code: 'IncorrectCode' }))
    const auth = useAuthStore()
    await expect(auth.completeSignIn('bad')).rejects.toMatchObject({ code: 'IncorrectCode' })
    expect(auth.signedIn).toBe(false)
    expect(api.user).not.toHaveBeenCalled()
  })

  it('unwraps the { success, data } envelope the API sometimes uses', async () => {
    api.user.mockResolvedValue({ data: { success: true, data: USER } })
    const auth = useAuthStore()
    await auth.loadUser()
    expect(auth.email).toBe('a@example.com')
  })

  it('restores nothing when signed out, without calling the API', async () => {
    session.getSession.mockResolvedValue(null)
    const auth = useAuthStore()
    expect(await auth.restore()).toBe(false)
    expect(api.user).not.toHaveBeenCalled()
  })

  it('forgets the user on sign-out', async () => {
    session.answerSignInChallenge.mockResolvedValue({})
    const auth = useAuthStore()
    await auth.completeSignIn('code-1')
    auth.signOut()
    expect(session.signOut).toHaveBeenCalled()
    expect(auth.signedIn).toBe(false)
    expect(auth.email).toBeNull()
  })
})
