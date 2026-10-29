<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AlchemicalItemSchema } from '@/types/alchemical'
import type { AlchemicalItem } from '@/types/alchemical'
import { useAlchemicalFilterStore } from '@/stores'

const items = ref<AlchemicalItem[]>([])
const isLoading = ref(true)
const loadError = ref('')
const filterStore = useAlchemicalFilterStore()
const openIds = ref<Set<string>>(new Set())

const categories = ['bomb', 'elixir', 'poison', 'tool', 'consumable', 'other'] as const
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

const filtered = computed(() => {
  let list = [...items.value]
  if (filterStore.searchQuery.trim()) {
    const q = filterStore.searchQuery.toLowerCase()
    list = list.filter((it) =>
      it.name.ru.toLowerCase().includes(q) || it.name.en.toLowerCase().includes(q)
    )
  }
  if (filterStore.categories.length) {
    list = list.filter((it) => filterStore.categories.includes(it.category))
  }
  if (filterStore.traits.length) {
    list = list.filter((it) => it.traits.some((t) => filterStore.traits.includes(t)))
  }
  list.sort((a, b) => a.name.ru.localeCompare(b.name.ru, 'ru'))
  return list
})

function toggleOpen(id: string) {
  if (openIds.value.has(id)) openIds.value.delete(id)
  else openIds.value.add(id)
  openIds.value = new Set(openIds.value)
}
</script>

<template>
  <div class="home-view">
    <header class="content-header">
      <h1 class="content-title">Алхимические формулы</h1>
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
                  <div class="tabs" style="display:flex;gap:4px;margin-bottom:8px;">
                    <button class="btn btn-sm btn-primary">pf2e-ru-translation</button>
                  </div>
                  <div v-if="item.descriptionHtml" class="alchemical-detail" v-html="item.descriptionHtml"></div>
                  <div v-if="item.traits.length" class="flex flex-wrap gap-xs mt-sm">
                    <span v-for="t in item.traits" :key="t" class="chip chip-primary" style="cursor:default">{{ t }}</span>
                  </div>
                  <div v-if="item.variants.length" class="mt-sm">
                    <div v-for="v in item.variants" :key="v.level + v.name" class="mb-sm">
                      <div class="font-semibold">{{ v.name }}</div>
                      <div>Уровень: {{ v.level }}</div>
                      <div>{{ v.price }}</div>
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
.alchemical-detail :deep(p) { margin: 0.4em 0; }
</style>
