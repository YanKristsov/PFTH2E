const html = '<b></b> <a class="item-link quicklink item-link--source" style="font-style: unset" data-key="source/227" href="/sources/player core 2">Основная книга игрока 2</a><br>';
const result = html.replace(/<a[^>]*item-link--source[^>]*>[\s\S]*?<\/a>/gi, '');
console.log('Result:', JSON.stringify(result));
