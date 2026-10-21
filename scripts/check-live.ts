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
// Редкость не проверяется: столбец «Редкость» удалён из таблицы
// (см. docs/decision_logs/2026-10-21-spells-table-refinement.md), в UI её меток нет.
const checks: Array<[string, string]> = [
  ['Поиск заклинаний', 'заголовок поиска'],
  ['Арканная', 'традиция'],
  ['Сакральная', 'традиция'],
  ['Окультая', 'традиция'],
  ['Первобытная', 'традиция'],
  ['Преграждение', 'школа'],
  ['Некромантия', 'школа'],
  ['Действия', 'столбец действий'],
  ['Реакция', 'подпись реакции']
]
console.log('\n--- Проверка переводов ---')
for (const [needle, what] of checks) {
  // сравнение без учёта регистра: заголовки таблиц отдаются через text-transform: uppercase
  const found = bodyText.toLowerCase().includes(needle.toLowerCase())
  console.log(`${found ? 'OK  ' : 'FAIL'} ${what}: "${needle}"`)
}

// Проверка отсутствия английских терминов в UI (шапка + разделы фильтров).
// Список заклинаний и раздел «Источник» исключены намеренно: там по требованию
// остаются оригинальные английские названия заклинаний (name.en) и названия источников.
const english = ['Arcane', 'Divine', 'Occult', 'Primal', 'Common', 'Uncommon', 'Rare', 'Unique', 'Search spells', 'abjuration', 'evocation', 'necromancy']
const uiText = await page.evaluate(() => {
  const parts: string[] = []
  document.querySelectorAll('header').forEach((el) => parts.push(el.textContent || ''))
  document.querySelectorAll('aside.sidebar .sidebar-section').forEach((sec) => {
    const title = sec.querySelector('.sidebar-title')?.textContent?.trim()
    if (title === 'Источник') return
    parts.push(sec.textContent || '')
  })
  return parts.join('\n')
})
console.log('\n--- Проверка отсутствия английских терминов (UI) ---')
for (const w of english) {
  const found = uiText.includes(w)
  console.log(`${found ? 'FAIL' : 'OK  '} "${w}"${found ? ' <- НАЙДЕН' : ''}`)
}

console.log('\n--- Проверка иконок затрат действий ---')
const iconStats = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img.action-icon')) as HTMLImageElement[]
  const loaded = imgs.filter((i) => i.complete && i.naturalWidth > 0)
  const first = imgs[0]
  const countAlts = imgs
    .map((i) => i.getAttribute('alt') ?? '')
    .filter((a) => /^\d+ действи/.test(a))
  return {
    total: imgs.length,
    loaded: loaded.length,
    src: first?.getAttribute('src') ?? null,
    alt: first?.getAttribute('alt') ?? null,
    natural: first ? `${first.naturalWidth}x${first.naturalHeight}` : null,
    countAlts: countAlts.length,
    // у 1/2/3 действий текст скрыт — в ячейке остаётся только иконка
    countCellsText: Array.from(document.querySelectorAll('td.actions-cell')).map((td) =>
      (td.textContent ?? '').trim()
    ),
    alts: Array.from(new Set(countAlts))
  }
})
console.log(`иконок в таблице: ${iconStats.total}, загружено: ${iconStats.loaded}`)
console.log(`первая иконка: ${iconStats.src} (alt="${iconStats.alt}", ${iconStats.natural})`)
console.log(`alt у иконок 1/2/3 действий: ${iconStats.alts.join(', ')}`)
const iconsOk =
  iconStats.total > 0 && iconStats.loaded > 0 && (iconStats.src ?? '').includes('/art/PF_action_')
console.log(iconsOk ? 'OK   иконки действий загружаются' : 'FAIL иконки действий не загружаются')
// текстовые подписи «1/2/3 действия» скрыты: в тексте ячеек их быть не должно
const hiddenOk = !iconStats.countCellsText.some((t) => /^\d+ действи/.test(t))
console.log(
  hiddenOk
    ? 'OK   подписи «1/2/3 действия» скрыты (только иконка)'
    : 'FAIL в ячейке осталась текстовая подпись действия'
)

console.log('\n=== CONSOLE ERRORS ===')
console.log(errors.length ? errors.slice(0, 15).join('\n---\n') : '(none)')
console.log('\n=== FAILED REQUESTS ===')
console.log(failedRequests.length ? failedRequests.slice(0, 15).join('\n') : '(none)')

await browser.close()
