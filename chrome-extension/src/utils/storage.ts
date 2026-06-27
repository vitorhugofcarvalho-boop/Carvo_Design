import type { CapturedLead } from '@/types'

const KEY = 'prospectos_draft'
const BASE_URL_KEY = 'prospectos_base_url'
export const DEFAULT_BASE_URL = 'https://prospectos.vercel.app'

export async function saveDraft(data: Partial<CapturedLead>): Promise<void> {
  await chrome.storage.local.set({ [KEY]: data })
}

export async function loadDraft(): Promise<Partial<CapturedLead> | null> {
  const result = await chrome.storage.local.get(KEY)
  return (result[KEY] as Partial<CapturedLead>) ?? null
}

export async function clearDraft(): Promise<void> {
  await chrome.storage.local.remove(KEY)
}

export async function saveBaseUrl(url: string): Promise<void> {
  await chrome.storage.local.set({ [BASE_URL_KEY]: url })
}

export async function loadBaseUrl(): Promise<string> {
  const result = await chrome.storage.local.get(BASE_URL_KEY)
  return (result[BASE_URL_KEY] as string) ?? DEFAULT_BASE_URL
}

const GEMINI_KEY = 'prospectos_gemini_key'

export async function saveGeminiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [GEMINI_KEY]: key })
}

export async function loadGeminiKey(): Promise<string> {
  const result = await chrome.storage.local.get(GEMINI_KEY)
  return (result[GEMINI_KEY] as string) ?? ''
}

const SUPABASE_URL_KEY = 'prospectos_supabase_url'
const SUPABASE_ANON_KEY = 'prospectos_supabase_anon_key'

export async function saveSupabaseUrl(url: string): Promise<void> {
  await chrome.storage.local.set({ [SUPABASE_URL_KEY]: url })
}

export async function loadSupabaseUrl(): Promise<string> {
  const result = await chrome.storage.local.get(SUPABASE_URL_KEY)
  return (result[SUPABASE_URL_KEY] as string) ?? ''
}

export async function saveSupabaseAnonKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [SUPABASE_ANON_KEY]: key })
}

export async function loadSupabaseAnonKey(): Promise<string> {
  const result = await chrome.storage.local.get(SUPABASE_ANON_KEY)
  return (result[SUPABASE_ANON_KEY] as string) ?? ''
}
