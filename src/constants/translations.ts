export const TRADITION_LABELS: Record<string, string> = {
  arcane: 'Арканная',
  divine: 'Сакральная',
  occult: 'Окультая',
  primal: 'Первобытная'
}

export const RARITY_LABELS: Record<string, string> = {
  common: 'Обычное',
  uncommon: 'Необычное',
  rare: 'Редкое',
  unique: 'Уникальное'
}

export const SCHOOL_LABELS: Record<string, string> = {
  abjuration: 'Преграждение',
  conjuration: 'Призыв',
  divination: 'Прорицание',
  enchantment: 'Очарование',
  evocation: 'Эвокация',
  illusion: 'Иллюзия',
  necromancy: 'Некромантия',
  transmutation: 'Превращение',
  Unknown: 'Неизвестно'
}

export const COMPONENT_LABELS: Record<string, string> = {
  V: 'Словесный',
  S: 'Жестовый',
  M: 'Материальный',
  F: 'Фокусный'
}

export const TRAIT_LABELS: Record<string, string> = {
  Abjuration: 'Преграждение',
  Acid: 'Кислота',
  Air: 'Воздух',
  Animist: 'Анимист',
  Archetype: 'Архетип',
  Arcane: 'Арканный',
  Attack: 'Атака',
  Auditory: 'Слух',
  Aura: 'Аура',
  Bard: 'Бард',
  Beast: 'Зверь',
  Cantrip: 'Заговор',
  Champion: 'Поборник',
  Chaotic: 'Хаос',
  Cleric: 'Жрец',
  Cold: 'Холод',
  Composition: 'Композиция',
  Concentrate: 'Концентрация',
  Conjuration: 'Призыв',
  Consecration: 'Освящение',
  Contingency: 'Непредвиденные обстоятельства',
  Curse: 'Проклятие',
  Cursebound: 'Проклятый',
  Darkness: 'Тьма',
  Death: 'Смерть',
  Detection: 'Обнаружение',
  Disease: 'Болезнь',
  Divination: 'Прорицание',
  Dream: 'Сон',
  Druid: 'Друид',
  Earth: 'Земля',
  Eidolon: 'Эйдолон',
  Electricity: 'Электричество',
  Emotion: 'Эмоции',
  Enchantment: 'Очарование',
  Evil: 'Зло',
  Evocation: 'Эвокация',
  Exploration: 'Исследование',
  Extradimensional: 'Межпространственный',
  Fear: 'Ужас',
  Fire: 'Огонь',
  Flourish: 'Всплеск',
  Focus: 'Фокус',
  Force: 'Сила',
  Fortune: 'Удача',
  Fungus: 'Гриб',
  Good: 'Добро',
  Healing: 'Исцеление',
  Hex: 'Наговор',
  Holy: 'Священный',
  Illusion: 'Иллюзия',
  Impossible: 'Невероятная',
  Incapacitation: 'Несмертельное',
  Inhaled: 'Вдыхаемый',
  Incarnate: 'Воплощение',
  Lawful: 'Закон',
  Light: 'Свет',
  Linguistic: 'Язык',
  Litany: 'Молитва',
  Magus: 'Магус',
  Manipulate: 'Манипуляция',
  Mental: 'Ментальный',
  Metal: 'Металл',
  Metamagic: 'Метамагия',
  Misfortune: 'Неудача',
  Monk: 'Монах',
  Morph: 'Превращение',
  Move: 'Движение',
  Mythic: 'Мифический',
  Necromancer: 'Некромант',
  Necromancy: 'Некромантия',
  Negative: 'Негативный',
  Nonlethal: 'Несмертельное',
  Olfactory: 'Обоняние',
  Oracle: 'Оракул',
  Plant: 'Растение',
  Poison: 'Яд',
  Polymorph: 'Полиморф',
  Positive: 'Позитивный',
  Possession: 'Вселение',
  Prediction: 'Предсказание',
  Primal: 'Первобытный',
  Psychic: 'Экстрасенс',
  Ranger: 'Следопыт',
  Rare: 'Редкий',
  Revelation: 'Разоблачение',
  Sanctified: 'Освящённый',
  Scrying: 'Тайновидение',
  Secret: 'Тайна',
  Shadow: 'Тень',
  Sleep: 'Сон',
  Sonic: 'Звук',
  Sorcerer: 'Чародей',
  Spellshape: 'Форма заклинания',
  Spirit: 'Дух',
  Stance: 'Стойка',
  Structure: 'Строение',
  Subtle: 'Незаметное',
  Summon: 'Призыв',
  Summoner: 'Призыватель',
  Teleportation: 'Телепортация',
  Thrall: 'Раб',
  Transmutation: 'Превращение',
  Trial: 'Испытание',
  'True Name': 'Истинное имя',
  Uncommon: 'Необычный',
  Unholy: 'Нечестивый',
  Unique: 'Уникальный',
  Visual: 'Зрение',
  Vitality: 'Жизнь',
  Void: 'Пустота',
  Water: 'Вода',
  Witch: 'Ведьма',
  Wizard: 'Волшебник',
  Wood: 'Дерево'
}

