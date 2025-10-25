// Parallel Popup - FIXED FOR NEW HTML

const $ = (selector) => document.querySelector(selector);
let sources = [];
let researchGoal = '';

function isRestrictedUrl(url = "") {
  return /^chrome:\/\//.test(url) ||
         /^chrome-extension:\/\//.test(url) ||
         /chrome.google.com\/webstore/.test(url) ||
         /^edge:\/\//.test(url) ||
         /^about:/.test(url);
}

function getTimeAgo(isoString) {
  const date = new Date(isoString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncate(text, length) {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
}

function showNotification(icon, title, message) {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    color: #1a202c;
    padding: 14px 18px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    animation: slideIn 0.3s;
  `;
  
  toast.innerHTML = `
    <span style="font-size:24px;">${icon}</span>
    <div>
      <div style="font-weight:700;font-size:13px;">${title}</div>
      <div style="font-size:11px;color:#6b7280;">${message}</div>
    </div>
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function updateStatus(type, title, detail) {
  const statusDot = $('#statusDot');
  const statusTitle = $('#statusTitle');
  const statusDetail = $('#statusDetail');
  
  if (statusDot) {
    statusDot.className = 'status-dot';
    if (type === 'error') statusDot.classList.add('error');
    if (type === 'success') statusDot.classList.add('ready');
  }
  
  if (statusTitle) statusTitle.textContent = title;
  if (statusDetail) statusDetail.textContent = detail;
}

// ========================================
// RESEARCH GOAL
// ========================================

async function setResearchGoal() {
  const goalInput = $('#researchGoal');
  const goal = goalInput?.value.trim();
  
  if (!goal) {
    showNotification('⚠️', 'Empty Goal', 'Please enter your research goal');
    return;
  }
  
  researchGoal = goal;
  
  try {
    await chrome.storage.local.set({ researchGoal: goal });
    
    // Hide quick guide after first goal set
    const quickGuide = $('#quickGuide');
    if (quickGuide) {
      quickGuide.style.display = 'none';
    }
    
    showNotification('✅', 'Goal Set', 'AI will check source relevance');
    
    // Recheck relevance for existing sources
    if (sources.length > 0) {
      await recheckAllRelevance();
    }
    
  } catch (error) {
    console.error('Set goal error:', error);
    showNotification('❌', 'Error', 'Failed to set goal');
  }
}

async function recheckAllRelevance() {
  for (let i = 0; i < sources.length; i++) {
    const relevance = await checkRelevance(sources[i]);
    sources[i].relevance = relevance;
  }
  await chrome.storage.local.set({ sources });
  renderSources();
}

// ========================================
// RELEVANCE CHECKING
// ========================================

async function checkRelevance(source) {
  if (!researchGoal) return { score: 'unknown', reason: 'No goal' };
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'checkRelevance',
      payload: { 
        goal: researchGoal, 
        source: { 
          title: source.title, 
          summary: source.summary
        } 
      }
    });
    
    if (response?.success) return response.relevance;
    return simpleRelevanceCheck(source);
  } catch (error) {
    return simpleRelevanceCheck(source);
  }
}

function simpleRelevanceCheck(source) {
  if (!researchGoal) return { score: 'unknown', reason: 'No goal' };
  
  const goalWords = researchGoal.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const sourceText = `${source.title} ${source.summary}`.toLowerCase();
  const matches = goalWords.filter(word => sourceText.includes(word)).length;
  const matchPercent = goalWords.length > 0 ? (matches / goalWords.length) * 100 : 0;
  
  if (matchPercent >= 60) return { score: 'high', reason: `${matches} key terms match` };
  if (matchPercent >= 30) return { score: 'medium', reason: `${matches} terms match` };
  return { score: 'low', reason: `Only ${matches} terms match` };
}

// ========================================
// SOURCES RENDERING
// ========================================

