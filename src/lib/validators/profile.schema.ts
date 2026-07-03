import { z } from 'zod'
import { phoneFieldSchema } from '@/lib/validators/phone.schema'

/** UAE Emirates ID: 784-YYYY-NNNNNNN-C (dashes optional). */
const EMIRATES_ID_PATTERN = /^784-?\d{4}-?\d{7}-?\d$/

/** Typical passport numbers: 6–12 alphanumeric characters. */
const PASSPORT_PATTERN = /^[A-Za-z0-9]{6,12}$/

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required').max(120),
  nationality: z.string().trim().min(1, 'Nationality is required'),
  emirates_id: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || EMIRATES_ID_PATTERN.test(value.replace(/\s/g, '')),
      'Enter a valid Emirates ID (784-YYYY-NNNNNNN-C)',
    ),
  passport_number: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || PASSPORT_PATTERN.test(value),
      'Enter a valid passport number (6–12 letters and digits)',
    ),
  phone: phoneFieldSchema,
  address: z.string().trim().max(500),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
