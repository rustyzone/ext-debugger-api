let currentTab = null;
let debuggerAttached = false;

// Get current tab on sidepanel open
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  currentTab = tabs[0];
  updateStatus(`Ready - Current tab: ${currentTab.title}`);
  updateTabInfo();
  // Initialize button states
  updateButtonStates();
});

// Update tab info display
function updateTabInfo() {
  if (!currentTab) return;
  
  const tabTitle = document.getElementById("tabTitle");
  const tabInfo = document.getElementById("tabInfo");
  
  if (tabTitle && tabInfo) {
    tabTitle.textContent = currentTab.title || 'Untitled Tab';
    tabInfo.title = `${currentTab.title}\n${currentTab.url}`;
    
    // Update icon based on tab state
    const iconSpan = tabInfo.querySelector('.tab-icon');
    if (iconSpan) {
      if (currentTab.url.startsWith('https://')) {
        iconSpan.textContent = '🔒';
      } else if (currentTab.url.startsWith('http://')) {
        iconSpan.textContent = '🌐';
      } else if (currentTab.url.startsWith('chrome://')) {
        iconSpan.textContent = '⚙️';
      } else {
        iconSpan.textContent = '📑';
      }
    }
  }
}

// Status update function with styling
function updateStatus(message, type = "info") {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = message;

  // Remove existing status classes
  statusDiv.classList.remove("status-connected", "status-error");

  // Add appropriate class
  if (type === "success") {
    statusDiv.classList.add("status-connected");
  } else if (type === "error") {
    statusDiv.classList.add("status-error");
  }
}

// Update button states based on debugger attachment
function updateButtonStates() {
  const attachBtn = document.getElementById("attachDebugger");
  const detachBtn = document.getElementById("detachDebugger");
  
  // Get all other controls that should be disabled when debugger is not attached
  const urlInput = document.getElementById("urlInput");
  const navigateBtn = document.getElementById("navigate");
  const screenshotBtn = document.getElementById("screenshot");
  const getTitleBtn = document.getElementById("getTitle");
  const getContentBtn = document.getElementById("getContent");
  const executeScriptBtn = document.getElementById("executeScript");
  const getConsoleBtn = document.getElementById("getConsoleLog");
  
  if (debuggerAttached) {
    // Debugger is attached - enable all controls
    attachBtn.disabled = true;
    detachBtn.disabled = false;
    
    // Enable all other controls
    urlInput.disabled = false;
    navigateBtn.disabled = false;
    screenshotBtn.disabled = false;
    getTitleBtn.disabled = false;
    getContentBtn.disabled = false;
    executeScriptBtn.disabled = false;
    getConsoleBtn.disabled = false;
  } else {
    // Debugger is not attached - only enable attach button
    attachBtn.disabled = false;
    detachBtn.disabled = true;
    
    // Disable all other controls
    urlInput.disabled = true;
    navigateBtn.disabled = true;
    screenshotBtn.disabled = true;
    getTitleBtn.disabled = true;
    getContentBtn.disabled = true;
    executeScriptBtn.disabled = true;
    getConsoleBtn.disabled = true;
  }
}

// Attach debugger
document
  .getElementById("attachDebugger")
  .addEventListener("click", async () => {
    if (!currentTab) {
      updateStatus("No active tab found", "error");
      return;
    }

    try {
      await chrome.debugger.attach({ tabId: currentTab.id }, "1.3");
      await chrome.debugger.sendCommand(
        { tabId: currentTab.id },
        "Runtime.enable"
      );
      await chrome.debugger.sendCommand(
        { tabId: currentTab.id },
        "Page.enable"
      );
      await chrome.debugger.sendCommand(
        { tabId: currentTab.id },
        "Console.enable"
      );
      debuggerAttached = true;
      updateStatus("✅ Debugger attached successfully", "success");
      updateButtonStates();
    } catch (error) {
      updateStatus(`❌ Error attaching debugger: ${error.message}`, "error");
    }
  });

// Detach debugger
document
  .getElementById("detachDebugger")
  .addEventListener("click", async () => {
    if (!currentTab) {
      updateStatus("No active tab found", "error");
      return;
    }

    try {
      await chrome.debugger.detach({ tabId: currentTab.id });
      debuggerAttached = false;
      updateStatus("Debugger detached");
      updateButtonStates();
    } catch (error) {
      updateStatus(`❌ Error detaching debugger: ${error.message}`, "error");
    }
  });

// Navigate to URL
document.getElementById("navigate").addEventListener("click", async () => {
  const url = document.getElementById("urlInput").value.trim();
  if (!url) {
    updateStatus("Please enter a URL", "error");
    return;
  }
  if (!debuggerAttached) {
    updateStatus("Please attach debugger first", "error");
    return;
  }

  try {
    // Add protocol if missing
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    await chrome.debugger.sendCommand(
      { tabId: currentTab.id },
      "Page.navigate",
      { url: fullUrl }
    );
    updateStatus(`🌐 Navigating to ${fullUrl}...`);
  } catch (error) {
    updateStatus(`❌ Navigation error: ${error.message}`, "error");
  }
});

