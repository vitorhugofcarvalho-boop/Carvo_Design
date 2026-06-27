export type LeadStatus =
  | 'captado'
  | 'qualificado'
  | 'abordagem_enviada'
  | 'respondeu'
  | 'diagnostico_enviado'
  | 'conversa_andamento'
  | 'pediu_preco'
  | 'proposta_enviada'
  | 'fechado'
  | 'perdido'
  | 'nutricao_futura'

export type LeadPriority = 'baixa' | 'media' | 'alta' | 'prioridade_maxima'

// ─── Action Log ──────────────────────────────────────
export type ActionType =
  | 'lead_created'
  | 'lead_qualified'
  | 'approach_sent'
  | 'followup_sent'
  | 'status_changed'
  | 'note_added'
  | 'response_received'
  | 'meeting_scheduled'
  | 'proposal_sent'
  | 'sale_closed'

export interface ActionLog {
  id: string
  leadId: string | null
  type: ActionType
  timestamp: number
  description?: string
}

// ─── Period Filter ──────────────────────────────────
export type PeriodKey = 'hoje' | 'ontem' | '7d' | '30d' | 'este_mes' | 'personalizado'

export interface PeriodFilter {
  key: PeriodKey
  start: number
  end: number
  label: string
}

export const ACTION_LABELS: Record<ActionType, string> = {
  lead_created: 'Lead cadastrado',
  lead_qualified: 'Lead qualificado',
  approach_sent: 'Abordagem enviada',
  followup_sent: 'Follow-up enviado',
  status_changed: 'Status alterado',
  note_added: 'Observação adicionada',
  response_received: 'Resposta recebida',
  meeting_scheduled: 'Reunião marcada',
  proposal_sent: 'Proposta enviada',
  sale_closed: 'Venda fechada',
}

// ─── Daily Goals ────────────────────────────────────
export type GoalType = 'lead_created' | 'lead_qualified' | 'approach_sent' | 'followup_sent' | 'proposal_sent'

export interface DailyGoal {
  id: string
  label: string
  type: GoalType
  target: number
}

export const METAS_PADRAO: DailyGoal[] = [
  { id: 'g_leads', label: 'Cadastrar 20 leads', type: 'lead_created', target: 20 },
  { id: 'g_abordagens', label: 'Enviar 20 abordagens', type: 'approach_sent', target: 20 },
  { id: 'g_followups', label: 'Fazer 10 follow-ups', type: 'followup_sent', target: 10 },
  { id: 'g_qualificados', label: 'Qualificar 5 leads', type: 'lead_qualified', target: 5 },
  { id: 'g_propostas', label: 'Enviar 2 propostas', type: 'proposal_sent', target: 2 },
]

export type TipoOferta =
  | 'mentoria'
  | 'curso'
  | 'formacao'
  | 'consultoria'
  | 'comunidade'
  | 'workshop'
  | 'imersao'
  | 'outro'

export type TipoContato =
  | 'dm_inicial'
  | 'follow_up'
  | 'resposta_recebida'
  | 'diagnostico_enviado'
  | 'call_marcada'
  | 'proposta_enviada'
  | 'fechamento'
  | 'perdido'

export const STATUS_LEAD: { valor: LeadStatus; rotulo: string; cor: string }[] = [
  { valor: 'captado', rotulo: 'Captado', cor: 'bg-zinc-500/15 text-zinc-300' },
  { valor: 'qualificado', rotulo: 'Qualificado', cor: 'bg-blue-500/15 text-blue-300' },
  { valor: 'abordagem_enviada', rotulo: 'Abordagem enviada', cor: 'bg-amber-500/15 text-amber-300' },
  { valor: 'respondeu', rotulo: 'Respondeu', cor: 'bg-violet-500/15 text-violet-300' },
  { valor: 'diagnostico_enviado', rotulo: 'Diagnóstico enviado', cor: 'bg-cyan-500/15 text-cyan-300' },
  { valor: 'conversa_andamento', rotulo: 'Conversa em andamento', cor: 'bg-indigo-500/15 text-indigo-300' },
  { valor: 'pediu_preco', rotulo: 'Pediu preço', cor: 'bg-orange-500/15 text-orange-300' },
  { valor: 'proposta_enviada', rotulo: 'Proposta enviada', cor: 'bg-pink-500/15 text-pink-300' },
  { valor: 'fechado', rotulo: 'Fechado', cor: 'bg-green-500/15 text-green-300' },
  { valor: 'perdido', rotulo: 'Perdido', cor: 'bg-red-500/15 text-red-300' },
  { valor: 'nutricao_futura', rotulo: 'Nutrição futura', cor: 'bg-slate-500/15 text-slate-300' },
]

