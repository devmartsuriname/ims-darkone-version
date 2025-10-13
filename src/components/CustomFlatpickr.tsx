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
  return (
    <>
      <Flatpickr 
        className={className} 
        data-enable-time 
        value={value} 
        options={options} 
        placeholder={placeholder}
        onChange={onChange}
      />
    </>
  )
}

export default CustomFlatpickr
