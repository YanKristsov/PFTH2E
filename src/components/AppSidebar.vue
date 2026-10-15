<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useFilterStore } from '@/stores'
import type { FilterState } from '@/types/spell'

const route = useRoute()
const { schools, allTraits, allSources, traditions } = useSpells()
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
</script>

<template>
  <aside class="sidebar" role="navigation" aria-label="Filters and navigation">
    <nav class="sidebar-nav p-md border-b border-[var(--color-border)]" aria-label="Main navigation">
      <router-link
        v-for="item in [
          { name: 'home', label: 'Все заклинания', icon: '📜' },
          { name: 'favorites', label: 'Избранное', icon: '⭐' },
          { name: 'history', label: 'История', icon: '🕐' },
          { name: 'compare', label: 'Сравнение', icon: '⚖️' }
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
            {{ filter.key }}: {{ (filter.value as unknown[]).join(', ') }}
            <button aria-label="Remove filter" @click="filterStore.toggleFilter(filter.key, (filter.value as unknown[])[0] as never)">×</button>
          </span>
          <span v-if="filterStore.state.searchQuery" class="active-filter-chip">
            Поиск: "{{ filterStore.state.searchQuery }}"
            <button aria-label="Remove search" @click="filterStore.setFilter('searchQuery', '')">×</button>
          </span>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Уровень</h3>
        <div class="overflow-x-auto -mx-md px-md">
          <div class="flex flex-nowrap gap-xs min-w-full pb-xs">
            <button
              v-for="l in 10"
              :key="l"
              class="chip flex-shrink-0"
              :class="{ 'chip-primary': filterStore.state.level.includes(l) }"
              :aria-pressed="filterStore.state.level.includes(l)"
              @click="filterStore.toggleFilter('level', l)"
            >
              {{ l }}
            </button>
            <button
              class="chip flex-shrink-0"
              :class="{ 'chip-primary': filterStore.state.level.includes(0) }"
              :aria-pressed="filterStore.state.level.includes(0)"
              @click="filterStore.toggleFilter('level', 0)"
            >
              0
            </button>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Традиция</h3>
        <div class="flex flex-col gap-2xs">
          <label v-for="t in traditions" :key="t" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="capitalize">{{ t }}</span>
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
            <span class="truncate">{{ s }}</span>
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
        <div class="text-sm text-muted italic">
          Недоступно — источник pf2.ru не предоставляет информацию о классах
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Черты</h3>
        <div class="flex flex-col gap-2xs max-h-48 overflow-y-auto">
          <label v-for="t in allTraits" :key="t" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="truncate">{{ t }}</span>
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
        <h3 class="sidebar-title">Компоненты</h3>
        <div class="flex flex-wrap gap-xs justify-end">
          <button
            v-for="c in ['V', 'S', 'M', 'F']"
            :key="c"
            class="chip"
            :class="{ 'chip-primary': filterStore.state.components.includes(c) }"
            :aria-pressed="filterStore.state.components.includes(c)"
            :data-tooltip="{ V: 'Verbal', S: 'Somatic', M: 'Material', F: 'Focus' }[c]"
            @click="filterStore.toggleFilter('components', c)"
          >
            {{ c }}
          </button>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Редкость</h3>
        <div class="flex flex-col gap-2xs">
          <label v-for="r in ['common', 'uncommon', 'rare', 'unique']" :key="r" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="capitalize">{{ r }}</span>
            <input
              type="checkbox"
              class="flex-shrink-0"
              :checked="filterStore.state.rarity.includes(r)"
              @change="filterStore.toggleFilter('rarity', r)"
            />
          </label>
        </div>
      </div>

      <div class="sidebar-section">
        <h3 class="sidebar-title">Источник</h3>
        <div class="flex flex-col gap-2xs max-h-48 overflow-y-auto">
          <label v-for="s in allSources" :key="s" class="flex items-center justify-between gap-sm cursor-pointer py-2xs">
            <span class="truncate">{{ s }}</span>
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
</style>