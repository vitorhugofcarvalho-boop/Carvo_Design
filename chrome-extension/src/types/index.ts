export const OFFER_TYPES = [
  'Mentoria', 'Curso', 'Formação', 'Consultoria',
  'Comunidade', 'Workshop', 'Imersão', 'Outro',
] as const

export type OfferType = (typeof OFFER_TYPES)[number]

export type ScoreValue = 0 | 1 | 2

export interface QualificationCriteria {
  temProdutoClaro: ScoreValue
  temCtaVenda: ScoreValue
  temAudienciaAtiva: ScoreValue
  visualPoderiaMelhorar: ScoreValue
  consigoAjudar: ScoreValue
}

export type Priority = 'baixa' | 'media' | 'alta' | 'prioridade_maxima'

export interface Qualification {
  score: number
  priority: Priority
  criteria: QualificationCriteria
}

export const CRITERIA_LABELS: Record<keyof QualificationCriteria, string> = {
  temProdutoClaro: 'Tem produto ou serviço claro',
  temCtaVenda: 'Tem CTA ou link de venda',
  temAudienciaAtiva: 'Tem audiência minimamente ativa',
  visualPoderiaMelhorar: 'O visual poderia melhorar',
  consigoAjudar: 'Eu consigo ajudar de forma óbvia',
}

export function calcularNota(criteria: QualificationCriteria): number {
  return Object.values(criteria).reduce((sum, v) => sum + v, 0)
}

export function definirPrioridade(score: number): Priority {
  if (score >= 9) return 'prioridade_maxima'
  if (score >= 7) return 'alta'
  if (score >= 5) return 'media'
  return 'baixa'
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  prioridade_maxima: 'Prioridade Máxima',
}

export interface CapturedLead {
  name: string
  instagramHandle: string
  instagramUrl: string
  niche: string
  offerName: string
  offerType: OfferType
  followers: string
  bioLink: string
  salesSignal: string
  visualProblem: string
  positivePoint: string
  visualOpportunity: string
  notes: string
  qualification: Qualification | null
}

export function emptyLead(): CapturedLead {
  return {
    name: '',
    instagramHandle: '',
    instagramUrl: '',
    niche: '',
    offerName: '',
    offerType: 'Outro',
    followers: '',
    bioLink: '',
    salesSignal: '',
    visualProblem: '',
    positivePoint: '',
    visualOpportunity: '',
    notes: '',
    qualification: null,
  }
}

export function emptyCriteria(): QualificationCriteria {
  return {
    temProdutoClaro: 0,
    temCtaVenda: 0,
    temAudienciaAtiva: 0,
    visualPoderiaMelhorar: 0,
    consigoAjudar: 0,
  }
}