export const FILTER_LABELS: Record<string, string> = {
  level: 'Уровень',
  tradition: 'Традиция',
  school: 'Школа',
  class: 'Класс',
  traits: 'Черта',
  components: 'Компонент',
  rarity: 'Редкость',
  source: 'Источник',
  actions: 'Время сотворения',
  searchQuery: 'Поиск'
}

/**
 * Русские названия классов. Источник — страницы классов pf2.ru
 * (https://pf2.ru/classes/<slug>), официальный перевод CRB на readthedocs
 * используется для сверки: у 4 классов переводы расходятся
 * (Champion Поборник/Чемпион, Investigator Следователь/Сыщик,
 * Magus Колдун/Магус, Ranger Следопыт/Рейнджер) — приоритет у pf2.ru.
 */
export const CLASS_LABELS: Record<string, string> = {
  Alchemist: 'Алхимик',
  Animist: 'Анимист',
  Barbarian: 'Варвар',
  Bard: 'Бард',
  Champion: 'Поборник',
  Cleric: 'Жрец',
  Commander: 'Командор',
  Druid: 'Друид',
  Exemplar: 'Экземплар',
  Fighter: 'Воин',
  Guardian: 'Защитник',
  Gunslinger: 'Стрелок',
  Inventor: 'Изобретатель',
  Investigator: 'Следователь',
  Kineticist: 'Кинетик',
  Magus: 'Колдун',
  Monk: 'Монах',
  Necromancer: 'Некромант',
  Oracle: 'Оракул',
  Psychic: 'Экстрасенс',
  Ranger: 'Следопыт',
  Rogue: 'Плут',
  Runesmith: 'Рунотворец',
  Sorcerer: 'Чародей',
  Summoner: 'Призыватель',
  Swashbuckler: 'Сорвиголова',
  Thaumaturge: 'Тауматург',
  Witch: 'Ведьма',
  Wizard: 'Волшебник'
}

/** Псевдокласс для заклинаний, не привязанных ни к одному классу. */
export const GENERIC_CLASS = '__generic__'

export const GENERIC_CLASS_LABEL = 'Общее заклинание'

export function classLabel(className: string): string {
  if (className === GENERIC_CLASS) return GENERIC_CLASS_LABEL
  return CLASS_LABELS[className] || className
}

export function componentInitial(component: string): string {
  const labels: Record<string, string> = {
    V: 'С',
    S: 'Ж',
    M: 'М',
    F: 'Ф'
  }
  return labels[component] || component
}

export function traitLabel(trait: string): string {
  return TRAIT_LABELS[trait] || trait
}

export function traditionLabel(tradition: string): string {
  return TRADITION_LABELS[tradition] || tradition
}

export function schoolLabel(school: string): string {
  return SCHOOL_LABELS[school] || school
}

export function rarityLabel(rarity: string): string {
  return RARITY_LABELS[rarity] || rarity
}

