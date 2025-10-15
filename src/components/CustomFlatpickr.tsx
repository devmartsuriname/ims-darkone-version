import React from 'react'

// Lightweight native fallback to avoid react-flatpickr unmount errors in React 18
// Keeps the same API: value, options, onChange(Date[])

type FlatpickrProps = {
  className?: string
  value?: Date | [Date, Date]
  options?: any
  placeholder?: string
  onChange?: (dates: Date[]) => void
}

const formatDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  return `${yyyy}-${mm}-${dd}`
}

const formatDateTimeLocal = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

const parseLimit = (limit: any, withTime: boolean) => {
  if (!limit) return undefined
  if (limit === 'today') {
    const now = new Date()
    return withTime ? formatDateTimeLocal(now) : formatDate(now)
  }
  if (limit instanceof Date) {
    return withTime ? formatDateTimeLocal(limit) : formatDate(limit)
  }
  // string like '2025-01-01' or '2025-01-01T10:00'
  return String(limit)
}

const CustomFlatpickr = ({ className, value, options, placeholder, onChange }: FlatpickrProps) => {
  const withTime = Boolean(options?.enableTime)
  const inputType = withTime ? 'datetime-local' : 'date'

  const firstValue: Date | undefined = Array.isArray(value) ? value[0] : value
  const inputValue = firstValue
    ? withTime
      ? formatDateTimeLocal(firstValue)
      : formatDate(firstValue)
    : ''

  const min = parseLimit(options?.minDate, withTime)
  const max = parseLimit(options?.maxDate, withTime)

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const val = e.target.value
    if (!val) {
      onChange?.([])
      return
    }
    const date = new Date(val)
    onChange?.([date])
  }

  return (
    <input
      type={inputType}
      className={className}
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      min={min}
      max={max}
    />
  )
}

export default CustomFlatpickr
