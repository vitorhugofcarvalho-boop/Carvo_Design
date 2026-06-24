import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({
  aberto,
  titulo,
  onFechar,
  children,
}: {
  aberto: boolean
  titulo: string
  onFechar: () => void
  children: ReactNode
}) {
  const painelRef = useRef<HTMLDivElement>(null)
  const tituloId = useId()

  useEffect(() => {
    if (!aberto) return
    const anterior = document.activeElement as HTMLElement | null
    const focaveis = () =>
      Array.from(painelRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      ) ?? [])

    if (painelRef.current && !painelRef.current.contains(document.activeElement)) {
      focaveis()[0]?.focus()
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onFechar(); return }
      if (e.key !== 'Tab') return
      const itens = focaveis()
      if (itens.length === 0) { e.preventDefault(); return }
      if (e.shiftKey && document.activeElement === itens[0]) {
        e.preventDefault(); itens[itens.length - 1].focus()
      } else if (!e.shiftKey && document.activeElement === itens[itens.length - 1]) {
        e.preventDefault(); itens[0].focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflowAnterior
      anterior?.focus?.()
    }
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div
      className="anim-fade fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="anim-slide max-h-[90vh] w-full max-w-lg cursor-default overflow-y-auto rounded-2xl border border-brand-deep-hover bg-brand-base p-6 shadow-2xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id={tituloId} className="text-lg font-semibold text-brand-platinum" style={{ fontFamily: 'var(--font-heading)' }}>
            {titulo}
          </h2>
          <Button variante="fantasma" className="!p-2" onClick={onFechar} aria-label="Fechar">
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
