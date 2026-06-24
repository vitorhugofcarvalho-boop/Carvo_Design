import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Layers,
  Bell,
  CheckSquare,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/pipeline', label: 'Pipeline', icon: Layers },
  { to: '/followups', label: 'Follow-ups', icon: Bell },
  { to: '/rotina', label: 'Rotina', icon: CheckSquare },
  { to: '/templates', label: 'Templates', icon: FileText },
  { to: '/analise', label: 'Análise', icon: BarChart3 },
  { to: '/configuracoes', label: 'Config.', icon: Settings },
]

const NAV_PRIMARIA = NAV_ITEMS.slice(0, 4)
const NAV_SECUNDARIA = NAV_ITEMS.slice(4)

export function Layout() {
  const [menuAberto, setMenuAberto] = useState(false)
  const location = useLocation()

  function linkClasses(ativo: boolean, mobile?: boolean): string {
    if (mobile) {
      return ativo
        ? 'flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] text-brand-primary font-medium transition-colors'
        : 'flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] text-brand-platinum/40 transition-colors hover:text-brand-platinum/70'
    }
    return ativo
      ? 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-brand-primary/10 text-brand-primary transition-colors'
      : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-platinum/50 transition-colors hover:bg-brand-deep hover:text-brand-platinum'
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      {/* Header mobile */}
      <header className="flex items-center justify-between border-b border-brand-deep-hover bg-brand-base px-4 py-3 md:hidden">
        <div>
          <span className="text-base font-bold text-brand-platinum" style={{ fontFamily: 'var(--font-heading)' }}>
            Prospect<span className="text-brand-primary">OS</span>
          </span>
        </div>
        <button
          onClick={() => setMenuAberto(true)}
          className="rounded-lg p-2 text-brand-platinum/50 transition-colors hover:bg-brand-deep hover:text-brand-platinum"
          aria-label="Menu"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-brand-deep-hover bg-brand-base p-4 md:flex md:h-dvh md:sticky md:top-0">
        <div className="mb-8 px-2 pt-2">
          <span className="text-lg font-bold text-brand-platinum" style={{ fontFamily: 'var(--font-heading)' }}>
            Prospect<span className="text-brand-primary">OS</span>
          </span>
          <p className="mt-0.5 text-[10px] text-brand-platinum/30 font-medium tracking-wider uppercase">
            Sistema de Prospecção
          </p>
        </div>

        <nav className="flex-1 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icone = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => linkClasses(isActive)}
              >
                <Icone className="size-4" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-x-hidden p-4 pb-24 md:p-6 md:pb-6">
        <div key={location.pathname} className="anim-fade mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* Bottom-nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-brand-deep-hover bg-brand-base md:hidden">
        {NAV_PRIMARIA.map((item) => {
          const Icone = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => linkClasses(isActive, true)}
            >
              <Icone className="size-4" />
              {item.label}
            </NavLink>
          )
        })}
        <button
          onClick={() => setMenuAberto(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] text-brand-platinum/40 transition-colors hover:text-brand-platinum/70"
        >
          <Menu className="size-4" />
          Mais
        </button>
      </nav>

      {/* Sheet "Mais" mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar"
          />
          <div className="anim-slide absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-brand-deep-hover bg-brand-base p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-bold text-brand-platinum" style={{ fontFamily: 'var(--font-heading)' }}>
                Menu
              </span>
              <button
                onClick={() => setMenuAberto(false)}
                className="rounded-lg p-1.5 text-brand-platinum/50 transition-colors hover:bg-brand-deep hover:text-brand-platinum"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {NAV_SECUNDARIA.map((item) => {
                const Icone = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuAberto(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-primary/10 text-brand-primary'
                          : 'text-brand-platinum/50 hover:bg-brand-deep hover:text-brand-platinum'
                      }`
                    }
                  >
                    <Icone className="size-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
