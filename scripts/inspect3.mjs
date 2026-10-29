const res = await fetch('https://pf2e-ru-translation.readthedocs.io/ru/latest/crafting_and_treasure/alchemical_items.html')
const html = await res.text()
const pos = html.indexOf('id="item-acid-flask"')
const secStart = html.lastIndexOf('<section', pos)
const secEnd = html.indexOf('</section>', pos)
const openEnd = html.indexOf('>', secStart) + 1
const inner = html.slice(openEnd, secEnd)
const i = inner.indexOf('Активация')
console.log(JSON.stringify(inner.slice(Math.max(0,i-20), i+260)))
