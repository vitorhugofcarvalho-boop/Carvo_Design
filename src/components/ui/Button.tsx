import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma' | 'sucesso'

const variantes: Record<Variante, string> = {
  primario: 'bg-brand-primary text-white shadow-sm hover:brightness-110',
  secundario: 'border border-brand-deep-hover bg-brand-deep text-brand-platinum hover:bg-brand-deep-hover',
  perigo: 'bg-brand-danger text-white hover:brightness-110',
  fantasma: 'bg-transparent text-brand-platinum/60 hover:bg-brand-deep hover:text-brand-platinum',
  sucesso: 'bg-brand-success text-white hover:brightness-110',
}

export function Button({
  variante = 'primario',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; children?: ReactNode }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 ${variantes[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
