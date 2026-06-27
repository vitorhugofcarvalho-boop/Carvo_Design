import type { CapturedLead } from '@/types'

const KEY = 'prospectos_draft'

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
