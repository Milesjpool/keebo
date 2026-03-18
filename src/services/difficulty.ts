import type { Difficulty } from './types'

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = { easy: 0.8, medium: 1.0, hard: 1.25 }
export const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: 'assist', medium: 'normal', hard: 'strict' }
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
export const DEFAULT_DIFFICULTY: Difficulty = 'medium'

const STORAGE_KEY = 'keebo:difficulty'

export function loadDifficulty(): Difficulty {
  const val = localStorage.getItem(STORAGE_KEY)
  if (val === 'easy' || val === 'medium' || val === 'hard') return val
  return DEFAULT_DIFFICULTY
}

export function saveDifficulty(d: Difficulty): void {
  localStorage.setItem(STORAGE_KEY, d)
}
