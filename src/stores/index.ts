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
    sidebarCollapsed: false,
    // колонка «classes» заполняется из данных, по умолчанию включена вместе с «traits» и «actions»
    tableColumns: ['name', 'level', 'tradition', 'school', 'classes', 'traits', 'actions']
  })

  const darkMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

  function load() {
    const saved = localStorage.getItem('pf2e-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.tableColumns)) {
          const cols = parsed.tableColumns.filter((c: string) => c !== 'rarity')
          for (const required of ['traits', 'actions', 'classes']) {
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

  function isDarkTheme(): boolean {
    const theme = state.value.theme
    if (theme === 'dark') return true
    if (theme === 'light') return false
    return darkMedia ? darkMedia.matches : false
  }

  /**
   * Класс `dark`/`light` ставится явно: в CSS есть `@media (prefers-color-scheme: dark)`
   * с `:root:not(.light):not(.light-mode)`, поэтому без класса `light` на тёмной ОС
   * светлая тема не применялась.
   */
  function applyTheme() {
    const root = document.documentElement
    const isDark = isDarkTheme()
    root.classList.toggle('dark', isDark)
    root.classList.toggle('light', !isDark)
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

  function toggleSidebar() {
    state.value.sidebarCollapsed = !state.value.sidebarCollapsed
    save()
  }

  // смена системной темы применяется сразу, если выбран режим «Системная»
  darkMedia?.addEventListener('change', () => {
    if (state.value.theme === 'system') applyTheme()
  })

  return { state, load, save, setTheme, setLanguage, setViewMode, setTableColumns, toggleSidebar }
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

  const favoriteIds = computed(() => new Set(items.value.map(f => f.spellId)))

  return { items, load, add, remove, toggle, isFavorite, updateNotes, favoriteIds }
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