import { Link } from 'react-router-dom'
import {
  Users, Send, MessageCircle, Target, TrendingUp, ListChecks,
  Calendar, FileText, DollarSign, Activity,
} from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { useMetrics } from '@/hooks/useMetrics'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PeriodFilter } from '@/components/PeriodFilter'
import { leadsParaAbordarHoje, followupsPendentes, leadsSemProximaAcao, leadsQuentes } from '@/utils/dashboard'
import { STATUS_LEAD, PRIORIDADE } from '@/types'
import { dataRelativa } from '@/utils/formatting'
import { cn } from '@/utils/cn'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const { leads } = useLeads()
  const navigate = useNavigate()
  const { metrics, funnel, period, periodKey, alterarPeriodo, definirPersonalizado } = useMetrics()

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

      <div className="mb-4">
        <PeriodFilter value={periodKey} onChange={alterarPeriodo} onPersonalizado={definirPersonalizado} />
      </div>

      <div className="mb-1">
        <p className="text-xs text-brand-platinum/30">{period.label}</p>
      </div>

      {/* Cards de métricas do período */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 mb-6">
        <StatCard
          rotulo="Leads cadastrados"
          valor={String(metrics.leadsCriados)}
          icone={<Users className="size-5" />}
        />
        <StatCard
          rotulo="Leads qualificados"
          valor={String(metrics.leadsQualificados)}
          cor="text-blue-400"
          icone={<Target className="size-5" />}
        />
        <StatCard
          rotulo="Abordagens enviadas"
          valor={String(metrics.abordagensEnviadas)}
          cor="text-amber-400"
          icone={<Send className="size-5" />}
        />
        <StatCard
          rotulo="Follow-ups feitos"
          valor={String(metrics.followupsRealizados)}
          cor="text-violet-400"
          icone={<MessageCircle className="size-5" />}
        />
        <StatCard
          rotulo="Ações realizadas"
          valor={String(metrics.totalAcoes)}
          cor="text-brand-accent"
          icone={<Activity className="size-5" />}
        />
        <StatCard
          rotulo="Reuniões marcadas"
          valor={String(metrics.reunioesMarcadas)}
          cor="text-indigo-400"
          icone={<Calendar className="size-5" />}
        />
        <StatCard
          rotulo="Propostas enviadas"
          valor={String(metrics.propostasEnviadas)}
          cor="text-pink-400"
          icone={<FileText className="size-5" />}
        />
        <StatCard
          rotulo="Vendas fechadas"
          valor={String(metrics.vendasFechadas)}
          cor="text-green-400"
          icone={<DollarSign className="size-5" />}
        />
      </div>

      {/* Funil de avanço */}
      {funnel.some((f) => f.count > 0) && (
        <Card className="mb-6">
          <h2 className="text-sm font-semibold text-brand-platinum mb-3 flex items-center gap-2">
            <TrendingUp className="size-4 text-brand-accent" />
            Funil de avanço
          </h2>
          <div className="space-y-2">
            {funnel.map((f, i) => {
              const primeiro = i === 0
              const total = funnel[0]?.count || 1
              const largura = primeiro ? 100 : Math.round((f.count / total) * 100)
              return (
                <div key={f.type}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-brand-platinum/70">{f.label}</span>
                    <span className="text-brand-platinum font-bold tabular-nums">{f.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-brand-base overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        i === 0 && 'bg-brand-primary',
                        i === 1 && 'bg-amber-500',
                        i === 2 && 'bg-violet-500',
                        i === 3 && 'bg-blue-500',
                        i === 4 && 'bg-indigo-500',
                        i === 5 && 'bg-pink-500',
                        i === 6 && 'bg-green-500',
                      )}
                      style={{ width: `${largura}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

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
