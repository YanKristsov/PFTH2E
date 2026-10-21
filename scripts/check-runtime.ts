import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'

const DIST = join(process.cwd(), 'dist')
const PORT = 4180
const BASE = '/PFTH2E'

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json'
}

async function serveFile(res: any, filePath: string) {
  try {
    const s = await stat(filePath)
    if (!s.isFile()) return false
    const data = await readFile(filePath)
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' })
    res.end(data)
    return true
  } catch {
    return false
  }
}

const server = createServer(async (req, res) => {
  const url = (req.url || '/').split('?')[0]
  let p = url.startsWith(BASE) ? url.slice(BASE.length) || '/' : url
  if (p === '/' || p === '') p = '/index.html'
  if (await serveFile(res, join(DIST, p))) return
  res.writeHead(404).end('not found')
})

await new Promise<void>(r => server.listen(PORT, r))

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

const errors: string[] = []
const warnings: string[] = []
const failedRequests: string[] = []

page.on('console', (msg) => {
  const t = msg.type()
  if (t === 'error') errors.push(msg.text())
  else if (t === 'warning') warnings.push(msg.text())
})
page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message}`))
page.on('requestfailed', (req) => failedRequests.push(`${req.url()} :: ${req.failure()?.errorText}`))
page.on('response', (res) => {
  if (res.status() >= 400) failedRequests.push(`${res.url()} :: HTTP ${res.status()}`)
})

const target = `http://localhost:${PORT}${BASE}/`
console.log('--- Loading', target)
const resp = await page.goto(target, { waitUntil: 'networkidle', timeout: 60000 })
console.log('HTTP status:', resp?.status())

await page.waitForTimeout(3000)

const html = await page.content()
const appHtml = await page.evaluate(() => document.getElementById('app')?.innerHTML ?? '')
const bodyText = await page.evaluate(() => document.body.innerText)

console.log('--- #app innerHTML length:', appHtml.length)
console.log('--- body text length:', bodyText.length)
console.log('--- body text preview:', JSON.stringify(bodyText.slice(0, 300)))
console.log('--- title:', await page.title())
console.log('--- search input present:', await page.locator('.search-input').count())
console.log('--- spell rows/cards:', await page.locator('tbody tr, .spell-grid .card').count())

console.log('\n=== CONSOLE ERRORS ===')
console.log(errors.length ? errors.join('\n---\n') : '(none)')
console.log('\n=== FAILED REQUESTS ===')
console.log(failedRequests.length ? failedRequests.join('\n') : '(none)')
console.log('\n=== WARNINGS (first 10) ===')
console.log(warnings.length ? warnings.slice(0, 10).join('\n') : '(none)')

await browser.close()
server.close()
