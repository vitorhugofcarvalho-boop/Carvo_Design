import type { Lead, TipoOferta } from '@/types'
import { criarLeadPadrao, TIPOS_OFERTA } from '@/types'

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

  lead.fonte = 'extensao'

  return lead
}
