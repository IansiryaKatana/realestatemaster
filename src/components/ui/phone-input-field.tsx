import clsx from 'clsx'
import PhoneInput, { type Country, type Value } from 'react-phone-number-input'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import 'react-phone-number-input/style.css'
import '@/styles/phone-input-overrides.css'

export type { Country, Value }

export const DEFAULT_PHONE_COUNTRY: Country = 'AE'

export type PhoneInputFieldProps = {
  id?: string
  name?: string
  value?: Value
  onChange: (value: Value | undefined) => void
  defaultCountry?: Country
  variant?: 'public' | 'admin'
  className?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
}

export function PhoneInputField({
  id,
  name,
  value,
  onChange,
  defaultCountry = DEFAULT_PHONE_COUNTRY,
  variant = 'public',
  className,
  required,
  disabled,
  placeholder,
}: PhoneInputFieldProps) {
  return (
    <>
      <PhoneInput
        id={id}
        international
        defaultCountry={defaultCountry}
        value={value?.trim() ? value : undefined}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={clsx(
          variant === 'public' ? 'phone-input--public' : 'phone-input--admin',
          className,
        )}
      />
      {name ? (
        <input type="hidden" name={name} value={value ?? ''} required={required} />
      ) : null}
    </>
  )
}

type FormPhoneInputProps<T extends FieldValues> = Omit<PhoneInputFieldProps, 'value' | 'onChange'> & {
  control: Control<T>
  fieldName: FieldPath<T>
}

export function FormPhoneInput<T extends FieldValues>({
  control,
  fieldName,
  ...props
}: FormPhoneInputProps<T>) {
  return (
    <Controller
      control={control}
      name={fieldName}
      render={({ field }) => (
        <PhoneInputField
          {...props}
          value={field.value as Value | undefined}
          onChange={field.onChange}
        />
      )}
    />
  )
}
