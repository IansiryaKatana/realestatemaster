import { z } from 'zod'
import { phoneFieldSchema } from '@/lib/validators/phone.schema'

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Valid email required'),
  phone: phoneFieldSchema,
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export type ContactFormValues = z.infer<typeof contactSchema>
