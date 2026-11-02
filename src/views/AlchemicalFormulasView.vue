<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { AlchemicalItemSchema, type AlchemicalItem } from '@/types/alchemical'
import { useAlchemicalFilterStore } from '@/stores'

const items = ref<AlchemicalItem[]>([])
const isLoading = ref(true)
const loadError = ref('')
const filterStore = useAlchemicalFilterStore()
const openIds = ref<Set<string>>(new Set())
const expandAll = ref(false)

const categoryLabel: Record<string, string> = {
  bomb: 'Бомба',
  elixir: 'Эликсир',
  poison: 'Яд',
  tool: 'Инструмент',
  consumable: 'Расходник',
  other: 'Другое'
}

onMounted(async () => {
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'alchemical.json')
    const data = await res.json()
    items.value = data.map((d: unknown) => AlchemicalItemSchema.parse(d))
  } catch (e) {
    loadError.value = String(e)
  } finally {
    isLoading.value = false
  }
})

type AlchSortKey = 'name' | 'category'
const sortKey = ref<AlchSortKey | null>(null)
const sortAsc = ref(true)

function toggleSort(key: AlchSortKey) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

function sortIndicator(key: AlchSortKey): string {
  if (sortKey.value !== key) return ''
  return sortAsc.value ? ' ↓' : ' ↑'
}

const filtered = computed(() => {
  let list = [...items.value]
  if (filterStore.searchQuery.trim()) {
    const q = filterStore.searchQuery.toLowerCase()
    list = list.filter((it) => it.name.ru.toLowerCase().includes(q) || it.name.en.toLowerCase().includes(q))
  }
  if (filterStore.categories.length) {
    list = list.filter((it) => filterStore.categories.includes(it.category))
  }
  if (filterStore.traits.length) {
    list = list.filter((it) => it.traits.some((t) => filterStore.traits.includes(t)))
  }
  if (filterStore.levels.length) {
    list = list.filter((it) => it.variants.some((v) => filterStore.levels.includes(v.level)))
  }
  return list
})

const sorted = computed(() => {
  if (!sortKey.value) return filtered.value
  const list = [...filtered.value]
  list.sort((a, b) => {
    let av: string | number
    let bv: string | number
    switch (sortKey.value) {
      case 'name':
        av = a.name.ru.toLowerCase()
        bv = b.name.ru.toLowerCase()
        break
      case 'category':
        av = categoryLabel[a.category]
        bv = categoryLabel[b.category]
        break
      default:
        return 0
    }
    if (av < bv) return sortAsc.value ? -1 : 1
    if (av > bv) return sortAsc.value ? 1 : -1
    return 0
  })
  return list
})

watch(expandAll, (v) => {
  if (v) {
    openIds.value = new Set(filtered.value.map(it => it.id))
  } else {
    openIds.value = new Set()
  }
})

watch(filtered, () => {
  if (expandAll.value) {
    openIds.value = new Set(filtered.value.map(it => it.id))
  }
})

function toggleOpen(id: string) {
  if (expandAll.value) {
    expandAll.value = false
  }
  if (openIds.value.has(id)) openIds.value.delete(id)
  else openIds.value.add(id)
  openIds.value = new Set(openIds.value)
}

function fixRelativeLinks(html: string): string {
  if (!html) return html
  return html
    .replace(/<span id="[^"]*"><\/span>/g, '')
    .replace(/href="\.\.\/playing_the_game\.html#/g, 'href="#')
    .replace(/href="\.\.\/([^"]+)"/g, (m, p1) => {
      if (p1.startsWith('http') || p1.startsWith('#') || p1.startsWith('/')) return m
      return `href="https://pf2e-ru-translation.readthedocs.io/ru/latest/${p1}"`
    })
    .replace(/alt="[^"]*одиночное[^"]*"/gi, 'alt="PF_action_1"')
    .replace(/alt="[^"]*2-х[^"]*"/gi, 'alt="PF_action_2"')
    .replace(/alt="[^"]*3-х[^"]*"/gi, 'alt="PF_action_3"')
    .replace(/alt="[^"]*свободное[^"]*"/gi, 'alt="PF_action_free"')
    .replace(/alt="[^"]*реакция[^"]*"/gi, 'alt="PF_action_reaction"')
}

