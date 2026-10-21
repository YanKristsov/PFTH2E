<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SpellIndex } from '@/types/spell'
import { useSettingsStore } from '@/stores'
import { useSpells } from '@/composables/useSpells'
import { traditionLabel, traitLabel, schoolLabel, actionLabel, actionOrder } from '@/constants/translations'

const props = defineProps<{
  spells: SpellIndex[]
  selected: Set<string>
}>()

const emit = defineEmits<{
  select: [spellId: string]
  view: [spellId: string]
}>()

const settingsStore = useSettingsStore()
const { getSpell, getShortDescription } = useSpells()

const columns = computed(() => settingsStore.state.tableColumns)

type SortKey = 'name' | 'traits' | 'level' | 'actions' | 'tradition'
const sortKey = ref<SortKey | null>(null)
const sortAsc = ref(true)

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

function sortIndicator(key: SortKey): string {
  if (sortKey.value !== key) return ''
  return sortAsc.value ? ' ↓' : ' ↑'
}

const sortedSpells = computed(() => {
  if (!sortKey.value) return props.spells
  const list = [...props.spells]
  list.sort((a, b) => {
    let av: string | number
    let bv: string | number
    switch (sortKey.value) {
      case 'name':
        av = a.nameRu.toLowerCase()
        bv = b.nameRu.toLowerCase()
        break
      case 'traits':
        av = a.traits.map(t => traitLabel(t)).join(',').toLowerCase()
        bv = b.traits.map(t => traitLabel(t)).join(',').toLowerCase()
        break
      case 'level':
        av = a.level
        bv = b.level
        break
      case 'actions': {
        const sa = getSpell(a.id)
        const sb = getSpell(b.id)
        av = sa ? actionOrder(sa.castTime) : 99
        bv = sb ? actionOrder(sb.castTime) : 99
        break
      }
      case 'tradition':
        av = a.tradition.map(t => traditionLabel(t)).join(',').toLowerCase()
        bv = b.tradition.map(t => traditionLabel(t)).join(',').toLowerCase()
        break
      default:
        return 0
    }
    if (av < bv) return sortAsc.value ? -1 : 1
    if (av > bv) return sortAsc.value ? 1 : -1
    return 0
  })
  return list
})

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

function formatTraits(traits: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const trait of traits) {
    const label = traitLabel(trait)
    if (!label || seen.has(label)) continue
    seen.add(label)
    result.push(label)
  }
  return result
}

function getSpellActionLabel(spellId: string): string {
  const spell = getSpell(spellId)
  if (!spell) return '—'
  return actionLabel(spell.castTime)
}
</script>

<template>
  <div class="overflow-x-auto" role="region" aria-label="Таблица заклинаний" tabindex="0">
    <table class="table" aria-describedby="table-desc">
      <caption id="table-desc" class="sr-only">Список заклинаний с фильтрами по уровню, традиции, школе, классам и чертам</caption>
      <thead>
        <tr>
          <th v-if="columns.includes('name')" scope="col" style="width: 30%;">
            <button type="button" class="th-sort" :aria-label="`Сортировать по названию`" @click="toggleSort('name')">
              Название<span class="sort-arrow" aria-hidden="true">{{ sortIndicator('name') }}</span>
            </button>
          </th>
          <th v-if="columns.includes('level')" scope="col" style="width: 60px;">
            <button type="button" class="th-sort" :aria-label="`Сортировать по уровню`" @click="toggleSort('level')">
              Уровень<span class="sort-arrow" aria-hidden="true">{{ sortIndicator('level') }}</span>
            </button>
          </th>
          <th v-if="columns.includes('tradition')" scope="col" style="width: 120px;">
            <button type="button" class="th-sort" :aria-label="`Сортировать по традиции`" @click="toggleSort('tradition')">
              Традиция<span class="sort-arrow" aria-hidden="true">{{ sortIndicator('tradition') }}</span>
            </button>
          </th>
          <th v-if="columns.includes('school')" scope="col" style="width: 120px;">Школа</th>
          <th v-if="columns.includes('classes')" scope="col" style="width: 150px;">Классы</th>
          <th v-if="columns.includes('traits')" scope="col" style="width: 200px;">
            <button type="button" class="th-sort" :aria-label="`Сортировать по дескрипторам`" @click="toggleSort('traits')">
              Дескрипторы<span class="sort-arrow" aria-hidden="true">{{ sortIndicator('traits') }}</span>
            </button>
          </th>
          <th v-if="columns.includes('actions')" scope="col" style="width: 120px;">
            <button type="button" class="th-sort" :aria-label="`Сортировать по действиям`" @click="toggleSort('actions')">
              Действия<span class="sort-arrow" aria-hidden="true">{{ sortIndicator('actions') }}</span>
            </button>
          </th>
          <th class="select-cell" scope="col" style="width: 40px;">Выбрать</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="spell in sortedSpells"
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
            <p v-if="getShortDescription(spell.id)" class="spell-summary text-xs text-secondary">{{ getShortDescription(spell.id) }}</p>
          </td>
          <td v-if="columns.includes('level')" class="level-cell">
            <span class="chip chip-info">Ур. {{ spell.level }}</span>
          </td>
          <td v-if="columns.includes('tradition')">
            <span class="text-sm">{{ formatTraditions(spell.tradition) }}</span>
          </td>
          <td v-if="columns.includes('school')">
            <span class="text-sm">{{ spell.school === 'Unknown' ? '—' : schoolLabel(spell.school) }}</span>
          </td>
          <td v-if="columns.includes('classes')">
          </td>
          <td v-if="columns.includes('traits')">
            <div v-if="formatTraits(spell.traits).length" class="traits-cell">
              <span v-for="(trait, i) in formatTraits(spell.traits)" :key="i" class="trait-chip">{{ trait }}</span>
            </div>
            <span v-else class="text-sm">—</span>
          </td>
          <td v-if="columns.includes('actions')">
            <span class="text-sm">{{ getSpellActionLabel(spell.id) }}</span>
          </td>
          <td class="select-cell">
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
.traits-cell { display: flex; flex-wrap: wrap; gap: 4px; align-items: flex-start; }
.trait-chip {
  display: inline-block;
  font-size: 0.75rem;
  line-height: 1.35;
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow-wrap: anywhere;
}
.select-cell { text-align: center; }
.select-cell input[type='checkbox'] { display: inline-block; vertical-align: middle; }
.level-cell { vertical-align: middle; }
.spell-summary { margin-top: 4px; line-height: 1.4; }
.th-sort {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  cursor: pointer;
}
.th-sort:hover { color: var(--color-text); }
.sort-arrow { font-size: 0.85em; }
:deep(.table td) { vertical-align: top; }
:deep(.table td.select-cell),
:deep(.table td.level-cell) { vertical-align: middle; }
</style>
