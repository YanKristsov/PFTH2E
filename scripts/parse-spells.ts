import { SpellSchema, type Spell } from '../src/types/spell.js'
import { z } from 'zod'
import { JSDOM } from 'jsdom'
import MarkdownIt from 'markdown-it'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SPELL_SOURCES: Array<{
  name: string
  url: string
  type: 'aonprd' | 'pf2e-ru-translation' | 'pf2ru'
}> = [
  {
    name: 'aonprd',
    url: 'https://2e.aonprd.com/Spells.aspx',
    type: 'aonprd'
  },
  {
    name: 'pf2ru',
    url: 'https://pf2.ru/spells/',
    type: 'pf2ru'
  }
]

type Tradition = 'arcane' | 'divine' | 'occult' | 'primal'

const AON_SEARCH_URL = 'https://elasticsearch.aonprd.com/aon/_search?stats=searchbar'
const aonMarkdown = new MarkdownIt({ html: false, linkify: false, typographer: false })
const defaultLinkOpen = aonMarkdown.renderer.rules.link_open
aonMarkdown.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
  const token = tokens[index]
  const href = token.attrGet('href')
  if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
    token.attrSet('href', `https://2e.aonprd.com${href}`)
  }
  return defaultLinkOpen
    ? defaultLinkOpen(tokens, index, options, environment, renderer)
    : renderer.renderToken(tokens, index, options)
}

interface RawSpell {
  id: string
  sourceId?: number
  isVariant?: boolean
  name: string
  englishName?: string
  englishDescription?: string
  sourceUrl?: string
  sourceTitle?: string
  level: number
  tradition: Tradition[]
  school: string
  classes: string[]
  traits: string[]
  components: { v: boolean; s: boolean; m: boolean; f: boolean }
  castTime: string
  range: string
  target?: string
  area?: string
  duration: string
  save?: string
  sr?: boolean
  description: string
  heightened?: { level: number; description: string }[]
  source: string
  rarity?: 'common' | 'uncommon' | 'rare' | 'unique'
  isRitual?: boolean
  isFocus?: boolean
}