const ACTION_BASE_LABELS: Record<string, string> = {
  'single action': '1 действие',
  'two actions': '2 действия',
  'three actions': '3 действия',
  'free action': 'Свободное действие',
  reaction: 'Реакция',
  '1 действие': '1 действие',
  '2 действия': '2 действия',
  '3 действия': '3 действия',
  'свободное действие': 'Свободное действие',
  'свободное': 'Свободное действие',
  'реакция': 'Реакция',
  '3: реагент, жестовый, словесный': '3 действия',
  '3: материальный, жестовой, вербальный': '3 действия',
  '1: словесный': '1 действие',
  '2: жестовый, словесный': '2 действия',
  '4 действия': '4 действия',
  '5 действий': '5 действий'
}

const ACTION_BASE_COUNTS: Record<string, number> = {
  'single action': 1,
  'two actions': 2,
  'three actions': 3,
  '1 действие': 1,
  '2 действия': 2,
  '3 действия': 3,
  '3: реагент, жестовый, словесный': 3,
  '3: материальный, жестовой, вербальный': 3,
  '1: словесный': 1,
  '2: жестовый, словесный': 2
}

interface ActionIconFile {
  file: string
  width: number
  height: number
}

export interface ActionIconInfo {
  file: string
  width: number
  height: number
  alt: string
  src: string
}

/** Сегмент ячейки «Действия»: иконка, текстовая подпись или разделитель. */
export interface ActionSegment {
  kind: 'icon' | 'text' | 'sep'
  icon?: ActionIconInfo
  text?: string
}

export interface ActionDisplay {
  label: string
  segments: ActionSegment[]
}

const ACTION_ICON_BY_COUNT: Record<number, ActionIconFile> = {
  1: { file: 'PF_action_1.webp', width: 176, height: 176 },
  2: { file: 'PF_action_2.webp', width: 277, height: 176 },
  3: { file: 'PF_action_3.webp', width: 367, height: 177 }
}

const ACTION_ICON_FREE: ActionIconFile = { file: 'PF_action_free.webp', width: 178, height: 178 }
const ACTION_ICON_REACTION: ActionIconFile = {
  file: 'PF_action_reaction.png',
  width: 256,
  height: 222
}

const DURATION_FORMS: Record<string, [string, string, string]> = {
  minute: ['минута', 'минуты', 'минут'],
  min: ['минута', 'минуты', 'минут'],
  hour: ['час', 'часа', 'часов'],
  day: ['день', 'дня', 'дней'],
  week: ['неделя', 'недели', 'недель'],
  round: ['раунд', 'раунда', 'раундов']
}

const DURATION_MINUTES: Record<string, number> = {
  minute: 1,
  min: 1,
  hour: 60,
  day: 1440,
  week: 10080,
  round: 1
}

function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

interface ActionPart {
  count?: number
  label: string
  order: number
  segments: ActionSegment[]
}

function durationLabel(part: string): string | null {
  const match = part.match(/^(\d+)\s*([a-z]+)$/)
  if (!match) return null
  const amount = Number(match[1])
  const unit = match[2]
  const forms = DURATION_FORMS[unit] || DURATION_FORMS[unit.replace(/s$/, '')]
  if (!forms) return null
  return `${amount} ${plural(amount, ...forms)}`
}

function durationMinutes(part: string): number | null {
  const match = part.match(/^(\d+)\s*([a-z]+)$/)
  if (!match) return null
  const amount = Number(match[1])
  const unit = match[2]
  const perUnit = DURATION_MINUTES[unit] || DURATION_MINUTES[unit.replace(/s$/, '')]
  if (!perUnit) return null
  return amount * perUnit
}

function countLabel(count: number): string {
  return `${count} ${plural(count, 'действие', 'действия', 'действий')}`
}

function iconSegment(file: ActionIconFile, alt: string): ActionSegment {
  return {
    kind: 'icon',
    icon: {
      file: file.file,
      width: file.width,
      height: file.height,
      alt,
      src: `${import.meta.env.BASE_URL}art/${file.file}`
    }
  }
}

function textSegment(text: string): ActionSegment {
  return { kind: 'text', text }
}

