import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FilterState, UserSettings, FavoriteSpell, ViewHistory } from '@/types/spell'

export const useFilterStore = defineStore('filters', () => {
  const state = ref<FilterState>({
    level: [],
    tradition: [],
    school: [],
    class: [],
    traits: [],
    components: [],
    source: [],
    rarity: [],
    actions: [],
    searchQuery: ''
  })

  function setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    state.value[key] = value
  }

  function toggleFilter<K extends keyof FilterState>(key: K, item: FilterState[K][0]) {
    const arr = state.value[key] as unknown[]
    const idx = arr.indexOf(item)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(item)
  }

  function clearFilters() {
    state.value = {
      level: [],
      tradition: [],
      school: [],
      class: [],
      traits: [],
      components: [],
      source: [],
      rarity: [],
      actions: [],
      searchQuery: ''
    }
  }

  function hasActiveFilters(): boolean {
    return Object.entries(state.value).some(([k, v]) => {
      if (k === 'searchQuery') return v !== ''
      return Array.isArray(v) && v.length > 0
    })
  }

  return { state, setFilter, toggleFilter, clearFilters, hasActiveFilters }
})

export const useSettingsStore = defineStore('settings', () => {
  const state = ref<UserSettings>({
    theme: 'system',
    language: 'ru',
    viewMode: 'table',
    // колонка «classes» пуста во всех записях (источники не дают классы) — по умолчанию скрыта
    tableColumns: ['name', 'level', 'tradition', 'school', 'traits', 'actions']
  })

  function load() {
    const saved = localStorage.getItem('pf2e-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.tableColumns)) {
          const cols = parsed.tableColumns.filter((c: string) => c !== 'rarity')
          for (const required of ['traits', 'actions']) {
            if (!cols.includes(required)) cols.push(required)
          }
          parsed.tableColumns = cols
        }
        state.value = { ...state.value, ...parsed }
      } catch { /* ignore invalid JSON */ }
    }
    applyTheme()
  }

  function save() {
    localStorage.setItem('pf2e-settings', JSON.stringify(state.value))
    applyTheme()
  }

  function applyTheme() {
    const theme = state.value.theme
    const root = document.documentElement
    if (theme === 'system') {
      root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }

  function setTheme(theme: UserSettings['theme']) {
    state.value.theme = theme
    save()
  }

  function setLanguage(lang: UserSettings['language']) {
    state.value.language = lang
    save()
  }

  function setViewMode(mode: UserSettings['viewMode']) {
    state.value.viewMode = mode
    save()
  }

  function setTableColumns(cols: string[]) {
    state.value.tableColumns = cols
    save()
  }

  function exportSettings(): string {
    return JSON.stringify(state.value, null, 2)
  }

  function importSettings(json: string) {
    try {
      const parsed = JSON.parse(json)
      state.value = { ...state.value, ...parsed }
      save()
      return true
    } catch {
      return false
    }
  }

  watchMedia()

  function watchMedia() {
    if (state.value.theme === 'system') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme)
    }
  }

  return { state, load, save, setTheme, setLanguage, setViewMode, setTableColumns, exportSettings, importSettings }
})

export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref<FavoriteSpell[]>([])

  function load() {
    const saved = localStorage.getItem('pf2e-favorites')
    if (saved) {
      try { items.value = JSON.parse(saved) } catch { /* ignore invalid JSON */ }
    }
  }

  function save() {
    localStorage.setItem('pf2e-favorites', JSON.stringify(items.value))
  }

  function add(spellId: string) {
    if (!items.value.find(f => f.spellId === spellId)) {
      items.value.push({ spellId, notes: '', addedAt: Date.now() })
      save()
    }
  }

  function remove(spellId: string) {
    const idx = items.value.findIndex(f => f.spellId === spellId)
    if (idx >= 0) {
      items.value.splice(idx, 1)
      save()
    }
  }

  function toggle(spellId: string) {
    if (isFavorite(spellId)) remove(spellId)
    else add(spellId)
  }

  function isFavorite(spellId: string): boolean {
    return items.value.some(f => f.spellId === spellId)
  }

  function updateNotes(spellId: string, notes: string) {
    const fav = items.value.find(f => f.spellId === spellId)
    if (fav) {
      fav.notes = notes
      save()
    }
  }

  function exportFavorites(): string {
    return JSON.stringify(items.value, null, 2)
  }

  function importFavorites(json: string): boolean {
    try {
      items.value = JSON.parse(json)
      save()
      return true
    } catch {
      return false
    }
  }

  const favoriteIds = computed(() => new Set(items.value.map(f => f.spellId)))

  return { items, load, add, remove, toggle, isFavorite, updateNotes, exportFavorites, importFavorites, favoriteIds }
})

export const useHistoryStore = defineStore('history', () => {
  const items = ref<ViewHistory[]>([])
  const MAX_HISTORY = 20

  function load() {
    const saved = localStorage.getItem('pf2e-history')
    if (saved) {
      try { items.value = JSON.parse(saved) } catch { /* ignore invalid JSON */ }
    }
  }

  function save() {
    localStorage.setItem('pf2e-history', JSON.stringify(items.value))
  }

  function add(spellId: string) {
    items.value = items.value.filter(h => h.spellId !== spellId)
    items.value.unshift({ spellId, viewedAt: Date.now() })
    if (items.value.length > MAX_HISTORY) items.value = items.value.slice(0, MAX_HISTORY)
    save()
  }

  function clear() {
    items.value = []
    save()
  }

  return { items, load, add, clear }
})

export const useComparisonStore = defineStore('comparison', () => {
  const items = ref<string[]>([])
  const MAX_COMPARE = 3

  function add(spellId: string) {
    if (!items.value.includes(spellId) && items.value.length < MAX_COMPARE) {
      items.value.push(spellId)
    }
  }

  function remove(spellId: string) {
    const idx = items.value.indexOf(spellId)
    if (idx >= 0) items.value.splice(idx, 1)
  }

  function toggle(spellId: string) {
    if (items.value.includes(spellId)) remove(spellId)
    else add(spellId)
  }

  function clear() {
    items.value = []
  }

  function isInComparison(spellId: string): boolean {
    return items.value.includes(spellId)
  }

  return { items, add, remove, toggle, clear, isInComparison }
})