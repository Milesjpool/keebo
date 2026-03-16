import { formatTime, useKeydown, calcScrollOffset } from './utils'

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

describe('calcScrollOffset', () => {
  const charWidth = 16.8

  it('returns 0 for a short line that fits in the container', () => {
    expect(calcScrollOffset(3, 10, charWidth, 800)).toBe(0)
  })

  it('returns 0 for a single-char line', () => {
    expect(calcScrollOffset(0, 1, charWidth, 800)).toBe(0)
  })

  it('returns 0 when cursor is at start of a long line (lead-in)', () => {
    expect(calcScrollOffset(0, 200, charWidth, 800)).toBe(0)
  })

  it('returns 0 during lead-in while cursor is before center', () => {
    // halfWrap = 400, cursorPx = 10 * 16.8 = 168 → 168 - 400 < 0 → clamped to 0
    expect(calcScrollOffset(10, 200, charWidth, 800)).toBe(0)
  })

  it('starts scrolling once cursor passes center', () => {
    // halfWrap = 400, cursorPx = 30 * 16.8 = 504 → 504 - 400 = 104
    const offset = calcScrollOffset(30, 200, charWidth, 800)
    expect(offset).toBeCloseTo(104, 0)
  })

  it('keeps cursor centered in the middle of a long line', () => {
    // halfWrap = 400, cursorPx = 100 * 16.8 = 1680 → 1680 - 400 = 1280
    const offset = calcScrollOffset(100, 200, charWidth, 800)
    expect(offset).toBeCloseTo(1280, 0)
  })

  it('clamps at the end of line (lead-out)', () => {
    // lineWidthPx = 200 * 16.8 = 3360, maxOffset = 3360 - 800 = 2560
    // cursorPx = 199 * 16.8 = 3343.2, 3343.2 - 400 = 2943.2 → clamped to 2560
    const offset = calcScrollOffset(199, 200, charWidth, 800)
    expect(offset).toBeCloseTo(2560, 0)
  })

  it('handles cursor at exact line length (typing enter)', () => {
    // cursorIdx = lineLength = 200
    // cursorPx = 200 * 16.8 = 3360, 3360 - 400 = 2960 → clamped to 2560
    const offset = calcScrollOffset(200, 200, charWidth, 800)
    expect(offset).toBeCloseTo(2560, 0)
  })
})
