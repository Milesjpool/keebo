import { render, fireEvent } from '@testing-library/svelte'
import LessonComplete from './LessonComplete.svelte'
import type { Lesson, Stats } from '../services/types'

const testLesson: Lesson = {
  id: 'l1',
  subtitle: 'test',
  lines: ['abc'],
  flatIdx: 0,
  title: 'Home Row · test',
}

const testStats: Stats = {
  wpm: 55,
  elapsed: 42,
  accuracy: 0.96,
}

function renderComplete(overrides = {}) {
  return render(LessonComplete, {
    props: {
      lesson: testLesson,
      hasNext: true,
      stats: testStats,
      onNext: vi.fn(),
      onBack: vi.fn(),
      ...overrides,
    },
  })
}

describe('LessonComplete', () => {
  it('displays the lesson title', () => {
    renderComplete()
    expect(document.body.textContent).toContain('Home Row · test')
  })

  it('displays WPM', () => {
    renderComplete()
    expect(document.body.textContent).toContain('55')
    expect(document.body.textContent).toContain('wpm')
  })

  it('displays formatted time', () => {
    renderComplete()
    expect(document.body.textContent).toContain('42s')
  })

  it('displays accuracy percentage', () => {
    renderComplete()
    expect(document.body.textContent).toContain('96%')
  })

  it('shows next lesson button when hasNext is true', () => {
    renderComplete({ hasNext: true })
    expect(document.body.textContent).toContain('next lesson')
  })

  it('hides next lesson button when hasNext is false', () => {
    renderComplete({ hasNext: false })
    expect(document.body.textContent).not.toContain('next lesson')
  })

  it('always shows back to lessons button', () => {
    renderComplete({ hasNext: false })
    expect(document.body.textContent).toContain('back to lessons')
  })

  it('Enter calls onNext when hasNext is true', async () => {
    const onNext = vi.fn()
    renderComplete({ hasNext: true, onNext })
    await fireEvent.keyDown(window, { key: 'Enter' })
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('Enter calls onBack when hasNext is false', async () => {
    const onBack = vi.fn()
    renderComplete({ hasNext: false, onBack })
    await fireEvent.keyDown(window, { key: 'Enter' })
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('Escape calls onBack', async () => {
    const onBack = vi.fn()
    renderComplete({ onBack })
    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('shows medal podium', () => {
    renderComplete()
    // Score = 55 * 0.96 = 52.8 → gold
    const podium = document.querySelector('.podium')
    expect(podium).not.toBeNull()
  })

  it('marks unearned medals with unearned class', () => {
    // Score < 30 → bronze only
    renderComplete({ stats: { wpm: 20, elapsed: 60, accuracy: 1 } })
    const unearned = document.querySelectorAll('.unearned')
    expect(unearned.length).toBe(2) // gold and silver are unearned
  })
})
