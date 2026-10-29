import { z } from 'zod'

export const AlchemicalSourceSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  type: z.enum(['aonprd', 'pf2e-ru-translation', 'pf2ru'])
})

export const AlchemicalVariantSchema = z.object({
  level: z.number().int().min(0).max(20),
  name: z.string(),
  price: z.string().optional(),
  description: z.string().optional(),
  source: AlchemicalSourceSchema
})

export const AlchemicalItemSchema = z.object({
  id: z.string(),
  name: z.object({
    ru: z.string(),
    en: z.string()
  }),
  category: z.enum(['bomb', 'elixir', 'poison', 'tool', 'consumable', 'other']),
  traits: z.array(z.string()).default([]),
  descriptionHtml: z.string().optional(),
  variants: z.array(AlchemicalVariantSchema),
  rarity: z.enum(['common', 'uncommon', 'rare', 'unique']).default('common')
})

export type AlchemicalItem = z.infer<typeof AlchemicalItemSchema>
export type AlchemicalSource = z.infer<typeof AlchemicalSourceSchema>
export type AlchemicalVariant = z.infer<typeof AlchemicalVariantSchema>