export const STATUS_ORDER: LeadStatus[] = [
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

export const PRIORIDADE: Record<LeadPriority, { rotulo: string; cor: string }> = {
  baixa: { rotulo: 'Baixa', cor: 'bg-zinc-500/15 text-zinc-300' },
  media: { rotulo: 'Média', cor: 'bg-blue-500/15 text-blue-300' },
  alta: { rotulo: 'Alta', cor: 'bg-orange-500/15 text-orange-300' },
  prioridade_maxima: { rotulo: 'Máxima', cor: 'bg-red-500/15 text-red-300' },
}

export const TIPOS_OFERTA: { valor: TipoOferta; rotulo: string }[] = [
  { valor: 'mentoria', rotulo: 'Mentoria' },
  { valor: 'curso', rotulo: 'Curso' },
  { valor: 'formacao', rotulo: 'Formação' },
  { valor: 'consultoria', rotulo: 'Consultoria' },
  { valor: 'comunidade', rotulo: 'Comunidade' },
  { valor: 'workshop', rotulo: 'Workshop' },
  { valor: 'imersao', rotulo: 'Imersão' },
  { valor: 'outro', rotulo: 'Outro' },
]

export const TIPOS_CONTATO: { valor: TipoContato; rotulo: string }[] = [
  { valor: 'dm_inicial', rotulo: 'DM inicial' },
  { valor: 'follow_up', rotulo: 'Follow-up' },
  { valor: 'resposta_recebida', rotulo: 'Resposta recebida' },
  { valor: 'diagnostico_enviado', rotulo: 'Diagnóstico enviado' },
  { valor: 'call_marcada', rotulo: 'Call marcada' },
  { valor: 'proposta_enviada', rotulo: 'Proposta enviada' },
  { valor: 'fechamento', rotulo: 'Fechamento' },
  { valor: 'perdido', rotulo: 'Perdido' },
]

export interface QualificationCriteria {
  temProdutoClaro: number
  temCtaVenda: number
  temAudienciaAtiva: number
  visualPoderiaMelhorar: number
  consigoAjudar: number
}

export interface ContactRecord {
  id: string
  date: number
  type: TipoContato
  notes: string
}

export interface Lead {
  id: string
  nome: string
  perfilInstagram: string
  linkPerfil: string
  nicho: string
  produtoOferta: string
  tipoOferta: TipoOferta
  seguidores: number
  linkOferta: string
  sinalVendaPercebido: string
  problemaVisualPercebido: string
  pontoPositivo: string
  oportunidadeVisual: string
  observacoes: string
  status: LeadStatus
  qualification: QualificationCriteria
  nota: number
  prioridade: LeadPriority
  primeiraAbordagem: number | null
  ultimoContato: number | null
  proximoFollowUp: number | null
  qtdFollowUps: number
  proximaAcao: string
  historico: ContactRecord[]
  criadoEm: number
  atualizadoEm: number
}

export function criarLeadPadrao(): Lead {
  return {
    id: crypto.randomUUID(),
    nome: '',
    perfilInstagram: '',
    linkPerfil: '',
    nicho: '',
    produtoOferta: '',
    tipoOferta: 'outro',
    seguidores: 0,
    linkOferta: '',
    sinalVendaPercebido: '',
    problemaVisualPercebido: '',
    pontoPositivo: '',
    oportunidadeVisual: '',
    observacoes: '',
    status: 'captado',
    qualification: {
      temProdutoClaro: 0,
      temCtaVenda: 0,
      temAudienciaAtiva: 0,
      visualPoderiaMelhorar: 0,
      consigoAjudar: 0,
    },
    nota: 0,
    prioridade: 'baixa',
    primeiraAbordagem: null,
    ultimoContato: null,
    proximoFollowUp: null,
    qtdFollowUps: 0,
    proximaAcao: '',
    historico: [],
    criadoEm: Date.now(),
    atualizadoEm: Date.now(),
  }
}

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
  goalType?: GoalType
  goalTarget?: number
}

export const CHECKLIST_PADRAO: ChecklistItem[] = [
  // Metas quantitativas (auto-completam)
  { id: 'g_leads', label: 'Cadastrar 20 leads', done: false, goalType: 'lead_created', goalTarget: 20 },
  { id: 'g_abordagens', label: 'Enviar 20 abordagens', done: false, goalType: 'approach_sent', goalTarget: 20 },
  { id: 'g_followups', label: 'Fazer 10 follow-ups', done: false, goalType: 'followup_sent', goalTarget: 10 },
  { id: 'g_qualificados', label: 'Qualificar 5 leads', done: false, goalType: 'lead_qualified', goalTarget: 5 },
  { id: 'g_propostas', label: 'Enviar 2 propostas', done: false, goalType: 'proposal_sent', goalTarget: 2 },
  // Tarefas manuais
  { id: 'atualizar_status', label: 'Atualizar status dos leads', done: false },
  { id: 'aprendizados', label: 'Registrar aprendizados do dia', done: false },
]

export interface WeeklyReport {
  id: string
  weekStart: string
  leadsCaptados: number
  leadsQualificados: number
  dmsEnviadas: number
  respostas: number
  propostas: number
  fechamentos: number
  nichosQueResponderam: string
  mensagemQueGerouResposta: string
  objecoes: string
  aprendizado: string
  criadoEm: number
}
