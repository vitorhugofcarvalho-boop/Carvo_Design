import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { TEMPLATES, TEMPLATE_META } from '@/utils/messages'
import type { TemplateKey } from '@/utils/messages'

export function TemplatesPage() {
  const [selected, setSelected] = useState<TemplateKey>('primeira_abordagem')
  const [copied, setCopied] = useState(false)
  const [editContent, setEditContent] = useState(TEMPLATES[selected])

  const meta = TEMPLATE_META.find((t) => t.key === selected)

  function selecionar(key: TemplateKey) {
    setSelected(key)
    setEditContent(TEMPLATES[key])
    setCopied(false)
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(editContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = editContent
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Templates"
        subtitulo="Roteiro de follow-up de 7 dias e mensagens prontas"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-1">
          {TEMPLATE_META.map((tm) => (
            <button
              key={tm.key}
              onClick={() => selecionar(tm.key)}
              className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all ${
                selected === tm.key
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-brand-deep-hover hover:border-brand-deep-hover hover:bg-brand-deep/50'
              }`}
            >
              <p className={`text-sm font-medium ${
                selected === tm.key ? 'text-brand-primary' : 'text-brand-platinum'
              }`}>
                {tm.title}
              </p>
              <p className="text-xs text-brand-platinum/40 mt-0.5">{tm.desc}</p>
            </button>
          ))}

          <Card className="mt-4">
            <h3 className="text-xs text-brand-platinum/40 uppercase tracking-wide font-medium mb-2">Placeholders</h3>
            <div className="space-y-1 text-xs text-brand-platinum/50">
              <p><code className="text-brand-accent/70">[nome]</code> — Primeiro nome</p>
              <p><code className="text-brand-accent/70">[nicho]</code> — Nicho do lead</p>
              <p><code className="text-brand-accent/70">[produto]</code> — Produto/oferta</p>
              <p><code className="text-brand-accent/70">[tipo]</code> — Tipo de oferta</p>
              <p><code className="text-brand-accent/70">[publico]</code> — Público/nicho</p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-brand-platinum">{meta?.title}</h2>
                <p className="text-xs text-brand-platinum/40">{meta?.desc}</p>
              </div>
              <Button
                variante={copied ? 'sucesso' : 'primario'}
                className="!py-1.5 !px-3 text-xs"
                onClick={copiar}
              >
                {copied ? <><Check className="size-3.5" /> Copiado</> : <><Copy className="size-3.5" /> Copiar</>}
              </Button>
            </div>

            <p className="text-xs text-brand-platinum/30 mb-2">
              Edite o template conforme necessário. As tags <code className="text-brand-accent/60">[nome]</code> serão substituídas automaticamente na página do lead.
            </p>

            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={14}
              className="w-full text-sm leading-relaxed font-mono"
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
