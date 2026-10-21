<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useHistoryStore, useComparisonStore } from '@/stores'
import SpellTable from '@/components/SpellTable.vue'
import type { SpellIndex } from '@/types/spell'

const router = useRouter()
const historyStore = useHistoryStore()
const comparisonStore = useComparisonStore()
const { getSpell } = useSpells()

const historySpells = computed<SpellIndex[]>(() => {
  const result: SpellIndex[] = []
  for (const h of historyStore.items) {
    const spell = getSpell(h.spellId)
    if (spell) {
      result.push({
        id: spell.id,
        nameRu: spell.name.ru,
        nameEn: spell.name.en,
        level: spell.level,
        tradition: spell.tradition,
        school: spell.school,
        classes: spell.classes,
        traits: spell.traits,
        rarity: spell.rarity
      })
    }
  }
  return result
})

const selectedSpells = ref<Set<string>>(new Set())

function viewSpell(spellId: string) {
  router.push({ name: 'spell-detail', params: { id: spellId } })
}

function toggleSelect(spellId: string) {
  if (selectedSpells.value.has(spellId)) {
    selectedSpells.value.delete(spellId)
  } else {
    selectedSpells.value.add(spellId)
  }
}

function addToComparison() {
  if (selectedSpells.value.size > 3) return
  selectedSpells.value.forEach(id => comparisonStore.add(id))
  router.push({ name: 'compare' })
}

function clearSelection() {
  selectedSpells.value.clear()
}

function clearHistory() {
  if (confirm('Очистить всю историю просмотров?')) {
    historyStore.clear()
    selectedSpells.value.clear()
  }
}
</script>

<template>
  <div class="history-view">
    <header class="content-header">
      <h1 class="content-title">История просмотров</h1>
      <div class="content-actions">
        <button class="btn btn-danger" :disabled="historySpells.length === 0" @click="clearHistory">Очистить историю</button>
      </div>
    </header>

    <div v-if="historySpells.length === 0" class="empty-state">
      <div class="empty-state-icon" aria-hidden="true">🕐</div>
      <h3>История пуста</h3>
      <p>Просматривайте заклинания, и они появятся здесь</p>
      <router-link to="/" class="btn btn-primary mt-md">К заклинаниям</router-link>
    </div>

    <template v-else>
      <SpellTable
        :spells="historySpells"
        :selected="selectedSpells"
        @select="toggleSelect"
        @view="viewSpell"
      />
    </template>

    <div v-if="selectedSpells.size > 0" class="fixed bottom-4 right-4 z-30 flex flex-col gap-sm">
      <button class="btn btn-primary shadow-lg" @click="addToComparison">
        <span v-if="selectedSpells.size <= 3">Добавить к сравнению ({{ selectedSpells.size }}/3)</span>
        <span v-else class="text-error">Максимум 3 заклинания</span>
      </button>
      <button class="btn btn-secondary shadow-lg" @click="clearSelection">Очистить выбор</button>
    </div>
  </div>
</template>