// Take screenshot
document.getElementById("screenshot").addEventListener("click", async () => {
  if (!debuggerAttached) {
    updateStatus("Please attach debugger first", "error");
    return;
  }

  try {
    const result = await chrome.debugger.sendCommand(
      { tabId: currentTab.id },
      "Page.captureScreenshot",
      { format: "png", quality: 90 }
    );

    // Create download link
    const link = document.createElement("a");
    link.href = "data:image/png;base64," + result.data;
    link.download = `screenshot-${Date.now()}.png`;
    link.click();

    updateStatus("📸 Screenshot saved successfully", "success");
  } catch (error) {
    updateStatus(`❌ Screenshot error: ${error.message}`, "error");
  }
});

// Get page title
document.getElementById("getTitle").addEventListener("click", async () => {
  if (!debuggerAttached) {
    updateStatus("Please attach debugger first", "error");
    return;
  }

  try {
    const result = await chrome.debugger.sendCommand(
      { tabId: currentTab.id },
      "Runtime.evaluate",
      { expression: "document.title" }
    );

    updateStatus(`📄 Page Title: "${result.result.value}"`, "success");
  } catch (error) {
    updateStatus(`❌ Error getting title: ${error.message}`, "error");
  }
});

// Get page content
document.getElementById("getContent").addEventListener("click", async () => {
  if (!debuggerAttached) {
    updateStatus("Please attach debugger first", "error");
    return;
  }

  try {
    const result = await chrome.debugger.sendCommand(
      { tabId: currentTab.id },
      "Runtime.evaluate",
      { expression: "document.body.innerText.substring(0, 100)" }
    );

    updateStatus(
      `📝 Page content preview: "${result.result.value}..."`,
      "success"
    );
  } catch (error) {
    updateStatus(`❌ Error getting content: ${error.message}`, "error");
  }
});

// Execute custom script
document.getElementById("executeScript").addEventListener("click", async () => {
  if (!debuggerAttached) {
    updateStatus("Please attach debugger first", "error");
    return;
  }

  const script = prompt(
    "Enter JavaScript code to execute:",
    'alert("Hello from debugger!");'
  );
  if (!script) return;

  try {
    const result = await chrome.debugger.sendCommand(
      { tabId: currentTab.id },
      "Runtime.evaluate",
      { expression: script }
    );

    updateStatus(
      `⚡ Script executed. Result: ${JSON.stringify(result.result.value)}`,
      "success"
    );
  } catch (error) {
    updateStatus(`❌ Script error: ${error.message}`, "error");
  }
});

// Get console logs
document.getElementById("getConsoleLog").addEventListener("click", async () => {
  if (!debuggerAttached) {
    updateStatus("Please attach debugger first", "error");
    return;
  }

  try {
    // Execute a script to get recent console messages
    const result = await chrome.debugger.sendCommand(
      { tabId: currentTab.id },
      "Runtime.evaluate",
      {
        expression:
          'console.log("Debugger API test message"); "Console check completed"',
      }
    );

    updateStatus(
      "📋 Console log test executed - check browser console",
      "success"
    );
  } catch (error) {
    updateStatus(`❌ Console error: ${error.message}`, "error");
  }
});

// Handle debugger events
chrome.debugger.onEvent.addListener((source, method, params) => {
  if (source.tabId === currentTab?.id) {
    switch (method) {
      case "Page.loadEventFired":
        updateStatus("✅ Page loaded successfully", "success");
        // Update tab info when page loads
        chrome.tabs.get(currentTab.id, (tab) => {
          currentTab = tab;
          updateTabInfo();
        });
        break;
      case "Page.frameNavigated":
        if (params.frame.parentId === undefined) {
          // Main frame navigation
          updateStatus(`🌐 Navigated to: ${params.frame.url}`);
          // Update tab info when navigating
          chrome.tabs.get(currentTab.id, (tab) => {
            currentTab = tab;
            updateTabInfo();
          });
        }
        break;
      case "Console.messageAdded":
        console.log("Console message:", params.message);
        break;
    }
  }
});

// Update current tab when tab changes - keep debugger attached but switch to new tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const previousTab = currentTab;
  
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    currentTab = tab;
    updateStatus(`Tab changed to: ${tab.title}`);
    updateTabInfo();
    
    // If debugger was attached to previous tab, try to attach to new tab
    if (debuggerAttached && previousTab && previousTab.id !== tab.id) {
      try {
        // Detach from previous tab first
        await chrome.debugger.detach({ tabId: previousTab.id });
        
        // Attach to new tab
        await chrome.debugger.attach({ tabId: currentTab.id }, "1.3");
        await chrome.debugger.sendCommand(
          { tabId: currentTab.id },
          "Runtime.enable"
        );
        await chrome.debugger.sendCommand(
          { tabId: currentTab.id },
          "Page.enable"
        );
        await chrome.debugger.sendCommand(
          { tabId: currentTab.id },
          "Console.enable"
        );
        
        updateStatus(`✅ Debugger switched to new tab: ${tab.title}`, "success");
      } catch (error) {
        // If attaching to new tab fails, mark debugger as detached
        debuggerAttached = false;
        updateButtonStates();
        updateStatus(`❌ Failed to switch debugger to new tab: ${error.message}`, "error");
      }
    }
  });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentTab?.id && changeInfo.status === "complete") {
    currentTab = tab; // Update tab info
    updateStatus(`✅ Tab updated: ${tab.title}`);
    updateTabInfo();
  }
});
