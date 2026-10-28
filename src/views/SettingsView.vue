<script setup lang="ts">
import { useSettingsStore, useFavoritesStore, useHistoryStore } from '@/stores'

const settingsStore = useSettingsStore()
const favoritesStore = useFavoritesStore()
const historyStore = useHistoryStore()

const columnLabels: Record<string, string> = {
  name: 'Название',
  level: 'Уровень',
  tradition: 'Традиция',
  school: 'Школа',
  classes: 'Классы',
  traits: 'Дескрипторы',
  actions: 'Время сотворения'
}

const availableColumns = ['name', 'level', 'tradition', 'school', 'classes', 'traits', 'actions']

const version = import.meta.env.VITE_APP_VERSION || '0.1.0'

function toggleColumn(col: string) {
  const cols = [...settingsStore.state.tableColumns]
  const idx = cols.indexOf(col)
  if (idx >= 0) cols.splice(idx, 1)
  else cols.push(col)
  settingsStore.setTableColumns(cols)
}

function clearFavorites() {
  if (confirm('Delete all favorites?')) {
    favoritesStore.items = []
    localStorage.removeItem('pf2e-favorites')
  }
}

function clearHistory() {
  if (confirm('Delete view history?')) {
    historyStore.clear()
  }
}

function clearAll() {
  if (confirm('Delete ALL user data (favorites, history, settings)?')) {
    clearFavorites()
    clearHistory()
    localStorage.removeItem('pf2e-settings')
    settingsStore.load()
  }
}
</script>

<template>
  <div class="settings-view max-w-3xl">
    <header class="content-header">
      <h1 class="content-title">Настройки</h1>
    </header>

    <section class="card mb-md">
      <div class="card-header">
        <h2 class="text-lg font-semibold">Внешний вид</h2>
      </div>
      <div class="card-body space-y-md">
        <div>
          <label class="input-label">Тема</label>
          <div class="flex gap-sm">
            <button
              v-for="t in ['light', 'dark', 'system']"
              :key="t"
              class="btn flex-1"
              :class="{ 'btn-primary': settingsStore.state.theme === t, 'btn-secondary': settingsStore.state.theme !== t }"
              @click="settingsStore.setTheme(t)"
            >
              {{ t === 'light' ? '☀️ Светлая' : t === 'dark' ? '🌙 Тёмная' : '💻 Системная' }}
            </button>
          </div>
        </div>

        <div>
          <label class="input-label">Колонки таблицы</label>
          <div class="flex flex-wrap gap-sm">
            <label v-for="col in availableColumns" :key="col" class="chip cursor-pointer" :class="{ 'chip-primary': settingsStore.state.tableColumns.includes(col) }" @click="toggleColumn(col)">
              <input type="checkbox" :checked="settingsStore.state.tableColumns.includes(col)" class="mr-xs" />
              {{ columnLabels[col] }}
            </label>
          </div>
        </div>
      </div>
    </section>

    <section class="card mb-md">
      <div class="card-header">
        <h2 class="text-lg font-semibold">Данные</h2>
      </div>
      <div class="card-body space-y-md">
        <div>
          <h3 class="font-medium mb-sm">Очистка данных</h3>
          <p class="text-sm text-secondary mb-md">Удаление избранного, истории просмотров и сброс настроек. Действие необратимо.</p>
          <div class="flex flex-wrap gap-sm">
            <button class="btn btn-danger" :disabled="!favoritesStore.items.length" @click="clearFavorites">Очистить избранное</button>
            <button class="btn btn-danger" :disabled="!historyStore.items.length" @click="clearHistory">Очистить историю</button>
            <button class="btn btn-danger" :disabled="!favoritesStore.items.length && !historyStore.items.length" @click="clearAll">Очистить всё</button>
          </div>
        </div>
      </div>
    </section>

    <section class="card mb-md">
      <div class="card-header">
        <h2 class="text-lg font-semibold">О проекте</h2>
      </div>
      <div class="card-body space-y-sm text-sm text-secondary">
        <p><strong>PF2E Заклинания</strong> — офлайн-справочник заклинаний Pathfinder 2e</p>
        <p>Источник данных: pf2.ru. Данные о школах, классах и компонентах этот источник не предоставляет.</p>
        <p>Данные обновляются при ручном деплое</p>
        <p>Версия: {{ version }}</p>
        <p><a href="https://github.com/YanKristsov/PFTH2E" target="_blank" rel="noopener">Репозиторий на GitHub</a></p>
      </div>
    </section>
  </div>
</template>