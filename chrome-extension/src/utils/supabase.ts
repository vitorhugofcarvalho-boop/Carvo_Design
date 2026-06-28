import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return _getSupabaseClient(url, anonKey)
}

export async function getSession(url: string, anonKey: string): Promise<Session | null> {
  if (!url || !anonKey) return null
  const supabase = _getSupabaseClient(url, anonKey)
  const { data } = await supabase.auth.getSession()
  return data.session
}

function _getSupabaseClient(url: string, anonKey: string): SupabaseClient {
  if (!client || client.supabaseUrl !== url || client.supabaseKey !== anonKey) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'prospectos-capture-auth',
      },
    })
  }
  return client
}

export function clearClient(): void {
  client = null
}

export async function signIn(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<{ ok: true; session: Session } | { ok: false; erro: string }> {
  const supabase = getSupabaseClient(url, anonKey)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { ok: false, erro: error.message }
  }
  return { ok: true, session: data.session }
}

export async function signOut(url: string, anonKey: string): Promise<void> {
  const supabase = getSupabaseClient(url, anonKey)
  await supabase.auth.signOut()
  clearClient()
}

export async function restoreSession(url: string, anonKey: string): Promise<Session | null> {
  if (!url || !anonKey) return null
  const supabase = getSupabaseClient(url, anonKey)
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) return null
  return data.session
}

export async function checkDuplicate(
  url: string,
  anonKey: string,
  perfilInstagram: string,
  linkPerfil: string,
): Promise<{ exists: boolean; existingId?: string }> {
  if (!url || !anonKey) return { exists: false }
  const supabase = getSupabaseClient(url, anonKey)
  const filters: string[] = []
  if (perfilInstagram) filters.push(`perfil_instagram.eq.${perfilInstagram}`)
  if (linkPerfil) filters.push(`link_perfil.eq.${linkPerfil}`)
  if (filters.length === 0) return { exists: false }

  const { data, error } = await supabase
    .from('leads')
    .select('id')
    .or(filters.join(','))
    .maybeSingle()

  if (error || !data) return { exists: false }
  return { exists: true, existingId: data.id as string }
}

export async function saveLead(
  url: string,
  anonKey: string,
  data: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  if (!url || !anonKey) {
    return { ok: false, erro: 'Supabase não configurado. Configure nas settings.' }
  }
  const supabase = getSupabaseClient(url, anonKey)
  const { error } = await supabase.from('leads').upsert(data, { onConflict: 'id' })

  if (error) {
    return { ok: false, erro: error.message }
  }
  return { ok: true }
}
