/**
 * Onboarding validation schemas
 * Server-side validation using Zod
 */

import { z } from 'zod'

/**
 * Handle validation schema
 */
export const handleSchema = z
  .string()
  .min(3, 'Handle must be at least 3 characters')
  .max(20, 'Handle must be 20 characters or less')
  .regex(/^[a-z0-9_]+$/, 'Handle can only contain lowercase letters, numbers, and underscores')
  .transform(val => val.toLowerCase().trim())

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be 100 characters or less')
  .trim()

/**
 * Startup name validation schema
 */
export const startupNameSchema = z
  .string()
  .min(1, 'Startup name is required')
  .max(100, 'Startup name must be 100 characters or less')
  .trim()

/**
 * Tagline validation schema
 */
export const taglineSchema = z
  .string()
  .max(200, 'Tagline must be 200 characters or less')
  .trim()
  .optional()
  .nullable()

/**
 * City validation schema
 */
export const citySchema = z
  .string()
  .max(100, 'City must be 100 characters or less')
  .trim()
  .optional()
  .nullable()

/**
 * URL validation schema
 */
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .max(2048, 'URL must be 2048 characters or less')
  .optional()
  .nullable()
  .or(z.literal(''))

/**
 * Startup stage validation schema
 */
export const startupStageSchema = z.enum(['idea', 'mvp', 'launched', 'revenue', 'scaling'])

/**
 * Visibility mode validation schema
 */
export const visibilitySchema = z.enum(['public', 'community', 'investor'])

/**
 * Complete onboarding validation schema
 */
export const onboardingCompleteSchema = z.object({
  handle: handleSchema,
  name: nameSchema,
  startupName: startupNameSchema,
  startupStage: startupStageSchema.optional().nullable(),
  city: citySchema,
  tagline: taglineSchema,
  websiteUrl: urlSchema,
  linkedinUrl: urlSchema,
  profilePictureUrl: urlSchema,
  startupLogoUrl: urlSchema,
  defaultVisibility: visibilitySchema.default('public'),
})

export type OnboardingCompleteInput = z.infer<typeof onboardingCompleteSchema>
