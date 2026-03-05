// Parses raw HTML files from scripts/raw/ into src/lessons.json
import { readFileSync, writeFileSync, readdirSync } from 'fs'

function extractText(html) {
  const m = html.match(/id="type_text"[^>]+value="([^"]*)"/) ||
            html.match(/value="([^"]*)"[^>]+id="type_text"/)
  if (!m) return null
  return m[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
  if (!m) return null
  return m[1].trim()
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}

function textToLines(text) {
  return text.split(/[¶\n]/).map(l => l.trim()).filter(Boolean)
}

// Collect all raw files, grouped by lesson
const files = readdirSync('scripts/raw').filter(f => f.endsWith('.html'))
const byLesson = {}
for (const f of files) {
  const m = f.match(/lesson(\d+)_part(\d+)\.html/)
  if (!m) continue
  const [, L, P] = m.map(Number)
  if (!byLesson[L]) byLesson[L] = []
  byLesson[L].push(P)
}

const groups = []
const globalSeenTexts = new Set()

for (const L of Object.keys(byLesson).map(Number).sort((a, b) => a - b)) {
  const parts = byLesson[L].sort((a, b) => a - b)
  let groupTitle = `Lesson ${L}`
  const lessons = []
  const seenTexts = new Set()

  for (const P of parts) {
    const html = readFileSync(`scripts/raw/lesson${L}_part${P}.html`, 'utf8')
    const rawText = extractText(html)
    if (!rawText) continue
    if (seenTexts.has(rawText)) {
      console.log(`  Lesson ${L} Part ${P}: duplicate text — stopping`)
      break
    }
    // Skip content already seen in a prior lesson (e.g. home-row extra exercises)
    if (globalSeenTexts.has(rawText)) {
      console.log(`  Lesson ${L} Part ${P}: text seen in earlier lesson — skipping`)
      seenTexts.add(rawText)
      continue
    }
    seenTexts.add(rawText)
    globalSeenTexts.add(rawText)

    const h1 = extractH1(html)
    if (P === 1) groupTitle = h1 ?? groupTitle
    const subtitle = h1 ?? `Part ${P}`

    const lines = textToLines(rawText)

    console.log(`Lesson ${L} Part ${P} (${subtitle}): ${lines.length} lines`)
    lessons.push({ id: crypto.randomUUID(), subtitle, lines })
  }

  if (lessons.length > 0) {
    groups.push({ id: crypto.randomUUID(), title: groupTitle, keys: [], lessons })
  }
}

writeFileSync('src/lessons.json', JSON.stringify(groups, null, 2))
console.log(`\nDone. ${groups.length} groups, ${groups.reduce((n, g) => n + g.lessons.length, 0)} lessons written to src/lessons.json`)
