import { render, fireEvent } from '@testing-library/svelte'
import ThemeToggle from './ThemeToggle.svelte'

describe('ThemeToggle', () => {
  it('renders the theme emoji', () => {
    render(ThemeToggle)
    const emoji = document.querySelector('.emoji')
    expect(emoji).not.toBeNull()
    // Default is 'auto' (from localStorage which starts empty → fallback)
    expect(emoji?.textContent).toBe('🌍')
  })

  it('sets data-theme attribute on document element', () => {
    render(ThemeToggle)
    expect(document.documentElement.getAttribute('data-theme')).toBe('auto')
  })

  it('persists theme to localStorage', () => {
    render(ThemeToggle)
    expect(localStorage.getItem('theme')).toBe('auto')
  })

  it('cycles theme on click: auto → dark → light → auto', async () => {
    render(ThemeToggle)
    const button = document.querySelector('.theme-toggle')!

    // auto → dark
    await fireEvent.click(button)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    // dark → light
    await fireEvent.click(button)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')

    // light → auto
    await fireEvent.click(button)
    expect(document.documentElement.getAttribute('data-theme')).toBe('auto')
    expect(localStorage.getItem('theme')).toBe('auto')
  })

  it('restores theme from localStorage', () => {
    localStorage.setItem('theme', 'light')
    render(ThemeToggle)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    const emoji = document.querySelector('.emoji')
    expect(emoji?.textContent).toBe('🌞')
  })
})
