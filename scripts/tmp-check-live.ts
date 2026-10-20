import { chromium } from 'playwright'

const URL = 'https://yankristsov.github.io/PFTH2E/'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors: string[] = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(2500)

const chips = await page.evaluate(() => {
  const section = document.querySelector('.sidebar-section') as HTMLElement
  const list = Array.from(section.querySelectorAll('.level-chip')) as HTMLElement[]
  const sb = section.getBoundingClientRect()
  return {
    count: list.length,
    labels: list.map((c) => c.textContent?.trim()),
    overflow: list.filter((c) => c.getBoundingClientRect().right > sb.right + 1).length
  }
})
console.log('УРОВНИ:', JSON.stringify(chips))

await page.locator('.level-chip', { hasText: /^5$/ }).first().click()
await page.waitForTimeout(700)
console.log('АКТИВНЫЕ ФИЛЬТРЫ:', JSON.stringify(await page.locator('.active-filters').innerText()))

await page.goto(URL + 'settings', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(1500)
const settingsText = await page.locator('.settings-view').innerText()
console.log('НАСТРОЙКИ (первые 220 символов):', JSON.stringify(settingsText.slice(0, 220)))
console.log('АНГЛИЙСКИЕ ЗАГОЛОВКИ:', JSON.stringify(settingsText.match(/^(Data|About|Export All Data|Import Data|Clear Data)$/gm) || []))

await page.goto(URL + 'spell/aonprd-spell-2335', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(2000)
console.log('URL ДЕТАЛЕЙ:', page.url())
console.log('H1:', await page.locator('h1').first().innerText())

const overflow = await page.evaluate(() => ({
  docScroll: document.documentElement.scrollWidth,
  docClient: document.documentElement.clientWidth
}))
console.log('ГОРИЗ. ПЕРЕПОЛНЕНИЕ:', overflow.docScroll > overflow.docClient ? `YES ${overflow.docScroll}>${overflow.docClient}` : 'no')
console.log('ERRORS:', errors.length ? errors.join('\n') : 'none')

await browser.close()
