import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, AlertTriangle, Calendar, Clock, type LucideIcon } from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { STATUS_LEAD, PRIORIDADE } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { formatarData, dataRelativa, estaAtrasado, timestampParaInputDate, dataParaTimestamp } from '@/utils/formatting'

function Secao({
  titulo,
  items,
  icone: Icone,
  cor,
  vazio,
  navigate,
  leads,
  putLead,
}: {
  titulo: string
  items: { id: string; status: string; prioridade: string; nome: string; perfilInstagram: string; proximoFollowUp: number | null; proximaAcao: string }[]
  icone: LucideIcon
  cor: string
  vazio: string
  navigate: ReturnType<typeof useNavigate>
  leads: { id: string; status: string; prioridade: string; nome: string; perfilInstagram: string; proximoFollowUp: number | null; proximaAcao: string }[]
  putLead: (lead: any) => void
}) {
  function atualizarFollowUp(leadId: string, ts: number | null) {
    const lead = leads.find((l) => l.id === leadId)
    if (!lead) return
    putLead({ ...lead, proximoFollowUp: ts, atualizadoEm: Date.now() })
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className={cor}><Icone className="size-4" /></span>
        <h2 className="text-sm font-semibold text-brand-platinum">{titulo}</h2>
        <span className="text-xs text-brand-platinum/30 tabular-nums">({items.length})</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-brand-platinum/30 pl-6">{vazio}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 10).map((l) => {
            const prioInfo = PRIORIDADE[l.prioridade as keyof typeof PRIORIDADE]
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
                      {prioInfo ? (
                        <Badge className={prioInfo.cor + ' shrink-0'}>{prioInfo.rotulo}</Badge>
                      ) : null}
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
}

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

  if (leads.length === 0) {
    return (
      <div>
        <PageHeader titulo="Follow-ups" subtitulo="Acompanhamento organizado por urgência" />
        <EmptyState
          icone={Bell}
          titulo="Nenhum lead cadastrado"
          descricao="Cadastre leads para gerenciar follow-ups."
          acao={<Button onClick={() => navigate('/leads?novo=1')}>Novo lead</Button>}
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader titulo="Follow-ups" subtitulo="Acompanhamento organizado por urgência" />
      <Secao titulo="Atrasados" items={atrasados} icone={AlertTriangle} cor="text-brand-danger" vazio="Nenhum follow-up atrasado" navigate={navigate} leads={leads} putLead={putLead} />
      <Secao titulo="Para hoje" items={hoje} icone={Calendar} cor="text-brand-accent" vazio="Nada para hoje" navigate={navigate} leads={leads} putLead={putLead} />
      <Secao titulo="Próximos 3 dias" items={proximos3} icone={Clock} cor="text-blue-400" vazio="Nada nos próximos dias" navigate={navigate} leads={leads} putLead={putLead} />
      <Secao titulo="Sem follow-up definido" items={semAcao} icone={Bell} cor="text-brand-platinum/30" vazio="Todos os leads têm follow-up agendado" navigate={navigate} leads={leads} putLead={putLead} />
    </div>
  )
}
