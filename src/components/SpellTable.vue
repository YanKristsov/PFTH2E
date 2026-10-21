<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SpellIndex } from '@/types/spell'
import { useSettingsStore } from '@/stores'
import { useSpells } from '@/composables/useSpells'
import { traditionLabel, traitLabel, schoolLabel } from '@/constants/translations'

const props = defineProps<{
  spells: SpellIndex[]
  selected: Set<string>
}>()

const emit = defineEmits<{
  select: [spellId: string]
  view: [spellId: string]
}>()

const settingsStore = useSettingsStore()
const { getSpell } = useSpells()

const columns = computed(() => settingsStore.state.tableColumns)

type SortKey = 'name' | 'traits' | 'level' | 'actions' | 'tradition' | 'source'
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

function getActionOrder(castTime: string): number {
  const v = (castTime || '').toLowerCase()
  if (/reaction/.test(v)) return 4
  if (/free/.test(v)) return 3
  if (/three|3 actions/.test(v)) return 3
  if (/two|2 actions/.test(v)) return 2
  if (/single|1 action/.test(v)) return 1
  if (/minute|min/.test(v)) return 10
  if (/hour/.test(v)) return 11
  if (/day|week/.test(v)) return 12
  return 99
}

function getActionLabel(castTime: string): string {
  const v = (castTime || '').toLowerCase()
  if (/reaction/.test(v)) return 'Реакция'
  if (/free/.test(v)) return 'Свободное'
  if (/three|3 actions/.test(v)) return '3 действия'
  if (/two|2 actions/.test(v)) return '2 действия'
  if (/single|1 action/.test(v)) return '1 действие'
  if (/minute|min/.test(v)) return 'Минуты'
  if (/hour/.test(v)) return 'Часы'
  if (/day|week/.test(v)) return 'Дни'
  return castTime || '—'
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
        av = sa ? getActionOrder(sa.castTime) : 99
        bv = sb ? getActionOrder(sb.castTime) : 99
        break
      }
      case 'tradition':
        av = a.tradition.map(t => traditionLabel(t)).join(',').toLowerCase()
        bv = b.tradition.map(t => traditionLabel(t)).join(',').toLowerCase()
        break
      case 'source': {
        const sa = getSpell(a.id)
        const sb = getSpell(b.id)
        av = sa?.source?.[0]?.source?.name?.toLowerCase() || ''
        bv = sb?.source?.[0]?.source?.name?.toLowerCase() || ''
        break
      }
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

function formatClasses(classes: string[]): string {
  if (classes.length === 0) return '—'
  return classes.slice(0, 2).join(', ') + (classes.length > 2 ? ` +${classes.length - 2}` : '')
}

function formatTraits(traits: string[]): string {
  return traits.slice(0, 3).map(t => traitLabel(t)).join(', ') + (traits.length > 3 ? ` +${traits.length - 3}` : '')
}

function getSpellActionLabel(spellId: string): string {
  const spell = getSpell(spellId)
  if (!spell) return '—'
  return getActionLabel(spell.castTime)
}

function getSpellSource(spellId: string): string {
  const spell = getSpell(spellId)
  if (!spell || !spell.source?.length) return '—'
  return spell.source[0].source.name
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
          <th v-if="columns.includes('traits')" scope="col" style="width: 200px;">Дескрипторы</th>
          <th style="width: 40px;">Выбрать</th>
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
            <span class="text-sm">{{ spell.school === 'Unknown' ? '—' : schoolLabel(spell.school) }}</span>
          </td>
          <td v-if="columns.includes('classes')">
          </td>
          <td v-if="columns.includes('traits')">
            <span class="text-sm">{{ formatTraits(spell.traits) }}</span>
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
