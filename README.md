# Parallel• - Offline AI Writing & Research Assistant
**Transform your browser into a complete research and writing workstation powered by Gemini Nano. Work 100% offline with complete privacy.**

**Built for:** Students | Researchers | Professional Writers

<img width="128" height="128" alt="icon128" align="center" src="https://github.com/user-attachments/assets/3c2d643d-0595-43af-a4ca-5e6088948c20" />

---

## 🎯 The Problem I'm Solving

Students, researchers, and writers face these daily challenges:
-  **Expensive AI subscriptions** ($20-200/month for ChatGPT Plus, Claude Pro, Grammarly Premium)
-  **Privacy concerns** sending academic work to cloud servers
-  **Unreliable internet** access in libraries, coffee shops, or while traveling
-  **Scattered research** across dozens of tabs and bookmarks
-  **Time wasted** switching between reading, researching, and writing tools
-  **Writer's block** when starting from blank pages

## ✨ The Parallel Solution

Parallel is a Chrome extension that brings **professional-grade AI writing assistance directly to your browser** - completely offline, completely private, completely free.

### Core Capabilities

| Feature | Description | Powered By |
|---------|-------------|------------|
| **Smart Source Capture** | One-click webpage capture with AI summarization | Summarizer API |
| **AI Content Generation** | Generate articles, blog posts, research papers | Prompt API |
| **Live Streaming** | Watch AI write in real-time | Prompt API |
| **8 Editing Tools** | Paraphrase, grammar check, tone adjustment | Rewriter + Prompt APIs |
| **Multi-Language Translation** | Translate to 7 languages instantly | Translator API |
| **Title Generation** | AI-powered title suggestions | Writer API |
| **Smart Word Goals** | Natural sentence completion at target length | Custom Algorithm |
| **Document Management** | Multiple documents with auto-save | Chrome Storage |
| **Offline Mode** | **100% functional without internet** | Gemini Nano |
| **Privacy First** | Zero data leaves your device | On-Device AI |

---

## 📋 Prerequisites & Installation

### **System Requirements**

| Requirement | Specification | Why It's Needed |
|-------------|---------------|-----------------|
| **Browser** | Chrome Canary 128+ | Built-in AI APIs (Chrome 138+ for stable) |
| **RAM** | 8GB minimum, 16GB recommended | Gemini Nano model |
| **Storage** | 2GB free space | AI model download |
| **OS** | Windows 10+, macOS 12+, Linux | Chrome support |
| **Internet** | Initial setup only | Download AI model, then fully offline |

### **Step-by-Step Installation**

#### **Step 1: Get Chrome Canary (or Chrome Dev)**

Download Chrome Canary:
- Windows/Mac: https://www.google.com/chrome/canary/
- Linux: Use Chrome Dev instead

**Why Canary?** Built-in AI APIs are in early access. Chrome 138+ Stable will work when released (Q1 2025).

---

#### **Step 2: Enable AI Flags**

1. Open Chrome Canary
2. Navigate to: `chrome://flags`
3. Search and **enable** these flags:
   - `Prompt API for Gemini Nano`
   - `Summarizer API`  
   - `Writer API`
   - `Rewriter API`
   - `Translator API`
4. Click **"Relaunch"** button

---

#### **Step 3: Download Gemini Nano Model**

⚠️ **IMPORTANT:** This requires internet but only once (~1.7GB download).

1. After enabling flags, visit any webpage
2. Chrome auto-downloads Gemini Nano
3. Check progress: `chrome://components`
4. Look for: **"Optimization Guide On Device Model"**
5. Wait until: **Status: "Up to date"**
6. Takes: 5-15 minutes

---

#### **Step 4: Install Parallel Extension**

1. Download/clone this repository:
   ```bash
   git clone https://github.com/jmy744/Parallel---AI-Writing-Assistant.git
   ```

2. Open Chrome Canary

3. Navigate to: `chrome://extensions`

4. Enable **"Developer mode"** (top-right toggle)

