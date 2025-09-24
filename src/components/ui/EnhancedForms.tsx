import React, { ReactNode, useState } from 'react'
import { Form, FormControl, FormLabel, FormText, InputGroup } from 'react-bootstrap'
import { EnhancedButton } from './EnhancedButtons'
import { LoadingSpinner } from './LoadingStates'

interface EnhancedInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  error?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  size?: 'sm' | 'lg'
  className?: string
  autoComplete?: string
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  helpText,
  required = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  size,
  className = '',
  autoComplete,
  ...props
}) => {
  const [focused, setFocused] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  const inputClasses = [
    error ? 'is-invalid' : '',
    focused ? 'focused' : '',
    className
  ].filter(Boolean).join(' ')

  const renderInput = () => {
    const input = (
      <FormControl
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        disabled={disabled || loading}
        size={size}
        className={inputClasses}
        autoComplete={autoComplete}
        {...props}
      />
    )

    if (icon || loading) {
      return (
        <InputGroup>
          {(icon && iconPosition === 'left') && (
            <InputGroup.Text>
              <i className={icon}></i>
            </InputGroup.Text>
          )}
          {(loading && iconPosition === 'left') && (
            <InputGroup.Text>
              <LoadingSpinner size="sm" />
            </InputGroup.Text>
          )}
          {input}
          {(icon && iconPosition === 'right') && (
            <InputGroup.Text>
              <i className={icon}></i>
            </InputGroup.Text>
          )}
          {(loading && iconPosition === 'right') && (
            <InputGroup.Text>
              <LoadingSpinner size="sm" />
            </InputGroup.Text>
          )}
        </InputGroup>
      )
    }

    return input
  }

  return (
    <Form.Group className="mb-3">
      {label && (
        <FormLabel>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </FormLabel>
      )}
      {renderInput()}
      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
      {helpText && !error && (
        <FormText className="text-muted">
          {helpText}
        </FormText>
      )}
    </Form.Group>
  )
}

interface EnhancedSelectProps {
  label?: string
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
  value?: string
  onChange?: (value: string) => void
  error?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  placeholder?: string
  size?: 'sm' | 'lg'
  className?: string
}

export const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  helpText,
  required = false,
  disabled = false,
  loading = false,
  placeholder = 'Select an option...',
  size,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <Form.Group className="mb-3">
      {label && (
        <FormLabel>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </FormLabel>
      )}
      <div className="position-relative">
        <Form.Select
          value={value || ''}
          onChange={handleChange}
          required={required}
          disabled={disabled || loading}
          size={size}
          className={`${error ? 'is-invalid' : ''} ${className}`}
        >
          <option value="" disabled>
            {loading ? 'Loading...' : placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </Form.Select>
        {loading && (
          <div className="position-absolute top-50 end-0 translate-middle-y me-4">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>
      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
      {helpText && !error && (
        <FormText className="text-muted">
          {helpText}
        </FormText>
      )}
    </Form.Group>
  )
}

interface EnhancedTextareaProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  maxLength?: number
  showCharCount?: boolean
  size?: 'sm' | 'lg'
  className?: string
}

export const EnhancedTextarea: React.FC<EnhancedTextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  helpText,
  required = false,
  disabled = false,
  rows = 3,
  maxLength,
  showCharCount = false,
  size,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  const charCount = value ? value.length : 0
  const isOverLimit = maxLength ? charCount > maxLength : false

  return (
    <Form.Group className="mb-3">
      {label && (
        <FormLabel>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </FormLabel>
      )}
      <Form.Control
        as="textarea"
        rows={rows}
        placeholder={placeholder}
        value={value || ''}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        size={size}
        className={`${error || isOverLimit ? 'is-invalid' : ''} ${className}`}
      />
      {(showCharCount || maxLength) && (
        <div className="d-flex justify-content-between mt-1">
          {(error || isOverLimit) && (
            <div className="invalid-feedback d-block">
              {error || `Character limit exceeded (${charCount}/${maxLength})`}
            </div>
          )}
          {showCharCount && (
            <small className={`text-${isOverLimit ? 'danger' : 'muted'} ms-auto`}>
              {charCount}{maxLength && `/${maxLength}`}
            </small>
          )}
        </div>
      )}
      {helpText && !error && !isOverLimit && (
        <FormText className="text-muted">
          {helpText}
        </FormText>
      )}
    </Form.Group>
  )
}

interface StepperFormProps {
  steps: Array<{
    title: string
    description?: string
    component: ReactNode
    validation?: () => boolean
  }>
  currentStep?: number
  onStepChange?: (step: number) => void
  onComplete?: () => void
  loading?: boolean
  className?: string
}

export const StepperForm: React.FC<StepperFormProps> = ({
  steps,
  currentStep = 0,
  onStepChange,
  onComplete,
  loading = false,
  className = ''
}) => {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const canProceed = steps[currentStep]?.validation ? steps[currentStep].validation!() : true

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange?.(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.()
    } else if (canProceed) {
      onStepChange?.(currentStep + 1)
    }
  }

  return (
    <div className={className}>
      {/* Step Indicator */}
      <div className="stepper-header mb-4">
        <div className="d-flex align-items-center">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="text-center">
                <div
                  className={`stepper-step ${
                    index < currentStep
                      ? 'completed'
                      : index === currentStep
                      ? 'active'
                      : 'pending'
                  }`}
                >
                  {index < currentStep ? (
                    <i className="bi bi-check-lg"></i>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="fw-medium small">{step.title}</div>
                  {step.description && (
                    <div className="text-muted x-small">{step.description}</div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`stepper-line ${
                    index < currentStep ? 'completed' : ''
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="stepper-content mb-4">
        {steps[currentStep]?.component}
      </div>

      {/* Navigation */}
      <div className="stepper-navigation d-flex justify-content-between">
        <EnhancedButton
          variant="outline-secondary"
          onClick={handlePrevious}
          disabled={isFirstStep || loading}
        >
          Previous
        </EnhancedButton>
        <EnhancedButton
          variant="primary"
          onClick={handleNext}
          disabled={!canProceed}
          loading={loading}
          loadingText={isLastStep ? 'Completing...' : 'Processing...'}
        >
          {isLastStep ? 'Complete' : 'Next'}
        </EnhancedButton>
      </div>
    </div>
  )
}