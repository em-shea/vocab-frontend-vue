import { describe, it, expect } from 'vitest'
import * as flags from '../../src/featureFlags'

describe('feature flags', () => {
  it('exports HEROES_LAUNCHED as a boolean', () => {
    expect(typeof flags.HEROES_LAUNCHED).toBe('boolean')
  })

  it('exports SENTENCES_ENABLED as a boolean', () => {
    expect(typeof flags.SENTENCES_ENABLED).toBe('boolean')
  })
})
