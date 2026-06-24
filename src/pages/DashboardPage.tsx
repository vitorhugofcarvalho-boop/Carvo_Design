import { Link } from 'react-router-dom'
import { Users, Send, MessageCircle, Target, TrendingUp, ListChecks } from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { calcularMetricas, leadsParaAbordarHoje, followupsPendentes, leadsSemProximaAcao, leadsQuentes } from '@/utils/dashboard'
import { STATUS_LEAD, PRIORIDADE } from '@/types'
import { dataRelativa } from '@/utils/formatting'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const { leads } = useLeads()
  const navigate = useNavigate()
  const metricas = calcularMetricas(leads)
  const abordarHoje = leadsParaAbordarHoje(leads)
  const pendentes = followupsPendentes(leads)
  const semAcao = leadsSemProximaAcao(leads)
  const quentes = leadsQuentes(leads)

  return (
    <div>
      <PageHeader
        titulo="Dashboard"
        subtitulo="Visão geral da sua prospecção"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-6">
        <StatCard
          rotulo="Leads captados"
          valor={String(metricas.totalLeads)}
          icone={<Users className="size-5" />}
        />
        <StatCard
          rotulo="Leads qualificados"
          valor={String(metricas.qualificados)}
          cor="text-blue-400"
          icone={<Target className="size-5" />}
        />
        <StatCard
          rotulo="DMs enviadas"
          valor={String(metricas.dmsEnviadas)}
          cor="text-amber-400"
          icone={<Send className="size-5" />}
        />
        <StatCard
          rotulo="Respostas"
          valor={String(metricas.respostas)}
          cor="text-violet-400"
          icone={<MessageCircle className="size-5" />}
        />
        <StatCard
          rotulo="Em andamento"
          valor={String(metricas.conversasAndamento)}
          cor="text-indigo-400"
        />
        <StatCard
          rotulo="Propostas enviadas"
          valor={String(metricas.propostasEnviadas)}
          cor="text-pink-400"
        />
        <StatCard
          rotulo="Fechados"
          valor={String(metricas.fechados)}
          cor="text-green-400"
          icone={<TrendingUp className="size-5" />}
        />
        <StatCard
          rotulo={metricas.taxaResposta !== '—' ? 'Taxa de resposta' : 'Taxa de conversão'}
          valor={metricas.taxaResposta !== '—' ? metricas.taxaResposta : metricas.taxaConversao}
          cor="text-brand-accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-brand-platinum mb-3 flex items-center gap-2">
            <ListChecks className="size-4 text-brand-accent" />
            Próximas ações
          </h2>

          {abordarHoje.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-brand-platinum/50 mb-1.5">Leads para abordar hoje</p>
              <div className="space-y-1">
                {abordarHoje.slice(0, 5).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => navigate(`/leads/${l.id}`)}
                    className="flex w-full items-center justify-between rounded-lg bg-brand-base/50 px-3 py-1.5 text-left text-xs hover:bg-brand-deep transition-colors"
                  >
                    <span className="text-brand-platinum truncate">{l.nome}</span>
                    <Badge className={PRIORIDADE[l.prioridade].cor + ' shrink-0'}>
                      {PRIORIDADE[l.prioridade].rotulo}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {pendentes.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-brand-platinum/50 mb-1.5">Follow-ups pendentes</p>
              <div className="space-y-1">
                {pendentes.slice(0, 5).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => navigate(`/leads/${l.id}`)}
                    className="flex w-full items-center justify-between rounded-lg bg-brand-base/50 px-3 py-1.5 text-left text-xs hover:bg-brand-deep transition-colors"
                  >
                    <span className="text-brand-platinum truncate">{l.nome}</span>
                    <span className="text-brand-platinum/40 shrink-0 tabular-nums">{dataRelativa(l.proximoFollowUp)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {leads.length === 0 && (
            <p className="text-sm text-brand-platinum/40">Nenhum lead cadastrado ainda.</p>
          )}
          {leads.length > 0 && abordarHoje.length === 0 && pendentes.length === 0 && (
            <p className="text-sm text-brand-platinum/40">Tudo em dia! Nenhuma ação pendente.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-brand-platinum mb-3">Leads que precisam de atenção</h2>
          {leads.length > 0 && (
            <div className="space-y-3">
              {semAcao.length > 0 && (
                <div>
                  <p className="text-xs text-brand-accent/70 mb-1">
                    Sem próxima ação definida ({semAcao.length})
                  </p>
                  <div className="space-y-1">
                    {semAcao.slice(0, 4).map((l) => (
                      <button
                        key={l.id}
                        onClick={() => navigate(`/leads/${l.id}`)}
                        className="flex w-full items-center gap-2 rounded-lg bg-brand-base/50 px-3 py-1.5 text-left text-xs hover:bg-brand-deep transition-colors"
                      >
                        <span className="text-brand-platinum truncate">{l.nome}</span>
                        <Badge className={STATUS_LEAD.find((s) => s.valor === l.status)?.cor ?? ''}>
                          {STATUS_LEAD.find((s) => s.valor === l.status)?.rotulo}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {quentes.length > 0 && (
                <div>
                  <p className="text-xs text-brand-accent/70 mb-1">
                    Leads quentes ({quentes.length})
                  </p>
                  <div className="space-y-1">
                    {quentes.slice(0, 4).map((l) => (
                      <button
                        key={l.id}
                        onClick={() => navigate(`/leads/${l.id}`)}
                        className="flex w-full items-center gap-2 rounded-lg bg-brand-base/50 px-3 py-1.5 text-left text-xs hover:bg-brand-deep transition-colors"
                      >
                        <span className="text-brand-platinum truncate">{l.nome}</span>
                        <span className="text-brand-primary font-bold tabular-nums shrink-0">{l.nota}/10</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {leads.length === 0 && (
            <p className="text-sm text-brand-platinum/40">Nenhum lead cadastrado.</p>
          )}
          <div className="mt-4 flex gap-2">
            <Link to="/leads" className="text-xs text-brand-primary hover:underline">Ver todos os leads</Link>
            <Link to="/pipeline" className="text-xs text-brand-platinum/50 hover:underline">Pipeline</Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
