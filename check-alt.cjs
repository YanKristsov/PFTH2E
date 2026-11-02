const fs = require('fs');
const d = JSON.parse(fs.readFileSync('./public/alchemical.json', 'utf-8'));
let count = 0;
for (const item of d) {
  const html = item.descriptionHtml || '';
  const m = html.match(/alt="[^"]*"/g);
  if (m) {
    for (const a of m) {
      if (!a.includes('PF_action_')) {
        count++;
        console.log(item.id, '|', item.name.ru, '|', a);
      }
    }
  }
  for (const v of item.variants) {
    const h = v.description || '';
    const m2 = h.match(/alt="[^"]*"/g);
    if (m2) {
      for (const a of m2) {
        if (!a.includes('PF_action_')) {
          count++;
          console.log('variant', v.id, '|', a);
        }
      }
    }
  }
}
console.log('non-PF_action alt matches:', count);
