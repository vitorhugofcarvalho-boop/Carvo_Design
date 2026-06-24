import type { LeadPriority, QualificationCriteria } from '@/types'

export function calcularNota(criteria: QualificationCriteria): number {
  return (
    criteria.temProdutoClaro +
    criteria.temCtaVenda +
    criteria.temAudienciaAtiva +
    criteria.visualPoderiaMelhorar +
    criteria.consigoAjudar
  )
}

export function definirPrioridade(nota: number): LeadPriority {
  if (nota >= 9) return 'prioridade_maxima'
  if (nota >= 7) return 'alta'
  if (nota >= 5) return 'media'
  return 'baixa'
}

export const CRITERIA_LABELS: Record<keyof QualificationCriteria, string> = {
  temProdutoClaro: 'Tem produto ou serviço claro',
  temCtaVenda: 'Tem CTA ou link de venda',
  temAudienciaAtiva: 'Tem audiência minimamente ativa',
  visualPoderiaMelhorar: 'O visual poderia melhorar',
  consigoAjudar: 'Eu consigo ajudar de forma óbvia',
}

export const CRITERIA_OPTIONS = [
  { value: 0, label: 'Não atende' },
  { value: 1, label: 'Atende parcialmente' },
  { value: 2, label: 'Atende totalmente' },
]
