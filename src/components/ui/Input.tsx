import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const campoBase =
  'w-full rounded-lg border border-brand-deep-hover bg-brand-base px-3 py-2 text-sm text-brand-platinum placeholder:text-brand-platinum/30 outline-none transition-colors focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/60'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${campoBase} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${campoBase} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${campoBase} min-h-20 resize-y ${className}`} {...props} />
}
