import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, LogIn, Settings, X, ExternalLink, Plus } from 'lucide-react'
import type { CapturedLead, QualificationCriteria, ScoreValue } from '@/types'
import {
  emptyLead, emptyCriteria,
  calcularNota, definirPrioridade,
  CRITERIA_LABELS, PRIORITY_LABELS,
} from '@/types'
import { saveBaseUrl, loadBaseUrl, DEFAULT_BASE_URL, saveGeminiKey, loadGeminiKey, saveSupabaseUrl, loadSupabaseUrl, saveSupabaseAnonKey, loadSupabaseAnonKey } from '@/utils/storage'
import { parseInstagramProfileUrl } from '@/utils/instagram'
import { analyzeInstagramProfileText } from '@/utils/analyzeProfile'
import type { AnalyzeResult } from '@/utils/analyzeProfile'
import { signIn, signOut, restoreSession, saveLead, checkDuplicate, getSession } from '@/utils/supabase'

type AuthStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
type View = 'app' | 'qualify'

const LABEL_CLASS = 'block text-xs text-brand-platinum/50 font-medium mb-1'
const INPUT_CLASS = 'w-full rounded-lg border border-brand-deep-hover bg-brand-base px-3 py-2 text-sm text-brand-platinum placeholder:text-brand-platinum/25 outline-none transition-colors focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/60'

