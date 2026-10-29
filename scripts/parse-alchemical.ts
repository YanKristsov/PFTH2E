import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileSync } from 'node:fs'
import { AlchemicalItemSchema } from '../src/types/alchemical.js'
import { z } from 'zod'

const URL = 'https://pf2e-ru-translation.readthedocs.io/ru/latest/crafting_and_treasure/alchemical_items.html'

async function main() {
  const res = await fetch(URL)
  const html = await res.text()

  // Parse table rows: | level | [name (en)](#anchor) | category | price |
  const rowRe = /<tr class="row-(?:even|odd)">\s*<td><p>(\d+)<\/p><\/td>\s*<td><p>.*?<a[^>]*href="#(item-[^"]+)"[^>]*><span[^>]*>([^<]+)<\/span><\/a>.*?<\/p><\/td>\s*<td><p>([^<]+)<\/p><\/td>\s*<td><p>([^<]*)<\/p><\/td>\s*<\/tr>/gs

  const items = new Map<string, { ru: string; en: string; category: string; variants: { level: number; price: string; ruName: string; enName: string }[] }>()

  let m: RegExpExecArray | null
  while ((m = rowRe.exec(html)) !== null) {
    const level = parseInt(m[1], 10)
    const anchor = m[2]
    const fullName = m[3].trim()
    const category = m[4].trim().toLowerCase()
    const price = m[5].trim()

    // Split "Кислотная склянка, малая (Acid flask, lesser)"
    const match = fullName.match(/^(.+?)\s*\(([^)]+)\)$/)
    const ruName = match ? match[1].trim() : fullName
    const enName = match ? match[2].trim() : fullName

    // Base name: strip variant suffix (малая/средняя/etc.) — group by anchor root
    // anchor like item-acid-flask (same for all variants)
    if (!items.has(anchor)) {
      // base en name: strip ", lesser/moderate/greater/major/minor" etc.
      const baseEn = enName.replace(/,\s*(lesser|moderate|greater|major|minor|true|weak|strong|supreme)$/i, '').trim()
      const baseRu = ruName.replace(/,\s*(малая|средняя|большая|сильная|слабая|истинная|отличная|превосходная|средний|большой|малый|сильный|слабый)$/i, '').trim()
      items.set(anchor, { ru: baseRu, en: baseEn, category, variants: [] })
    }
    items.get(anchor)!.variants.push({ level, price, ruName, enName })
  }

  // Extract description text per item from its section
  function sectionHtml(anchor: string): string {
    const marker = 'id="' + anchor + '"'
    const pos = html.indexOf(marker)
    if (pos === -1) return ''
    const secStart = html.lastIndexOf('<section', pos)
    const secEnd = html.indexOf('</section>', pos)
    if (secStart === -1 || secEnd === -1) return ''
    // inner content between section tags
    const openEnd = html.indexOf('>', secStart) + 1
    let inner = html.slice(openEnd, secEnd).trim()
    // Remove "Взаимодействовать (Interact)" mentions
    inner = inner.replace(/Взаимодействовать\s*\(Interact\)/gi, '')
    // Rewrite action icon paths to our own assets
    inner = inner.replace(/\.\.\/_images\/PF_action_1\.png/g, '/PFTH2E/art/PF_action_1.webp')
    inner = inner.replace(/\.\.\/_images\/PF_action_2\.png/g, '/PFTH2E/art/PF_action_2.webp')
    inner = inner.replace(/\.\.\/_images\/PF_action_3\.png/g, '/PFTH2E/art/PF_action_3.webp')
    inner = inner.replace(/\.\.\/_images\/PF_action_free\.png/g, '/PFTH2E/art/PF_action_free.webp')
    inner = inner.replace(/\.\.\/_images\/PF_action_reaction\.png/g, '/PFTH2E/art/PF_action_reaction.png')
    return inner
  }

  const result = Array.from(items.entries()).map(([anchor, data]) => ({
    id: anchor,
    name: { ru: data.ru, en: data.en },
    category: normalizeCategory(data.category),
    descriptionHtml: sectionHtml(anchor),
    variants: data.variants.map((v) => ({
      level: v.level,
      name: v.ruName,
      price: v.price,
      description: '',
      source: { name: 'pf2e-ru-translation', url: URL + '#' + anchor, type: 'pf2e-ru-translation' }
    })),
    rarity: 'common'
  }))

  // validate
  const schema = z.array(AlchemicalItemSchema)
  schema.parse(result)

  writeFileSync(resolve(process.cwd(), 'public/alchemical.json'), JSON.stringify(result, null, 2))
  console.log('Items:', result.length)
}

function normalizeCategory(c: string): 'bomb' | 'elixir' | 'poison' | 'tool' | 'consumable' | 'other' {
  if (c.includes('бомб')) return 'bomb'
  if (c.includes('эликс')) return 'elixir'
  if (c.includes('яд')) return 'poison'
  if (c.includes('расход')) return 'consumable'
  if (c.includes('инстр')) return 'tool'
  return 'other'
}

main().catch((e) => { console.error(e); process.exit(1) })
