import { useState } from 'react'
import type { Lead } from '@/types'
import { TEMPLATES, TEMPLATE_META, gerarMensagem } from '@/utils/messages'
import type { TemplateKey } from '@/utils/messages'
import { Button } from './ui/Button'
import { Textarea } from './ui/Input'
import { Card } from './ui/Card'
import { Copy, Check } from 'lucide-react'

export function MessageTemplates({ lead }: { lead: Lead }) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('personalizada')
  const [copied, setCopied] = useState(false)

  const mensagem = gerarMensagem(lead, TEMPLATES[selectedTemplate])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensagem)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = mensagem
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
      <h3 className="text-sm font-semibold text-brand-platinum mb-3">Mensagens sugeridas</h3>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {TEMPLATE_META.map((tm) => (
          <button
            key={tm.key}
            type="button"
            onClick={() => setSelectedTemplate(tm.key)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
              selectedTemplate === tm.key
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-brand-deep-hover text-brand-platinum/40 hover:border-brand-deep-hover hover:text-brand-platinum/70'
            }`}
          >
            {tm.title}
          </button>
        ))}
      </div>

      <Card className="!p-3">
        <Textarea
          value={mensagem}
          readOnly
          rows={8}
          className="w-full text-sm leading-relaxed"
        />
        <div className="mt-2 flex justify-end">
          <Button
            variante={copied ? 'sucesso' : 'primario'}
            className="!py-1.5 !px-3 text-xs"
            onClick={copiar}
          >
            {copied ? (
              <><Check className="size-3.5" /> Copiado!</>
            ) : (
              <><Copy className="size-3.5" /> Copiar mensagem</>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
