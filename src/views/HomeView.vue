<script setup lang="ts">
import { onMounted, watch, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useFilterStore, useSettingsStore, useHistoryStore, useComparisonStore, useFavoritesStore } from '@/stores'
import SpellCard from '@/components/SpellCard.vue'
import SpellTable from '@/components/SpellTable.vue'

const route = useRoute()
const router = useRouter()
const filterStore = useFilterStore()
const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()
const comparisonStore = useComparisonStore()
const favoritesStore = useFavoritesStore()
const { search, loadError, isLoading, allClasses } = useSpells()

const viewMode = computed(() => settingsStore.state.viewMode)
const filteredSpells = computed(() => search(filterStore.state.searchQuery, filterStore.state))
const selectedSpells = ref<Set<string>>(new Set())

onMounted(() => {
  const query = route.query.q
  if (query && typeof query === 'string') {
    filterStore.setFilter('searchQuery', query)
  }
})

watch(() => route.query.q, (newQuery) => {
  if (newQuery && typeof newQuery === 'string') {
    filterStore.setFilter('searchQuery', newQuery)
  } else if (!newQuery) {
    filterStore.setFilter('searchQuery', '')
  }
})

function viewSpell(spellId: string) {
    historyStore.add(spellId)
    router.push({ name: 'spell-detail', params: { id: spellId } })
  }

function toggleFavorite(spellId: string) {
  favoritesStore.toggle(spellId)
}

function toggleCompare(spellId: string) {
  comparisonStore.toggle(spellId)
}

function toggleSelect(spellId: string) {
  if (selectedSpells.value.has(spellId)) {
    selectedSpells.value.delete(spellId)
  } else {
    selectedSpells.value.add(spellId)
  }
}

function addToComparison() {
  if (selectedSpells.value.size > 3) return
  selectedSpells.value.forEach(id => comparisonStore.add(id))
  router.push({ name: 'compare' })
}

function clearSelection() {
    selectedSpells.value.clear()
  }

  function handleSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    filterStore.setFilter('searchQuery', value)
    router.replace({ query: { q: value || undefined } })
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
          <span class="hidden mobile:hidden">{{ viewMode === 'table' ? 'Карточки' : 'Таблица' }}</span>
        </button>
      </div>
    </header>

    <div v-if="loadError" class="card p-md mb-md" style="border-color: var(--color-error);">
      <p class="text-error">Load error: {{ loadError }}</p>
      <button class="btn btn-primary mt-sm" @click="router.go(0)">Retry</button>
    </div>

    <div class="filter-bar" role="search" aria-label="Фильтры заклинаний">
      <div class="filter-group flex-1 min-w-[200px]">
        <label for="global-search" class="input-label">Поиск</label>
        <input
          id="global-search"
          :value="filterStore.state.searchQuery"
          type="search"
          class="search-input"
          placeholder="Название, описание, traits..."
          @input="handleSearchInput"
        />
      </div>
      <div class="filter-group">
        <label for="level-filter" class="input-label">Уровень</label>
        <select id="level-filter" v-model="filterStore.state.level" class="filter-select" multiple>
          <option value="">Все</option>
          <option v-for="l in 10" :key="l" :value="l">{{ l }}</option>
          <option value="0">0 (заговоры)</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="tradition-filter" class="input-label">Традиция</label>
        <select id="tradition-filter" v-model="filterStore.state.tradition" class="filter-select" multiple>
          <option value="">Все</option>
          <option v-for="t in ['arcane', 'divine', 'occult', 'primal']" :key="t" :value="t" :class="{ 'capitalize': true }">{{ t }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="school-filter" class="input-label">Школа</label>
        <select id="school-filter" v-model="filterStore.state.school" class="filter-select" multiple>
          <option value="">Все</option>
          <option v-for="s in allClasses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="class-filter" class="input-label">Класс</label>
        <select id="class-filter" v-model="filterStore.state.class" class="filter-select" multiple>
          <option value="">Все</option>
        </select>
      </div>
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

    <div v-else class="spell-grid" :class="viewMode">
      <SpellTable
        v-if="viewMode === 'table'"
        :spells="filteredSpells"
        :selected="selectedSpells"
        @select="toggleSelect"
        @view="viewSpell"
      />
      <div v-else class="flex flex-wrap gap-md">
        <SpellCard
          v-for="spellIndex in filteredSpells"
          :key="spellIndex.id"
          :spell-index="spellIndex"
          :is-favorite="favoritesStore.favoriteIds.has(spellIndex.id)"
          :is-in-comparison="comparisonStore.isInComparison(spellIndex.id)"
          @view="viewSpell"
          @favorite="toggleFavorite"
          @compare="toggleCompare"
        />
      </div>
    </div>

    <div v-if="selectedSpells.size > 0" class="fixed bottom-4 right-4 z-30 flex flex-col gap-sm">
      <button class="btn btn-primary shadow-lg" @click="addToComparison">
        <span v-if="selectedSpells.size <= 3">Добавить к сравнению ({{ selectedSpells.size }}/3)</span>
        <span v-else class="text-error">Максимум 3 заклинания</span>
      </button>
      <button class="btn btn-secondary shadow-lg" @click="clearSelection">Очистить выбор</button>
    </div>
  </div>
</template>