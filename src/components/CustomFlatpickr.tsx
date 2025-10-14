import { useRef, useEffect } from 'react'
import Flatpickr from 'react-flatpickr'
import '../../node_modules/flatpickr/dist/themes/light.css'

type FlatpickrProps = {
  className?: string
  value?: Date | [Date, Date]
  options?: any
  placeholder?: string
  onChange?: (dates: Date[]) => void
}

const CustomFlatpickr = ({ className, value, options, placeholder, onChange }: FlatpickrProps) => {
  const flatpickrRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      // Safe cleanup - check if flatpickr instance exists before destroying
      if (flatpickrRef.current?.flatpickr?.destroy) {
        try {
          flatpickrRef.current.flatpickr.destroy()
        } catch (error) {
          console.warn('Error destroying flatpickr instance:', error)
        }
      }
    }
  }, [])

  return (
    <Flatpickr 
      ref={flatpickrRef}
      className={className} 
      data-enable-time 
      value={value} 
      options={options} 
      placeholder={placeholder}
      onChange={onChange}
    />
  )
}

export default CustomFlatpickr
