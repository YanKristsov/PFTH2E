# PF2E Spells Reference — Статус проекта

> **Обновлено:** 2026-10-21. Актуальный статус после полного перевода интерфейса на русский, исправления деплоя и добавления иконок затрат действий.

## Общее описание
Справочник заклинаний Pathfinder 2e на русском языке.
- **Стек:** Vite 8 + Vue 3 + TypeScript + Pinia + MiniSearch + PWA (vite-plugin-pwa)
- **Данные:** 2009 записей из pf2.ru и Archives of Nethys
- **Деплой:** GitHub Pages → https://yankristsov.github.io/PFTH2E/
- **Локально:** `npm run dev` → http://localhost:3000/PFTH2E/

## Текущий статус

### Работает (проверено 2026-10-19)
- `npm run typecheck` — 0 ошибок
- `npm run test` — 10/10 тестов проходят (5 парсер + 5 словарей переводов)
- `npm run lint` — 0 ошибок (задеплоенные артефакты `assets/`, `sw.js`, `workbox-*.js` исключены в `eslint.config.js`)
- `npm run build` — 71 модуль, все ассеты генерируются
- **Runtime-проверка (Playwright) локально и на живом сайте:** HTTP 200, отрендерено 2009 заклинаний, **0 console errors, 0 failed requests**
- **Dev-сервер (Playwright):** `http://localhost:3000/PFTH2E/` — 2009 заклинаний, SPA-маршрут `/spell/1` работает, 0 console errors
- Поиск (MiniSearch) — работает (Fireball → Огненный шар)
- Фильтры — работают (уровень, традиция, школа, черты, редкость, источник, компоненты)
- Детальная страница — работает (вкладки «Кратко» / «Полно»)
- PWA — Service Worker активен, 2009 строк в оффлайне
- Навигация — клик по строке/карточке → `/spell/:id`
- Деплой на GitHub Pages — работает (все JS/CSS/JSON отдают 200)

### Интерфейс полностью на русском
- Переключатель языка (ru/en) **удалён** из `AppHeader.vue` и `SettingsView.vue`
- Поиск в шапке: «Поиск заклинаний...», label «Поиск заклинаний»
- **Традиции:** Арканная, Сакральная, Окультая, Первобытная
- **Школы:** Преграждение, Призыв, Прорицание, Очарование, Эвокация, Иллюзия, Некромантия, Превращение, Неизвестно
- **Редкость:** Обычное, Необычное, Редкое, Уникальное
- **Компоненты:** Словесный (С), Жестовый (Ж), Материальный (М), Фокусный (Ф) — отображаются инициалами с подсказкой
- **Черты:** 100+ терминов переведены (Acid→Кислота, Fire→Огонь, и т.д.)
- Все служебные надписи: «К заклинаниям», «Ошибка загрузки», «В избранном», «Посмотреть детали», «Ввод», «Уровень N», «Кратко»/«Полно», «Усиление», «Варианты источника», «Доступна новая версия. Перезагрузить?»
- **Страница «Настройки» переведена** (2026-10-20): «Данные», «Экспорт всех данных», «Импорт данных», «Очистка данных», «О проекте», «Светлая/Тёмная/Системная», «Таблица/Карточки», «Повторить»
- **Названия активных фильтров** переведены (`FILTER_LABELS` + `filterLabel()`), значения — через `traditionLabel()`/`schoolLabel()`/`rarityLabel()`/`traitLabel()`
- **На английском остаётся только:** оригинальные названия заклинаний (`name.en`) и названия источников («Archives of Nethys: Divine Mysteries») — по требованию

### Иконки затрат действий (2026-10-21)
- В столбце «Действия» таблицы рядом с текстовой подписью показывается иконка затрат
- Ассеты лежат в `public/art/` → копируются в корень `dist` → в корень ветки `gh-pages` → путь `/PFTH2E/art/<file>`
  - `PF_action_1.webp` (176×176), `PF_action_2.webp` (277×176), `PF_action_3.webp` (367×177), `PF_action_free.webp` (178×178),
    `PF_action_reaction.png` (256×222)
- Резолвер — `actionDisplay(castTime)` в `src/constants/translations.ts`: возвращает `{ label, segments }`,
  где сегмент — `icon` | `text` | `sep`
- **Иконка ставится только для однозначных значений:** 1/2/3 действия, свободное действие, реакция.
  Для комбинаций («2 или 3 действия», «Реакция или 1 действие») и длительностей — только текст
- **Текст скрыт там, где иконка однозначна:** 1/2/3 действия (стрелки), «Реакция», диапазон «1–3 действия»
  (иконка 1 – иконка 3). «Свободное действие» остаётся с подписью (иконка-лента неоднозначна).
  Подпись сохранена в `alt`/`title` иконки
