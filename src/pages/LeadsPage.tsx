import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Users, Plus, Search, Filter, AlertCircle, Upload } from 'lucide-react'
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
import { Card } from '@/components/ui/Card'
import { importLeadFromJson } from '@/utils/importLead'
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
  const [importedLead, setImportedLead] = useState<Lead | null>(null)
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [formKey, setFormKey] = useState(0)

  const novoParam = params.get('novo') === '1'
  const modalAberto = editando !== undefined || novoParam
  const isEditMode = !!editando && !importedLead

  function fechar() {
    setEditando(undefined)
    setImportedLead(null)
    setJsonInput('')
    setJsonError('')
    setFormKey(0)
    if (novoParam) { params.delete('novo'); setParams(params, { replace: true }) }
  }

  function handleJsonImport() {
    setJsonError('')
    try {
      const raw = JSON.parse(jsonInput)
      if (!raw || typeof raw !== 'object') throw new Error()
      const lead = importLeadFromJson(raw as Record<string, unknown>)
      setImportedLead(lead)
      setFormKey((k) => k + 1)
    } catch {
      setJsonError('Não consegui importar os dados. Verifique se o JSON veio da extensão ProspectOS Capture.')
    }
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
        titulo={isEditMode ? 'Editar lead' : 'Novo lead'}
        onFechar={fechar}
      >
        {!editando && !importedLead && (
          <Card className="mb-4">
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-2 text-xs font-medium text-brand-platinum/50 hover:text-brand-platinum/70 transition-colors">
                <Upload className="size-3.5" />
                Importar lead via JSON
              </summary>
              <div className="mt-3 space-y-3">
                <p className="text-xs text-brand-platinum/40">
                  Cole o JSON gerado pela extensão ProspectOS Capture para preencher o formulário automaticamente.
                </p>
                <textarea
                  value={jsonInput}
                  onChange={(e) => { setJsonInput(e.target.value); setJsonError('') }}
                  placeholder='{"name": "...", "instagramHandle": "...", ...}'
                  rows={4}
                  className="w-full rounded-lg border border-brand-deep-hover bg-brand-base px-3 py-2 text-xs text-brand-platinum placeholder:text-brand-platinum/20 outline-none transition-colors focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/60 min-h-16 resize-y font-mono"
                />
                {jsonError && (
                  <div className="flex items-start gap-2 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-3 py-2 text-xs text-brand-danger">
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    <span>{jsonError}</span>
                  </div>
                )}
                <Button onClick={handleJsonImport} variante="secundario">
                  <Upload className="size-3.5" /> Preencher formulário
                </Button>
              </div>
            </details>
          </Card>
        )}

        {importedLead && !isEditMode && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand-primary/30 bg-brand-primary/5 px-3 py-2 text-xs text-brand-platinum/70">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-brand-primary" />
            <span>Lead importado. Revise os dados antes de salvar.</span>
          </div>
        )}

        <LeadForm
          key={formKey}
          inicial={importedLead ?? editando ?? undefined}
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
