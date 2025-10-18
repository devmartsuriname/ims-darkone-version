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
  allowFreeInput?: boolean;
  dateFormat?: 'DD-MM-YYYY' | 'YYYY-MM-DD';
  showFormatHint?: boolean;
}

// Format date for HTML5 date input (YYYY-MM-DD)
const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Format date for display (DD-MM-YYYY)
const formatDateForDisplay = (date: Date | null | undefined): string => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${day}-${month}-${year}`;
};

// Auto-format date as user types: DDMMYYYY → DD-MM-YYYY
const formatDateInput = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length >= 8) {
    return `${cleaned.slice(0,2)}-${cleaned.slice(2,4)}-${cleaned.slice(4,8)}`;
  } else if (cleaned.length >= 4) {
    return `${cleaned.slice(0,2)}-${cleaned.slice(2,4)}-${cleaned.slice(4)}`;
  } else if (cleaned.length >= 2) {
    return `${cleaned.slice(0,2)}-${cleaned.slice(2)}`;
  }
  return cleaned;
};

// Parse DD-MM-YYYY to Date object
const parseDateInput = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    
    if (day > 0 && day <= 31 && month >= 0 && month <= 11 && year > 1900 && year < 2100) {
      return new Date(year, month, day, 12, 0, 0);
    }
  }
  return null;
};

const DateFormInput = <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder = 'DD-MM-YYYY or use calendar',
  minDate,
  maxDate,
  required = false,
  className = '',
  containerClassName = 'mb-3',
  allowFreeInput = true,
  showFormatHint = true,
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
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const isDateObject = value && typeof value === 'object' && 'getTime' in value && typeof value.getTime === 'function' && !isNaN(value.getTime());
        const displayValue = allowFreeInput && isDateObject ? formatDateForDisplay(value as Date) : formatDateForInput(value as Date);
        
        return (
          <Form.Group className={containerClassName}>
            {label && (
              <Form.Label>
                {label}
                {required && <span className="text-danger ms-1">*</span>}
              </Form.Label>
            )}
            
            {allowFreeInput ? (
              <>
                <Form.Control
                  type="text"
                  className={className}
                  placeholder={placeholder}
                  value={displayValue}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const formatted = formatDateInput(inputValue);
                    
                    // Try to parse the date when it looks complete
                    if (formatted.length === 10) {
                      const parsedDate = parseDateInput(formatted);
                      if (parsedDate) {
                        onChange(parsedDate);
                        return;
                      }
                    }
                    
                    // Keep the formatted string for display
                    if (formatted.length <= 10) {
                      onChange(formatted);
                    }
                  }}
                  onBlur={() => {
                    // On blur, try to parse the date
                    if (typeof value === 'string') {
                      const parsedDate = parseDateInput(value);
                      if (parsedDate) {
                        onChange(parsedDate);
                      } else if (value) {
                        onChange(null); // Clear invalid dates
                      }
                    }
                  }}
                  isInvalid={!!error}
                  aria-label={label || placeholder}
                />
                {showFormatHint && !error && !value && (
                  <Form.Text className="text-muted">
                    Format: DD-MM-YYYY (e.g., 14-09-1998)
                  </Form.Text>
                )}
              </>
            ) : (
              <Form.Control
                type="date"
                className={className}
                placeholder={placeholder}
                value={formatDateForInput(value)}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  if (dateValue) {
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
            )}
            
            {!error && isDateObject && label?.includes('Birth') && (
              <Form.Text className="text-muted">
                Age: {calculateAge(value as Date)} years old
              </Form.Text>
            )}
            
            {error && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {error.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        );
      }}
    />
  );
};

export default DateFormInput;
