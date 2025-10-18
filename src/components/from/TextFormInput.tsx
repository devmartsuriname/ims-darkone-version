import { type InputHTMLAttributes } from 'react'
import { FormControl, FormGroup, FormLabel, type FormControlProps } from 'react-bootstrap'
import Feedback from 'react-bootstrap/esm/Feedback'
import { Controller, type FieldPath, type FieldValues } from 'react-hook-form'

import type { FormInputProps } from '@/types/component-props'

const TextFormInput = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  name,
  containerClassName: containerClass,
  control,
  id,
  label,
  noValidate,
  labelClassName: labelClass,
  ...other
}: FormInputProps<TFieldValues> & FormControlProps & InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <Controller
      {...({} as any)} // TypeScript generics workaround for componentTagger
      name={name as TName}
      control={control}
      render={({ field, fieldState }) => (
        <FormGroup className={containerClass}>
          {label &&
            (typeof label === 'string' ? (
              <FormLabel htmlFor={id ?? name} className={labelClass}>
                {label}
              </FormLabel>
            ) : (
              <>{label}</>
            ))}
          <FormControl 
            id={id ?? name} 
            {...other} 
            {...field}
            value={field.value ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              // Transform to number if type is "number"
              if (other.type === 'number') {
                field.onChange(value === '' ? undefined : Number(value));
              } else {
                field.onChange(value);
              }
            }}
            isInvalid={Boolean(fieldState.error?.message)} 
          />
          {!noValidate && fieldState.error?.message && <Feedback type="invalid">{fieldState.error?.message}</Feedback>}
        </FormGroup>
      )}
    />
  )
}

export default TextFormInput
