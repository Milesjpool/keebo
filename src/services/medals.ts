import type { Group, Progress, Medal } from './types'

export const THRESHOLDS = { silver: 30, gold: 50 }
export const EMOJI: Record<Medal, string> = { bronze: '🥉', silver: '🥈', gold: '🏅' }

export function getMedal(score: number | null | undefined): Medal | null {
  if (score === null || score === undefined) return null
  if (score >= THRESHOLDS.gold) return 'gold'
  if (score >= THRESHOLDS.silver) return 'silver'
  return 'bronze'
}

const MEDAL_RANK: Record<Medal, number> = { bronze: 1, silver: 2, gold: 3 }
const RANK_MEDAL: Medal[] = ['bronze', 'bronze', 'silver', 'gold']

export function getGroupMedal(group: Group, progress: Progress): Medal | null {
  const ranks = group.lessons
    .map(l => MEDAL_RANK[getMedal(progress[l.id]?.score) as Medal])
    .filter((r): r is number => r != null)
  if (ranks.length === 0) return null
  return RANK_MEDAL[Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length)]
}
