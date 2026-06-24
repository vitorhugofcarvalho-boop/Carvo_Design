import { useState } from 'react'
import type { ContactRecord, TipoContato } from '@/types'
import { TIPOS_CONTATO } from '@/types'
import { Button } from './ui/Button'
import { Select, Textarea } from './ui/Input'
import { Card } from './ui/Card'
import { formatarDataHora, dataRelativa } from '@/utils/formatting'
import { MessageCircle, Phone, FileText, XCircle, CheckCircle, Send, AlertCircle } from 'lucide-react'

const ICONES: Record<string, typeof MessageCircle> = {
  dm_inicial: Send,
  follow_up: MessageCircle,
  resposta_recebida: MessageCircle,
  diagnostico_enviado: FileText,
  call_marcada: Phone,
  proposta_enviada: FileText,
  fechamento: CheckCircle,
  perdido: XCircle,
}

export function ContactHistory({
  historico,
  onAdicionar,
}: {
  historico: ContactRecord[]
  onAdicionar: (record: ContactRecord) => void
}) {
  const [novo, setNovo] = useState(false)
  const [tipo, setTipo] = useState<TipoContato>('follow_up')
  const [notes, setNotes] = useState('')

  function adicionar() {
    if (!notes.trim()) return
    onAdicionar({
      id: crypto.randomUUID(),
      date: Date.now(),
      type: tipo,
      notes: notes.trim(),
    })
    setTipo('follow_up')
    setNotes('')
    setNovo(false)
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand-platinum">Histórico de contatos</h3>
        {!novo && (
          <Button variante="secundario" className="!py-1 !px-2 text-xs" onClick={() => setNovo(true)}>
            + Novo registro
          </Button>
        )}
      </div>

      {novo && (
        <Card className="mb-4 !p-3 space-y-3">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoContato)}>
            {TIPOS_CONTATO.map((t) => (
              <option key={t.valor} value={t.valor}>{t.rotulo}</option>
            ))}
          </Select>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observação do contato..."
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button variante="secundario" className="!py-1 !px-2 text-xs" onClick={() => setNovo(false)}>Cancelar</Button>
            <Button className="!py-1 !px-2 text-xs" onClick={adicionar}>Adicionar</Button>
          </div>
        </Card>
      )}

      {historico.length === 0 && !novo && (
        <p className="text-sm text-brand-platinum/40">Nenhum contato registrado ainda.</p>
      )}

      <div className="space-y-2">
        {[...historico].reverse().map((h) => {
          const Icone = ICONES[h.type] || AlertCircle
          const tipoInfo = TIPOS_CONTATO.find((t) => t.valor === h.type)
          return (
            <div key={h.id} className="flex gap-3 text-sm">
              <div className="mt-0.5 shrink-0">
                <Icone className="size-3.5 text-brand-platinum/30" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-brand-platinum/80 text-xs">{tipoInfo?.rotulo || h.type}</span>
                  <span className="text-[11px] text-brand-platinum/30">{dataRelativa(h.date)}</span>
                </div>
                {h.notes && <p className="mt-0.5 text-brand-platinum/60 leading-relaxed">{h.notes}</p>}
                <p className="text-[10px] text-brand-platinum/20 mt-0.5">{formatarDataHora(h.date)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
