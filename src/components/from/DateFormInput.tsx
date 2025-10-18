import { Controller, Control, FieldValues, FieldPath } from 'react-hook-form';
import { Form } from 'react-bootstrap';

interface DateFormInputProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  className?: string;
  containerClassName?: string;
}

const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return '';
  
  // Handle string dates that might come from the form
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const DateFormInput = <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder = 'Select date',
  minDate,
  maxDate,
  required = false,
  className = '',
  containerClassName = 'mb-3',
}: DateFormInputProps<TFieldValues>) => {
  const minDateStr = minDate ? formatDateForInput(minDate) : undefined;
  const maxDateStr = maxDate ? formatDateForInput(maxDate) : undefined;
  
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    return monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Form.Group className={containerClassName}>
          {label && (
            <Form.Label>
              {label}
              {required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
          )}
          <Form.Control
            type="date"
            className={className}
            placeholder={placeholder}
            value={formatDateForInput(value)}
            onChange={(e) => {
              const dateValue = e.target.value;
              if (dateValue) {
                // Create date at noon UTC to avoid timezone issues
                const [year, month, day] = dateValue.split('-').map(Number);
                const date = new Date(year, month - 1, day, 12, 0, 0);
                onChange(date);
              } else {
                onChange(null);
              }
            }}
            min={minDateStr}
            max={maxDateStr}
            isInvalid={!!error}
            aria-label={label || placeholder}
          />
          {!error && value && label?.includes('Birth') && (
            <Form.Text className="text-muted">
              Age: {calculateAge(value)} years old
            </Form.Text>
          )}
          {error && (
            <Form.Control.Feedback type="invalid" className="d-block">
              {error.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      )}
    />
  );
};

export default DateFormInput;
