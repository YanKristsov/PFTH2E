<script setup lang="ts">
import { computed, defineEmits, defineProps } from 'vue'
const props = defineProps<{ mobile?: boolean }>()
const emit = defineEmits<{ close: [] }>()
import { useRoute } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useFilterStore, useSettingsStore } from '@/stores'
import type { FilterState } from '@/types/spell'
import { COMPONENT_LABELS, filterLabel, traitLabel, traditionLabel, schoolLabel, classLabel, GENERIC_CLASS, GENERIC_CLASS_LABEL } from '@/constants/translations'

const route = useRoute()
const { schools, allTraits, allSources, traditions, allClasses } = useSpells()
const filterStore = useFilterStore()
const settingsStore = useSettingsStore()

const activeNav = computed(() => route.name)

const activeFilters = computed(() => {
  const result: Array<{ key: keyof FilterState; value: string; exclude: boolean }> = []
  for (const [key, value] of Object.entries(filterStore.state) as Array<[keyof FilterState, FilterState[keyof FilterState]]>) {
    if (Array.isArray(value) && value.length > 0) {
      for (const v of value as string[]) {
        if (typeof v === 'string') {
          if (v.startsWith('-')) {
            result.push({ key, value: v.substring(1), exclude: true })
          } else {
            result.push({ key, value: v, exclude: false })
          }
        }
      }
    }
  }
  return result
})

function clearAllFilters() {
  filterStore.clearFilters()
}

function componentLabel(c: string) {
  return COMPONENT_LABELS[c] || c
}

function filterValueLabel(key: keyof FilterState, value: unknown): string {
  const raw = String(value)
  if (raw && raw.charAt(0) === '-') {
    return filterValueLabel(key, raw.substring(1))
  }
  if (key === 'actions') {
    const map: Record<string, string> = {
      '1': '1 действие',
      '2': '2 действия',
      '3': '3 действия',
      reaction: 'Реакция',
      free: 'Свободное',
      time: 'Время'
    }
    return map[raw] || raw
  }
  switch (key) {
    case 'tradition':
      return traditionLabel(raw)
    case 'school':
      return schoolLabel(raw)
    case 'class':
      return classLabel(raw)
    case 'traits':
      return traitLabel(raw)
    case 'components':
      return componentLabel(raw)
    default:
      return raw
  }
}

