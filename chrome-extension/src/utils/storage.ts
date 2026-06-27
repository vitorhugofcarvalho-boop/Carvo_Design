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