function renderSources() {
  const sourcesList = $('#sourcesList');
  const emptyState = $('#emptyState');
  const sourcesCount = $('#sourcesCount');
  
  if (sourcesCount) sourcesCount.textContent = sources.length;
  
  if (sources.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (sourcesList) sourcesList.innerHTML = '';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  // Sort by relevance
  const relevanceOrder = { high: 0, medium: 1, low: 2, unknown: 3 };
  const sortedSources = [...sources].sort((a, b) => {
    const aScore = a.relevance?.score || 'unknown';
    const bScore = b.relevance?.score || 'unknown';
    return relevanceOrder[aScore] - relevanceOrder[bScore];
  });
  
  sourcesList.innerHTML = sortedSources.map((source, idx) => {
    const originalIndex = sources.findIndex(s => s.id === source.id);
    const relevanceScore = source.relevance?.score || 'unknown';
    
    // Clean summary - remove asterisks and extra formatting
    const cleanSummary = (text) => {
      if (!text) return 'No summary available';
      return text
        .replace(/^\* /gm, '') // Remove bullet asterisks at start of lines
        .replace(/\*\*/g, '')  // Remove bold markers
        .replace(/\*/g, '')    // Remove remaining asterisks
        .replace(/\n{3,}/g, '\n\n') // Clean up excessive newlines
        .trim();
    };
    
    const fullSummary = cleanSummary(source.summary);
    
    // Create short summary (first 120 characters for preview)
    const shortSummary = fullSummary.length > 120 ? 
      fullSummary.slice(0, 120) + '...' : 
      fullSummary;
    
    const hasMoreContent = fullSummary.length > 120;
    
    // Relevance badge
    let relevanceBadge = '';
    if (researchGoal && relevanceScore !== 'unknown') {
      const badges = {
        high: { emoji: '✅', text: 'Relevant', color: '#10b981' },
        medium: { emoji: '⚠️', text: 'Maybe', color: '#f59e0b' },
        low: { emoji: '❌', text: 'Not Relevant', color: '#ef4444' }
      };
      const badge = badges[relevanceScore];
      if (badge) {
        relevanceBadge = `<span style="font-size:10px;background:${badge.color}22;color:${badge.color};padding:3px 8px;border-radius:10px;font-weight:700;display:inline-block;margin-top:4px;">${badge.emoji} ${badge.text}</span>`;
      }
    }
    
    return `
      <div class="source-card">
        <div class="source-card-header">
          <div class="source-icon">📄</div>
          <div class="source-content">
            <div class="source-title" title="${escapeHtml(source.title)}">${escapeHtml(truncate(source.title, 45))}</div>
            <div class="source-meta">Captured ${getTimeAgo(source.capturedAt)}</div>
            ${relevanceBadge}
          </div>
        </div>
        <div class="source-summary-short" id="short-${idx}">${escapeHtml(shortSummary)}</div>
        ${hasMoreContent ? `
          <button class="source-summary-toggle" data-index="${idx}">
            Show Full Summary
          </button>
          <div class="source-summary-full" id="summary-${idx}" style="display:none;">
            ${escapeHtml(fullSummary).replace(/\n/g, '<br>')}
          </div>
        ` : ''}
        <div class="source-actions">
          <button class="source-btn view-source-btn" data-index="${originalIndex}">🔗 View</button>
          <button class="source-btn remove remove-source-btn" data-index="${originalIndex}">🗑️ Remove</button>
        </div>
      </div>
    `;
  }).join('');
  
  sourcesList.querySelectorAll('.view-source-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      const source = sources[index];
      if (source?.url) chrome.tabs.create({ url: source.url });
    });
  });
  
  sourcesList.querySelectorAll('.remove-source-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.target.dataset.index);
      if (confirm('Remove this source?')) {
        sources.splice(index, 1);
        await chrome.storage.local.set({ sources });
        renderSources();
        showNotification('🗑️', 'Removed', 'Source deleted');
      }
    });
  });
  
  // Add toggle listeners for summary expansion
  sourcesList.querySelectorAll('.source-summary-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      const summaryDiv = document.getElementById(`summary-${index}`);
      const shortDiv = document.getElementById(`short-${index}`);
      const isExpanded = summaryDiv.style.display === 'block';
      
      if (isExpanded) {
        // Collapse - show short summary, hide full
        summaryDiv.style.display = 'none';
        shortDiv.style.display = 'block';
        e.target.textContent = 'Show Full Summary';
        e.target.classList.remove('expanded');
      } else {
        // Expand - hide short summary, show full
        summaryDiv.style.display = 'block';
        shortDiv.style.display = 'none';
        e.target.textContent = 'Hide Full Summary';
        e.target.classList.add('expanded');
      }
    });
  });
}

// ========================================
// LOAD DATA
// ========================================

async function loadSources() {
  try {
    const result = await chrome.storage.local.get(['sources', 'researchGoal']);
    sources = result.sources || [];
    researchGoal = result.researchGoal || '';
    
    const goalInput = $('#researchGoal');
    if (researchGoal && goalInput) {
      goalInput.value = researchGoal;
      // Hide quick guide if goal is already set
      const quickGuide = $('#quickGuide');
      if (quickGuide) quickGuide.style.display = 'none';
    }
    
    renderSources();
  } catch (error) {
    console.error('Load error:', error);
  }
}

// ========================================
// CHECK AI STATUS
// ========================================

async function checkAIStatus() {
  updateStatus('loading', 'Checking AI...', 'Connecting to Gemini Nano');
  
  try {
    const response = await chrome.runtime.sendMessage({ action: 'checkAI' });
    
    if (response?.success) {
      updateStatus('success', 'AI Ready ✓', 'Gemini Nano available');
    } else {
      updateStatus('error', 'AI Unavailable', 'Enable Chrome AI flags');
    }
  } catch (error) {
    console.error('AI check error:', error);
    updateStatus('error', 'Connection Error', 'Check service worker');
  }
}