function sepSegment(text: string): ActionSegment {
  return { kind: 'sep', text }
}

function actionBase(part: string): ActionPart | null {
  const value = part.trim().toLowerCase()
  if (ACTION_BASE_LABELS[value]) {
    const label = ACTION_BASE_LABELS[value]
    const count = ACTION_BASE_COUNTS[value]
    const order = value === 'free action' ? 4 : value === 'reaction' ? 5 : count ?? 6
    if (count !== undefined) {
      // 1/2/3 действия — количество показывают стрелки на иконке
      return {
        count,
        label,
        order,
        segments: [iconSegment(ACTION_ICON_BY_COUNT[count], label)]
      }
    }
    if (value === 'free action') {
      // иконка неоднозначна — подпись остаётся
      return {
        label,
        order,
        segments: [iconSegment(ACTION_ICON_FREE, label), textSegment(label)]
      }
    }
    // реакция — только иконка
    return { label, order, segments: [iconSegment(ACTION_ICON_REACTION, label)] }
  }
  const duration = durationLabel(value)
  if (duration) {
    const minutes = durationMinutes(value) ?? 0
    return { label: duration, order: 6 + minutes / 100000, segments: [textSegment(duration)] }
  }
  return null
}

interface ParsedActions {
  label: string
  order: number
  segments: ActionSegment[]
}

