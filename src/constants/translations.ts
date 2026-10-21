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
  classes: 'Класс',
  traits: 'Черта',
  components: 'Компонент',
  rarity: 'Редкость',
  source: 'Источник',
  actions: 'Действия',
  searchQuery: 'Поиск'
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
  reaction: 'Реакция'
}

const ACTION_BASE_COUNTS: Record<string, number> = {
  'single action': 1,
  'two actions': 2,
  'three actions': 3
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

  const numeric = value.match(/^(\d+)$/)
  if (numeric) {
    const amount = Number(numeric[1])
    const label = countLabel(amount)
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
