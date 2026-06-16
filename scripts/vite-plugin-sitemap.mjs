import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export function writeSitemap(outDir, { base, site = process.env.SITE_URL ?? 'https://www.milesjpool.com' }) {
  const basePath = base.replace(/\/$/, '')
  const origin = site.replace(/\/$/, '')
  const data = JSON.parse(readFileSync(join(root, 'src/data/lessons.json'), 'utf8'))
  const lastmod = new Date().toISOString().slice(0, 10)
  const urls = [
    { loc: `${origin}${basePath}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${origin}${basePath}/about`, changefreq: 'monthly', priority: '0.9' },
  ]

  for (let gi = 0; gi < data.groups.length; gi++) {
    urls.push({
      loc: `${origin}${basePath}/group/${gi + 1}`,
      changefreq: 'monthly',
      priority: '0.8',
    })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

  writeFileSync(join(outDir, 'sitemap.xml'), xml)

  const robots = `User-agent: *
Allow: ${basePath}/

Sitemap: ${origin}${basePath}/sitemap.xml
`
  writeFileSync(join(outDir, 'robots.txt'), robots)

  return urls.length
}

export function sitemapPlugin() {
  let outDir
  let base

  return {
    name: 'keebo-sitemap',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
      base = config.base
    },
    closeBundle() {
      const count = writeSitemap(outDir, { base })
      console.log(`wrote ${count} URLs to ${join(outDir, 'sitemap.xml')}`)
    },
  }
}
