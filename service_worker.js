// Job Tracker v1 - MV3 service worker
chrome.runtime.onInstalled.addListener(async () => {
  // open side panel when clicking extension icon
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch (e) {
    // ignore
  }
});

// Message router
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg?.type === "GET_ACTIVE_TAB_CONTEXT") {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        let draft = null;
        if (tab?.id) {
          draft = await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_JOB" }).catch(() => null);
        }
        sendResponse({ ok: true, tab, draft });
        return;
      }

      if (msg?.type === "OPEN_SIDE_PANEL") {
        const tabId = msg?.tabId || sender?.tab?.id;
        if (typeof tabId === "number") {
          await chrome.sidePanel.open({ tabId });
        }
        sendResponse({ ok: true });
        return;
      }

      sendResponse({ ok: false, error: "unknown_message" });
    } catch (e) {
      sendResponse({ ok: false, error: String(e) });
    }
  })();
  return true;
});