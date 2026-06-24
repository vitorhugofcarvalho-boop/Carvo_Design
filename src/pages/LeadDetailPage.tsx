import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Camera, Trash2, Edit } from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import type { Lead, ContactRecord } from '@/types'
import { STATUS_LEAD, PRIORIDADE } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/Skeleton'
import { LeadForm } from '@/components/LeadForm'
import { ContactHistory } from '@/components/ContactHistory'
import { MessageTemplates } from '@/components/MessageTemplates'
import { StatusSelect } from '@/components/StatusSelect'
import { formatarData, formatarSeguidores, dataRelativa, timestampParaInputDate, dataParaTimestamp } from '@/utils/formatting'

export function LeadDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { getLead, putLead, removeLead } = useLeads()
  const [editando, setEditando] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const lead = useMemo(() => getLead(id), [id, getLead])

  if (lead === undefined) return <SkeletonList linhas={4} />
  if (lead === null) return (
    <EmptyState
      titulo="Lead não encontrado"
      descricao="Ele pode ter sido removido."
      acao={<Link to="/leads"><Button>Voltar para Leads</Button></Link>}
    />
  )

  const prioInfo = PRIORIDADE[lead.prioridade]

  async function excluir() {
    removeLead(id)
    navigate('/leads')
  }

  function atualizar(campo: Partial<Lead>) {
    if (!lead) return
    putLead({ ...lead, ...campo, atualizadoEm: Date.now() })
  }

  function adicionarContato(record: ContactRecord) {
    if (!lead) return
    const updated: Lead = {
      ...lead,
      historico: [...lead.historico, record],
      ultimoContato: record.date,
      qtdFollowUps: record.type === 'follow_up' || record.type === 'dm_inicial'
        ? lead.qtdFollowUps + 1
        : lead.qtdFollowUps,
      atualizadoEm: Date.now(),
    }
    if (record.type === 'dm_inicial' && !lead.primeiraAbordagem) {
      updated.primeiraAbordagem = record.date
    }
    putLead(updated)
  }

  const instagramUrl = lead.perfilInstagram
    ? `https://instagram.com/${lead.perfilInstagram.replace('@', '')}`
    : null

  return (
    <div>
      <div className="mb-4">
        <Link to="/leads" className="inline-flex items-center gap-1 text-xs text-brand-platinum/40 hover:text-brand-platinum/70 transition-colors">
          <ArrowLeft className="size-3.5" /> Voltar para leads
        </Link>
      </div>

      <PageHeader
        titulo={lead.nome}
        subtitulo={`@${lead.perfilInstagram || 'sem perfil'}`}
        acao={
          <div className="flex flex-wrap gap-2">
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                <Button variante="secundario">
                  <Camera className="size-4" /> Perfil
                </Button>
              </a>
            )}
            {lead.linkOferta && (
              <a href={lead.linkOferta} target="_blank" rel="noopener noreferrer">
                <Button variante="secundario">
                  <ExternalLink className="size-4" /> Oferta
                </Button>
              </a>
            )}
            <Button variante="secundario" onClick={() => setEditando(true)}>
              <Edit className="size-4" /> Editar
            </Button>
            <Button variante="perigo" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> Excluir
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dados gerais */}
          <Card>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-brand-platinum/40">Nicho</p>
                <p className="text-brand-platinum">{lead.nicho || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-brand-platinum/40">Produto/Oferta</p>
                <p className="text-brand-platinum">{lead.produtoOferta || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-brand-platinum/40">Tipo de oferta</p>
                <p className="text-brand-platinum capitalize">{lead.tipoOferta}</p>
              </div>
              <div>
                <p className="text-xs text-brand-platinum/40">Seguidores</p>
                <p className="text-brand-platinum">{lead.seguidores > 0 ? formatarSeguidores(lead.seguidores) : '—'}</p>
              </div>
              {lead.linkOferta && (
                <div className="col-span-2">
                  <p className="text-xs text-brand-platinum/40">Link da oferta</p>
                  <a href={lead.linkOferta} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline text-sm break-all">
                    {lead.linkOferta}
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Percepções */}
          {(lead.sinalVendaPercebido || lead.problemaVisualPercebido || lead.pontoPositivo || lead.oportunidadeVisual) && (
            <Card>
              <h3 className="text-sm font-semibold text-brand-platinum mb-3">Percepções</h3>
              <div className="space-y-3 text-sm">
                {lead.sinalVendaPercebido && (
                  <div>
                    <p className="text-xs text-brand-platinum/40 mb-0.5">Sinal de venda</p>
                    <p className="text-brand-platinum/70">{lead.sinalVendaPercebido}</p>
                  </div>
                )}
                {lead.problemaVisualPercebido && (
                  <div>
                    <p className="text-xs text-brand-platinum/40 mb-0.5">Problema visual</p>
                    <p className="text-brand-platinum/70">{lead.problemaVisualPercebido}</p>
                  </div>
                )}
                {lead.pontoPositivo && (
                  <div>
                    <p className="text-xs text-brand-platinum/40 mb-0.5">Ponto positivo</p>
                    <p className="text-brand-platinum/70">{lead.pontoPositivo}</p>
                  </div>
                )}
                {lead.oportunidadeVisual && (
                  <div>
                    <p className="text-xs text-brand-platinum/40 mb-0.5">Oportunidade</p>
                    <p className="text-brand-platinum/70">{lead.oportunidadeVisual}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Mensagens */}
          <MessageTemplates lead={lead} />

          {/* Histórico */}
          <Card>
            <ContactHistory historico={lead.historico} onAdicionar={adicionarContato} />
          </Card>

          {/* Observações */}
          {lead.observacoes && (
            <Card>
              <h3 className="text-sm font-semibold text-brand-platinum mb-2">Observações</h3>
              <p className="text-sm text-brand-platinum/70 whitespace-pre-wrap">{lead.observacoes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status e prioridade */}
          <Card>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-brand-platinum/40 mb-1">Status</p>
                <StatusSelect value={lead.status} onChange={(v) => atualizar({ status: v })} className="w-full" />
              </div>
              <div>
                <p className="text-xs text-brand-platinum/40 mb-1">Prioridade</p>
                <Badge className={prioInfo.cor}>{prioInfo.rotulo}</Badge>
              </div>
              <div>
                <p className="text-xs text-brand-platinum/40 mb-1">Nota</p>
                <p className="text-2xl font-bold text-brand-primary">{lead.nota}/10</p>
                <div className="mt-1 h-1.5 rounded-full bg-brand-base overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-primary transition-all"
                    style={{ width: `${(lead.nota / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Acompanhamento */}
          <Card>
            <h3 className="text-sm font-semibold text-brand-platinum mb-3">Acompanhamento</h3>
            <div className="space-y-2.5 text-sm">
              <div>
                <p className="text-xs text-brand-platinum/40">Primeira abordagem</p>
                <p className="text-brand-platinum">{formatarData(lead.primeiraAbordagem)}</p>
              </div>
              <div>
                <p className="text-xs text-brand-platinum/40">Último contato</p>
                <p className="text-brand-platinum">{formatarData(lead.ultimoContato)}</p>
              </div>
              <div>
                <p className="text-xs text-brand-platinum/40">Próximo follow-up</p>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={timestampParaInputDate(lead.proximoFollowUp)}
                    onChange={(e) => atualizar({ proximoFollowUp: dataParaTimestamp(e.target.value) ?? null })}
                    className="flex-1 rounded-lg border border-brand-deep-hover bg-brand-base px-2 py-1 text-xs text-brand-platinum outline-none focus-visible:border-brand-primary"
                  />
                </div>
                {lead.proximoFollowUp && (
                  <p className="text-xs text-brand-platinum/40 mt-0.5">{dataRelativa(lead.proximoFollowUp)}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-brand-platinum/40">Follow-ups enviados</p>
                <p className="text-brand-platinum">{lead.qtdFollowUps}</p>
              </div>
            </div>
          </Card>

          {/* Próxima ação */}
          <Card>
            <h3 className="text-sm font-semibold text-brand-platinum mb-2">Próxima ação</h3>
            <input
              value={lead.proximaAcao}
              onChange={(e) => atualizar({ proximaAcao: e.target.value })}
              placeholder="Defina a próxima ação..."
              className="w-full rounded-lg border border-brand-deep-hover bg-brand-base px-3 py-2 text-sm text-brand-platinum outline-none focus-visible:border-brand-primary placeholder:text-brand-platinum/20"
            />
          </Card>

          {/* Botões rápidos */}
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button variante="secundario" className="w-full">
                <ExternalLink className="size-4" /> Abrir perfil no Instagram
              </Button>
            </a>
          )}
        </div>
      </div>

      <Modal aberto={editando} titulo="Editar lead" onFechar={() => setEditando(false)}>
        <LeadForm inicial={lead} onSalvar={(l) => { putLead(l); setEditando(false) }} onCancelar={() => setEditando(false)} />
      </Modal>

      <Modal aberto={confirmDelete} titulo="Excluir lead?" onFechar={() => setConfirmDelete(false)}>
        <div>
          <p className="text-sm text-brand-platinum/60">Tem certeza que deseja excluir <strong className="text-brand-platinum">{lead.nome}</strong>? Esta ação não pode ser desfeita.</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variante="secundario" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            <Button variante="perigo" onClick={excluir}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
