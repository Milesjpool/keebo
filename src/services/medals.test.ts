import { getMedal, getGroupMedal, THRESHOLDS } from './medals'
import type { Group, Progress } from './types'

describe('getMedal', () => {
  it('returns null for null', () => {
    expect(getMedal(null)).toBe(null)
  })

  it('returns null for undefined', () => {
    expect(getMedal(undefined)).toBe(null)
  })

  it('returns bronze for score 0', () => {
    expect(getMedal(0)).toBe('bronze')
  })

  it('returns bronze for score below silver threshold', () => {
    expect(getMedal(29)).toBe('bronze')
  })

  it('returns silver for score at silver threshold', () => {
    expect(getMedal(THRESHOLDS.silver)).toBe('silver')
  })

  it('returns silver for score between thresholds', () => {
    expect(getMedal(49)).toBe('silver')
  })

  it('returns gold for score at gold threshold', () => {
    expect(getMedal(THRESHOLDS.gold)).toBe('gold')
  })

  it('returns gold for score above gold threshold', () => {
    expect(getMedal(100)).toBe('gold')
  })
})

describe('getGroupMedal', () => {
  const group: Group = {
    id: 'g1',
    title: 'Test',
    flatStart: 0,
    lessons: [
      { id: 'l1', subtitle: 'a', lines: [], flatIdx: 0, title: 'a' },
      { id: 'l2', subtitle: 'b', lines: [], flatIdx: 1, title: 'b' },
    ],
  }

  it('returns null when no lessons have progress', () => {
    expect(getGroupMedal(group, {})).toBe(null)
  })

  it('returns bronze when all lessons are bronze', () => {
    const progress: Progress = {
      l1: { wpm: 20, elapsed: 30, accuracy: 1, score: 20 },
      l2: { wpm: 25, elapsed: 30, accuracy: 1, score: 25 },
    }
    expect(getGroupMedal(group, progress)).toBe('bronze')
  })

  it('returns gold when all lessons are gold', () => {
    const progress: Progress = {
      l1: { wpm: 55, elapsed: 20, accuracy: 1, score: 55 },
      l2: { wpm: 60, elapsed: 20, accuracy: 1, score: 60 },
    }
    expect(getGroupMedal(group, progress)).toBe('gold')
  })

  it('returns silver for mixed bronze and gold', () => {
    // bronze=1, gold=3, avg=2 → silver
    const progress: Progress = {
      l1: { wpm: 20, elapsed: 30, accuracy: 1, score: 20 },
      l2: { wpm: 55, elapsed: 20, accuracy: 1, score: 55 },
    }
    expect(getGroupMedal(group, progress)).toBe('silver')
  })

  it('handles partial progress (only some lessons done)', () => {
    const progress: Progress = {
      l1: { wpm: 55, elapsed: 20, accuracy: 1, score: 55 },
    }
    // Only one lesson has progress → gold rank 3, avg 3 → gold
    expect(getGroupMedal(group, progress)).toBe('gold')
  })
})
