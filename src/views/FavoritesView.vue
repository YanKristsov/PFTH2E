<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useFavoritesStore, useSettingsStore, useComparisonStore } from '@/stores'
import SpellCard from '@/components/SpellCard.vue'
import type { SpellIndex } from '@/types/spell'
import { traditionLabel, schoolLabel, rarityLabel } from '@/constants/translations'

const router = useRouter()
const settingsStore = useSettingsStore()
const favoritesStore = useFavoritesStore()
const comparisonStore = useComparisonStore()
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
        notes: fav.notes
      }
    })
    .filter((s): s is FavoriteSpellWithNotes => s !== null)
})

function viewSpell(spellId: string) {
  router.push({ name: 'spell-detail', params: { id: spellId } })
}

function toggleFavorite(spellId: string) {
  favoritesStore.toggle(spellId)
}

function toggleCompare(spellId: string) {
  comparisonStore.toggle(spellId)
}

function updateNotes(spellId: string, notes: string) {
  favoritesStore.updateNotes(spellId, notes)
}

function exportFavorites() {
  const data = favoritesStore.exportFavorites()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'pf2e-favorites.json'
  a.click()
  URL.revokeObjectURL(url)
}

function importFavorites(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    if (favoritesStore.importFavorites(e.target?.result as string)) {
      alert('Избранное импортировано')
    } else {
      alert('Ошибка импорта: неверный формат JSON')
    }
    input.value = ''
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="favorites-view">
    <header class="content-header">
      <h1 class="content-title">Избранное</h1>
      <div class="content-actions">
        <button class="btn btn-secondary" @click="exportFavorites">📥 Экспортировать JSON</button>
        <label class="btn btn-secondary cursor-pointer">
          📥 Импортировать JSON
          <input type="file" accept=".json" hidden @change="importFavorites($event)" />
        </label>
      </div>
    </header>

    <div v-if="favoriteSpells.length === 0" class="empty-state">
      <div class="empty-state-icon" aria-hidden="true">⭐</div>
      <h3>Нет избранных</h3>
      <p>Добавляйте заклинания в избранное, нажимая звёздочку на карточке или в деталях</p>
      <router-link to="/" class="btn btn-primary mt-md">К заклинаниям</router-link>
    </div>

    <div v-else class="spell-grid" :class="settingsStore.state.viewMode">
      <div v-if="settingsStore.state.viewMode === 'cards'" class="flex flex-wrap gap-md">
        <SpellCard
          v-for="spell in favoriteSpells"
          :key="spell.id"
          :spell-index="spell"
          :is-favorite="true"
          :is-in-comparison="false"
          @view="viewSpell"
          @favorite="toggleFavorite"
          @compare="toggleCompare"
        />
      </div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th scope="col" style="width: 40px;"></th>
              <th scope="col">Название</th>
              <th scope="col" style="width: 60px;">Уровень</th>
              <th scope="col" style="width: 120px;">Традиция</th>
              <th scope="col" style="width: 120px;">Школа</th>
              <th scope="col">Заметки</th>
              <th scope="col" style="width: 40px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="spell in favoriteSpells" :key="spell.id" tabindex="0" role="button" @click="viewSpell(spell.id)" @keydown.enter="viewSpell(spell.id)">
              <td>
                <button class="btn btn-ghost btn-sm" aria-label="Убрать из избранного" @click.stop="favoritesStore.remove(spell.id)">✕</button>
              </td>
              <td>
                <div class="font-medium">{{ spell.nameRu }}</div>
                <div v-if="spell.nameEn !== spell.nameRu" class="text-xs text-muted">{{ spell.nameEn }}</div>
              </td>
              <td><span class="chip chip-info">Ур. {{ spell.level }}</span></td>
              <td><span class="text-sm">{{ spell.tradition.map((t: string) => traditionLabel(t)).join(' ') }}</span></td>
              <td>{{ schoolLabel(spell.school) }}</td>
              <td>
                <textarea
                  v-model="spell.notes"
                  class="w-full min-h-[60px] resize-none bg-transparent border-none focus:outline-none text-sm"
                  placeholder="Заметки..."
                  aria-label="Заметки заклинания"
                  @input="updateNotes(spell.id, spell.notes)"
                  @click.stop
                ></textarea>
              </td>
              <td>
                <button class="btn btn-ghost btn-sm" :aria-label="`Добавить ${spell.nameRu} в сравнение`" @click.stop="toggleCompare(spell.id)">⚖️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>