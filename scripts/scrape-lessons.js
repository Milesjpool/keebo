import { writeFileSync } from 'fs'

const BASE = 'https://www.typingstudy.com'
const LESSONS = 15
const MAX_PARTS = 30
const DELAY_MS = 300

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

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

function extractSubtitle(html, part) {
  // Active part is rendered as plain <li>text</li> (no <a> tag), unlike other parts
  const m = html.match(/<li>((?:New keys?|Key exercise|Word exercise|Blind exercise|Text exercise|Extra)[^<\n]+)<\/li>/)
  if (m) return m[1].trim()
  return `Part ${part}`
}

function extractGroupTitle(html) {
  // Lesson title is typically in the subnav header
  const m = html.match(/class="[^"]*lesson[_-]title[^"]*"[^>]*>([^<]+)</)
           || html.match(/<h1[^>]*>([^<]+)<\/h1>/)
  if (m) return m[1].trim()
  return null
}

function textToLines(text) {
  // Split on pilcrow (¶) or newline, filter empty lines
  return text.split(/[¶\n]/).map(l => l.trim()).filter(Boolean)
}

async function fetchPart(lesson, part) {
  const url = `${BASE}/lesson/${lesson}/part/${part}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; keebo-scraper/1.0)' },
    redirect: 'follow',
  })
  if (!res.ok) return null
  const html = await res.text()
  const text = extractText(html)
  if (!text) return null
  return { html, text, subtitle: extractSubtitle(html, part), groupTitle: extractGroupTitle(html) }
}

async function main() {
  const groups = []

  for (let L = 1; L <= LESSONS; L++) {
    console.log(`\n=== Lesson ${L} ===`)
    const lessons = []
    let groupTitle = `Lesson ${L}`
    let prevText = null

    for (let P = 1; P <= MAX_PARTS; P++) {
      await sleep(DELAY_MS)
      const result = await fetchPart(L, P)
      if (!result) {
        console.log(`  Part ${P}: no content — stopping`)
        break
      }

      // Stop when content repeats (site serving fallback for non-existent parts)
      if (result.text === prevText) {
        console.log(`  Part ${P}: repeated content — stopping at ${P - 1} parts`)
        break
      }
      prevText = result.text

      if (P === 1 && result.groupTitle) groupTitle = result.groupTitle
      const lines = textToLines(result.text)
      const subtitle = result.subtitle

      console.log(`  Part ${P} (${subtitle}): ${lines.length} lines`)
      lessons.push({ id: crypto.randomUUID(), subtitle, lines })
    }

    if (lessons.length > 0) {
      groups.push({ id: crypto.randomUUID(), title: groupTitle, keys: [], lessons })
    }
  }

  writeFileSync('src/lessons.json', JSON.stringify(groups, null, 2))
  console.log(`\nDone. ${groups.length} groups, ${groups.reduce((n, g) => n + g.lessons.length, 0)} lessons written to src/lessons.json`)
}

main().catch(console.error)
