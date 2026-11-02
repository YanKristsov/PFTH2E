import { AlchemicalItemSchema, type AlchemicalItem, type AlchemicalVariant, type AlchemicalSource } from '../src/types/alchemical.js'
import { z } from 'zod'
import { JSDOM } from 'jsdom'
import MarkdownIt from 'markdown-it'
import { resolve } from 'node:path'
import { writeFileSync, existsSync } from 'node:fs'

const AON_SEARCH_URL = 'https://elasticsearch.aonprd.com/aon/_search?stats=searchbar'
const PF2RU_ITEMS_URL = 'https://pf2.ru/alchemical-items'
const PF2RU_DETAILS_URL = 'https://pf2.ru/api/equipment/details'
const READTHEDOCS_URL = 'https://pf2e-ru-translation.readthedocs.io/ru/latest/crafting_and_treasure/alchemical_items.html'

const aonMarkdown = new MarkdownIt({ html: false, linkify: false, typographer: false })
const defaultLinkOpen = aonMarkdown.renderer.rules.link_open
aonMarkdown.renderer.rules.link_open = (tokens: any, index: number, options: any, environment: any, renderer: any) => {
  const token = tokens[index]
  const href = token.attrGet('href')
  if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
    token.attrSet('href', `https://2e.aonprd.com${href}`)
  }
  return defaultLinkOpen
    ? defaultLinkOpen(tokens, index, options, environment, renderer)
    : renderer.renderToken(tokens, index, options)
}

async function fetchJson(url: string, init?: RequestInit): Promise<any> {
  const response = await fetch(url, { headers: { 'User-Agent': 'PF2E-Alchemical-Parser/1.0', ...(init?.headers || {}) }, ...init })
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.json()
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'User-Agent': 'PF2E-Alchemical-Parser/1.0' } })
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}

function spellKey(name: string): string {
  return name
    .normalize('NFKD')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '')
}

interface AoNEquipmentRecord {
  id: string
  category: string
  name: string
  level: number
  markdown: string
  rarity?: string
  source?: string[]
  price?: string
  price_raw?: string
  bulk?: string
  usage?: string
  trait?: string[]
  item_category?: string
}

interface AoNFetchResult {
  items: AlchemicalItem[]
  count: number
}

async function fetchAonprdEquipment(): Promise<AoNFetchResult> {
  const body = JSON.stringify({
    query: {
      bool: {
        filter: [
          { terms: { category: ['equipment'] } },
          { query_string: { query: 'item_category:"Alchemical Items"' } }
        ],
        must_not: [
          { term: { exclude_from_search: true } },
          { exists: { field: 'remaster_id' } },
          { exists: { field: 'item_child_id' } }
        ]
      }
    },
    size: 10000,
    _source: [
      'id', 'name', 'level', 'category', 'rarity', 'trait', 'source', 'price', 'price_raw', 'bulk', 'usage',
      'actions', 'markdown', 'url', 'item_category', 'item_subcategory', 'trait_raw', 'source_raw', 'primary_source'
    ]
  })

  const result = await fetchJson(AON_SEARCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })

  const hits: Array<{ _source: AoNEquipmentRecord }> = result.hits?.hits ?? []
  const total = typeof result.hits?.total === 'number' ? result.hits.total : result.hits?.total?.value
  if (total === undefined || hits.length < total) {
    throw new Error(`Incomplete AoN response: received ${hits.length} of ${total ?? 'unknown'} records.`)
  }

  const byKey = new Map<string, AlchemicalItem>()

  for (const hit of hits) {
    const record = hit._source
    if (record.category !== 'equipment') continue
    if (!record.id || !record.name || !Number.isInteger(record.level) || record.level < 0 || record.level > 20) continue

    const sections = record.markdown.split(/\n---\n/)
    const description = sections.length > 1 ? aonMarkdown.render(sections[1]?.trim() || '') : aonMarkdown.render(record.markdown.trim())

    const traits: string[] = (record.trait ?? []).filter(Boolean)
    const numericId = record.id.replace(/^item-/, '')

    const variant: AlchemicalVariant = {
      id: `aonprd-${record.id}`,
      name: record.name,
      level: record.level,
      price: record.price_raw ?? record.price ?? '',
      description,
      traits,
      source: {
        name: 'Archives of Nethys',
        url: `https://2e.aonprd.com/Equipment.aspx?ID=${numericId}`,
        type: 'aonprd'
      }
    }

    const key = spellKey(record.name)
    let item = byKey.get(key)
    if (!item) {
      item = {
        id: `alchemical-aonprd-${spellKey(record.name)}`,
        name: { ru: record.name, en: record.name },
        category: normalizeCategory(record.name),
        traits: [],
        descriptionHtml: description,
        variants: [variant],
        rarity: 'common'
      }
      byKey.set(key, item)
    } else {
      item.variants.push(variant)
      if (description && !item.descriptionHtml) item.descriptionHtml = description
      item.traits = [...new Set([...item.traits, ...traits])]
    }
  }

  const items = Array.from(byKey.values())
  console.log(`Parsed ${items.length} alchemical items from AoN (${hits.length} records)`)
  return { items, count: hits.length }
}

