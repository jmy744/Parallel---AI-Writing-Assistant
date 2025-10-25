# 🧠 Parallel — Your Offline AI Writing Companion

![Parallel Banner](screenshots/banner.png)

[![Built with Chrome Built-in AI](https://img.shields.io/badge/Built%20with-Chrome%20Built-in%20AI-blue?logo=googlechrome)](https://developer.chrome.com/docs/ai/)
[![Powered by Gemini Nano](https://img.shields.io/badge/Powered%20by-Gemini%20Nano-orange?logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Challenge Entry](https://img.shields.io/badge/Google%20AI%20Challenge-2025-purple.svg)](https://devpost.com)

Transform your browser into a **complete research and writing workstation** powered by Chrome Built-in AI APIs and Gemini Nano. Work **100% offline** with **complete privacy**.

---

## 🌟 Key Features

### 📰 Smart Source Capture
- One-click capture of any webpage with automatic **AI summarization** (*Summarizer API*).
- Extracts key points and stores all data **locally** for offline use.

### ✍️ Intelligent Content Generation
- Write **articles, essays, or research papers** with real-time streaming AI (*Prompt API*).
- Guided by “**Smart Word Goals**” ensuring natural sentence flow.

### 🧰 8-in-1 AI Editing Toolbar
Refine text instantly with Intelligent API Orchestration:
- **Rewriter API** → Paraphrase · Formal · Casual
- **Prompt API** → Grammar · Proofread · Suggest · Expand · Shorten

### 💬 Offline AI Chat Assistant
- “**Ask Parallel**” lets you query your captured research offline.
- Runs fully **on-device** using *Gemini Nano*.

### 🌍 Multi-Language Translation
- Translate full documents into **7 languages** via the *Translator API*.

### 📁 Document Management
- Auto-save, manage multiple documents, and export to `.docx`, `.html`, or clipboard.

### 🔒 100% Offline & Private
- No data ever leaves your device.
- Works offline after first model download.

---

## 🎯 Why Parallel?

Traditional writing = dozens of tabs + writer’s block + cloud AI privacy risks.

**Parallel** unifies: 🧠 Smart capture ✨ Context-aware drafting 💬 Offline AI editing 🔐 Full privacy

Perfect for **students**, **researchers**, and **professionals** needing secure, offline productivity.

---

## ⚡ Prerequisites

| Requirement | Details |
|--------------|----------|
| **Chrome Version** | Canary / Dev / Beta supporting Built-in AI APIs |
| **OS** | Windows 10/11 · macOS 13+ · Linux · Chromebook Plus (16389.0.0+) |
| **Storage** | ≥ 22 GB free (10 GB minimum after model download) |
| **Hardware** | GPU ≥ 4 GB VRAM **or** CPU ≥ 16 GB RAM + 4 cores |
| **Network** | Unmetered connection for initial download only |
| **Policy** | Must follow Google’s Generative AI Prohibited Uses Policy |

---

## 🚀 Installation

### Step 1 – Enable Chrome AI Flags
1. Open Chrome (Canary/Dev/Beta).
2. Visit `chrome://flags`.
3. Enable:
   - `#prompt-api-for-gemini-nano`
   - `#optimization-guide-on-device-model`
   - `#optimization-guide-model-downloading`
   - *(Optional)* `#summarizer-api`, `#rewriter-api`, `#writer-api`, `#translator-api`
4. Click **Relaunch**.

---

### Step 2 – Download Gemini Nano Model
1. Keep internet active (1–10 min download ≈ 1.7 GB).
2. Verify:
   - `chrome://components` → *Optimization Guide On Device Model* → **Up to date**
   - Or run in Console:
     ```js
     await LanguageModel.availability()
     // → "available"
     ```

---

### Step 3 – Install Parallel Extension
1. Download ZIP → Unzip (`Parallel-AI-Assistant-main`).
2. Open `chrome://extensions`.
3. Enable **Developer mode** → **Load unpacked** → select folder.
4. Pin Parallel to toolbar.

---

### Step 4 – Verify Installation
Popup → shows `✅ AI Ready – Detected APIs (4/5)`.
If “Checking AI…” persists → see *Troubleshooting* below.

---

## ⚙️ Architecture Overview

| Module | Purpose |
|---------|----------|
| **popup.js** | Handles capture and research goal input |
| **content-script.js** | Extracts main article content |
| **service-worker.js** | Orchestrates AI sessions & storage |
| **editor.js** | Main writing workspace (SPA) |
| **API Orchestration** | Auto-selects best API with fallbacks |

---

## 🧭 Quick Start Guide

1. **Capture** → Click *Parallel > Capture This Page*
2. **Summarize** → Auto-AI summary stored locally
3. **Open Editor** → Full workspace
4. **Write** → Real-time Prompt API generation
5. **Edit** → Highlight → Use 8-tool toolbar
6. **Ask Parallel** → Chat about your sources
7. **Translate** → Choose language
8. **Export** → `.docx`, `.html`, or clipboard

---

## 📸 Screenshots

| Capture | Editor | Chat |
|----------|---------|------|
| ![Capture Page](screenshots/capture.png) | ![Editor UI](screenshots/editor.png) | ![Ask Parallel](screenshots/chat.png) |

---

## 🐞 Troubleshooting

| Issue | Fix |
|--------|-----|
| **AI Unavailable** | Restart Chrome / Verify flags / Hardware OK |
| **Model not downloaded** | Check `chrome://components` or run `await LanguageModel.availability()` |
| **Low storage** | Free > 10 GB |
| **Console errors** | Inspect Service Worker console |
| **Still failing** | Reload extension / reboot system |

---

## 🧾 License

This project is licensed under the [MIT License](LICENSE).

---

## 🚀 Built for the Google Chrome Built-in AI Challenge 2025

**Parallel** empowers writers, students, and researchers with private, offline AI assistance — merging performance, privacy, and productivity.

> ✨ “Write smarter. Anywhere. Without leaving a trace.”

