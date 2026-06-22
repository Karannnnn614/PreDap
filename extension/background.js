// Shared message-action constants — single source of truth for action names.
// Mirrored in content.js (ACTIONS) so both sides agree on the wire protocol.
const ACTIONS = {
  CAPTURE_SCREENSHOT: "captureScreenshot",
  LOG_MESSAGE: "logMessage",
  START_QUERY: "startQuery",
};

// Debug gate: when false, suppress verbose/diagnostic logging so page content
// and full response bodies are never written to the console by default.
const DEBUG = false;

function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

function debugWarn(...args) {
  if (DEBUG) console.warn(...args);
}

function isRestrictedUrl(url) {
  return (
    typeof url === "string" &&
    (url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("edge://"))
  );
}

// Inject a plain alert into a page (valid in page context, unlike the SW context
// where `alert` is undefined and throws a ReferenceError).
function alertInTab(tabId, text) {
  chrome.scripting
    .executeScript({
      target: { tabId },
      func: (msg) => alert(msg),
      args: [text],
    })
    .catch(() => {
      /* best-effort: ignore if injection is not possible */
    });
}

function handleCaptureScreenshot(message, sender, sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      console.error("No active tab found.");
      sendResponse({ screenshot: "" });
      return;
    }

    const tab = tabs[0];

    if (isRestrictedUrl(tab.url)) {
      debugWarn("Cannot capture screenshot on restricted pages:", tab.url);
      sendResponse({
        screenshot: "",
        error: "Cannot capture screenshot on this page",
      });
      return;
    }

    chrome.tabs.captureVisibleTab(null, { format: "png" }, (screenshotUrl) => {
      if (chrome.runtime.lastError || !screenshotUrl) {
        console.error(
          "Screenshot error:",
          chrome.runtime.lastError?.message || "Unknown error"
        );
        sendResponse({ screenshot: "" });
        return;
      }
      sendResponse({ screenshot: screenshotUrl });
    });
  });

  return true; // Keep message channel open for async response
}

function handleLogMessage(message) {
  debugLog("[Content Script]", message.message);
  return false;
}

function handleStartQuery(message, sender, sendResponse) {
  debugLog("Background received query:", message.query);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      console.error("No active tab found.");
      sendResponse({ status: "Error", message: "No active tab found" });
      return;
    }

    const tab = tabs[0];

    if (isRestrictedUrl(tab.url)) {
      // BUGFIX: `alert()` is undefined in an MV3 service worker and throws a
      // ReferenceError. Report the error via sendResponse (popup can surface it)
      // and best-effort inject an alert into the page instead.
      if (typeof tab.id === "number") {
        alertInTab(
          tab.id,
          "Cannot run on this page. Please navigate to a regular website first."
        );
      }
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
          // Valid here: this runs in the page context, where `alert` exists.
          alert("Extension not ready. Please refresh the page and try again.");
        }
      },
      args: [message.query],
    });

    sendResponse({ status: "Query started" });
  });

  return true; // Keep message channel open for async response
}

// Pure router: maps an incoming message to its handler and returns the handler's
// value (true => async, keep channel open; false => sync, channel closes).
// Exported for unit testing; the runtime listener below delegates to it.
function routeMessage(message, sender, sendResponse) {
  if (!message || typeof message.action !== "string") {
    return false;
  }

  switch (message.action) {
    case ACTIONS.CAPTURE_SCREENSHOT:
      return handleCaptureScreenshot(message, sender, sendResponse);
    case ACTIONS.LOG_MESSAGE:
      return handleLogMessage(message, sender, sendResponse);
    case ACTIONS.START_QUERY:
      return handleStartQuery(message, sender, sendResponse);
    default:
      return false;
  }
}

// Register the listener only in the extension runtime (skip under test/Node).
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>
    routeMessage(message, sender, sendResponse)
  );
}

// Test-friendly export (no-op in the browser/service-worker context).
if (typeof module !== "undefined" && module.exports) {
  module.exports = { routeMessage, ACTIONS, isRestrictedUrl };
}
