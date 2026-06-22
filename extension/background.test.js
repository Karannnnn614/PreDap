import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// background.js guards its chrome.runtime listener registration behind a
// `typeof chrome !== "undefined"` check, then exports the pure router via
// module.exports. Provide a minimal chrome mock BEFORE requiring it so the
// guarded listener registration also exercises (and we can assert on it).
function makeChromeMock() {
  return {
    runtime: {
      lastError: null,
      onMessage: { addListener: vi.fn() },
    },
    tabs: {
      query: vi.fn(),
      captureVisibleTab: vi.fn(),
    },
    scripting: {
      executeScript: vi.fn(() => Promise.resolve()),
    },
  };
}

let routeMessage;
let ACTIONS;
let isRestrictedUrl;

beforeEach(() => {
  vi.resetModules();
  globalThis.chrome = makeChromeMock();
  // CommonJS require so module.exports is picked up.
  const mod = require("./background.js");
  routeMessage = mod.routeMessage;
  ACTIONS = mod.ACTIONS;
  isRestrictedUrl = mod.isRestrictedUrl;
});

afterEach(() => {
  delete globalThis.chrome;
  vi.restoreAllMocks();
});

describe("routeMessage", () => {
  it("registers a single onMessage listener at import time", () => {
    expect(globalThis.chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
  });

  it("returns false for logMessage (synchronous, closes channel)", () => {
    const sendResponse = vi.fn();
    const result = routeMessage(
      { action: ACTIONS.LOG_MESSAGE, message: "hi" },
      {},
      sendResponse
    );
    expect(result).toBe(false);
  });

  it("returns true for captureScreenshot (keeps channel open)", () => {
    // tabs.query never invokes its callback here; we only assert the sync return.
    const result = routeMessage(
      { action: ACTIONS.CAPTURE_SCREENSHOT },
      {},
      vi.fn()
    );
    expect(result).toBe(true);
    expect(globalThis.chrome.tabs.query).toHaveBeenCalledTimes(1);
  });

  it("returns true for startQuery (keeps channel open)", () => {
    const result = routeMessage(
      { action: ACTIONS.START_QUERY, query: "click login" },
      {},
      vi.fn()
    );
    expect(result).toBe(true);
    expect(globalThis.chrome.tabs.query).toHaveBeenCalledTimes(1);
  });

  it("returns false for unknown actions", () => {
    expect(routeMessage({ action: "nope" }, {}, vi.fn())).toBe(false);
  });

  it("returns false for malformed messages", () => {
    expect(routeMessage(undefined, {}, vi.fn())).toBe(false);
    expect(routeMessage({}, {}, vi.fn())).toBe(false);
  });

  it("captureScreenshot resolves screenshot:'' when no active tab", () => {
    const sendResponse = vi.fn();
    // Make tabs.query immediately call back with no tabs.
    globalThis.chrome.tabs.query.mockImplementation((q, cb) => cb([]));
    routeMessage({ action: ACTIONS.CAPTURE_SCREENSHOT }, {}, sendResponse);
    expect(sendResponse).toHaveBeenCalledTimes(1);
    expect(sendResponse).toHaveBeenCalledWith({ screenshot: "" });
  });

  it("startQuery reports an error (sendResponse) on restricted pages", () => {
    const sendResponse = vi.fn();
    globalThis.chrome.tabs.query.mockImplementation((q, cb) =>
      cb([{ id: 5, url: "chrome://settings" }])
    );
    routeMessage(
      { action: ACTIONS.START_QUERY, query: "x" },
      {},
      sendResponse
    );
    // Did NOT throw (no SW-context alert), reported the error exactly once, and
    // never tried to executeScript the page logic on a restricted page.
    expect(sendResponse).toHaveBeenCalledTimes(1);
    expect(sendResponse).toHaveBeenCalledWith({
      status: "Error",
      message: "Cannot access restricted pages",
    });
    // The only executeScript call (if any) is the best-effort page alert.
    const execCalls = globalThis.chrome.scripting.executeScript.mock.calls;
    for (const [arg] of execCalls) {
      expect(arg.target.tabId).toBe(5);
    }
  });

  it("startQuery executes page script on a normal page", () => {
    const sendResponse = vi.fn();
    globalThis.chrome.tabs.query.mockImplementation((q, cb) =>
      cb([{ id: 9, url: "https://example.com" }])
    );
    routeMessage(
      { action: ACTIONS.START_QUERY, query: "click login" },
      {},
      sendResponse
    );
    expect(globalThis.chrome.scripting.executeScript).toHaveBeenCalledTimes(1);
    expect(sendResponse).toHaveBeenCalledTimes(1);
    expect(sendResponse).toHaveBeenCalledWith({
      status: "Query started",
    });
  });
});

describe("isRestrictedUrl", () => {
  it("flags chrome/edge/extension schemes", () => {
    expect(isRestrictedUrl("chrome://settings")).toBe(true);
    expect(isRestrictedUrl("edge://flags")).toBe(true);
    expect(isRestrictedUrl("chrome-extension://abc/page.html")).toBe(true);
  });
  it("allows normal pages and tolerates non-strings", () => {
    expect(isRestrictedUrl("https://example.com")).toBe(false);
    expect(isRestrictedUrl(undefined)).toBe(false);
  });
});
