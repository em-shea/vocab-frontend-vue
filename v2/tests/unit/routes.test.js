import { describe, it, expect } from 'vitest'
import { routes } from '../../src/router'
import { LEGACY_PATHS, NOT_YET_PORTED } from '../../src/router/legacy'

// Every path the old site serves is linked from emails and bookmarks we cannot
// change. This holds the port to that list; see src/router/legacy.js.

const routed = new Set(routes.map((r) => r.path))

describe('legacy paths', () => {
  it.each(LEGACY_PATHS)('%s is either ported or explicitly outstanding', (path) => {
    const ported = routed.has(path)
    const outstanding = NOT_YET_PORTED.includes(path)
    expect(ported || outstanding, `${path} has been dropped: route it or list it as not yet ported`).toBe(true)
    expect(ported && outstanding, `${path} is routed but still listed as not yet ported`).toBe(false)
  })

  it('lists nothing as outstanding that the old site never served', () => {
    expect(NOT_YET_PORTED.filter((p) => !LEGACY_PATHS.includes(p))).toEqual([])
  })

  it('keeps the emailed sign-in link working', () => {
    // CreateAuthChallenge builds https://<site>/verification?code=… — see
    // vocab/src/user_pool_triggers/create_auth_challenge/app.py.
    expect(routed.has('/verification')).toBe(true)
    expect(routed.has('/signin')).toBe(true)
  })
})
