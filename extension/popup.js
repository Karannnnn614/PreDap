document.getElementById('send-query').addEventListener('click',async () => {
    const query = document.getElementById('query-input').value;
    if (query.trim() === '') {
        alert('Please enter a query.');
        return;
    }

    // Send query to background or content script
    await chrome.runtime.sendMessage({ action: 'startQuery', query });

    // Close the popup immediately
    window.close();
});