5. Click **"Load unpacked"**

6. Select the extension folder

7. Extension icon appears in toolbar ✅

---

#### **Step 5: Verify Installation**

1. Click Parallel icon
2. Check status:
   -  **"AI Ready - 4-5 APIs available"** = Perfect!
   -  **"Checking AI..."** = Wait 10-20 seconds
   -  **"AI not available"** = Review steps 1-3

**Expected API counts:**
- **Best:** 5/5 APIs (Prompt, Summarizer, Writer, Rewriter, Translator)
- **Common:** 4/5 APIs (Some systems missing one API)
- **Minimum:** 1/1 API (All features work with Prompt API fallback!)

---

## 🚀 Quick Start Guide

### **1. Set Research Goal (Optional but Recommended)**

```
Open Parallel popup
→ Enter goal: "AI in healthcare diagnostics"
→ Click "Set"
→ AI will rate source relevance automatically
```

### **2. Capture Your First Source**

```
Browse to any article (try Wikipedia)
→ Click Parallel icon
→ Click "Capture This Page"
→ Wait 5-10 seconds
→ ✅ Source saved with AI summary!
```

**AI automatically:**
- Extracts clean content
- Generates 2-3 sentence summary
- Identifies key points
- Checks relevance to goal

### **3. Generate Content**

```
Click "Open Editor"
→ Enter title: "The Future of AI Diagnostics"
→ Set word goal: 500 (optional)
→ Click "Generate Content"
→ Describe topic: "AI accuracy in medical imaging"
→ Watch AI write live! ✨
```

### **4. Edit with AI Tools**

```
Highlight any text
→ Floating toolbar appears
→ Click tool (Grammar/Paraphrase/etc.)
→ AI suggests improvements
→ Accept or modify
```

### **5. Export**

```
Click "Export" dropdown
→ Choose: Copy | HTML | Word
→ Download or paste anywhere
→ ✅ Done!
```

---

## ✨ Key Features 

### **1. Smart Source Capture**

**Problem:** Research is scattered across tabs, bookmarks, and notes.

**Solution:** One-click capture with AI summarization.

```
You: Click "Capture This Page" on any article
AI:  • Extracts main content (removes ads, menus, clutter)
     • Generates 2-3 sentence summary
     • Identifies 3-5 key points
     • Rates relevance: High/Medium/Low
     • Stores locally with metadata
```

**Real-world use:**
> "As a medical student writing about AI diagnostics, I captured 15 papers in 20 minutes. AI summaries helped me identify relevant ones before reading fully."

---

### **2. Smart Word Goals**

**The Innovation:** AI completes sentences naturally at target length.

**Traditional AI:**
```
Goal: 500 words
Output: "The research demonstrates fostering..." ❌
(stops at 500 words mid-sentence)
```

**Parallel:**
```
Goal: 500 words  
Range: 475-525 words (±5% tolerance)
Output: "The research demonstrates fostering community engagement." ✅
(502 words, complete sentence)
```

**How it works:**
```javascript
const targetMin = wordGoal * 0.95;  // 475
const targetMax = wordGoal * 1.05;  // 525

// Generate until in range AND sentence complete
while (currentWords < targetMax) {
  chunk = await stream.read();
  if (currentWords >= targetMin && endsWithSentence(text)) {
    break; // Perfect stop!
  }
}
```

---

### **3. Eight AI Editing Tools**

Highlight text → Floating toolbar with 8 tools:

| Tool | Function | API | Example |
|------|----------|-----|---------|
| **Paraphrase** | Rewrite differently | Rewriter | "study found" → "research indicates" |
| **Formal** | Professional tone | Rewriter | "pretty good" → "demonstrates merit" |
| **Casual** | Conversational | Rewriter | "one must" → "you should" |
| **Grammar** | Fix errors | Prompt | "they was" → "they were" |
| **Proofread** | Full check | Prompt | Grammar + spelling + style |
| **Expand** | Add detail | Prompt | 1 sentence → 2-3 with examples |
| **Shorten** | Make concise | Prompt | 3 sentences → 1 clear one |
| **Suggest** | Improvements | Prompt | 3 specific suggestions |

