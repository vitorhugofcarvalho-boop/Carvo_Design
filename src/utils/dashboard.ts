import type { Lead } from '@/types'

export interface DashboardMetrics {
  totalLeads: number
  qualificados: number
  dmsEnviadas: number
  respostas: number
  conversasAndamento: number
  propostasEnviadas: number
  fechados: number
  taxaResposta: string
  taxaConversao: string
}

export function calcularMetricas(leads: Lead[]): DashboardMetrics {
  const qualificados = leads.filter((l) => l.nota >= 5).length
  const dmsEnviadas = leads.filter((l) => l.primeiraAbordagem != null).length
  const respostas = leads.filter((l) =>
    l.historico.some((h) => h.type === 'resposta_recebida'),
  ).length
  const conversasAndamento = leads.filter(
    (l) => l.status === 'conversa_andamento' || l.status === 'diagnostico_enviado' || l.status === 'pediu_preco',
  ).length
  const propostasEnviadas = leads.filter((l) => l.status === 'proposta_enviada').length
  const fechados = leads.filter((l) => l.status === 'fechado').length

  const taxaResposta = dmsEnviadas > 0
    ? `${Math.round((respostas / dmsEnviadas) * 100)}%`
    : '—'

  const taxaConversao = propostasEnviadas > 0
    ? `${Math.round((fechados / propostasEnviadas) * 100)}%`
    : '—'

  return {
    totalLeads: leads.length,
    qualificados,
    dmsEnviadas,
    respostas,
    conversasAndamento,
    propostasEnviadas,
    fechados,
    taxaResposta,
    taxaConversao,
  }
}

export function leadsParaAbordarHoje(leads: Lead[]): Lead[] {
  return leads.filter((l) => l.status === 'captado' || l.status === 'qualificado')
}

export function followupsPendentes(leads: Lead[]): Lead[] {
  const agora = Date.now()
  return leads.filter(
    (l) =>
      l.proximoFollowUp != null &&
      l.proximoFollowUp <= agora + 86400000 &&
      l.status !== 'fechado' &&
      l.status !== 'perdido',
  )
}

export function leadsSemProximaAcao(leads: Lead[]): Lead[] {
  return leads.filter(
    (l) =>
      !l.proximaAcao &&
      l.status !== 'fechado' &&
      l.status !== 'perdido' &&
      l.status !== 'captado',
  )
}

export function leadsQuentes(leads: Lead[]): Lead[] {
  return leads.filter(
    (l) =>
      (l.prioridade === 'alta' || l.prioridade === 'prioridade_maxima') &&
      l.status !== 'fechado' &&
      l.status !== 'perdido',
  )
}