export function SidePanel() {
  const [view, setView] = useState<View>('app')
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL)
  const [showSettings, setShowSettings] = useState(false)
  const [geminiKey, setGeminiKey] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const sessionSentRef = useRef(false)

  const [authStatus, setAuthStatus] = useState<AuthStatus>('disconnected')
  const [authError, setAuthError] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('')

  const [lead, setLead] = useState<CapturedLead>(emptyLead)
  const [capturePopup, setCapturePopup] = useState<{
    handle: string
    url: string
    suggestions: AnalyzeResult | null
  } | null>(null)
  const [captureError, setCaptureError] = useState('')
  const baseUrlRef = useRef(baseUrl)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)

  const [qualifyingLead, setQualifyingLead] = useState<{
    id: string
    nome: string
    perfilInstagram: string
    linkPerfil: string
  } | null>(null)
  const [qualCriteria, setQualCriteria] = useState<QualificationCriteria>(emptyCriteria())
  const [qualNotes, setQualNotes] = useState('')

  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeError, setIframeError] = useState(false)

  const showToast = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }, [])

  useEffect(() => {
    baseUrlRef.current = baseUrl
  }, [baseUrl])

  useEffect(() => {
    loadBaseUrl().then(setBaseUrl)
    loadGeminiKey().then(setGeminiKey)
    ;(async () => {
      const [sUrl, sKey] = await Promise.all([loadSupabaseUrl(), loadSupabaseAnonKey()])
      setSupabaseUrl(sUrl)
      setSupabaseAnonKey(sKey)
      if (sUrl && sKey) {
        const session = await restoreSession(sUrl, sKey)
        setAuthStatus(session ? 'connected' : 'disconnected')
      }
    })()
  }, [])

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.source !== 'prospectos' || event.data?.type !== 'OPEN_INSTAGRAM_PROFILE') return

      try {
        const expectedOrigin = new URL(baseUrlRef.current).origin
        if (event.origin !== expectedOrigin) return
      } catch {
        return
      }

      const url = event.data.url
      if (!url || (!url.startsWith('https://instagram.com/') && !url.startsWith('https://www.instagram.com/'))) return

      chrome.runtime.sendMessage(
        { type: 'OPEN_INSTAGRAM_PROFILE', url },
        (response) => {
          if (response?.ok) {
            setView('qualify')
            setQualifyingLead({
              id: event.data.leadId || '',
              nome: event.data.leadName || '',
              perfilInstagram: event.data.leadHandle || '',
              linkPerfil: url,
            })
            setQualCriteria(emptyCriteria())
            setQualNotes('')
          } else {
            showToast('error', 'Não consegui abrir o perfil na guia atual.')
          }
        },
      )
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [showToast])

  function handleIframeLoad() {
    setIframeLoading(false)
    setIframeError(false)
    if (sessionSentRef.current) return
    sessionSentRef.current = true
    if (authStatus === 'connected' && supabaseUrl && supabaseAnonKey && iframeRef.current) {
      getSession(supabaseUrl, supabaseAnonKey).then((session) => {
        if (session && iframeRef.current?.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              { source: 'prospectos-extension', type: 'SET_SESSION', session },
              new URL(baseUrl).origin,
            )
          } catch {}
        }
      })
    }
  }

  async function handleLogin() {
    if (!supabaseUrl || !supabaseAnonKey) {
      setAuthError('Configure a URL e chave anônima do Supabase nas configurações.')
      return
    }
    if (!authEmail || !authPassword) {
      setAuthError('Preencha e-mail e senha.')
      return
    }
    setAuthStatus('connecting')
    setAuthError('')
    const result = await signIn(supabaseUrl, supabaseAnonKey, authEmail, authPassword)
    if (result.ok) {
      setAuthStatus('connected')
      setAuthPassword('')
      sessionSentRef.current = false
    } else {
      setAuthStatus('error')
      setAuthError(result.erro)
    }
  }

  async function handleLogout() {
    await signOut(supabaseUrl, supabaseAnonKey)
    setAuthStatus('disconnected')
    setAuthError('')
    sessionSentRef.current = false
  }

  async function handleCapture() {
    setCaptureError('')
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.url) { setCaptureError('Não foi possível ler a URL da aba ativa.'); return }
      const result = parseInstagramProfileUrl(tab.url)
      if (!result.isValid) { setCaptureError(result.error ?? 'URL não é um perfil do Instagram.'); return }

      let profileData: { nome: string; seguidores: string; bioText: string; bioLink: string } | null = null
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: () => {
            const nome = (document.querySelector('meta[property="og:title"]')?.getAttribute('content') || document.title || '').replace(/\s*\(@.+/, '').replace(/\s*•.*/, '').trim()
            const body = document.body?.innerText || ''
            const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
            const seguidores = (body.match(/([\d.,]+[KMB]?)\s+followers?\s/i)?.[1] || metaDesc.match(/([\d.,]+[KMB]?)\s+followers?\s/i)?.[1] || '')
            const bioText = metaDesc || document.querySelector('meta[property="og:description"]')?.getAttribute('content') || ''
            let bioLink = ''
            for (const link of document.querySelectorAll('a[href]')) {
              const href = link.getAttribute('href') || ''
              if (href && !href.includes('instagram.com') && !href.startsWith('#') && !href.startsWith('/') && href.startsWith('http')) { bioLink = href; break }
            }
            return { nome, seguidores, bioText, bioLink }
          },
        })
        if (results?.[0]?.result) profileData = results[0].result as any
      } catch {}

      const suggestions = profileData?.bioText || profileData?.nome
        ? await analyzeInstagramProfileText({
            nome: profileData?.nome || '',
            seguidores: profileData?.seguidores || '',
            bioText: profileData?.bioText || '',
            linkOferta: profileData?.bioLink || '',
          }, geminiKey || undefined)
        : null

      const tipoOferta = suggestions?.tipoOferta
        ? (suggestions.tipoOferta.charAt(0).toUpperCase() + suggestions.tipoOferta.slice(1)) as CapturedLead['offerType']
        : 'Outro'

      setLead({
        name: profileData?.nome || '',
        instagramHandle: result.handle!,
        instagramUrl: result.profileUrl!,
        niche: suggestions?.nicho || '',
        offerName: suggestions?.produtoOferta || '',
        offerType: tipoOferta,
        followers: profileData?.seguidores || '',
        bioLink: profileData?.bioLink || '',
        salesSignal: suggestions?.sinalVendaPercebido || '',
        visualProblem: '',
        positivePoint: suggestions?.pontoPositivo || '',
        visualOpportunity: '',
        notes: '',
        qualification: null,
      })
      setCapturePopup({ handle: result.handle!, url: result.profileUrl!, suggestions })
    } catch {
      setCaptureError('Erro ao acessar a aba ativa.')
    }
  }

  async function handleSaveCapture() {
    if (authStatus !== 'connected') { showToast('error', 'Conecte-se ao ProspectOS antes de salvar.'); return }
    if (!lead.instagramHandle && !lead.name) { showToast('error', 'Nenhum dado de lead para salvar.'); return }

    const seguidores = Number(String(lead.followers).replace(/[.,\s]/g, ''))
    const parsedSeguidores = isNaN(seguidores) || seguidores < 0 ? 0 : seguidores
    const offerTypeMap: Record<string, string> = { mentoria: 'mentoria', curso: 'curso', formação: 'formacao', formacao: 'formacao', consultoria: 'consultoria', comunidade: 'comunidade', workshop: 'workshop', imersao: 'imersao', outro: 'outro' }
    const tipoOferta = offerTypeMap[lead.offerType.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || 'outro'
    const perfilInstagram = lead.instagramHandle.replace('@', '')
    const linkPerfil = lead.instagramUrl || `https://instagram.com/${perfilInstagram}`

    const dbRecord: Record<string, unknown> = {
      id: crypto.randomUUID(), nome: lead.name, perfil_instagram: perfilInstagram, link_perfil: linkPerfil,
      nicho: lead.niche || '', produto_oferta: lead.offerName || '', tipo_oferta: tipoOferta,
      seguidores: parsedSeguidores, link_oferta: lead.bioLink || '',
      sinal_venda_percebido: lead.salesSignal || '', problema_visual_percebido: '', ponto_positivo: lead.positivePoint || '',
      oportunidade_visual: '', observacoes: lead.notes || '',
      status: 'captado', qualification: { temProdutoClaro: 0, temCtaVenda: 0, temAudienciaAtiva: 0, visualPoderiaMelhorar: 0, consigoAjudar: 0 },
      nota: 0, prioridade: 'baixa',
      primeira_abordagem: null, ultimo_contato: null, proximo_followup: null,
      qtd_followups: 0, proxima_acao: '', historico: [],
      fonte: 'extensao', criado_em: Date.now(), atualizado_em: Date.now(),
    }

    const dup = await checkDuplicate(supabaseUrl, supabaseAnonKey, perfilInstagram, linkPerfil)
    if (dup.exists) { showToast('warning', 'Esse lead já existe no ProspectOS.'); setCapturePopup(null); return }

    const result = await saveLead(supabaseUrl, supabaseAnonKey, dbRecord)
    showToast(result.ok ? 'success' : 'error', result.ok ? 'Lead salvo com sucesso.' : `Não consegui salvar o lead. ${result.erro}`)
    setCapturePopup(null)
  }

  async function handleSaveQualification() {
    if (!qualifyingLead) return
    const score = calcularNota(qualCriteria)
    const priority = definirPrioridade(score)
    const result = await saveLead(supabaseUrl, supabaseAnonKey, {
      id: qualifyingLead.id,
      qualification: qualCriteria,
      nota: score,
      prioridade: priority,
      observacoes: qualNotes,
      atualizado_em: Date.now(),
    })
    showToast(result.ok ? 'success' : 'error', result.ok ? 'Qualificação salva.' : `Erro ao salvar qualificação. ${result.erro}`)
    setView('app')
    setQualifyingLead(null)
  }

  function handleBackToApp() {
    setView('app')
    setQualifyingLead(null)
  }

  return (
    <div className="flex h-dvh flex-col bg-brand-deep text-brand-platinum">
      {/* Header + Auth */}
      <header className="flex-shrink-0 border-b border-brand-deep-hover px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Prospect<span className="text-brand-primary">OS</span>
            <span className="text-[10px] font-medium text-brand-platinum/40 ml-1">Capture</span>
          </span>
          <button onClick={() => setShowSettings((s) => !s)} className="rounded p-1 text-brand-platinum/30 hover:text-brand-platinum/60 transition-colors">
            <Settings className="size-4" />
          </button>
        </div>
        {authStatus === 'connected' ? (
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-success/40" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-success" />
              </span>
              <span className="text-[10px] text-brand-success/70">Conectado</span>
            </div>
            <button onClick={handleLogout} className="text-[10px] text-brand-platinum/30 hover:text-brand-danger transition-colors">Sair</button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mt-1">
            <input className="flex-1 rounded border border-brand-deep-hover bg-brand-base px-2 py-1 text-[11px] text-brand-platinum placeholder:text-brand-platinum/20 outline-none" type="email" value={authEmail} onChange={(e) => { setAuthEmail(e.target.value); setAuthError('') }} placeholder="Email" />
            <input className="flex-1 rounded border border-brand-deep-hover bg-brand-base px-2 py-1 text-[11px] text-brand-platinum placeholder:text-brand-platinum/20 outline-none" type="password" value={authPassword} onChange={(e) => { setAuthPassword(e.target.value); setAuthError('') }} placeholder="Senha" />
            <button onClick={handleLogin} className="rounded bg-brand-primary px-2 py-1 text-[11px] font-medium text-white hover:bg-brand-primary/90 transition-colors shrink-0">
              {authStatus === 'connecting' ? '...' : <LogIn className="size-3.5" />}
            </button>
          </div>
        )}
        {authError && <p className="text-[10px] text-brand-danger/80 mt-0.5">{authError}</p>}
      </header>

      {/* Settings */}
      {showSettings && (
        <div className="flex-shrink-0 border-b border-brand-deep-hover px-3 py-2 space-y-2">
          <div className="space-y-1">
            <label className="text-[10px] text-brand-platinum/40">URL do Supabase</label>
            <input className={INPUT_CLASS + ' text-xs'} value={supabaseUrl} onChange={async (e) => { setSupabaseUrl(e.target.value); await saveSupabaseUrl(e.target.value) }} placeholder="https://seu-projeto.supabase.co" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-brand-platinum/40">Chave anônima do Supabase</label>
            <input className={INPUT_CLASS + ' text-xs'} type="password" value={supabaseAnonKey} onChange={async (e) => { setSupabaseAnonKey(e.target.value); await saveSupabaseAnonKey(e.target.value) }} placeholder="eyJhbGciOi..." />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-brand-platinum/40">URL base do ProspectOS</label>
            <input className={INPUT_CLASS + ' text-xs'} value={baseUrl} onChange={async (e) => { setBaseUrl(e.target.value); await saveBaseUrl(e.target.value) }} placeholder="https://prospectos.vercel.app" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-brand-platinum/40">Chave Gemini (opcional)</label>
            <input className={INPUT_CLASS + ' text-xs'} type="password" value={geminiKey} onChange={async (e) => { setGeminiKey(e.target.value); await saveGeminiKey(e.target.value) }} placeholder="AIzaSy..." />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`flex-shrink-0 px-3 py-1.5 border-b border-brand-deep-hover ${toast.type === 'success' ? 'bg-brand-success/10' : toast.type === 'warning' ? 'bg-brand-accent/10' : 'bg-brand-danger/10'}`}>
          <div className="flex items-start justify-between gap-2">
            <p className={`text-[11px] ${toast.type === 'success' ? 'text-brand-success/90' : toast.type === 'warning' ? 'text-brand-accent/90' : 'text-brand-danger/90'}`}>{toast.message}</p>
            <button onClick={() => setToast(null)} className="shrink-0"><X className="size-3 opacity-60 hover:opacity-100" /></button>
          </div>
        </div>
      )}

      {/* Main content */}
      {view === 'app' ? (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {iframeError ? (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-brand-platinum/60">Não foi possível carregar o ProspectOS.</p>
                <p className="text-xs text-brand-platinum/30">Verifique a URL base nas configurações.</p>
                <button onClick={() => { setIframeError(false); setIframeLoading(true) }} className="mt-2 rounded-lg bg-brand-primary px-4 py-1.5 text-xs font-medium text-white">Tentar novamente</button>
              </div>
            </div>
          ) : (
            <>
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-deep z-10">
                  <div className="text-center space-y-3">
                    <div className="mx-auto size-6 rounded-full border-2 border-brand-primary/30 border-t-brand-primary animate-spin" />
                    <p className="text-xs text-brand-platinum/40">Carregando ProspectOS...</p>
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={`${baseUrl.replace(/\/+$/, '')}?embedded=extension`}
                className={`w-full flex-1 border-0 ${iframeLoading ? 'invisible' : ''}`}
                title="ProspectOS"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={handleIframeLoad}
                onError={() => { setIframeLoading(false); setIframeError(true) }}
              />
            </>
          )}

          {/* FAB */}
          <button
            onClick={handleCapture}
            className="absolute bottom-4 right-4 z-20 flex size-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
            title="Capturar lead"
          >
            <Plus className="size-6" />
          </button>
        </div>
      ) : (
        /* Qualification screen */
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-platinum/40">Qualificar lead</p>
              <p className="text-sm font-semibold text-brand-platinum">@{qualifyingLead?.perfilInstagram}</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => openInstagramDirect(qualifyingLead?.linkPerfil)} className="rounded-lg border border-brand-deep-hover px-2.5 py-1.5 text-[11px] text-brand-platinum/50 hover:text-brand-accent transition-colors">
                <ExternalLink className="size-3.5" />
              </button>
              <button onClick={handleBackToApp} className="rounded-lg border border-brand-deep-hover px-2.5 py-1.5 text-[11px] text-brand-platinum/50 hover:text-brand-platinum transition-colors">
                Voltar
              </button>
            </div>
          </div>

          <p className="text-[10px] text-brand-platinum/40 uppercase tracking-wide font-medium">Critérios (0–2 cada)</p>
          {(Object.keys(CRITERIA_LABELS) as (keyof QualificationCriteria)[]).map((key) => (
            <div key={key} className="space-y-1">
              <span className={LABEL_CLASS}>{CRITERIA_LABELS[key]}</span>
              <div className="flex gap-1.5">
                {([{ value: 0 as ScoreValue, label: 'Não' }, { value: 1 as ScoreValue, label: 'Parcial' }, { value: 2 as ScoreValue, label: 'Sim' }]).map(({ value: v, label }) => {
                  const active = qualCriteria[key] === v
                  return (
                    <button key={v} onClick={() => setQualCriteria((prev) => ({ ...prev, [key]: v }))}
                      className={`flex-1 rounded-lg border py-1.5 text-[11px] font-medium transition-colors ${active ? 'border-brand-primary bg-brand-primary/15 text-brand-primary' : 'border-brand-deep-hover bg-brand-base text-brand-platinum/40 hover:border-brand-platinum/20'}`}>
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {qualifyingLead && (
            <div className="rounded-lg border border-brand-deep-hover bg-brand-base p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-brand-platinum/40 uppercase block mb-0.5">Nota final</span>
                <span className="text-xl font-bold text-brand-primary">{calcularNota(qualCriteria)}/10</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-brand-platinum/40 uppercase block mb-0.5">Prioridade</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  definirPrioridade(calcularNota(qualCriteria)) === 'prioridade_maxima' ? 'bg-brand-primary/20 text-brand-primary' :
                  definirPrioridade(calcularNota(qualCriteria)) === 'alta' ? 'bg-brand-accent/20 text-brand-accent' :
                  definirPrioridade(calcularNota(qualCriteria)) === 'media' ? 'bg-brand-platinum/10 text-brand-platinum/60' :
                  'bg-brand-platinum/5 text-brand-platinum/30'
                }`}>{PRIORITY_LABELS[definirPrioridade(calcularNota(qualCriteria))]}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <span className={LABEL_CLASS}>Observações / Oportunidades visuais</span>
            <textarea className={`${INPUT_CLASS} min-h-20 resize-y`} value={qualNotes} onChange={(e) => setQualNotes(e.target.value)} placeholder="O que você observou no perfil?" rows={3} />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleSaveQualification} className="flex-1 rounded-lg bg-brand-primary py-2 text-xs font-medium text-white hover:bg-brand-primary/90 transition-colors">
              <Check className="size-3.5 inline mr-1" /> Salvar qualificação
            </button>
            <button onClick={handleBackToApp} className="flex-1 rounded-lg border border-brand-deep-hover py-2 text-xs text-brand-platinum/50 hover:text-brand-platinum transition-colors">
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* Capture popup */}
      {capturePopup && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-xs rounded-xl border border-brand-deep-hover bg-brand-base p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-brand-platinum">Lead detectado</p>
              <button onClick={() => setCapturePopup(null)} className="text-brand-platinum/30 hover:text-brand-platinum/60"><X className="size-4" /></button>
            </div>
            <p className="text-xs text-brand-accent/80">@{capturePopup.handle}</p>
            {capturePopup.suggestions && (
              <div className="space-y-1 text-xs text-brand-platinum/70">
                {capturePopup.suggestions.nicho && <p><span className="text-brand-platinum/40">Nicho:</span> {capturePopup.suggestions.nicho}</p>}
                {capturePopup.suggestions.produtoOferta && <p><span className="text-brand-platinum/40">Oferta:</span> {capturePopup.suggestions.produtoOferta}</p>}
                {capturePopup.suggestions.sinalVendaPercebido && <p><span className="text-brand-platinum/40">Sinal venda:</span> {capturePopup.suggestions.sinalVendaPercebido}</p>}
                {capturePopup.suggestions.pontoPositivo && <p><span className="text-brand-platinum/40">Ponto +:</span> {capturePopup.suggestions.pontoPositivo}</p>}
              </div>
            )}
            {captureError && <p className="text-[11px] text-brand-danger/80">{captureError}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={handleSaveCapture} className="flex-1 rounded-lg bg-brand-primary py-2 text-xs font-medium text-white hover:bg-brand-primary/90 transition-colors">
                <Check className="size-3.5 inline mr-1" /> Salvar
              </button>
              <button onClick={() => setCapturePopup(null)} className="flex-1 rounded-lg border border-brand-deep-hover py-2 text-xs text-brand-platinum/50 hover:text-brand-platinum transition-colors">
                Recusar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function openInstagramDirect(url?: string) {
  if (!url) return
  chrome.runtime.sendMessage({ type: 'OPEN_INSTAGRAM_PROFILE', url })
}
