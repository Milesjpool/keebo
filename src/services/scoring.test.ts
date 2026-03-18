import { calculateScore } from './scoring'

describe('calculateScore', () => {
  it('returns wpm * accuracy for medium difficulty', () => {
    expect(calculateScore(60, 1.0, 'medium')).toBe(60)
  })

  it('applies 0.8x multiplier for easy', () => {
    expect(calculateScore(50, 1.0, 'easy')).toBe(40)
  })

  it('applies 1.25x multiplier for hard', () => {
    expect(calculateScore(40, 1.0, 'hard')).toBe(50)
  })

  it('factors in accuracy', () => {
    expect(calculateScore(100, 0.5, 'medium')).toBe(50)
  })

  it('returns 0 for 0 wpm', () => {
    expect(calculateScore(0, 1.0, 'hard')).toBe(0)
  })
})
