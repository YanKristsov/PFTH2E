<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SpellIndex } from '@/types/spell'
import { useSettingsStore, useFavoritesStore } from '@/stores'
import { useSpells } from '@/composables/useSpells'
import { traditionLabel, traitLabel, schoolLabel, classLabel, actionOrder, actionDisplay, GENERIC_CLASS_LABEL } from '@/constants/translations'

const props = defineProps<{
  spells: SpellIndex[]
}>()

const emit = defineEmits<{
  view: [spellId: string]
  toggleFavorite: [spellId: string]
}>()

const settingsStore = useSettingsStore()
const favoritesStore = useFavoritesStore()
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

function handleRowClick(spell: SpellIndex, e: MouseEvent) {
  if ((e.target as HTMLElement).closest('button, input, a')) return
  emit('view', spell.id)
}

function handleKeyDown(spell: SpellIndex, e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('view', spell.id)
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

const rows = computed(() =>
  sortedSpells.value.map((spell) => {
    const full = getSpell(spell.id)
    const castTime = full?.castTime ?? ''
    return {
      spell,
      action: actionDisplay(castTime)
    }
  })
)
</script>

<template>
  <div class="overflow-x-auto" role="region" aria-label="Таблица заклинаний" tabindex="0">
    <table class="table" aria-describedby="table-desc">
      <caption id="table-desc" class="sr-only">Список заклинаний с фильтрами по уровню, традиции, школе, классам и чертам</caption>
      <thead>
        <tr>
          <th v-if="columns.includes('name')" scope="col" style="width: 415px;">
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
               Время сотворения<span class="sort-arrow" aria-hidden="true">{{ sortIndicator('actions') }}</span>
            </button>
          </th>
          <th scope="col" style="width: 40px;"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="({ spell, action }) in rows"
          :key="spell.id"
          tabindex="0"
          role="button"
          :aria-label="`${spell.nameRu}, уровень ${spell.level}, ${formatTraditions(spell.tradition)}`"
          @click="handleRowClick(spell, $event)"
          @keydown="handleKeyDown(spell, $event)"
        >
          <td v-if="columns.includes('name')">
            <div class="spell-name-cell font-medium">{{ spell.nameRu }}</div>
            <div v-if="spell.nameEn && spell.nameEn !== spell.nameRu" class="spell-name-cell text-xs text-muted">{{ spell.nameEn }}</div>
            <div v-if="getShortDescription(spell.id)" class="spell-summary text-xs text-muted">{{ getShortDescription(spell.id) }}</div>
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
            <div v-if="spell.classes.length" class="traits-cell">
              <span v-for="c in spell.classes" :key="c" class="trait-chip">{{ classLabel(c) }}</span>
            </div>
            <span v-else class="text-sm text-muted">{{ GENERIC_CLASS_LABEL }}</span>
          </td>
          <td v-if="columns.includes('traits')">
            <div v-if="formatTraits(spell.traits).length" class="traits-cell">
              <span v-for="(trait, i) in formatTraits(spell.traits)" :key="i" class="trait-chip">{{ trait }}</span>
            </div>
            <span v-else class="text-sm">—</span>
          </td>
          <td v-if="columns.includes('actions')" class="actions-cell">
            <div class="action-cell">
              <template v-for="(seg, i) in action.segments" :key="i">
                <img
                  v-if="seg.kind === 'icon' && seg.icon"
                  class="action-icon"
                  :src="seg.icon.src"
                  :alt="seg.icon.alt"
                  :title="seg.icon.alt"
                  :width="seg.icon.width"
                  :height="seg.icon.height"
                  loading="lazy"
                  decoding="async"
                />
                <span v-else-if="seg.kind === 'sep'" class="action-sep" aria-hidden="true">{{ seg.text }}</span>
                <span v-else class="text-sm">{{ seg.text }}</span>
              </template>
            </div>
          </td>
          <td style="text-align: center; vertical-align: middle;">
            <button
              class="btn btn-ghost btn-sm favorite-toggle-btn"
              type="button"
              :aria-label="favoritesStore.favoriteIds.has(spell.id) ? 'Убрать из избранного' : 'Добавить в избранное'"
              @click.stop="emit('toggleFavorite', spell.id)"
            >
              <span aria-hidden="true">{{ favoritesStore.favoriteIds.has(spell.id) ? '★' : '☆' }}</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Uses global table classes */
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
.level-cell { vertical-align: middle; }
.action-cell { display: flex; align-items: center; justify-content: center; gap: 6px; }
.action-sep { color: var(--color-text-secondary); font-size: 0.85rem; }
.action-icon {
  height: 24px;
  width: auto;
  max-width: 44px;
  object-fit: contain;
  flex: 0 0 auto;
  filter: var(--icon-filter);
}
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
.spell-name-cell { text-align: justify; hyphens: auto; -webkit-hyphens: auto; -ms-hyphens: auto; word-break: break-word; }

/* Звёздочка «Избранное» в таблице — по высоте иконок действий (24px) */
.favorite-toggle-btn {
  font-size: 1.5rem;
  line-height: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
