<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { AlchemicalItemSchema } from '@/types/alchemical'
import type { AlchemicalItem } from '@/types/alchemical'
import { useAlchemicalFilterStore } from '@/stores'
import { sourceLabel } from '@/constants/translations'

const items = ref<AlchemicalItem[]>([])
const isLoading = ref(true)
const loadError = ref('')
const filterStore = useAlchemicalFilterStore()
const openIds = ref<Set<string>>(new Set())
const activeSourceByItem = ref<Record<string, number>>({})
const expandAll = ref(false)

const categoryLabel: Record<string, string> = {
  bomb: 'Бомба',
  elixir: 'Эликсир',
  poison: 'Яд',
  tool: 'Инструмент',
  consumable: 'Расходник',
  other: 'Другое'
}

const SOURCE_ORDER: Record<string, number> = { pf2ru: 0, 'pf2e-ru-translation': 1, aonprd: 2 }

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

function getOrderedSources(item: AlchemicalItem) {
  const sources = [...new Set(item.variants.map(v => v.source))]
  return sources.sort((a, b) => (SOURCE_ORDER[a.type] ?? 9) - (SOURCE_ORDER[b.type] ?? 9))
}

function getActiveSourceIndex(item: AlchemicalItem) {
  return activeSourceByItem.value[item.id] ?? 0
}

function setActiveSource(item: AlchemicalItem, idx: number) {
  activeSourceByItem.value[item.id] = idx
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
  list.sort((a, b) => a.name.ru.localeCompare(b.name.ru, 'ru'))
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
    .replace(/href="\.\.\/playing_the_game\.html#/g, 'href="#')
    .replace(/href="\.\.\/([^"]+)"/g, (m, p1) => {
      if (p1.startsWith('http') || p1.startsWith('#') || p1.startsWith('/')) return m
      return `href="https://pf2e-ru-translation.readthedocs.io/ru/latest/${p1}"`
    })
}

function stripSource(html: string): string {
  if (!html) return html
  let s = html
  s = s.replace(/<(p|div)[^>]*>[\s\S]*?<strong[^>]*>\s*Источник[\s\S]*?<\/strong>[\s\S]*?<\/\1>/gi, '')
  s = s.replace(/<(p|div)[^>]*>\s*Источник[\s\S]*?<\/\1>/gi, '')
  return s
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
            <th>Название</th>
            <th>Категория</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in filtered" :key="item.id">
            <tr class="cursor-pointer" @click="toggleOpen(item.id)">
              <td>{{ item.name.ru }}</td>
              <td>{{ categoryLabel[item.category] }}</td>
            </tr>
            <tr v-if="openIds.has(item.id)">
              <td colspan="2">
                <div class="p-md">
                  <div class="tabs" role="tablist" aria-label="Варианты источника">
                    <button
                      v-for="(src, i) in getOrderedSources(item)"
                      :key="`${src.type}-${src.name}-${i}`"
                      role="tab"
                      class="tab"
                      :class="{ active: getActiveSourceIndex(item) === i }"
                      :aria-selected="getActiveSourceIndex(item) === i"
                      @click.stop="setActiveSource(item, i)"
                    >
                      {{ sourceLabel(src.name) }}
                    </button>
                  </div>
                  <div v-if="item.traits.length" class="flex flex-wrap items-center gap-sm mt-sm mb-sm">
                    <span v-for="t in item.traits" :key="t" class="chip">{{ t }}</span>
                  </div>
                  <div v-if="item.descriptionHtml" class="alchemical-detail mt-sm" v-html="stripSource(fixRelativeLinks(item.descriptionHtml))"></div>
                  <div class="mt-sm">
                    <div v-for="v in item.variants" :key="v.level + v.name" class="mb-sm">
                      <div class="font-semibold">{{ v.name }}</div>
                      <div>Уровень: {{ v.level }}</div>
                      <div v-if="v.price">{{ v.price }}</div>
                    </div>
                  </div>
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
.alchemical-detail :deep(img.action) { display: inline; vertical-align: middle; height: 1em; }
.alchemical-detail :deep(hr.docutils) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 0.6em 0;
}
</style>
