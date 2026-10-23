<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSpells } from '@/composables/useSpells'
import { useFavoritesStore, useHistoryStore } from '@/stores'
import { rarityLabel, schoolLabel, traditionLabel, traitLabel, classLabel, COMPONENT_LABELS, GENERIC_CLASS_LABEL } from '@/constants/translations'

const route = useRoute()
const router = useRouter()
const favoritesStore = useFavoritesStore()
const historyStore = useHistoryStore()
const { getSpell, loadError, spells } = useSpells()

const spellId = computed(() => route.params.id as string)
const spell = computed(() => getSpell(spellId.value))

const SOURCE_ORDER: Record<string, number> = { pf2ru: 0, 'pf2e-ru-translation': 1, aonprd: 2 }
const orderedSources = computed(() => {
  if (!spell.value) return []
  return [...spell.value.source].sort((a, b) => (SOURCE_ORDER[a.source.type] ?? 9) - (SOURCE_ORDER[b.source.type] ?? 9))
})
const activeSourceIndex = ref(0)
const activeVariant = computed(() => orderedSources.value[activeSourceIndex.value])
watch(orderedSources, () => { activeSourceIndex.value = 0 })

// Данные загружаются асинхронно (App.vue → useSpells().load()), поэтому проверять
// существование заклинания можно только после загрузки списка — иначе прямая
// ссылка на заклинание всегда редиректит на главную.
watch(
  [spells, spellId, loadError],
  ([list, id, error]) => {
    if (list.length === 0) {
      if (error) router.push({ name: 'home' })
      return
    }
    if (!getSpell(id)) {
      router.push({ name: 'home' })
      return
    }
    historyStore.add(id)
  },
  { immediate: true }
)

