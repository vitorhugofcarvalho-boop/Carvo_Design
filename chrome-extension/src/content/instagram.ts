interface InstagramProfileData {
  nome: string
  perfilInstagram: string
  linkPerfil: string
  seguidores: string
  linkOferta: string
  observacoes: string
}

function extractProfileData(): InstagramProfileData {
  const url = window.location.href
  const username = extractUsername(url)
  
  if (!username) {
    return {
      nome: '',
      perfilInstagram: '',
      linkPerfil: '',
      seguidores: '',
      linkOferta: '',
      observacoes: '',
    }
  }

  const nome = extractName()
  const seguidores = extractFollowers()
  const linkOferta = extractBioLink()
  const observacoes = extractBioText()

  return {
    nome,
    perfilInstagram: `@${username}`,
    linkPerfil: `https://www.instagram.com/${username}/`,
    seguidores,
    linkOferta,
    observacoes,
  }
}

function extractUsername(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const host = urlObj.hostname.replace('www.', '')
    
    if (host !== 'instagram.com') {
      return null
    }

    const blockedPaths = ['/p/', '/reel/', '/stories/', '/explore/', '/direct/', '/accounts/']
    if (blockedPaths.some(p => urlObj.pathname.includes(p))) {
      return null
    }

    const segments = urlObj.pathname.split('/').filter(Boolean)
    if (segments.length === 0 || segments[0].startsWith('@')) {
      return null
    }

    const username = segments[0].replace(/^@/, '')
    if (!username || /[^a-zA-Z0-9._]/.test(username)) {
      return null
    }

    return username
  } catch {
    return null
  }
}

function extractName(): string {
  // Try meta og:title first
  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
  if (ogTitle) {
    // og:title often contains "Name (@username) • Instagram photos and videos"
    const match = ogTitle.match(/^(.+?)\s*\(@/i)
    if (match) {
      return match[1].trim()
    }
    // If no @username pattern, try to extract just the name part
    const instagramMatch = ogTitle.match(/^(.+?)\s*•\s*Instagram/i)
    if (instagramMatch) {
      return instagramMatch[1].trim()
    }
  }

  // Try document.title as fallback
  const title = document.title
  if (title) {
    const match = title.match(/^(.+?)\s*\(@/i)
    if (match) {
      return match[1].trim()
    }
    const instagramMatch = title.match(/^(.+?)\s*•\s*Instagram/i)
    if (instagramMatch) {
      return instagramMatch[1].trim()
    }
  }

  // Try to find the display name in the page
  const headerSection = document.querySelector('header') || document.querySelector('section')
  if (headerSection) {
    const nameElement = headerSection.querySelector('h1, h2, [class*="name"], [class*="title"]')
    if (nameElement) {
      return nameElement.textContent?.trim() || ''
    }
  }

  return ''
}

function extractFollowers(): string {
  // Try meta description first (often contains follower count)
  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
  
  // Look for patterns like "1,234 Followers" or "1.234 seguidores"
  const followerPatterns = [
    /(\d[\d.,]*)\s*Followers/i,
    /(\d[\d.,]*)\s*seguidores/i,
    /(\d[\d.,]*)\s*followers/i,
  ]

  for (const pattern of followerPatterns) {
    const match = metaDesc.match(pattern)
    if (match) {
      return match[1].replace(/\./g, ',')
    }
  }

  // Try to find followers in the page content
  const allText = document.body.innerText
  for (const pattern of followerPatterns) {
    const match = allText.match(pattern)
    if (match) {
      return match[1].replace(/\./g, ',')
    }
  }

  return ''
}

function extractBioLink(): string {
  // Look for links in the bio section
  const bioSection = document.querySelector('section') || document.querySelector('header')
  if (!bioSection) return ''

  // Look for external links (not Instagram internal links)
  const links = bioSection.querySelectorAll('a[href]')
  for (const link of links) {
    const href = link.getAttribute('href') || ''
    if (href && !href.includes('instagram.com') && !href.startsWith('#') && !href.startsWith('/')) {
      return href
    }
  }

  // Try meta og:url as fallback
  const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content')
  if (ogUrl && !ogUrl.includes('instagram.com')) {
    return ogUrl
  }

  return ''
}

function extractBioText(): string {
  // Try meta description first
  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content')
  if (metaDesc) {
    return metaDesc
  }

  // Try og:description
  const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content')
  if (ogDesc) {
    return ogDesc
  }

  // Try to find bio text in the page
  const bioSection = document.querySelector('section') || document.querySelector('header')
  if (bioSection) {
    // Look for text that seems like a bio
    const textElements = bioSection.querySelectorAll('span, div, p')
    for (const el of textElements) {
      const text = el.textContent?.trim() || ''
      if (text.length > 10 && text.length < 500 && !text.includes('Followers') && !text.includes('seguidores')) {
        return text
      }
    }
  }

  return ''
}

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractProfileData') {
    const data = extractProfileData()
    sendResponse(data)
  }
  return true
})