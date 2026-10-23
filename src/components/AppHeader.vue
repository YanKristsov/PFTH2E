<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores'
import MobileMenuButton from './MobileMenuButton.vue'
import AppSidebar from './AppSidebar.vue'

const settingsStore = useSettingsStore()
const router = useRouter()
const searchQuery = ref('')
const showMobileMenu = ref(false)

function onSidebarClick(e: Event) {
  const target = e.target as HTMLElement
  if (target.closest('a, button')) {
    // close only for navigation links, not filter toggles
    if (target.closest('a[href], .sidebar-link')) {
      showMobileMenu.value = false
    }
  }
}

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
    </div>
  </header>

    <Teleport to="body">
      <div v-if="showMobileMenu" class="sidebar-overlay open" aria-hidden="true" @click="showMobileMenu = false"></div>
      <AppSidebar v-if="showMobileMenu" class="open" mobile @close="showMobileMenu = false" @click="onSidebarClick" />
    </Teleport>
</template>

<style scoped>
/* Styles are in layout.css and components.css */
</style>