function generateId(name: string, source: string): string {
  return `${source}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'PF2E-Spells-Parser/1.0' }
  })
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}

interface AoNRecord {
  id: string
  category: string
  name: string
  level: number
  markdown: string
  actions?: string
  area_raw?: string
  component?: string[] | string
  duration_raw?: string
  heighten_level?: number[]
  range_raw?: string
  rarity?: string
  saving_throw_markdown?: string
  school?: string
  source?: string[]
  spell_type?: string
  target_raw?: string
  trait?: string[]
  tradition?: string[]
}

function markdownLinksToText(value: string): string {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').trim()
}

function parseAoNHeightened(record: AoNRecord, sections: string[]): Spell['heightened'] {
  const heightenedSection = sections.slice(2).join('\n---\n')
  const pattern = /\*\*Heightened \(([^)]+)\)\*\*\s*([\s\S]*?)(?=\n\*\*Heightened \(|$)/g
  const heightened: NonNullable<Spell['heightened']> = []

  for (const match of heightenedSection.matchAll(pattern)) {
    const label = match[1].trim()
    const description = aonMarkdown.render(match[2].trim())
    const levels = label.startsWith('+')
      ? (record.heighten_level ?? []).filter(level => level > record.level)
      : [Number.parseInt(label, 10)]

    for (const level of levels) {
      if (Number.isInteger(level) && level > 0 && description) {
        heightened.push({ level, description })
      }
    }
  }

  return heightened.length > 0 ? heightened : undefined
}

export function parseAoNRecord(record: AoNRecord): RawSpell | undefined {
  if (!['spell', 'ritual'].includes(record.category)) return undefined
  if (!record.id || !record.name || !Number.isInteger(record.level) || record.level < 0 || record.level > 10) {
    return undefined
  }

  const sections = record.markdown.split(/\n---\n/)
  const description = aonMarkdown.render(sections[1]?.trim() || '')
  const traits = record.trait ?? []
  const schoolNames = new Set([
    'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
    'Evocation', 'Illusion', 'Necromancy', 'Transmutation'
  ])
  const castLine = record.markdown.match(/\*\*Cast\*\*\s*([^\r\n]*)/)?.[1] ?? ''
  const componentText = [castLine, ...(Array.isArray(record.component) ? record.component : [record.component ?? ''])]
    .join(' ')
    .toLowerCase()
  const componentNames = [...componentText.matchAll(/\[([^\]]+)\]/g)].map(match => match[1])
  const components = {
    v: componentText.includes('verbal') || componentNames.includes('v'),
    s: componentText.includes('somatic') || componentNames.includes('s'),
    m: componentText.includes('material') || componentNames.includes('m'),
    f: componentText.includes('focus') || componentNames.includes('f')
  }
  const rarity = ['common', 'uncommon', 'rare', 'unique'].includes(record.rarity ?? '')
    ? record.rarity as NonNullable<RawSpell['rarity']>
    : 'common'
  const numericId = record.id.replace(/^spell-/, '').replace(/^ritual-/, '')
  const detailPath = record.category === 'ritual' ? 'Rituals.aspx' : 'Spells.aspx'

  return {
    id: `aonprd-${record.id}`,
    name: record.name,
    englishName: record.name,
    englishDescription: description,
    sourceUrl: `https://2e.aonprd.com/${detailPath}?ID=${numericId}`,
    level: record.level,
    tradition: (record.tradition ?? []).map(value => value.toLowerCase()).filter((value): value is Tradition =>
      ['arcane', 'divine', 'occult', 'primal'].includes(value)
    ),
    school: record.school || traits.find(trait => schoolNames.has(trait)) || '',
    classes: [],
    traits,
    components,
    castTime: record.actions ?? '',
    range: record.range_raw ?? '',
    target: record.target_raw ?? '',
    area: record.area_raw ?? '',
    duration: record.duration_raw ?? '',
    save: record.saving_throw_markdown ? markdownLinksToText(record.saving_throw_markdown) : undefined,
    description: '',
    heightened: parseAoNHeightened(record, sections),
    source: 'aonprd',
    sourceTitle: (record.source ?? []).join(', '),
    rarity,
    isRitual: record.category === 'ritual',
    isFocus: record.spell_type === 'Focus'
  }
}

async function fetchAonprdSpells(): Promise<RawSpell[]> {
  const response = await fetch(AON_SEARCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: {
        bool: {
          filter: [{ terms: { category: ['spell', 'ritual'] } }],
          must_not: [
            { term: { exclude_from_search: true } },
            { term: { category: 'item-bonus' } },
            { exists: { field: 'remaster_id' } },
            { exists: { field: 'item_child_id' } }
          ]
        }
      },
      size: 10000,
      from: 0,
      _source: [
        'actions', 'area_raw', 'category', 'component', 'duration_raw', 'heighten_level',
        'id', 'level', 'markdown', 'name', 'rarity', 'range_raw', 'saving_throw_markdown',
        'school', 'source', 'spell_type', 'target_raw', 'trait', 'tradition'
      ]
    })
  })
  if (!response.ok) throw new Error(`Failed to fetch AoN spells: ${response.status}`)

  const result = await response.json() as {
    hits?: {
      total?: number | { value: number }
      hits?: Array<{ _source: AoNRecord }>
    }
  }
  const hits = result.hits?.hits ?? []
  const total = typeof result.hits?.total === 'number' ? result.hits.total : result.hits?.total?.value
  if (total === undefined || hits.length < total) {
    throw new Error(`Incomplete AoN response: received ${hits.length} of ${total ?? 'unknown'} records.`)
  }

  const spells = hits.map(hit => parseAoNRecord(hit._source)).filter((spell): spell is RawSpell => Boolean(spell))
  if (spells.length === 0) throw new Error('AoN returned no spell or ritual records.')
  console.log(`Parsed ${spells.length} spells and rituals from AoN`)
  return spells
}

