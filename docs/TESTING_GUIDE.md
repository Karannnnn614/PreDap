# 🧪 PreDAP Testing Guide

## Table of Contents

- [Quick Start](#quick-start)
- [Component Testing](#component-testing)
- [Test Scenarios](#test-scenarios)
- [Troubleshooting](#troubleshooting)
- [Performance Testing](#performance-testing)

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Chrome/Edge Browser
- Google Gemini API Key ([Get it here](https://aistudio.google.com/app/apikey))

### Installation Time: ~10 minutes

---

## 1️⃣ Backend API Setup

### Step 1: Install Dependencies

```powershell
# Navigate to API server
cd api_server

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Mac/Linux

# Install packages
pip install -r requirements.txt
```

### Step 2: Configure Environment

```powershell
# Create .env file
echo GEMINI_API_KEY=your_api_key_here > .env
```

### Step 3: Start Server

```powershell
# Start the FastAPI server
python -m uvicorn server:app --reload

# Server will run at: http://127.0.0.1:8000
```

### ✅ Test Backend

Open browser and visit:

- API Docs: http://127.0.0.1:8000/docs
- Health Check: http://127.0.0.1:8000

**Expected Response:**

```json
{
  "message": "UI Navigation Assistant API is running",
  "version": "1.0.0"
}
```

---

## 2️⃣ Browser Extension Setup

### Step 1: Load Extension

1. Open Chrome/Edge browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the `extension` folder from the project

### ✅ Verify Installation

- Extension icon should appear in the toolbar
- Click the icon to see the popup interface
- No errors in the browser console

---

## 3️⃣ Frontend (Onboarding Page) Setup

### Step 1: Install Dependencies

```powershell
cd "PreDAP Onboarding Page"
npm install
```

### Step 2: Start Development Server

```powershell
npm run dev

# Server will run at: http://localhost:8080
```

### ✅ Test Frontend

- Page loads without errors
- All sections are visible
- Animations work smoothly

---

## 🎯 Component Testing

### A. API Endpoint Testing

#### Test 1: Analyze UI Endpoint

```bash
# Using curl
curl -X POST http://127.0.0.1:8000/analyze_ui \
  -H "Content-Type: application/json" \
  -d '{
    "task_description": "Find the login button",
    "image_base64": "base64_encoded_screenshot",
    "ui_elements": []
  }'
```

**Expected Response:**

```json
{
  "isComplete": false,
  "message": "Click the login button",
  "action": "click",
  "id": "login-btn",
  "text": "Login"
}
```

#### Test 2: Reset Task Endpoint

```bash
curl -X POST http://127.0.0.1:8000/reset_task
```

**Expected Response:**

```json
{
  "status": "Task context reset successfully"
}
```

### B. Extension Testing

#### Test Scenario 1: Basic Navigation

1. **Navigate to:** https://www.canva.com
2. **Click** extension icon
3. **Enter query:** "I want to create a poster"
4. **Click** "Send Query"

**Expected Behavior:**

- ✅ Toast notification appears
- ✅ Element is highlighted on page
- ✅ Instruction overlay shows next step
- ✅ No console errors

#### Test Scenario 2: Multi-Step Task

1. **Navigate to:** https://mail.google.com
2. **Query:** "Compose and send an email to test@example.com"
3. **Follow** step-by-step instructions

**Expected Behavior:**

- ✅ Each step highlights the correct element
- ✅ Progress is tracked through multiple actions
- ✅ Completion toast shows when done

#### Test Scenario 3: Error Handling

1. **Navigate to:** chrome://extensions/
2. **Try** to use the extension

**Expected Behavior:**

- ⚠️ Warning toast: "Cannot use extension on restricted pages"
- ✅ No crashes or errors

### C. Frontend Testing

#### Visual Testing Checklist

- [ ] Hero section loads correctly
- [ ] Feature cards display properly
- [ ] Demo video is visible
- [ ] Animations are smooth (60fps)
- [ ] Responsive on mobile/tablet/desktop
- [ ] All links work correctly

#### Interactive Testing

1. **Click** "Get Started" button
2. **Scroll** through sections
3. **Hover** over feature cards
4. **Test** video player controls

---

## 🧪 Test Scenarios

### Scenario 1: E-commerce Shopping

**Website:** Amazon/eBay  
**Task:** "Add iPhone 15 to cart"

**Steps:**

1. Extension highlights search bar
2. User types "iPhone 15"
3. Extension highlights search button
4. Extension highlights product
5. Extension highlights "Add to Cart"

**Success Criteria:**

- ✅ All elements correctly identified
- ✅ Instructions are clear
- ✅ Task completes successfully

---

### Scenario 2: Social Media Interaction

**Website:** Twitter/X  
**Task:** "Create a new tweet"

**Steps:**

1. Extension highlights "Post" button
2. Extension highlights text area
3. Extension guides through posting

**Success Criteria:**

- ✅ Handles dynamic content
- ✅ Works with JavaScript-heavy sites
- ✅ No timing issues

---

### Scenario 3: Form Filling

**Website:** Any form-based site  
**Task:** "Fill contact form"

**Steps:**

1. Extension identifies form fields
2. Guides through each field sequentially
3. Highlights submit button

**Success Criteria:**

- ✅ Correct tab order
- ✅ All fields identified
- ✅ Validation errors handled

---

## 🐛 Troubleshooting

### Issue: Extension Not Working

**Symptoms:**

- No response when clicking "Send Query"
- "Extension not ready" error

**Solutions:**

1. Check if API server is running (`http://127.0.0.1:8000`)
2. Reload the extension (`chrome://extensions/`)
3. Refresh the webpage
4. Check browser console for errors (`F12`)

---

### Issue: API Timeout

**Symptoms:**

- Long wait times
- "Request failed" errors

**Solutions:**

1. Check internet connection
2. Verify Gemini API key is valid
3. Check API server logs
4. Reduce screenshot quality in settings

---

### Issue: Element Not Found

**Symptoms:**

- "Could not find element" toast
- Wrong element highlighted

**Solutions:**

1. Wait for page to fully load
2. Ensure elements are visible (scroll if needed)
3. Try more specific queries
4. Check if element has dynamic IDs

---

### Issue: CORS Errors

**Symptoms:**

- Console shows CORS policy errors
- API requests fail

**Solutions:**

1. Ensure API server has CORS enabled
2. Check `server.py` has correct origins
3. Use `http://127.0.0.1:8000` not `localhost:8000`

---

## 📊 Performance Testing

### Load Testing

```python
# testing/load_test.py
import asyncio
import aiohttp
import time

async def test_api_load():
    url = "http://127.0.0.1:8000/analyze_ui"
    async with aiohttp.ClientSession() as session:
        tasks = []
        for i in range(100):  # 100 concurrent requests
            task = session.post(url, json={
                "task_description": f"Test {i}",
                "image_base64": "test",
                "ui_elements": []
            })
            tasks.append(task)

        start = time.time()
        responses = await asyncio.gather(*tasks)
        end = time.time()

        print(f"100 requests completed in {end-start:.2f} seconds")
        print(f"Average: {(end-start)/100:.3f}s per request")

asyncio.run(test_api_load())
```

### Expected Performance

- API Response Time: < 2 seconds
- Extension Response: < 100ms
- Frontend Load Time: < 1 second
- Memory Usage: < 100MB

---

## 🎓 Testing Best Practices

### Do's ✅

- Test on multiple browsers (Chrome, Edge, Brave)
- Test with different screen sizes
- Test on slow internet connections
- Test with various websites
- Clear cache between tests

### Don'ts ❌

- Don't test on chrome:// URLs
- Don't use expired API keys
- Don't skip error scenarios
- Don't test without logging
- Don't ignore console warnings

---

## 📝 Test Report Template

```markdown
## Test Report - [Date]

### Environment

- OS: Windows 11 / macOS / Linux
- Browser: Chrome 120.0
- API Server: Running ✅
- Extension Version: 1.0.0

### Tests Performed

| Test Case        | Status  | Notes                   |
| ---------------- | ------- | ----------------------- |
| API Health Check | ✅ Pass | Response time: 45ms     |
| Extension Load   | ✅ Pass | No errors               |
| Basic Navigation | ✅ Pass | Canva.com test          |
| Multi-step Task  | ✅ Pass | Gmail compose           |
| Error Handling   | ✅ Pass | Restricted page warning |

### Issues Found

1. **Minor:** Tooltip positioning on mobile
2. **Fixed:** CORS error on localhost

### Performance

- Average API response: 1.2s
- Extension load time: 85ms
- Memory usage: 78MB

### Recommendations

- Add loading indicators
- Improve error messages
- Add keyboard shortcuts
```

---

## 🆘 Support & Resources

- **Documentation:** [README.md](../README.md)
- **Installation Guide:** [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- **API Reference:** http://127.0.0.1:8000/docs
- **Demo Video:** [Watch Here](https://drive.google.com/file/d/1x1LMtvn8sO6P1KZ815QMuBJ5rGNb2WMz/view)

---

## ✅ Testing Checklist

### Before Demo

- [ ] API server is running
- [ ] Extension is loaded
- [ ] Test websites are accessible
- [ ] API key is valid
- [ ] Browser console is clear
- [ ] Screenshots are working

### During Demo

- [ ] Show basic navigation
- [ ] Demonstrate multi-step tasks
- [ ] Show error handling
- [ ] Highlight toast notifications
- [ ] Display element highlighting
- [ ] Show completion feedback

### After Demo

- [ ] Collect feedback
- [ ] Note any bugs
- [ ] Document edge cases
- [ ] Plan improvements

---

**Ready to Test!** 🚀

For any issues or questions, check the troubleshooting section or refer to the installation guide.
