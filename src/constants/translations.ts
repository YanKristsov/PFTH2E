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

export function filterLabel(key: string): string {
  return FILTER_LABELS[key] || key
}
