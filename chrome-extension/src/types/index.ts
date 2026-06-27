export const OFFER_TYPES = [
  'Mentoria', 'Curso', 'Formação', 'Consultoria',
  'Comunidade', 'Workshop', 'Imersão', 'Outro',
] as const

export type OfferType = (typeof OFFER_TYPES)[number]

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
  }
}
