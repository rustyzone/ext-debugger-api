// Background service worker for Browser Controller extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("Browser Controller extension installed");

  // Enable the side panel for all tabs
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener((tab) => {
  // Open the side panel
  chrome.sidePanel.open({ tabId: tab.id });
});

// Handle debugger detach events
chrome.debugger.onDetach.addListener((source, reason) => {
  console.log("Debugger detached from tab", source.tabId, "Reason:", reason);

  // Notify if debugger was detached unexpectedly
  if (reason === "target_closed") {
    console.log("Tab was closed while debugger was attached");
  } else if (reason === "canceled_by_user") {
    console.log("User canceled debugger attachment");
  }
});

// Handle tab updates to maintain debugger state awareness
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    console.log("Tab loaded:", tab.url);
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log("Tab removed:", tabId);
});

// Handle messages from content scripts or side panel (if needed)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTabInfo") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] });
    });
    return true; // Keep message channel open for async response
  }
});

// Log debugger events for debugging purposes
chrome.debugger.onEvent.addListener((source, method, params) => {
  console.log("Debugger event:", method, "from tab", source.tabId);

  // Log interesting events
  switch (method) {
    case "Page.loadEventFired":
      console.log("Page load completed for tab", source.tabId);
      break;
    case "Runtime.consoleAPICalled":
      console.log("Console API called:", params);
      break;
    case "Runtime.exceptionThrown":
      console.log("JavaScript exception:", params.exceptionDetails);
      break;
  }
});
