import { ref, computed } from 'vue'
import type { Spell, SpellIndex, FilterState } from '@/types/spell'
import MiniSearch from 'minisearch'
import { GENERIC_CLASS, classLabel, sourceLabel } from '@/constants/translations'

  const spells = ref<Spell[]>([])
  const spellsIndex = ref<SpellIndex[]>([])
  const isLoading = ref(false)
  const loadError = ref<string | null>(null)
  const miniSearch = ref<MiniSearch<SpellIndex> | null>(null)
  const spellById = computed(() => new Map(spells.value.map(s => [s.id, s])))

function getActionCategory(castTime: string): string {
  const v = (castTime || '').toLowerCase()
  if (/reaction/.test(v)) return 'reaction'
  if (/free/.test(v)) return 'free'
  if (/three/.test(v)) return '3'
  if (/two/.test(v)) return '2'
  if (/single|1 action/.test(v)) return '1'
  if (/minute|min/.test(v) || /hour/.test(v) || /day|week/.test(v)) return 'time'
  return 'other'
}

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
      boost: { nameRu: 5, nameEn: 4, traits: 2, school: 1 },
      fuzzy: 0.3,
      prefix: true,
      combineWith: 'OR'
    },
    tokenize: (string) => {
      const s = String(string || '').toLowerCase()
      return s.split(/[\s\-_,;:.!?(){}"'|+]+/).filter(Boolean)
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
    return spellById.value.get(id)
  }

  function stripHtml(text: string): string {
    return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  function getShortDescription(id: string): string {
    const spell = spellById.value.get(id)
    if (!spell) return ''
    const source = spell.description.ru || spell.description.en || ''
    const plain = stripHtml(source)
    if (!plain) return ''
    const sentences = plain.split(/(?<=[.!?])\s+/)
    const summary = sentences.slice(0, 2).join(' ').trim()
    if (summary.length <= 280) return summary
    const cut = summary.slice(0, 280)
    const lastSpace = cut.lastIndexOf(' ')
    return `${(lastSpace > 200 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
  }

  function search(query: string, filters: FilterState = {} as FilterState): SpellIndex[] {
    if (!miniSearch.value) return []

    const q = query.trim().toLowerCase()
    let filteredSpells: SpellIndex[]
    if (!q) {
      filteredSpells = [...spellsIndex.value]
    } else {
      const resultIds = new Set<string>()

      try {
        const results = miniSearch.value.search(query, {
          prefix: true,
          fuzzy: 0.3,
          combineWith: 'OR'
        } as any)
        for (const r of results) {
          if ((r as any).id) resultIds.add((r as any).id)
        }
      } catch {
        // ignore minisearch errors
      }

      for (const spell of spells.value) {
        const nameRu = (spell.name.ru || '').toLowerCase()
        const nameEn = (spell.name.en || '').toLowerCase()
        const descRu = stripHtml(spell.description?.ru || '').toLowerCase()
        const descEn = stripHtml(spell.description?.en || '').toLowerCase()
        const traitsStr = (spell.traits || []).join(' ').toLowerCase()
        const componentsStr = [
          spell.components?.v ? 'verbal' : '',
          spell.components?.s ? 'somatic' : '',
          spell.components?.m ? 'material' : '',
          spell.components?.f ? 'focus' : ''
        ].join(' ').toLowerCase()

        if (
          nameRu.includes(q) ||
          nameEn.includes(q) ||
          descRu.includes(q) ||
          descEn.includes(q) ||
          traitsStr.includes(q) ||
          componentsStr.includes(q)
        ) {
          resultIds.add(spell.id)
        }
      }

      filteredSpells = spellsIndex.value.filter(spell => resultIds.has(spell.id))
    }

    const levelInc = (filters.level || []).filter(x => typeof x === 'number') as number[]
    const levelExc = ((filters.level as any[]) || []).filter(x => typeof x === 'string' && (x as string).startsWith('-')).map(x => Number((x as string).slice(1)))
    if (levelInc.length) filteredSpells = filteredSpells.filter(r => levelInc.includes(r.level))
    if (levelExc.length) filteredSpells = filteredSpells.filter(r => !levelExc.includes(r.level))

    function applyIncExc<T>(key: 'tradition' | 'school' | 'class' | 'traits' | 'rarity' | 'source' | 'actions') {
      const arr = (filters as any)[key] as string[] || []
      const inc = arr.filter(x => typeof x === 'string' && !x.startsWith('-'))
      const exc = arr.filter(x => typeof x === 'string' && x.startsWith('-')).map(x => x.slice(1))
      if (inc.length) {
        if (key === 'tradition') filteredSpells = filteredSpells.filter(r => (r.tradition || []).some(t => inc.includes(t)))
        else if (key === 'school') filteredSpells = filteredSpells.filter(r => inc.includes(r.school))
        else if (key === 'class') filteredSpells = filteredSpells.filter(r => inc.some(c => c === GENERIC_CLASS ? r.classes.length === 0 : r.classes.includes(c)))
        else if (key === 'traits') filteredSpells = filteredSpells.filter(r => (r.traits || []).some(t => inc.includes(t)))
        else if (key === 'rarity') filteredSpells = filteredSpells.filter(r => inc.includes(r.rarity))
        else if (key === 'actions') {
          filteredSpells = filteredSpells.filter(r => {
            const spell = spells.value.find(s => s.id === r.id)
            if (!spell) return false
            return inc.includes(getActionCategory(spell.castTime))
          })
        }
        else if (key === 'source') {
          filteredSpells = filteredSpells.filter(r => {
            const spell = spells.value.find(s => s.id === r.id)
            if (!spell) return false
            return spell.source.some(src => inc.includes(sourceLabel(src.source.name)))
          })
        }
      }
      if (exc.length) {
        if (key === 'tradition') filteredSpells = filteredSpells.filter(r => !(r.tradition || []).some(t => exc.includes(t)))
        else if (key === 'school') filteredSpells = filteredSpells.filter(r => !exc.includes(r.school))
        else if (key === 'class') filteredSpells = filteredSpells.filter(r => {
          return !exc.some(c => c === GENERIC_CLASS ? r.classes.length === 0 : r.classes.includes(c))
        })
        else if (key === 'traits') filteredSpells = filteredSpells.filter(r => !(r.traits || []).some(t => exc.includes(t)))
        else if (key === 'rarity') filteredSpells = filteredSpells.filter(r => !exc.includes(r.rarity))
        else if (key === 'actions') {
          filteredSpells = filteredSpells.filter(r => {
            const spell = spells.value.find(s => s.id === r.id)
            if (!spell) return true
            return !exc.includes(getActionCategory(spell.castTime))
          })
        }
        else if (key === 'source') {
          filteredSpells = filteredSpells.filter(r => {
            const spell = spells.value.find(s => s.id === r.id)
            if (!spell) return true
            return !spell.source.some(src => exc.includes(sourceLabel(src.source.name)))
          })
        }
      }
    }

    applyIncExc('tradition')
    applyIncExc('school')
    applyIncExc('class')
    applyIncExc('traits')
    applyIncExc('rarity')
    applyIncExc('actions')
    applyIncExc('source')

    const compArr = (filters.components as string[]) || []
    const compInc = compArr.filter(x => typeof x === 'string' && !x.startsWith('-'))
    const compExc = compArr.filter(x => typeof x === 'string' && x.startsWith('-')).map(x => x.slice(1))
    if (compInc.length) {
      filteredSpells = filteredSpells.filter(r => {
        const spell = spells.value.find(s => s.id === r.id)
        if (!spell) return false
        const c = spell.components || {}
        const has = (compInc.includes('V') && c.v) || (compInc.includes('S') && c.s) || (compInc.includes('M') && c.m) || (compInc.includes('F') && c.f)
        return has
      })
    }
    if (compExc.length) {
      filteredSpells = filteredSpells.filter(r => {
        const spell = spells.value.find(s => s.id === r.id)
        if (!spell) return true
        const c = spell.components || {}
        const hasExc = (compExc.includes('V') && c.v) || (compExc.includes('S') && c.s) || (compExc.includes('M') && c.m) || (compExc.includes('F') && c.f)
        return !hasExc
      })
    }

    return filteredSpells
  }

  function getAllSpells(): Spell[] {
    return spells.value
  }

  function getIndex(): SpellIndex[] {
    return spellsIndex.value
  }

  const traditions = computed(() => ['arcane', 'divine', 'occult', 'primal'] as const)
  const schools = computed(() => [...new Set(spellsIndex.value.map(s => s.school))].sort())
  const allClasses = computed(() => [...new Set(spellsIndex.value.flatMap(s => s.classes))]
    .sort((a, b) => classLabel(a).localeCompare(classLabel(b), 'ru')))
  const allTraits = computed(() => [...new Set(spellsIndex.value.flatMap(s => s.traits))].sort())
  const allSources = computed(() => [...new Set(spells.value.flatMap(s => s.source.map(src => sourceLabel(src.source.name))))].sort())

  return {
    spells,
    spellsIndex,
    isLoading,
    loadError,
    load,
    getSpell,
    getShortDescription,
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