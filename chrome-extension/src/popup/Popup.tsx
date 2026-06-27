import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'

export function Popup() {
  const [status, setStatus] = useState<'abrindo' | 'erro'>('abrindo')

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id) {
        return chrome.sidePanel.open({ tabId: tab.id }).then(() => window.close())
      }
      setStatus('erro')
    }).catch(() => setStatus('erro'))
  }, [])

  if (status === 'erro') {
    return (
      <div className="w-72 bg-brand-deep p-4 text-center">
        <p className="mb-3 text-sm text-brand-platinum/60">
          Clique no botão abaixo para abrir o painel lateral.
        </p>
        <button
          onClick={() => {
            chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
              if (tab?.id) chrome.sidePanel.open({ tabId: tab.id }).then(() => window.close())
            })
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90"
        >
          <ExternalLink className="size-4" /> Abrir painel
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-20 w-60 items-center justify-center bg-brand-deep">
      <div className="size-5 animate-spin rounded-full border-2 border-brand-primary/30 border-t-brand-primary" />
    </div>
  )
}