watch(spellId, () => {
  activeSourceIndex.value = 0
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
    <nav class="mb-md flex items-center gap-sm text-sm text-secondary" aria-label="Навигация">
      <router-link to="/">Главная</router-link>
      <span aria-hidden="true">/</span>
      <span>{{ spell.name.ru }}</span>
    </nav>

    <header class="card mb-md">
      <div class="card-header flex flex-wrap items-start justify-between gap-md">
        <div>
          <h1 class="text-2xl font-bold mb-xs">{{ spell.name.ru }}</h1>
          <p v-if="spell.name.en !== spell.name.ru" class="text-lg text-secondary">{{ spell.name.en }}</p>
          <div class="flex flex-wrap items-center gap-sm mt-sm">
            <span class="chip chip-info">Ур. {{ spell.level }}</span>
            <span v-for="t in spell.tradition" :key="t" class="chip" :data-tooltip="traditionLabel(t)">{{ traditionLabel(t) }}</span>
            <span class="badge" :class="`badge-${spell.rarity}`">{{ rarityLabel(spell.rarity) }}</span>
            <span v-if="spell.isRitual" class="chip chip-warning">Ритуал</span>
            <span v-if="spell.isFocus" class="chip chip-info">Фокус</span>
          </div>
        </div>
        <div class="flex items-center gap-sm flex-shrink-0">
          <button class="btn btn-ghost" :aria-pressed="favoritesStore.favoriteIds.has(spell.id)" :aria-label="favoritesStore.favoriteIds.has(spell.id) ? 'Убрать из избранного' : 'Добавить в избранное'" @click="favoritesStore.toggle(spell.id)">
            <span aria-hidden="true">{{ favoritesStore.favoriteIds.has(spell.id) ? '⭐' : '☆' }}</span>
            <span class="hidden mobile:hidden">{{ favoritesStore.favoriteIds.has(spell.id) ? 'В избранном' : 'Добавить в избранное' }}</span>
          </button>
          <button class="btn btn-ghost" aria-label="Экспортировать заклинание" @click="exportSpell">
            <span aria-hidden="true">📥</span>
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-md text-sm">
          <div>
            <p class="text-muted mb-xs">Школа</p>
            <p>{{ schoolLabel(spell.school) }}</p>
          </div>
          <div>
            <p class="text-muted mb-xs">Классы</p>
            <div v-if="spell.classes.length" class="flex flex-wrap gap-xs">
              <span v-for="c in spell.classes" :key="c" class="chip">{{ classLabel(c) }}</span>
            </div>
            <p v-else>{{ GENERIC_CLASS_LABEL }}</p>
          </div>
          <div>
            <p class="text-muted mb-xs">Время произнесения</p>
            <p>{{ spell.castTime }}</p>
          </div>
          <div>
            <p class="text-muted mb-xs">Дальность</p>
            <p>{{ spell.range }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-muted mb-xs">Компоненты</p>
            <div class="flex flex-wrap gap-xs">
              <span v-if="spell.components.v" class="chip chip-info">{{ COMPONENT_LABELS.V }}</span>
              <span v-if="spell.components.s" class="chip chip-info">{{ COMPONENT_LABELS.S }}</span>
              <span v-if="spell.components.m" class="chip chip-info">{{ COMPONENT_LABELS.M }}</span>
              <span v-if="spell.components.f" class="chip chip-info">{{ COMPONENT_LABELS.F }}</span>
            </div>
          </div>
          <div>
            <p class="text-muted mb-xs">Цель / Область</p>
            <p>{{ spell.target || spell.area || '—' }}</p>
          </div>
          <div>
            <p class="text-muted mb-xs">Длительность</p>
            <p>{{ spell.duration }}</p>
          </div>
          <div v-if="spell.save">
            <p class="text-muted mb-xs">Спасбросок</p>
            <p>{{ spell.save }}</p>
          </div>
          <div v-if="spell.sr !== undefined">
            <p class="text-muted mb-xs">Сопротивление заклинанию</p>
            <p>{{ spell.sr ? 'Да' : 'Нет' }}</p>
          </div>
        </div>

        <div class="mt-md flex flex-wrap gap-xs">
          <span v-for="t in spell.traits" :key="t" class="chip">{{ traitLabel(t) }}</span>
        </div>
      </div>
    </header>

    <div class="tabs" role="tablist" aria-label="Варианты источника">
      <button
        v-for="(src, i) in orderedSources"
        :key="`${src.source.type}-${src.source.name}-${i}`"
        role="tab"
        :class="['tab', { active: activeSourceIndex === i }]"
        :aria-selected="activeSourceIndex === i"
        @click="activeSourceIndex = i"
      >
        {{ src.source.name }}
      </button>
    </div>

    <div v-if="activeVariant" class="card mt-md">
      <div class="card-body">
        <header class="mb-sm">
          <h3 class="font-semibold">
            <a v-if="activeVariant.source.url" :href="activeVariant.source.url" target="_blank" rel="noopener noreferrer">{{ activeVariant.source.name }}</a>
            <span v-else>{{ activeVariant.source.name }}</span>
          </h3>
          <p class="text-sm text-secondary">{{ activeVariant.name }}</p>
        </header>
        <div v-if="activeVariant.description" class="prose">
          <p class="text-xs text-muted mb-sm">{{ activeVariant.source.type === 'aonprd' ? 'Английский' : 'Русский' }}</p>
          <!-- eslint-disable vue/no-v-html -->
          <div v-if="activeVariant.source.type === 'aonprd'" v-html="formatDescription(activeVariant.description, 'full', true)"></div>
          <p v-else class="whitespace-pre-line">{{ activeVariant.description }}</p>
        </div>
        <p v-else class="text-sm text-muted">Описание недоступно для этой публикации.</p>
        <div v-if="activeVariant.heightened?.length" class="mt-md">
          <h4 class="font-medium mb-xs">Усиление</h4>
          <ul class="space-y-xs">
            <li v-for="heightened in activeVariant.heightened" :key="heightened.level">
              <strong>{{ heightened.level }} ур.: </strong>
              <!-- eslint-disable vue/no-v-html -->
              <span v-html="heightened.description"></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="loadError" class="card p-lg text-center">
    <p class="text-error mb-md">Ошибка загрузки: {{ loadError }}</p>
    <router-link to="/" class="btn btn-primary">К заклинаниям</router-link>
  </div>

  <div v-else class="flex justify-center p-xl">
    <div class="loading-spinner" aria-label="Загрузка заклинания"></div>
  </div>
</template>
