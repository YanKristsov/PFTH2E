const fs = require('fs');
const html = fs.readFileSync('./public/alchemical.json', 'utf-8');
const d = JSON.parse(html);

// Find an item with an img tag and check its alt
for (const item of d) {
  const html = item.descriptionHtml || '';
  const m = html.match(/<img[^>]*>/);
  if (m) {
    console.log('Item:', item.id, item.name.ru);
    console.log('Img tag:', m[0]);
    break;
  }
}
