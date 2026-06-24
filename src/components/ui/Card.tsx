import type { ReactNode } from 'react'

export function Card({
  className = '',
  children,
  ...props
}: { className?: string; children?: ReactNode; [key: string]: unknown }) {
  return (
    <div
      className={`rounded-xl border border-brand-deep-hover bg-brand-deep p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
