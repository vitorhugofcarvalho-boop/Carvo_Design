import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Users, Plus, Search, Filter } from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { useMetrics } from '@/hooks/useMetrics'
import type { Lead, LeadStatus, LeadPriority } from '@/types'
import { STATUS_LEAD, PRIORIDADE } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { LeadCard } from '@/components/LeadCard'
import { LeadForm } from '@/components/LeadForm'
import { LeadsMetricBar } from '@/components/LeadsMetricBar'
import { actionStore } from '@/data/actionStore'

export function LeadsPage() {
  const { leads, putLead } = useLeads()
  const { metrics, refresh } = useMetrics()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<LeadStatus | 'todos'>('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState<LeadPriority | 'todas'>('todas')
  const [editando, setEditando] = useState<Lead | null | undefined>(undefined)

  const novoParam = params.get('novo') === '1'
  const modalAberto = editando !== undefined || novoParam

  function fechar() {
    setEditando(undefined)
    if (novoParam) { params.delete('novo'); setParams(params, { replace: true }) }
  }

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return leads.filter((l) => {
      if (filtroStatus !== 'todos' && l.status !== filtroStatus) return false
      if (filtroPrioridade !== 'todas' && l.prioridade !== filtroPrioridade) return false
      if (!q) return true
      return (
        l.nome.toLowerCase().includes(q) ||
        l.perfilInstagram.toLowerCase().includes(q) ||
        l.nicho.toLowerCase().includes(q)
      )
    }).sort((a, b) => b.atualizadoEm - a.atualizadoEm)
  }, [leads, busca, filtroStatus, filtroPrioridade])

  return (
    <div>
      <PageHeader
        titulo="Leads"
        subtitulo={`${leads.length} lead(s) cadastrado(s)`}
        acao={
          <Button onClick={() => setEditando(null)}>
            <Plus className="size-4" /> Novo lead
          </Button>
        }
      />

      <LeadsMetricBar metrics={metrics} className="mb-4" />

      {leads.length > 0 && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-platinum/20" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, perfil ou nicho"
              className="w-full pl-9"
            />
          </div>
          <Select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as LeadStatus | 'todos')}
            className="sm:w-44"
          >
            <option value="todos">Todos os status</option>
            {STATUS_LEAD.map((s) => (
              <option key={s.valor} value={s.valor}>{s.rotulo}</option>
            ))}
          </Select>
          <Select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value as LeadPriority | 'todas')}
            className="sm:w-36"
          >
            <option value="todas">Todas</option>
            {Object.entries(PRIORIDADE).map(([key, v]) => (
              <option key={key} value={key}>{v.rotulo}</option>
            ))}
          </Select>
        </div>
      )}

      {leads.length === 0 && (
        <EmptyState
          icone={Users}
          titulo="Nenhum lead ainda"
          descricao="Cadastre seu primeiro lead para começar a prospectar."
          acao={<Button onClick={() => setEditando(null)}>Novo lead</Button>}
        />
      )}

      {leads.length > 0 && filtrados.length === 0 && (
        <EmptyState
          icone={Filter}
          titulo="Nenhum lead encontrado"
          descricao="Tente alterar os filtros ou a busca."
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((l) => (
          <LeadCard
            key={l.id}
            lead={l}
            onClick={() => navigate(`/leads/${l.id}`)}
          />
        ))}
      </div>

      <Modal
        aberto={modalAberto}
        titulo={editando ? 'Editar lead' : 'Novo lead'}
        onFechar={fechar}
      >
          <LeadForm
            inicial={editando ?? undefined}
            onSalvar={(lead) => {
              const isNew = !editando
              putLead(lead)
              if (isNew) {
                actionStore.registrar({ leadId: lead.id, type: 'lead_created', description: `Lead ${lead.nome} criado` })
              }
              if (lead.nota >= 5 && isNew) {
                actionStore.registrar({ leadId: lead.id, type: 'lead_qualified', description: `Lead ${lead.nome} qualificado (nota ${lead.nota})` })
              }
              refresh()
              fechar()
            }}
            onCancelar={fechar}
          />
      </Modal>
    </div>
  )
}
