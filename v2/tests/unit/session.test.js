import { describe, it, expect, beforeEach } from 'vitest'
import {
  savePendingSignIn,
  loadPendingSignIn,
  clearPendingSignIn,
  answerSignInChallenge
} from '../../src/api/session'

beforeEach(() => window.localStorage.clear())

describe('pending sign-in', () => {
  it('survives a page load between /signin and the emailed link', () => {
    savePendingSignIn({ username: 'a@example.com', session: 'sess-1' })
    expect(loadPendingSignIn()).toEqual({ username: 'a@example.com', session: 'sess-1' })
  })

  it('reads what the Vue 2 app stored, so links requested before cutover still work', () => {
    window.localStorage.setItem('localSessionData', JSON.stringify({ username: 'a@example.com', session: 's' }))
    expect(loadPendingSignIn()?.username).toBe('a@example.com')
  })

  it.each([
    ['nothing stored', null],
    ['corrupt JSON', '{not json'],
    ['no session', JSON.stringify({ username: 'a@example.com' })],
    ['a JSON null', 'null']
  ])('is null with %s', (_name, raw) => {
    if (raw !== null) window.localStorage.setItem('localSessionData', raw)
    expect(loadPendingSignIn()).toBeNull()
  })

  it('can be cleared', () => {
    savePendingSignIn({ username: 'a@example.com', session: 's' })
    clearPendingSignIn()
    expect(loadPendingSignIn()).toBeNull()
  })

  it('refuses to answer a challenge nobody asked for, without calling Cognito', async () => {
    await expect(answerSignInChallenge('123')).rejects.toMatchObject({ code: 'NoPendingSignIn' })
  })
})
