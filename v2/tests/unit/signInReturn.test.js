import { describe, it, expect, beforeEach } from 'vitest'
import { safeNext, signInRoute, rememberNext, takeNext } from '../../src/lib/signInReturn'

describe('safeNext', () => {
  it('keeps paths on this site, with their query', () => {
    expect(safeNext('/review?list_id=abc')).toBe('/review?list_id=abc')
    expect(safeNext('/profile-settings')).toBe('/profile-settings')
  })

  it('refuses anything that could leave the site', () => {
    for (const bad of ['//evil.example', 'https://evil.example', 'javascript:alert(1)', '/\\evil.example', 'review', '', null, undefined, 42]) {
      expect(safeNext(bad), String(bad)).toBeNull()
    }
  })

  it('refuses the sign-in pages themselves', () => {
    expect(safeNext('/signin?next=/review')).toBeNull()
    expect(safeNext('/verification?code=x')).toBeNull()
  })
})

describe('signInRoute', () => {
  it('carries the current page as next', () => {
    expect(signInRoute('/quiz?ques=5')).toEqual({ name: 'signin', query: { next: '/quiz?ques=5' } })
  })

  it('leaves the home page out, so sign-in leads to the profile from there', () => {
    expect(signInRoute('/')).toEqual({ name: 'signin', query: {} })
    expect(signInRoute('/?lang=cn')).toEqual({ name: 'signin', query: {} })
  })
})

describe('remember and take', () => {
  beforeEach(() => window.localStorage.clear())

  it('returns the remembered page once', () => {
    rememberNext('/review')
    expect(takeNext()).toBe('/review')
    expect(takeNext()).toBeNull()
  })

  it('forgets an earlier page when the new sign-in has none', () => {
    rememberNext('/review')
    rememberNext(undefined)
    expect(takeNext()).toBeNull()
  })

  it('never hands back something unsafe, even if storage was tampered with', () => {
    window.localStorage.setItem('hhtt.afterSignIn', '//evil.example')
    expect(takeNext()).toBeNull()
  })
})