- `src` собирается из `import.meta.env.BASE_URL` (`/PFTH2E/art/<file>`), родные размеры отдаются вместе с иконкой —
  браузер резервирует место до загрузки (`loading="lazy"` без скачка вёрстки)
- **Тёмная тема:** CSS-переменная `--icon-filter` (`none` → `invert(1)`) в `src/assets/styles/variables.css`.
  ⚠️ `:global(.dark) .action-icon` в `<style scoped>` компилируется неверно (`.dark{filter:invert()}` — инвертирует всю страницу)
- `PF_action_reaction.png` был с белым фоном (1172×1018, 2 цвета) — фон убран ключевым переносом, картинка обрезана и уменьшена до 256×222 (13.7 КБ → 3.0 КБ)
- В `globPatterns` Workbox добавлен `webp` — иначе `.webp` не попадал в precache (офлайн)

### Раздел «Сравнение» удалён (2026-10-21)
- Удалены: `src/views/CompareView.vue`, маршрут `/compare`, `useComparisonStore` (Pinia),
  пункты навигации «Сравнение» в хедере и сайдбаре, кнопка ⚖️ в карточке заклинания,
  кнопка «Добавить к сравнению» в деталях заклинания, колонка «Выбрать» с чекбоксами в таблице
  и панель «Добавить к сравнению (N/3)» на главной и в истории
- `SpellTable` больше не принимает проп `selected` и не эмитит `select`; клик по строке
  и Enter/Space всегда открывают детали (ранее Ctrl/Cmd+клик и Shift+Enter выбирали для сравнения)
- `SpellCard` больше не принимает `is-in-comparison` и не эмитит `compare`
- `/compare` теперь отдаёт 404 → редирект на главную (catch-all маршрут)

### Механизм переводов- `src/constants/translations.ts` — единый словарь: `TRADITION_LABELS`, `RARITY_LABELS`, `SCHOOL_LABELS`, `COMPONENT_LABELS`, `TRAIT_LABELS`, `FILTER_LABELS` + функции `traditionLabel()`, `schoolLabel()`, `rarityLabel()`, `traitLabel()`, `filterLabel()`, `componentInitial()`
- Все компоненты используют эти функции, а не прямые обращения к константам
- Чтобы добавить перевод — дописать пару в `TRAIT_LABELS`
- **Тест `src/constants/translations.test.ts`** проверяет, что для каждой традиции, школы, редкости и английской черты из `public/spells.json` есть русская подпись. При добавлении новых данных тест укажет, чего не хватает
- Полнота на 2026-10-19: черты 114/114, школы 9/9, традиции 4/4, редкость 4/4

### Визуал (сайдбар)
- Все метки на русском (Уровень, Традиция, Школа, Класс, Черты, Компоненты, Редкость, Источник)
- Чекбоксы выровнены справа (justify-between)
- **Уровень — сетка 6 колонок** (`grid-template-columns: repeat(6, minmax(0, 1fr))`): все чипы 0–10 помещаются в ширину сайдбара, горизонтальной прокрутки нет
- Традиции/Школы — компактные (gap-2xs, py-2xs)
- Классы — «Недоступно» (источники не предоставляют эту информацию)

### Вёрстка и адаптивность (2026-10-20)
- **Tailwind в проекте нет** — utility-классы самописные в `src/assets/styles/utils.css`. Перед добавлением нового класса в разметку его нужно определить в CSS, иначе он просто не применится
- Классы со спецсимволами экранируются: `.min-w-\[200px\]`, `.border-\[var\(--color-border\)\]`, `.focus\:outline-none:focus` — без экранирования lightningcss считает `[200px]` атрибутным селектором и падает на сборке
- Мобильный хедер не выходит за границы: `min-width: 0` у `.header-left`/`.search-form`, `flex-shrink: 0` у `.header-right`, на ≤480 px скрывается текст логотипа (остаётся иконка)
- Таблица заклинаний скроллится по горизонтали внутри `.overflow-x-auto`; у `.spell-grid > *` стоит `min-width: 0`, иначе широкая таблица растягивает grid-трек

## Команды
```powershell
npm run lint       # ESLint
npm run typecheck  # vue-tsc
npm run test       # Vitest (5 тестов)
npm run build      # Production build → dist/
npm run dev        # Dev server → http://localhost:3000/PFTH2E/
npm run parse:spells  # Парсинг данных из источников

# Проверка runtime (Playwright, chromium установлен)
npx tsx scripts/check-runtime.ts   # локальная сборка из dist/
npx tsx scripts/check-dev.ts       # dev-сервер (нужен запущенный npm run dev)
npx tsx scripts/check-live.ts      # живой сайт https://yankristsov.github.io/PFTH2E/
```

## Деплой (важно!)

