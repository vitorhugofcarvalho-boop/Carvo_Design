import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react'
import type { Lead } from '@/types'
import { criarLeadPadrao, TIPOS_OFERTA } from '@/types'
import { calcularNota, definirPrioridade } from '@/utils/scoring'
import { LeadForm } from '@/components/LeadForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useLeads } from '@/hooks/useLeads'

function mapExtensionToLead(raw: Record<string, unknown>): Partial<Lead> {
  const m: Partial<Lead> = {}

  if (raw.name) m.nome = String(raw.name)
  if (raw.instagramHandle) m.perfilInstagram = String(raw.instagramHandle).replace('@', '')
  if (raw.instagramUrl) m.linkPerfil = String(raw.instagramUrl)
  if (raw.niche) m.nicho = String(raw.niche)
  if (raw.offerName) m.produtoOferta = String(raw.offerName)
  if (raw.offerType) {
    const tipo = String(raw.offerType).toLowerCase()
    m.tipoOferta = TIPOS_OFERTA.some((t) => t.valor === tipo) ? (tipo as Lead['tipoOferta']) : 'outro'
  }
  if (raw.followers) {
    const n = Number(raw.followers)
    if (!isNaN(n)) m.seguidores = n
  }
  if (raw.bioLink) m.linkOferta = String(raw.bioLink)
  if (raw.salesSignal) m.sinalVendaPercebido = String(raw.salesSignal)
  if (raw.visualProblem) m.problemaVisualPercebido = String(raw.visualProblem)
  if (raw.positivePoint) m.pontoPositivo = String(raw.positivePoint)
  if (raw.visualOpportunity) m.oportunidadeVisual = String(raw.visualOpportunity)
  if (raw.notes) m.observacoes = String(raw.notes)

  const q = raw.qualification
  if (q && typeof q === 'object') {
    const criteria = (q as Record<string, unknown>).criteria as Record<string, number> | undefined
    if (criteria) {
      const qual = {
        temProdutoClaro: Math.min(Math.max(criteria.temProdutoClaro ?? 0, 0), 2),
        temCtaVenda: Math.min(Math.max(criteria.temCtaVenda ?? 0, 0), 2),
        temAudienciaAtiva: Math.min(Math.max(criteria.temAudienciaAtiva ?? 0, 0), 2),
        visualPoderiaMelhorar: Math.min(Math.max(criteria.visualPoderiaMelhorar ?? 0, 0), 2),
        consigoAjudar: Math.min(Math.max(criteria.consigoAjudar ?? 0, 0), 2),
      }
      m.qualification = qual
      m.nota = calcularNota(qual)
      m.prioridade = definirPrioridade(m.nota)
    }
  }

  return m
}

export function NewLeadPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { putLead } = useLeads()
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [formKey, setFormKey] = useState(0)

  const source = params.get('source')
  const encodedData = params.get('data')
  const importedFromExtension = source === 'chrome-extension' && !!encodedData

  const [leadData, setLeadData] = useState<Lead>(() => {
    if (importedFromExtension && encodedData) {
      try {
        const raw = JSON.parse(decodeURIComponent(encodedData))
        return { ...criarLeadPadrao(), ...mapExtensionToLead(raw) }
      } catch {
        // invalid data — fall through to empty form
      }
    }
    return criarLeadPadrao()
  })

  function handleJsonImport() {
    setJsonError('')
    try {
      const raw = JSON.parse(jsonInput)
      if (!raw || typeof raw !== 'object') throw new Error()
      const merged = { ...criarLeadPadrao(), ...mapExtensionToLead(raw as Record<string, unknown>) }
      setLeadData(merged)
      setFormKey((k) => k + 1)
    } catch {
      setJsonError('Não consegui importar os dados. Verifique se o JSON veio da extensão ProspectOS Capture.')
    }
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/leads"
          className="inline-flex items-center gap-1 text-xs text-brand-platinum/40 hover:text-brand-platinum/70 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Voltar para leads
        </Link>
      </div>

      <PageHeader
        titulo="Novo lead"
        subtitulo={importedFromExtension ? 'Importado da extensão ProspectOS Capture' : 'Cadastre um novo lead'}
      />

      {importedFromExtension && (
        <Card className="mb-5 border-brand-primary/30 bg-brand-primary/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-brand-primary" />
            <div>
              <p className="text-sm font-medium text-brand-platinum">
                Lead importado da extensão ProspectOS Capture
              </p>
              <p className="mt-0.5 text-xs text-brand-platinum/50">
                Revise os dados antes de salvar.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-6">
        <LeadForm
          key={formKey}
          inicial={leadData}
          onSalvar={(lead) => {
            putLead(lead)
            navigate('/leads')
          }}
          onCancelar={() => navigate('/leads')}
        />
      </div>

      <Card>
        <details className="group">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-brand-platinum/60 hover:text-brand-platinum/80 transition-colors">
            <Upload className="size-4" />
            Importar lead via JSON
          </summary>
          <div className="mt-4 space-y-3">
            <p className="text-xs text-brand-platinum/40">
              Cole o JSON gerado pela extensão ProspectOS Capture para preencher o formulário automaticamente.
            </p>
            <textarea
              value={jsonInput}
              onChange={(e) => { setJsonInput(e.target.value); setJsonError('') }}
              placeholder='{"name": "...", "instagramHandle": "...", ...}'
              rows={5}
              className="w-full rounded-lg border border-brand-deep-hover bg-brand-base px-3 py-2 text-sm text-brand-platinum placeholder:text-brand-platinum/20 outline-none transition-colors focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/60 min-h-20 resize-y font-mono"
            />
            {jsonError && (
              <div className="flex items-start gap-2 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-3 py-2 text-xs text-brand-danger">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}
            <Button onClick={handleJsonImport} variante="secundario">
              <Upload className="size-4" /> Preencher formulário
            </Button>
          </div>
        </details>
      </Card>
    </div>
  )
}