function parseActions(castTime: string): ParsedActions {
  const raw = (castTime || '').trim()
  if (!raw) return { label: '—', order: 9, segments: [textSegment('—')] }
  const value = raw.toLowerCase()

  if (value === '2 действия до 2 раундов') {
    return {
      label: raw,
      order: 2,
      segments: [textSegment('от '), iconSegment(ACTION_ICON_BY_COUNT[2], '2 действия'), textSegment(' до 2-х раундов')]
    }
  }
  if (value === '2: соматический, вербальный') {
    return { label: raw, order: 2, segments: [iconSegment(ACTION_ICON_BY_COUNT[2], '2 действия')] }
  }
  if (value === '5: словесный') {
    return { label: raw, order: 5, segments: [iconSegment(ACTION_ICON_REACTION, 'Реакция')] }
  }
  if (value === '1 - 2') {
    return {
      label: raw,
      order: 2,
      segments: [iconSegment(ACTION_ICON_BY_COUNT[1], '1 действие'), sepSegment('–'), iconSegment(ACTION_ICON_BY_COUNT[2], '2 действия')]
    }
  }
  if (value === '2: словесный, жестовый' || value === '2: словестный, жестовый') {
    return { label: raw, order: 2, segments: [iconSegment(ACTION_ICON_BY_COUNT[2], '2 действия')] }
  }

  if (value === '1: жестовый') {
    return { label: raw, order: 1, segments: [iconSegment(ACTION_ICON_BY_COUNT[1], '1 действие')] }
  }
  if (value === 'от 1 до 3 (словесный, жестовый):' || value === '1 - 3') {
    return {
      label: raw,
      order: 3,
      segments: [iconSegment(ACTION_ICON_BY_COUNT[1], '1 действие'), sepSegment('–'), iconSegment(ACTION_ICON_BY_COUNT[3], '3 действия')]
    }
  }
  if (value === 'от 1 до 2:') {
    return {
      label: raw,
      order: 2,
      segments: [iconSegment(ACTION_ICON_BY_COUNT[1], '1 действие'), sepSegment('–'), iconSegment(ACTION_ICON_BY_COUNT[2], '2 действия')]
    }
  }
  if (value === 'от 1 до 3:') {
    return {
      label: raw,
      order: 3,
      segments: [iconSegment(ACTION_ICON_BY_COUNT[1], '1 действие'), sepSegment('–'), iconSegment(ACTION_ICON_BY_COUNT[2], '2 действия')]
    }
  }
  if (value === '1 / 2') {
    return {
      label: raw,
      order: 2,
      segments: [iconSegment(ACTION_ICON_BY_COUNT[1], '1 действие'), sepSegment('или'), iconSegment(ACTION_ICON_FREE, 'Свободное действие')]
    }
  }
  if (value === 'реакция или 1 действие') {
    return {
      label: raw,
      order: 5,
      segments: [iconSegment(ACTION_ICON_REACTION, 'Реакция'), sepSegment('или'), iconSegment(ACTION_ICON_BY_COUNT[1], '1 действие')]
    }
  }
  if (value === '2 или 3:') {
    return {
      label: raw,
      order: 3,
      segments: [iconSegment(ACTION_ICON_BY_COUNT[2], '2 действия'), sepSegment('или'), iconSegment(ACTION_ICON_BY_COUNT[3], '3 действия')]
    }
  }

  const numeric = value.match(/^(\d+)$/)
  if (numeric) {
    const amount = Number(numeric[1])
    const label = countLabel(amount)
    if (amount === 4) {
      return { label, order: 4, segments: [iconSegment(ACTION_ICON_FREE, label)] }
    }
    if (amount === 5) {
      return { label, order: 5, segments: [iconSegment(ACTION_ICON_REACTION, label)] }
    }
    const icon = ACTION_ICON_BY_COUNT[amount]
    return {
      label,
      order: amount,
      segments: [icon ? iconSegment(icon, label) : textSegment(label)]
    }
  }

  const parts = value.split(/\s+(to|or)\s+/)
  if (parts.length === 3) {
    const left = actionBase(parts[0])
    const right = actionBase(parts[2])
    if (left && right) {
      if (parts[1] === 'or') {
        if (left.segments.some(s => s.kind === 'icon') && right.segments.some(s => s.kind === 'icon')) {
          return {
            label: `${left.label} или ${right.label}`,
            order: Math.max(left.order, right.order),
            segments: [...left.segments, sepSegment('или'), ...right.segments]
          }
        }
        const label = `${left.label} или ${right.label}`
        return { label, order: Math.max(left.order, right.order), segments: [textSegment(label)] }
      }
      if (left.count !== undefined && right.count !== undefined) {
        const min = Math.min(left.count, right.count)
        const max = Math.max(left.count, right.count)
        const label = `${min}–${max} ${plural(max, 'действие', 'действия', 'действий')}`
        // диапазон: иконка минимума, тире, иконка максимума
        return {
          label,
          order: max,
          segments: [
            iconSegment(ACTION_ICON_BY_COUNT[min], countLabel(min)),
            sepSegment('–'),
            iconSegment(ACTION_ICON_BY_COUNT[max], countLabel(max))
          ]
        }
      }
      if (left.count !== undefined) {
        return { label: left.label, order: left.order, segments: left.segments }
      }
      return { label: left.label, order: left.order, segments: left.segments }
    }
  }

  const base = actionBase(value)
  if (base) return { label: base.label, order: base.order, segments: base.segments }
  return { label: raw, order: 7, segments: [textSegment(raw)] }
}

export function actionLabel(castTime: string): string {
  return parseActions(castTime).label
}

/**
 * Что показывать в ячейке «Действия»: текстовая подпись и последовательность сегментов
 * (иконки и разделители). Иконки выводятся вместо текста там, где они однозначны:
 * 1/2/3 действия, реакция, диапазон «1–3 действия» (иконка 1, тире, иконка 3).
 */
export function actionDisplay(castTime: string): ActionDisplay {
  const parsed = parseActions(castTime)
  return { label: parsed.label, segments: parsed.segments }
}

export function actionOrder(castTime: string): number {
  return parseActions(castTime).order
}

export function filterLabel(key: string): string {
  return FILTER_LABELS[key] || key
}

