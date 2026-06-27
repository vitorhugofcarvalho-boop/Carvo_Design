import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChecklistItem, GoalType } from '@/types'
import { CHECKLIST_PADRAO } from '@/types'
import { store } from '@/data/store'

export function useChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = store.getChecklist()
    return saved.length > 0 ? saved : CHECKLIST_PADRAO
  })
  const [aprendizado, setAprendizado] = useState(() => store.getAprendizadoDia())
  const syncedRef = useRef(false)

  // Reset diário
  useEffect(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    const savedDate = localStorage.getItem('prospectos:checklist_date')
    if (savedDate !== hoje) {
      const reset = items.map((i) => ({ ...i, done: false }))
      setItems(reset)
      store.salvarChecklist(reset)
      localStorage.setItem('prospectos:checklist_date', hoje)
      syncedRef.current = false
    }
  }, [items])

  const toggleItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
      store.salvarChecklist(next)
      return next
    })
  }, [])

  /** Sincroniza itens com metas — marca como done se meta atingida */
  const syncWithGoals = useCallback(
    (goalData: { type: GoalType; done: boolean }[]) => {
      setItems((prev) => {
        let changed = false
        const next = prev.map((item) => {
          if (!item.goalType) return item
          const goal = goalData.find((g) => g.type === item.goalType)
          if (!goal) return item
          if (goal.done && !item.done) {
            changed = true
            return { ...item, done: true }
          }
          // Não reverter meta manualmente desmarcada
          if (!goal.done && item.done && syncedRef.current) {
            return item
          }
          return item
        })
        if (changed) {
          store.salvarChecklist(next)
          syncedRef.current = true
        }
        return next
      })
    },
    [],
  )

  const salvarAprendizado = useCallback((texto: string) => {
    setAprendizado(texto)
    store.salvarAprendizadoDia(texto)
  }, [])

  return { items, toggleItem, aprendizado, salvarAprendizado, syncWithGoals }
}
