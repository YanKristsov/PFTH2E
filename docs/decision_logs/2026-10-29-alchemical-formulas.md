# Алхимические формулы — реализация раздела

**Дата:** 2026-10-29

## Контекст
Добавлен новый раздел «Алхимические формулы» (маршрут `/alchemical-formulas`), аналогичный «Заклинаниям»: таблица (Название, Категория) в алфавитном порядке по русскому названию, раскрывающиеся строки с полным описанием из readthedocs, фильтры в сайдбаре.

## Реализовано
- `src/types/alchemical.ts` — схема Zod (AlchemicalItem, variants с level/name/price/description/source, traits, descriptionHtml, category, rarity).
- `scripts/parse-alchemical.ts` — парсер readthedocs (Таблица 11-2 + секции #item-*), группировка по базовому предмету, варианты по уровням, извлечение дескрипторов и HTML-описания, переписывание путей иконок на `/PFTH2E/art/`.
- `public/alchemical.json` — 154 уникальных предмета.
- `src/stores/alchemicalFilter.ts` — store фильтров (поиск, категории, уровни, дескрипторы).
- `src/views/AlchemicalFormulasView.vue` — таблица, фильтрация, раскрывающиеся строки, вкладки источников, чипы дескрипторов, уровни/цены.
- `src/router/index.ts` — маршрут `/alchemical-formulas`.
- `src/components/AppSidebar.vue` — переключение фильтров по маршруту (isAlchemical), загрузка дескрипторов из alchemical.json.
- `src/components/AppHeader.vue` — удалён логотип.
- `src/assets/styles/utils.css` — добавлены .mt-lg/.mt-xl.

## Ограничения / следующие шаги
- Источник данных пока только readthedocs; pf2.ru и AoN не подключены (вкладки источников — заглушка).
- «Сюжет» — заглушка.
- Описания содержат HTML readthedocs (относительные ссылки на playing_the_game и т.д.).
