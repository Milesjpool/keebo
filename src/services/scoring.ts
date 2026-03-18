import type { Difficulty } from './types'
import { DIFFICULTY_MULTIPLIER } from './difficulty'

export function calculateScore(wpm: number, accuracy: number, difficulty: Difficulty): number {
  return wpm * accuracy * DIFFICULTY_MULTIPLIER[difficulty]
}
