import { render, screen, fireEvent } from '@testing-library/svelte'
import { tick, mount, createRawSnippet } from 'svelte'
import TypingView from './TypingView.svelte'
import type { Lesson } from '../services/types'

// Mock Svelte component imports with no-op components
function mockComponent() {
  return {
    default: function($$anchor: any, $$props: any) {
      // no-op Svelte 5 component
    },
  }
}

vi.mock('../components/AuthButton.svelte', () => mockComponent())
vi.mock('../components/FingerIndicator.svelte', () => mockComponent())

const testLesson: Lesson = {
  id: 'l1',
  subtitle: 'test',
  lines: ['abc', 'def'],
  flatIdx: 0,
  title: 'Test · test',
  fingerHints: false,
}

function renderTypingView(overrides = {}) {
  return render(TypingView, {
    props: {
      lesson: testLesson,
      onComplete: vi.fn(),
      onBack: vi.fn(),
      difficulty: 'medium' as const,
      user: null,
      authReady: true,
      onSignIn: vi.fn(),
      onSignOut: vi.fn(),
      ...overrides,
    },
  })
}

describe('TypingView', () => {
  it('renders the first line of the lesson', () => {
    renderTypingView()
    // Each character is rendered as a span
    const chars = document.querySelectorAll('.char')
    // 'abc' = 3 chars + return symbol = 4
    expect(chars.length).toBeGreaterThanOrEqual(3)
  })

  it('shows all characters as untyped or cursor initially', () => {
    renderTypingView()
    const untypedChars = document.querySelectorAll('.char.untyped')
    const cursorChars = document.querySelectorAll('.char.cursor')
    expect(untypedChars.length).toBe(2) // 'b', 'c'
    expect(cursorChars.length).toBe(1) // 'a' has cursor
  })

  it('marks character as correct when correct key is pressed', async () => {
    renderTypingView()
    await fireEvent.keyDown(window, { key: 'a' })
    const correctChars = document.querySelectorAll('.char.correct')
    expect(correctChars.length).toBe(1)
  })

  it('marks character as error when wrong key is pressed', async () => {
    renderTypingView()
    await fireEvent.keyDown(window, { key: 'x' })
    const errorChars = document.querySelectorAll('.char.error')
    expect(errorChars.length).toBe(1)
  })

  it('moves cursor forward on each keypress', async () => {
    renderTypingView()
    await fireEvent.keyDown(window, { key: 'a' })
    await fireEvent.keyDown(window, { key: 'b' })
    // Two chars typed, cursor should be on third char
    const cursorChars = document.querySelectorAll('.char.cursor')
    expect(cursorChars.length).toBe(1)
  })

  it('removes last character on Backspace', async () => {
    renderTypingView()
    await fireEvent.keyDown(window, { key: 'a' })
    await fireEvent.keyDown(window, { key: 'b' })
    await fireEvent.keyDown(window, { key: 'Backspace' })

    const correctChars = document.querySelectorAll('.char.correct')
    expect(correctChars.length).toBe(1) // only 'a' remains
  })

  it('does not type beyond line length', async () => {
    renderTypingView()
    await fireEvent.keyDown(window, { key: 'a' })
    await fireEvent.keyDown(window, { key: 'b' })
    await fireEvent.keyDown(window, { key: 'c' })
    await fireEvent.keyDown(window, { key: 'x' }) // should be ignored

    const typedChars = document.querySelectorAll('.char.correct, .char.error')
    expect(typedChars.length).toBe(3) // still just 3
  })

  it('advances to next line on Enter when typed matches', async () => {
    vi.useFakeTimers()
    renderTypingView()
    // Type 'abc' correctly
    await fireEvent.keyDown(window, { key: 'a' })
    await fireEvent.keyDown(window, { key: 'b' })
    await fireEvent.keyDown(window, { key: 'c' })
    await fireEvent.keyDown(window, { key: 'Enter' })
    vi.advanceTimersByTime(300)
    await tick()

    // Should now show 'def' — first char has cursor, rest untyped
    const untypedChars = document.querySelectorAll('.char.untyped')
    expect(untypedChars.length).toBe(2) // 'e', 'f' (cursor on 'd')
    const cursorChars = document.querySelectorAll('.char.cursor')
    expect(cursorChars.length).toBe(1) // 'd'
    vi.useRealTimers()
  })

  it('does not advance on Enter when line is incomplete', async () => {
    renderTypingView()
    await fireEvent.keyDown(window, { key: 'a' })
    await fireEvent.keyDown(window, { key: 'Enter' })

    // Should still be on first line
    const correctChars = document.querySelectorAll('.char.correct')
    expect(correctChars.length).toBe(1) // 'a' still correct
  })

  it('does not shake on Enter when typed does not match line', async () => {
    renderTypingView()
    await fireEvent.keyDown(window, { key: 'x' })
    await fireEvent.keyDown(window, { key: 'y' })
    await fireEvent.keyDown(window, { key: 'z' })
    await fireEvent.keyDown(window, { key: 'Enter' })

    const shaking = document.querySelector('.line-wrap.shaking')
    expect(shaking).toBeNull()
  })

  it('calls onComplete with stats when last line is completed', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    renderTypingView({ onComplete })

    // Complete first line
    await fireEvent.keyDown(window, { key: 'a' })
    await fireEvent.keyDown(window, { key: 'b' })
    await fireEvent.keyDown(window, { key: 'c' })
    await fireEvent.keyDown(window, { key: 'Enter' })
    vi.advanceTimersByTime(300)
    await tick()

    // Complete second line
    await fireEvent.keyDown(window, { key: 'd' })
    await fireEvent.keyDown(window, { key: 'e' })
    await fireEvent.keyDown(window, { key: 'f' })
    await fireEvent.keyDown(window, { key: 'Enter' })

    expect(onComplete).toHaveBeenCalledOnce()
    const stats = onComplete.mock.calls[0][0]
    expect(stats).toHaveProperty('wpm')
    expect(stats).toHaveProperty('elapsed')
    expect(stats).toHaveProperty('accuracy')
    expect(stats.accuracy).toBe(1) // all correct
    vi.useRealTimers()
  })

  it('calls onBack on Escape', async () => {
    const onBack = vi.fn()
    renderTypingView({ onBack })
    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('renders correct number of progress bar segments', () => {
    renderTypingView()
    const segments = document.querySelectorAll('.segment')
    expect(segments.length).toBe(2) // testLesson has 2 lines
  })

  it('ignores modifier key combinations', async () => {
    renderTypingView()
    await fireEvent.keyDown(window, { key: 'a', ctrlKey: true })
    await fireEvent.keyDown(window, { key: 'a', metaKey: true })
    await fireEvent.keyDown(window, { key: 'a', altKey: true })

    const typedChars = document.querySelectorAll('.char.correct, .char.error')
    expect(typedChars.length).toBe(0) // no chars typed
  })

  it('advances on mismatched line in medium mode', async () => {
    vi.useFakeTimers()
    renderTypingView({ difficulty: 'medium' })
    // Type 'xyz' (all wrong)
    await fireEvent.keyDown(window, { key: 'x' })
    await fireEvent.keyDown(window, { key: 'y' })
    await fireEvent.keyDown(window, { key: 'z' })
    await fireEvent.keyDown(window, { key: 'Enter' })
    vi.advanceTimersByTime(300)
    await tick()

    // In medium mode, should advance
    const untypedChars = document.querySelectorAll('.char.untyped')
    expect(untypedChars.length).toBe(2) // 'e', 'f' on second line (cursor on 'd')
    vi.useRealTimers()
  })

  it('ignores incorrect keystrokes in easy mode', async () => {
    renderTypingView({ difficulty: 'easy' })
    await fireEvent.keyDown(window, { key: 'x' }) // wrong, should be ignored
    await fireEvent.keyDown(window, { key: 'a' }) // correct

    const correctChars = document.querySelectorAll('.char.correct')
    const errorChars = document.querySelectorAll('.char.error')
    expect(correctChars.length).toBe(1) // only 'a'
    expect(errorChars.length).toBe(0) // no errors possible
  })

  it('ignores backspace in easy mode', async () => {
    renderTypingView({ difficulty: 'easy' })
    await fireEvent.keyDown(window, { key: 'a' })
    await fireEvent.keyDown(window, { key: 'Backspace' })

    const correctChars = document.querySelectorAll('.char.correct')
    expect(correctChars.length).toBe(1) // 'a' still there
  })

  it('ignores backspace in hard mode', async () => {
    renderTypingView({ difficulty: 'hard' })
    await fireEvent.keyDown(window, { key: 'a' })
    await fireEvent.keyDown(window, { key: 'x' }) // wrong, but typed
    await fireEvent.keyDown(window, { key: 'Backspace' }) // should be ignored

    const correctChars = document.querySelectorAll('.char.correct')
    const errorChars = document.querySelectorAll('.char.error')
    expect(correctChars.length).toBe(1) // 'a'
    expect(errorChars.length).toBe(1) // 'x' error stays
  })

  it('allows wrong keystrokes in hard mode', async () => {
    renderTypingView({ difficulty: 'hard' })
    await fireEvent.keyDown(window, { key: 'x' }) // wrong, should be accepted

    const errorChars = document.querySelectorAll('.char.error')
    expect(errorChars.length).toBe(1)
  })

  it('includes difficulty in onComplete stats', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    renderTypingView({ onComplete, difficulty: 'hard' })

    // Complete both lines
    await fireEvent.keyDown(window, { key: 'a' })
    await fireEvent.keyDown(window, { key: 'b' })
    await fireEvent.keyDown(window, { key: 'c' })
    await fireEvent.keyDown(window, { key: 'Enter' })
    vi.advanceTimersByTime(300)
    await tick()
    await fireEvent.keyDown(window, { key: 'd' })
    await fireEvent.keyDown(window, { key: 'e' })
    await fireEvent.keyDown(window, { key: 'f' })
    await fireEvent.keyDown(window, { key: 'Enter' })

    expect(onComplete).toHaveBeenCalledOnce()
    expect(onComplete.mock.calls[0][0].difficulty).toBe('hard')
    vi.useRealTimers()
  })
})
