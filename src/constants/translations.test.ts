import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  RARITY_LABELS,
  SCHOOL_LABELS,
  TRAIT_LABELS,
  TRADITION_LABELS,
  actionIcon,
  actionLabel
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

describe('иконки затрат действий', () => {
  it('подбирает иконку для однозначных значений', () => {
    expect(actionIcon('Single Action')?.file).toBe('PF_action_1.webp')
    expect(actionIcon('Two Actions')?.file).toBe('PF_action_2.webp')
    expect(actionIcon('Three Actions')?.file).toBe('PF_action_3.webp')
    expect(actionIcon('Free Action')?.file).toBe('PF_action_free.webp')
    expect(actionIcon('Reaction')?.file).toBe('PF_action_reaction.png')
    expect(actionIcon('2')?.file).toBe('PF_action_2.webp')
  })

  it('не подбирает иконку для диапазонов, комбинаций и длительностей', () => {
    expect(actionIcon('Single Action to Three Actions')).toBeNull()
    expect(actionIcon('Two Actions or Three Actions')).toBeNull()
    expect(actionIcon('Reaction or Single Action')).toBeNull()
    expect(actionIcon('Two Actions to 2 rounds')).toBeNull()
    expect(actionIcon('1 minute')).toBeNull()
    expect(actionIcon('')).toBeNull()
  })

  it('использует путь с базовым префиксом и родные размеры', () => {
    const icon = actionIcon('Two Actions')
    expect(icon?.src).toMatch(/^.*art\/PF_action_2\.webp$/)
    expect(icon?.width).toBe(277)
    expect(icon?.height).toBe(176)
  })

  it('заменяет текст иконкой только для 1/2/3 действий', () => {
    expect(actionIcon('Single Action')?.iconOnly).toBe(true)
    expect(actionIcon('Two Actions')?.iconOnly).toBe(true)
    expect(actionIcon('Three Actions')?.iconOnly).toBe(true)
    expect(actionIcon('2')?.iconOnly).toBe(true)
    expect(actionIcon('Free Action')?.iconOnly).toBe(false)
    expect(actionIcon('Reaction')?.iconOnly).toBe(false)
  })
})

describe('подписи затрат действий', () => {
  it('переводит базовые значения на русский', () => {
    expect(actionLabel('Single Action')).toBe('1 действие')
    expect(actionLabel('Two Actions')).toBe('2 действия')
    expect(actionLabel('Three Actions')).toBe('3 действия')
    expect(actionLabel('Free Action')).toBe('Свободное действие')
    expect(actionLabel('Reaction')).toBe('Реакция')
  })

  it('склеивает диапазоны и комбинации', () => {
    expect(actionLabel('Single Action to Three Actions')).toBe('1–3 действия')
    expect(actionLabel('Two Actions or Three Actions')).toBe('2 действия или 3 действия')
  })
})
