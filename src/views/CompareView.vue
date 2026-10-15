<script setup lang="ts">
import { computed } from 'vue'
import { useSpells } from '@/composables/useSpells'
import { useComparisonStore } from '@/stores'
import { TRADITION_LABELS, RARITY_LABELS, SCHOOL_LABELS } from '@/constants/translations'

const comparisonStore = useComparisonStore()
const { getSpell } = useSpells()

const spells = computed(() => comparisonStore.items.map(id => getSpell(id)).filter((s): s is NonNullable<typeof s> => s !== null))

function removeSpell(spellId: string) {
  comparisonStore.remove(spellId)
}

function clearAll() {
  comparisonStore.clear()
}

function getFieldValue(spell: ReturnType<typeof getSpell>, field: string): string {
  if (!spell) return ''
  switch (field) {
    case 'level': return `Уровень ${spell.level}`
    case 'tradition': return spell.tradition.map(t => TRADITION_LABELS[t] || t).join(', ')
    case 'school': return SCHOOL_LABELS[spell.school] || spell.school
    case 'classes': return spell.classes.join(', ')
    case 'traits': return spell.traits.join(', ')
    case 'castTime': return spell.castTime
    case 'range': return spell.range
    case 'target': return spell.target || spell.area || '—'
    case 'duration': return spell.duration
    case 'save': return spell.save || '—'
    case 'sr': return spell.sr ? 'Да' : 'Нет'
    case 'components': return Object.entries(spell.components).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(', ')
    case 'rarity': return RARITY_LABELS[spell.rarity] || spell.rarity
    case 'isRitual': return spell.isRitual ? 'Да' : 'Нет'
    case 'isFocus': return spell.isFocus ? 'Да' : 'Нет'
    default: return ''
  }
}

function truncateDescription(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/)
  return sentences.slice(0, 3).join(' ') + (sentences.length > 3 ? '...' : '')
}

const compareFields = [
  { key: 'level', label: 'Уровень' },
  { key: 'tradition', label: 'Традиция' },
  { key: 'school', label: 'Школа' },
  { key: 'classes', label: 'Классы' },
  { key: 'traits', label: 'Черты' },
  { key: 'castTime', label: 'Время произнесения' },
  { key: 'range', label: 'Дальность' },
  { key: 'target', label: 'Цель / Область' },
  { key: 'duration', label: 'Длительность' },
  { key: 'save', label: 'Спасбросок' },
  { key: 'sr', label: 'Сопротивление заклинанию' },
  { key: 'components', label: 'Компоненты' },
  { key: 'rarity', label: 'Редкость' },
  { key: 'isRitual', label: 'Ритуал' },
  { key: 'isFocus', label: 'Фокус' }
]
</script>

<template>
  <div class="compare-view">
    <header class="content-header flex flex-wrap items-center justify-between gap-md">
      <h1 class="content-title">Сравнение заклинаний</h1>
      <div class="content-actions flex flex-wrap gap-sm">
        <button class="btn btn-secondary" :disabled="spells.length === 0" @click="clearAll">🗑️ Очистить</button>
        <router-link to="/" class="btn btn-primary">← К заклинаниям</router-link>
      </div>
    </header>

    <div v-if="spells.length === 0" class="empty-state">
      <div class="empty-state-icon" aria-hidden="true">⚖️</div>
      <h3>Нет заклинаний для сравнения</h3>
      <p>Добавьте до 3 заклинаний с помощью кнопки ⚖️ на карточках или в деталях</p>
      <router-link to="/" class="btn btn-primary mt-md">К заклинаниям</router-link>
    </div>

    <div v-else-if="spells.length === 1" class="empty-state">
      <div class="empty-state-icon" aria-hidden="true">⚖️</div>
      <h3>Добавьте второе заклинание</h3>
      <p>Нужно минимум 2 заклинания для сравнения (макс. 3)</p>
      <router-link to="/" class="btn btn-primary mt-md">К заклинаниям</router-link>
    </div>

    <div v-else class="card overflow-x-auto">
      <table class="table" style="min-width: 800px;">
        <thead>
          <tr>
            <th scope="col" style="width: 180px; position: sticky; left: 0; background: var(--color-surface); z-index: 1;">Параметр</th>
            <th v-for="spell in spells" :key="spell.id" scope="col" style="min-width: 250px;">
              <div class="flex items-center justify-between p-sm">
                <div>
                  <div class="font-semibold">{{ spell.name.ru }}</div>
                  <div class="text-xs text-muted">{{ spell.name.en }}</div>
                </div>
                <button class="btn btn-ghost btn-sm" aria-label="Remove from comparison" @click.stop="removeSpell(spell.id)">✕</button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in compareFields" :key="field.key">
            <th scope="row" class="font-medium text-secondary" style="position: sticky; left: 0; background: var(--color-surface); z-index: 1;">{{ field.label }}</th>
            <td v-for="spell in spells" :key="spell.id">
              <div class="p-sm">{{ getFieldValue(spell, field.key) }}</div>
            </td>
          </tr>
          <tr>
            <th scope="row" class="font-medium text-secondary" style="position: sticky; left: 0; background: var(--color-surface); z-index: 1;">Описание (кратко)</th>
            <td v-for="spell in spells" :key="spell.id">
              <!-- eslint-disable vue/no-v-html -->
              <div class="p-sm text-sm" v-html="truncateDescription(spell.description.ru)"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>