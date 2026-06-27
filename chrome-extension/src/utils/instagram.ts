interface InstagramProfileResult {
  isValid: boolean
  username: string | null
  handle: string | null
  profileUrl: string | null
  error?: string
}

const BLOCKED_PATHS = ['/p/', '/reel/', '/stories/', '/explore/', '/direct/', '/accounts/']

export function parseInstagramProfileUrl(input: string): InstagramProfileResult {
  if (!input || typeof input !== 'string') {
    return { isValid: false, username: null, handle: null, profileUrl: null, error: 'URL vazia.' }
  }

  let url: URL
  try {
    const normalized = input.startsWith('http') ? input : `https://${input}`
    url = new URL(normalized)
  } catch {
    return { isValid: false, username: null, handle: null, profileUrl: null, error: 'URL inválida.' }
  }

  const host = url.hostname.replace('www.', '')
  if (host !== 'instagram.com') {
    return { isValid: false, username: null, handle: null, profileUrl: null, error: 'Não é um link do Instagram.' }
  }

  if (BLOCKED_PATHS.some((p) => url.pathname.includes(p))) {
    return { isValid: false, username: null, handle: null, profileUrl: null, error: 'Essa página não parece ser um perfil. Abra o perfil do lead no Instagram e tente novamente.' }
  }

  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length === 0 || segments[0].startsWith('@')) {
    return { isValid: false, username: null, handle: null, profileUrl: null, error: 'Essa página não parece ser um perfil. Abra o perfil do lead no Instagram e tente novamente.' }
  }

  const username = segments[0].replace(/^@/, '')
  if (!username || /[^a-zA-Z0-9._]/.test(username)) {
    return { isValid: false, username: null, handle: null, profileUrl: null, error: 'Não foi possível extrair o username.' }
  }

  return {
    isValid: true,
    username,
    handle: `@${username}`,
    profileUrl: `https://www.instagram.com/${username}/`,
  }
}
