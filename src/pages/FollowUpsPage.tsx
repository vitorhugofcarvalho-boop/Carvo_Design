import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, AlertTriangle, Calendar, Clock } from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { STATUS_LEAD, PRIORIDADE } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { formatarData, dataRelativa, estaAtrasado } from '@/utils/formatting'
import { timestampParaInputDate, dataParaTimestamp } from '@/utils/formatting'

export function FollowUpsPage() {
  const { leads, putLead } = useLeads()
  const navigate = useNavigate()
  const agora = Date.now()

  const { atrasados, hoje, proximos3, semAcao } = useMemo(() => {
    const atrasados: typeof leads = []
    const hoje: typeof leads = []
    const proximos3: typeof leads = []
    const semAcao: typeof leads = []

    for (const l of leads) {
      if (l.status === 'fechado' || l.status === 'perdido') continue

      if (!l.proximoFollowUp) {
        semAcao.push(l)
        continue
      }

      const diff = l.proximoFollowUp - agora
      const diffDias = diff / 86400000

      if (estaAtrasado(l.proximoFollowUp)) {
        atrasados.push(l)
      } else if (diffDias <= 1) {
        hoje.push(l)
      } else if (diffDias <= 4) {
        proximos3.push(l)
      } else {
        semAcao.push(l)
      }
    }

    atrasados.sort((a, b) => (a.proximoFollowUp ?? 0) - (b.proximoFollowUp ?? 0))
    hoje.sort((a, b) => (a.proximoFollowUp ?? 0) - (b.proximoFollowUp ?? 0))
    proximos3.sort((a, b) => (a.proximoFollowUp ?? 0) - (b.proximoFollowUp ?? 0))
    semAcao.sort((a, b) => a.nome.localeCompare(b.nome))

    return { atrasados, hoje, proximos3, semAcao }
  }, [leads, agora])

  function atualizarFollowUp(leadId: string, ts: number | null) {
    const lead = leads.find((l) => l.id === leadId)
    if (!lead) return
    putLead({ ...lead, proximoFollowUp: ts, atualizadoEm: Date.now() })
  }

  const renderSection = (titulo: string, items: typeof leads, icone: typeof Bell, cor: string, vazio: string) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className={cor}>{icone({ className: 'size-4' })}</span>
        <h2 className="text-sm font-semibold text-brand-platinum">{titulo}</h2>
        <span className="text-xs text-brand-platinum/30 tabular-nums">({items.length})</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-brand-platinum/30 pl-6">{vazio}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 10).map((l) => {
            const prioInfo = PRIORIDADE[l.prioridade]
            const statusInfo = STATUS_LEAD.find((s) => s.valor === l.status)
            return (
              <Card
                key={l.id}
                className="!p-3 transition-all hover:border-brand-primary/40 cursor-pointer"
                onClick={() => navigate(`/leads/${l.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-brand-platinum">{l.nome}</p>
                      <Badge className={prioInfo.cor + ' shrink-0'}>{prioInfo.rotulo}</Badge>
                      {statusInfo && (
                        <Badge className={statusInfo.cor + ' shrink-0'}>{statusInfo.rotulo}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-brand-platinum/40 mt-0.5">@{l.perfilInstagram}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-semibold tabular-nums ${titulo === 'Atrasados' ? 'text-brand-danger' : 'text-brand-accent'}`}>
                      {dataRelativa(l.proximoFollowUp)}
                    </p>
                    <p className="text-[10px] text-brand-platinum/30">{formatarData(l.proximoFollowUp)}</p>
                  </div>
                </div>

                {l.proximaAcao && (
                  <p className="mt-1 text-xs text-brand-platinum/50">📌 {l.proximaAcao}</p>
                )}

                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={timestampParaInputDate(l.proximoFollowUp)}
                      onChange={(e) => atualizarFollowUp(l.id, dataParaTimestamp(e.target.value) ?? null)}
                      className="flex-1 rounded-lg border border-brand-deep-hover bg-brand-base px-2 py-1 text-[11px] text-brand-platinum outline-none focus-visible:border-brand-primary"
                    />
                    {l.proximoFollowUp && (
                      <button
                        onClick={(e) => { e.stopPropagation(); atualizarFollowUp(l.id, null) }}
                        className="text-[10px] text-brand-platinum/30 hover:text-brand-platinum/60 transition-colors"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div>
      <PageHeader
        titulo="Follow-ups"
        subtitulo="Acompanhamento organizado por urgência"
      />

      {leads.length === 0 && (
        <EmptyState
          icone={Bell}
          titulo="Nenhum lead cadastrado"
          descricao="Cadastre leads para gerenciar follow-ups."
          acao={<Button onClick={() => navigate('/leads?novo=1')}>Novo lead</Button>}
        />
      )}

      {leads.length > 0 && (
        <div>
          {renderSection('Atrasados', atrasados, AlertTriangle, 'text-brand-danger', 'Nenhum follow-up atrasado')}
          {renderSection('Para hoje', hoje, Calendar, 'text-brand-accent', 'Nada para hoje')}
          {renderSection('Próximos 3 dias', proximos3, Clock, 'text-blue-400', 'Nada nos próximos dias')}
          {renderSection('Sem follow-up definido', semAcao, Bell, 'text-brand-platinum/30', 'Todos os leads têm follow-up agendado')}
        </div>
      )}
    </div>
  )
}
