<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useFilterStore, useSettingsStore, useHistoryStore, useComparisonStore, useFavoritesStore } from '@/stores'
import SpellCard from '@/components/SpellCard.vue'
import SpellTable from '@/components/SpellTable.vue'

const router = useRouter()
const filterStore = useFilterStore()
const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()
const comparisonStore = useComparisonStore()
const favoritesStore = useFavoritesStore()
const { search } = useSpells()
const isLoading = computed(() => useSpells().isLoading.value)
const loadError = computed(() => useSpells().loadError.value)

const viewMode = computed(() => settingsStore.state.viewMode)
const filteredSpells = computed(() => search(filterStore.state.searchQuery, filterStore.state))
const selectedSpells = ref<Set<string>>(new Set())

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
        :spells="filteredSpells"
        :selected="selectedSpells"
        @select="toggleSelect"
        @view="viewSpell"
      />
      <div v-else class="spell-grid cards">
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
    </template>

    <div v-if="selectedSpells.size > 0" class="fixed bottom-4 right-4 z-30 flex flex-col gap-sm">
      <button class="btn btn-primary shadow-lg" @click="addToComparison">
        <span v-if="selectedSpells.size <= 3">Добавить к сравнению ({{ selectedSpells.size }}/3)</span>
        <span v-else class="text-error">Максимум 3 заклинания</span>
      </button>
      <button class="btn btn-secondary shadow-lg" @click="clearSelection">Очистить выбор</button>
    </div>
  </div>
</template>