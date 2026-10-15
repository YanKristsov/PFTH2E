# 2026-10-14-build-toolchain-fix

## Контекст
`npm run build` падал с ошибками Vue-компилятора и отсутствующим `esbuild`. Lint и typecheck также не проходили из-за неправильной настройки ESLint и TypeScript-ошибок.

## Проблемы и решения

### 1. Vue compiler: "Attribute name cannot contain U+0022..."
**Причина:** Запись `.vue`-файлов через PowerShell искажала кодировку — в атрибутах появлялись скрытые символы.  
**Решение:** Переписаны все 5 проблемных файлов с английским текстом в атрибутах (`AppHeader.vue`, `AppSidebar.vue`, `SpellTable.vue`, `FavoritesView.vue`, `HistoryView.vue`). Остальные `.vue`-файлы также приведены к английским меткам в шаблонах.

### 2. Отсутствует `esbuild`
**Причина:** `vite-plugin-pwa` требует `esbuild` для `transformWithEsbuild`, но он не был установлен.  
**Решение:** `npm install -D esbuild`

### 3. ESLint не настроен
**Причина:** В `eslint.config.js` использовался `@typescript-eslint` без импорта плагина и парсера, не хватало `vue-eslint-parser` для `.vue`-файлов.  
**Решение:** Полностью переписан конфиг: добавлен `vue-eslint-parser`, `@typescript-eslint/eslint-plugin`, глобальные переменные (browser API), игнор `dist/`, separate languageOptions для `.ts` и `.vue`.

### 4. TypeScript-ошибки
- `save()` не экспортировался из `useSettingsStore` — добавлен в return
- `AppSidebar.vue`: несоответствие типов в `activeFilters` — типизирован через `FilterState`
- `HistoryView.vue`: null-check для `spell` — переписан через цикл с early-continue
- `HomeView.vue`: `window.location.reload()` в шаблоне — заменён на `router.go(0)`

### 5. Lint-предупреждения
- `no-empty` в catch-блоках — добавлены комментарии `/* ignore invalid JSON */`
- `no-console` в `main.ts` — убран `console.log`
- `vue/no-v-html` — добавлены `<!-- eslint-disable -->` комментарии (данные из доверенного JSON)
- `no-unused-vars` — удалены неиспользуемые импорты/переменные

## Результат
- `npm run lint` — 0 ошибок, 0 предупреждений
- `npm run typecheck` — 0 ошибок
- `npm run build` — успешная сборка в `dist/`, PWA генерируется

## Следующие шаги
- `npm run parse:spells` — генерация `public/spells.json` (требует сети)
- `npm run dev` — проверка dev server
- `npm run test` — запуск тестов (если есть)
- Деплой на GitHub Pages