import { loadProgress, saveProgress, mergeProgress } from './progress'
import type { Progress } from './types'

describe('loadProgress', () => {
  it('returns empty object when localStorage is empty', () => {
    expect(loadProgress()).toEqual({})
  })

  it('returns empty object for invalid JSON', () => {
    localStorage.setItem('keebo-progress', 'not json')
    expect(loadProgress()).toEqual({})
  })

  it('returns empty object for array', () => {
    localStorage.setItem('keebo-progress', '[1,2,3]')
    expect(loadProgress()).toEqual({})
  })

  it('returns empty object for string value', () => {
    localStorage.setItem('keebo-progress', '"hello"')
    expect(loadProgress()).toEqual({})
  })

  it('returns empty object for null value', () => {
    localStorage.setItem('keebo-progress', 'null')
    expect(loadProgress()).toEqual({})
  })

  it('returns parsed progress for valid data', () => {
    const data = { l1: { wpm: 45, elapsed: 30, accuracy: 0.95, score: 42.75 } }
    localStorage.setItem('keebo-progress', JSON.stringify(data))
    expect(loadProgress()).toEqual(data)
  })
})

describe('saveProgress', () => {
  it('writes JSON string to localStorage', () => {
    const data: Progress = { l1: { wpm: 45, elapsed: 30, accuracy: 0.95, score: 42.75 } }
    saveProgress(data)
    expect(localStorage.getItem('keebo-progress')).toBe(JSON.stringify(data))
  })

  it('overwrites existing progress', () => {
    saveProgress({ l1: { wpm: 30, elapsed: 40, accuracy: 0.9, score: 27 } })
    const newData: Progress = { l2: { wpm: 50, elapsed: 20, accuracy: 1, score: 50 } }
    saveProgress(newData)
    expect(JSON.parse(localStorage.getItem('keebo-progress')!)).toEqual(newData)
  })
})

describe('mergeProgress', () => {
  it('returns remote when local is empty', () => {
    const remote: Progress = { l1: { wpm: 45, elapsed: 30, accuracy: 0.95, score: 42.75 } }
    expect(mergeProgress({}, remote)).toEqual(remote)
  })

  it('returns local when remote is empty', () => {
    const local: Progress = { l1: { wpm: 45, elapsed: 30, accuracy: 0.95, score: 42.75 } }
    expect(mergeProgress(local, {})).toEqual(local)
  })

  it('keeps entry with higher score', () => {
    const local: Progress = { l1: { wpm: 50, elapsed: 25, accuracy: 1, score: 50 } }
    const remote: Progress = { l1: { wpm: 40, elapsed: 35, accuracy: 0.9, score: 36 } }
    expect(mergeProgress(local, remote)).toEqual(local)
  })

  it('keeps remote entry when remote score is higher', () => {
    const local: Progress = { l1: { wpm: 40, elapsed: 35, accuracy: 0.9, score: 36 } }
    const remote: Progress = { l1: { wpm: 50, elapsed: 25, accuracy: 1, score: 50 } }
    expect(mergeProgress(local, remote)).toEqual(remote)
  })

  it('keeps remote when scores are equal (remote is base)', () => {
    const rec = { wpm: 45, elapsed: 30, accuracy: 0.95, score: 42.75 }
    // local score is not > remote score, so remote stays
    expect(mergeProgress({ l1: rec }, { l1: rec })).toEqual({ l1: rec })
  })

  it('merges entries from both sources', () => {
    const local: Progress = { l1: { wpm: 50, elapsed: 25, accuracy: 1, score: 50 } }
    const remote: Progress = { l2: { wpm: 40, elapsed: 35, accuracy: 0.9, score: 36 } }
    const merged = mergeProgress(local, remote)
    expect(merged).toEqual({ ...remote, ...local })
  })
})
