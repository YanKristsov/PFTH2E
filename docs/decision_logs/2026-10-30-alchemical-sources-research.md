# Исследование источников для алхимических предметов

**Дата:** 2026-10-30

## Контекст
Раздел «Алхимические предметы» (/alchemical-formulas) реализован с данными только из pf2e-ru-translation (readthedocs). Требуется подключить Archives of Nethys (AoN) и pf2.ru как полные источники.

## Исследование

### AoN (Archives of Nethys)
- **API endpoint**: `POST https://elasticsearch.aonprd.com/aon/_search?stats=searchbar`
- **Запрос для алхимических предметов**:
  ```json
  {
    "query": {
      "bool": {
        "filter": [
          { "terms": { "category": ["equipment"] } },
          { "query_string": { "query": "item_category:\"Alchemical Items\"" } }
        ],
        "must_not": [
          { "term": { "exclude_from_search": true } },
          { "exists": { "field": "remaster_id" } },
          { "exists": { "field": "item_child_id" } }
        ]
      }
    },
    "size": 10000,
    "_source": ["id","name","level","rarity","trait","source","price","price_raw","bulk","usage","actions","markdown","url","item_category","item_subcategory","trait_raw","source_raw","primary_source"]
  }
  ```
- **Структура данных**: `markdown` содержит полное описание с вариантами по уровням (Lesser/Moderate/Greater/Major), разделёнными `---`. Traits — массив английских строк.
- **Ссылка на детальную страницу**: `https://2e.aonprd.com/Equipment.aspx?ID=<numericId>`

### pf2.ru
- **URL**: `https://pf2.ru/alchemical-items` с табами: bombs, elixirs, poisons, tools, ammunition, food, plants, other, bottled-monstrosities, drugs
- **Данные**: в `<pf2-table items>` (JSON-атрибут)
- **Поля**: `id, name, rus_name, traits (HTML), level, price, bulk, item_category, item_subcategory, usage, base_item, is_variant`
- **API деталей**: `POST https://pf2.ru/api/equipment/details` с `{ids, lang}` → `{id: {text_output, traits_output}}`
- **Варианты**: `is_variant` boolean, `base_item` связывает варианты с базовым предметом

## Решение
- Расширить `scripts/parse-alchemical.ts` тремя источниками: AoN (Elasticsearch), pf2.ru (HTML + API), readthedocs (существующий)
- Объединять данные по базовому названию (как в `mergeSpells()` для заклинаний)
- Добавить обработку относительных ссылок и форматирование описаний

## Альтернативы
- Использовать только AoN + readthedocs (pf2.ru не добавлять) — менее полные русские данные
- Использовать только pf2.ru + readthedocs — нет английских описаний AoN