import { z } from 'zod'

export const SpellSourceSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  type: z.enum(['aonprd', 'pf2e-ru-translation', 'pf2ru'])
})

export const SpellComponentSchema = z.object({
  v: z.boolean().default(false),
  s: z.boolean().default(false),
  m: z.boolean().default(false),
  f: z.boolean().default(false)
})

export const SpellHeightenedSchema = z.object({
  level: z.number().int().positive(),
  description: z.string()
})

export const SpellVariantSchema = z.object({
  source: SpellSourceSchema,
  name: z.string(),
  description: z.string(),
  descriptionEn: z.string().optional(),
  heightened: z.array(SpellHeightenedSchema).optional()
})

export const SpellSchema = z.object({
  id: z.string(),
  name: z.object({
    ru: z.string(),
    en: z.string()
  }),
  level: z.number().int().min(0).max(10),
  tradition: z.array(z.enum(['arcane', 'divine', 'occult', 'primal'])),
  school: z.string(),
  classes: z.array(z.string()),
  traits: z.array(z.string()),
  components: SpellComponentSchema,
  castTime: z.string(),
  range: z.string(),
  target: z.string().optional(),
  area: z.string().optional(),
  duration: z.string(),
  save: z.string().optional(),
  sr: z.boolean().optional(),
  description: z.object({
    ru: z.string(),
    en: z.string()
  }),
  heightened: z.array(SpellHeightenedSchema).optional(),
  source: z.array(SpellVariantSchema),
  rarity: z.enum(['common', 'uncommon', 'rare', 'unique']).default('common'),
  isRitual: z.boolean().default(false),
  isFocus: z.boolean().default(false)
})

export type Spell = z.infer<typeof SpellSchema>
export type SpellSource = z.infer<typeof SpellSourceSchema>
export type SpellVariant = z.infer<typeof SpellVariantSchema>
export type SpellHeightened = z.infer<typeof SpellHeightenedSchema>
export type SpellComponent = z.infer<typeof SpellComponentSchema>

export const SpellsIndexSchema = z.object({
  id: z.string(),
  nameRu: z.string(),
  nameEn: z.string(),
  level: z.number().int().min(0).max(10),
  tradition: z.array(z.enum(['arcane', 'divine', 'occult', 'primal'])),
  school: z.string(),
  classes: z.array(z.string()),
  traits: z.array(z.string()),
  rarity: z.enum(['common', 'uncommon', 'rare', 'unique'])
})

export type SpellIndex = z.infer<typeof SpellsIndexSchema>

export const FilterStateSchema = z.object({
  level: z.array(z.number().int().min(0).max(10)).default([]),
  tradition: z.array(z.enum(['arcane', 'divine', 'occult', 'primal'])).default([]),
  school: z.array(z.string()).default([]),
  class: z.array(z.string()).default([]),
  traits: z.array(z.string()).default([]),
  components: z.array(z.enum(['V', 'S', 'M', 'F'])).default([]),
  source: z.array(z.string()).default([]),
  rarity: z.array(z.enum(['common', 'uncommon', 'rare', 'unique'])).default([]),
  searchQuery: z.string().default('')
})

export type FilterState = z.infer<typeof FilterStateSchema>

export const UserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.enum(['ru', 'en']).default('ru'),
  viewMode: z.enum(['table', 'cards']).default('table'),
  tableColumns: z.array(z.string()).default(['name', 'level', 'tradition', 'school', 'classes'])
})

export type UserSettings = z.infer<typeof UserSettingsSchema>

export const FavoriteSpellSchema = z.object({
  spellId: z.string(),
  notes: z.string().default(''),
  addedAt: z.number().default(() => Date.now())
})

export type FavoriteSpell = z.infer<typeof FavoriteSpellSchema>

export const ViewHistorySchema = z.object({
  spellId: z.string(),
  viewedAt: z.number().default(() => Date.now())
})

export type ViewHistory = z.infer<typeof ViewHistorySchema>