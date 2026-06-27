/*
  actionStore — Registro global de ações comerciais (MVP)
  Persistência: localStorage (via store subjacente)

  Nota técnica:
  Para um MVP com localStorage, esta estrutura é adequada.
  Em produção com multi-dispositivo, migrar para tabela `actions`
  no Supabase com índices por lead_id, type e timestamp.
*/

import type { ActionLog, TipoContato } from '@/types'

const ACTIONS_KEY = 'prospectos:actions'
const BACKFILL_KEY = 'prospectos:actions_backfilled'

function gerarId(): string {
  return crypto.randomUUID()
}

export const actionStore = {
  listar(): ActionLog[] {
    const raw = localStorage.getItem(ACTIONS_KEY)
    if (!raw) return []
    try {
      return JSON.parse(raw) as ActionLog[]
    } catch {
      return []
    }
  },

  salvar(actions: ActionLog[]): void {
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions))
  },

  registrar(action: Omit<ActionLog, 'id'> & { timestamp?: number }): void {
    const entry: ActionLog = {
      ...action,
      id: gerarId(),
      timestamp: action.timestamp ?? Date.now(),
    }
    const all = this.listar()
    all.push(entry)
    this.salvar(all)
    // Notifica listeners para atualização em tempo real
    window.dispatchEvent(new CustomEvent('action:registered', { detail: entry }))
  },

  listarPorPeriodo(start: number, end: number): ActionLog[] {
    return this.listar().filter((a) => a.timestamp >= start && a.timestamp <= end)
  },

  listarPorLead(leadId: string): ActionLog[] {
    return this.listar().filter((a) => a.leadId === leadId)
  },

  listarHoje(): ActionLog[] {
    const { inicio, fim } = getTodayRange()
    return this.listarPorPeriodo(inicio, fim)
  },

  /** Mapeia TipoContato → ActionType */
  mapearTipoContato(tipo: TipoContato): ActionType {
    const mapa: Record<TipoContato, ActionType> = {
      dm_inicial: 'approach_sent',
      follow_up: 'followup_sent',
      resposta_recebida: 'response_received',
      diagnostico_enviado: 'note_added',
      call_marcada: 'meeting_scheduled',
      proposta_enviada: 'proposal_sent',
      fechamento: 'sale_closed',
      perdido: 'status_changed',
    }
    return mapa[tipo]
  },

  /** Backfill único: cria ActionLogs a partir de leads existentes */
  backfillSeNecessario(): void {
    if (localStorage.getItem(BACKFILL_KEY) === '1') return

    const leads = store.listarLeads()

    for (const lead of leads) {
      // Criação do lead
      this.registrar({
        leadId: lead.id,
        type: 'lead_created',
        timestamp: lead.criadoEm,
        description: `Lead ${lead.nome} criado`,
      })

      // Qualificação (se nota >= 5)
      if (lead.nota >= 5) {
        this.registrar({
          leadId: lead.id,
          type: 'lead_qualified',
          timestamp: lead.criadoEm,
          description: `Lead ${lead.nome} qualificado (nota ${lead.nota})`,
        })
      }

      // Histórico de contatos
      for (const h of lead.historico) {
        this.registrar({
          leadId: lead.id,
          type: this.mapearTipoContato(h.type),
          timestamp: h.date,
          description: h.notes,
        })
      }
    }

    localStorage.setItem(BACKFILL_KEY, '1')
  },
}

function getTodayRange(): { inicio: number; fim: number } {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const inicio = d.getTime()
  const fim = inicio + 86_400_000 - 1
  return { inicio, fim }
}
