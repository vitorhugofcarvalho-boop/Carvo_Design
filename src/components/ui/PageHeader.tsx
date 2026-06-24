import type { ReactNode } from 'react'

export function PageHeader({
  titulo,
  subtitulo,
  acao,
}: {
  titulo: string
  subtitulo?: string
  acao?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-brand-platinum" style={{ fontFamily: 'var(--font-heading)' }}>
          {titulo}
        </h1>
        {subtitulo && <p className="mt-0.5 text-sm text-brand-platinum/50">{subtitulo}</p>}
      </div>
      {acao && <div className="sm:shrink-0">{acao}</div>}
    </div>
  )
}
