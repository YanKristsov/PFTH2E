import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  RARITY_LABELS,
  SCHOOL_LABELS,
  TRAIT_LABELS,
  TRADITION_LABELS
} from './translations'

interface Spell {
  traits?: string[]
  tradition?: string[]
  school?: string
  rarity?: string
}

const isEnglish = (value: string) => !/[^\x20-\x7E]/.test(value)

const spells = JSON.parse(
  readFileSync(new URL('../../public/spells.json', import.meta.url), 'utf8')
) as Spell[]

describe('словари переводов', () => {
  it('покрывают все традиции из данных', () => {
    const traditions = new Set(spells.flatMap((s) => s.tradition ?? []))
    expect([...traditions].filter((t) => !TRADITION_LABELS[t])).toEqual([])
  })

  it('покрывают все школы из данных', () => {
    const schools = new Set(spells.map((s) => s.school).filter((s): s is string => Boolean(s)))
    expect([...schools].filter((s) => !SCHOOL_LABELS[s])).toEqual([])
  })

  it('покрывают все уровни редкости из данных', () => {
    const rarities = new Set(spells.map((s) => s.rarity).filter((r): r is string => Boolean(r)))
    expect([...rarities].filter((r) => !RARITY_LABELS[r])).toEqual([])
  })

  it('покрывают все английские черты из данных', () => {
    const traits = new Set(
      spells.flatMap((s) => s.traits ?? []).filter((t) => isEnglish(t))
    )
    expect([...traits].filter((t) => !TRAIT_LABELS[t])).toEqual([])
  })

  it('не содержат английских подписей в значениях', () => {
    const allValues = [
      ...Object.values(TRAIT_LABELS),
      ...Object.values(SCHOOL_LABELS),
      ...Object.values(TRADITION_LABELS),
      ...Object.values(RARITY_LABELS)
    ]
    expect(allValues.filter((v) => isEnglish(v))).toEqual([])
  })
})