// ========================================
// CAPTURE PAGE
// ========================================

async function captureCurrentPage() {
  const captureBtn = $('#captureBtn');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.id) {
      showNotification('❌', 'Error', 'No active tab');
      return;
    }
    
    if (isRestrictedUrl(tab.url)) {
      showNotification('⚠️', 'Cannot Capture', 'Chrome internal pages not supported');
      return;
    }
    
    if (captureBtn) {
      captureBtn.textContent = '⏳ Capturing...';
      captureBtn.disabled = true;
    }
    
    updateStatus('loading', 'Extracting...', 'Reading page content');
    
    let pageData = null;
    
    // Try content script first
    try {
      pageData = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
        
        chrome.tabs.sendMessage(tab.id, { type: 'parallel:getPageContent' }, (response) => {
          clearTimeout(timeout);
          
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response?.content?.length > 30) {
            resolve(response);
          } else {
            reject(new Error('Invalid response'));
          }
        });
      });
    } catch (msgError) {
      // Fallback: executeScript
      try {
        const [result] = await chrome.scripting.executeScript({ 
          target: { tabId: tab.id },
          func: () => {
            const el = document.querySelector('article, main, [role="main"]') || document.body;
            const clone = el.cloneNode(true);
            clone.querySelectorAll('script,style,nav,aside,footer,header').forEach(n => n.remove());
            let text = (clone.innerText || clone.textContent || '').replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
            
            return { 
              url: location.href, 
              title: document.querySelector('h1')?.innerText || document.title || 'Untitled',
              content: text.length > 50 ? text : document.body.innerText.slice(0, 5000),
              type: 'webpage' 
            };
          }
        });
        
        pageData = result?.result;
        if (!pageData?.content || pageData.content.length < 30) {
          throw new Error('Insufficient content');
        }
      } catch (execError) {
        // Basic fallback
        pageData = {
          url: tab.url,
          title: tab.title || 'Untitled',
          content: `Source: ${tab.title}\n\nURL: ${tab.url}\n\nCaptured for research.`,
          type: 'webpage'
        };
      }
    }
    
    updateStatus('loading', 'AI Analyzing...', 'Processing content');
    
    const response = await chrome.runtime.sendMessage({
      action: 'analyzePage',
      payload: { ...pageData, researchGoal }
    });
    
    if (response?.success) {
      updateStatus('success', 'Captured! ✓', 'Source analyzed');
      await loadSources();
      
      const source = response.source;
      
      if (source.relevance) {
        const messages = {
          high: { icon: '✅', title: 'Highly Relevant!', msg: 'Great source for your research' },
          medium: { icon: '⚠️', title: 'Maybe Relevant', msg: 'Review if it fits your goal' },
          low: { icon: '❌', title: 'Low Relevance', msg: 'Consider finding more relevant sources' }
        };
        const m = messages[source.relevance.score] || messages.medium;
        showNotification(m.icon, m.title, m.msg);
      } else {
        showNotification('✅', 'Captured!', 'Source saved successfully');
      }
      
      if (captureBtn) {
        captureBtn.textContent = '✅ Captured!';
        setTimeout(() => {
          captureBtn.textContent = '➕ Capture This Page';
          captureBtn.disabled = false;
        }, 2000);
      }
    } else {
      throw new Error(response?.error || 'Analysis failed');
    }
    
  } catch (error) {
    console.error('Capture error:', error);
    updateStatus('error', 'Capture Failed', error.message);
    
    if (captureBtn) {
      captureBtn.textContent = '➕ Capture This Page';
      captureBtn.disabled = false;
    }
    
    showNotification('❌', 'Capture Failed', error.message);
  }
}

// ========================================
// OPEN EDITOR
// ========================================

async function openEditor() {
  try {
    const editorUrl = chrome.runtime.getURL('editor/editor.html');
    await chrome.tabs.create({ url: editorUrl });
    window.close();
  } catch (error) {
    console.error('Open editor error:', error);
    showNotification('❌', 'Error', 'Could not open editor');
  }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Parallel popup loaded');
  
  await checkAIStatus();
  await loadSources();
  
  const setGoalBtn = $('#setGoalBtn');
  const goalInput = $('#researchGoal');
  const captureBtn = $('#captureBtn');
  const openEditorBtn = $('#openEditorBtn');
  
  if (setGoalBtn) {
    setGoalBtn.addEventListener('click', setResearchGoal);
  }
  
  if (goalInput) {
    goalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') setResearchGoal();
    });
  }
  
  if (captureBtn) {
    captureBtn.addEventListener('click', captureCurrentPage);
  }
  
  if (openEditorBtn) {
    openEditorBtn.addEventListener('click', openEditor);
  }
  
  console.log('✅ Popup ready!');
});

console.log('📦 Parallel popup.js loaded');