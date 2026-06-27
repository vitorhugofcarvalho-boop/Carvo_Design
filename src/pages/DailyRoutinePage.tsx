import { useEffect, useMemo } from 'react'
import { CheckSquare, BookOpen, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChecklist } from '@/hooks/useChecklist'
import { useLeads } from '@/hooks/useLeads'
import { useMetrics } from '@/hooks/useMetrics'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

export function DailyRoutinePage() {
  const { items, toggleItem, aprendizado, salvarAprendizado, syncWithGoals } = useChecklist()
  const { leads } = useLeads()
  const { goals } = useMetrics()
  const navigate = useNavigate()

  // Auto-completar metas
  useEffect(() => {
    syncWithGoals(
      goals.map((g) => ({ type: g.type as 'lead_created' | 'lead_qualified' | 'approach_sent' | 'followup_sent' | 'proposal_sent', done: g.done })),
    )
  }, [goals, syncWithGoals])

  const concluidos = items.filter((i) => i.done).length
  const total = items.length
  const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0

  const metasCard = useMemo(
    () =>
      goals.map((g) => ({
        ...g,
        label: `${g.label.replace(/^\d+ /, '')} (${g.current}/${g.target})`,
      })),
    [goals],
  )

  return (
    <div>
      <PageHeader
        titulo="Rotina diária"
        subtitulo={`${concluidos} de ${total} itens concluídos`}
      />

      <div className="mb-6 h-2 rounded-full bg-brand-deep overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-primary transition-all duration-500"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-brand-platinum mb-4 flex items-center gap-2">
            <CheckSquare className="size-4 text-brand-accent" />
            Checklist do dia
          </h2>

          <div className="space-y-3">
            {items.map((item) => (
              <label
                key={item.id}
                className={cn(
                  'flex items-start gap-3 group',
                  item.goalType ? '' : 'cursor-pointer',
                )}
              >
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => { if (!item.goalType) toggleItem(item.id) }}
                    disabled={!!item.goalType}
                    className={cn(
                      'size-4 rounded border-brand-deep-hover bg-brand-base focus:ring-brand-primary/60 focus:ring-offset-0',
                      item.goalType
                        ? 'opacity-60 cursor-default'
                        : 'text-brand-primary cursor-pointer',
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-sm transition-colors',
                    item.goalType && 'text-brand-platinum/50',
                    item.done
                      ? 'text-brand-platinum/30 line-through'
                      : 'text-brand-platinum',
                  )}
                >
                  {item.label}
                  {item.goalType && item.goalTarget && (
                    <span className="ml-1 text-[11px] text-brand-platinum/30">
                      (meta automática)
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {/* Progresso das metas */}
          <Card>
            <h2 className="text-sm font-semibold text-brand-platinum mb-3 flex items-center gap-2">
              <Target className="size-4 text-brand-accent" />
              Metas do dia
            </h2>
            <div className="space-y-3">
              {metasCard.map((g) => (
                <div key={g.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-brand-platinum/70">{g.label}</span>
                    <span className={cn('tabular-nums font-bold', g.done ? 'text-green-400' : 'text-brand-platinum/40')}>
                      {g.percent}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-brand-base overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        g.done ? 'bg-green-500' : 'bg-brand-primary',
                      )}
                      style={{ width: `${g.percent}%` }}
                    />
                  </div>
                </div>
              ))}
              {metasCard.length === 0 && (
                <p className="text-sm text-brand-platinum/40">Nenhuma meta configurada.</p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-brand-platinum mb-3 flex items-center gap-2">
              <BookOpen className="size-4 text-brand-accent" />
              Aprendizado do dia
            </h2>

            <Textarea
              value={aprendizado}
              onChange={(e) => salvarAprendizado(e.target.value)}
              placeholder="O que você aprendeu hoje na prospecção?"
              rows={4}
              className="w-full"
            />
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-brand-platinum mb-3">Atalhos rápidos</h2>
            <div className="space-y-2">
              <Button
                variante="secundario"
                className="w-full justify-start"
                onClick={() => navigate('/leads?novo=1')}
              >
                + Novo lead
              </Button>
              <Button
                variante="secundario"
                className="w-full justify-start"
                onClick={() => navigate('/leads')}
              >
                Ver leads cadastrados
              </Button>
              <Button
                variante="secundario"
                className="w-full justify-start"
                onClick={() => navigate('/followups')}
              >
                Ver follow-ups pendentes
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-brand-platinum mb-3">Resumo do dia</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-brand-platinum/40">Leads total</p>
                <p className="text-lg font-bold text-brand-platinum">{leads.length}</p>
              </div>
              <div>
                <p className="text-xs text-brand-platinum/40">Checklist</p>
                <p className="text-lg font-bold text-brand-primary">{progresso}%</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