### Как это работает
GitHub Pages из ветки `gh-pages` обслуживает файлы **из КОРНЯ ветки**, а не из подпапки `dist/`.
Поэтому собранные файлы копируются в корень репозитория, а папка `dist/` удаляется из индекса git (иначе 13 МБ данных дублируются).

### Команды деплоя
```powershell
npm run deploy
```

Скрипт `scripts/deploy.ps1`:
1. `npm run build` (vue-tsc + vite build + postbuild)
2. Удаляет старые артефакты сайта в корне (`assets/`, `sw.js`, `workbox-*.js`, `manifest.webmanifest`, иконки, `robots.txt`, `spells*.json`)
3. Копирует `dist/*` в корень
4. Удаляет `index.dev.html` (не нужен для работы сайта)
5. `git add -A`, коммит, `git push origin gh-pages --force` через `C:\Program Files\Git\cmd\git.exe`

> `parse:spells` убран из деплоя — данные закоммичены в репозитории. `dist/` в `.gitignore`.

> `dist/` уже вне индекса git (в `.gitignore`), поэтому `git rm -r --cached dist` не нужен.
> Старые хешированные ассеты в `assets/` нужно удалять перед копированием — иначе они копятся:
> ```powershell
> & "C:\Program Files\Git\cmd\git.exe" rm -r --cached assets
> Remove-Item -Path .\assets -Recurse -Force
> ```

### Особенности
- `npx gh-pages -d dist` **НЕ работает** — падает с `ENAMETOOLONG` (в ветке слишком много файлов) 
- Деплой через `npm run deploy` (PowerShell-скрипт) — рабочий вариант. старые хешированные ассеты в `assets/` очищаются перед копированием.

### Требования Vite 8 + разделение dev/prod HTML (неочевидно)

**Главное правило:** корень `index.html` в репозитории — это **прод-сборка** (её отдаёт GitHub Pages). Использовать его как Vite-input нельзя: на следующей сборке Vite попытается разрешить уже собранный путь `/PFTH2E/assets/index-*.js` и упадёт с
`Error: Failed to resolve /PFTH2E/assets/index-*.js from index.html`.

Поэтому шаблон исходников вынесен в **`index.dev.html`**, а `index.html` в корне генерируется сборкой.

Что обязательно должно быть:
- `index.dev.html` (в корне): `<script type="module" src="/src/main.ts"></script>` внутри `<body>`; пути к статике **без** префикса `/PFTH2E/` (`href="/favicon.svg"`), иначе dev-сервер отдаст `/PFTH2E/PFTH2E/favicon.svg`
- `vite.config.ts`: `build.rollupOptions.input = 'index.dev.html'` + плагин `devHtmlPlugin()`, который отдаёт `index.dev.html` в dev-режиме
- `vite.config.ts`: `build.rollupOptions.output.entryFileNames` — убирает `.dev` из имени entry-чанка (`assets/index-*.js` вместо `assets/index.dev-*.js`)
- `scripts/postbuild.mjs` — переименовывает `dist/index.dev.html` → `dist/index.html` + копирует `dist/index.html` → `dist/404.html` (запускается как `postbuild` в `npm run build`)
- **`404.html` обязателен для GitHub Pages**: SPA-маршрутов (`/settings`, `/spell/:id`) на сервере не существует, GitHub отдаёт для них `404.html` из корня ветки. Без него прямой заход по ссылке или перезагрузка страницы показывают страницу 404 GitHub вместо приложения. HTTP-статус остаётся 404 — ограничение статичного хостинга
- `index.dev.html` **нельзя удалять из репозитория** — это Vite-input для следующей сборки
- Функция `manualChunks` в rolldown не поддерживается — её убрали
- Vite 8 **не авто-инжектит** `<script type="module">` в HTML — тег должен быть в шаблоне явно

## Известные ограничения
- Поле `classes` пусто у всех 2009 записей — pf2.ru и AoN не предоставляют классы. Интерфейс это скрывает (фильтр показывает «Недоступно», колонка убрана из дефолтных настроек таблицы)
- Рекомендация по классам: подтянуть из стороннего датасета (Pf2SRD / d20pfsrd / Foundry VTT) сопоставлением по `name.ru` + `level`; ручное заполнение 2009 записей нереалистично
- В ветке `gh-pages` исторически остались `node_modules/`, `src/`, `public/` — мусор, но на работу сайта не влияет
- `dist/` и `node_modules/` в `.gitignore`
- **Верхняя панель фильтров** (Поиск/Уровень/Традиция/Школа/Класс) — выпадающие списки обрезаны по высоте, часть вариантов видна только прокруткой; на мобильных панель занимает весь первый экран. Не исправлено — кандидат на следующий этап

## Ветки Git
- **Источник правды — `gh-pages`.** В ней лежат и исходники (`src/`), и собранный сайт в корне
- Локальной ветки `main` нет; `origin/main` содержит только первоначальные файлы и не используется
- Рабочая директория: `D:\Files\PTHFNDR`

