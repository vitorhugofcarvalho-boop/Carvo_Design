import { useCallback, useEffect, useRef, useState } from 'react'
import { Copy, Eraser, Save, Check, ExternalLink, Send, Settings, Camera, LogIn, LogOut, X } from 'lucide-react'
import type { CapturedLead, QualificationCriteria, ScoreValue } from '@/types'
import {
  OFFER_TYPES, emptyLead, emptyCriteria,
  calcularNota, definirPrioridade,
  CRITERIA_LABELS, PRIORITY_LABELS,
} from '@/types'
import { saveDraft, loadDraft, clearDraft, saveBaseUrl, loadBaseUrl, DEFAULT_BASE_URL, saveGeminiKey, loadGeminiKey, saveSupabaseUrl, loadSupabaseUrl, saveSupabaseAnonKey, loadSupabaseAnonKey } from '@/utils/storage'
import { parseInstagramProfileUrl } from '@/utils/instagram'
import { analyzeInstagramProfileText } from '@/utils/analyzeProfile'
import type { AnalyzeResult } from '@/utils/analyzeProfile'
import { signIn, signOut, restoreSession, saveLead, checkDuplicate } from '@/utils/supabase'

type AuthStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

type Tab = 'lead' | 'qualify'

const INPUT_CLASS =
  'w-full rounded-lg border border-brand-deep-hover bg-brand-base px-3 py-2 text-sm text-brand-platinum placeholder:text-brand-platinum/25 outline-none transition-colors focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/60'

const LABEL_CLASS = 'block text-xs text-brand-platinum/50 font-medium mb-1'