function parsePf2eRuTranslation(html: string): RawSpell[] {
  const spells: RawSpell[] = []
  const dom = new JSDOM(html)
  const document = dom.window.document
  
  const spellLinks = document.querySelectorAll('a.reference.internal[href*="spells/"]')
  for (const link of spellLinks) {
    const href = link.getAttribute('href') || ''
    const name = link.textContent?.trim() || ''
    if (!name) continue
    
    const id = generateId(name, 'pf2e-ru-translation')
    spells.push({
      id,
      name,
      level: 0,
      tradition: [],
      school: '',
      classes: [],
      traits: [],
      components: { v: false, s: false, m: false, f: false },
      castTime: '',
      range: '',
      target: '',
      area: '',
      duration: '',
      description: '',
      source: 'pf2e-ru-translation',
      rarity: 'common'
    })
  }
  return spells
}

export function parsePf2ru(html: string): RawSpell[] {
  const spells: RawSpell[] = []
  const dom = new JSDOM(html)
  const document = dom.window.document
  const spellTables = document.querySelectorAll('pf2-table[items]')
  const traditionNames: Record<string, Tradition> = {
    'Мистическая': 'arcane',
    'Сакральная': 'divine',
    'Оккультная': 'occult',
    'Первобытная': 'primal'
  }
  const traitContainer = document.createElement('div')
  const actionContainer = document.createElement('div')

  for (const [tableIndex, table] of [...spellTables].entries()) {
    const items = table.getAttribute('items')
    if (!items) continue

    const records = JSON.parse(items) as Array<Record<string, unknown>>
    for (const record of records) {
      const name = typeof record.rus_name === 'string' ? record.rus_name.trim() : ''
      const englishName = typeof record.name === 'string' ? record.name.trim() : ''
      const level = Number.parseInt(String(record.level ?? ''), 10)
      if (!name || !englishName || !Number.isInteger(level) || level < 0 || level > 10) continue

      traitContainer.innerHTML = String(record.traits ?? '')
      const traits = [...traitContainer.querySelectorAll('a.item-link--trait')]
        .map(link => link.textContent?.trim() || '')
        .filter(Boolean)
      const rarityTrait = traits.find(trait => ['Необычный', 'Редкий', 'Уникальный'].includes(trait))
      const rarity = rarityTrait === 'Необычный' ? 'uncommon'
        : rarityTrait === 'Редкий' ? 'rare'
          : rarityTrait === 'Уникальный' ? 'unique'
            : 'common'
      const traditions = String(record.traditions ?? '')
        .split(',')
        .map(value => traditionNames[value.trim()])
        .filter((value): value is Tradition => Boolean(value))
      const getText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
      actionContainer.innerHTML = String(record.actions ?? '')

      spells.push({
        id: `pf2ru-${record.id}`,
        sourceId: Number(record.id),
        isVariant: Boolean(record.is_variant),
        name,
        englishName,
        level,
        tradition: traditions,
        school: '',
        classes: [],
        traits,
        components: { v: false, s: false, m: false, f: false },
        castTime: actionContainer.textContent?.trim() || '',
        range: getText(record.range),
        target: getText(record.target),
        area: getText(record.area),
        duration: getText(record.duration),
        description: '',
        source: 'pf2ru',
        sourceTitle: getText(record.source),
        rarity,
        isFocus: tableIndex === 0
      })
    }
  }
  return spells
}

interface Pf2ruSpellDetail {
  text_output?: string
  traits_output?: string
}

