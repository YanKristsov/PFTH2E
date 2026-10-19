import { chromium } from 'playwright'

const TARGET = process.argv[2] || 'https://yankristsov.github.io/PFTH2E/'

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

const errors: string[] = []
const failedRequests: string[] = []

page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message}`))
page.on('requestfailed', (req) => failedRequests.push(`${req.url()} :: ${req.failure()?.errorText}`))
page.on('response', (res) => {
  if (res.status() >= 400) failedRequests.push(`${res.url()} :: HTTP ${res.status()}`)
})

const resp = await page.goto(TARGET, { waitUntil: 'networkidle', timeout: 90000 })
console.log('URL:', TARGET)
console.log('HTTP status:', resp?.status())

await page.waitForTimeout(4000)

const appLen = await page.evaluate(() => document.getElementById('app')?.innerHTML.length ?? 0)
const bodyText = await page.evaluate(() => document.body.innerText)
console.log('#app innerHTML length:', appLen)
console.log('body text length:', bodyText.length)
console.log('title:', await page.title())
console.log('search input:', await page.locator('.search-input').count())
console.log('spell rows/cards:', await page.locator('tbody tr, .spell-grid .card').count())

// проверка переводов
const checks: Array<[string, string]> = [
  ['Поиск заклинаний', 'заголовок поиска'],
  ['Арканная', 'традиция'],
  ['Сакральная', 'традиция'],
  ['Окультая', 'традиция'],
  ['Первобытная', 'традиция'],
  ['Преграждение', 'школа'],
  ['Некромантия', 'школа'],
  ['Обычное', 'редкость'],
  ['Необычное', 'редкость'],
  ['Редкое', 'редкость'],
  ['Уникальное', 'редкость']
]
console.log('\n--- Проверка переводов ---')
for (const [needle, what] of checks) {
  const found = bodyText.includes(needle)
  console.log(`${found ? 'OK  ' : 'FAIL'} ${what}: "${needle}"`)
}

// проверка отсутствия английских терминов
const english = ['Arcane', 'Divine', 'Occult', 'Primal', 'Common', 'Uncommon', 'Rare', 'Unique', 'Search spells', 'abjuration', 'evocation', 'necromancy']
console.log('\n--- Проверка отсутствия английских терминов ---')
for (const w of english) {
  const found = bodyText.includes(w)
  console.log(`${found ? 'FAIL' : 'OK  '} "${w}"${found ? ' <- НАЙДЕН' : ''}`)
}

console.log('\n=== CONSOLE ERRORS ===')
console.log(errors.length ? errors.slice(0, 15).join('\n---\n') : '(none)')
console.log('\n=== FAILED REQUESTS ===')
console.log(failedRequests.length ? failedRequests.slice(0, 15).join('\n') : '(none)')

await browser.close()
