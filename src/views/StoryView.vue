<script setup lang="ts">
import { ref } from 'vue'

const storySections = [
  {
    title: 'Введение',
    icon: '📖',
    description: 'Обзор мира, ключевые события и отправная точка для кампании.'
  },
  {
    title: 'Персонажи',
    icon: '👥',
    description: 'Главные герои, союзники, противники и их роли в сюжете.'
  },
  {
    title: 'Локации',
    icon: '🗺️',
    description: 'Города, подземелья, природные объекты и другие важные места.'
  },
  {
    title: 'Квесты',
    icon: '🗡️',
    description: 'Сюжетные задания, их этапы, награды и последствия.'
  },
  {
    title: 'События',
    icon: '⚡',
    description: 'Ключевые события сюжета и возможные варианты их развития.'
  },
  {
    title: 'Фракции',
    icon: '🏛️',
    description: 'Организации, гильдии, церкви и другие группировки.'
  }
]

const activeSection = ref<string>('')

function sectionTitle(): string {
  return activeSection.value
}
</script>

<template>
  <div class="home-view">
    <header class="content-header">
      <h1 class="content-title">Сюжет</h1>
    </header>

    <div class="card p-md mb-md">
      <p>Раздел посвящён ведению кампании и сюжетным материалам для maîtres de jeu. Здесь собраны введение, персонажи, локации, квесты и события.</p>
      <p class="text-muted mt-sm">Содержимое раздела постепенно наполняется. Возвращайтесь позже для получения актуальных материалов.</p>
    </div>

    <div v-if="activeSection === ''" class="empty-state">
      <h3>Разделы сюжета</h3>
      <p>Выберите раздел, чтобы познакомиться с материалами кампании.</p>
      <div class="spell-grid cards" style="margin-top: 1.5rem;">
        <div
          v-for="section in storySections"
          :key="section.title"
          class="card p-md cursor-pointer"
          @click="activeSection = section.title"
        >
          <div class="flex items-center gap-sm mb-sm">
            <span class="text-2xl">{{ section.icon }}</span>
            <div>
              <div class="font-semibold">{{ section.title }}</div>
              <div class="text-sm text-muted">{{ section.description }}</div>
            </div>
          </div>
          <div class="text-xs text-muted">В разработке</div>
        </div>
      </div>
    </div>

    <div v-else class="card p-md">
      <div class="flex items-center gap-sm mb-md">
        <button class="btn btn-secondary btn-sm" @click="activeSection = ''">← Назад</button>
        <h2 class="content-title">{{ sectionTitle() }}</h2>
      </div>
      <p class="text-muted">Раздел «{{ sectionTitle() }}» находится в разработке. Материалы появятся в ближайших обновлениях.</p>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>
