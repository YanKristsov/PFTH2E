const fs = require('fs');
const d = JSON.parse(fs.readFileSync('./public/alchemical.json', 'utf-8'));
const item = d.find(i => i.id.includes('абсолютныи-растворитель'));
console.log('=== ITEM descriptionHtml ===');
console.log(item.descriptionHtml.substring(0, 800));
console.log('=== VARIANT description ===');
console.log(item.variants[0].description.substring(0, 800));
