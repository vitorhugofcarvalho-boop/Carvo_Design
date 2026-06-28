export function isEmbedded(): boolean {
  return new URLSearchParams(location.search).get('embedded') === 'extension'
}

export function openInstagramInTab(url: string): void {
  if (!url) return
  if (isEmbedded()) {
    window.parent.postMessage(
      { source: 'prospectos', type: 'OPEN_INSTAGRAM_PROFILE', url },
      '*',
    )
  } else {
    window.open(url, '_blank', 'noopener')
  }
}
