import { loadDifficulty, saveDifficulty } from './difficulty'

describe('loadDifficulty', () => {
  it('returns medium when nothing stored', () => {
    expect(loadDifficulty()).toBe('medium')
  })

  it('returns stored value when valid', () => {
    localStorage.setItem('keebo:difficulty', 'hard')
    expect(loadDifficulty()).toBe('hard')
  })

  it('returns medium for invalid stored value', () => {
    localStorage.setItem('keebo:difficulty', 'impossible')
    expect(loadDifficulty()).toBe('medium')
  })
})

describe('saveDifficulty', () => {
  it('persists to localStorage', () => {
    saveDifficulty('easy')
    expect(localStorage.getItem('keebo:difficulty')).toBe('easy')
  })
})
