import { describe, it, expect } from 'vitest'
import {
  HSK_LISTS, characterSet, uniqueId, catalogue, subscribed, available, adding, removing,
  subscriptionsPayload, readUnsubLink, looksLikeEmail, unsubPayload
} from '../../src/lib/lists'

const HSK1 = HSK_LISTS[0].list_id
const HSK2 = HSK_LISTS[1].list_id

describe('the list catalogue', () => {
  it('has every HSK list in both character sets, the reader’s own set first', () => {
    const all = catalogue(undefined, 'traditional')
    expect(all).toHaveLength(12)
    expect(all.slice(0, 6).every((l) => l.character_set === 'traditional')).toBe(true)
    expect(all[0]).toEqual({ list_id: HSK1, list_name: 'HSK Level 1', character_set: 'traditional', unique_list_id: `${HSK1}#TRADITIONAL` })
    expect(catalogue()[0].character_set).toBe('simplified')
  })

  it('builds the backend’s unique id from list and character set', () => {
    expect(uniqueId({ list_id: 'abc', character_set: 'simplified' })).toBe('abc#SIMPLIFIED')
  })

  it('accepts only the two character sets, in any case', () => {
    expect(characterSet('Traditional')).toBe('traditional')
    expect(characterSet('klingon')).toBeNull()
    expect(characterSet(undefined)).toBeNull()
  })
})

describe('subscriptions', () => {
  const user = {
    subscriptions: [
      { list_id: HSK1, list_name: 'HSK Level 1', character_set: 'simplified', status: 'subscribed' },
      { list_id: HSK2, list_name: 'HSK Level 2', character_set: 'traditional', status: 'unsubscribed' }
    ]
  }

  it('keeps only active subscriptions and gives each its unique id', () => {
    const subs = subscribed(user)
    expect(subs).toHaveLength(1)
    expect(subs[0].unique_list_id).toBe(`${HSK1}#SIMPLIFIED`)
    expect(subscribed(null)).toEqual([])
  })

  it('offers everything not already subscribed, so the same list in the other set stays available', () => {
    const rest = available(catalogue(), subscribed(user))
    expect(rest).toHaveLength(11)
    expect(rest.some((l) => l.unique_list_id === `${HSK1}#SIMPLIFIED`)).toBe(false)
    expect(rest.some((l) => l.unique_list_id === `${HSK1}#TRADITIONAL`)).toBe(true)
  })

  it('adds and removes without touching the original, and never adds twice', () => {
    const subs = subscribed(user)
    const hsk2 = catalogue().find((l) => l.unique_list_id === `${HSK2}#SIMPLIFIED`)
    const more = adding(subs, hsk2)
    expect(more).toHaveLength(2)
    expect(subs).toHaveLength(1)
    expect(adding(more, hsk2)).toBe(more)
    expect(removing(more, subs[0]).map((s) => s.unique_list_id)).toEqual([`${HSK2}#SIMPLIFIED`])
  })

  it('sends POST /subscriptions just the fields the handler reads', () => {
    expect(subscriptionsPayload(subscribed(user))).toEqual([
      { list_id: HSK1, list_name: 'HSK Level 1', character_set: 'simplified' }
    ])
  })
})

describe('the emailed unsubscribe link', () => {
  it('reads list, char and email as the daily email writes them', () => {
    const { email, list } = readUnsubLink({ list: HSK2, char: 'traditional', email: 'me+x@example.com' })
    expect(email).toBe('me+x@example.com')
    expect(list).toMatchObject({ list_id: HSK2, list_name: 'HSK Level 2', character_set: 'traditional', unique_list_id: `${HSK2}#TRADITIONAL` })
  })

  it('keeps a list it does not know by name rather than dropping it', () => {
    const { list } = readUnsubLink({ list: 'my-own-list', char: 'simplified' })
    expect(list).toMatchObject({ list_id: 'my-own-list', list_name: null, character_set: 'simplified' })
  })

  it('ignores a list without a usable character set, and odd values', () => {
    expect(readUnsubLink({ list: HSK1 }).list).toBeNull()
    expect(readUnsubLink({ list: HSK1, char: 'klingon' }).list).toBeNull()
    expect(readUnsubLink({ email: ['a@b.co', 'c@d.co'] }).email).toBe('a@b.co')
    expect(readUnsubLink().email).toBe('')
  })
})

describe('POST /unsub', () => {
  const list = catalogue()[1]

  it('names one list with the fields the handler reads', () => {
    expect(unsubPayload({ email: ' me@example.com ', list, all: false })).toEqual({
      cognito_id: '',
      email: 'me@example.com',
      list: { list_id: HSK2, list_name: 'HSK Level 2', character_set: 'simplified' }
    })
  })

  it('sends an empty list for every list, and only when asked', () => {
    expect(unsubPayload({ email: 'me@example.com', list, all: true }).list).toBe('')
    expect(() => unsubPayload({ email: 'me@example.com', list: null, all: false })).toThrow()
  })

  it('gives an unnamed list a name, which the handler logs', () => {
    const own = readUnsubLink({ list: 'mine', char: 'simplified' }).list
    expect(unsubPayload({ email: 'a@b.co', list: own, all: false }).list.list_name).toBe('Vocab list')
  })

  it('checks the address loosely', () => {
    expect(looksLikeEmail('me@example.com')).toBe(true)
    expect(looksLikeEmail('me@example')).toBe(false)
    expect(looksLikeEmail('')).toBe(false)
  })
})