export function SidePanel() {
  const [tab, setTab] = useState<Tab>('lead')
  const [lead, setLead] = useState<CapturedLead>(emptyLead)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL)
  const [geminiKey, setGeminiKey] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const showToast = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }, [])
  const [captureError, setCaptureError] = useState('')
  const [confirmReplace, setConfirmReplace] = useState<{ handle: string; url: string; profileData: any } | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>('disconnected')
  const [authError, setAuthError] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)
  const [savedLeadInfo, setSavedLeadInfo] = useState<{ name: string; instagramHandle: string; instagramUrl: string; linkPerfil: string } | null>(null)
  const [suggestions, setSuggestions] = useState<AnalyzeResult | null>(null)
  const [ignoreSuggestions, setIgnoreSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    loadDraft().then((draft) => {
      if (draft) setLead((prev) => ({ ...prev, ...draft }))
    })
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

  const persist = useCallback((data: CapturedLead) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveDraft(data)
      setSaved(true)
    }, 400)
  }, [])

  function update<K extends keyof CapturedLead>(field: K, value: CapturedLead[K]) {
    setLead((prev) => {
      const next = { ...prev, [field]: value }
      persist(next)
      return next
    })
    setSaved(false)
  }

  async function handleSave() {
    await saveDraft(lead)
    setSaved(true)
  }

  async function handleClear() {
    setLead(emptyLead())
    setSaved(false)
    setCopied(false)
    await clearDraft()
  }

  function leadParaEnvio(): Record<string, unknown> {
    const { qualification: _, ...dados } = lead
    return dados
  }

  async function handleCopyJson() {
    const json = JSON.stringify(leadParaEnvio(), null, 2)
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSendToProspectOS() {
    if (authStatus !== 'connected') {
      showToast('error', 'Conecte-se ao ProspectOS antes de enviar.')
      return
    }

    const nome = lead.name.trim()
    const handle = lead.instagramHandle.trim()
    const perfilUrl = lead.instagramUrl.trim()
    if (!nome && !handle) {
      showToast('error', 'Preencha o nome ou o perfil do Instagram.')
      return
    }
    if (!perfilUrl && !handle) {
      showToast('error', 'Preencha a URL ou o perfil do Instagram.')
      return
    }

    const seguidores = Number(String(lead.followers).replace(/[.,\s]/g, ''))
    const parsedSeguidores = isNaN(seguidores) || seguidores < 0 ? 0 : seguidores

    const offerTypeMap: Record<string, string> = {
      mentoria: 'mentoria', curso: 'curso', formação: 'formacao',
      formacao: 'formacao', consultoria: 'consultoria', comunidade: 'comunidade',
      workshop: 'workshop', imersao: 'imersao', outro: 'outro',
    }
    const offerTypeRaw = lead.offerType.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const tipoOferta = offerTypeMap[offerTypeRaw] || 'outro'

    const perfilInstagram = handle.replace('@', '')
    const linkPerfil = perfilUrl || `https://instagram.com/${perfilInstagram}`

    const dbRecord: Record<string, unknown> = {
      id: crypto.randomUUID(),
      nome,
      perfil_instagram: perfilInstagram,
      link_perfil: linkPerfil,
      nicho: lead.niche || '',
      produto_oferta: lead.offerName || '',
      tipo_oferta: tipoOferta,
      seguidores: parsedSeguidores,
      link_oferta: lead.bioLink || '',
      sinal_venda_percebido: lead.salesSignal || '',
      problema_visual_percebido: lead.visualProblem || '',
      ponto_positivo: lead.positivePoint || '',
      oportunidade_visual: lead.visualOpportunity || '',
      observacoes: lead.notes || '',
      status: 'captado',
      qualification: { temProdutoClaro: 0, temCtaVenda: 0, temAudienciaAtiva: 0, visualPoderiaMelhorar: 0, consigoAjudar: 0 },
      nota: 0,
      prioridade: 'baixa',
      primeira_abordagem: null,
      ultimo_contato: null,
      proximo_followup: null,
      qtd_followups: 0,
      proxima_acao: '',
      historico: [],
      fonte: 'extensao',
      criado_em: Date.now(),
      atualizado_em: Date.now(),
    }

    const dup = await checkDuplicate(supabaseUrl, supabaseAnonKey, perfilInstagram, linkPerfil)
    if (dup.exists) {
      showToast('warning', 'Esse lead já existe no ProspectOS.')
      return
    }

    const result = await saveLead(supabaseUrl, supabaseAnonKey, dbRecord)

    if (result.ok) {
      showToast('success', 'Lead salvo com sucesso.')
      setSavedLeadInfo({
        name: nome,
        instagramHandle: perfilInstagram,
        instagramUrl: lead.instagramUrl || '',
        linkPerfil,
      })
    } else {
      showToast('error', `Não consegui salvar o lead. ${result.erro}`)
    }
  }

  function handleOpenProspectOS() {
    chrome.tabs.create({ url: baseUrl.replace(/\/+$/, '') })
  }

  async function handleBaseUrlChange(value: string) {
    setBaseUrl(value)
    await saveBaseUrl(value)
  }

  async function handleLogin() {
    if (!supabaseUrl || !supabaseAnonKey) {
      setAuthError('Configure a URL e a chave anônima do Supabase nas configurações.')
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
    } else {
      setAuthStatus('error')
      setAuthError(result.erro)
    }
  }

  async function handleLogout() {
    await signOut(supabaseUrl, supabaseAnonKey)
    setAuthStatus('disconnected')
    setAuthError('')
  }

  async function handleCaptureProfile() {
    setCaptureError('')
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.url) {
        setCaptureError('Não foi possível ler a URL da aba ativa.')
        return
      }
      const result = parseInstagramProfileUrl(tab.url)
      if (!result.isValid) {
        setCaptureError(result.error ?? 'URL não é um perfil do Instagram.')
        return
      }

      let profileData: {
        nome: string
        seguidores: string
        bioText: string
        bioLink: string
      } | null = null

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: () => {
            function extractNome(): string {
              const raw = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
                || document.title
                || ''
              const m = raw.match(/^(.+?)\s*\(@/i) || raw.match(/^(.+?)\s*•\s*Instagram/i)
              let name = m ? m[1].trim() : ''
              if (name.includes('|')) name = name.split('|')[0].trim()
              return name
            }

            function extractSeguidores(): string {
              const body = document.body?.innerText || ''
              const statsRe = /([\d.,]+[KMB]?)\s+followers?\s/i
              const m1 = body.match(statsRe)
              if (m1) return m1[1]
              const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
              const m2 = metaDesc.match(statsRe)
              if (m2) return m2[1]
              return ''
            }

            function extractBioText(): string {
              const metaDesc =
                document.querySelector('meta[name="description"]')?.getAttribute('content')
                || document.querySelector('meta[property="og:description"]')?.getAttribute('content')
                || ''
              return metaDesc
            }

            function extractBioLink(): string {
              const links = document.querySelectorAll('section a[href], header a[href]')
              for (const link of links) {
                const href = link.getAttribute('href') || ''
                if (href && !href.includes('instagram.com') && !href.startsWith('#') && !href.startsWith('/') && href.startsWith('http')) {
                  return href
                }
              }
              return ''
            }

            return {
              nome: extractNome(),
              seguidores: extractSeguidores(),
              bioText: extractBioText(),
              bioLink: extractBioLink(),
            }
          },
        })

        if (results?.[0]?.result) {
          profileData = results[0].result as any
        }
      } catch {
        // Fallback: URL-only capture
      }

      const hasExisting = lead.instagramHandle || lead.instagramUrl || lead.name || lead.followers || lead.bioLink || lead.notes
      if (hasExisting) {
        setConfirmReplace({
          handle: result.handle!,
          url: result.profileUrl!,
          profileData,
        })
      } else {
        await applyCaptureData(result.handle!, result.profileUrl!, profileData)
      }
    } catch {
      setCaptureError('Erro ao acessar a aba ativa.')
    }
  }

  async function applyCapture(handle: string, url: string, profileData: any) {
    await applyCaptureData(handle, url, profileData)
    setConfirmReplace(null)
  }

  async function applyCaptureData(handle: string, url: string, profileData: any) {
    update('instagramHandle', handle)
    update('instagramUrl', url)
    if (profileData) {
      if (profileData.nome) update('name', profileData.nome)
      if (profileData.seguidores) update('followers', profileData.seguidores)
      if (profileData.bioLink) update('bioLink', profileData.bioLink)
    }
    if (profileData?.bioText || profileData?.nome) {
      const result = await analyzeInstagramProfileText({
        nome: profileData?.nome || '',
        seguidores: profileData?.seguidores || '',
        bioText: profileData?.bioText || '',
        linkOferta: profileData?.bioLink || '',
      }, geminiKey || undefined)
      setSuggestions(result)
      setIgnoreSuggestions(false)
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-brand-deep text-brand-platinum">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-brand-deep-hover px-4 py-3">
        <h1 className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Prospect<span className="text-brand-primary">OS</span>{' '}
          <span className="text-xs font-medium text-brand-platinum/40">Capture</span>
        </h1>
        <p className="mt-0.5 text-[10px] text-brand-platinum/30 tracking-wider uppercase">
          Cadastre e qualifique leads sem sair do Instagram
        </p>
      </header>

      {/* Auth status / login */}
      <div className="flex-shrink-0 border-b border-brand-deep-hover px-4 py-2">
        {authStatus === 'connected' ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-success/40" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-success" />
              </span>
              <span className="text-[11px] text-brand-success/80 font-medium">Conectado ao ProspectOS</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-md border border-brand-deep-hover px-2 py-1 text-[10px] text-brand-platinum/40 transition-colors hover:border-brand-danger/40 hover:text-brand-danger"
            >
              <LogOut className="size-3" /> Sair
            </button>
          </div>
        ) : authStatus === 'connecting' ? (
          <div className="flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent/40" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-accent" />
            </span>
            <span className="text-[11px] text-brand-accent/70">Conectando...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-brand-platinum/40 uppercase tracking-wide font-medium">Autenticação</span>
              <button
                onClick={() => setShowSettings(true)}
                className="text-[10px] text-brand-primary/60 hover:text-brand-primary underline"
              >
                Configurar Supabase
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-lg border border-brand-deep-hover bg-brand-base px-2.5 py-1.5 text-xs text-brand-platinum placeholder:text-brand-platinum/25 outline-none transition-colors focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/60"
                type="email"
                value={authEmail}
                onChange={(e) => { setAuthEmail(e.target.value); setAuthError('') }}
                placeholder="Email"
              />
              <input
                className="flex-1 rounded-lg border border-brand-deep-hover bg-brand-base px-2.5 py-1.5 text-xs text-brand-platinum placeholder:text-brand-platinum/25 outline-none transition-colors focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/60"
                type="password"
                value={authPassword}
                onChange={(e) => { setAuthPassword(e.target.value); setAuthError('') }}
                placeholder="Senha"
              />
              <button
                onClick={handleLogin}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-primary/90"
              >
                <LogIn className="size-3.5" /> Conectar
              </button>
            </div>
            {authError && (
              <p className="text-[10px] text-brand-danger/80">{authError}</p>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-brand-deep-hover">
        <button
          onClick={() => setTab('lead')}
          className={`flex-1 py-2.5 text-xs font-medium tracking-wide uppercase transition-colors ${
            tab === 'lead'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-brand-platinum/30 hover:text-brand-platinum/50'
          }`}
        >
          Adicionar lead
        </button>
        <button
          onClick={() => setTab('qualify')}
          className={`flex-1 py-2.5 text-xs font-medium tracking-wide uppercase transition-colors ${
            tab === 'qualify'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-brand-platinum/30 hover:text-brand-platinum/50'
          }`}
        >
          Qualificar
        </button>
      </div>

      {/* Content */}
      {tab === 'lead' ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            <p className="text-[10px] text-brand-platinum/40 uppercase tracking-wide font-medium">
              Dados do lead
            </p>

            <Field label="Nome" required>
              <input
                className={INPUT_CLASS}
                value={lead.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Nome completo"
                autoFocus
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Perfil do Instagram" required>
                <input
                  className={INPUT_CLASS}
                  value={lead.instagramHandle}
                  onChange={(e) => update('instagramHandle', e.target.value.replace('@', ''))}
                  placeholder="usuario"
                />
              </Field>
              <Field label="URL do perfil">
                <input
                  className={INPUT_CLASS}
                  value={lead.instagramUrl}
                  onChange={(e) => update('instagramUrl', e.target.value)}
                  placeholder="https://ig.com/u"
                />
              </Field>
            </div>

            <button
              onClick={handleCaptureProfile}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-deep-hover bg-brand-base px-3 py-2 text-xs text-brand-platinum/50 transition-colors hover:border-brand-primary/40 hover:text-brand-primary"
            >
              <Camera className="size-3.5" /> Capturar perfil atual
            </button>
            {captureError && (
              <p className="text-[11px] text-brand-danger/80">{captureError}</p>
            )}

            {suggestions && !ignoreSuggestions && (() => {
              const itens: { label: string; value: string | undefined }[] = [
                ...(suggestions.nicho ? [{ label: 'Nicho', value: suggestions.nicho }] : []),
                ...(suggestions.produtoOferta ? [{ label: 'Produto / Oferta', value: suggestions.produtoOferta }] : []),
                ...(suggestions.tipoOferta ? [{ label: 'Tipo de oferta', value: suggestions.tipoOferta }] : []),
                ...(suggestions.sinalVendaPercebido ? [{ label: 'Sinal de venda', value: suggestions.sinalVendaPercebido }] : []),
                ...(suggestions.pontoPositivo ? [{ label: 'Ponto positivo', value: suggestions.pontoPositivo }] : []),
              ]
              return (
                <div className="rounded-lg border border-brand-accent/30 bg-brand-accent/5 p-3 space-y-2">
                  <p className="text-[10px] text-brand-accent/70 uppercase tracking-wide font-medium flex items-center gap-1">
                    <span>Sugestões encontradas</span>
                  </p>
                  <div className="space-y-1">
                    {itens.map((item) => (
                      <p key={item.label} className="text-[11px] text-brand-platinum/60 leading-relaxed">
                        <span className="text-brand-platinum/40">{item.label}: </span>
                        {item.value}
                      </p>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (suggestions.nicho) update('niche', suggestions.nicho)
                        if (suggestions.produtoOferta) update('offerName', suggestions.produtoOferta)
                        if (suggestions.tipoOferta) update('offerType', suggestions.tipoOferta as any)
                        if (suggestions.sinalVendaPercebido) update('salesSignal', suggestions.sinalVendaPercebido)
                        if (suggestions.pontoPositivo) update('positivePoint', suggestions.pontoPositivo)
                        setIgnoreSuggestions(true)
                      }}
                      className="flex-1 rounded-lg bg-brand-accent/20 px-3 py-1.5 text-[11px] font-medium text-brand-accent transition-colors hover:bg-brand-accent/30"
                    >
                      Aplicar sugestões
                    </button>
                    <button
                      onClick={() => setIgnoreSuggestions(true)}
                      className="flex-1 rounded-lg border border-brand-deep-hover px-3 py-1.5 text-[11px] text-brand-platinum/40 transition-colors hover:text-brand-platinum/60"
                    >
                      Ignorar
                    </button>
                  </div>
                </div>
              )
            })()}

            <Field label="Nicho">
              <input
                className={INPUT_CLASS}
                value={lead.niche}
                onChange={(e) => update('niche', e.target.value)}
                placeholder="Ex.: Nutrição, Marketing, Psicologia"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Produto / Oferta">
                <input
                  className={INPUT_CLASS}
                  value={lead.offerName}
                  onChange={(e) => update('offerName', e.target.value)}
                  placeholder="Ex.: Mentoria X"
                />
              </Field>
              <Field label="Tipo de oferta">
                <select
                  className={INPUT_CLASS}
                  value={lead.offerType}
                  onChange={(e) => update('offerType', e.target.value as CapturedLead['offerType'])}
                >
                  {OFFER_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Seguidores">
                <input
                  className={INPUT_CLASS}
                  value={lead.followers}
                  onChange={(e) => update('followers', e.target.value)}
                  placeholder="Ex.: 15000"
                />
              </Field>
              <Field label="Link da bio / oferta">
                <input
                  className={INPUT_CLASS}
                  value={lead.bioLink}
                  onChange={(e) => update('bioLink', e.target.value)}
                  placeholder="URL da página"
                />
              </Field>
            </div>

            <p className="text-[10px] text-brand-platinum/40 uppercase tracking-wide font-medium pt-2">
              Percepções
            </p>

            <Field label="Sinal de venda percebido">
              <textarea
                className={`${INPUT_CLASS} min-h-16 resize-y`}
                value={lead.salesSignal}
                onChange={(e) => update('salesSignal', e.target.value)}
                placeholder="Link na bio, Stories de vendas, depoimentos..."
                rows={2}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Problema visual percebido">
                <textarea
                  className={`${INPUT_CLASS} min-h-16 resize-y`}
                  value={lead.visualProblem}
                  onChange={(e) => update('visualProblem', e.target.value)}
                  placeholder="O que está fraco visualmente?"
                  rows={2}
                />
              </Field>
              <Field label="Ponto positivo do perfil">
                <textarea
                  className={`${INPUT_CLASS} min-h-16 resize-y`}
                  value={lead.positivePoint}
                  onChange={(e) => update('positivePoint', e.target.value)}
                  placeholder="O que já funciona bem?"
                  rows={2}
                />
              </Field>
            </div>

            <Field label="Oportunidade visual">
              <textarea
                className={`${INPUT_CLASS} min-h-16 resize-y`}
                value={lead.visualOpportunity}
                onChange={(e) => update('visualOpportunity', e.target.value)}
                placeholder="O que você poderia fazer por ele?"
                rows={2}
              />
            </Field>

            <Field label="Observações">
              <textarea
                className={`${INPUT_CLASS} min-h-20 resize-y`}
                value={lead.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Anotações adicionais"
                rows={3}
              />
            </Field>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            <p className="text-[10px] text-brand-platinum/40 uppercase tracking-wide font-medium">
              Critérios de qualificação (0–2 cada)
            </p>

            {(Object.keys(CRITERIA_LABELS) as (keyof QualificationCriteria)[]).map((key) => (
              <div key={key} className="space-y-1.5">
                <span className={LABEL_CLASS}>{CRITERIA_LABELS[key]}</span>
                <div className="flex gap-2">
                  {([
                    { value: 0 as ScoreValue, label: 'Não atende' },
                    { value: 1 as ScoreValue, label: 'Atende parcialmente' },
                    { value: 2 as ScoreValue, label: 'Atende totalmente' },
                  ]).map(({ value: v, label }) => {
                    const current = lead.qualification?.criteria[key] ?? 0
                    const active = current === v
                    return (
                      <button
                        key={v}
                        onClick={() => {
                          const criteria = {
                            ...(lead.qualification?.criteria ?? emptyCriteria()),
                            [key]: v,
                          }
                          const score = calcularNota(criteria)
                          const priority = definirPrioridade(score)
                          update('qualification', { score, priority, criteria })
                        }}
                        className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                          active
                            ? 'border-brand-primary bg-brand-primary/15 text-brand-primary'
                            : 'border-brand-deep-hover bg-brand-base text-brand-platinum/40 hover:border-brand-platinum/20 hover:text-brand-platinum/60'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {lead.qualification && (
              <div className="mt-4 rounded-lg border border-brand-deep-hover bg-brand-base p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-brand-platinum/40 uppercase tracking-wide block mb-0.5">Nota final</span>
                  <span className="text-xl font-bold text-brand-primary">{lead.qualification.score}/10</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-brand-platinum/40 uppercase tracking-wide block mb-0.5">Prioridade</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    lead.qualification.priority === 'prioridade_maxima'
                      ? 'bg-brand-primary/20 text-brand-primary'
                      : lead.qualification.priority === 'alta'
                        ? 'bg-brand-accent/20 text-brand-accent'
                        : lead.qualification.priority === 'media'
                          ? 'bg-brand-platinum/10 text-brand-platinum/60'
                          : 'bg-brand-platinum/5 text-brand-platinum/30'
                  }`}>
                    {PRIORITY_LABELS[lead.qualification.priority]}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`flex-shrink-0 px-4 py-2 border-b border-brand-deep-hover ${
          toast.type === 'success' ? 'bg-brand-success/10' :
          toast.type === 'warning' ? 'bg-brand-accent/10' :
          'bg-brand-danger/10'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <p className={`text-xs ${
              toast.type === 'success' ? 'text-brand-success/90' :
              toast.type === 'warning' ? 'text-brand-accent/90' :
              'text-brand-danger/90'
            }`}>
              {toast.message}
            </p>
            <button onClick={() => setToast(null)} className="shrink-0 mt-0.5">
              <X className="size-3 opacity-60 hover:opacity-100" />
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex-shrink-0 border-t border-brand-deep-hover bg-brand-base px-4 py-3">
        <div className="mb-2 flex items-center justify-between min-h-4">
          {saved && (
            <span className="flex items-center gap-1 text-[10px] text-brand-success/60">
              <Check className="size-3" /> Rascunho salvo
            </span>
          )}
          {copied && (
            <span className="flex items-center gap-1 text-[10px] text-brand-accent/60">
              <Check className="size-3" /> Lead copiado. Agora você pode colar no ProspectOS.
            </span>
          )}
        </div>

        {showSettings && (
          <div className="mb-3 space-y-3 rounded-lg border border-brand-deep-hover bg-brand-deep p-3">
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>URL do Supabase</label>
              <input
                className={INPUT_CLASS}
                value={supabaseUrl}
                onChange={async (e) => {
                  setSupabaseUrl(e.target.value)
                  await saveSupabaseUrl(e.target.value)
                }}
                placeholder="https://seu-projeto.supabase.co"
              />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Chave anônima do Supabase</label>
              <input
                className={INPUT_CLASS}
                type="password"
                value={supabaseAnonKey}
                onChange={async (e) => {
                  setSupabaseAnonKey(e.target.value)
                  await saveSupabaseAnonKey(e.target.value)
                }}
                placeholder="eyJhbGciOi..."
              />
              <p className="text-[10px] text-brand-platinum/30">
                Disponível em <span className="underline">Supabase Dashboard → Settings → API</span>. Chave pública e segura para uso no cliente.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>URL base do ProspectOS</label>
              <input
                className={INPUT_CLASS}
                value={baseUrl}
                onChange={(e) => handleBaseUrlChange(e.target.value)}
                placeholder="https://seu-prospectos.vercel.app"
              />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>Chave da API Gemini (opcional)</label>
              <input
                className={INPUT_CLASS}
                type="password"
                value={geminiKey}
                onChange={async (e) => {
                  setGeminiKey(e.target.value)
                  await saveGeminiKey(e.target.value)
                }}
                placeholder="AIzaSy..."
              />
              <p className="text-[10px] text-brand-platinum/30">
                Disponível em <span className="underline">aistudio.google.com/apikey</span>. Usada para análise textual mais precisa.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg border border-brand-primary/40 px-3 py-2 text-xs text-brand-primary transition-colors hover:border-brand-primary hover:bg-brand-primary/10"
          >
            <Save className="size-3.5" /> Salvar rascunho
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg border border-brand-deep-hover px-3 py-2 text-xs text-brand-platinum/40 transition-colors hover:border-brand-danger/40 hover:text-brand-danger"
          >
            <Eraser className="size-3.5" /> Limpar
          </button>
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 rounded-lg border border-brand-deep-hover px-3 py-2 text-xs text-brand-platinum/60 transition-colors hover:border-brand-platinum/20 hover:text-brand-platinum"
          >
            <Copy className="size-3.5" /> Copiar JSON
          </button>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className="flex items-center gap-1.5 rounded-lg border border-brand-deep-hover px-3 py-2 text-xs text-brand-platinum/40 transition-colors hover:border-brand-platinum/20 hover:text-brand-platinum/60"
          >
            <Settings className="size-3.5" />
          </button>
        </div>

        <div className="mt-2 flex gap-2">
          {savedLeadInfo ? (
            <>
              <button
                onClick={() => {
                  handleClear()
                  setSavedLeadInfo(null)
                }}
                className="flex items-center gap-1.5 rounded-lg border border-brand-deep-hover px-3 py-2 text-xs text-brand-platinum/50 transition-colors hover:border-brand-primary/40 hover:text-brand-primary"
              >
                <Eraser className="size-3.5" /> Limpar formulário
              </button>
              <button
                onClick={() => setSavedLeadInfo(null)}
                className="flex items-center gap-1.5 rounded-lg border border-brand-deep-hover px-3 py-2 text-xs text-brand-platinum/50 transition-colors hover:border-brand-platinum/20 hover:text-brand-platinum/70"
              >
                <Check className="size-3.5" /> Manter dados
              </button>
              {(savedLeadInfo.instagramUrl || savedLeadInfo.linkPerfil) && (
                <a
                  href={savedLeadInfo.instagramUrl || `https://instagram.com/${savedLeadInfo.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-brand-deep-hover px-3 py-2 text-xs text-brand-platinum/50 transition-colors hover:border-brand-accent/40 hover:text-brand-accent"
                >
                  <Camera className="size-3.5" /> Perfil
                </a>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleSendToProspectOS}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-primary/90"
              >
                <Send className="size-3.5" /> Enviar para ProspectOS
              </button>
              <button
                onClick={handleOpenProspectOS}
                className="flex items-center gap-1.5 rounded-lg border border-brand-deep-hover px-3 py-2 text-xs text-brand-platinum/40 transition-colors hover:border-brand-platinum/20 hover:text-brand-platinum/60"
              >
                <ExternalLink className="size-3.5" /> Abrir
              </button>
            </>
          )}
        </div>
      </div>

      {confirmReplace && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full rounded-xl border border-brand-deep-hover bg-brand-base p-4 space-y-3">
            <p className="text-sm text-brand-platinum">
              Substituir dados atuais pelos dados capturados?
            </p>
            <p className="text-xs text-brand-platinum/40">
              <span className="font-medium text-brand-platinum/60">{confirmReplace.handle}</span>
              {' '}— {confirmReplace.url}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={async () => {
                  await applyCapture(confirmReplace.handle, confirmReplace.url, confirmReplace.profileData)
                }}
                className="flex-1 rounded-lg bg-brand-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-primary/90"
              >
                Substituir
              </button>
              <button
                onClick={() => setConfirmReplace(null)}
                className="flex-1 rounded-lg border border-brand-deep-hover px-3 py-2 text-xs text-brand-platinum/50 transition-colors hover:text-brand-platinum"
              >
                Manter atual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className={LABEL_CLASS}>
        {label}
        {required && <span className="text-brand-primary/60 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
