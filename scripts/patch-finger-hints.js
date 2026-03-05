// Patches src/lessons.json with fingerHints: true/false based on raw HTML
import { readFileSync, writeFileSync, readdirSync } from 'fs'

function extractText(html) {
  const m = html.match(/id="type_text"[^>]+value="([^"]*)"/) ||
            html.match(/value="([^"]*)"[^>]+id="type_text"/)
  if (!m) return null
  return m[1]
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\\n/g, ' ')
}

function hasFingerHints(html) {
  return html.includes('id="hand_left"')
}

const files = readdirSync('scripts/raw').filter(f => f.endsWith('.html'))
const byLesson = {}
for (const f of files) {
  const m = f.match(/lesson(\d+)_part(\d+)\.html/)
  if (!m) continue
  const [, L, P] = m.map(Number)
  if (!byLesson[L]) byLesson[L] = []
  byLesson[L].push(P)
}

// Replicate parse-lessons.js dedup logic to get ordered list of included parts
const order = []
const globalSeen = new Set()
for (const L of Object.keys(byLesson).map(Number).sort((a, b) => a - b)) {
  const parts = byLesson[L].sort((a, b) => a - b)
  const localSeen = new Set()
  for (const P of parts) {
    const html = readFileSync(`scripts/raw/lesson${L}_part${P}.html`, 'utf8')
    const text = extractText(html)
    if (!text) continue
    if (localSeen.has(text)) break
    if (globalSeen.has(text)) { localSeen.add(text); continue }
    localSeen.add(text)
    globalSeen.add(text)
    order.push({ L, P, hints: hasFingerHints(html) })
  }
}

const json = JSON.parse(readFileSync('src/lessons.json', 'utf8'))
const flat = json.groups.flatMap(g => g.lessons)

if (flat.length !== order.length) {
  console.error(`Mismatch: ${flat.length} lessons in JSON vs ${order.length} raw entries`)
  process.exit(1)
}

for (let i = 0; i < flat.length; i++) {
  flat[i].fingerHints = order[i].hints
}

writeFileSync('src/lessons.json', JSON.stringify(json, null, 2))

console.log(`Patched ${flat.length} lessons`)
console.log(`  With hints: ${order.filter(x => x.hints).length}`)
console.log(`  Without:    ${order.filter(x => !x.hints).length}`)
