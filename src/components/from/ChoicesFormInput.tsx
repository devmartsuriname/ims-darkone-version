import Choices, { type Options as ChoiceOption } from 'choices.js'
import { type HTMLAttributes, type ReactElement, useEffect, useRef } from 'react'

export type ChoiceProps = HTMLAttributes<HTMLInputElement> &
  HTMLAttributes<HTMLSelectElement> & {
    multiple?: boolean
    className?: string
    value?: string | string[]
    options?: Partial<ChoiceOption>
    onChange?: (text: string) => void
  } & (
    | {
        allowInput?: false
        children: ReactElement[]
      }
    | { allowInput?: true }
  )

const ChoicesFormInput = ({ children, multiple, className, onChange, allowInput, value, options, ...props }: ChoiceProps) => {
  const choicesRef = useRef<any>(null)

  useEffect(() => {
    if (choicesRef.current && !choicesRef.current.choicesInstance) {
      const choices = new Choices(choicesRef.current, {
        ...options,
        placeholder: true,
        allowHTML: true,
        shouldSort: false,
      })
      
      choicesRef.current.choicesInstance = choices
      
      // Set initial value if provided
      if (value) {
        choices.setChoiceByValue(value)
      }
      
      choices.passedElement.element.addEventListener('change', (e: Event) => {
        if (!(e.target instanceof HTMLSelectElement)) return
        if (onChange) {
          onChange(e.target.value)
        }
      })
      
      return () => {
        if (choicesRef.current?.choicesInstance) {
          choicesRef.current.choicesInstance.destroy()
          choicesRef.current.choicesInstance = undefined
        }
      }
    }
  }, [])

  // Update Choices.js when value changes externally
  useEffect(() => {
    if (choicesRef.current?.choicesInstance && value !== undefined) {
      choicesRef.current.choicesInstance.setChoiceByValue(value)
    }
  }, [value])

  return allowInput ? (
    <input ref={choicesRef} multiple={multiple} className={className} value={value} {...props} />
  ) : (
    <select ref={choicesRef} multiple={multiple} className={className} value={value} {...props}>
      {children}
    </select>
  )
}

export default ChoicesFormInput
