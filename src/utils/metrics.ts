import type { ActionLog, ActionType, Lead, PeriodFilter, PeriodKey } from '@/types'

// ─── Range de datas ──────────────────────────────────

function inicioDoDia(d: Date): number {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c.getTime()
}

function fimDoDia(d: Date): number {
  const c = new Date(d)
  c.setHours(23, 59, 59, 999)
  return c.getTime()
}

export function getPeriodRange(key: PeriodKey, customStart?: number, customEnd?: number): PeriodFilter {
  const agora = new Date()
  const hojeInicio = inicioDoDia(agora)
  const hojeFim = fimDoDia(agora)
  const labels: Record<PeriodKey, string> = {
    hoje: 'Hoje',
    ontem: 'Ontem',
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    este_mes: 'Este mês',
    personalizado: 'Personalizado',
  }

  switch (key) {
    case 'hoje':
      return { key, start: hojeInicio, end: hojeFim, label: labels.hoje }
    case 'ontem': {
      const ontem = new Date(agora)
      ontem.setDate(ontem.getDate() - 1)
      return { key, start: inicioDoDia(ontem), end: fimDoDia(ontem), label: labels.ontem }
    }
    case '7d': {
      const d7 = new Date(agora)
      d7.setDate(d7.getDate() - 6)
      return { key, start: inicioDoDia(d7), end: hojeFim, label: labels['7d'] }
    }
    case '30d': {
      const d30 = new Date(agora)
      d30.setDate(d30.getDate() - 29)
      return { key, start: inicioDoDia(d30), end: hojeFim, label: labels['30d'] }
    }
    case 'este_mes': {
      const mesInicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
      return { key, start: inicioDoDia(mesInicio), end: hojeFim, label: labels.este_mes }
    }
    case 'personalizado':
      return {
        key,
        start: customStart ?? hojeInicio,
        end: customEnd ?? hojeFim,
        label: labels.personalizado,
      }
  }
}

// ─── Contagem de ações ────────────────────────────────

export function countActionsByType(actions: ActionLog[], type: ActionType): number {
  return actions.filter((a) => a.type === type).length
}

export function countAllActions(actions: ActionLog[]): number {
  return actions.length
}

// ─── Métricas agregadas ───────────────────────────────

export interface DailyMetrics {
  leadsCriados: number
  leadsQualificados: number
  abordagensEnviadas: number
  followupsRealizados: number
  reunioesMarcadas: number
  propostasEnviadas: number
  vendasFechadas: number
  totalAcoes: number
  leadsSemAcao: number
}

export function calculateMetrics(actions: ActionLog[], leads: Lead[], start: number, end: number): DailyMetrics {
  const periodActions = actions.filter((a) => a.timestamp >= start && a.timestamp <= end)
  const leadIdsInPeriod = new Set(periodActions.map((a) => a.leadId).filter(Boolean) as string[])

  // Leads criados no período (pelo campo criadoEm)
  const leadsCriados = leads.filter((l) => l.criadoEm >= start && l.criadoEm <= end).length

  return {
    leadsCriados,
    leadsQualificados: countActionsByType(periodActions, 'lead_qualified'),
    abordagensEnviadas: countActionsByType(periodActions, 'approach_sent'),
    followupsRealizados: countActionsByType(periodActions, 'followup_sent'),
    reunioesMarcadas: countActionsByType(periodActions, 'meeting_scheduled'),
    propostasEnviadas: countActionsByType(periodActions, 'proposal_sent'),
    vendasFechadas: countActionsByType(periodActions, 'sale_closed'),
    totalAcoes: countAllActions(periodActions),
    leadsSemAcao: leads.filter((l) => !leadIdsInPeriod.has(l.id)).length,
  }
}

// ─── Funil de avanço ──────────────────────────────────

export interface FunnelStage {
  label: string
  count: number
  type: ActionType | 'lead_created'
}

export function getFunnelMetrics(actions: ActionLog[], leads: Lead[], start: number, end: number): FunnelStage[] {
  const periodActions = actions.filter((a) => a.timestamp >= start && a.timestamp <= end)

  return [
    {
      label: 'Leads cadastrados',
      count: leads.filter((l) => l.criadoEm >= start && l.criadoEm <= end).length,
      type: 'lead_created',
    },
    {
      label: 'Leads abordados',
      count: countActionsByType(periodActions, 'approach_sent'),
      type: 'approach_sent',
    },
    {
      label: 'Leads respondidos',
      count: countActionsByType(periodActions, 'response_received'),
      type: 'response_received',
    },
    {
      label: 'Leads qualificados',
      count: countActionsByType(periodActions, 'lead_qualified'),
      type: 'lead_qualified',
    },
    {
      label: 'Reuniões marcadas',
      count: countActionsByType(periodActions, 'meeting_scheduled'),
      type: 'meeting_scheduled',
    },
    {
      label: 'Propostas enviadas',
      count: countActionsByType(periodActions, 'proposal_sent'),
      type: 'proposal_sent',
    },
    {
      label: 'Vendas fechadas',
      count: countActionsByType(periodActions, 'sale_closed'),
      type: 'sale_closed',
    },
  ]
}

// ─── Progresso de metas ───────────────────────────────

export interface GoalProgress {
  id: string
  label: string
  type: string
  current: number
  target: number
  done: boolean
  percent: number
}

export function getGoalProgress(actions: ActionLog[], leads: Lead[], start: number, end: number): GoalProgress[] {
  const metrics = calculateMetrics(actions, leads, start, end)
  const goals: { id: string; label: string; type: string; current: number; target: number }[] = [
    { id: 'g_leads', label: 'Cadastrar 20 leads', type: 'lead_created', current: metrics.leadsCriados, target: 20 },
    { id: 'g_abordagens', label: 'Enviar 20 abordagens', type: 'approach_sent', current: metrics.abordagensEnviadas, target: 20 },
    { id: 'g_followups', label: 'Fazer 10 follow-ups', type: 'followup_sent', current: metrics.followupsRealizados, target: 10 },
    { id: 'g_qualificados', label: 'Qualificar 5 leads', type: 'lead_qualified', current: metrics.leadsQualificados, target: 5 },
    { id: 'g_propostas', label: 'Enviar 2 propostas', type: 'proposal_sent', current: metrics.propostasEnviadas, target: 2 },
  ]
  return goals.map((g) => ({
    ...g,
    done: g.current >= g.target,
    percent: g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0,
  }))
}

// ─── Atualizar checklist por metas ────────────────────

export function updateChecklistFromGoals<T extends { id: string; done: boolean; goalType?: string; goalTarget?: number }>(
  items: T[],
  goals: GoalProgress[],
): { items: T[]; changed: boolean } {
  let changed = false
  const next = items.map((item) => {
    if (!item.goalType) return item
    const goal = goals.find((g) => g.type === item.goalType)
    if (!goal) return item
    const shouldBeDone = goal.done
    if (item.done !== shouldBeDone) {
      changed = true
      return { ...item, done: shouldBeDone }
    }
    return item
  })
  return { items: next, changed }
}
