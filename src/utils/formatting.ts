const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatarMoeda(valor: number): string {
  return brl.format(valor || 0)
}

export function formatarData(ts?: number | null): string {
  if (!ts) return '—'
  return dateFmt.format(new Date(ts))
}

export function formatarDataHora(ts?: number | null): string {
  if (!ts) return '—'
  return dateTimeFmt.format(new Date(ts))
}

export function formatarSeguidores(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`
  return String(n)
}

export function formatarNumero(n: number): string {
  return new Intl.NumberFormat('pt-BR').format(n)
}

const DIA_MS = 86_400_000

function inicioDeHoje(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function estaAtrasado(ts?: number | null): boolean {
  if (!ts) return false
  return ts < inicioDeHoje()
}

export function dataRelativa(ts?: number | null): string {
  if (!ts) return '—'
  const alvo = new Date(ts)
  alvo.setHours(0, 0, 0, 0)
  const dias = Math.round((alvo.getTime() - inicioDeHoje()) / DIA_MS)
  if (dias === 0) return 'Hoje'
  if (dias === 1) return 'Amanhã'
  if (dias === -1) return 'Ontem'
  if (dias > 1) return `Em ${dias} dias`
  return `Há ${Math.abs(dias)} dias`
}

export function timestampParaInputDate(ts?: number | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function dataParaTimestamp(valor: string): number | undefined {
  if (!valor) return undefined
  return new Date(valor + 'T00:00:00').getTime()
}

export function inicioDaSemana(): string {
  const d = new Date()
  const dia = d.getDay()
  const diff = d.getDate() - dia + (dia === 0 ? -6 : 1)
  d.setDate(diff)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatarPorcentagem(valor: number, total: number): string {
  if (total <= 0) return '0%'
  return `${Math.round((valor / total) * 100)}%`
}
