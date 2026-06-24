import type { Lead, WeeklyReport, ChecklistItem } from '@/types'
import { store } from '@/data/store'

export interface Backup {
  versao: number
  exportadoEm: number
  leads: Lead[]
  checklist: ChecklistItem[]
  reports: WeeklyReport[]
}

export function exportarBackup(): string {
  const backup: Backup = {
    versao: 1,
    exportadoEm: Date.now(),
    leads: store.listarLeads(),
    checklist: store.getChecklist(),
    reports: store.listarReports(),
  }
  return JSON.stringify(backup, null, 2)
}

export function baixarBackup(): void {
  const json = exportarBackup()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prospectos-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importarBackup(json: string): void {
  const parsed = JSON.parse(json) as Backup
  if (!parsed.leads) throw new Error('Arquivo de backup inválido')
  store.salvarLeads(parsed.leads)
  if (parsed.checklist) store.salvarChecklist(parsed.checklist)
  if (parsed.reports) store.salvarReports(parsed.reports)
}
