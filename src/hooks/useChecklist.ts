import { useCallback, useEffect, useState } from 'react'
import type { ChecklistItem } from '@/types'
import { CHECKLIST_PADRAO } from '@/types'
import { store } from '@/data/store'

export function useChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = store.getChecklist()
    return saved.length > 0 ? saved : CHECKLIST_PADRAO
  })
  const [aprendizado, setAprendizado] = useState(() => store.getAprendizadoDia())

  useEffect(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    const savedDate = localStorage.getItem('prospectos:checklist_date')
    if (savedDate !== hoje) {
      const reset = items.map((i) => ({ ...i, done: false }))
      setItems(reset)
      store.salvarChecklist(reset)
      localStorage.setItem('prospectos:checklist_date', hoje)
    }
  }, [])

  const toggleItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
      store.salvarChecklist(next)
      return next
    })
  }, [])

  const salvarAprendizado = useCallback((texto: string) => {
    setAprendizado(texto)
    store.salvarAprendizadoDia(texto)
  }, [])

  return { items, toggleItem, aprendizado, salvarAprendizado }
}
