import type { Lead } from '@/types'

const HEADERS = [
  'Nome', 'Perfil Instagram', 'Link Perfil', 'Nicho', 'Produto/Oferta',
  'Tipo Oferta', 'Seguidores', 'Link Oferta', 'Status', 'Nota', 'Prioridade',
  'Sinal de Venda', 'Problema Visual', 'Ponto Positivo', 'Oportunidade Visual',
  'Observações', 'Primeira Abordagem', 'Último Contato', 'Próximo Follow-up',
  'Qtd Follow-ups', 'Próxima Ação',
]

function escapeCSV(valor: string | number | null | undefined): string {
  if (valor == null) return ''
  const s = String(valor)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function exportarCSV(leads: Lead[]): string {
  const linhas = [HEADERS.join(',')]
  for (const l of leads) {
    linhas.push([
      escapeCSV(l.nome),
      escapeCSV(l.perfilInstagram),
      escapeCSV(l.linkPerfil),
      escapeCSV(l.nicho),
      escapeCSV(l.produtoOferta),
      escapeCSV(l.tipoOferta),
      escapeCSV(l.seguidores),
      escapeCSV(l.linkOferta),
      escapeCSV(l.status),
      escapeCSV(l.nota),
      escapeCSV(l.prioridade),
      escapeCSV(l.sinalVendaPercebido),
      escapeCSV(l.problemaVisualPercebido),
      escapeCSV(l.pontoPositivo),
      escapeCSV(l.oportunidadeVisual),
      escapeCSV(l.observacoes),
      escapeCSV(l.primeiraAbordagem ? new Date(l.primeiraAbordagem).toISOString() : ''),
      escapeCSV(l.ultimoContato ? new Date(l.ultimoContato).toISOString() : ''),
      escapeCSV(l.proximoFollowUp ? new Date(l.proximoFollowUp).toISOString() : ''),
      escapeCSV(l.qtdFollowUps),
      escapeCSV(l.proximaAcao),
    ].join(','))
  }
  return linhas.join('\n')
}

export function baixarCSV(leads: Lead[]): void {
  const csv = exportarCSV(leads)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prospectos-leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
