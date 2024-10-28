console.info('contentScript is running')
// Fetch the blocked sites from storage
function normalizeDomain(url: string) {
  // Remove protocol (http:// or https://) and www prefix
  return url.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase()
}

function isBlockedSite(currentUrl: string, blockedSites: { site: string }[]) {
  const normalizedCurrentUrl = normalizeDomain(currentUrl)
  return blockedSites.some(({ site }) => normalizedCurrentUrl === normalizeDomain(site))
}

// Fetch the blocked sites from storage
chrome.storage.local.get('blockedSites', (result) => {
  const blockedSites = JSON.parse(result.blockedSites || []) as { site: string }[]
  const currentUrl = window.location.hostname

  console.log('Current URL:', currentUrl)
  console.log('Blocked sites:', blockedSites)

  //   If the current URL is in the blocked sites list, send a message to the background script
  if (isBlockedSite(currentUrl, blockedSites)) {
    console.log('Site is blocked. Sending message to background script.')
    chrome.runtime.sendMessage({ action: 'blockSite' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError.message)
      } else {
        console.log('Message sent to background:', response)
      }
    })
  } else {
    console.log('Site is not blocked.')
  }
})
// chrome.runtime.sendMessage({ action: 'blockSite' }, (response) => {
//   if (chrome.runtime.lastError) {
//     console.error('Error sending message:', chrome.runtime.lastError.message)
//   } else {
//     console.log('Message sent to background:', response)
//   }
// })
