const res = await fetch('https://pf2e-ru-translation.readthedocs.io/ru/latest/crafting_and_treasure/alchemical_items.html')
const html = await res.text()
const i = html.indexOf('id="item-acid-flask"')
console.log(html.slice(Math.max(0, i-200), i+1500))