/** Английские значения времени произнесения → русские (fallback, когда нет данных pf2.ru). */
export const CAST_TIME_LABELS: Record<string, string> = {
  '1': '1 действие',
  '2': '2 действия',
  '3': '3 действия',
  'one action': '1 действие',
  'two actions': '2 действия',
  'three actions': '3 действия',
  reaction: 'Реакция',
  'free action': 'Свободное действие',
  '1 minute': '1 минута',
  '1 round': '1 раунд',
  '10 minutes': '10 минут',
  '1 hour': '1 час',
  '1 day': '1 день',
  '2 hours': '2 часа',
  '3 hours': '3 часа',
  '4 hours': '4 часа',
  '8 hours': '8 часов',
  '30 minutes': '30 минут',
  '2 days': '2 дня',
  '3 days': '3 дня',
  '4 days': '4 дня',
  '5 days': '5 дней',
  '6 days': '6 дней',
  '7 days': '7 дней',
  '9 days': '9 дней',
  '14 days': '14 дней',
  '24 hours': '24 часа',
  '4d12 hours': '4к12 часов',
  'two actions to 2 rounds': '2 действия до 2 раундов',
  'reaction or single action': 'Реакция или 1 действие',
  '1 day ': '1 день',
  'until dispelled': 'до рассеивания',
  instantaneous: 'мгновенно'
}

/** Английские значения дистанции → русские (fallback). */
export const RANGE_LABELS: Record<string, string> = {
  touch: 'Касание',
  '5 feet': '5 футов',
  '10 feet': '10 футов',
  '15 feet': '15 футов',
  '20 feet': '20 футов',
  '25 feet': '25 футов',
  '30 feet': '30 футов',
  '40 feet': '40 футов',
  '50 feet': '50 футов',
  '60 feet': '60 футов',
  '100 feet': '100 футов',
  '120 feet': '120 футов',
  '240 feet': '240 футов',
  '250 feet': '250 футов',
  '500 feet': '500 футов',
  '1,000 feet': '1000 футов',
  '90 feet': '90 футов',
  '1 mile': '1 миля',
  '5 miles': '5 миль',
  '10 miles': '10 миль',
  '100 miles': '100 миль',
  '1,000 miles': '1000 миль',
  '30-foot': '30-футовый'
}

/** Английские значения цели → русские (fallback). */
export const TARGET_LABELS: Record<string, string> = {
  '1 creature': '1 существо',
  '1 willing creature': '1 согласившееся существо',
  '1 object': '1 объект',
  'the triggering creature': 'существо, desencadeвшее',
  'up to 10 creatures': 'до 10 существ',
  '2 существа или объектаobjects': '2 существа или объекта'
}

/** Английские значения области → русские (fallback). */
export const AREA_LABELS: Record<string, string> = {
  '15-foot burst': '15-футовый взрыв',
  '20-foot burst': '20-футовый взрыв',
  '30-foot cone': '30-футовый конус',
  '5-foot emanation': '5-футовая эманация',
  '10-foot emanation': '10-футовая эманация',
  '15-foot cone': '15-футовый конус',
  '5-foot cube': 'куб 5 футов',
  '20-foot emanation': '20-футовая эманация',
  '30-foot line': '30-футовая линия',
  '10-foot burst': '10-футовый взрыв',
  '60-foot emanation': '60-футовая эманация',
  '40-foot burst': '40-футовый взрыв',
  '20-foot cone': '20-футовый конус',
  '30-foot emanation': '30-футовая эманация',
  '40-foot-radius burst': 'взрыв радиусом 40 футов',
  '30-foot-radius emanation': 'эманация радиусом 30 футов',
  '1,000-foot radius': 'радиус 1000 футов',
  '30-foot-radius emanation centered on you': 'эманация радиусом 30 футов с центром на вас',
  '40-foot burst centered on you': '40-футовый взрыв с центром на вас',
  '120-foot line': '120-футовая линия',
  '500-foot radius centered on you': 'радиус 500 футов с центром на вас',
  '30-foot burst': '30-футовый взрыв',
  '60-foot burst': '60-футовый взрыв',
  '1-mile burst': 'взрыв на 1 милю',
  '1-mile emanation': 'эманация на 1 милю',
  '120-foot emanation': '120-футовая эманация',
  '80-foot burst': '80-футовый взрыв',
  '150-foot burst': '150-футовый взрыв',
  '20-foot-radius burst': 'взрыв радиусом 20 футов',
  '5-foot emanation or more': '5-футовая эманация или более',
  'a 10-foot square': 'квадрат 10 футов',
  'a 5-foot square': 'квадрат 5 футов',
  '10-foot square': 'квадрат 10 футов',
  '20-foot взрыв': '20-футовый взрыв',
  '30-foot взрыв': '30-футовый взрыв',
  '10-foot взрыв': '10-футовый взрыв',
  '15-foot взрыв': '15-футовый взрыв',
  '250-foot взрыв': '250-футовый взрыв',
  '200-foot взрыв': '200-футовый взрыв',
  '30-foot конус': '30-футовый конус',
  '15-foot конус': '15-футовый конус',
  '10-foot эманация': '10-футовая эманация',
  '60-foot эманация': '60-футовая эманация',
  '30-foot эманация': '30-футовая эманация',
  '15-foot эманация': '15-футовая эманация',
  '5-foot burst or more': '5-футовая эманация или более',
  '1 5-foot cube': 'куб 5 футов',
  '40-футовый-radius burst around an immobile altar, shrine, or fixture of your deity': 'взрыв радиусом 40 футов вокруг неподвижного алтаря, святилища или атрибута вашего божества',
  'all squares in a 20-футовый burst': 'все квадраты в 20-футовом взрыве',
  'a horizontal earthen or sandy surface within a 20-футовый burst': 'горизонтальная земляная или песканая поверхность в 20-футовом взрыве',
  '15-футовый emanation': '15-футовая эманация',
  '100-футовый emanation from the building’s keystone': '100-футовая эманация от ключевого камня здания',
  '30-футовый emanation centered on you': '30-футовая эманация с центром на вас',
  '30-футовый burst centered on you': '30-футовый взрыв с центром на вас'
}

