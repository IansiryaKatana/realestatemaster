import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { SearchableBrandedSelect } from '@/components/ui/SearchableBrandedSelect'
import { NATIONALITY_OPTIONS } from '@/lib/countries/nationalityOptions'

type NationalitySelectProps = {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  'aria-label'?: string
}

export function NationalitySelect({
  value,
  onValueChange,
  disabled,
  'aria-label': ariaLabel = 'Nationality',
}: NationalitySelectProps) {
  return (
    <SearchableBrandedSelect
      variant="storefront"
      value={value}
      onValueChange={onValueChange}
      options={NATIONALITY_OPTIONS}
      placeholder="Select nationality"
      searchPlaceholder="Search countries…"
      disabled={disabled}
      aria-label={ariaLabel}
    />
  )
}

type FormNationalitySelectProps<T extends FieldValues> = {
  control: Control<T>
  fieldName: FieldPath<T>
  disabled?: boolean
}

export function FormNationalitySelect<T extends FieldValues>({
  control,
  fieldName,
  disabled,
}: FormNationalitySelectProps<T>) {
  return (
    <Controller
      control={control}
      name={fieldName}
      render={({ field }) => (
        <NationalitySelect
          value={(field.value as string) ?? ''}
          onValueChange={field.onChange}
          disabled={disabled}
        />
      )}
    />
  )
}
