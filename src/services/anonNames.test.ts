import { getAnonName, rollNewName, setAnonName } from './anonNames'

describe('getAnonName', () => {
  it('returns stored name from localStorage', () => {
    localStorage.setItem('keebo:anon-name', 'calm camel')
    expect(getAnonName()).toBe('calm camel')
  })

  it('generates a new name when localStorage is empty', () => {
    const name = getAnonName()
    expect(name).toMatch(/^\w+ \w+$/)
  })

  it('stores the generated name in localStorage', () => {
    const name = getAnonName()
    expect(localStorage.getItem('keebo:anon-name')).toBe(name)
  })

  it('trims stored name', () => {
    localStorage.setItem('keebo:anon-name', '  calm camel  ')
    expect(getAnonName()).toBe('calm camel')
  })

  it('generates new name for empty stored value', () => {
    localStorage.setItem('keebo:anon-name', '   ')
    const name = getAnonName()
    expect(name).toMatch(/^\w+ \w+$/)
  })
})

describe('rollNewName', () => {
  it('returns a two-word name', () => {
    expect(rollNewName()).toMatch(/^\w+ \w+$/)
  })

  it('stores the new name in localStorage', () => {
    const name = rollNewName()
    expect(localStorage.getItem('keebo:anon-name')).toBe(name)
  })
})

describe('setAnonName', () => {
  it('stores trimmed name in localStorage', () => {
    setAnonName('  my name  ')
    expect(localStorage.getItem('keebo:anon-name')).toBe('my name')
  })

  it('does not store empty string', () => {
    setAnonName('initial')
    setAnonName('')
    expect(localStorage.getItem('keebo:anon-name')).toBe('initial')
  })

  it('does not store whitespace-only string', () => {
    setAnonName('initial')
    setAnonName('   ')
    expect(localStorage.getItem('keebo:anon-name')).toBe('initial')
  })
})
