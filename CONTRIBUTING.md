# Contributing to Parallel•

Thank you for your interest in contributing to Parallel! This document provides guidelines for contributing to the project.

## 🎯 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Submit code improvements
- 🌐 Add translations
- 🎨 Improve UI/UX

---

## 🚀 Getting Started

### **1. Fork the Repository**
Click the "Fork" button on the [GitHub repository](https://github.com/jmy744/Parallel---AI-Writing-Assistant)

### **2. Clone Your Fork**
```bash
git clone https://github.com/YOUR-USERNAME/Parallel---AI-Writing-Assistant.git
cd Parallel---AI-Writing-Assistant
```

### **3. Create a Branch**
```bash
git checkout -b feature/your-feature-name
```

### **4. Make Your Changes**
- Edit files in your local repository
- Test thoroughly in Chrome Canary

### **5. Commit Your Changes**
```bash
git add .
git commit -m "Add: clear description of changes"
```

### **6. Push to Your Fork**
```bash
git push origin feature/your-feature-name
```

### **7. Open a Pull Request**
- Go to the original repository
- Click "New Pull Request"
- Select your fork and branch
- Provide a clear description of changes

---

## 📋 Pull Request Guidelines

### **Before Submitting**

- [ ] Code follows the project style
- [ ] All tests pass
- [ ] No console errors
- [ ] CSP compliant (no inline scripts)
- [ ] Works in Chrome Canary 128+
- [ ] Tested at multiple zoom levels
- [ ] Documentation updated (if needed)

### **PR Description Should Include**

- What changes were made
- Why the changes were made
- How to test the changes
- Screenshots (if UI changes)
- Related issues (if any)

### **Example PR Description**
```markdown
## Changes
- Added dark mode theme support
- Updated editor.css with dark mode variables
- Added theme toggle button in header

## Why
Users requested a dark mode for reduced eye strain during night writing

## Testing
1. Open editor
2. Click theme toggle button in header
3. Verify dark theme applies correctly
4. Check that all UI elements are visible

## Screenshots
[Attach screenshots]

## Related Issues
Closes #123
```

---

## 🎨 Code Style Guidelines

### **JavaScript**

```javascript
// ✅ Good
async function captureSource(url) {
  try {
    const content = await extractContent(url);
    return { success: true, content };
  } catch (error) {
    console.error('Capture failed:', error);
    return { success: false, error: error.message };
  }
}

// ❌ Bad
async function captureSource(url){
  var content = await extractContent(url)
  return content
}
```

**Rules:**
- Use ES6+ features (async/await, arrow functions)
- Clear, descriptive variable names
- Comment complex logic
- Handle errors gracefully
- No inline scripts (CSP compliance)

### **CSS**

```css
/* ✅ Good */
.button-primary {
  background: var(--purple);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.15s;
}

/* ❌ Bad */
.btn{background:#8b5cf6;color:#fff;padding:12px 24px}
```

**Rules:**
- Use CSS variables for colors
- Readable formatting
- Descriptive class names
- Group related properties

### **HTML**

```html
<!-- ✅ Good -->
<button 
  id="captureBtn" 
  class="btn btn-primary"
  aria-label="Capture this page"
>
  Capture This Page
</button>

<!-- ❌ Bad -->
<button onclick="capture()">Capture</button>
```

**Rules:**
- Semantic HTML
- Accessibility attributes
- No inline event handlers
- Clear structure

---

## 🧪 Testing Guidelines

### **Required Tests**

Before submitting a PR, test:

1. **Chrome Compatibility**
   - Chrome Canary 128+
   - With all AI flags enabled

2. **Zoom Levels**
   - 75%
   - 90%
   - 100%
   - 110%
   - 125%

3. **Offline Functionality**
   - Disconnect internet
   - Test all features
   - Reconnect and verify

4. **Different Websites**
   - Wikipedia
   - News sites
   - Blogs
   - Academic papers

5. **Edge Cases**
   - Empty inputs
   - Very long text
   - Special characters
   - Multiple languages

### **Test Checklist**

```markdown
- [ ] Feature works in Chrome Canary 128+
- [ ] No console errors
- [ ] Works at 75% zoom
- [ ] Works at 125% zoom
- [ ] Works offline
- [ ] Handles empty inputs
- [ ] Handles long text (10,000+ words)
- [ ] CSP compliant
- [ ] No memory leaks
- [ ] Performance acceptable (<100ms response)
```

---

## 🐛 Bug Reports

### **Before Reporting**

1. Check [existing issues](https://github.com/jmy744/Parallel---AI-Writing-Assistant/issues)
2. Update Chrome Canary to latest version
3. Verify all AI flags are enabled
4. Clear cache and restart Chrome

### **Bug Report Template**

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Open editor
2. Click "Generate Content"
3. Set word goal to 100
4. Bug occurs

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Chrome Version: Canary 128.0.6545.0
- OS: Windows 11 / macOS 14 / Linux
- Extension Version: 1.0.0
- AI APIs Available: [list]

## Screenshots
[Attach screenshots]

## Console Errors
[Paste console errors from F12]

## Additional Context
Any other relevant information
```

---

## 💡 Feature Requests

### **Feature Request Template**

```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why is this feature needed? Who will benefit?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other approaches were considered?

## Additional Context
Mockups, examples, references
```

### **Feature Discussion**

Before implementing major features:
1. Open a GitHub Discussion
2. Get feedback from maintainers
3. Wait for approval
4. Then submit PR

---

## 📝 Documentation

### **When to Update Docs**

Update documentation when:
- Adding new features
- Changing existing features
- Fixing bugs that affect usage
- Adding configuration options

### **Documentation Files**

- `README.md` - Main documentation
- `CONTRIBUTING.md` - This file
- Code comments - Explain complex logic
- JSDoc comments - For functions

### **Example JSDoc**

```javascript
/**
 * Captures webpage content and creates a source
 * @param {string} url - The URL to capture
 * @param {string} title - Page title
 * @param {string} content - Main page content
 * @returns {Promise<Object>} Source object with summary
 */
async function createSource(url, title, content) {
  // Implementation
}
```

---

## 🌐 Translations

### **Adding a New Language**

1. Create language file in `locales/`:
   ```
   locales/es.json  (Spanish)
   locales/fr.json  (French)
   ```

2. Follow the English template:
   ```json
   {
     "extension_name": "Parallel",
     "capture_button": "Capturar esta página",
     "open_editor": "Abrir Editor"
   }
   ```

3. Update manifest.json:
   ```json
   "default_locale": "en"
   ```

4. Test all UI strings display correctly

---

## 🏗️ Architecture Guidelines

### **File Organization**

```
parallel-extension/
├── manifest.json
├── icons/
├── popup/
│   ├── popup.html
│   └── popup.js
├── background/
│   └── service-worker.js
├── content/
│   └── content-script.js
└── editor/
    ├── editor.html
    ├── editor.js
    └── editor.css
```

### **Communication Flow**

```
Popup ←→ Service Worker ←→ Content Script
            ↓
         AI APIs
```

### **State Management**

- Use `chrome.storage.local` for persistence
- Keep state in service worker
- Pass only necessary data via messages

---

## 🔒 Security Guidelines

### **CSP Compliance**

Never use:
- `eval()`
- `new Function()`
- Inline event handlers (`onclick=""`)
- Inline scripts (`<script>...</script>`)

Always use:
- `addEventListener()`
- External script files
- Content Security Policy compliant code

### **Data Privacy**

- Never send user data to external servers
- Store everything locally
- No telemetry or analytics
- Clear privacy policy

---

## 🎓 Learning Resources

### **Chrome Extension Development**
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)

### **Chrome Built-in AI APIs**
- [Prompt API Docs](https://developer.chrome.com/docs/ai/built-in-apis)
- [AI API Explainer](https://github.com/explainers-by-googlers/prompt-api)

### **JavaScript**
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)

---

## 📞 Getting Help

### **Found a Bug?**
- Open a [GitHub Issue](https://github.com/jmy744/Parallel---AI-Writing-Assistant/issues)

### **Want to Chat?**
- Comment on relevant issues
- Join GitHub Discussions

---

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Credited in commit history

---

## 📜 Code of Conduct

### **Our Standards**

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### **Unacceptable Behavior**

- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing private information

### **Enforcement**

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban



---

## 🎉 Thank You!

Thank you for contributing to Parallel! Every contribution helps make this tool better for students, researchers, and writers worldwide.

**Together, we're building the future of private, offline AI writing assistance.** 🚀

---


**Found a bug?** Open an issue: https://github.com/jmy744/Parallel---AI-Writing-Assistant/issues

**Want to help?** Check open issues: https://github.com/jmy744/Parallel---AI-Writing-Assistant/issues