/** Английские значения длительности → русские (fallback). */
export const DURATION_LABELS: Record<string, string> = {
  '1 round': '1 раунд',
  '1 minute': '1 минута',
  '1 hour': '1 час',
  '1 day': '1 день',
  '2 days': '2 дня',
  '3 days': '3 дня',
  '4 days': '4 дня',
  '5 days': '5 дней',
  '7 days': '7 дней',
  '8 hours': '8 часов',
  '10 minutes': '10 минут',
  '24 hours': '24 часа',
  '14 days': '14 дней',
  'sustained up to 1 minute': 'поддерживается до 1 минуты',
  'sustained up to 5 rounds': 'поддерживается до 5 раундов',
  'sustained up to 10 minutes': 'поддерживается до 10 минут',
  'sustained for up to 1 minute': 'поддерживается до 1 минуты',
  'sustained (up to 1 minute)': 'поддерживается (до 1 минуты)',
  'sustained, up to 1 minute': 'поддерживается, до 1 минуты',
  'up to 10 minutes': 'до 10 минут',
  'up to 1 minute': 'до 1 минуты',
  '3 rounds': '3 раунда',
  '2 rounds': '2 раунда',
  '5 rounds': '5 раундов',
  '3 hours': '3 часа',
  '4 hours': '4 часа',
  '12 hours': '12 часов',
  '4 rounds': '4 раунда',
  'sustained': 'поддерживается',
  'поддерживается up to 1 minute': 'поддерживается до 1 минуты',
  '5 minutes': '5 минут',
  '7 hours': '7 часов',
  '1 hour or until expended': '1 час или до израсходования',
  '1 minute or until discharged': '1 минута или до израсходования',
  '4d12 hours': '4к12 часов',
  '24 hours (see text)': '24 часа (см. текст)',
  '1 round (см. текст)': '1 раунд (см. текст)',
  instantaneous: 'мгновенно',
  'until dispelled': 'до рассеивания'
}

