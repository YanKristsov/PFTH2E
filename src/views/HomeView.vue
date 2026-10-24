<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useFilterStore, useSettingsStore, useHistoryStore, useFavoritesStore } from '@/stores'
import SpellCard from '@/components/SpellCard.vue'
import SpellTable from '@/components/SpellTable.vue'

const router = useRouter()
const filterStore = useFilterStore()
const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()
const favoritesStore = useFavoritesStore()
const { search, getSpell } = useSpells()
const isLoading = computed(() => useSpells().isLoading.value)
const loadError = computed(() => useSpells().loadError.value)

const viewMode = computed(() => settingsStore.state.viewMode)
const filteredSpells = computed(() => search(filterStore.state.searchQuery, filterStore.state))

type SortKey = 'name' | 'traits' | 'level' | 'actions' | 'tradition'
const sortKey = ref<SortKey | null>(null)
const sortAsc = ref(true)

function toggleSort(key: SortKey) {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else { sortKey.value = key; sortAsc.value = true }
}

function sortIndicator(key: SortKey): string {
  if (sortKey.value !== key) return ''
  return sortAsc.value ? ' ↓' : ' ↑'
}

const sortedSpells = computed(() => {
  if (!sortKey.value) return filteredSpells.value
  const list = [...filteredSpells.value]
  list.sort((a, b) => {
    let av: string | number
    let bv: string | number
    switch (sortKey.value) {
      case 'name': av = a.nameRu.toLowerCase(); bv = b.nameRu.toLowerCase(); break
      case 'traits': av = a.traits.map(t => t).join(',').toLowerCase(); bv = b.traits.map(t => t).join(',').toLowerCase(); break
      case 'level': av = a.level; bv = b.level; break
      case 'actions': {
        const sa = getSpell(a.id); const sb = getSpell(b.id)
        av = sa ? 0 : 99; bv = sb ? 0 : 99
        break
      }
      case 'tradition': av = a.tradition.join(',').toLowerCase(); bv = b.tradition.join(',').toLowerCase(); break
      default: return 0
    }
    if (av < bv) return sortAsc.value ? -1 : 1
    if (av > bv) return sortAsc.value ? 1 : -1
    return 0
  })
  return list
})

const PAGE_SIZE = 50
const showAll = ref(false)
const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredSpells.value.length / PAGE_SIZE)))

const pagedSpells = computed(() => {
  if (showAll.value) return sortedSpells.value
  const start = (currentPage.value - 1) * PAGE_SIZE
  return sortedSpells.value.slice(start, start + PAGE_SIZE)
})

watch(filteredSpells, () => {
  currentPage.value = 1
})

watch(() => filterStore.state, () => {
  currentPage.value = 1
}, { deep: true })

function goToPage(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function showFullList() {
  showAll.value = !showAll.value
  currentPage.value = 1
  if (!showAll.value) window.scrollTo({ top: 0, behavior: 'smooth' })
}

function viewSpell(spellId: string) {
    historyStore.add(spellId)
    router.push({ name: 'spell-detail', params: { id: spellId } })
  }

function toggleFavorite(spellId: string) {
  favoritesStore.toggle(spellId)
}
</script>

<template>
  <div class="home-view">
    <header class="content-header">
      <h1 class="content-title">Заклинания Pathfinder 2e</h1>
      <div class="content-actions">
        <button
          class="btn btn-secondary"
          :aria-pressed="viewMode === 'cards'"
          @click="viewMode === 'table' ? settingsStore.setViewMode('cards') : settingsStore.setViewMode('table')"
        >
          <span v-if="viewMode === 'table'" aria-hidden="true">📋</span>
          <span v-else aria-hidden="true">📊</span>
          <span>{{ viewMode === 'table' ? 'Карточки' : 'Таблица' }}</span>
        </button>
      </div>
    </header>

    <div v-if="loadError" class="card p-md mb-md" style="border-color: var(--color-error);">
      <p class="text-error">Ошибка загрузки: {{ loadError }}</p>
      <button class="btn btn-primary mt-sm" @click="router.go(0)">Повторить</button>
    </div>

    <div v-if="isLoading" class="flex justify-center p-xl">
      <div class="loading-spinner" aria-label="Загрузка заклинаний"></div>
    </div>

    <div v-else-if="filteredSpells.length === 0" class="empty-state">
      <div class="empty-state-icon" aria-hidden="true">🔍</div>
      <h3>Заклинания не найдены</h3>
      <p>Попробуйте изменить фильтры или поисковый запрос</p>
      <button class="btn btn-primary mt-md" @click="filterStore.clearFilters">Сбросить фильтры</button>
    </div>

    <template v-else>
      <SpellTable
        v-if="viewMode === 'table'"
        :spells="pagedSpells"
        @view="viewSpell"
      />
      <div v-else>
        <div class="card sort-card mb-md">
          <div class="flex flex-wrap gap-sm">
            <button class="btn btn-secondary btn-sm" @click="toggleSort('name')">Название{{ sortIndicator('name') }}</button>
            <button class="btn btn-secondary btn-sm" @click="toggleSort('level')">Уровень{{ sortIndicator('level') }}</button>
            <button class="btn btn-secondary btn-sm" @click="toggleSort('tradition')">Традиция{{ sortIndicator('tradition') }}</button>
            <button class="btn btn-secondary btn-sm" @click="toggleSort('traits')">Дескрипторы{{ sortIndicator('traits') }}</button>
            <button class="btn btn-secondary btn-sm" @click="toggleSort('actions')">Время сотворения{{ sortIndicator('actions') }}</button>
          </div>
        </div>
        <div class="spell-grid cards">
          <SpellCard
          v-for="spellIndex in pagedSpells"
          :key="spellIndex.id"
          :spell-index="spellIndex"
          :is-favorite="favoritesStore.favoriteIds.has(spellIndex.id)"
          @view="viewSpell"
          @favorite="toggleFavorite"
        />
        </div>
      </div>
      <div class="flex flex-col items-center gap-md mt-xl mb-md">
        <div class="flex flex-wrap items-center justify-center gap-xs">
          <button class="btn btn-secondary btn-sm" :disabled="showAll || currentPage === 1" @click="goToPage(currentPage - 1)">← Назад</button>
          <template v-if="!showAll">
            <template v-for="page in totalPages" :key="page">
              <button
                v-if="page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)"
                class="btn btn-sm"
                :class="page === currentPage ? 'btn-primary' : 'btn-secondary'"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <span v-else-if="page === currentPage - 3 || page === currentPage + 3" class="px-xs text-muted">…</span>
</template>
</template>
          <button class="btn btn-secondary btn-sm" :disabled="showAll || currentPage === totalPages" @click="goToPage(currentPage + 1)">Вперёд →</button>
        </div>
        <button class="btn btn-secondary" @click="showFullList">{{ showAll ? 'По страницам' : 'Список заклинаний' }}</button>
        <div class="text-sm text-muted">Всего: {{ filteredSpells.length }} заклинаний</div>
      </div>
</template>

<style scoped>
.sort-card { grid-column: 1 / -1; padding: var(--spacing-md) var(--spacing-lg); min-height: 44px; }
</style>
  </div>
</template>