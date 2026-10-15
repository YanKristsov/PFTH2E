<script setup lang="ts">
import { computed } from 'vue'
import type { SpellIndex } from '@/types/spell'
import { useSettingsStore } from '@/stores'
import { traditionLabel, schoolLabel, rarityLabel, traitLabel } from '@/constants/translations'

const props = defineProps<{
  spells: SpellIndex[]
  selected: Set<string>
}>()

const emit = defineEmits<{
  select: [spellId: string]
  view: [spellId: string]
}>()

const settingsStore = useSettingsStore()

const columns = computed(() => settingsStore.state.tableColumns)

function rowClass(spell: SpellIndex) {
  return { selected: props.selected.has(spell.id) }
}

function handleRowClick(spell: SpellIndex, e: MouseEvent) {
    if ((e.target as HTMLElement).closest('button, input, a')) return
    if (e.metaKey || e.ctrlKey) {
      emit('select', spell.id)
    } else {
      emit('view', spell.id)
    }
  }

function handleKeyDown(spell: SpellIndex, e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (e.shiftKey) emit('select', spell.id)
    else emit('view', spell.id)
  }
}

function formatTraditions(traditions: string[]): string {
  return traditions.map(t => traditionLabel(t)).join(', ')
}

function formatClasses(classes: string[]): string {
  return classes.slice(0, 2).join(', ') + (classes.length > 2 ? ` +${classes.length - 2}` : '')
}

function formatTraits(traits: string[]): string {
  return traits.slice(0, 3).map(t => traitLabel(t)).join(', ') + (traits.length > 3 ? ` +${traits.length - 3}` : '')
}
</script>

<template>
  <div class="overflow-x-auto" role="region" aria-label="Таблица заклинаний" tabindex="0">
    <table class="table" aria-describedby="table-desc">
      <caption id="table-desc" class="sr-only">Список заклинаний с фильтрами по уровню, традиции, школе, классам и чертам</caption>
      <thead>
        <tr>
          <th v-if="columns.includes('name')" scope="col" style="width: 30%;">Название</th>
          <th v-if="columns.includes('level')" scope="col" style="width: 60px;">Уровень</th>
          <th v-if="columns.includes('tradition')" scope="col" style="width: 120px;">Традиция</th>
          <th v-if="columns.includes('school')" scope="col" style="width: 120px;">Школа</th>
          <th v-if="columns.includes('classes')" scope="col" style="width: 150px;">Классы</th>
          <th v-if="columns.includes('traits')" scope="col" style="width: 200px;">Черты</th>
          <th v-if="columns.includes('rarity')" scope="col" style="width: 100px;">Редкость</th>
          <th style="width: 40px;"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="spell in spells"
          :key="spell.id"
          :class="rowClass(spell)"
          tabindex="0"
          role="button"
          :aria-label="`${spell.nameRu}, уровень ${spell.level}, ${formatTraditions(spell.tradition)}`"
          :aria-selected="props.selected.has(spell.id)"
          @click="handleRowClick(spell, $event)"
          @keydown="handleKeyDown(spell, $event)"
        >
          <td v-if="columns.includes('name')">
            <div class="font-medium">{{ spell.nameRu }}</div>
            <div v-if="spell.nameEn !== spell.nameRu" class="text-xs text-muted truncate">{{ spell.nameEn }}</div>
          </td>
          <td v-if="columns.includes('level')">
            <span class="chip chip-info">Ур. {{ spell.level }}</span>
          </td>
          <td v-if="columns.includes('tradition')">
            <span class="text-sm">{{ formatTraditions(spell.tradition) }}</span>
          </td>
          <td v-if="columns.includes('school')">
            <span class="text-sm">{{ schoolLabel(spell.school) }}</span>
          </td>
          <td v-if="columns.includes('classes') && spell.classes.length > 0">
            <span class="text-sm">{{ formatClasses(spell.classes) }}</span>
          </td>
          <td v-if="columns.includes('traits')">
            <span class="text-sm">{{ formatTraits(spell.traits) }}</span>
          </td>
          <td v-if="columns.includes('rarity')">
            <span class="badge" :class="`badge-${spell.rarity}`">{{ rarityLabel(spell.rarity) }}</span>
          </td>
          <td>
            <input
              type="checkbox"
              :checked="props.selected.has(spell.id)"
              class="w-4 h-4 accent-[var(--color-accent)]"
              :aria-label="`Выбрать ${spell.nameRu}`"
              @click.stop="emit('select', spell.id)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Uses global table classes */
.selected { background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface)) !important; }
</style>
