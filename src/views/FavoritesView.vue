<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useFavoritesStore } from '@/stores'
import SpellCard from '@/components/SpellCard.vue'
import type { SpellIndex } from '@/types/spell'

const router = useRouter()
const favoritesStore = useFavoritesStore()
const { getSpell } = useSpells()

interface FavoriteSpellWithNotes extends SpellIndex {
  notes: string
}

const favoriteSpells = computed<FavoriteSpellWithNotes[]>(() => {
  return favoritesStore.items
    .map(fav => {
      const spell = getSpell(fav.spellId)
      if (!spell) return null
      return {
        id: spell.id,
        nameRu: spell.name.ru,
        nameEn: spell.name.en,
        level: spell.level,
        tradition: spell.tradition,
        school: spell.school,
        classes: spell.classes,
        traits: spell.traits,
        rarity: spell.rarity,
        components: spell.components,
        description: spell.description,
        notes: fav.notes
      } as FavoriteSpellWithNotes
    })
    .filter((s): s is FavoriteSpellWithNotes => s !== null)
})

function viewSpell(spellId: string) {
  router.push({ name: 'spell-detail', params: { id: spellId } })
}

function toggleFavorite(spellId: string) {
  favoritesStore.toggle(spellId)
}
</script>

<template>
  <div class="favorites-view">
    <header class="content-header">
      <h1 class="content-title">Избранное</h1>
    </header>

    <div v-if="favoriteSpells.length === 0" class="empty-state">
      <div class="empty-state-icon" aria-hidden="true">⭐</div>
      <h3>Нет избранных</h3>
      <p>Добавляйте заклинания в избранное, нажимая звёздочку на карточке или в деталях</p>
      <router-link to="/" class="btn btn-primary mt-md">К заклинаниям</router-link>
    </div>

    <div v-else class="spell-grid cards">
      <SpellCard
        v-for="spell in favoriteSpells"
        :key="spell.id"
        :spell-index="spell"
        :is-favorite="true"
        @view="viewSpell"
        @favorite="toggleFavorite"
      />
    </div>
  </div>
</template>
