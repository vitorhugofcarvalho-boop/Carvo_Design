import type { ReactNode } from 'react'
import { Card } from './Card'

export function StatCard({
  rotulo,
  valor,
  cor = 'text-brand-platinum',
  icone,
}: {
  rotulo: string
  valor: string
  cor?: string
  icone?: ReactNode
}) {
  return (
    <Card className="transition-colors hover:border-brand-primary/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-brand-platinum/50">{rotulo}</p>
          <p className={`mt-1 text-xl font-bold tabular-nums ${cor}`}>{valor}</p>
        </div>
        {icone && <div className="text-brand-platinum/20">{icone}</div>}
      </div>
    </Card>
  )
}
