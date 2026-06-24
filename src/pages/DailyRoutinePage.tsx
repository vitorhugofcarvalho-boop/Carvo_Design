import { CheckSquare, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChecklist } from '@/hooks/useChecklist'
import { useLeads } from '@/hooks/useLeads'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'

export function DailyRoutinePage() {
  const { items, toggleItem, aprendizado, salvarAprendizado } = useChecklist()
  const { leads } = useLeads()
  const navigate = useNavigate()

  const concluidos = items.filter((i) => i.done).length
  const total = items.length
  const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0

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
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleItem(item.id)}
                    className="size-4 rounded border-brand-deep-hover bg-brand-base text-brand-primary focus:ring-brand-primary/60 focus:ring-offset-0 cursor-pointer"
                  />
                </div>
                <span
                  className={`text-sm transition-colors ${
                    item.done
                      ? 'text-brand-platinum/30 line-through'
                      : 'text-brand-platinum'
                  }`}
                >
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
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
