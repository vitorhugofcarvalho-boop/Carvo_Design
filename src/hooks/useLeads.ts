import { useCallback, useEffect, useState } from 'react'
import type { Lead } from '@/types'
import { store } from '@/data/store'
import { syncService } from '@/data/supabaseService'

function carregar() {
  return store.listarLeads()
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(() => carregar())

  useEffect(() => {
    const onStorage = () => setLeads(carregar())
    window.addEventListener('storage', onStorage)
    syncService.pullLeadsFromSupabase().then(() => {
      setLeads(carregar())
    })
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const salvar = useCallback((leads: Lead[]) => {
    store.salvarLeads(leads)
    setLeads(leads)
    syncService.syncLeadsToSupabase()
  }, [])

  const putLead = useCallback((lead: Lead) => {
    store.putLead(lead)
    setLeads(carregar())
    syncService.syncLead(lead)
  }, [])

  const removeLead = useCallback((id: string) => {
    store.removeLead(id)
    setLeads(carregar())
    syncService.removeLeadFromSupabase(id)
  }, [])

  const getLead = useCallback((id: string) => {
    return store.getLead(id)
  }, [])

  return { leads, salvar, putLead, removeLead, getLead }
}
