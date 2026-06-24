import { useNavigate } from 'react-router-dom'
import { useLeads } from '@/hooks/useLeads'
import type { LeadStatus } from '@/types'
import { STATUS_LEAD, PRIORIDADE } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatusSelect } from '@/components/StatusSelect'
import { EmptyState } from '@/components/ui/EmptyState'
import { Layers } from 'lucide-react'
import { dataRelativa } from '@/utils/formatting'

const COLUNAS_VISIVEIS: LeadStatus[] = [
  'captado',
  'qualificado',
  'abordagem_enviada',
  'respondeu',
  'diagnostico_enviado',
  'conversa_andamento',
  'pediu_preco',
  'proposta_enviada',
  'fechado',
  'perdido',
  'nutricao_futura',
]

export function PipelinePage() {
  const { leads, putLead } = useLeads()
  const navigate = useNavigate()

  function mudarStatus(leadId: string, novoStatus: LeadStatus) {
    const lead = leads.find((l) => l.id === leadId)
    if (!lead) return
    const updated = {
      ...lead,
      status: novoStatus,
      atualizadoEm: Date.now(),
    }
    if (novoStatus === 'abordagem_enviada' && !lead.primeiraAbordagem) {
      updated.primeiraAbordagem = Date.now()
    }
    putLead(updated)
  }

  return (
    <div>
      <PageHeader
        titulo="Pipeline"
        subtitulo={`${leads.length} lead(s) no funil`}
      />

      {leads.length === 0 && (
        <EmptyState
          icone={Layers}
          titulo="Nenhum lead no pipeline"
          descricao="Cadastre leads para vê-los aqui."
        />
      )}

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ scrollSnapType: 'x mandatory' }}>
        {COLUNAS_VISIVEIS.map((status) => {
          const statusInfo = STATUS_LEAD.find((s) => s.valor === status)
          const leadsColuna = leads.filter((l) => l.status === status)

          return (
            <div
              key={status}
              className="min-w-[280px] max-w-[320px] flex-1"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-brand-platinum">{statusInfo?.rotulo}</h3>
                  <span className="text-xs text-brand-platinum/30 tabular-nums">({leadsColuna.length})</span>
                </div>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {leadsColuna.length === 0 && (
                  <div className="rounded-xl border border-dashed border-brand-deep-hover/50 p-4">
                    <p className="text-xs text-brand-platinum/20 text-center">Vazio</p>
                  </div>
                )}
                {leadsColuna.map((l) => {
                  const prioInfo = PRIORIDADE[l.prioridade]
                  return (
                    <Card
                      key={l.id}
                      className="!p-3 transition-all hover:border-brand-primary/40 cursor-pointer"
                      onClick={() => navigate(`/leads/${l.id}`)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-brand-platinum truncate">{l.nome}</p>
                          <p className="text-[11px] text-brand-platinum/40">@{l.perfilInstagram}</p>
                        </div>
                        <Badge className={prioInfo.cor + ' shrink-0'}>{prioInfo.rotulo}</Badge>
                      </div>

                      {(l.nicho || l.produtoOferta) && (
                        <p className="mt-1 text-[11px] text-brand-platinum/50 truncate">
                          {l.nicho}{l.nicho && l.produtoOferta ? ' · ' : ''}{l.produtoOferta}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-brand-base overflow-hidden">
                          <div className="h-full rounded-full bg-brand-primary" style={{ width: `${(l.nota / 10) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-brand-primary tabular-nums">{l.nota}/10</span>
                      </div>

                      {l.proximaAcao && (
                        <p className="mt-1 text-[11px] text-brand-accent/60 truncate">{l.proximaAcao}</p>
                      )}

                      {l.proximoFollowUp && (
                        <p className="text-[10px] text-brand-platinum/30 mt-0.5">
                          Follow: {dataRelativa(l.proximoFollowUp)}
                        </p>
                      )}

                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <StatusSelect
                          value={l.status}
                          onChange={(v) => mudarStatus(l.id, v)}
                          className="w-full text-[11px] !py-1"
                        />
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