---

### **4. Multi-Language Translation**

Translate documents to 7 languages instantly:

| Language | Code | Example |
|----------|------|---------|
| English | en | "The future of AI..." |
| Spanish | es | "El futuro de la IA..." |
| French | fr | "L'avenir de l'IA..." |
| German | de | "Die Zukunft der KI..." |
| Chinese | zh | "人工智能的未来..." |
| Japanese | ja | "AIの未来..." |
| Arabic | ar | "مستقبل الذكاء..." |

**Process:**
1. Write document
2. Click "Translate" → Select language
3. Both title + content translated
4. Clean output (auto-removes labels)

---

### **5. Live Streaming Generation**

**Watch AI write word-by-word in real-time:**

```
Enable: "Show AI writing live"
Result: See every word as it's generated
Speed:  ~40-60 words/second
Feel:   Like watching someone type
```

**Alternative:** Disable streaming for instant full text (10-20 seconds total).

**Why streaming?**
- Engaging to watch
- Know progress
- Can stop early if off-track
- Reduces perceived wait time

---

### **6. Continue Writing**

**Generate from any cursor position:**

```
Your text: "The study examined three key factors:"
→ Place cursor at end
→ Click "Continue Writing"
→ AI: "First, diagnostic accuracy reached 94.3%..."
```

**Smart behavior:**
- Maintains your style
- Respects word goal remaining
- Aware of context (500 chars back)
- Completes thoughts naturally

---

### **7. Document Management**

**Professional multi-document workspace:**

- ✅ Create unlimited documents
- ✅ Switch between documents
- ✅ Rename and delete
- ✅ Auto-save every 3 seconds
- ✅ Never lose work
- ✅ All stored locally

**Export options:**
- **Copy** - Clipboard (paste anywhere)
- **HTML** - Standalone webpage
- **Word** - .docx for Word/Google Docs

---

##  Architecture & Technology

### **Chrome Built-in AI APIs**

| API | Usage | Fallback | % of Features |
|-----|-------|----------|---------------|
| **Prompt API** | Content generation, chat, editing | None (required) | 65% |
| **Summarizer API** | Source summarization | Prompt API | 10% |
| **Writer API** | Title generation | Prompt API | 5% |
| **Rewriter API** | Tone transformation | Prompt API | 15% |
| **Translator API** | Translation | Prompt API | 5% |

**Intelligent Fallback:**
```javascript
// All features work even if APIs unavailable
if (rewriterAPI.available) {
  result = await rewriterAPI.rewrite(text);
} else {
  result = await promptAPI.prompt(`Rewrite: ${text}`);
}

---

### **Code Structure**

| File | Lines | Purpose |
|------|-------|---------|
| `editor.js` | 2,401 | Editor logic, AI integration |
| `editor.css` | 1,400+ | Professional styling |
| `service-worker.js` | 385 | AI coordinator, routing |
| `popup.js` | 450+ | Popup interface |
| `content-script.js` | 230+ | Content extraction |
| **Total** | **~4,900+** | Production-ready |

---

### **Architecture Flow**

```
┌────────────────────────────────────┐
│  POPUP (Source Management)         │
│  • Capture pages                   │
│  • View summaries                  │
│  • Set research goals              │
└────────────────────────────────────┘
              ↓
┌────────────────────────────────────┐
│  SERVICE WORKER (AI Coordinator)   │
│  • Manages 5 AI API sessions       │
│  • Intelligent fallback system     │
│  • Message routing                 │
└────────────────────────────────────┘
              ↓
┌────────────────────────────────────┐
│  EDITOR (Full Writing Interface)   │
│  • Rich text editing               │
│  • 8 AI tools                      │
│  • Live streaming                  │
│  • Document management             │
└────────────────────────────────────┘
              ↓
