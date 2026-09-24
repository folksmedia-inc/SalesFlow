import { z } from 'zod'

/** Reusable Zod field schemas with consistent, user-friendly messages. */

const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/

export const requiredText = (label: string, max = 100) =>
  z.string().trim().min(1, `${label} is required`).max(max, `Must be ${max} characters or fewer`)

export const optionalText = (max = 200) => z.string().trim().max(max, `Must be ${max} characters or fewer`)

export const requiredEmail = () => z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address'))

export const optionalPhone = () =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || PHONE_PATTERN.test(value), 'Enter a valid phone number')

export const optionalUrl = () =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(value), 'Enter a valid URL starting with http:// or https://')

export const requiredSelect = (label: string) => z.string(`${label} is required`).min(1, `${label} is required`)

export const optionalSelect = () => z.string().nullable()

export const nonNegativeNumber = (label: string) =>
  z.number(`${label} must be a number`).min(0, `${label} can't be negative`)
