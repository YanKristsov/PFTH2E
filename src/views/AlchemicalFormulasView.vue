<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AlchemicalItemSchema } from '@/types/alchemical'
import type { AlchemicalItem } from '@/types/alchemical'

const items = ref<AlchemicalItem[]>([])
const isLoading = ref(true)
const loadError = ref('')
const searchQuery = ref('')
const selectedCategories = ref<string[]>([])
const selectedLevels = ref<number[]>([])
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
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((it) =>
      it.name.ru.toLowerCase().includes(q) || it.name.en.toLowerCase().includes(q)
    )
  }
  if (selectedCategories.value.length) {
    list = list.filter((it) => selectedCategories.value.includes(it.category))
  }
  if (selectedLevels.value.length) {
    list = list.filter((it) => it.variants.some((v) => selectedLevels.value.includes(v.level)))
  }
  list.sort((a, b) => a.name.ru.localeCompare(b.name.ru, 'ru'))
  return list
})

function toggleCategory(c: string) {
  const i = selectedCategories.value.indexOf(c)
  if (i === -1) selectedCategories.value.push(c)
  else selectedCategories.value.splice(i, 1)
}

function toggleLevel(l: number) {
  const i = selectedLevels.value.indexOf(l)
  if (i === -1) selectedLevels.value.push(l)
  else selectedLevels.value.splice(i, 1)
}

function toggleOpen(id: string) {
  if (openIds.value.has(id)) openIds.value.delete(id)
  else openIds.value.add(id)
  openIds.value = new Set(openIds.value)
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategories.value = []
  selectedLevels.value = []
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
      <div class="card mb-md p-md">
        <div class="flex flex-wrap gap-sm mb-sm">
          <input v-model="searchQuery" type="search" class="search-input" placeholder="Поиск предметов..." />
        </div>
        <div class="flex flex-wrap gap-xs mb-sm">
          <button
            v-for="c in categories"
            :key="c"
            class="chip"
            :class="{ 'chip-primary': selectedCategories.includes(c) }"
            @click="toggleCategory(c)"
          >
            {{ categoryLabel[c] }}
          </button>
        </div>
        <div class="level-grid">
          <button
            v-for="l in 20"
            :key="l"
            class="chip level-chip"
            :class="{ 'chip-primary': selectedLevels.includes(l) }"
            @click="toggleLevel(l)"
          >
            {{ l }}
          </button>
        </div>
        <div class="flex justify-end mt-sm">
          <button class="btn btn-ghost btn-sm" @click="clearFilters">Сбросить</button>
        </div>
      </div>

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
                  <div v-for="v in item.variants" :key="v.level + v.name" class="mb-md">
                    <div class="font-semibold">{{ v.name }} (ур. {{ v.level }}) — {{ v.price }}</div>
                    <div v-if="v.description" class="text-sm text-secondary mt-xs">{{ v.description }}</div>
                  </div>
                  <div v-if="item.variants.every((v) => !v.description)" class="text-sm text-muted">
                    Описание будет добавлено позже.
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
.level-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--spacing-xs); }
.level-chip { justify-content: center; padding-left: 0; padding-right: 0; }
.cursor-pointer { cursor: pointer; }
</style>
