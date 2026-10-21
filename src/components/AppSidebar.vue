<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useFilterStore } from '@/stores'
import type { FilterState } from '@/types/spell'
import { COMPONENT_LABELS, filterLabel, traitLabel, traditionLabel, schoolLabel, classLabel, GENERIC_CLASS, GENERIC_CLASS_LABEL } from '@/constants/translations'

const route = useRoute()
const { schools, allTraits, allSources, traditions, allClasses } = useSpells()
const filterStore = useFilterStore()

const activeNav = computed(() => route.name)

const activeFilters = computed(() => {
  const result: Array<{ key: keyof FilterState; value: FilterState[keyof FilterState] }> = []
  for (const [key, value] of Object.entries(filterStore.state) as Array<[keyof FilterState, FilterState[keyof FilterState]]>) {
    if (Array.isArray(value) && value.length > 0) {
      result.push({ key, value })
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

function filterValueText(filter: { key: keyof FilterState; value: FilterState[keyof FilterState] }): string {
  return (filter.value as unknown[]).map(v => filterValueLabel(filter.key, v)).join(', ')
}
</script>

<template>
  <aside class="sidebar" role="navigation" aria-label="Фильтры и навигация">
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
      <router-link to="/settings" class="sidebar-link mt-sm" :class="{ active: activeNav === 'settings' }">
        <span class="sidebar-link-icon" aria-hidden="true">⚙️</span>
        <span>Настройки</span>
      </router-link>
    </nav>

    <div class="flex-1 overflow-y-auto p-md">
      <div v-if="filterStore.hasActiveFilters()" class="mb-md">
        <div class="flex items-center justify-between mb-sm">
          <span class="sidebar-title">Активные фильтры</span>
          <button class="btn btn-ghost btn-sm" @click="clearAllFilters">Сбросить</button>
        </div>
        <div class="active-filters">
          <span
            v-for="filter in activeFilters"
            :key="filter.key"
            class="active-filter-chip"
          >
            {{ filterLabel(filter.key) }}: {{ filterValueText(filter) }}
            <button aria-label="Убрать фильтр" @click="filterStore.toggleFilter(filter.key, (filter.value as unknown[])[0] as never)">×</button>
          </span>
          <span v-if="filterStore.state.searchQuery" class="active-filter-chip">
            Поиск: "{{ filterStore.state.searchQuery }}"
            <button aria-label="Убрать поиск" @click="filterStore.setFilter('searchQuery', '')">×</button>
          </span>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Уровень</h3>
        <div class="level-grid">
          <button
            class="chip level-chip"
            :class="{ 'chip-primary': filterStore.state.level.includes(0) }"
            :aria-pressed="filterStore.state.level.includes(0)"
            @click="filterStore.toggleFilter('level', 0)"
          >
            0
          </button>
          <button
            v-for="l in 10"
            :key="l"
            class="chip level-chip"
            :class="{ 'chip-primary': filterStore.state.level.includes(l) }"
            :aria-pressed="filterStore.state.level.includes(l)"
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
              :checked="filterStore.state.tradition.includes(t)"
              @change="filterStore.toggleFilter('tradition', t)"
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
              :checked="filterStore.state.school.includes(s)"
              @change="filterStore.toggleFilter('school', s)"
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
              :checked="filterStore.state.class.includes(GENERIC_CLASS)"
              @change="filterStore.toggleFilter('class', GENERIC_CLASS)"
            />
          </label>
          <label v-for="c in allClasses" :key="c" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="truncate">{{ classLabel(c) }}</span>
            <input
              type="checkbox"
              class="flex-shrink-0"
              :checked="filterStore.state.class.includes(c)"
              @change="filterStore.toggleFilter('class', c)"
            />
          </label>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Черты</h3>
        <div class="flex flex-col gap-2xs max-h-48 overflow-y-auto">
          <label v-for="t in allTraits" :key="t" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="truncate">{{ traitLabel(t) }}</span>
            <input
              type="checkbox"
              class="flex-shrink-0"
              :checked="filterStore.state.traits.includes(t)"
              @change="filterStore.toggleFilter('traits', t)"
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
            :class="{ 'chip-primary': filterStore.state.actions.includes(a.id) }"
            :aria-pressed="filterStore.state.actions.includes(a.id)"
            @click="filterStore.toggleFilter('actions', a.id)"
          >
            {{ a.label }}
          </button>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Компоненты</h3>
        <div class="flex flex-wrap gap-xs justify-end">
          <button
            v-for="c in ['V', 'S', 'M', 'F']"
            :key="c"
            class="chip"
            :class="{ 'chip-primary': filterStore.state.components.includes(c) }"
            :aria-pressed="filterStore.state.components.includes(c)"
            :data-tooltip="componentLabel(c)"
            @click="filterStore.toggleFilter('components', c)"
          >
            {{ c === 'V' ? 'С' : c === 'S' ? 'Ж' : c === 'M' ? 'М' : c === 'F' ? 'Ф' : c }}
          </button>
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
              :checked="filterStore.state.source.includes(s)"
              @change="filterStore.toggleFilter('source', s)"
            />
          </label>
        </div>
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
