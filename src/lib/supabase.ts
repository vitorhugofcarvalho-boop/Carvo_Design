import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[ProspectOS] Supabase credentials not found. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env ' +
    'or Vercel environment variables.'
  )
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isOnline = () => supabase !== null && navigator.onLine
