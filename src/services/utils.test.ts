import { formatTime, useKeydown } from './utils'

describe('formatTime', () => {
  it('formats 0 seconds as 0:00', () => {
    expect(formatTime(0)).toBe('0:00')
  })

  it('formats single-digit seconds with leading zero', () => {
    expect(formatTime(5)).toBe('0:05')
  })

  it('formats 59 seconds', () => {
    expect(formatTime(59)).toBe('0:59')
  })

  it('formats 60 seconds as 1:00', () => {
    expect(formatTime(60)).toBe('1:00')
  })

  it('formats 65 seconds as 1:05', () => {
    expect(formatTime(65)).toBe('1:05')
  })

  it('formats 3600 seconds as 60:00', () => {
    expect(formatTime(3600)).toBe('60:00')
  })
})

describe('useKeydown', () => {
  it('calls handler for matching key', () => {
    const handler = vi.fn()
    const cleanup = useKeydown({ Enter: handler })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(handler).toHaveBeenCalledOnce()
    cleanup()
  })

  it('does not call handler for non-matching key', () => {
    const handler = vi.fn()
    const cleanup = useKeydown({ Enter: handler })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(handler).not.toHaveBeenCalled()
    cleanup()
  })

  it('cleanup removes the listener', () => {
    const handler = vi.fn()
    const cleanup = useKeydown({ Enter: handler })
    cleanup()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(handler).not.toHaveBeenCalled()
  })

  it('stopAll mode captures events and prevents other handlers', () => {
    const outer = vi.fn()
    const inner = vi.fn()
    const cleanupOuter = useKeydown({ Enter: outer })
    const cleanupInner = useKeydown({ Enter: inner }, { stopAll: true })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(inner).toHaveBeenCalledOnce()
    // outer should not fire because stopAll calls stopImmediatePropagation
    expect(outer).not.toHaveBeenCalled()

    cleanupInner()
    cleanupOuter()
  })

  it('stopAll stack: last registered handler wins', () => {
    const first = vi.fn()
    const second = vi.fn()
    const cleanup1 = useKeydown({ Enter: first }, { stopAll: true })
    const cleanup2 = useKeydown({ Enter: second }, { stopAll: true })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(second).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()

    cleanup2()
    cleanup1()
  })

  it('stopAll cleanup restores previous handler', () => {
    const first = vi.fn()
    const second = vi.fn()
    const cleanup1 = useKeydown({ Enter: first }, { stopAll: true })
    const cleanup2 = useKeydown({ Enter: second }, { stopAll: true })

    cleanup2()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(first).toHaveBeenCalledOnce()
    expect(second).not.toHaveBeenCalled()

    cleanup1()
  })
})
