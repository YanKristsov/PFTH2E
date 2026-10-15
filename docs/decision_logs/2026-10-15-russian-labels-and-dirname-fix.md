# Перевод меток на русский и исправление __dirname

## Контекст
В списке "Осталось сделать" из RESUME.md значилось:
- Перевести оставшиеся английские метки на русский в 7 файлах (SettingsView, SpellDetailView, FavoritesView, HistoryView, CompareView, SpellCard, SpellTable)
- Исправить предупреждение __dirname в vite.config.ts:53 → import.meta.dirname

## Альтернативы
1. Оставить английские метки — не подходит, т.к. сайт полностью на русском и это нарушает консистентность UI.
2. Перевести через i18n-библиотеку — избыточно для текущего масштаба проекта; все строки уже хардкодом на русском в сайдбаре/хедере.

## Решение
1. Переведены все английские метки на русский в:
   - `src/views/SettingsView.vue` — columnLabels, "Table Columns" → "Колонки таблицы"
   - `src/views/SpellDetailView.vue` — tradition labels (Арканный/Божественный/Оккультный/Природный), Ritual→Ритуал, Focus→Фокус, School→Школа, Classes→Классы, Cast Time→Время произнесения, Range→Дальность, Components→Компоненты, Target / Area→Цель / Область, Duration→Длительность, Save→Спасбросок, Spell Resistance→Сопротивление заклинанию, Yes→Да, No→Нет, Source variants→Варианты источника, Brief→Кратко, Full→Полно, Heightened→Усиление, English→Английский, Russian→Русский, Description unavailable→Описание недоступно
   - `src/views/FavoritesView.vue` — "Favorites"→"Избранное", "No favorites yet"→"Нет избранных", "Go to spells"→"К заклинаниям", таблица: Name→Название, Lv.→Уровень, Tradition→Традиция, School→Школа, Notes→Заметки, placeholder, alert'ы
   - `src/views/HistoryView.vue` — "View History"→"История просмотров", "Clear History"→"Очистить историю", "History is empty"→"История пуста", "Go to spells"→"К заклинаниям", confirm сообщение
   - `src/views/CompareView.vue` — заголовок, кнопки, пустые состояния, compareFields labels (все 15 полей), getFieldValue значения (Yes→Да, No→Нет, Lv.→Уровень)
   - `src/components/SpellCard.vue` — tradition/rarity labels, aria-labels кнопок, "Click for details"→"Посмотреть детали", "Enter"→"Ввод"
   - `src/components/SpellTable.vue` — табличные заголовки, caption, aria-label(row), aria-label(checkbox)
2. `vite.config.ts`: `__dirname` заменён на `import.meta.dirname` в resolve.alias

## Обоснование
Все метки интерфейса теперь на русском, что обеспечивает консистентность с сайдбаром и хедером (уже переведены ранее). Предупреждение `__dirname` устранено в соответствии с ESM-стандартами Vite.

## Проверка
- `npm run typecheck` — проходит
- `npm run test` — 5/5 тестов проходят
- `npm run build` — успешная сборка
- `npm run lint` — ошибки только в сгенерированных SW-файлах (sw.js, workbox-*.js), которые не являются исходниками проекта
