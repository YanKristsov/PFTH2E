<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useHistoryStore } from '@/stores'
import type { SpellIndex } from '@/types/spell'
import { traditionLabel, schoolLabel, rarityLabel } from '@/constants/translations'

const router = useRouter()
const historyStore = useHistoryStore()
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

function viewSpell(spellId: string) {
  router.push({ name: 'spell-detail', params: { id: spellId } })
}

function clearHistory() {
  if (confirm('Очистить всю историю просмотров?')) {
    historyStore.clear()
  }
}
</script>

<template>
  <div class="history-view">
    <header class="content-header">
      <h1 class="content-title">История просмотров</h1>
      <div class="content-actions">
        <button class="btn btn-danger" :disabled="historySpells.length === 0" @click="clearHistory">🗑️ Очистить историю</button>
      </div>
    </header>

    <div v-if="historySpells.length === 0" class="empty-state">
      <div class="empty-state-icon" aria-hidden="true">🕐</div>
      <h3>История пуста</h3>
      <p>Просматривайте заклинания, и они появятся здесь</p>
      <router-link to="/" class="btn btn-primary mt-md">К заклинаниям</router-link>
    </div>

    <div v-else class="spell-grid cards">
      <article
        v-for="spell in historySpells"
        :key="spell.id"
        class="card"
        tabindex="0"
        role="button"
        @click="viewSpell(spell.id)"
        @keydown.enter="viewSpell(spell.id)"
      >
        <div class="card-header flex items-start justify-between gap-md">
          <div>
            <h3 class="font-semibold truncate">{{ spell.nameRu }}</h3>
            <p v-if="spell.nameEn !== spell.nameRu" class="text-xs text-muted truncate">{{ spell.nameEn }}</p>
          </div>
          <span class="badge" :class="`badge-${spell.rarity}`">{{ rarityLabel(spell.rarity) }}</span>
        </div>
        <div class="card-body">
          <div class="flex flex-wrap gap-xs mb-sm">
            <span class="chip chip-info">Ур. {{ spell.level }}</span>
            <span v-for="t in spell.tradition" :key="t" class="chip">{{ traditionLabel(t) }}</span>
          </div>
          <p class="text-sm text-secondary">{{ schoolLabel(spell.school) }}</p>
        </div>
      </article>
    </div>
  </div>
</template>