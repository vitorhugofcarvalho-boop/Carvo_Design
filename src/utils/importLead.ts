import type { Lead, TipoOferta } from '@/types'
import { criarLeadPadrao, TIPOS_OFERTA } from '@/types'
import { calcularNota, definirPrioridade } from '@/utils/scoring'

function clamp(v: number): number {
  return Math.min(Math.max(Math.floor(v), 0), 2)
}

export function importLeadFromJson(raw: Record<string, unknown>): Lead {
  const lead = criarLeadPadrao()

  if (typeof raw.name === 'string') lead.nome = raw.name
  if (typeof raw.instagramHandle === 'string') lead.perfilInstagram = raw.instagramHandle.replace('@', '')
  if (typeof raw.instagramUrl === 'string') lead.linkPerfil = raw.instagramUrl
  if (typeof raw.niche === 'string') lead.nicho = raw.niche
  if (typeof raw.offerName === 'string') lead.produtoOferta = raw.offerName
  if (typeof raw.offerType === 'string') {
    const tipo = raw.offerType.toLowerCase()
    lead.tipoOferta = TIPOS_OFERTA.some((t) => t.valor === tipo) ? (tipo as TipoOferta) : 'outro'
  }
  if (typeof raw.followers === 'string' || typeof raw.followers === 'number') {
    const n = Number(String(raw.followers).replace(/[^0-9]/g, ''))
    lead.seguidores = isNaN(n) ? 0 : n
  }
  if (typeof raw.bioLink === 'string') lead.linkOferta = raw.bioLink
  if (typeof raw.salesSignal === 'string') lead.sinalVendaPercebido = raw.salesSignal
  if (typeof raw.visualProblem === 'string') lead.problemaVisualPercebido = raw.visualProblem
  if (typeof raw.positivePoint === 'string') lead.pontoPositivo = raw.positivePoint
  if (typeof raw.visualOpportunity === 'string') lead.oportunidadeVisual = raw.visualOpportunity
  if (typeof raw.notes === 'string') lead.observacoes = raw.notes

  const qual = raw.qualification
  if (qual && typeof qual === 'object') {
    const criteria = (qual as Record<string, unknown>).criteria as Record<string, unknown> | undefined
    if (criteria) {
      lead.qualification = {
        temProdutoClaro: clamp(Number(criteria.hasClearOffer ?? 0)),
        temCtaVenda: clamp(Number(criteria.hasCTAOrSalesLink ?? 0)),
        temAudienciaAtiva: clamp(Number(criteria.hasActiveAudience ?? 0)),
        visualPoderiaMelhorar: clamp(Number(criteria.visualCanImprove ?? 0)),
        consigoAjudar: clamp(Number(criteria.canClearlyHelp ?? 0)),
      }
      lead.nota = calcularNota(lead.qualification)
      lead.prioridade = definirPrioridade(lead.nota)
    }
  }

  return lead
}
