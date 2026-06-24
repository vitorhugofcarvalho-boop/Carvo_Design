import type { ComponentType, ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({
  icone: Icone = Inbox,
  titulo,
  descricao,
  acao,
}: {
  icone?: ComponentType<{ className?: string }>
  titulo: string
  descricao?: string
  acao?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-deep-hover bg-brand-deep/30 px-6 py-12 text-center">
      <Icone className="size-8 text-brand-platinum/20" />
      <h3 className="mt-3 font-medium text-brand-platinum">{titulo}</h3>
      {descricao && <p className="mt-1 max-w-sm text-sm text-brand-platinum/50">{descricao}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  )
}
