import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ActionLog, PeriodKey } from '@/types'
import { useLeads } from './useLeads'
import { actionStore } from '@/data/actionStore'
import {
  type DailyMetrics,
  type FunnelStage,
  type GoalProgress,
  calculateMetrics,
  getFunnelMetrics,
  getGoalProgress,
  getPeriodRange,
} from '@/utils/metrics'

export function useMetrics() {
  const { leads } = useLeads()
  const [actions, setActions] = useState<ActionLog[]>(() => actionStore.listar())
  const [periodKey, setPeriodKey] = useState<PeriodKey>('hoje')
  const [customStart, setCustomStart] = useState<number | undefined>()
  const [customEnd, setCustomEnd] = useState<number | undefined>()

  // Backfill na inicialização
  useEffect(() => {
    actionStore.backfillSeNecessario()
    setActions(actionStore.listar())
  }, [])

  // Recarregar actions quando leads mudarem (backfill re-run seguro)
  useEffect(() => {
    setActions((prev) => {
      const current = actionStore.listar()
      return current.length >= prev.length ? current : prev
    })
  }, [leads.length])

  // Ouvir eventos de nova ação (tempo real entre páginas)
  useEffect(() => {
    const handler = () => setActions(actionStore.listar())
    window.addEventListener('action:registered', handler)
    // fallback: storage event (cross-tab)
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'prospectos:actions') setActions(actionStore.listar())
    }
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener('action:registered', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [])

  const refresh = useCallback(() => {
    setActions(actionStore.listar())
  }, [])

  const period = useMemo(() => getPeriodRange(periodKey, customStart, customEnd), [periodKey, customStart, customEnd])

  const metrics: DailyMetrics = useMemo(
    () => calculateMetrics(actions, leads, period.start, period.end),
    [actions, leads, period],
  )

  const funnel: FunnelStage[] = useMemo(
    () => getFunnelMetrics(actions, leads, period.start, period.end),
    [actions, leads, period],
  )

  const goals: GoalProgress[] = useMemo(
    () => getGoalProgress(actions, leads, period.start, period.end),
    [actions, leads, period],
  )

  const alterarPeriodo = useCallback((key: PeriodKey) => {
    setPeriodKey(key)
    if (key !== 'personalizado') {
      setCustomStart(undefined)
      setCustomEnd(undefined)
    }
  }, [])

  const definirPersonalizado = useCallback((start: number, end: number) => {
    setPeriodKey('personalizado')
    setCustomStart(start)
    setCustomEnd(end)
  }, [])

  return {
    actions,
    metrics,
    funnel,
    goals,
    period,
    periodKey,
    alterarPeriodo,
    definirPersonalizado,
    refresh,
  }
}
