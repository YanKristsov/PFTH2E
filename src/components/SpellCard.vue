<script setup lang="ts">
import { computed } from 'vue'
import type { SpellIndex } from '@/types/spell'
import { rarityLabel, schoolLabel, traditionLabel, traitLabel, classLabel, GENERIC_CLASS_LABEL, actionDisplay } from '@/constants/translations'
import { useSpells } from '@/composables/useSpells'

const { spellIndex, isFavorite } = defineProps<{
  spellIndex: SpellIndex
  isFavorite: boolean
}>()

const { getSpell } = useSpells()

const action = computed(() => {
  const spell = getSpell(spellIndex.id)
  return spell ? actionDisplay(spell.castTime) : null
})

const description = computed(() => {
  const spell = getSpell(spellIndex.id)
  if (!spell) return ''
  return (spell.description.ru || spell.description.en || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
})

defineEmits<{
  view: [spellId: string]
  favorite: [spellId: string]
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
      <div class="flex flex-col items-end gap-sm flex-shrink-0">
        <div class="flex items-center gap-sm">
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
            <span class="favorite-star" aria-hidden="true">{{ isFavorite ? '⭐' : '☆' }}</span>
          </button>
        </div>
        <div v-if="action" class="flex flex-wrap justify-end gap-xs">
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
            <span v-else class="chip">{{ seg.text }}</span>
          </template>
        </div>
      </div>
    </div>

    <div class="card-body">
      <p v-if="description" class="text-sm text-secondary card-summary card-description mb-sm">{{ description }}</p>
      <div class="flex flex-wrap gap-xs mb-sm">
        <span class="chip chip-info" :data-tooltip="`Уровень ${spellIndex.level}`">Ур. {{ spellIndex.level }}</span>
      </div>
      <div class="flex flex-wrap gap-xs mb-sm">
        <span v-for="t in spellIndex.tradition" :key="t" class="chip" :data-tooltip="traditionLabel(t)">{{ traditionLabel(t) }}</span>
      </div>
      <div class="flex flex-wrap gap-xs mb-sm">
        <span class="chip">{{ schoolLabel(spellIndex.school) }}</span>
      </div>
      <div v-if="getSpell(spellIndex.id)?.isFocus" class="flex flex-wrap gap-xs mb-sm">
        <span class="chip chip-info">Фокус</span>
      </div>

      <div class="flex flex-wrap gap-xs mb-sm">
        <span v-for="c in spellIndex.classes" :key="c" class="chip">{{ classLabel(c) }}</span>
        <span v-if="spellIndex.classes.length === 0" class="chip chip-info">{{ GENERIC_CLASS_LABEL }}</span>
      </div>

      <div class="flex flex-wrap gap-xs">
        <span v-for="t in spellIndex.traits" :key="t" class="chip">{{ traitLabel(t) }}</span>
      </div>
    </div>

  </article>
</template>

<style scoped>
/* Uses global card, chip, badge classes */
.card-summary { margin-top: 4px; line-height: 1.4; }
.card-description { text-align: justify; width: 100%; }
.favorite-star { font-size: 1.25rem; line-height: 1; }
.action-icon { height: 177px; width: auto; max-width: 320px; object-fit: contain; filter: var(--icon-filter); }
:deep(.card-body) { padding-bottom: var(--spacing-md); }
</style>
