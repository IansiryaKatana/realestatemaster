import { isValidPhoneNumber } from 'react-phone-number-input'
import { z } from 'zod'

export const phoneFieldSchema = z
  .string()
  .min(1, 'Phone is required')
  .refine((value) => isValidPhoneNumber(value), 'Valid phone number required')

export function isOptionalPhoneValue(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? ''
  return trimmed === '' || isValidPhoneNumber(trimmed)
}
