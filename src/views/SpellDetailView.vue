<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useFavoritesStore, useHistoryStore, useComparisonStore, useSettingsStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const favoritesStore = useFavoritesStore()
const historyStore = useHistoryStore()
const comparisonStore = useComparisonStore()
const { getSpell, loadError } = useSpells()

const spellId = computed(() => route.params.id as string)
const spell = computed(() => getSpell(spellId.value))

const activeTab = ref<'brief' | 'full'>('brief')
const activeDescription = computed(() => {
  const currentSpell = spell.value
  const language = settingsStore.state.language
  if (!currentSpell) {
    return { text: '', language, source: '', isHtml: false }
  }
  const translated = currentSpell?.description[language] || ''
  if (translated) {
    return {
      text: translated,
      language,
      source: '',
      isHtml: currentSpell.source.some(variant =>
        variant.source.type === 'aonprd' && variant.description === translated
      )
    }
  }

  const official = currentSpell?.source.find(variant =>
    variant.source.type === 'aonprd' && variant.description
  )
  return {
    text: official?.description || '',
    language: 'en' as const,
    source: official?.source.name || '',
    isHtml: Boolean(official)
  }
})

const traditionLabels: Record<string, string> = {
  arcane: '⚡ Arcane',
  divine: '⛪ Divine',
  occult: '🔮 Occult',
  primal: '🌿 Primal'
}

onMounted(() => {
  if (!spell.value) {
    router.push({ name: 'home' })
    return
  }
  historyStore.add(spellId.value)
})

watch(spellId, (newId) => {
  if (!getSpell(newId)) {
    router.push({ name: 'home' })
  }
  activeTab.value = 'brief'
})

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDescription(text: string, mode: 'brief' | 'full', isHtml = false): string {
  if (mode === 'brief') {
    const plainText = isHtml ? text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : text
    const sentences = plainText.split(/(?<=[.!?])\s+/)
    const summary = sentences.slice(0, 3).join(' ') + (sentences.length > 3 ? '...' : '')
    return `<p>${escapeHtml(summary)}</p>`
  }
  if (isHtml) return text
  return `<p>${escapeHtml(text).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`
}

