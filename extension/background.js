chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle screenshot capture
  if (message.action === "captureScreenshot") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        console.error("No active tab found.");
        sendResponse({ screenshot: "" });
        return;
      }

      const tab = tabs[0];

      // Check if tab URL is restricted
      if (
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://") ||
        tab.url.startsWith("edge://")
      ) {
        console.warn("Cannot capture screenshot on restricted pages:", tab.url);
        sendResponse({
          screenshot: "",
          error: "Cannot capture screenshot on this page",
        });
        return;
      }

      chrome.tabs.captureVisibleTab(
        null,
        { format: "png" },
        (screenshotUrl) => {
          if (chrome.runtime.lastError || !screenshotUrl) {
            console.error(
              "Screenshot error:",
              chrome.runtime.lastError?.message || "Unknown error"
            );
            sendResponse({ screenshot: "" });
            return;
          }
          sendResponse({ screenshot: screenshotUrl });
        }
      );
    });
    return true; // Keep message channel open for async response
  }

  // Handle log messages
  if (message.action === "logMessage") {
    console.log("[Content Script]", message.message);
    return false;
  }

  // Handle query start
  if (message.action === "startQuery") {
    console.log("Background received query:", message.query);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        console.error("No active tab found.");
        sendResponse({ status: "Error", message: "No active tab found" });
        return;
      }

      const tab = tabs[0];

      // Check if tab URL is restricted
      if (
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://") ||
        tab.url.startsWith("edge://")
      ) {
        alert(
          "Cannot run on this page. Please navigate to a regular website first."
        );
        sendResponse({
          status: "Error",
          message: "Cannot access restricted pages",
        });
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (query) => {
          if (window.callApi) {
            window.callApi(query);
          } else {
            alert(
              "Extension not ready. Please refresh the page and try again."
            );
          }
        },
        args: [message.query],
      });

      sendResponse({ status: "Query started" });
    });

    return true;
  }
});
