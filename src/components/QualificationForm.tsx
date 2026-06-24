import { useCallback, useState } from 'react'
import type { QualificationCriteria } from '@/types'
import { CRITERIA_LABELS, CRITERIA_OPTIONS, calcularNota, definirPrioridade } from '@/utils/scoring'


export function QualificationForm({
  value,
  onChange,
}: {
  value: QualificationCriteria
  onChange: (v: QualificationCriteria) => void
}) {
  const [criteria, setCriteria] = useState(value)

  const handleChange = useCallback((field: keyof QualificationCriteria, v: number) => {
    const next = { ...criteria, [field]: v }
    setCriteria(next)
    onChange(next)
  }, [criteria, onChange])

  const nota = calcularNota(criteria)
  const prioridade = definirPrioridade(nota)

  const cores = {
    baixa: 'text-zinc-400',
    media: 'text-blue-400',
    alta: 'text-orange-400',
    prioridade_maxima: 'text-red-400',
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-brand-platinum/50 uppercase tracking-wide font-medium">Critérios de qualificação (0–2 cada)</p>

      {(Object.keys(CRITERIA_LABELS) as (keyof QualificationCriteria)[]).map((field) => (
        <div key={field} className="space-y-1.5">
          <label className="text-sm text-brand-platinum">{CRITERIA_LABELS[field]}</label>
          <div className="flex gap-1">
            {CRITERIA_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange(field, opt.value)}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                  criteria[field] === opt.value
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-brand-deep-hover text-brand-platinum/40 hover:border-brand-deep-hover hover:text-brand-platinum/70'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between rounded-lg border border-brand-deep-hover bg-brand-base/50 px-4 py-3">
        <div>
          <p className="text-xs text-brand-platinum/50">Nota final</p>
          <p className={`text-2xl font-bold ${cores[prioridade]}`}>{nota}/10</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-brand-platinum/50">Prioridade</p>
          <p className={`text-lg font-semibold ${cores[prioridade]}`}>
            {prioridade === 'prioridade_maxima' ? 'Máxima' : prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
          </p>
        </div>
      </div>
    </div>
  )
}
