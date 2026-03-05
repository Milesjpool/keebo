// Fetches raw HTML for all lesson parts and saves to scripts/raw/
import { writeFileSync, mkdirSync } from 'fs'

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
  return m ? m[1] : null
}

mkdirSync('scripts/raw', { recursive: true })

async function main() {
  for (let L = 1; L <= LESSONS; L++) {
    console.log(`\n=== Lesson ${L} ===`)
    let prevText = null

    for (let P = 1; P <= MAX_PARTS; P++) {
      await sleep(DELAY_MS)
      const url = `${BASE}/lesson/${L}/part/${P}`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; keebo-scraper/1.0)' },
        redirect: 'follow',
      })
      if (!res.ok) { console.log(`  Part ${P}: ${res.status} — stopping`); break }
      const html = await res.text()
      const text = extractText(html)
      if (!text) { console.log(`  Part ${P}: no type_text — stopping`); break }
      if (text === prevText) { console.log(`  Part ${P}: repeated — stopping at ${P - 1} parts`); break }
      prevText = text
      writeFileSync(`scripts/raw/lesson${L}_part${P}.html`, html)
      console.log(`  Part ${P}: saved (${text.length} chars)`)
    }
  }
  console.log('\nDone.')
}

main().catch(console.error)