interface Pf2ruEquipmentItem {
  id: string | number
  name: string
  rus_name: string
  traits: string
  level: number
  price: string
  bulk: string
  item_category: string
  item_subcategory: string
  usage: string
  base_item: string
  is_variant: boolean
}

interface Pf2ruEquipmentDetail {
  text_output: string
  traits_output: string
}

function extractTraitsFromHtml(html: string): string[] {
  if (!html) return []
  // Try <li> tags first (readthedocs style)
  let lis = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi)
  if (lis && lis.length > 0) {
    return lis.map((li) => li.replace(/<[^>]+>/g, '').trim()).filter(Boolean)
  }
  // Try <span class="item-trait"><a>Trait Name</a></span> (pf2.ru style)
  const spans = html.match(/<span[^>]*class="[^"]*item-trait[^"]*"[^>]*>([\s\S]*?)<\/span>/gi) || []
  return spans.map((span) => {
    const aMatch = span.match(/<a[^>]*>([\s\S]*?)<\/a>/)
    return aMatch ? aMatch[1].trim() : span.replace(/<[^>]+>/g, '').trim()
  }).filter(Boolean)
}

function normalizeCategory(c: string): 'bomb' | 'elixir' | 'poison' | 'tool' | 'consumable' | 'other' {
  const cl = c.toLowerCase()
  if (cl.includes('бомб')) return 'bomb'
  if (cl.includes('эликс')) return 'elixir'
  if (cl.includes('яд')) return 'poison'
  if (cl.includes('инстр') || cl.includes('tool')) return 'tool'
  if (cl.includes('расход') || cl.includes('consum')) return 'consumable'
  return 'other'
}

async function fetchPf2ruEquipment(): Promise<AlchemicalItem[]> {
  const byKey = new Map<string, AlchemicalItem>()

  const html = await fetchText(PF2RU_ITEMS_URL)
  const dom = new JSDOM(html)
  const document = dom.window.document

  const itemsMeta = new Map<string | number, Pf2ruEquipmentItem>()

  for (const table of document.querySelectorAll('pf2-table[items]')) {
    const itemsAttr = table.getAttribute('items')
    if (!itemsAttr) continue
    let items: Pf2ruEquipmentItem[]
    try {
      items = JSON.parse(itemsAttr)
    } catch {
      continue
    }
    for (const item of items) {
      itemsMeta.set(item.id, item)
    }
  }

  const numericIds = [...itemsMeta.keys()].filter((id): id is number => typeof id === 'number')
  const ids = numericIds
  const batchSize = 100

  // Сначала получаем описания на русском
  for (let offset = 0; offset < ids.length; offset += batchSize) {
    const batch = ids.slice(offset, offset + batchSize)
    const response = await fetch(PF2RU_DETAILS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'PF2E-Alchemical-Parser/1.0' },
      body: JSON.stringify({ ids: batch, lang: 'ru' })
    })
    if (!response.ok) throw new Error(`Failed to fetch pf2.ru equipment details (ru): ${response.status}`)
    const details = (await response.json()) as Record<string, Pf2ruEquipmentDetail>

    for (const id of batch) {
      const item = itemsMeta.get(id)
      const detail = details[String(id)]
      if (!item || !detail?.text_output) continue

      const key = spellKey(item.rus_name || item.name)
      const variant: AlchemicalVariant = {
        id: `pf2ru-${id}`,
        name: item.rus_name || item.name,
        level: Number(item.level) || 0,
        price: item.price,
        description: detail.text_output,
        traits: extractTraitsFromHtml(item.traits),
        source: {
          name: `pf2.ru:${item.name}`,
          url: `https://pf2.ru/equipment/${id}`,
          type: 'pf2ru'
        }
      }

      let alchItem = byKey.get(key)
      if (!alchItem) {
        alchItem = {
          id: `alchemical-pf2ru-${spellKey(item.rus_name || item.name)}`,
          name: { ru: item.rus_name || item.name, en: item.name },
          category: normalizeCategory(item.item_category),
          traits: extractTraitsFromHtml(item.traits),
          descriptionHtml: detail.text_output,
          variants: [variant],
          rarity: 'common'
        }
        byKey.set(key, alchItem)
      } else {
        alchItem.variants.push(variant)
      }
    }
  }
  console.log(`Fetched ru details for ${ids.length} pf2.ru equipment items`)

  // Затем на английском — описания
  for (let offset = 0; offset < ids.length; offset += batchSize) {
    const batch = ids.slice(offset, offset + batchSize)
    const response = await fetch(PF2RU_DETAILS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'PF2E-Alchemical-Parser/1.0' },
      body: JSON.stringify({ ids: batch, lang: 'en' })
    })
    if (!response.ok) throw new Error(`Failed to fetch pf2.ru equipment details (en): ${response.status}`)
    const details = (await response.json()) as Record<string, Pf2ruEquipmentDetail>

    for (const id of batch) {
      const item = itemsMeta.get(id)
      const detail = details[String(id)]
      if (!item || !detail?.text_output) continue
      const key = spellKey(item.rus_name || item.name)
      const alchItem = byKey.get(key)
      if (alchItem) {
        // английское описание можно добавить, но схема variantes.description — строка, оставляем русское
      }
    }
  }
  console.log(`Fetched en details for ${ids.length} pf2.ru equipment items`)

  return Array.from(byKey.values())
}