function filterValueText(filter: { key: keyof FilterState; value: string; exclude?: boolean }): string {
  const label = filterValueLabel(filter.key, filter.value)
  return filter.exclude ? 'не ' + label : label
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: settingsStore.state.sidebarCollapsed }" role="navigation" aria-label="Фильтры и навигация">
    <div v-if="props.mobile" class="flex items-center justify-between p-md border-b border-[var(--color-border)]">
      <h2 class="text-lg font-semibold">Меню и фильтры</h2>
      <button class="btn btn-ghost" aria-label="Закрыть меню" @click="emit('close')">✕</button>
    </div>
    <nav class="sidebar-nav p-md border-b border-[var(--color-border)]" aria-label="Основная навигация">
      <router-link
        v-for="item in [
          { name: 'home', label: 'Все заклинания', icon: '📜' },
          { name: 'favorites', label: 'Избранное', icon: '⭐' },
          { name: 'history', label: 'История', icon: '🕐' }
        ]"
        :key="item.name"
        :to="{ name: item.name }"
        class="sidebar-link"
        :class="{ active: activeNav === item.name }"
      >
        <span class="sidebar-link-icon" aria-hidden="true">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
      <router-link to="/settings" class="sidebar-link" :class="{ active: activeNav === 'settings' }">
        <span class="sidebar-link-icon" aria-hidden="true">⚙️</span>
        <span>Настройки</span>
      </router-link>
    </nav>

    <div class="flex-1 overflow-y-auto p-md">
      <div class="mb-md">
        <div class="flex items-center justify-between mb-sm sidebar-section-title-row">
          <h3 class="sidebar-title">Активные фильтры</h3>
          <button v-if="filterStore.hasActiveFilters()" class="btn btn-ghost btn-sm" @click="clearAllFilters">Сбросить</button>
        </div>
        <div v-if="filterStore.hasActiveFilters()" class="active-filters">
          <span
            v-for="(filter, idx) in activeFilters"
            :key="filter.key + filter.value"
            class="active-filter-chip"
            :class="{ 'active-filter-chip-exclude': filter.exclude }"
          >
            {{ filterLabel(filter.key) }}: {{ filterValueText(filter) }}
            <button type="button" aria-label="Убрать фильтр" @click.stop="filterStore.removeFilter(filter.key, filter.exclude ? '-' + filter.value : filter.value)">×</button>
          </span>
          <span v-if="filterStore.state.searchQuery" class="active-filter-chip">
            Поиск: "{{ filterStore.state.searchQuery }}"
            <button type="button" aria-label="Убрать поиск" @click.stop="filterStore.setFilter('searchQuery', '')">×</button>
          </span>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Уровень</h3>
        <div class="level-grid">
          <button
            class="chip level-chip"
            :class="{ 'chip-primary': filterStore.state.level.includes(0), 'chip-secondary': (filterStore.state.level as any[]).includes('-0') }"
            :aria-pressed="filterStore.state.level.includes(0) || (filterStore.state.level as any[]).includes('-0')"
            @click="filterStore.toggleFilter('level', 0)"
          >
            0
          </button>
          <button
            v-for="l in 10"
            :key="l"
            class="chip level-chip"
            :class="{ 'chip-primary': filterStore.state.level.includes(l), 'chip-secondary': (filterStore.state.level as any[]).includes('-'+l) }"
            :aria-pressed="filterStore.state.level.includes(l) || (filterStore.state.level as any[]).includes('-'+l)"
            @click="filterStore.toggleFilter('level', l)"
          >
            {{ l }}
          </button>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Традиция</h3>
        <div class="flex flex-col gap-2xs">
          <label v-for="t in traditions" :key="t" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="capitalize">{{ traditionLabel(t) }}</span>
            <input
              type="checkbox"
              class="flex-shrink-0"
              :class="{ 'cb-green': (filterStore.state.tradition as string[]).includes(t) }"
              :checked="(filterStore.state.tradition as string[]).includes(t) || (filterStore.state.tradition as string[]).includes('-' + t)"
              @click.prevent="filterStore.toggleFilter('tradition', t)"
            />
          </label>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Школа</h3>
        <div class="flex flex-col gap-2xs max-h-48 overflow-y-auto">
          <label v-for="s in schools" :key="s" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="truncate">{{ schoolLabel(s) }}</span>
            <input
              type="checkbox"
              class="flex-shrink-0"
              :class="{ 'cb-green': (filterStore.state.school as string[]).includes(s) || (filterStore.state.school as string[]).includes('-' + s) }"
              :checked="(filterStore.state.school as string[]).includes(s) || (filterStore.state.school as string[]).includes('-' + s)"
              @click.prevent="filterStore.toggleFilter('school', s)"
            />
          </label>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Класс</h3>
        <div class="flex flex-col gap-2xs max-h-48 overflow-y-auto">
          <label class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="truncate">{{ GENERIC_CLASS_LABEL }}</span>
            <input
              type="checkbox"
              class="flex-shrink-0"
              :class="{ 'cb-green': (filterStore.state.class as string[]).includes(GENERIC_CLASS) || (filterStore.state.class as string[]).includes('-' + GENERIC_CLASS) }"
              :checked="(filterStore.state.class as string[]).includes(GENERIC_CLASS) || (filterStore.state.class as string[]).includes('-' + GENERIC_CLASS)"
              @click.prevent="filterStore.toggleFilter('class', GENERIC_CLASS)"
            />
          </label>
          <label v-for="c in allClasses" :key="c" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="truncate">{{ classLabel(c) }}</span>
            <input
              type="checkbox"
              class="flex-shrink-0"
              :class="{ 'cb-green': (filterStore.state.class as string[]).includes(c) || (filterStore.state.class as string[]).includes('-' + c) }"
              :checked="(filterStore.state.class as string[]).includes(c) || (filterStore.state.class as string[]).includes('-' + c)"
              @click.prevent="filterStore.toggleFilter('class', c)"
            />
          </label>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Дескрипторы</h3>
        <div class="flex flex-col gap-2xs max-h-48 overflow-y-auto">
          <label v-for="t in allTraits" :key="t" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="truncate">{{ traitLabel(t) }}</span>
            <input
              type="checkbox"
              class="flex-shrink-0"
              :class="{ 'cb-green': (filterStore.state.traits as string[]).includes(t) || (filterStore.state.traits as string[]).includes('-' + t) }"
              :checked="(filterStore.state.traits as string[]).includes(t) || (filterStore.state.traits as string[]).includes('-' + t)"
              @click.prevent="filterStore.toggleFilter('traits', t)"
            />
          </label>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Действия</h3>
        <div class="flex flex-wrap gap-xs">
          <button
            v-for="a in [
              { id: '1', label: '1' },
              { id: '2', label: '2' },
              { id: '3', label: '3' },
              { id: 'reaction', label: 'Реакция' },
              { id: 'free', label: 'Свободное' },
              { id: 'time', label: 'Время' }
            ]"
            :key="a.id"
            class="chip"
            :class="{ 'chip-primary': filterStore.state.actions.includes(a.id as any), 'chip-secondary': (filterStore.state.actions as string[]).includes('-'+a.id) }"
            :aria-pressed="filterStore.state.actions.includes(a.id as any) || (filterStore.state.actions as string[]).includes('-'+a.id)"
            @click="filterStore.toggleFilter('actions', a.id as any)"
          >
            {{ a.label }}
          </button>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Компоненты</h3>
        <div class="flex flex-wrap gap-xs justify-end">
          <label v-for="c in ['V', 'S', 'M', 'F']" :key="c" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="truncate">{{ c === 'V' ? 'С' : c === 'S' ? 'Ж' : c === 'M' ? 'М' : c === 'F' ? 'Ф' : c }}</span>
            <input
              type="checkbox"
              class="flex-shrink-0"
              :class="{ 'cb-green': (filterStore.state.components as any[]).includes(c) || (filterStore.state.components as any[]).includes('-' + c) }"
              :checked="(filterStore.state.components as any[]).includes(c) || (filterStore.state.components as any[]).includes('-' + c)"
              @click.prevent="filterStore.toggleFilter('components', c as any)"
            />
          </label>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Источник</h3>
        <div class="flex flex-col gap-2xs max-h-48 overflow-y-auto">
          <label v-for="s in allSources" :key="s" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span>{{ s }}</span>
            <input
              type="checkbox"
              class="flex-shrink-0"
              :class="{ 'cb-green': (filterStore.state.source as string[]).includes(s) || (filterStore.state.source as string[]).includes('-' + s) }"
              :checked="(filterStore.state.source as string[]).includes(s) || (filterStore.state.source as string[]).includes('-' + s)"
              @click.prevent="filterStore.toggleFilter('source', s)"
            />
          </label>
        </div>
      </div>

      <div class="sidebar-section">
        <button class="btn btn-secondary w-full" @click="clearAllFilters">Сбросить</button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Styles in layout.css and components.css */
.max-h-48 { max-height: 12rem; }
.capitalize { text-transform: capitalize; }

/* Уровни 0–10: сетка, чтобы все чипы помещались в ширину сайдбара без горизонтальной прокрутки */
.level-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--spacing-xs);
}
.level-chip {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}
</style>