function stripSource(html: string): string {
  if (!html) return html
  let s = html
  s = s.replace(/<b[^>]*>\s*Источник\s*<\/b>[\s\S]*?(?:<br\s*\/?>\s*)?/gi, '')
  s = s.replace(/<strong[^>]*>\s*Источник\s*<\/strong>[\s\S]*?(?:<br\s*\/?>\s*)?/gi, '')
  s = s.replace(/<(p|div)[^>]*>[\s\S]*?Источник[\s\S]*?<\/\1>/gi, '')
  s = s.replace(/Источник:[^<\n]*\(https:\/\/yankristsov\.github\.io\/sources\/[^)]*\)[.\s]*/gi, '')
  s = s.replace(/Источник:[^<\n]*/gi, '')
  s = s.replace(/:\s*(Lost Omens|Pathfinder #\d+|Advanced Player's Guide)[^<\n]*/gi, '')
  s = s.replace(/<column[^>]*>/gi, '')
  s = s.replace(/<\/column>/gi, '')
  s = s.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
  s = s.replace(/<traits[^>]*>[\s\S]*?<\/traits>/gi, '')
  s = s.replace(/<\/?li[^>]*>/gi, '')
  s = s.replace(/<\/?ul[^>]*>/gi, '')
  s = s.replace(/\s+style="height:\s*1em"/gi, '')
  return s
}

function itemHtml(item: AlchemicalItem): string {
  const levels = item.variants.map(v => v.level).join(', ')
  const prefix = levels ? `<strong>Уровень:</strong> ${levels}<br>` : ''
  return prefix + (item.descriptionHtml || '')
}
</script>

<template>
  <div class="home-view">
    <header class="content-header">
      <h1 class="content-title">Алхимические предметы</h1>
      <div class="header-actions">
        <button class="btn btn-secondary btn-sm" @click="expandAll = !expandAll">{{ expandAll ? 'Свернуть все' : 'Раскрыть все' }}</button>
      </div>
    </header>

    <div v-if="loadError" class="card p-md mb-md" style="border-color: var(--color-error);">
      <p class="text-error">Ошибка загрузки: {{ loadError }}</p>
    </div>

    <div v-if="isLoading" class="flex justify-center p-xl">
      <div class="loading-spinner" aria-label="Загрузка"></div>
    </div>

    <template v-else>
      <div v-if="filtered.length === 0" class="empty-state">
        <h3>Предметы не найдены</h3>
        <p>Попробуйте изменить фильтры или поисковый запрос</p>
      </div>

      <table v-else class="table w-full">
        <thead>
          <tr>
            <th scope="col">
              <button type="button" class="th-sort" :aria-label="`Сортировать по названию`" @click="toggleSort('name')">
                Название<span class="sort-arrow" aria-hidden="true">{{ sortIndicator('name') }}</span>
              </button>
            </th>
            <th scope="col">
              <button type="button" class="th-sort" :aria-label="`Сортировать по категории`" @click="toggleSort('category')">
                Категория<span class="sort-arrow" aria-hidden="true">{{ sortIndicator('category') }}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in sorted" :key="item.id">
            <tr class="cursor-pointer" @click="toggleOpen(item.id)">
              <td>
                <div class="spell-name-cell font-medium">{{ item.name.ru }}</div>
                <div v-if="item.name.en && item.name.en !== item.name.ru" class="spell-name-cell text-xs text-muted">{{ item.name.en }}</div>
              </td>
              <td>{{ categoryLabel[item.category] }}</td>
            </tr>
            <tr v-if="openIds.has(item.id)">
              <td colspan="2">
                <div class="p-md">
                  <div v-if="item.traits.length" class="flex flex-wrap items-center gap-sm mt-sm mb-sm">
                    <span v-for="t in item.traits" :key="t" class="chip">{{ t }}</span>
                  </div>
                  <div v-if="item.descriptionHtml" class="alchemical-detail mt-sm" v-html="stripSource(fixRelativeLinks(itemHtml(item)))"></div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.cursor-pointer { cursor: pointer; }
.alchemical-detail { font-size: 0.875rem; line-height: 1.6; color: var(--color-text); }
.alchemical-detail p { margin: 0.5em 0; }
.alchemical-detail :deep(img.action) { display: inline; vertical-align: middle; height: 1em; }
.alchemical-detail :deep(hr.docutils) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 0.8em 0;
}
.th-sort {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  width: 100%;
  text-align: left;
}
.th-sort:hover { color: var(--color-text); }
.sort-arrow { font-size: 0.75rem; opacity: 0.6; }
</style>
