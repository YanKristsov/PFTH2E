import { JSDOM } from 'jsdom';

const html = await fetch('https://pf2.ru/alchemical-items', { headers: { 'User-Agent': 'test/1.0' } }).then(r => r.text());
const dom = new JSDOM(html);
const document = dom.window.document;

for (const table of document.querySelectorAll('pf2-table[items]')) {
  const itemsAttr = table.getAttribute('items');
  if (!itemsAttr) continue;
  let items;
  try { items = JSON.parse(itemsAttr); } catch(e) { console.log('JSON parse error:', e.message); continue; }
  for (const item of items.slice(0, 10)) {
    console.log('Name:', item.rus_name);
    console.log('Traits:', JSON.stringify(item.traits));
    console.log('---');
  }
  break;
}
