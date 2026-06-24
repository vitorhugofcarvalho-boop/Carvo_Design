import type { Lead, ChecklistItem, WeeklyReport } from '@/types'

const LEADS_KEY = 'prospectos:leads'
const CHECKLIST_KEY = 'prospectos:checklist'
const CHECKLIST_DATE_KEY = 'prospectos:checklist_date'
const APRENDIZADO_KEY = 'prospectos:aprendizado_dia'
const WEEKLY_KEY = 'prospectos:weekly_reports'
function ler<T>(key: string, padrao: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : padrao
  } catch {
    return padrao
  }
}

function escrever<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export const store = {
  // Leads
  listarLeads(): Lead[] {
    return ler<Lead[]>(LEADS_KEY, [])
  },
  salvarLeads(leads: Lead[]): void {
    escrever(LEADS_KEY, leads)
  },
  getLead(id: string): Lead | undefined {
    return this.listarLeads().find((l) => l.id === id)
  },
  putLead(lead: Lead): void {
    const leads = this.listarLeads()
    const idx = leads.findIndex((l) => l.id === lead.id)
    if (idx >= 0) leads[idx] = lead
    else leads.push(lead)
    this.salvarLeads(leads)
  },
  removeLead(id: string): void {
    this.salvarLeads(this.listarLeads().filter((l) => l.id !== id))
  },

  // Checklist
  getChecklist(): ChecklistItem[] {
    const hoje = new Date().toISOString().slice(0, 10)
    const savedDate = localStorage.getItem(CHECKLIST_DATE_KEY)
    if (savedDate !== hoje) {
      localStorage.setItem(CHECKLIST_DATE_KEY, hoje)
      const padrao = ler<ChecklistItem[]>(CHECKLIST_KEY, [])
      if (padrao.length > 0) {
        const reset = padrao.map((i) => ({ ...i, done: false }))
        escrever(CHECKLIST_KEY, reset)
        return reset
      }
      return []
    }
    return ler<ChecklistItem[]>(CHECKLIST_KEY, [])
  },
  salvarChecklist(items: ChecklistItem[]): void {
    escrever(CHECKLIST_KEY, items)
  },
  getAprendizadoDia(): string {
    return localStorage.getItem(APRENDIZADO_KEY) ?? ''
  },
  salvarAprendizadoDia(texto: string): void {
    localStorage.setItem(APRENDIZADO_KEY, texto)
  },

  // Weekly report
  listarReports(): WeeklyReport[] {
    return ler<WeeklyReport[]>(WEEKLY_KEY, [])
  },
  salvarReport(report: WeeklyReport): void {
    const reports = this.listarReports()
    const idx = reports.findIndex((r) => r.id === report.id)
    if (idx >= 0) reports[idx] = report
    else reports.push(report)
    escrever(WEEKLY_KEY, reports)
  },
  removeReport(id: string): void {
    this.salvarReports(this.listarReports().filter((r) => r.id !== id))
  },
  salvarReports(reports: WeeklyReport[]): void {
    escrever(WEEKLY_KEY, reports)
  },
}
