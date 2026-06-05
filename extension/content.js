const API_URL = "http://127.0.0.1:8000/analyze_ui";

// Expose callApi globally so background.js can call it
window.callApi = callApi;

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = "predap-toast";

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  const colors = {
    success: { bg: "#10B981", border: "#059669" },
    error: { bg: "#EF4444", border: "#DC2626" },
    info: { bg: "#3B82F6", border: "#2563EB" },
    warning: { bg: "#F59E0B", border: "#D97706" },
  };

  const config = colors[type] || colors.info;
  const icon = icons[type] || icons.info;

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      ">${icon}</div>
      <div style="flex: 1; line-height: 1.4;">${message}</div>
    </div>
  `;

  Object.assign(toast.style, {
    position: "fixed",
    top: "24px",
    right: "24px",
    backgroundColor: config.bg,
    color: "#fff",
    padding: "16px 20px",
    borderRadius: "12px",
    borderLeft: `4px solid ${config.border}`,
    boxShadow: "0 10px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
    fontSize: "15px",
    fontWeight: "500",
    zIndex: "2147483647",
    minWidth: "320px",
    maxWidth: "420px",
    animation: "predapSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backdropFilter: "blur(10px)",
  });

  // Add animation styles if not already present
  if (!document.getElementById("predap-toast-styles")) {
    const style = document.createElement("style");
    style.id = "predap-toast-styles";
    style.textContent = `
      @keyframes predapSlideIn {
        from {
          transform: translateX(450px) scale(0.9);
          opacity: 0;
        }
        to {
          transform: translateX(0) scale(1);
          opacity: 1;
        }
      }
      @keyframes predapSlideOut {
        from {
          transform: translateX(0) scale(1);
          opacity: 1;
        }
        to {
          transform: translateX(450px) scale(0.95);
          opacity: 0;
        }
      }
      .predap-toast:hover {
        transform: translateY(-2px);
        transition: transform 0.2s ease;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "predapSlideOut 0.3s cubic-bezier(0.4, 0, 1, 1)";
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

async function callApi(query) {
  try {
    let isFinished = false;
    sendLogToBackground(`Starting API call with query: ${query}`);

    while (!isFinished) {
      // Capture screenshot
      const screenshot = await captureScreenshot();

      // Get interactive elements
      const uiElements = getInteractiveElements();

      sendLogToBackground(
        `Sending request with ${uiElements.length} UI elements`
      );

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_description: query,
          image_base64: screenshot,
          ui_elements: uiElements,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}`);
      }

      const data = await response.json();
      sendLogToBackground(`Response: ${JSON.stringify(data)}`);

      // Find matching element
      const matchingElement = findMatchingElement(data);
      sendLogToBackground(
        `Matching element: ${matchingElement ? "Found" : "null"}`
      );

      if (matchingElement) {
        await showPrompt(data, matchingElement);

        // Wait until popup is closed
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            const popup = document.querySelector(".custom-popup");
            if (!popup) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      } else {
        sendLogToBackground("No matching element found, showing toast");
        showToast(
          data.message || "Could not find the element on the page.",
          "warning"
        );
      }

      isFinished = data.isComplete;

      if (!isFinished) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    sendLogToBackground("Task completed successfully!");
    showToast("✓ Task completed successfully!", "success");
  } catch (error) {
    sendLogToBackground(`Error occurred: ${error.message}`);
    showToast(`Error: ${error.message}`, "error");
  }
}

function captureScreenshot() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "captureScreenshot" }, (response) => {
      resolve(response.screenshot || "");
    });
  });
}

function getInteractiveElements() {
  const elements = [];
  const selectors =
    'button, a, input, select, textarea, [role="button"], [onclick]';

  document.querySelectorAll(selectors).forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      elements.push({
        id: el.id || null,
        class_name: el.className || null,
        text:
          el.innerText?.trim().substring(0, 100) ||
          el.value ||
          el.placeholder ||
          null,
        tagName: el.tagName.toLowerCase(),
        location: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
      });
    }
  });

  return elements;
}

function findMatchingElement(response) {
  sendLogToBackground(
    `Searching for element with: id=${response.id}, class=${response.class_name}, text=${response.text}`
  );

  if (!response.id && !response.class_name && !response.text) {
    sendLogToBackground("No search criteria provided");
    return null;
  }

  // Try by ID first
  if (response.id) {
    const element = document.getElementById(response.id);
    if (element && document.body.contains(element)) {
      sendLogToBackground(`Found element by ID: ${response.id}`);
      return element;
    }
  }

  // Try by class name - look for exact match or partial match
  if (response.class_name) {
    // Try exact class match
    let elements = document.getElementsByClassName(response.class_name);
    if (elements.length > 0) {
      sendLogToBackground(
        `Found element by exact class: ${response.class_name}`
      );
      return elements[0];
    }

    // Try partial class match
    const classNames = response.class_name.split(" ").filter((c) => c.trim());
    for (const className of classNames) {
      elements = document.getElementsByClassName(className);
      if (elements.length > 0) {
        sendLogToBackground(`Found element by partial class: ${className}`);
        return elements[0];
      }
    }
  }

  // Try by text content
  if (response.text) {
    const allElements = document.querySelectorAll(
      'button, a, input, [role="button"], [onclick]'
    );
    const searchText = response.text.toLowerCase().trim();

    for (const el of allElements) {
      const text = (
        el.innerText?.trim() ||
        el.value ||
        el.placeholder ||
        el.getAttribute("aria-label") ||
        ""
      ).toLowerCase();
      if (text && text.includes(searchText)) {
        sendLogToBackground(`Found element by text: ${response.text}`);
        return el;
      }
    }

    // Try fuzzy match
    for (const el of allElements) {
      const text = (
        el.innerText?.trim() ||
        el.value ||
        el.placeholder ||
        el.getAttribute("aria-label") ||
        ""
      ).toLowerCase();
      const words = searchText.split(" ");
      if (text && words.every((word) => text.includes(word))) {
        sendLogToBackground(
          `Found element by fuzzy text match: ${response.text}`
        );
        return el;
      }
    }
  }

  sendLogToBackground("No matching element found");
  return null;
}

function sendLogToBackground(message) {
  chrome.runtime.sendMessage({ action: "logMessage", message });
}

async function showPrompt(response, target) {
  if (!target || !document.body.contains(target)) {
    showToast(response.message || "Element not found.", "warning");
    return;
  }

  try {
    // Highlight the target element
    const originalOutline = target.style.outline;
    target.style.outline = "3px solid #FF5722";
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    // Wait for scroll to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Check if element is still in DOM
    if (!document.body.contains(target)) {
      showToast(
        response.message || "Element is no longer available.",
        "warning"
      );
      return;
    }

    const popup = document.createElement("div");
    popup.className = "custom-popup";
    popup.textContent = response.message;
    Object.assign(popup.style, {
      position: "absolute",
      backgroundColor: "rgba(255, 87, 34, 0.9)",
      border: "2px solid #FF5722",
      color: "#fff",
      padding: "15px 30px",
      borderRadius: "12px",
      boxShadow: "0 8px 12px rgba(0, 0, 0, 0.4)",
      fontSize: "18px",
      fontWeight: "bold",
      textAlign: "center",
      zIndex: "10000",
      maxWidth: "300px",
    });

    const rect = target.getBoundingClientRect();
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.bottom + window.scrollY + 15}px`;

    const arrow = document.createElement("div");
    Object.assign(arrow.style, {
      position: "absolute",
      width: "0",
      height: "0",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderBottom: "10px solid rgba(255, 87, 34, 0.9)",
      top: "-10px",
      left: "calc(50% - 10px)",
    });

    popup.appendChild(arrow);
    document.body.appendChild(popup);

    const removePopup = () => {
      if (popup.parentNode) {
        popup.remove();
      }
      if (document.body.contains(target)) {
        target.style.outline = originalOutline;
      }
    };

    target.addEventListener(response.action || "click", removePopup, {
      once: true,
    });

    // Auto-remove after 10 seconds
    setTimeout(removePopup, 10000);
  } catch (error) {
    sendLogToBackground(`Error in showPrompt: ${error.message}`);
    showToast(response.message || "Error showing prompt.", "error");
  }
}