## Ключевые файлы
- `src/App.vue` — главный компонент (router-view, AppHeader, AppSidebar)
- `src/constants/translations.ts` — **словарь переводов** (традиции, школы, редкость, черты, компоненты)
- `src/constants/translations.test.ts` — тест полноты словарей переводов
- `src/components/AppSidebar.vue` — фильтры (все на русском)
- `src/components/AppHeader.vue` — хедер, поиск, переключатель темы
- `src/components/SpellCard.vue` — карточка заклинания (сетка, клик открывает детали)
- `src/components/SpellTable.vue` — таблица заклинаний (в т.ч. столбец «Действия» с иконками)
- `src/views/HomeView.vue` — главная страница (таблица/сетка, фильтры, поиск)
- `src/views/SpellDetailView.vue` — детали заклинания (вкладки Кратко/Полно)
- `src/views/FavoritesView.vue` — избранное + заметки
- `src/views/HistoryView.vue` — история просмотров
- `src/views/SettingsView.vue` — настройки (тема, колонки, экспорт/импорт)
- `src/stores/index.ts` — Pinia store (фильтры, настройки, избранное, история)
- `src/composables/useSpells.ts` — загрузка данных, MiniSearch, фильтрация
- `src/router/index.ts` — маршрутизация
- `src/types/spell.ts` — Zod-схемы и типы
- `scripts/parse-spells.ts` — парсинг данных из pf2.ru и AoN
- `scripts/check-runtime.ts` — Playwright-проверка локальной сборки
- `scripts/check-dev.ts` — Playwright-проверка dev-сервера (dev-шаблон на всех маршрутах, включая SPA)
- `scripts/check-live.ts` — Playwright-проверка живого сайта
- `vite.config.ts` — конфиг Vite (base: '/PFTH2E/', PWA, `input: 'index.dev.html'`, плагин `devHtmlPlugin`)
- `index.dev.html` — шаблон HTML для dev-сборки (источник `<script type="module" src="/src/main.ts">`)
- `scripts/postbuild.mjs` — переименование `dist/index.dev.html` → `dist/index.html`
- `scripts/deploy.ps1` — **рабочий деплой**: сборка → очистка старых артефактов → копирование `dist/*` в корень → commit → force-push в `gh-pages`
- `src/assets/styles/utils.css` — самописные utility-классы (Tailwind в проекте нет)
- `src/assets/styles/components.css` — компоненты (`.chip`, `.table`, `.prose`, `.badge`)
- `src/assets/styles/layout.css` — сетка приложения, сайдбар, хедер, адаптивность

## История изменений (decision logs)
- `docs/decision_logs/2026-10-13-project-initialization.md` — инициализация
- `docs/decision_logs/2026-10-14-build-toolchain-fix.md` — исправление toolchain
- `docs/decision_logs/2026-10-14-parser-resume.md` — парсинг данных
- `docs/decision_logs/2026-10-15-search-and-navigation-fix.md` — поиск и навигация
- `docs/decision_logs/2026-10-15-sidebar-visual-fix.md` — визуал сайдбара
- `docs/decision_logs/2026-10-15-russian-labels-and-dirname-fix.md` — перевод меток, `__dirname` → `import.meta.dirname`
- `docs/decision_logs/2026-10-19-fix-github-pages-deploy.md` — **исправление белой страницы** (Vite 8 + деплой в корень ветки)
- `docs/decision_logs/2026-10-20-deploy-script.md` — рабочий скрипт деплоя (`npm run deploy`)
- `docs/decision_logs/2026-10-20-sidebar-layout-and-ru-ui.md` — **вёрстка сайдбара, мобильная адаптация, полный перевод интерфейса**
- `docs/decision_logs/2026-10-21-spells-table-refinement.md` — **столбец «Действия», краткие описания, дескрипторы, сортировка**
- `docs/decision_logs/2026-10-21-action-icons.md` — **иконки затрат действий, прозрачный фон реакции, тёмная тема**
- `docs/decision_logs/2026-10-21-remove-compare-section.md` — **удаление раздела «Сравнение» и всей связанной механики**

## Ограничения модели
Модель auto-free имеет лимит на объём размышлений. Работать короткими шагами:
- Читать только релевантные фрагменты кода
- Не анализировать весь проект за один раз
- Использовать `Read` с offset/limit для конкретных секций
- Делать одно изменение за раз, проверять, затем продолжать

## Node.js
Установлен: Node.js 24.0.0, npm 11.3.0
Путь: `C:\Program Files\nodejs`

## Git
Установлен: Git 2.56.0.windows.2
Путь: `C:\Program Files\Git\cmd`
Репозиторий: https://github.com/YanKristsov/PFTH2E