function parseReadthedocsEquipment(html: string): AlchemicalItem[] {
  const byKey = new Map<string, AlchemicalItem>()

  const rowRe = /<tr class="row-(?:even|odd)">\s*<td><p>(\d+)<\/p><\/td>\s*<td><p>.*?<a[^>]*href="#(item-[^"]+)"[^>]*><span[^>]*>([^<]+)<\/span><\/a>.*?<\/p><\/td>\s*<td><p>([^<]+)<\/p><\/td>\s*<td><p>([^<]*)<\/p><\/td>\s*<\/tr>/gs

  const items = new Map<string, { ru: string; en: string; category: string; variants: { level: number; price: string; ruName: string; enName: string }[] }>()

  let m: RegExpExecArray | null
  while ((m = rowRe.exec(html)) !== null) {
    const level = parseInt(m[1], 10)
    const anchor = m[2]
    const fullName = m[3].trim()
    const category = m[4].trim().toLowerCase()
    const price = m[5].trim()

    const match = fullName.match(/^(.+?)\s*\(([^)]+)\)$/)
    const ruName = match ? match[1].trim() : fullName
    const enName = match ? match[2].trim() : fullName

    if (!items.has(anchor)) {
      const baseEn = enName.replace(/,\s*(lesser|moderate|greater|major|minor|true|weak|strong|supreme)$/i, '').trim()
      const baseRu = ruName.replace(/,\s*(малая|средняя|большая|сильная|слабая|истинная|отличная|превосходная|средний|большой|малый|сильный|слабый)$/i, '').trim()
      items.set(anchor, { ru: baseRu, en: baseEn, category, variants: [] })
    }
    items.get(anchor)!.variants.push({ level, price, ruName, enName })
  }

  function extractTraits(inner: string): string[] {
    const ulMatch = inner.match(/<ul class="simple">([\s\S]*?)<\/ul>/i)
    if (!ulMatch) return []
    const lis = ulMatch[1].match(/<li[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/li>/gi) || []
    return lis.map((li) => li.replace(/<[^>]+>/g, '').trim()).filter(Boolean)
  }

  function sectionHtml(anchor: string): { html: string; traits: string[] } {
    const marker = 'id="' + anchor + '"'
    const pos = html.indexOf(marker)
    if (pos === -1) return { html: '', traits: [] }
    const secStart = html.lastIndexOf('<section', pos)
    const secEnd = html.indexOf('</section>', pos)
    if (secStart === -1 || secEnd === -1) return { html: '', traits: [] }
    const openEnd = html.indexOf('>', secStart) + 1
    let inner = html.slice(openEnd, secEnd).trim()
    const traits = extractTraits(inner)
    inner = inner.replace(/<ul class="simple">[\s\S]*?<\/ul>/i, '')
    inner = inner.replace(/<h4[\s\S]*?<\/h4>/gi, '')
    inner = inner.replace(/<img[^>]*\.\.\/_images\/PF_action_1\.png[^>]*>/g, '<img class="action action-1" src="/PFTH2E/art/PF_action_1.webp" style="height:1em" alt="PF_action_1">')
    inner = inner.replace(/<img[^>]*\.\.\/_images\/PF_action_2\.png[^>]*>/g, '<img class="action action-2" src="/PFTH2E/art/PF_action_2.webp" style="height:1em" alt="PF_action_2">')
    inner = inner.replace(/<img[^>]*\.\.\/_images\/PF_action_3\.png[^>]*>/g, '<img class="action action-3" src="/PFTH2E/art/PF_action_3.webp" style="height:1em" alt="PF_action_3">')
    inner = inner.replace(/<img[^>]*\.\.\/_images\/PF_action_free\.png[^>]*>/g, '<img class="action action-free" src="/PFTH2E/art/PF_action_free.webp" style="height:1em" alt="PF_action_free">')
    inner = inner.replace(/<img[^>]*\.\.\/_images\/PF_action_reaction\.png[^>]*>/g, '<img class="action action-reaction" src="/PFTH2E/art/PF_action_reaction.png" style="height:1em" alt="PF_action_reaction">')
    inner = inner.replace(/href="\.\.\/playing_the_game\.html#/g, 'href="#')
    inner = inner.replace(/href="\.\.\/([^"]+)"/g, 'href="https://pf2e-ru-translation.readthedocs.io/ru/latest/$1"')
    return { html: inner, traits }
  }

  for (const [anchor, data] of items.entries()) {
    const { html, traits } = sectionHtml(anchor)
    const key = spellKey(data.ru)
    let item = byKey.get(key)
    if (!item) {
      item = {
        id: `alchemical-readthedocs-${spellKey(data.ru)}`,
        name: { ru: data.ru, en: data.en },
        category: normalizeCategory(data.category),
        traits,
        descriptionHtml: html,
        variants: [],
        rarity: 'common'
      }
      byKey.set(key, item)
    }
    for (const v of data.variants) {
      item.variants.push({
        id: `readthedocs-${anchor}-${v.level}`,
        name: v.ruName,
        level: v.level,
        price: v.price,
        description: html,
        source: {
          name: 'pf2e-ru-translation',
          url: READTHEDOCS_URL + '#' + anchor,
          type: 'pf2e-ru-translation'
        }
      })
    }
  }

  return Array.from(byKey.values())
}

