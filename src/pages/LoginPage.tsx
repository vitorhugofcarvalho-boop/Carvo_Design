import { useState } from 'react'
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export function LoginPage() {
  const { login, signup } = useAuth()
  const [modo, setModo] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)

  async function submeter(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setErro('Preencha e-mail e senha.')
      return
    }
    if (password.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    setLoading(true)
    setErro('')
    setSucesso('')

    const fn = modo === 'login' ? login : signup
    const result = await fn(email.trim(), password)

    setLoading(false)
    if (!result.ok) {
      setErro(result.erro ?? 'Erro ao processar.')
    } else if (modo === 'signup') {
      setSucesso('Conta criada! Verifique seu e-mail para confirmar (ou já faça login).')
      setModo('login')
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-base px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold text-brand-platinum"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Prospect<span className="text-brand-primary">OS</span>
          </h1>
          <p className="mt-1 text-xs text-brand-platinum/30 font-medium tracking-wider uppercase">
            Sistema de Prospecção
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-brand-deep-hover bg-brand-base p-6 shadow-2xl">
          <h2 className="mb-1 text-sm font-semibold text-brand-platinum">
            {modo === 'login' ? 'Acessar o sistema' : 'Criar conta'}
          </h2>
          <p className="mb-5 text-xs text-brand-platinum/40">
            {modo === 'login' ? 'Faça login para continuar' : 'Crie seu acesso ao CRM'}
          </p>

          {erro && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-3 py-2 text-xs text-brand-danger">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand-success/30 bg-brand-success/10 px-3 py-2 text-xs text-brand-success">
              <CheckCircle className="mt-0.5 size-3.5 shrink-0" />
              <span>{sucesso}</span>
            </div>
          )}

          <form onSubmit={submeter} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-brand-platinum/60 font-medium">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErro('') }}
                placeholder="seu@email.com"
                autoFocus
                className="block w-full rounded-lg border border-brand-deep-hover bg-brand-base px-3 py-2 text-sm text-brand-platinum outline-none transition-colors placeholder:text-brand-platinum/20 focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-brand-platinum/60 font-medium">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErro('') }}
                  placeholder="mínimo 6 caracteres"
                  className="block w-full rounded-lg border border-brand-deep-hover bg-brand-base px-3 py-2 pr-9 text-sm text-brand-platinum outline-none transition-colors placeholder:text-brand-platinum/20 focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/60"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-platinum/30 transition-colors hover:text-brand-platinum/60"
                  tabIndex={-1}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : modo === 'login' ? (
                <LogIn className="size-4" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {loading ? 'Aguarde…' : modo === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setModo(modo === 'login' ? 'signup' : 'login'); setErro(''); setSucesso('') }}
              className="text-xs text-brand-primary/60 hover:text-brand-primary transition-colors"
            >
              {modo === 'login' ? 'Não tem conta? Criar acesso' : 'Já tem conta? Fazer login'}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-brand-platinum/20">
          ProspectOS — Autenticação via Supabase
        </p>
      </div>
    </div>
  )
}
