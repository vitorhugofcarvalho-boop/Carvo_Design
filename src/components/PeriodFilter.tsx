import { useMemo, useState } from 'react'
import type { PeriodKey } from '@/types'
import { Button } from './ui/Button'

const OPCOES: { key: PeriodKey; label: string }[] = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'ontem', label: 'Ontem' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: 'este_mes', label: 'Este mês' },
]

export function PeriodFilter({
  value,
  onChange,
  onPersonalizado,
}: {
  value: PeriodKey
  onChange: (key: PeriodKey) => void
  onPersonalizado?: (start: number, end: number) => void
}) {
  const [customActive, setCustomActive] = useState(value === 'personalizado')
  const [customInicio, setCustomInicio] = useState('')
  const [customFim, setCustomFim] = useState('')

  const dataAtual = useMemo(() => new Date().toISOString().slice(0, 10), [])

  function aplicarCustom() {
    if (!customInicio || !customFim) return
    const start = new Date(customInicio + 'T00:00:00').getTime()
    const end = new Date(customFim + 'T23:59:59').getTime()
    onPersonalizado?.(start, end)
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {OPCOES.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => {
            setCustomActive(false)
            onChange(opt.key)
          }}
          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
            value === opt.key && !customActive
              ? 'border-brand-primary bg-brand-primary/15 text-brand-primary'
              : 'border-brand-deep-hover text-brand-platinum/50 hover:border-brand-deep-hover hover:text-brand-platinum/80'
          }`}
        >
          {opt.label}
        </button>
      ))}

      <button
        type="button"
        onClick={() => setCustomActive(!customActive)}
        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
          customActive
            ? 'border-brand-primary bg-brand-primary/15 text-brand-primary'
            : 'border-brand-deep-hover text-brand-platinum/50 hover:border-brand-deep-hover hover:text-brand-platinum/80'
        }`}
      >
        Personalizado
      </button>

      {customActive && (
        <div className="flex w-full items-center gap-2 pt-2 sm:w-auto sm:pt-0">
          <input
            type="date"
            value={customInicio}
            onChange={(e) => setCustomInicio(e.target.value)}
            max={customFim || dataAtual}
            className="w-full rounded-lg border border-brand-deep-hover bg-brand-base px-2 py-1 text-xs text-brand-platinum outline-none focus-visible:border-brand-primary sm:w-auto"
          />
          <span className="text-xs text-brand-platinum/30">até</span>
          <input
            type="date"
            value={customFim}
            onChange={(e) => setCustomFim(e.target.value)}
            min={customInicio || undefined}
            max={dataAtual}
            className="w-full rounded-lg border border-brand-deep-hover bg-brand-base px-2 py-1 text-xs text-brand-platinum outline-none focus-visible:border-brand-primary sm:w-auto"
          />
          <Button className="!py-1 !px-2 text-xs shrink-0" onClick={aplicarCustom}>
            Aplicar
          </Button>
        </div>
      )}
    </div>
  )
}