/** Английские значения спасброска → русские (fallback). */
export const SAVE_LABELS: Record<string, string> = {
  reflex: 'Рефлекс',
  fortitude: 'Стойкость',
  will: 'Воля',
  'basic reflex': 'базовый Рефлекс',
  'basic fortitude': 'базовая Стойкость',
  'basic will': 'базовая Воля',
  'basic reflex and fortitude': 'базовый Рефлекс и Стойкость',
  'ac and basic reflex': 'КД и базовый Рефлекс',
  'ac and basic fortitude': 'КД и базовая Стойкость',
  'ac and basic reflex and fortitude (see text)': 'КД и базовый Рефлекс и Стойкость (см. текст)',
  'will and basic reflex (see text)': 'Воля и базовый Рефлекс (см. текст)',
  'reflex (see text)': 'Рефлекс (см. текст)',
  'basic reflex (see text)': 'базовый Рефлекс (см. текст)',
  'fortitude (see text)': 'Стойкость (см. текст)',
  'basic fortitude (see text)': 'базовая Стойкость (см. текст)',
  'basic fortitude, see text': 'базовая Стойкость (см. текст)',
  'fortitude or basic reflex (see text)': 'Стойкость или базовый Рефлекс (см. текст)',
  'ac and basic fortitude (see text)': 'КД и базовая Стойкость (см. текст)',
  'basic reflex and fortitude (see text)': 'базовый Рефлекс и Стойкость (см. текст)',
  'basic reflex or will (target\'s choice)': 'базовый Рефлекс или Воля (по выбору цели)',
  'basic reflex or will (target’s choice)': 'базовый Рефлекс или Воля (по выбору цели)'
}

/** Перевод английской характеристики заклинания на русский (fallback). */
/** Заменяет шаблоны AoN {{rules X "TYPE"}} и {{actions X "TYPE"}} на русские эквиваленты. */
function normalizeAoNTemplates(value: string): string {
  return value
    .replace(/\{\{rules \d+ "burst"\}\}/gi, 'взрыв')
    .replace(/\{\{rules \d+ "cone"\}\}/gi, 'конус')
    .replace(/\{\{rules \d+ "emanation"\}\}/gi, 'эманация')
    .replace(/\{\{rules \d+ "touch"\}\}/gi, 'касание')
    .replace(/\{\{actions \d+ "sustained"\}\}/gi, 'поддерживается')
    .replace(/\{\{[^}]*\}\}/g, '')
}

/** Переводит измерения и единицы типа "N-foot" → "N-футовый" в строках характеристик. */
function translateMeasurements(value: string): string {
  return value
    .replace(/(\d+)-foot/gi, '$1-футовый')
    .replace(/(\d+)-mile/gi, '$1-мильный')
    .replace(/ burst\b/gi, ' взрыв')
    .replace(/ emanation\b/gi, ' эманация')
    .replace(/ cone\b/gi, ' конус')
    .replace(/ line\b/gi, ' линия')
    .replace(/ radius\b/gi, ' радиус')
    .replace(/ centered on you\b/gi, ' с центром на вас')
    .replace(/ squares\b/gi, ' квадраты')
    .replace(/ square\b/gi, ' квадрат')
    .replace(/up to 1 minute/gi, 'до 1 минуты')
}

export function castTimeLabel(castTime: string): string {
  return CAST_TIME_LABELS[castTime.toLowerCase()] || translateMeasurements(castTime) || castTime
}

export function rangeLabel(range: string): string {
  const normalized = normalizeAoNTemplates(range)
  if (normalized !== range) return translateMeasurements(normalized) || normalized
  return RANGE_LABELS[range.toLowerCase()] || translateMeasurements(range) || range
}

export function targetLabel(target: string): string {
  return TARGET_LABELS[target.toLowerCase()] || translateMeasurements(target) || target
}

export function areaLabel(area: string): string {
  const normalized = normalizeAoNTemplates(area)
  if (normalized !== area) return translateMeasurements(normalized) || normalized
  return AREA_LABELS[area.toLowerCase()] || translateMeasurements(area) || area
}

export function durationValueLabel(duration: string): string {
  const normalized = normalizeAoNTemplates(duration)
  if (normalized !== duration) return translateMeasurements(normalized) || normalized
  return DURATION_LABELS[duration.toLowerCase()] || translateMeasurements(duration) || duration
}

export function saveLabel(save: string): string {
  return SAVE_LABELS[save.toLowerCase()] || translateMeasurements(save) || save
}
