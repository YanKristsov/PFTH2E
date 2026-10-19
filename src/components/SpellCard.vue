<script setup lang="ts">
import type { SpellIndex } from '@/types/spell'
import { rarityLabel, schoolLabel, traditionLabel, traitLabel } from '@/constants/translations'

const { spellIndex, isFavorite, isInComparison } = defineProps<{
  spellIndex: SpellIndex
  isFavorite: boolean
  isInComparison: boolean
}>()

defineEmits<{
  view: [spellId: string]
  favorite: [spellId: string]
  compare: [spellId: string]
}>()

const rarityColors: Record<string, string> = {
  common: 'var(--color-text-secondary)',
  uncommon: 'var(--color-info)',
  rare: '#9b59b6',
  unique: 'var(--color-warning)'
}
</script>

<template>
  <article class="card" tabindex="0" role="button" :aria-label="`Посмотреть ${spellIndex.nameRu}`" @click="$emit('view', spellIndex.id)" @keydown.enter="$emit('view', spellIndex.id)">
    <div class="card-header flex items-start justify-between gap-md">
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-lg truncate">{{ spellIndex.nameRu }}</h3>
        <p v-if="spellIndex.nameEn !== spellIndex.nameRu" class="text-sm text-muted truncate">{{ spellIndex.nameEn }}</p>
      </div>
      <div class="flex items-center gap-sm flex-shrink-0">
        <span
          class="badge"
          :class="`badge-${spellIndex.rarity}`"
          :style="{ color: rarityColors[spellIndex.rarity], backgroundColor: `color-mix(in srgb, ${rarityColors[spellIndex.rarity]} 20%, var(--color-surface))` }"
        >
          {{ rarityLabel(spellIndex.rarity) }}
        </span>
        <button
          class="btn btn-ghost btn-sm"
          :aria-label="isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'"
          :aria-pressed="isFavorite"
          @click.stop="$emit('favorite', spellIndex.id)"
        >
          <span aria-hidden="true">{{ isFavorite ? '⭐' : '☆' }}</span>
        </button>
        <button
          class="btn btn-ghost btn-sm"
          :aria-label="isInComparison ? 'Убрать из сравнения' : 'Добавить к сравнению'"
          :aria-pressed="isInComparison"
          @click.stop="$emit('compare', spellIndex.id)"
        >
          <span aria-hidden="true">⚖️</span>
        </button>
      </div>
    </div>

    <div class="card-body">
      <div class="flex flex-wrap gap-xs mb-sm">
        <span class="chip chip-info" :data-tooltip="`Уровень ${spellIndex.level}`">Ур. {{ spellIndex.level }}</span>
        <span v-for="t in spellIndex.tradition" :key="t" class="chip" :data-tooltip="traditionLabel(t)">{{ traditionLabel(t) }}</span>
      </div>

      <p class="text-sm text-secondary mb-sm">{{ schoolLabel(spellIndex.school) }}</p>

      <div class="flex flex-wrap gap-xs mb-sm">
        <span v-for="c in spellIndex.classes.slice(0, 3)" :key="c" class="chip">{{ c }}</span>
        <span v-if="spellIndex.classes.length > 3" class="chip chip-info">+{{ spellIndex.classes.length - 3 }}</span>
        <span v-if="spellIndex.classes.length === 0" class="chip chip-info">—</span>
      </div>

      <div class="flex flex-wrap gap-xs">
        <span v-for="t in spellIndex.traits.slice(0, 4)" :key="t" class="chip">{{ traitLabel(t) }}</span>
        <span v-if="spellIndex.traits.length > 4" class="chip chip-info">+{{ spellIndex.traits.length - 4 }}</span>
      </div>
    </div>

    <div class="card-footer flex items-center justify-between">
      <span class="text-xs text-muted">Посмотреть детали</span>
      <kbd class="text-xs text-muted px-sm py-xs rounded bg-[var(--color-background)]">Ввод</kbd>
    </div>
  </article>
</template>

<style scoped>
/* Uses global card, chip, badge classes */
</style>
