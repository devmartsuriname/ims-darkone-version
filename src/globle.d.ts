declare module 'gumshoejs'

declare module 'react-flatpickr'

// CSS/SCSS module declarations to fix TS5090
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare module '*.scss' {
  const content: Record<string, string>
  export default content
}

declare module 'jspdf-autotable'
