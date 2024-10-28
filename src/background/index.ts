let blockedSites: {
  site: string
}[] = []

// Fetch the list of blocked sites from a remote source
const fetchBlockedSites = async () => {
  try {
    const response = await fetch(
      'https://cdn.jsdelivr.net/gh/awaken-nepali/12-bhai-blocker@main/data/sites.json',
    )
    const data = await response.json()
    blockedSites = data //data.sites
    chrome.storage.local.set({ blockedSites: JSON.stringify(blockedSites) })
    console.log('Blocked sites updated:', blockedSites)
    console.log('Blocked sites updated2:', blockedSites)
  } catch (error) {
    console.error('Failed to fetch blocked sites:', error)
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background script:', message)
  console.log('Sender:', sender)

  if (message.action === 'blockSite' && sender.tab?.id) {
    console.log('Blocking site and closing tab:', sender.tab.id)

    // Close the current tab and open a new one with block.html
    chrome.tabs.remove(sender.tab.id, () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL('block.html'),
      })
    })

    sendResponse({ status: 'Tab closed and new tab opened' })
  }
})

// Periodically update the blocked sites list
chrome.alarms.create('updateBlockedSites', { periodInMinutes: 60 })
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateBlockedSites') {
    fetchBlockedSites()
  }
})

// Initialize by fetching the blocked sites when the extension is installed/activated
chrome.runtime.onInstalled.addListener(fetchBlockedSites)
chrome.runtime.onStartup.addListener(fetchBlockedSites)