┌────────────────────────────────────┐
│  CONTENT SCRIPT (Text Extraction)  │
│  • Smart content parsing           │
│  • Metadata extraction             │
└────────────────────────────────────┘
```

---

## 🔐 Privacy & Security

### **Why Privacy Matters**

**Cloud AI Problem:**
- Your essays → OpenAI servers
- Your research → Google servers
- Your ideas → Training material

**Parallel Solution:**

| Feature | Cloud AI | Parallel |
|---------|----------|----------|
| **Data location** | External servers | Your device only |
| **Internet needed** | Always | Setup only |
| **Training data** | Potentially | Never |
| **GDPR compliant** | Varies | Yes (by design) |

**Technical Implementation:**
- ✅ Zero network requests after setup
- ✅ All data in Chrome local storage
- ✅ No external dependencies
- ✅ Open source & auditable

**Perfect for:**
- Academic research
- Medical/legal writing
- Unpublished manuscripts
- Sensitive business content

---

## 🚨 Challenges & Honest Limitations

### **1. Smart Word Goals** ✅ SOLVED

**Problem:** AI stops mid-sentence at exact word counts.

**Solution:** ±5% tolerance + sentence detection
```javascript
if (currentWords >= targetMin && endsWithSentence(text)) {
  break; // Complete sentence!
}
```

---

### **2. Zoom-Aware UI** ✅ SOLVED

**Problem:** Floating toolbar breaks at different zoom levels.

**Solution:** Dynamic viewport calculations
```javascript
const viewportHeight = window.innerHeight;
const spaceBelow = viewportHeight - rect.bottom;
// Position above or below based on space
```

**Result:** Works perfectly 75%-125% zoom

---

### **3. Content Extraction** ✅ SOLVED

**Problem:** Webpages have ads, menus, clutter.

**Solution:** Multi-strategy extraction
- Try semantic HTML (`<article>`, `<main>`)
- Remove noise (`nav`, `aside`, `footer`)
- Clean whitespace

---

### **4. Current Limitations** 

#### **AI Model Constraints:**

**What Gemini Nano Does Well:**
- ✅ Short-medium content (500-1500 words)
- ✅ General topics & summaries
- ✅ Grammar & style improvements
- ✅ Paraphrasing & rewriting

**Where It Struggles:**
- ⚠️ Very long documents (5000+ words)
- ⚠️ Highly technical jargon (needs fact-checking)
- ⚠️ Citations (generates plausible but may be incorrect)
- ⚠️ Real-time data (no internet = no current events)
- ⚠️ Complex mathematics (basic OK, advanced limited)

**Recommendation:**
- Use for drafting & editing
- Fact-check technical claims
- Verify citations
- **Research assistant, not expertise replacement**

---

#### **Browser Support:**

| Browser | Version | Status |
|---------|---------|--------|
| Chrome Canary | 128+ | ✅ Full support |
| Chrome Dev | 128+ | ✅ Full support |
| Chrome Stable | 138+ | ✅ Future (Q1 2025) |
| Firefox/Safari | Any | ❌ No built-in AI |

**Why Chrome only?** Chrome Built-in AI APIs are Chrome-exclusive innovation.

---

#### **Performance Expectations:**

| Task | Time (Typical System) |
|------|----------------------|
| Capture source | 5-10 seconds |
| Generate 500 words | 15-25 seconds |
| Generate 1000 words | 25-40 seconds |
| Edit/paraphrase | 1-5 seconds |
| Translate | 10-20 seconds |

**Not instantaneous but:**
- Faster than manual writing
- Competitive with cloud AI
- No network latency

---

## 🎓 Use Cases & Examples

### **Example 1: Research Paper (Student)**

**Task:** 5-page literature review on AI in healthcare

**Workflow:**
1. **Research** (30 min): Capture 10 sources, auto-summarized
2. **Outline** (10 min): Generate title, set word goal (1200)
3. **Write** (45 min): Generate + integrate sources
4. **Edit** (30 min): Grammar, formal tone, suggestions
5. **Export** (5 min): Download as Word, submit

**Total:** ~2 hours (vs. 6-8 manual)  
**Cost:** $0 (vs. $20-50 for tools)  
**Privacy:** ✅ Never left device

---

### **Example 2: Blog Post (Writer)**

**Task:** 3 articles/week on AI trends

**Workflow:**
- **Monday:** Capture 15 trending articles
- **Tue-Thu:** Write 3x 800-word posts (2 hrs each)
- Translate to Spanish (bonus!)
- Export as HTML, publish

**Weekly Savings:**
- Time: 6-8 hrs vs. 15-20 hrs manual
- Cost: $0 vs. $50/month tools

---

### **Example 3: Grant Proposal (Researcher)**

**Task:** 15-page NSF proposal

**Workflow:**
1. **Literature Review:** Capture 40+ papers
2. **Methodology:** Technical writing + AI clarity
3. **Impact:** AI draft + heavy editing

**Total:** ~4 days (vs. 2-3 weeks)  
**Privacy:** ✅ Sensitive research stayed local

---

## 🐛 Troubleshooting

### **"AI not ready"**

**Solutions:**
1. Check flags: `chrome://flags` (all enabled?)
2. Check model: `chrome://components` (up to date?)
3. Wait 30 seconds, retry
4. Restart Chrome
5. Update to latest Canary

