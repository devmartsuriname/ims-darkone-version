import React, { ReactNode } from 'react'
import { Button, ButtonProps, Spinner } from 'react-bootstrap'

interface EnhancedButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'gradient' | 'outline-primary' | 'outline-secondary'
  loading?: boolean
  loadingText?: string
  icon?: string
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  elevated?: boolean
  pulse?: boolean
  children: ReactNode
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  variant = 'primary',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  elevated = false,
  pulse = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const buttonClasses = [
    fullWidth ? 'w-100' : '',
    elevated ? 'shadow-lg' : '',
    pulse ? 'btn-pulse' : '',
    variant === 'gradient' ? 'btn-gradient-primary' : '',
    className
  ].filter(Boolean).join(' ')

  const buttonVariant = variant === 'gradient' ? 'primary' : variant

  const renderIcon = () => {
    if (loading) {
      return <Spinner as="span" animation="border" size="sm" className="me-2" />
    }
    
    if (icon) {
      return (
        <i 
          className={`${icon} ${iconPosition === 'left' ? 'me-2' : 'ms-2'}`}
        />
      )
    }
    
    return null
  }

  const renderContent = () => {
    const text = loading && loadingText ? loadingText : children
    
    if (iconPosition === 'left') {
      return (
        <>
          {renderIcon()}
          {text}
        </>
      )
    } else {
      return (
        <>
          {text}
          {renderIcon()}
        </>
      )
    }
  }

  return (
    <Button
      variant={buttonVariant}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {renderContent()}
    </Button>
  )
}

interface FloatingActionButtonProps {
  icon: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  tooltip?: string
  className?: string
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  variant = 'primary',
  size = 'md',
  position = 'bottom-right',
  tooltip,
  className = ''
}) => {
  const positionClasses = {
    'bottom-right': 'position-fixed bottom-0 end-0 m-4',
    'bottom-left': 'position-fixed bottom-0 start-0 m-4',
    'top-right': 'position-fixed top-0 end-0 m-4',
    'top-left': 'position-fixed top-0 start-0 m-4'
  }

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }

  const fabClasses = [
    'btn',
    `btn-${variant}`,
    'rounded-circle',
    'shadow-lg',
    'fab-button',
    sizeClasses[size],
    positionClasses[position],
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={fabClasses}
      onClick={onClick}
      title={tooltip}
      style={{ zIndex: 1050 }}
    >
      <i className={icon}></i>
    </button>
  )
}

interface ButtonGroupProps {
  buttons: Array<{
    label: string
    value: string
    icon?: string
    variant?: 'primary' | 'secondary' | 'outline-primary' | 'outline-secondary'
  }>
  selected?: string
  onSelect?: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
  vertical?: boolean
  className?: string
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  selected,
  onSelect,
  size = 'md',
  vertical = false,
  className = ''
}) => {
  const groupClasses = [
    'btn-group',
    vertical ? 'btn-group-vertical' : '',
    size !== 'md' ? `btn-group-${size}` : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={groupClasses} role="group">
      {buttons.map((button) => (
        <button
          key={button.value}
          type="button"
          className={`btn ${selected === button.value ? `btn-${button.variant || 'primary'}` : `btn-outline-${button.variant?.replace('outline-', '') || 'primary'}`}`}
          onClick={() => onSelect?.(button.value)}
        >
          {button.icon && <i className={`${button.icon} me-2`}></i>}
          {button.label}
        </button>
      ))}
    </div>
  )
}

interface SplitButtonProps {
  label: string
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  options: Array<{
    label: string
    value: string
    icon?: string
    divider?: boolean
  }>
  onMainClick?: () => void
  onOptionClick?: (value: string) => void
  className?: string
}

export const SplitButton: React.FC<SplitButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  options,
  onMainClick,
  onOptionClick,
  className = ''
}) => {
  const sizeClass = size !== 'md' ? `btn-${size}` : ''

  return (
    <div className={`btn-group ${className}`}>
      <button
        type="button"
        className={`btn btn-${variant} ${sizeClass}`}
        onClick={onMainClick}
      >
        {label}
      </button>
      <button
        type="button"
        className={`btn btn-${variant} dropdown-toggle dropdown-toggle-split ${sizeClass}`}
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span className="visually-hidden">Toggle Dropdown</span>
      </button>
      <ul className="dropdown-menu">
        {options.map((option) => (
          <React.Fragment key={option.value}>
            {option.divider && <li><hr className="dropdown-divider" /></li>}
            <li>
              <button
                className="dropdown-item"
                onClick={() => onOptionClick?.(option.value)}
              >
                {option.icon && <i className={`${option.icon} me-2`}></i>}
                {option.label}
              </button>
            </li>
          </React.Fragment>
        ))}
      </ul>
    </div>
  )
}