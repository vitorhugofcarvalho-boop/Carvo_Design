import { useCallback, useEffect, useState } from 'react'
import type { Lead } from '@/types'
import { store } from '@/data/store'

function carregar() {
  return store.listarLeads()
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(() => carregar())

  useEffect(() => {
    const onStorage = () => setLeads(carregar())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const salvar = useCallback((leads: Lead[]) => {
    store.salvarLeads(leads)
    setLeads(leads)
  }, [])

  const putLead = useCallback((lead: Lead) => {
    store.putLead(lead)
    setLeads(carregar())
  }, [])

  const removeLead = useCallback((id: string) => {
    store.removeLead(id)
    setLeads(carregar())
  }, [])

  const getLead = useCallback((id: string) => {
    return store.getLead(id)
  }, [])

  return { leads, salvar, putLead, removeLead, getLead }
}
