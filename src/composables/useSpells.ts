import { ref, computed } from 'vue'
import type { Spell, SpellIndex, FilterState } from '@/types/spell'
import MiniSearch from 'minisearch'

const spells = ref<Spell[]>([])
const spellsIndex = ref<SpellIndex[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const miniSearch = ref<MiniSearch<SpellIndex> | null>(null)

async function fetchSpells(): Promise<Spell[]> {
  const baseUrl = import.meta.env.BASE_URL
  const response = await fetch(`${baseUrl}spells.json`)
  if (!response.ok) throw new Error(`Failed to load spells: ${response.status}`)
  return response.json()
}

async function fetchIndex(): Promise<SpellIndex[]> {
  const baseUrl = import.meta.env.BASE_URL
  const response = await fetch(`${baseUrl}spells.index.json`)
  if (!response.ok) throw new Error(`Failed to load index: ${response.status}`)
  return response.json()
}

function initMiniSearch(index: SpellIndex[]) {
  miniSearch.value = new MiniSearch<SpellIndex>({
    fields: ['nameRu', 'nameEn', 'traits', 'school'],
    storeFields: ['id', 'nameRu', 'nameEn', 'level', 'tradition', 'school', 'classes', 'traits', 'rarity'],
    searchOptions: {
      boost: { nameRu: 4, nameEn: 3, traits: 2, school: 1 },
      fuzzy: 0.2,
      prefix: true
    }
  })
  miniSearch.value.addAll(index)
}

export function useSpells() {
  async function load() {
    if (spells.value.length > 0) return

    isLoading.value = true
    loadError.value = null

    try {
      const [spellsData, indexData] = await Promise.all([fetchSpells(), fetchIndex()])
      spells.value = spellsData
      spellsIndex.value = indexData
      initMiniSearch(indexData)

      if ('indexedDB' in window) {
        cacheToIndexedDB(spellsData, indexData)
      }
    } catch (e) {
      loadError.value = e instanceof Error ? e.message : 'Unknown error'
      await loadFromIndexedDB()
    } finally {
      isLoading.value = false
    }
  }

  async function loadFromIndexedDB() {
    return new Promise<void>((resolve) => {
      const request = indexedDB.open('PF2ESpells', 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('spells')) db.createObjectStore('spells')
        if (!db.objectStoreNames.contains('index')) db.createObjectStore('index')
      }
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction(['spells', 'index'], 'readonly')
        tx.objectStore('spells').get('all').onsuccess = (e) => {
          const data = (e.target as IDBRequest).result
          if (data) spells.value = data
        }
        tx.objectStore('index').get('all').onsuccess = (e) => {
          const data = (e.target as IDBRequest).result
          if (data) {
            spellsIndex.value = data
            initMiniSearch(data)
          }
        }
        tx.oncomplete = () => resolve()
      }
      request.onerror = () => resolve()
    })
  }

  function cacheToIndexedDB(spellsData: Spell[], indexData: SpellIndex[]) {
    const request = indexedDB.open('PF2ESpells', 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('spells')) db.createObjectStore('spells')
      if (!db.objectStoreNames.contains('index')) db.createObjectStore('index')
    }
    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction(['spells', 'index'], 'readwrite')
      tx.objectStore('spells').put(spellsData, 'all')
      tx.objectStore('index').put(indexData, 'all')
    }
  }

  function getSpell(id: string): Spell | undefined {
    return spells.value.find(s => s.id === id)
  }

  function search(query: string, filters: FilterState = {} as FilterState): SpellIndex[] {
    if (!miniSearch.value) return []

    let filtered = query.trim()
      ? (() => {
        const results = miniSearch.value!.search(query)
        const ids = new Set(results.map(result => result.id))
        return spellsIndex.value.filter(spell => ids.has(spell.id))
      })()
      : [...spellsIndex.value]

    if (filters.level?.length) {
      filtered = filtered.filter(r => filters.level!.includes(r.level))
    }
    if (filters.tradition?.length) {
      filtered = filtered.filter(r => filters.tradition!.some(t => r.tradition.includes(t)))
    }
    if (filters.school?.length) {
      filtered = filtered.filter(r => filters.school!.includes(r.school))
    }
    if (filters.class?.length) {
      filtered = filtered.filter(r => filters.class!.some(c => r.classes.includes(c)))
    }
    if (filters.traits?.length) {
      filtered = filtered.filter(r => filters.traits!.some(t => r.traits.includes(t)))
    }
    if (filters.rarity?.length) {
      filtered = filtered.filter(r => filters.rarity!.includes(r.rarity))
    }

    return filtered
  }

  function getAllSpells(): Spell[] {
    return spells.value
  }

  function getIndex(): SpellIndex[] {
    return spellsIndex.value
  }

  const traditions = computed(() => ['arcane', 'divine', 'occult', 'primal'] as const)
  const schools = computed(() => [...new Set(spellsIndex.value.map(s => s.school))].sort())
  const allClasses = computed(() => [...new Set(spellsIndex.value.flatMap(s => s.classes))].sort())
  const allTraits = computed(() => [...new Set(spellsIndex.value.flatMap(s => s.traits))].sort())
  const allSources = computed(() => [...new Set(spells.value.flatMap(s => s.source.map(src => src.source.name)))].sort())

  return {
    spells,
    spellsIndex,
    isLoading,
    loadError,
    load,
    getSpell,
    search,
    getAllSpells,
    getIndex,
    traditions,
    schools,
    allClasses,
    allTraits,
    allSources
  }
}