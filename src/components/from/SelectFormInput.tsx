import { Controller, FieldValues } from 'react-hook-form';
import ChoicesFormInput from './ChoicesFormInput';
import { FormInputProps } from '@/types/component-props';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFormInputProps<TFieldValues extends FieldValues> extends FormInputProps<TFieldValues> {
  options: SelectOption[];
  placeholder?: string;
  multiple?: boolean;
}

const SelectFormInput = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = 'Select an option',
  containerClassName,
  labelClassName,
  multiple = false,
  noValidate = false
}: SelectFormInputProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={containerClassName || 'mb-3'}>
          {label && (
            <label className={`form-label ${labelClassName || ''}`}>
              {label}
              {!noValidate && <span className="text-danger ms-1">*</span>}
            </label>
          )}
          <ChoicesFormInput
            className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
            multiple={multiple}
            value={field.value}
            onChange={(value) => field.onChange(value)}
          >
            <option value="" disabled>{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </ChoicesFormInput>
          {!noValidate && fieldState.error && (
            <div className="invalid-feedback d-block">
              {fieldState.error.message}
            </div>
          )}
        </div>
      )}
    />
  );
};

export default SelectFormInput;
