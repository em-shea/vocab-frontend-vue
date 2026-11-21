import { describe, it, expect, vi, afterEach } from 'vitest'

// /sentences is held back by SENTENCES_ENABLED. Either way the path must
// resolve, because old links point at it.

async function routerWith (enabled) {
  vi.resetModules()
  vi.doMock('../../src/featureFlags', async (original) => ({ ...(await original()), SENTENCES_ENABLED: enabled }))
  const { routes } = await import('../../src/router')
  return routes
}

afterEach(() => { vi.doUnmock('../../src/featureFlags') })

describe('/sentences', () => {
  it('switched off, leads to the profile, keeping the query', async () => {
    const routes = await routerWith(false)
    const route = routes.find((r) => r.path === '/sentences')
    expect(route.component).toBeUndefined()
    expect(routes.some((r) => r.path === '/profile')).toBe(true)
    expect(route.redirect({ query: { lang: 'cn' } })).toEqual({ path: '/profile', query: { lang: 'cn' } })
  })

  it('switched on, is the sentences screen', async () => {
    const routes = await routerWith(true)
    const route = routes.find((r) => r.path === '/sentences')
    expect(route.redirect).toBeUndefined()
    expect(typeof route.component).toBe('function')
  })
})