function exportSpell() {
  if (!spell.value) return
  const data = JSON.stringify(spell.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${spell.value.id}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div v-if="spell" class="spell-detail-view">
    <nav class="mb-md flex items-center gap-sm text-sm text-secondary" aria-label="Breadcrumb">
      <router-link to="/">Home</router-link>
      <span aria-hidden="true">/</span>
      <span>{{ spell.name.ru }}</span>
    </nav>

    <header class="card mb-md">
      <div class="card-header flex flex-wrap items-start justify-between gap-md">
        <div>
          <h1 class="text-2xl font-bold mb-xs">{{ spell.name.ru }}</h1>
          <p v-if="spell.name.en !== spell.name.ru" class="text-lg text-secondary">{{ spell.name.en }}</p>
          <div class="flex flex-wrap items-center gap-sm mt-sm">
            <span class="chip chip-info">Lv. {{ spell.level }}</span>
            <span v-for="t in spell.tradition" :key="t" class="chip" :data-tooltip="traditionLabels[t]">{{ t[0].toUpperCase() }}</span>
            <span class="badge" :class="`badge-${spell.rarity}`">{{ spell.rarity }}</span>
<span v-if="spell.isRitual" class="chip chip-warning">Ritual</span>
          <span v-if="spell.isFocus" class="chip chip-info">Focus</span>
          </div>
        </div>
        <div class="flex items-center gap-sm flex-shrink-0">
          <button class="btn btn-ghost" :aria-pressed="favoritesStore.favoriteIds.has(spell.id)" :aria-label="favoritesStore.favoriteIds.has(spell.id) ? 'Remove from favorites' : 'Add to favorites'" @click="favoritesStore.toggle(spell.id)">
            <span aria-hidden="true">{{ favoritesStore.favoriteIds.has(spell.id) ? '⭐' : '☆' }}</span>
            <span class="hidden mobile:hidden">{{ favoritesStore.favoriteIds.has(spell.id) ? 'In favorites' : 'Add to favorites' }}</span>
          </button>
          <button class="btn btn-ghost" :aria-pressed="comparisonStore.isInComparison(spell.id)" :aria-label="comparisonStore.isInComparison(spell.id) ? 'Remove from comparison' : 'Add to comparison'" @click="comparisonStore.toggle(spell.id)">
            <span aria-hidden="true">⚖️</span>
            <span class="hidden mobile:hidden">{{ comparisonStore.isInComparison(spell.id) ? 'In comparison' : 'Add to comparison' }}</span>
          </button>
          <button class="btn btn-ghost" aria-label="Export spell" @click="exportSpell">
            <span aria-hidden="true">📥</span>
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-md text-sm">
          <div>
            <p class="text-muted mb-xs">School</p>
            <p>{{ spell.school }}</p>
          </div>
          <div>
            <p class="text-muted mb-xs">Classes</p>
            <p>{{ spell.classes.join(', ') }}</p>
          </div>
          <div>
            <p class="text-muted mb-xs">Cast Time</p>
            <p>{{ spell.castTime }}</p>
          </div>
          <div>
            <p class="text-muted mb-xs">Range</p>
            <p>{{ spell.range }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-muted mb-xs">Components</p>
            <div class="flex flex-wrap gap-xs">
              <span v-if="spell.components.v" class="chip chip-info">V</span>
              <span v-if="spell.components.s" class="chip chip-info">S</span>
              <span v-if="spell.components.m" class="chip chip-info">M</span>
              <span v-if="spell.components.f" class="chip chip-info">F</span>
            </div>
          </div>
          <div>
            <p class="text-muted mb-xs">Target / Area</p>
            <p>{{ spell.target || spell.area || '—' }}</p>
          </div>
          <div>
            <p class="text-muted mb-xs">Duration</p>
            <p>{{ spell.duration }}</p>
          </div>
          <div v-if="spell.save">
            <p class="text-muted mb-xs">Save</p>
            <p>{{ spell.save }}</p>
          </div>
          <div v-if="spell.sr !== undefined">
            <p class="text-muted mb-xs">Spell Resistance</p>
            <p>{{ spell.sr ? 'Yes' : 'No' }}</p>
          </div>
        </div>

        <div class="mt-md flex flex-wrap gap-xs">
          <span v-for="t in spell.traits" :key="t" class="chip">{{ t }}</span>
        </div>

        <div v-if="spell.source.length > 1" class="mt-md p-sm bg-[var(--color-background)] rounded">
          <p class="text-sm font-medium mb-xs">Source variants:</p>
          <div class="flex flex-wrap gap-sm text-sm">
              <span v-for="(src, sourceIndex) in spell.source" :key="`${src.source.type}-${src.source.name}-${sourceIndex}`" class="chip" :data-tooltip="src.source.url">{{ src.source.name }}: {{ src.name }}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="tabs" role="tablist" aria-label="Spell description tabs">
      <button
        id="tab-brief"
        role="tab"
        :class="['tab', { active: activeTab === 'brief' }]"
        :aria-selected="activeTab === 'brief'"
        :aria-controls="`panel-brief`"
        @click="activeTab = 'brief'"
      >
        Brief
      </button>
      <button
        id="tab-full"
        role="tab"
        :class="['tab', { active: activeTab === 'full' }]"
        :aria-selected="activeTab === 'full'"
        :aria-controls="`panel-full`"
        @click="activeTab = 'full'"
      >
        Full
      </button>
    </div>

    <div id="panel-brief" role="tabpanel" :aria-labelledby="`tab-brief`" :hidden="activeTab !== 'brief'" class="card mt-md">
      <div class="card-body prose">
        <p v-if="activeDescription.source" class="text-sm text-secondary mb-sm">
          Russian translation unavailable; showing English from {{ activeDescription.source }}.
        </p>
        <!-- eslint-disable vue/no-v-html -->
        <div v-if="activeDescription.text" v-html="formatDescription(activeDescription.text, 'brief', activeDescription.isHtml)"></div>
        <p v-else>No description is available for this language.</p>
        <div v-if="spell.heightened && spell.heightened.length > 0" class="mt-md">
          <h4 class="font-semibold mb-sm">Heightened</h4>
          <ul class="space-y-sm">
            <li v-for="h in spell.heightened" :key="h.level">
              <strong>{{ h.level }} lv.: </strong>
              <!-- eslint-disable vue/no-v-html -->
              <span v-html="h.description"></span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div id="panel-full" role="tabpanel" :aria-labelledby="`tab-full`" :hidden="activeTab !== 'full'" class="card mt-md">
      <div class="card-body">
        <div class="space-y-lg">
          <section
            v-for="(src, sourceIndex) in spell.source"
            :key="`${src.source.type}-${src.source.name}-${sourceIndex}`"
            class="border-t border-[var(--color-border)] pt-md first:border-t-0 first:pt-0"
          >
            <header class="mb-sm">
              <h3 class="font-semibold">
                <a v-if="src.source.url" :href="src.source.url" target="_blank" rel="noopener noreferrer">{{ src.source.name }}</a>
                <span v-else>{{ src.source.name }}</span>
              </h3>
              <p class="text-sm text-secondary">{{ src.name }}</p>
            </header>
            <div v-if="src.description" class="prose">
              <p class="text-xs text-muted">{{ src.source.type === 'aonprd' ? 'English' : 'Russian' }}</p>
              <!-- eslint-disable vue/no-v-html -->
              <div v-if="src.source.type === 'aonprd'" v-html="formatDescription(src.description, 'full', true)"></div>
              <p v-else class="whitespace-pre-line">{{ src.description }}</p>
            </div>
            <p v-else class="text-sm text-muted">Description unavailable for this publication.</p>
            <div v-if="src.descriptionEn" class="prose mt-sm">
              <p class="text-xs text-muted">English</p>
              <p class="whitespace-pre-line">{{ src.descriptionEn }}</p>
            </div>
            <div v-if="src.heightened?.length" class="mt-md">
              <h4 class="font-medium mb-xs">Heightened</h4>
              <ul class="space-y-xs">
                <li v-for="heightened in src.heightened" :key="heightened.level">
                  <strong>{{ heightened.level }} lv.: </strong>
                  <!-- eslint-disable vue/no-v-html -->
                  <span v-html="heightened.description"></span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="loadError" class="card p-lg text-center">
    <p class="text-error mb-md">Load error: {{ loadError }}</p>
    <router-link to="/" class="btn btn-primary">Back to spells</router-link>
  </div>

  <div v-else class="flex justify-center p-xl">
    <div class="loading-spinner" aria-label="Loading spell"></div>
  </div>
</template>