chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_INSTAGRAM_PROFILE') {
    const url = message.url
    if (!url || (!url.startsWith('https://instagram.com/') && !url.startsWith('https://www.instagram.com/'))) {
      sendResponse({ ok: false })
      return true
    }

    ;(async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
        if (tab?.id) {
          await chrome.tabs.update(tab.id, { url })
        } else {
          const [anyTab] = await chrome.tabs.query({})
          if (anyTab?.id) {
            await chrome.tabs.update(anyTab.id, { url })
          } else {
            await chrome.tabs.create({ url })
          }
        }
        sendResponse({ ok: true })
      } catch {
        try {
          await chrome.tabs.create({ url })
          sendResponse({ ok: true })
        } catch {
          sendResponse({ ok: false })
        }
      }
    })()

    return true
  }
})
