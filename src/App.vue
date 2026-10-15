<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useSettingsStore } from '@/stores'
import { useSpells } from '@/composables/useSpells'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import '@/assets/styles/main.css'

const settingsStore = useSettingsStore()
const { load } = useSpells()

onMounted(async () => {
  settingsStore.load()
  await load()
})

watch(() => settingsStore.state.theme, () => {
  settingsStore.save()
}, { immediate: false })

function handleKeyDown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    const searchInput = document.querySelector('.search-input') as HTMLInputElement
    searchInput?.focus()
  }
  if (e.key === 'Escape') {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement?.matches('input, select, textarea')) {
      activeElement.blur()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="app">
    <AppHeader />
    <div class="main">
      <AppSidebar />
      <main class="content" role="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity var(--transition-fast); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.app { min-height: 100vh; }
</style>