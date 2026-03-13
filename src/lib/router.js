export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export function getUrl(groups, scr, gi, fi) {
  if (scr === 'groups') return BASE + '/'
  if (scr === 'lessons') return `${BASE}/group/${gi + 1}`
  if (scr === 'typing') {
    const li = fi - groups[gi].flatStart
    return `${BASE}/group/${gi + 1}/lesson/${li + 1}`
  }
  return BASE + '/'
}

export function findGroupIdx(groups, fi) {
  return groups.findIndex(
    (g) => fi >= g.flatStart && fi < g.flatStart + g.lessons.length,
  )
}

export function parseUrl(groups, flatLessons, pathname) {
  const p = pathname.slice(BASE.length) || '/'
  let m = p.match(/^\/group\/(\d+)\/lesson\/(\d+)/)
  if (m) {
    const gi = +m[1] - 1, li = +m[2] - 1
    if (gi >= 0 && gi < groups.length) {
      const fi = groups[gi].flatStart + li
      if (fi >= 0 && fi < flatLessons.length)
        return { screen: 'typing', groupIdx: gi, flatIdx: fi }
    }
  }
  m = p.match(/^\/lesson\/([0-9a-f-]{36})/)
  if (m) {
    const fi = flatLessons.findIndex((l) => l.id === m[1])
    if (fi >= 0)
      return { screen: 'typing', groupIdx: findGroupIdx(groups, fi), flatIdx: fi }
  }
  m = p.match(/^\/group\/(\d+)$/)
  if (m) {
    const gi = +m[1] - 1
    if (gi >= 0 && gi < groups.length)
      return { screen: 'lessons', groupIdx: gi, flatIdx: 0 }
  }
  return { screen: 'groups', groupIdx: 0, flatIdx: 0 }
}