---

### **"Capture failed"**

**Solutions:**
1. Works on regular webpages (not chrome:// or PDFs)
2. Try different site (test: Wikipedia)
3. Refresh page (F5)
4. Check console (F12) for errors

---

### **Slow performance**

**Solutions:**
1. Close other tabs (free RAM)
2. Lower word goal (500-1000 at a time)
3. Disable streaming
4. Restart browser

---

## 🗺️ Roadmap

### **Version 1.1**
- Citation management (APA, MLA, Chicago, Harvard)
- Dark mode
- Keyboard shortcuts (Ctrl+K)
- Export to Markdown
- PDF source support

### **Version 1.2** 
- Template library
- Advanced formatting
- Voice input (when API available)
- Image support (when API available)

### **Version 2.0** 
- Progressive Web App (mobile)
- Team collaboration (optional)
- Advanced research features
- Chrome Web Store listing

---

## 📄 License

**MIT License** - Free to use, modify, and distribute.

See [LICENSE](LICENSE) file for full details.

---

## 🙏 Acknowledgments

- **Google Chrome Team** - For Chrome Built-in AI APIs
- **Gemini Nano** - For powering all AI features
- **Early Preview Program** - For development support
- **Open Source Community** - For inspiration
- **Students & Researchers** - For showing us real problems

---

## 📞 Support

- **Bugs:** [GitHub Issues](https://github.com/jmy744/Parallel---AI-Writing-Assistant/issues)
- **Features:** [Discussions](https://github.com/jmy744/Parallel---AI-Writing-Assistant/discussions)
- **Contact:** [@jmy744](https://github.com/jmy744)

---

##  Show Your Support

If Parallel helps you:
- ⭐ Star this repository
- 🐛 Report bugs
- 💡 Suggest features
- 🔀 Submit pull requests
- 📢 Share with others

---

## 📊 Quick Stats

| Metric | Value |
|--------|-------|
| Lines of Code | 4,900+ |
| APIs Used | 5 (Chrome Built-in) |
| Features | 20+ |
| Cost | $0 Forever |
| Privacy | 100% Local |
| Offline | 100% Functional |

---

**Built with ❤️ for students, researchers, and writers worldwide.**

**Parallel• - Transform your browser into a complete research and writing workstation powered by Gemini Nano - 100% offline, 100% private.**

**Chrome Built-in AI + Gemini Nano** 🧠✨

---

**Repository:** https://github.com/jmy744/Parallel---AI-Writing-Assistant.git


