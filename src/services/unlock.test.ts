import { lastUnlockedGroup, lastUnlockedLesson } from './unlock'
import { testGroups, testFlatLessons, testProgress, fullGroupProgress } from '../test/fixtures'

describe('lastUnlockedGroup', () => {
  it('returns 0 when no progress', () => {
    expect(lastUnlockedGroup(testGroups, {})).toBe(0)
  })

  it('returns 0 when first group is partially complete', () => {
    expect(lastUnlockedGroup(testGroups, testProgress)).toBe(0)
  })

  it('returns 1 when first group is fully complete', () => {
    expect(lastUnlockedGroup(testGroups, fullGroupProgress)).toBe(1)
  })
})

describe('lastUnlockedLesson', () => {
  it('returns 0 for first group with no progress', () => {
    expect(lastUnlockedLesson(testGroups[0], testFlatLessons, {})).toBe(0)
  })

  it('returns last unlocked index when some are complete', () => {
    expect(lastUnlockedLesson(testGroups[0], testFlatLessons, testProgress)).toBe(1)
  })

  it('returns last index when all lessons done', () => {
    expect(lastUnlockedLesson(testGroups[0], testFlatLessons, fullGroupProgress)).toBe(1)
  })

  it('returns 0 for second group with no prior progress', () => {
    expect(lastUnlockedLesson(testGroups[1], testFlatLessons, {})).toBe(0)
  })

  it('returns last index for second group when all prior complete', () => {
    const allDone = {
      ...fullGroupProgress,
      l3: { wpm: 50, elapsed: 20, accuracy: 1, score: 50 },
      l4: { wpm: 50, elapsed: 20, accuracy: 1, score: 50 },
    }
    expect(lastUnlockedLesson(testGroups[1], testFlatLessons, allDone)).toBe(1)
  })
})
