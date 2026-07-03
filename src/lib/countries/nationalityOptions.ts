import { getCountries } from 'react-phone-number-input/input'
import en from 'react-phone-number-input/locale/en.json'
import type { BrandedSelectOption } from '@/components/ui/BrandedSelect'

export const NATIONALITY_OPTIONS: BrandedSelectOption[] = getCountries()
  .map((code) => {
    const label = en[code as keyof typeof en]
    return label ? { value: label, label } : null
  })
  .filter((option): option is BrandedSelectOption => option !== null)
  .sort((a, b) => a.label.localeCompare(b.label))
