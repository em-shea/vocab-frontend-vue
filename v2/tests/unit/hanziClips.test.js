import { describe, it, expect } from 'vitest'
import { repointClips } from '../../src/lib/hanziClips'

describe('repointClips', () => {
  it('drops the page address from clip and mask references', () => {
    const root = document.createElement('div')
    root.innerHTML = '<svg><g clip-path="url(&quot;https://x.test/quiz?a=1#mask-3&quot;)"></g><g mask="url(https://x.test/#m-4)"></g><g fill="red"></g></svg>'
    repointClips(root)
    const [a, b, c] = root.querySelectorAll('g')
    expect(a.getAttribute('clip-path')).toBe('url(#mask-3)')
    expect(b.getAttribute('mask')).toBe('url(#m-4)')
    expect(c.hasAttribute('clip-path')).toBe(false)
  })
  it('does nothing without a root', () => {
    expect(() => repointClips(null)).not.toThrow()
  })
})
