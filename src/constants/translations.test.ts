import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  RARITY_LABELS,
  SCHOOL_LABELS,
  TRAIT_LABELS,
  TRADITION_LABELS,
  CLASS_LABELS,
  GENERIC_CLASS,
  GENERIC_CLASS_LABEL,
  actionDisplay,
  actionLabel,
  classLabel
} from './translations'

interface Spell {
  traits?: string[]
  tradition?: string[]
  school?: string
  rarity?: string
  classes?: string[]
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
      ...Object.values(RARITY_LABELS),
      ...Object.values(CLASS_LABELS)
    ]
    expect(allValues.filter((v) => isEnglish(v))).toEqual([])
  })
})

describe('словарь классов', () => {
  it('покрывает все классы из данных', () => {
    const classes = new Set(spells.flatMap((s) => s.classes ?? []))
    expect([...classes].filter((c) => !CLASS_LABELS[c])).toEqual([])
  })

  it('переводит названия классов', () => {
    expect(classLabel('Wizard')).toBe('Волшебник')
    expect(classLabel('Sorcerer')).toBe('Чародей')
    expect(classLabel('Necromancer')).toBe('Некромант')
  })

  it('подставляет название для псевдокласса общего заклинания', () => {
    expect(classLabel(GENERIC_CLASS)).toBe(GENERIC_CLASS_LABEL)
    expect(GENERIC_CLASS_LABEL).toBe('Общее заклинание')
  })

  it('не относит классы к дескрипторам', () => {
    const classNames = Object.keys(CLASS_LABELS)
    const traits = new Set(spells.flatMap((s) => s.traits ?? []))
    expect([...traits].filter((t) => classNames.includes(t))).toEqual([])
  })
})

describe('иконки затрат действий', () => {
  const iconFiles = (castTime: string) =>
    actionDisplay(castTime)
      .segments.filter((s) => s.kind === 'icon')
      .map((s) => s.icon?.file)

  const texts = (castTime: string) =>
    actionDisplay(castTime)
      .segments.filter((s) => s.kind === 'text')
      .map((s) => s.text)

  it('подбирает иконку для однозначных значений', () => {
    expect(iconFiles('Single Action')).toEqual(['PF_action_1.webp'])
    expect(iconFiles('Two Actions')).toEqual(['PF_action_2.webp'])
    expect(iconFiles('Three Actions')).toEqual(['PF_action_3.webp'])
    expect(iconFiles('Free Action')).toEqual(['PF_action_free.webp'])
    expect(iconFiles('Reaction')).toEqual(['PF_action_reaction.png'])
    expect(iconFiles('2')).toEqual(['PF_action_2.webp'])
  })

  it('не подбирает иконку для комбинаций и длительностей', () => {
    expect(iconFiles('Two Actions or Three Actions')).toEqual([])
    expect(iconFiles('Reaction or Single Action')).toEqual([])
    expect(iconFiles('1 minute')).toEqual([])
    expect(iconFiles('')).toEqual([])
  })

  it('для диапазона показывает две иконки через тире', () => {
    const display = actionDisplay('Single Action to Three Actions')
    expect(display.label).toBe('1–3 действия')
    expect(display.segments.map((s) => s.kind)).toEqual(['icon', 'sep', 'icon'])
    expect(iconFiles('Single Action to Three Actions')).toEqual([
      'PF_action_1.webp',
      'PF_action_3.webp'
    ])
    expect(texts('Single Action to Three Actions')).toEqual([])
    const sep = display.segments[1]
    expect(sep.text).toBe('–')
  })

  it('скрывает текст там, где иконка однозначна', () => {
    expect(texts('Single Action')).toEqual([])
    expect(texts('Two Actions')).toEqual([])
    expect(texts('Three Actions')).toEqual([])
    expect(texts('Reaction')).toEqual([])
  })

  it('сохраняет подпись там, где иконка неоднозначна', () => {
    expect(texts('Free Action')).toEqual(['Свободное действие'])
    expect(texts('Two Actions or Three Actions')).toEqual(['2 действия или 3 действия'])
    expect(texts('1 minute')).toEqual(['1 минута'])
    expect(texts('')).toEqual(['—'])
  })

  it('использует путь с базовым префиксом и родные размеры', () => {
    const icon = actionDisplay('Two Actions').segments[0].icon
    expect(icon?.src).toMatch(/^.*art\/PF_action_2\.webp$/)
    expect(icon?.width).toBe(277)
    expect(icon?.height).toBe(176)
    expect(icon?.alt).toBe('2 действия')
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
