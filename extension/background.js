let activeTab = null
let startTime = null

// Save session and immediately restart timer for same tab
function sendSession() {
  if (!activeTab || !startTime) return

  const duration = Math.round((Date.now() - startTime) / 1000)
  
  // Only save if they spent more than 2 seconds
  // avoids saving accidental quick tab switches
  if (duration < 2) {
    startTime = Date.now() // reset timer but stay on same tab
    return
  }

  fetch("http://localhost:8000/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: activeTab,
      duration_seconds: duration,
      timestamp: new Date().toISOString()
    })
  })

  // Reset start time to NOW so next interval
  // counts from this moment, not from original start
  startTime = Date.now()
}

// This runs every 30 seconds no matter what
// even if user never switches tabs
setInterval(() => {
  sendSession()
}, 30000)

// This runs when user switches to a different tab
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  sendSession() // save previous tab session first

  const tab = await chrome.tabs.get(tabId)
  activeTab = tab.url
  startTime = Date.now()
})

// This runs when user switches to a different tab within same window
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    sendSession()
    activeTab = tab.url
    startTime = Date.now()
  }
})

// This runs when user leaves Chrome entirely
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    sendSession()
    // Don't reset activeTab here because user might come back
  }
})