import { getUrl, findGroupIdx, parseUrl, BASE } from './router'
import { testGroups, testFlatLessons } from '../test/fixtures'

// BASE depends on import.meta.env.BASE_URL which may differ between prod and test.
// Tests use the actual BASE value to stay environment-agnostic.

describe('getUrl', () => {
  it('returns base + / for groups screen', () => {
    expect(getUrl(testGroups, 'groups', 0, 0)).toBe(BASE + '/')
  })

  it('returns group URL for lessons screen', () => {
    expect(getUrl(testGroups, 'lessons', 0, 0)).toBe(`${BASE}/group/1`)
  })

  it('returns group URL for second group', () => {
    expect(getUrl(testGroups, 'lessons', 1, 0)).toBe(`${BASE}/group/2`)
  })

  it('returns lesson URL for first lesson', () => {
    expect(getUrl(testGroups, 'typing', 0, 0)).toBe(`${BASE}/group/1/lesson/1`)
  })

  it('returns lesson URL for second lesson in first group', () => {
    expect(getUrl(testGroups, 'typing', 0, 1)).toBe(`${BASE}/group/1/lesson/2`)
  })

  it('returns lesson URL for first lesson in second group', () => {
    expect(getUrl(testGroups, 'typing', 1, 2)).toBe(`${BASE}/group/2/lesson/1`)
  })

  it('returns base + / for unknown screen', () => {
    expect(getUrl(testGroups, 'complete' as any, 0, 0)).toBe(BASE + '/')
  })
})

describe('findGroupIdx', () => {
  it('returns 0 for flatIdx in first group', () => {
    expect(findGroupIdx(testGroups, 0)).toBe(0)
    expect(findGroupIdx(testGroups, 1)).toBe(0)
  })

  it('returns 1 for flatIdx in second group', () => {
    expect(findGroupIdx(testGroups, 2)).toBe(1)
    expect(findGroupIdx(testGroups, 3)).toBe(1)
  })

  it('returns -1 for out-of-range flatIdx', () => {
    expect(findGroupIdx(testGroups, 99)).toBe(-1)
    expect(findGroupIdx(testGroups, -1)).toBe(-1)
  })
})

describe('parseUrl', () => {
  it('returns groups screen for base + /', () => {
    expect(parseUrl(testGroups, testFlatLessons, BASE + '/')).toEqual({
      screen: 'groups', groupIdx: 0, flatIdx: 0,
    })
  })

  it('returns groups screen for bare base', () => {
    expect(parseUrl(testGroups, testFlatLessons, BASE || '/')).toEqual({
      screen: 'groups', groupIdx: 0, flatIdx: 0,
    })
  })

  it('parses group URL to lessons screen', () => {
    expect(parseUrl(testGroups, testFlatLessons, `${BASE}/group/2`)).toEqual({
      screen: 'lessons', groupIdx: 1, flatIdx: 0,
    })
  })

  it('parses lesson URL to typing screen', () => {
    expect(parseUrl(testGroups, testFlatLessons, `${BASE}/group/1/lesson/2`)).toEqual({
      screen: 'typing', groupIdx: 0, flatIdx: 1,
    })
  })

  it('parses lesson URL in second group', () => {
    expect(parseUrl(testGroups, testFlatLessons, `${BASE}/group/2/lesson/1`)).toEqual({
      screen: 'typing', groupIdx: 1, flatIdx: 2,
    })
  })

  it('returns groups screen for invalid group index', () => {
    expect(parseUrl(testGroups, testFlatLessons, `${BASE}/group/99`)).toEqual({
      screen: 'groups', groupIdx: 0, flatIdx: 0,
    })
  })

  it('returns groups screen for invalid lesson index', () => {
    expect(parseUrl(testGroups, testFlatLessons, `${BASE}/group/1/lesson/99`)).toEqual({
      screen: 'groups', groupIdx: 0, flatIdx: 0,
    })
  })

  it('returns groups screen for unknown path', () => {
    expect(parseUrl(testGroups, testFlatLessons, `${BASE}/unknown`)).toEqual({
      screen: 'groups', groupIdx: 0, flatIdx: 0,
    })
  })

  it('returns groups screen for group/0 (1-indexed)', () => {
    expect(parseUrl(testGroups, testFlatLessons, `${BASE}/group/0`)).toEqual({
      screen: 'groups', groupIdx: 0, flatIdx: 0,
    })
  })
})