export function parsePf2ruDetail(html: string, document: Document) {
  document.body.innerHTML = html
  const labels = [...document.querySelectorAll('b')]
  const getField = (names: string[]) => {
    const label = labels.find((element) => {
      const text = element.textContent?.trim().replace(/[:：]$/, '').toLowerCase()
      return text ? names.includes(text) : false
    })
    if (!label) return ''

    const parts: string[] = []
    for (let node = label.nextSibling; node && !['B', 'BR', 'HR'].includes(node.nodeName); node = node.nextSibling) {
      parts.push(node.textContent || '')
    }
    const value = parts.join('').trim()
    const newline = names.includes('длительность') ? value.indexOf('\n') : -1
    return (newline >= 0 ? value.slice(0, newline) : value).replace(/[.;，。]+$/, '')
  }

  const divider = document.querySelector('hr')
  const descriptionParts: string[] = []
  const getNodeText = (node: Node) => node.nodeName === 'BR' ? ' ' : node.textContent || ''
  if (divider) {
    for (let node = divider.nextSibling; node; node = node.nextSibling) {
      descriptionParts.push(getNodeText(node))
    }
  } else {
    const durationLabel = labels.find((element) => {
      const text = element.textContent?.trim().replace(/[:：]$/, '').toLowerCase()
      return text === 'длительность'
    })
    const durationText = durationLabel?.nextSibling
    const durationValue = durationText?.textContent || ''
    const newline = durationValue.indexOf('\n')
    if (newline >= 0) {
      descriptionParts.push(durationValue.slice(newline + 1))
      for (let node = durationText?.nextSibling ?? null; node; node = node.nextSibling) {
        descriptionParts.push(getNodeText(node))
      }
    }
  }

  return {
    description: descriptionParts.join('').replace(/\s+/g, ' ').trim(),
    range: getField(['дистанция', 'range']),
    area: getField(['область', 'area']),
    target: getField(['цель', 'цели', 'target', 'targets']),
    duration: getField(['длительность', 'duration']),
    save: getField(['спасбросок', 'saving throw'])
  }
}

