<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores'
import MobileMenuButton from './MobileMenuButton.vue'

const settingsStore = useSettingsStore()
const router = useRouter()
const searchQuery = ref('')
const showMobileMenu = ref(false)

function handleSearch(e: Event) {
  e.preventDefault()
  router.push({ name: 'home', query: { q: searchQuery.value } })
}

function toggleTheme() {
  const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
  const current = themes.indexOf(settingsStore.state.theme)
  const next = themes[(current + 1) % 3]
  settingsStore.setTheme(next)
}

function getThemeIcon() {
  switch (settingsStore.state.theme) {
    case 'dark': return '🌙'
    case 'light': return '☀️'
    default: return '💻'
  }
}
</script>

<template>
  <header class="header" role="banner">
    <div class="header-left flex items-center gap-md flex-1">
      <MobileMenuButton aria-label="Открыть меню" @click="showMobileMenu = true" />
      <router-link to="/" class="logo" aria-label="Главная">
        <span class="logo-icon" aria-hidden="true">📜</span>
        <span>PF2E Заклинания</span>
      </router-link>
      <form class="search-form flex-1" role="search" @submit="handleSearch">
        <label for="search" class="sr-only">Поиск заклинаний</label>
        <span class="search-icon" aria-hidden="true">🔍</span>
        <input
          id="search"
          v-model="searchQuery"
          type="search"
          class="search-input"
          placeholder="Поиск заклинаний... (⌘K)"
          autocomplete="off"
          aria-describedby="search-hint"
        />
        <span id="search-hint" class="sr-only">Нажмите Enter для поиска, ⌘K чтобы сфокусироваться</span>
      </form>
    </div>
    <div class="header-right flex items-center gap-sm">
      <button
        class="btn btn-ghost"
        :aria-label="`Тема: ${settingsStore.state.theme}. Нажмите, чтобы сменить.`"
        :data-tooltip="`Тема: ${settingsStore.state.theme}`"
        @click="toggleTheme"
      >
        {{ getThemeIcon() }}
      </button>
      <router-link to="/favorites" class="btn btn-ghost" aria-label="Избранное">
        ⭐
        <span class="hidden mobile:hidden">Избранное</span>
      </router-link>
      <router-link to="/settings" class="btn btn-ghost" aria-label="Настройки">
        ⚙️
        <span class="hidden mobile:hidden">Настройки</span>
      </router-link>
    </div>
  </header>

  <Teleport to="body">
    <div v-if="showMobileMenu" class="sidebar-overlay open" aria-hidden="true" @click="showMobileMenu = false"></div>
    <aside v-if="showMobileMenu" class="sidebar open" role="dialog" aria-label="Меню навигации">
      <div class="flex items-center justify-between p-md border-b border-[var(--color-border)]">
        <h2 class="text-lg font-semibold">Меню</h2>
        <button class="btn btn-ghost" aria-label="Закрыть меню" @click="showMobileMenu = false">✕</button>
      </div>
      <nav class="flex-1 p-md overflow-y-auto">
        <router-link to="/" class="sidebar-link" @click="showMobileMenu = false">
          <span class="sidebar-link-icon" aria-hidden="true">🏠</span>
          <span>Главная</span>
        </router-link>
        <router-link to="/favorites" class="sidebar-link" @click="showMobileMenu = false">
          <span class="sidebar-link-icon" aria-hidden="true">⭐</span>
          <span>Избранное</span>
        </router-link>
        <router-link to="/history" class="sidebar-link" @click="showMobileMenu = false">
          <span class="sidebar-link-icon" aria-hidden="true">🕐</span>
          <span>История</span>
        </router-link>
        <router-link to="/compare" class="sidebar-link" @click="showMobileMenu = false">
          <span class="sidebar-link-icon" aria-hidden="true">⚖️</span>
          <span>Сравнение</span>
        </router-link>
        <router-link to="/settings" class="sidebar-link" @click="showMobileMenu = false">
          <span class="sidebar-link-icon" aria-hidden="true">⚙️</span>
          <span>Настройки</span>
        </router-link>
      </nav>
    </aside>
  </Teleport>
</template>

<style scoped>
/* Styles are in layout.css and components.css */
</style>