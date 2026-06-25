import { useCallback, useEffect, useState } from 'react'
import type { WeeklyReport } from '@/types'
import { store } from '@/data/store'
import { syncService } from '@/data/supabaseService'
import { inicioDaSemana } from '@/utils/formatting'

export function useWeeklyReport() {
  const [reports, setReports] = useState<WeeklyReport[]>(() => store.listarReports())

  useEffect(() => {
    const onStorage = () => setReports(store.listarReports())
    window.addEventListener('storage', onStorage)
    syncService.pullWeeklyReports().then(() => {
      setReports(store.listarReports())
    })
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const salvarReport = useCallback((report: WeeklyReport) => {
    store.salvarReport(report)
    setReports(store.listarReports())
    syncService.syncWeeklyReport(report)
  }, [])

  const reportAtual = reports.find((r) => r.weekStart === inicioDaSemana())

  return { reports, salvarReport, reportAtual }
}