function mergeAlchemical(allItems: AlchemicalItem[]): AlchemicalItem[] {
  const byKey = new Map<string, AlchemicalItem>()

  for (const item of allItems) {
    const key = spellKey(item.name.ru)
    if (!byKey.has(key)) {
      const itemTraits = [...new Set([...item.traits, ...item.variants.flatMap(v => v.traits ?? [])])]
      byKey.set(key, { ...item, traits: itemTraits, variants: [...item.variants] })
      continue
    }
    const existing = byKey.get(key)!
    for (const v of item.variants) {
      existing.variants.push(v)
    }
    existing.traits = [...new Set([...existing.traits, ...item.traits])]
    existing.traits = [...new Set([...existing.traits, ...item.variants.flatMap(v => v.traits ?? [])])]
    if (!existing.descriptionHtml && item.descriptionHtml) existing.descriptionHtml = item.descriptionHtml
  }

  const merged: AlchemicalItem[] = []

  for (const item of byKey.values()) {
    const result = AlchemicalItemSchema.safeParse(item)
    if (result.success) {
      merged.push(result.data)
    } else {
      console.error(`Validation failed for ${item.name.ru}:`, result.error)
    }
  }

  return merged.sort((a, b) => a.name.ru.localeCompare(b.name.ru, 'ru'))
}

async function main() {
  console.log('Starting alchemical parsing...')

  const allItems: AlchemicalItem[] = []

  try {
    const aon = await fetchAonprdEquipment()
    allItems.push(...aon.items)
  } catch (error) {
    console.error('Failed to parse AoN alchemical items:', error)
  }

  try {
    const pf2ru = await fetchPf2ruEquipment()
    allItems.push(...pf2ru)
  } catch (error) {
    console.error('Failed to parse pf2.ru alchemical items:', error)
  }

  try {
    const rtHtml = await fetchText(READTHEDOCS_URL)
    const rt = parseReadthedocsEquipment(rtHtml)
    allItems.push(...rt)
  } catch (error) {
    console.error('Failed to parse readthedocs alchemical items:', error)
  }

  console.log(`Total raw items: ${allItems.length}`)

  const merged = mergeAlchemical(allItems)
  console.log(`Merged items: ${merged.length}`)

  if (merged.length === 0) {
    throw new Error('No valid alchemical items were parsed; refusing to overwrite generated data.')
  }

  const outputDir = resolve('public')
  if (!existsSync(outputDir)) {
    const fs = await import('node:fs')
    fs.mkdirSync(outputDir, { recursive: true })
  }

  writeFileSync(resolve(outputDir, 'alchemical.json'), JSON.stringify(merged, null, 2))
  console.log('Written public/alchemical.json')
}

main().catch((e) => { console.error(e); process.exit(1) })
