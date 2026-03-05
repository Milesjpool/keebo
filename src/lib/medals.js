export const THRESHOLDS = { silver: 30, gold: 50 }
export const EMOJI = { bronze: '🥉', silver: '🥈', gold: '🏅' }

export function getMedal(score) {
  if (score == null) return null
  if (score >= THRESHOLDS.gold) return 'gold'
  if (score >= THRESHOLDS.silver) return 'silver'
  return 'bronze'
}

const MEDAL_RANK = { bronze: 1, silver: 2, gold: 3 }
const RANK_MEDAL = ['bronze', 'bronze', 'silver', 'gold']

export function getGroupMedal(group, progress) {
  const ranks = group.lessons
    .map(l => MEDAL_RANK[getMedal(progress[l.id]?.score)])
    .filter(r => r != null)
  if (ranks.length === 0) return null
  return RANK_MEDAL[Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length)]
}
