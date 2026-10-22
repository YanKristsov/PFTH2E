import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'
import {
  mergeSpells,
  parseAoNRecord,
  parsePf2ru,
  parsePf2ruDetail,
  parsePf2ruClassSpells,
  parseReadthedocsClasses,
  parseReadthedocsSpell,
  pf2ruClassName
} from './parse-spells.js'

const fixtureHtml = readFileSync(new URL('./fixtures/pf2ru-spells.html', import.meta.url), 'utf8')
const aonRecords = JSON.parse(readFileSync(new URL('./fixtures/aonprd-records.json', import.meta.url), 'utf8')) as Array<Record<string, unknown>>

describe('Archives of Nethys parser', () => {
  it('maps Remaster spells and rituals, renders safe linked markdown, and parses heightening', () => {
    const fireball = parseAoNRecord(aonRecords[0] as unknown as Parameters<typeof parseAoNRecord>[0])
    const ritual = parseAoNRecord(aonRecords[1] as unknown as Parameters<typeof parseAoNRecord>[0])

    expect(fireball).toMatchObject({
      id: 'aonprd-spell-1530',
      name: 'Fireball',
      level: 3,
      tradition: ['arcane', 'primal'],
      traits: ['Concentrate', 'Fire', 'Manipulate'],
      components: { v: true, s: true, m: false, f: false },
      range: '500 feet',
      area: '20-foot burst',
      save: 'basic Reflex',
      sourceUrl: 'https://2e.aonprd.com/Spells.aspx?ID=1530',
      isFocus: false,
      isRitual: false
    })
    expect(fireball?.englishDescription).toContain('href="https://2e.aonprd.com/Conditions.aspx?ID=69"')
    expect(fireball?.englishDescription).toContain('&lt;img')
    expect(fireball?.englishDescription).not.toContain('<img')
    expect(fireball?.heightened).toEqual([
      { level: 4, description: '<p>Damage increases by 2d6.</p>\n' },
      { level: 5, description: '<p>Damage increases by 2d6.</p>\n' }
    ])
    expect(ritual).toMatchObject({
      id: 'aonprd-ritual-25',
      isRitual: true,
      level: 1,
      sourceUrl: 'https://2e.aonprd.com/Rituals.aspx?ID=25'
    })
    expect(parseAoNRecord({ ...aonRecords[0], category: 'feat' } as unknown as Parameters<typeof parseAoNRecord>[0])).toBeUndefined()
  })

  it('выносит трейт-класс в поле classes', () => {
    const record = {
      ...aonRecords[0],
      trait: ['Concentrate', 'Fire', 'Manipulate', 'Sorcerer']
    } as unknown as Parameters<typeof parseAoNRecord>[0]

    const spell = parseAoNRecord(record)

    expect(spell?.classes).toEqual(['Sorcerer'])
    expect(spell?.traits).toEqual(['Concentrate', 'Fire', 'Manipulate'])
  })
})

describe('данные о классах', () => {
  it('определяет класс по заголовку страницы pf2.ru', () => {
    const dom = new JSDOM('<html><body><h1>АлхимикAlchemist</h1></body></html>')
    expect(pf2ruClassName(dom.window.document)).toBe('Alchemist')
  })

  it('собирает фокусные заклинания класса со страницы pf2.ru', () => {
    const items = [
      { item_type: 'spell', name: 'Fireball' },
      { item_type: 'spell', name: 'Magic Missile' },
      { item_type: 'feat', name: 'Reach Spell' }
    ]
    const html = `<html><body><pf2-table items='${JSON.stringify(items)}'></pf2-table></body></html>`

    expect(parsePf2ruClassSpells(html)).toEqual(['Fireball', 'Magic Missile'])
  })

  it('читает классы с русскими названиями из перевода CRB', () => {
    const html = `
      <a class="reference internal" href="wizard.html">Волшебник (Wizard)</a>
      <a class="reference internal" href="ranger.html">Рейнджер (Ranger)</a>
      <a class="reference internal" href="archetype.html">Архетип (Multiclass Archetypes)</a>
    `

    expect(parseReadthedocsClasses(html)).toEqual([
      { en: 'Wizard', ru: 'Волшебник' },
      { en: 'Ranger', ru: 'Рейнджер' }
    ])
  })
})

describe('pf2.ru parser', () => {
  it('parses localized names, spell fields, and focus-table membership', () => {
    const spells = parsePf2ru(fixtureHtml)

    expect(spells).toHaveLength(2)
    expect(spells[0]).toMatchObject({
      id: 'pf2ru-101',
      name: 'Фокусная искра',
      englishName: 'Focus Spark',
      tradition: ['arcane'],
      castTime: '2',
      isFocus: true
    })
    expect(spells[1]).toMatchObject({
      id: 'pf2ru-202',
      name: 'Огненный шар',
      englishName: 'Fireball',
      level: 3,
      tradition: ['arcane', 'primal'],
      range: '500 футов',
      area: '20-футовый взрыв',
      isFocus: false
    })
  })

  it('extracts localized detail fields and description from HTML', () => {
    const fixture = new JSDOM(fixtureHtml).window.document
    const details = parsePf2ruDetail(
      fixture.querySelector('#detail-ru')?.innerHTML || '',
      new JSDOM('').window.document
    )

    expect(details).toMatchObject({
      range: '500 футов',
      area: '20-футовый взрыв',
      duration: 'мгновенная',
      description: 'Вы создаёте огненный взрыв.'
    })
  })

  it('splits description from duration when the Russian detail has no hr', () => {
    const fixture = new JSDOM(fixtureHtml).window.document
    const details = parsePf2ruDetail(
      fixture.querySelector('#detail-ru-without-divider')?.innerHTML || '',
      new JSDOM('').window.document
    )

    expect(details.duration).toBe('1 минута')
    expect(details.description).toBe('Светильник показывает живым путь к смерти. Вторая строка описания.')
  })

  it('keeps source variants together for the same English spell name', () => {
    const pf2ruSpell = parsePf2ru(fixtureHtml)[1]
    pf2ruSpell.description = 'Русское описание источника pf2.ru.'
    pf2ruSpell.englishDescription = 'English description from pf2.ru.'
    const officialVariant = {
      ...pf2ruSpell,
      id: 'aonprd-fireball',
      name: 'Fireball',
      source: 'aonprd',
      sourceTitle: 'Player Core',
      description: 'Official source description.',
      englishDescription: 'Official source description.'
    }
    const [merged] = mergeSpells([pf2ruSpell, officialVariant])

    expect(merged.name).toEqual({ ru: 'Огненный шар', en: 'Fireball' })
    expect(merged.source.map(variant => variant.source.name)).toEqual([
      'pf2.ru: Основная книга игрока',
      'Archives of Nethys: Player Core'
    ])
    expect(merged.description.ru).toBe('Русское описание источника pf2.ru.')
    expect(merged.description.en).toBe('Official source description.')
    expect(merged.source.map(variant => variant.description)).toEqual([
      'Русское описание источника pf2.ru.',
      'Official source description.'
    ])
  })
})

