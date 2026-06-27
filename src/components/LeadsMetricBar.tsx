import { Users, Send, MessageCircle, Clock } from 'lucide-react'
import type { DailyMetrics } from '@/utils/metrics'
import { cn } from '@/utils/cn'

export function LeadsMetricBar({
  metrics,
  className,
}: {
  metrics: DailyMetrics
  className?: string
}) {
  const cards = [
    {
      rotulo: 'Cadastrados hoje',
      valor: metrics.leadsCriados,
      icone: Users,
      cor: 'text-brand-primary',
    },
    {
      rotulo: 'Abordagens hoje',
      valor: metrics.abordagensEnviadas,
      icone: Send,
      cor: 'text-amber-400',
    },
    {
      rotulo: 'Follow-ups hoje',
      valor: metrics.followupsRealizados,
      icone: MessageCircle,
      cor: 'text-violet-400',
    },
    {
      rotulo: 'Sem ação hoje',
      valor: metrics.leadsSemAcao,
      icone: Clock,
      cor: 'text-brand-platinum/50',
    },
  ]

  return (
    <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-4', className)}>
      {cards.map((c) => (
        <div
          key={c.rotulo}
          className="flex items-center gap-2 rounded-lg border border-brand-deep-hover bg-brand-deep p-3"
        >
          <c.icone className={cn('size-4 shrink-0', c.cor)} />
          <div className="min-w-0">
            <p className="text-[11px] leading-tight text-brand-platinum/50 truncate">{c.rotulo}</p>
            <p className={cn('text-lg font-bold tabular-nums leading-tight', c.cor)}>
              {c.valor}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
