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

function toggleSidebar() {
  settingsStore.toggleSidebar()
}

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
      <button
        class="btn btn-ghost desktop-only"
        aria-label="Свернуть/развернуть боковое меню"
        :aria-pressed="settingsStore.state.sidebarCollapsed"
        @click="toggleSidebar"
        :data-tooltip="settingsStore.state.sidebarCollapsed ? 'Развернуть меню' : 'Свернуть меню'"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <form class="search-form flex-1" role="search" @submit="handleSearch">
        <label for="search" class="sr-only">Поиск заклинаний</label>
        <span class="search-icon" aria-hidden="true">🔍</span>
        <input
          id="search"
          v-model="searchQuery"
          type="search"
          class="search-input"
          placeholder="Поиск"
          autocomplete="off"
          aria-describedby="search-hint"
        />
        <span id="search-hint" class="sr-only">Нажмите Enter для поиска, ⌘K чтобы сфокусироваться</span>
      </form>
    </div>
    <div class="header-right flex items-center gap-sm">
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