import type { LeadStatus } from '@/types'
import { STATUS_LEAD } from '@/types'
import { Select } from './ui/Input'

export function StatusSelect({
  value,
  onChange,
  className = '',
}: {
  value: LeadStatus
  onChange: (v: LeadStatus) => void
  className?: string
}) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value as LeadStatus)} className={className}>
      {STATUS_LEAD.map((s) => (
        <option key={s.valor} value={s.valor}>{s.rotulo}</option>
      ))}
    </Select>
  )
}