async function enrichPf2ruSpells(spells: RawSpell[]): Promise<void> {
  const spellsBySourceId = new Map<number, RawSpell>()
  for (const spell of spells) {
    if (spell.source === 'pf2ru' && !spell.isVariant && spell.sourceId !== undefined) {
      spellsBySourceId.set(spell.sourceId, spell)
    }
  }

  const ids = [...spellsBySourceId.keys()]
  const document = new JSDOM('').window.document
  const batchSize = 100

  for (const language of ['ru', 'en'] as const) {
    for (let offset = 0; offset < ids.length; offset += batchSize) {
      const batch = ids.slice(offset, offset + batchSize)
      const response = await fetch('https://pf2.ru/api/spells/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PF2E-Spells-Parser/1.0'
        },
        body: JSON.stringify({ ids: batch, lang: language })
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch ${language} spell details: ${response.status}`)
      }

      const details = await response.json() as Record<string, Pf2ruSpellDetail>
      for (const id of batch) {
        const detail = details[String(id)]
        if (!detail?.text_output) {
          throw new Error(`Missing ${language} spell details for pf2.ru ID ${id}`)
        }

        const spell = spellsBySourceId.get(id)
        if (!spell) continue
        const parsed = parsePf2ruDetail(detail.text_output, document)
        if (language === 'ru') {
          spell.description = parsed.description
          spell.range = parsed.range || spell.range
          spell.area = parsed.area || spell.area
          spell.target = parsed.target || spell.target
          spell.duration = parsed.duration || spell.duration
          spell.save = parsed.save || spell.save
        } else {
          spell.englishDescription = parsed.description
        }
      }
    }
    console.log(`Fetched ${language} details for ${ids.length} spells`)
  }
}

export function mergeSpells(allSpells: RawSpell[]): Spell[] {
  const byKey = new Map<string, RawSpell[]>()
  const sourceNames: Record<RawSpell['source'], string> = {
    aonprd: 'Archives of Nethys',
    'pf2e-ru-translation': 'pf2e-ru-translation',
    pf2ru: 'pf2.ru'
  }
  
  for (const spell of allSpells) {
    const key = (spell.englishName || spell.name)
      .normalize('NFKD')
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/(^-|-$)/g, '')
    if (!byKey.has(key)) byKey.set(key, [])
    byKey.get(key)!.push(spell)
  }
  
  const merged: Spell[] = []
  
  for (const [key, variants] of byKey) {
    const primary = variants.find(v => v.source === 'aonprd') || variants[0]
    const russianVariant = variants.find(v => v.source === 'pf2ru' && v.description)
    const englishVariant = variants.find(v => v.source === 'aonprd' && v.englishDescription)
      || variants.find(v => v.englishDescription)
    
    const mergedSpell: Spell = {
      id: primary.id,
      name: {
        ru: russianVariant?.name || primary.name,
        en: primary.englishName || primary.name
      },
      level: primary.level,
      tradition: primary.tradition.length > 0
        ? primary.tradition
        : variants.find(v => v.tradition.length > 0)?.tradition || [],
      school: primary.school || variants.find(v => v.school)?.school || 'Unknown',
      classes: [...new Set(variants.flatMap(v => v.classes))],
      traits: [...new Set(variants.flatMap(v => v.traits))],
      components: { v: primary.components.v, s: primary.components.s, m: primary.components.m, f: primary.components.f },
      castTime: primary.castTime,
      range: primary.range,
      target: primary.target,
      area: primary.area,
      duration: primary.duration,
      save: primary.save,
      sr: primary.sr,
      description: {
        ru: russianVariant?.description || '',
        en: englishVariant?.englishDescription || primary.englishDescription || primary.description
      },
      heightened: primary.heightened,
      source: variants.map(v => ({
        source: {
          name: v.sourceTitle
            ? `${sourceNames[v.source]}: ${v.sourceTitle}`
            : sourceNames[v.source],
          ...(v.sourceUrl ? { url: v.sourceUrl } : {}),
          type: v.source as 'aonprd' | 'pf2e-ru-translation' | 'pf2ru'
        },
        name: v.name,
        description: v.source === 'aonprd'
          ? v.englishDescription || ''
          : v.description || v.englishDescription || '',
        ...(v.source === 'pf2ru' && v.englishDescription
          ? { descriptionEn: v.englishDescription }
          : {}),
        heightened: v.heightened
      })),
      rarity: primary.rarity || 'common',
      isRitual: variants.some(v => v.isRitual),
      isFocus: variants.some(v => v.isFocus)
    }
    
    const result = SpellSchema.safeParse(mergedSpell)
    if (result.success) {
      merged.push(result.data)
    } else {
      console.error(`Validation failed for ${key}:`, result.error)
    }
  }
  
  return merged.sort((a, b) => a.level - b.level || a.name.ru.localeCompare(b.name.ru))
}

async function main() {
  console.log('Starting spell parsing...')
  
  const allSpells: RawSpell[] = []
  
  for (const source of SPELL_SOURCES) {
    try {
      console.log(`Fetching ${source.name}...`)
      const spells = source.type === 'aonprd'
        ? await fetchAonprdSpells()
        : parsePf2ru(await fetchHtml(source.url))
      
      console.log(`Parsed ${spells.length} spells from ${source.name}`)
      allSpells.push(...spells)
    } catch (error) {
      console.error(`Failed to parse ${source.name}:`, error)
    }
  }
  
  console.log(`Total raw spells: ${allSpells.length}`)

  await enrichPf2ruSpells(allSpells)
  
  const merged = mergeSpells(allSpells)
  console.log(`Merged spells: ${merged.length}`)

  if (merged.length === 0) {
    throw new Error('No valid spells were parsed; refusing to overwrite generated data.')
  }
  
  const fs = await import('fs')
  const path = await import('path')
  
  const outputDir = path.resolve('public')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  
  fs.writeFileSync(
    path.join(outputDir, 'spells.json'),
    JSON.stringify(merged, null, 2)
  )
  
  const index = merged.map(s => ({
    id: s.id,
    nameRu: s.name.ru,
    nameEn: s.name.en,
    level: s.level,
    tradition: s.tradition,
    school: s.school,
    classes: s.classes,
    traits: s.traits,
    rarity: s.rarity
  }))
  
  fs.writeFileSync(
    path.join(outputDir, 'spells.index.json'),
    JSON.stringify(index, null, 2)
  )
  
  console.log('Done! Files written to public/')
}

const isDirectExecution = process.argv[1] !== undefined
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectExecution) {
  main().catch((error) => {
    console.error('Spell parsing failed:', error)
    process.exitCode = 1
  })
}