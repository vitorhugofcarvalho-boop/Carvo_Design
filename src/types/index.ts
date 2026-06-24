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
}

export const CHECKLIST_PADRAO: ChecklistItem[] = [
  { id: 'buscar_perfis', label: 'Buscar 15 a 20 perfis', done: false },
  { id: 'qualificar_leads', label: 'Qualificar 5 a 8 leads', done: false },
  { id: 'registrar_leads', label: 'Registrar leads no app', done: false },
  { id: 'enviar_dms', label: 'Enviar 3 a 5 DMs personalizadas', done: false },
  { id: 'followups_pendentes', label: 'Fazer follow-ups pendentes', done: false },
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
