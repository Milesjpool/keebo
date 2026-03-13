export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem('keebo-progress') ?? '{}')
    if (typeof saved === 'object' && saved !== null && !Array.isArray(saved))
      return saved
  } catch {}
  return {}
}

export function saveProgress(p) {
  localStorage.setItem('keebo-progress', JSON.stringify(p))
}

export function mergeProgress(local, remote) {
  const merged = { ...remote }
  for (const [id, rec] of Object.entries(local)) {
    if (!merged[id] || rec.score > (merged[id].score ?? 0)) merged[id] = rec
  }
  return merged
}