describe('readthedocs spell parser', () => {
  const magicMissileHtml = `
    <section class="spell" id="magic-missile-1">
      <span id="spell-m-magic-missile"></span>
      <h1>Магический снаряд (<a class="reference external" href="https://2e.aonprd.com/Spells.aspx?ID=180">Magic Missile</a>) / Закл. 1<a class="headerlink" href="#magic-missile-1">¶</a></h1>
      <ul class="simple">
        <li><p>эвокация</p></li>
        <li><p>сила</p></li>
      </ul>
      <p><strong>Обычай</strong>: арканный, оккультный</p>
      <p><strong>Сотворение</strong>: от <img alt="одиночное действие" class="action action-1" src="../../_images/PF_action_1.png" style="height: 1em;" /> до <img alt="активность из 3-х действий" class="action action-3" src="../../_images/PF_action_3.png" style="height: 1em;" /> (жестовый, словесный)</p>
      <p><strong>Дистанция</strong>: 120 футов</p>
      <p><strong>Цели</strong>: 1 существо</p>
      <hr class="docutils" />
      <p>Вы посылаете дротик силы, летящий в существо.</p>
      <hr class="docutils" />
      <p><strong>Усиление (+2)</strong>: Вы выпускаете 1 дополнительный снаряд.</p>
    </section>
  `

  it('parses readthedocs spell section: name, english name, level, AoN ID', () => {
    const spell = parseReadthedocsSpell(magicMissileHtml)

    expect(spell).toBeDefined()
    expect(spell?.name).toBe('Магический снаряд')
    expect(spell?.englishName).toBe('Magic Missile')
    expect(spell?.level).toBe(1)
    expect(spell?.id).toContain('readthedocs-magic-missile')
    expect(spell?.sourceUrl).toBe('https://2e.aonprd.com/Spells.aspx?ID=180')
  })

  it('parses readthedocs traits from ul.simple', () => {
    const spell = parseReadthedocsSpell(magicMissileHtml)

    expect(spell?.traits).toContain('Evocation')
    expect(spell?.traits).toContain('Force')
  })

  it('parses readthedocs traditions from Обычай field', () => {
    const spell = parseReadthedocsSpell(magicMissileHtml)

    expect(spell?.tradition).toContain('arcane')
    expect(spell?.tradition).toContain('occult')
  })

  it('parses readthedocs school', () => {
    const spell = parseReadthedocsSpell(magicMissileHtml)

    expect(spell?.school).toBe('Evocation')
  })

  it('parses readthedocs cast time and components from Сотворение', () => {
    const spell = parseReadthedocsSpell(magicMissileHtml)

    expect(spell?.castTime).toBe('single action or three actions')
    expect(spell?.components).toEqual({ v: true, s: true, m: false, f: false })
  })

  it('parses readthedocs range, target, area, duration, save', () => {
    const spell = parseReadthedocsSpell(magicMissileHtml)

    expect(spell?.range).toBe('120 футов')
    expect(spell?.target).toBe('1 существо')
    expect(spell?.area).toBe('')
    expect(spell?.duration).toBe('')
    expect(spell?.save).toBe('')
  })

  it('parses readthedocs description between hr tags', () => {
    const spell = parseReadthedocsSpell(magicMissileHtml)

    expect(spell?.description).toBe('Вы посылаете дротик силы, летящий в существо.')
  })

  it('parses readthedocs heightened after last hr', () => {
    const spell = parseReadthedocsSpell(magicMissileHtml)

    expect(spell?.heightened).toEqual([
      { level: 3, description: 'Вы выпускаете 1 дополнительный снаряд.' },
      { level: 5, description: 'Вы выпускаете 1 дополнительный снаряд.' },
      { level: 7, description: 'Вы выпускаете 1 дополнительный снаряд.' },
      { level: 9, description: 'Вы выпускаете 1 дополнительный снаряд.' }
    ])
  })

  it('returns undefined when no spell section found', () => {
    expect(parseReadthedocsSpell('<html><body>No spell here</body></html>')).toBeUndefined()
  })

  it('returns undefined when h1 does not match expected format', () => {
    const badHtml = `
      <section class="spell">
        <h1>Bad format without parentheses</h1>
      </section>
    `
    expect(parseReadthedocsSpell(badHtml)).toBeUndefined()
  })
})