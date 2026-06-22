document.getElementById("upload-pdf").addEventListener("click", () => {
  document.getElementById("pdf-input").click(); // Trigger file input
});

document.getElementById("pdf-input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    // alert is valid here: user-manual.html runs in an extension *page* context
    // (not a service worker), so the DOM `alert` API is available.
    alert(`Selected file: ${file.name}`);
    // Add logic to handle the uploaded PDF file
  }
});
