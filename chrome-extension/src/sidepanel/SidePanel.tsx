import { useCallback, useEffect, useRef, useState } from 'react'
import { Copy, Eraser, Save, Send, ExternalLink, Check } from 'lucide-react'
import type { CapturedLead } from '@/types'
import { OFFER_TYPES, emptyLead } from '@/types'
import { saveDraft, loadDraft, clearDraft } from '@/utils/storage'

const INPUT_CLASS =
  'w-full rounded-lg border border-brand-deep-hover bg-brand-base px-3 py-2 text-sm text-brand-platinum placeholder:text-brand-platinum/25 outline-none transition-colors focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/60'

const LABEL_CLASS = 'block text-xs text-brand-platinum/50 font-medium mb-1'

export function SidePanel() {
  const [lead, setLead] = useState<CapturedLead>(emptyLead)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    loadDraft().then((draft) => {
      if (draft) setLead((prev) => ({ ...prev, ...draft }))
    })
  }, [])

  const persist = useCallback((data: CapturedLead) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveDraft(data)
      setSaved(true)
    }, 400)
  }, [])

  function update<K extends keyof CapturedLead>(field: K, value: CapturedLead[K]) {
    setLead((prev) => {
      const next = { ...prev, [field]: value }
      persist(next)
      return next
    })
    setSaved(false)
  }

  async function handleClear() {
    setLead(emptyLead())
    setSaved(false)
    setCopied(false)
    await clearDraft()
  }

  async function handleCopyJson() {
    const json = JSON.stringify(lead, null, 2)
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-dvh flex-col bg-brand-deep text-brand-platinum">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-brand-deep-hover px-4 py-3">
        <h1 className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Prospect<span className="text-brand-primary">OS</span>{' '}
          <span className="text-xs font-medium text-brand-platinum/40">Capture</span>
        </h1>
        <p className="mt-0.5 text-[10px] text-brand-platinum/30 tracking-wider uppercase">
          Cadastre e qualifique leads sem sair do Instagram
        </p>
      </header>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          <p className="text-[10px] text-brand-platinum/40 uppercase tracking-wide font-medium">
            Dados do lead
          </p>

          <Field label="Nome" required>
            <input
              className={INPUT_CLASS}
              value={lead.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Nome completo"
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Perfil do Instagram" required>
              <input
                className={INPUT_CLASS}
                value={lead.instagramHandle}
                onChange={(e) => update('instagramHandle', e.target.value.replace('@', ''))}
                placeholder="usuario"
              />
            </Field>
            <Field label="URL do perfil">
              <input
                className={INPUT_CLASS}
                value={lead.instagramUrl}
                onChange={(e) => update('instagramUrl', e.target.value)}
                placeholder="https://ig.com/u"
              />
            </Field>
          </div>

          <Field label="Nicho">
            <input
              className={INPUT_CLASS}
              value={lead.niche}
              onChange={(e) => update('niche', e.target.value)}
              placeholder="Ex.: Nutrição, Marketing, Psicologia"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Produto / Oferta">
              <input
                className={INPUT_CLASS}
                value={lead.offerName}
                onChange={(e) => update('offerName', e.target.value)}
                placeholder="Ex.: Mentoria X"
              />
            </Field>
            <Field label="Tipo de oferta">
              <select
                className={INPUT_CLASS}
                value={lead.offerType}
                onChange={(e) => update('offerType', e.target.value as CapturedLead['offerType'])}
              >
                {OFFER_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Seguidores">
              <input
                className={INPUT_CLASS}
                value={lead.followers}
                onChange={(e) => update('followers', e.target.value)}
                placeholder="Ex.: 15000"
              />
            </Field>
            <Field label="Link da bio / oferta">
              <input
                className={INPUT_CLASS}
                value={lead.bioLink}
                onChange={(e) => update('bioLink', e.target.value)}
                placeholder="URL da página"
              />
            </Field>
          </div>

          <p className="text-[10px] text-brand-platinum/40 uppercase tracking-wide font-medium pt-2">
            Percepções
          </p>

          <Field label="Sinal de venda percebido">
            <textarea
              className={`${INPUT_CLASS} min-h-16 resize-y`}
              value={lead.salesSignal}
              onChange={(e) => update('salesSignal', e.target.value)}
              placeholder="Link na bio, Stories de vendas, depoimentos..."
              rows={2}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Problema visual percebido">
              <textarea
                className={`${INPUT_CLASS} min-h-16 resize-y`}
                value={lead.visualProblem}
                onChange={(e) => update('visualProblem', e.target.value)}
                placeholder="O que está fraco visualmente?"
                rows={2}
              />
            </Field>
            <Field label="Ponto positivo do perfil">
              <textarea
                className={`${INPUT_CLASS} min-h-16 resize-y`}
                value={lead.positivePoint}
                onChange={(e) => update('positivePoint', e.target.value)}
                placeholder="O que já funciona bem?"
                rows={2}
              />
            </Field>
          </div>

          <Field label="Oportunidade visual">
            <textarea
              className={`${INPUT_CLASS} min-h-16 resize-y`}
              value={lead.visualOpportunity}
              onChange={(e) => update('visualOpportunity', e.target.value)}
              placeholder="O que você poderia fazer por ele?"
              rows={2}
            />
          </Field>

          <Field label="Observações">
            <textarea
              className={`${INPUT_CLASS} min-h-20 resize-y`}
              value={lead.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Anotações adicionais"
              rows={3}
            />
          </Field>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 border-t border-brand-deep-hover bg-brand-base px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          {saved && (
            <span className="flex items-center gap-1 text-[10px] text-brand-success/60">
              <Check className="size-3" /> Rascunho salvo
            </span>
          )}
          {copied && (
            <span className="flex items-center gap-1 text-[10px] text-brand-accent/60">
              <Check className="size-3" /> Lead copiado. Agora você pode colar no ProspectOS.
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg border border-brand-deep-hover px-3 py-2 text-xs text-brand-platinum/40 transition-colors hover:border-brand-danger/40 hover:text-brand-danger"
          >
            <Eraser className="size-3.5" /> Limpar
          </button>
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 rounded-lg border border-brand-deep-hover px-3 py-2 text-xs text-brand-platinum/60 transition-colors hover:border-brand-platinum/20 hover:text-brand-platinum"
          >
            <Copy className="size-3.5" /> Copiar JSON
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className={LABEL_CLASS}>
        {label}
        {required && <span className="text-brand-primary/60 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
