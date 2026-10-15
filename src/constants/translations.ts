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

export function componentInitial(component: string): string {
  const labels: Record<string, string> = {
    V: 'С',
    S: 'Ж',
    M: 'М',
    F: 'Ф'
  }
  return labels[component] || component
}
