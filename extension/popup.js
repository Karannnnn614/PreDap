// Message-action constants — must match background.js / content.js.
const ACTIONS = {
  START_QUERY: "startQuery",
};

// Open the bundled user manual in a new tab. Opening an extension page as a
// top-level tab uses chrome.runtime.getURL and does NOT require the page to be
// listed in web_accessible_resources.
document.getElementById("user-manual").addEventListener("click", () => {
  chrome.tabs
    .create({ url: chrome.runtime.getURL("user-manual.html") })
    .catch((error) => {
      console.error("Failed to open user manual:", error);
    });
});

document.getElementById("send-query").addEventListener("click", async () => {
  const query = document.getElementById("query-input").value;
  if (query.trim() === "") {
    alert("Please enter a query.");
    return;
  }

  // Send query to background or content script.
  try {
    await chrome.runtime.sendMessage({ action: ACTIONS.START_QUERY, query });
  } catch (error) {
    console.error("Failed to send query:", error);
    alert("Could not start the query. Please try again.");
    return;
  }

  // Close the popup immediately.
  window.close();
});
