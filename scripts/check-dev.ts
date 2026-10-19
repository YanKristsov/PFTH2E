import { chromium } from 'playwright'

/**
 * Проверка dev-сервера (`npm run dev`): dev-шаблон index.dev.html должен
 * отдаваться на всех HTML-маршрутах, включая SPA-пути (/spell/:id).
 * Иначе Vite подставляет коренной ПРОД-index.html и страница падает.
 */
const TARGET = process.argv[2] || 'http://localhost:3000/PFTH2E/'

const browser = await chromium.launch()
const page = await browser.newPage()

const errors: string[] = []
const failed: string[] = []

page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
page.on('requestfailed', (r) => failed.push(`${r.url()} :: ${r.failure()?.errorText}`))
page.on('response', (r) => {
  if (r.status() >= 400) failed.push(`${r.url()} :: HTTP ${r.status()}`)
})

const resp = await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 60000 })
console.log('URL:', TARGET)
console.log('HTTP status:', resp?.status())
await page.waitForTimeout(3000)

const appLen = await page.evaluate(() => document.getElementById('app')?.innerHTML.length ?? 0)
console.log('#app innerHTML length:', appLen)
console.log('spells rendered:', await page.locator('tbody tr, .spell-grid .card').count())

const spaUrl = new URL('spell/1', TARGET).toString()
await page.goto(spaUrl, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(2000)
console.log('SPA route:', spaUrl)
console.log('SPA #app innerHTML length:', await page.evaluate(() => document.getElementById('app')?.innerHTML.length ?? 0))

console.log('\n=== CONSOLE ERRORS ===')
console.log(errors.length ? errors.slice(0, 10).join('\n---\n') : '(none)')
console.log('\n=== FAILED REQUESTS ===')
console.log(failed.length ? failed.slice(0, 10).join('\n') : '(none)')

await browser.close()
