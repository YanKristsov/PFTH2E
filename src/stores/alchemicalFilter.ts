import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlchemicalFilterStore = defineStore('alchemicalFilter', () => {
  const searchQuery = ref('')
  const categories = ref<string[]>([])
  const levels = ref<number[]>([])

  function toggleCategory(c: string) {
    const i = categories.value.indexOf(c)
    if (i === -1) categories.value.push(c)
    else categories.value.splice(i, 1)
  }

  function toggleLevel(l: number) {
    const i = levels.value.indexOf(l)
    if (i === -1) levels.value.push(l)
    else levels.value.splice(i, 1)
  }

  function clear() {
    searchQuery.value = ''
    categories.value = []
    levels.value = []
  }

  function hasActive() {
    return !!searchQuery.value.trim() || categories.value.length > 0 || levels.value.length > 0
  }

  return { searchQuery, categories, levels, toggleCategory, toggleLevel, clear, hasActive }
})
