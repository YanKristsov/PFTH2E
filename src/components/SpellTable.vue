<script setup lang="ts">
import { computed } from 'vue'
import type { SpellIndex } from '@/types/spell'
import { useSettingsStore } from '@/stores'

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
  const icons: Record<string, string> = { arcane: '⚡', divine: '⛪', occult: '🔮', primal: '🌿' }
  return traditions.map(t => icons[t] || t[0].toUpperCase()).join(' ')
}

function formatClasses(classes: string[]): string {
  return classes.slice(0, 2).join(', ') + (classes.length > 2 ? ` +${classes.length - 2}` : '')
}

function formatTraits(traits: string[]): string {
  return traits.slice(0, 3).join(', ') + (traits.length > 3 ? ` +${traits.length - 3}` : '')
}
</script>

<template>
  <div class="overflow-x-auto" role="region" aria-label="Spells table" tabindex="0">
    <table class="table" aria-describedby="table-desc">
      <caption id="table-desc" class="sr-only">Spell list with filters for level, tradition, school, class, and traits</caption>
      <thead>
        <tr>
          <th v-if="columns.includes('name')" scope="col" style="width: 30%;">Name</th>
          <th v-if="columns.includes('level')" scope="col" style="width: 60px;">Level</th>
          <th v-if="columns.includes('tradition')" scope="col" style="width: 120px;">Tradition</th>
          <th v-if="columns.includes('school')" scope="col" style="width: 120px;">School</th>
          <th v-if="columns.includes('classes')" scope="col" style="width: 150px;">Classes</th>
          <th v-if="columns.includes('traits')" scope="col" style="width: 200px;">Traits</th>
          <th v-if="columns.includes('rarity')" scope="col" style="width: 100px;">Rarity</th>
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
          :aria-label="`${spell.nameRu}, level ${spell.level}, ${formatTraditions(spell.tradition)}`"
          :aria-selected="props.selected.has(spell.id)"
          @click="handleRowClick(spell, $event)"
          @keydown="handleKeyDown(spell, $event)"
        >
          <td v-if="columns.includes('name')">
            <div class="font-medium">{{ spell.nameRu }}</div>
            <div v-if="spell.nameEn !== spell.nameRu" class="text-xs text-muted truncate">{{ spell.nameEn }}</div>
          </td>
          <td v-if="columns.includes('level')">
            <span class="chip chip-info">Lv. {{ spell.level }}</span>
          </td>
          <td v-if="columns.includes('tradition')">
            <span class="text-sm">{{ formatTraditions(spell.tradition) }}</span>
          </td>
          <td v-if="columns.includes('school')">
            <span class="text-sm">{{ spell.school }}</span>
          </td>
          <td v-if="columns.includes('classes')">
            <span class="text-sm">{{ formatClasses(spell.classes) }}</span>
          </td>
          <td v-if="columns.includes('traits')">
            <span class="text-sm">{{ formatTraits(spell.traits) }}</span>
          </td>
          <td v-if="columns.includes('rarity')">
            <span class="badge" :class="`badge-${spell.rarity}`">{{ spell.rarity }}</span>
          </td>
          <td>
            <input
              type="checkbox"
              :checked="props.selected.has(spell.id)"
              class="w-4 h-4 accent-[var(--color-accent)]"
              :aria-label="`Select ${spell.nameRu}`"
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