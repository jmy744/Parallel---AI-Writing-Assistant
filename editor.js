// Parallel Editor - COMPLETE WITH ALL CHROME AI APIs AND DOCUMENT MANAGEMENT

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

let state = {
  aiSessions: {
    prompt: null,
    summarizer: null,
    writer: null,
    rewriter: null,
    translator: null
  },
  isAIReady: false,
  sources: [],
  citations: [],
  showPreview: false,
  expandedSourceId: null,
  wordGoal: 0,
  currentTone: 'professional',
  citationStyle: 'apa',
  currentDocId: Date.now(),
  currentDocName: 'Untitled Document',  // ADDED: Separate document name
  autoSaveInterval: null
};

let originalContent = '';

// ========================================
// AI INITIALIZATION (ALL APIs)
// ========================================

async function initAI() {
  try {
    console.log('🤖 Initializing ALL Chrome AI APIs...');
    
    // Prompt API
    if (typeof LanguageModel !== 'undefined') {
      const availability = await LanguageModel.availability();
      if (availability !== 'no') {
        state.aiSessions.prompt = await LanguageModel.create({
          initialPrompts: [{
            role: 'system', 
            content: 'You are Parallel, a research writing assistant. Write clear, engaging content. Use <strong> for emphasis. NEVER use asterisks or hash symbols for formatting.'
          }],
          expectedOutputs: [
            { type: 'text', languages: ['en'] }
          ]
        });
        console.log('✅ Prompt API ready');
      }
    }

    // Summarizer API
    if (typeof Summarizer !== 'undefined') {
      try {
        const sumAvail = await Summarizer.availability();
        if (sumAvail !== 'no') {
          state.aiSessions.summarizer = await Summarizer.create();
          console.log('✅ Summarizer API ready');
        }
      } catch (e) {
        console.warn('⚠️ Summarizer API unavailable');
      }
    }

    // Writer API
    if (typeof Writer !== 'undefined') {
      try {
        const writerAvail = await Writer.availability();
        if (writerAvail !== 'no') {
          state.aiSessions.writer = await Writer.create();
          console.log('✅ Writer API ready');
        }
      } catch (e) {
        console.warn('⚠️ Writer API unavailable');
      }
    }

    // Rewriter API
    if (typeof Rewriter !== 'undefined') {
      try {
        const rewriterAvail = await Rewriter.availability();
        if (rewriterAvail !== 'no') {
          state.aiSessions.rewriter = await Rewriter.create();
          console.log('✅ Rewriter API ready');
        }
      } catch (e) {
        console.warn('⚠️ Rewriter API unavailable');
      }
    }

    // Translator API
    if (typeof Translator !== 'undefined') {
      try {
        const translatorAvail = await Translator.availability();
        if (translatorAvail !== 'no') {
          state.aiSessions.translator = await Translator.create();
          console.log('✅ Translator API ready');
        }
      } catch (e) {
        console.warn('⚠️ Translator API unavailable');
      }
    }

    state.isAIReady = !!(state.aiSessions.prompt);
    
    if (state.isAIReady) {
      $('#aiStatus').className = 'ai-status ready';
      $('#aiStatus').innerHTML = '<span class="status-dot"></span> AI Ready';
    } else {
      $('#aiStatus').className = 'ai-status error';
      $('#aiStatus').innerHTML = '<span class="status-dot"></span> AI Unavailable';
    }

    console.log('📊 Available APIs:', {
      prompt: !!state.aiSessions.prompt,
      summarizer: !!state.aiSessions.summarizer,
      writer: !!state.aiSessions.writer,
      rewriter: !!state.aiSessions.rewriter,
      translator: !!state.aiSessions.translator
    });
    
  } catch (error) {
    state.isAIReady = false;
    $('#aiStatus').className = 'ai-status error';
    $('#aiStatus').innerHTML = '<span class="status-dot"></span> AI Error';
    console.error('AI init error:', error);
  }
}

// ========================================
// DOCUMENT MANAGEMENT
// ========================================

async function saveDocument() {
  try {
    const title = $('#articleTitle')?.value || 'Untitled';
    const content = $('#editor')?.innerHTML || '';
    const wordCount = getEditorText().split(/\s+/).filter(Boolean).length;
    
    // Don't save empty documents
    if (!title.trim() && !content.trim()) {
      console.log('⏭️ Skipping save: Empty document');
      return;
    }
    
    // IMPORTANT: Verify we have a valid currentDocId
    if (!state.currentDocId) {
      console.warn('⚠️ No current document ID - skipping save');
      return;
    }
    
    console.log('💾 Saving document:', state.currentDocId, title);
    
    const doc = {
      id: state.currentDocId,
      name: state.currentDocName,  // ADDED: Document name (separate from title)
      title,                        // KEPT: Article title
      content,
      wordCount,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      format: $('#writingFormat')?.value || 'article',
      tone: state.currentTone,
      citations: state.citations
    };
    
    const storage = await chrome.storage.local.get(['documents']);
    let documents = storage.documents || [];
    
    const existingIndex = documents.findIndex(d => d.id === state.currentDocId);
    if (existingIndex >= 0) {
      doc.createdAt = documents[existingIndex].createdAt;
      documents[existingIndex] = doc;
      console.log('📝 Updated existing document');
    } else {
      documents.push(doc);
      console.log('➕ Added new document');
    }
    
    // Keep only last 50 documents
    if (documents.length > 50) {
      documents.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      documents = documents.slice(0, 50);
    }
    
    await chrome.storage.local.set({ documents, currentDocId: state.currentDocId });
    console.log('✅ Auto-saved:', title);
    
    // Update dropdown if title changed
    updateDocumentTitle();
    
  } catch (error) {
    console.error('❌ Auto-save error:', error);
  }
}

async function loadDocument() {
  try {
    const storage = await chrome.storage.local.get(['documents', 'currentDocId']);
    
    if (storage.currentDocId) {
      state.currentDocId = storage.currentDocId;
    }
    
    const documents = storage.documents || [];
    const currentDoc = documents.find(d => d.id === state.currentDocId);
    
    if (currentDoc) {
      state.currentDocName = currentDoc.name || 'Untitled Document';  // ADDED: Load document name
      $('#articleTitle').value = currentDoc.title;
      $('#editor').innerHTML = currentDoc.content;
      $('#writingFormat').value = currentDoc.format || 'article';
      state.currentTone = currentDoc.tone || 'professional';
      state.citations = currentDoc.citations || [];
      updateStats();
      updateWordGoal();
      console.log('📄 Document loaded:', currentDoc.name || currentDoc.title);
    } else {
      // No current document, create a new one
      state.currentDocId = Date.now();
      state.currentDocName = 'Untitled Document';  // ADDED: Set default name
      await chrome.storage.local.set({ currentDocId: state.currentDocId });
      $('#articleTitle').focus();
    }
    
    // Load documents list for dropdown
    await loadDocumentsList();
    
  } catch (error) {
    console.error('Load document error:', error);
  }
}

async function loadDocumentsList() {
  try {
    const storage = await chrome.storage.local.get(['documents']);
    const documents = storage.documents || [];
    
    // Sort by most recent first
    documents.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    const selector = $('#documentSelector');
    if (!selector) return;
    
    // Clear existing options
    selector.innerHTML = '<option value="new">📄 New Document</option>';
    
    // Add recent documents (max 10)
    documents.slice(0, 10).forEach(doc => {
      const option = document.createElement('option');
      option.value = doc.id;
      
      // FIXED: Show document NAME in dropdown (not article title)
      option.textContent = doc.name || 'Untitled Document';
      
      // Mark as selected if it's the current document
      if (doc.id === state.currentDocId) {
        option.selected = true;
      }
      
      selector.appendChild(option);
    });
    
  } catch (error) {
    console.error('Load documents list error:', error);
  }
}

async function switchDocument(documentId) {
  try {
    console.log('🔄 Switching to document ID:', documentId);
    
    if (documentId === 'new') {
      await createNewDocument();
      return;
    }
    
    // Save current document first
    await saveDocument();
    
    // Load selected document
    const storage = await chrome.storage.local.get(['documents']);
    const documents = storage.documents || [];
    const selectedDoc = documents.find(d => d.id === parseInt(documentId));
    
    if (selectedDoc) {
      state.currentDocId = selectedDoc.id;
      state.currentDocName = selectedDoc.name || 'Untitled Document';  // ADDED: Load document name
      
      $('#articleTitle').value = selectedDoc.title;
      $('#editor').innerHTML = selectedDoc.content;
      $('#writingFormat').value = selectedDoc.format || 'article';
      state.currentTone = selectedDoc.tone || 'professional';
      state.citations = selectedDoc.citations || [];
      
      // Hide analysis results
      const analysisDiv = $('#analysisResults');
      if (analysisDiv) analysisDiv.style.display = 'none';
      
      // Update current document ID in storage
      await chrome.storage.local.set({ currentDocId: state.currentDocId });
      
      updateStats();
      updateWordGoal();
      await loadDocumentsList(); // Refresh the dropdown
      
      showToast('📄', 'Document Loaded', selectedDoc.name || 'Untitled Document');
      console.log('✅ Switched to document:', selectedDoc.name || selectedDoc.title);
    } else {
      console.error('❌ Document not found:', documentId);
      showToast('❌', 'Error', 'Document not found');
    }
    
  } catch (error) {
    console.error('❌ Switch document error:', error);
    showToast('❌', 'Error', 'Could not switch document');
  }
}

async function createNewDocument() {
  try {
    // Save current document before creating new one
    await saveDocument();
    
    // Create new document
    state.currentDocId = Date.now();
    state.currentDocName = 'Untitled Document';  // ADDED: Set default document name
    
    // Clear editor
    $('#articleTitle').value = '';
    $('#editor').innerHTML = '';
    $('#writingFormat').value = 'article';
    state.currentTone = 'professional';
    state.citations = [];
    
    // Hide analysis results
    const analysisDiv = $('#analysisResults');
    if (analysisDiv) analysisDiv.style.display = 'none';
    
    // Update storage
    await chrome.storage.local.set({ currentDocId: state.currentDocId });
    
    // Update UI
    updateStats();
    updateWordGoal();
    await loadDocumentsList();
    
    // Focus on title
    $('#articleTitle').focus();
    
    showToast('📄', 'New Document', 'Started fresh document');
    console.log('📄 New document created');
    
  } catch (error) {
    console.error('Create new document error:', error);
    showToast('❌', 'Error', 'Could not create new document');
  }
}

async function updateDocumentTitle() {
  // Update the dropdown to show current title WITHOUT "(current)" suffix
  const selector = $('#documentSelector');
  const currentOption = selector.querySelector(`option[value="${state.currentDocId}"]`);
  const title = $('#articleTitle').value || 'Untitled';
  
  if (currentOption) {
    // FIXED: Just update the title, no "(current)" suffix
    currentOption.textContent = title;
  }
}

// ========================================
// LOAD SOURCES
// ========================================

async function loadSources() {
  try {
    const result = await chrome.storage.local.get(['sources']);
    state.sources = result.sources || [];
    renderSources();
  } catch (error) {
    console.error('Load error:', error);
  }
}

// ========================================
// RENDER SOURCES (WITH PREVIEW)
// ========================================

function renderSources() {
  const container = $('#sourcesList');
  
  if (!state.sources || state.sources.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;opacity:0.5;font-size:12px;">No sources captured yet</div>';
    return;
  }
  
  container.innerHTML = state.sources.map((s, i) => {
    // Clean summary - remove asterisks and extra formatting
    const cleanText = (text) => {
      if (!text) return 'No summary';
      return text
        .replace(/^\* /gm, '') // Remove bullet asterisks at start of lines
        .replace(/\*\*/g, '')  // Remove bold markers
        .replace(/\*/g, '')    // Remove remaining asterisks
        .replace(/\n{3,}/g, '\n\n') // Clean up excessive newlines
        .trim();
    };
    
    const cleanSummary = cleanText(s.summary);
    const cleanKeyPoints = s.keyPoints ? s.keyPoints.map(kp => cleanText(kp)) : [];
    
    // Create short summary (first 100 characters)
    const shortSummary = cleanSummary.length > 100 ? 
      cleanSummary.slice(0, 100) + '...' : 
      cleanSummary;
    
    return `
    <div class="source-item" data-index="${i}">
      <div class="source-title">${escapeHtml(s.title.slice(0, 50))}${s.title.length > 50 ? '...' : ''}</div>
      <div class="source-meta">${getTimeAgo(s.capturedAt)}</div>
      
      <!-- Short summary preview -->
      <div class="source-summary-short">${escapeHtml(shortSummary)}</div>
      
      <!-- Toggle for full summary -->
      <div class="source-summary-toggle ${state.expandedSourceId === s.id ? 'expanded' : ''}" data-id="${s.id}">
        ${state.expandedSourceId === s.id ? 'Hide Details' : 'Show Details'}
      </div>
      
      <!-- Full summary content -->
      <div class="source-summary-content" style="display:${state.expandedSourceId === s.id ? 'block' : 'none'};">
        <strong>Full Summary</strong>
        <p>${escapeHtml(cleanSummary)}</p>
        ${cleanKeyPoints.length > 0 ? `
          <strong>Key Points</strong>
          <ul>
            ${cleanKeyPoints.map(kp => `<li>${escapeHtml(kp)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
      
      <div class="source-actions">
        <button class="source-btn" data-action="use" data-index="${i}" title="Add this source content to your writing with AI">
          ✏️ Use in Writing
        </button>
        <button class="source-btn" data-action="cite" data-index="${i}" title="Generate a citation for this source">
          📚 Cite
        </button>
      </div>
    </div>
  `;
  }).join('');
  
  container.querySelectorAll('.source-summary-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const sourceId = parseInt(toggle.dataset.id);
      state.expandedSourceId = state.expandedSourceId === sourceId ? null : sourceId;
      renderSources();
    });
  });
  
  container.querySelectorAll('.source-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const index = parseInt(btn.dataset.index);
      const action = btn.dataset.action;
      
      if (action === 'use') {
        await useSourceInWriting(index);
      } else if (action === 'cite') {
        await generateCitation(index);
      }
    });
  });
}

// ========================================
// CLEAN AI OUTPUT - FIXED
// ========================================

function cleanAIOutput(text) {
  let cleaned = text;
  
  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
  // Handle bold text properly
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Remove remaining asterisks
  cleaned = cleaned.replace(/\*/g, '');
  
  // Remove underscores used for emphasis
  cleaned = cleaned.replace(/_+/g, '');
  
  // Remove backticks
  cleaned = cleaned.replace(/`/g, '');
  
  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  return cleaned;
}

// ========================================
// GENERATE TITLE
// ========================================

async function generateTitle() {
  if (!state.isAIReady) {
    showToast('⚠️', 'AI Not Ready', 'Wait a moment');
    return;
  }
  
  const content = getEditorText();
  if (!content && state.sources.length === 0) {
    showToast('⚠️', 'Need Content', 'Write something or add sources first');
    return;
  }
  
  showLoading('Generating title with Writer API...');
  
  try {
    const sourceTitles = state.sources.map(s => s.title).join(', ');
    
    // Use Writer API if available, otherwise Prompt API
    const session = state.aiSessions.writer || state.aiSessions.prompt;
    
    if (!session) {
      throw new Error('No AI session available');
    }
    
    const prompt = `Based on this content, generate ONE compelling title (max 12 words). Return ONLY the title, no formatting, no quotes, no asterisks:\n\nContent: ${content.slice(0, 1000)}\nSources: ${sourceTitles}\n\nTitle:`;
    
    let title;
    if (state.aiSessions.writer) {
      title = await state.aiSessions.writer.write(prompt);
    } else {
      title = await state.aiSessions.prompt.prompt(prompt);
    }
    
    // Clean the title
    title = cleanAIOutput(title);
    title = title.replace(/^["']|["']$/g, '').replace(/^Title:\s*/i, '').trim();
    
    $('#articleTitle').value = title;
    highlightChange($('#articleTitle'));
    hideLoading();
    updateStats();
    showToast('✅', 'Title Generated!', title.slice(0, 50));
    
    await saveDocument();
    
  } catch (error) {
    hideLoading();
    showToast('❌', 'Failed', error.message);
  }
}

// ========================================
// GENERATE ARTICLE - WITH WORD GOAL CONSTRAINT
// ========================================

async function generateArticle() {
  const title = $('#articleTitle').value.trim();
  const format = $('#writingFormat').value;
  const tone = state.currentTone;
  
  if (!title) {
    showToast('⚠️', 'Enter Title', 'Add a title first');
    $('#articleTitle').focus();
    return;
  }

  if (!state.isAIReady) {
    showToast('⚠️', 'AI Not Ready', 'Wait');
    return;
  }

  const existingInput = $('#userIntentInput');
  if (existingInput) {
    existingInput.remove();
  }

  const editor = $('#editor');
  const inputContainer = document.createElement('div');
  inputContainer.id = 'userIntentInput';
  inputContainer.style.cssText = `
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    margin: 20px 0;
  `;
  
  inputContainer.innerHTML = `
    <h3 style="color:white;font-size:16px;font-weight:700;margin-bottom:12px;">✏️ What would you like to write about?</h3>
    <input 
      type="text" 
      id="intentInput" 
      placeholder="e.g., AI diagnostic accuracy in healthcare"
      style="width:100%;padding:12px;border:2px solid white;border-radius:10px;font-size:14px;margin-bottom:12px;font-family:var(--sans);"
    />
    <div style="display:flex;gap:8px;">
      <button id="startGenerateBtn" style="flex:1;padding:12px;background:white;color:#667eea;border:none;border-radius:10px;font-weight:700;cursor:pointer;">
        🚀 Start Writing
      </button>
      <button id="cancelGenerateBtn" style="padding:12px 20px;background:transparent;color:white;border:2px solid white;border-radius:10px;font-weight:600;cursor:pointer;">
        Cancel
      </button>
    </div>
  `;
  
  editor.insertBefore(inputContainer, editor.firstChild);
  
  const input = $('#intentInput');
  input.focus();
  
  $('#startGenerateBtn').addEventListener('click', async () => {
    const userIntent = input.value.trim();
    if (!userIntent) {
      showToast('⚠️', 'Enter Topic', 'Please describe what you want to write');
      return;
    }
    
    inputContainer.remove();
    
    const showStreaming = document.getElementById('showStreamingToggle')?.checked ?? true;
    
    if (showStreaming) {
      await generateWithStreaming(title, format, tone, userIntent);
    } else {
      await generateWithoutStreaming(title, format, tone, userIntent);
    }
  });
  
  $('#cancelGenerateBtn').addEventListener('click', () => {
    inputContainer.remove();
  });
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      $('#startGenerateBtn').click();
    }
  });
}

// ========================================
// STREAMING GENERATION - WITH WORD GOAL
// ========================================

async function generateWithStreaming(title, format, tone, userIntent) {
  const generateBtn = $('#generateArticleBtn');
  const progressBar = $('#generationProgress');
  const liveWordCount = $('#liveWordCount');
  const editor = $('#editor');
  const editorWrapper = editor.closest('.editor-wrapper');
  
  // Get word goal
  const wordGoalInput = $('#wordGoal');
  const wordGoal = wordGoalInput ? parseInt(wordGoalInput.value) || 0 : 0;
  const minWords = wordGoal > 0 ? Math.floor(wordGoal * 0.95) : 0;
  const maxWords = wordGoal > 0 ? Math.floor(wordGoal * 1.05) : 0;
  
  progressBar.style.display = 'block';
  liveWordCount.textContent = '0';
  
  generateBtn.classList.add('generating');
  generateBtn.disabled = true;
  
  editorWrapper.classList.add('streaming');
  
  try {
    const referencesContext = state.sources.slice(0, 3).map((s, i) => 
      `[${i + 1}] ${s.title} - ${s.summary.slice(0, 150)}`
    ).join('\n');
    
    const toneInstructions = {
      professional: 'Use professional, formal language. Third person perspective. Clear and authoritative.',
      conversational: 'Use friendly, casual tone. Can use "I" and "you". Engaging and relatable.',
      academic: 'Use scholarly, formal language. Include proper citations. Evidence-based arguments.',
      creative: 'Use vivid, expressive language. Storytelling elements. Engaging narratives.'
    };
    
    const wordGoalText = wordGoal ? `TARGET WORD COUNT: Aim for approximately ${wordGoal} words (acceptable range: ${minWords}-${maxWords} words). IMPORTANT: As you approach ${wordGoal} words, plan to complete your current thought and end the sentence naturally. Quality and completeness are more important than hitting an exact number.` : '';
    
    const formatPrompts = {
      article: `Write a PROFESSIONAL ARTICLE about: "${userIntent}"

CRITICAL RULES:
1. DO NOT repeat the title "${title}" in the article content
2. ${wordGoalText}
3. NO asterisks (*), NO hash symbols (#), NO markdown formatting
4. Use <strong> tags for emphasis ONLY

Tone: ${toneInstructions[tone]}

Structure:
- Introduction (2-3 paragraphs)
- Main sections with natural flow
- Conclusion
${wordGoal ? `- Total: approximately ${wordGoal} words` : ''}

${referencesContext ? 'Sources:\n' + referencesContext : ''}

Write clearly. Use <strong> for key terms. NO symbols. Start writing:`,

      blog: `Write a CONVERSATIONAL BLOG POST about: "${userIntent}"

CRITICAL RULES:
1. DO NOT repeat the title "${title}"
2. ${wordGoalText}
3. NO asterisks (*), NO hash symbols (#), NO markdown
4. Use <strong> tags for emphasis ONLY

Tone: ${toneInstructions[tone]}

Style: Friendly, personal, conversational
${wordGoal ? `Length: approximately ${wordGoal} words` : ''}

${referencesContext ? 'Inspiration:\n' + referencesContext : ''}

Start writing:`,

      research: `Write a RESEARCH PAPER about: "${userIntent}"

CRITICAL RULES:
1. Start with Abstract (no title repetition)
2. ${wordGoalText}
3. NO asterisks (*), NO hash symbols (#)
4. Use <strong> for key concepts ONLY
5. Include citations [1], [2], [3] in ${state.citationStyle.toUpperCase()} format

Sections: Abstract, Introduction, Literature Review, Methodology, Findings, Discussion, Conclusion
${wordGoal ? `Total: approximately ${wordGoal} words across all sections` : ''}

Sources to cite:
${referencesContext}

Start with Abstract:`
    };
    
    const prompt = formatPrompts[format];
    const stream = state.aiSessions.prompt.promptStreaming(prompt);
    
    let fullText = '';
    let streamingContainer = document.createElement('div');
    streamingContainer.className = 'ai-generated-live';
    streamingContainer.style.cssText = 'font-size:17px;line-height:1.8;';
    
    editor.innerHTML = '';
    editor.appendChild(streamingContainer);
    
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    streamingContainer.appendChild(cursor);
    
    let currentWordCount = 0;
    
    for await (const chunk of stream) {
      fullText += chunk;
      const cleaned = cleanAIOutput(fullText);
      
      streamingContainer.innerHTML = formatContent(cleaned, format);
      streamingContainer.appendChild(cursor);
      
      currentWordCount = cleaned.split(/\s+/).filter(Boolean).length;
      liveWordCount.textContent = currentWordCount;
      liveWordCount.classList.add('updated');
      setTimeout(() => liveWordCount.classList.remove('updated'), 300);
      
      editor.scrollTop = editor.scrollHeight;
      
      // SMART WORD GOAL: Allow ±5% tolerance, prefer sentence completion
      if (wordGoal > 0) {
        // If we're in acceptable range AND at sentence end, stop
        if (currentWordCount >= minWords) {
          const lastChar = chunk.trim().slice(-1);
          if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
            console.log(`✅ Word goal reached naturally: ${currentWordCount}/${wordGoal} (range: ${minWords}-${maxWords})`);
            break;
          }
        }
        
        // If we exceed max tolerance, force stop at next sentence
        if (currentWordCount >= maxWords) {
          const lastChar = chunk.trim().slice(-1);
          if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
            console.log(`⚠️ Max tolerance reached, stopping: ${currentWordCount}/${wordGoal}`);
            break;
          }
          // Hard stop if exceeds max + 10 words (safety)
          if (currentWordCount >= maxWords + 10) {
            console.log(`🛑 Hard stop at ${currentWordCount} words (exceeded max tolerance)`);
            break;
          }
        }
      }
    }
    
    cursor.remove();
    
    editor.classList.add('generation-complete');
    setTimeout(() => editor.classList.remove('generation-complete'), 500);
    
    setTimeout(() => {
      progressBar.style.display = 'none';
      editorWrapper.classList.remove('streaming');
    }, 1000);
    
    generateBtn.classList.remove('generating');
    generateBtn.disabled = false;
    
    updateStats();
    updateWordGoal();
    await saveDocument();
    
    showToast('✅', 'Done!', `Generated ${currentWordCount} words`);
    
  } catch (error) {
    progressBar.style.display = 'none';
    generateBtn.classList.remove('generating');
    generateBtn.disabled = false;
    editorWrapper.classList.remove('streaming');
    showToast('❌', 'Failed', error.message);
  }
}

// ========================================
// CITATION FORMAT EXAMPLES
// ========================================

function getCitationExample(style) {
  const examples = {
    apa: 'Author, A. A. (Year). Title. Publisher. or (Author, Year)',
    mla: 'Author. "Title." Source, Year. or (Author Page#)',
    chicago: 'Author. Year. Title. Publisher. or (Author Year, Page)',
    harvard: 'Author (Year) Title. Publisher. or (Author Year: Page)'
  };
  return examples[style] || examples.apa;
}

// ========================================
// FORMAT CONTENT
// ========================================

function formatContent(text, format) {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map(p => {
    const trimmed = p.trim();
    const cleanText = trimmed.replace(/^##\s+/, '');
    
    if (format === 'research') {
      const sectionHeaders = ['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Findings', 'Results', 'Discussion', 'Conclusion'];
      const isHeader = sectionHeaders.some(header => cleanText.startsWith(header) && cleanText.length < 50);
      
      if (isHeader) {
        return `<h3 style="font-size:20px;font-weight:700;margin:24px 0 12px;color:#1a202c;">${cleanText}</h3>`;
      }
    }
    
    return `<p style="margin:16px 0;">${cleanText}</p>`;
  }).join('');
}

// ========================================
// NON-STREAMING GENERATION
// ========================================

async function generateWithoutStreaming(title, format, tone, userIntent) {
  const generateBtn = $('#generateArticleBtn');
  const editor = $('#editor');
  const overlay = $('#loadingOverlay');
  
  const wordGoalInput = $('#wordGoal');
  const wordGoal = wordGoalInput ? parseInt(wordGoalInput.value) || 0 : 0;
  
  overlay.classList.add('non-streaming');
  overlay.querySelector('.loading-text').textContent = 'AI is writing...';
  
  let subtextEl = overlay.querySelector('.loading-subtext');
  if (!subtextEl) {
    subtextEl = document.createElement('div');
    subtextEl.className = 'loading-subtext';
    overlay.querySelector('.loading-text').after(subtextEl);
  }
  subtextEl.textContent = wordGoal ? `Target: ${wordGoal} words` : 'This may take 10-30 seconds';
  
  overlay.style.display = 'flex';
  generateBtn.disabled = true;
  
  try {
    const referencesContext = state.sources.slice(0, 3).map((s, i) => 
      `[${i + 1}] ${s.title} - ${s.summary.slice(0, 150)}`
    ).join('\n');
    
    const wordGoalText = wordGoal ? `Write approximately ${wordGoal} words. Do not exceed ${Math.floor(wordGoal * 1.15)} words.` : '';
    
    const prompt = `Write a ${format} about "${userIntent}". ${wordGoalText} Title: "${title}". NO asterisks, NO hash symbols, NO markdown. Use <strong> for emphasis only. ${referencesContext ? 'Sources: ' + referencesContext : ''}`;
    
    const stream = state.aiSessions.prompt.promptStreaming(prompt);
    
    let fullText = '';
    let wordCount = 0;
    
    for await (const chunk of stream) {
      fullText += chunk;
      wordCount = cleanAIOutput(fullText).split(/\s+/).filter(Boolean).length;
      
      // Stop EXACTLY at word goal
      if (wordGoal > 0 && wordCount >= wordGoal) {
        break;
      }
    }
    
    const cleaned = cleanAIOutput(fullText);
    editor.innerHTML = formatContent(cleaned, format);
    
    overlay.style.display = 'none';
    overlay.classList.remove('non-streaming');
    generateBtn.disabled = false;
    
    updateStats();
    updateWordGoal();
    await saveDocument();
    
    showToast('✅', 'Done!', `${format} generated with ${wordCount} words`);
    
  } catch (error) {
    overlay.style.display = 'none';
    overlay.classList.remove('non-streaming');
    generateBtn.disabled = false;
    showToast('❌', 'Failed', error.message);
  }
}

// ========================================
// CONTINUE WRITING
// ========================================

async function continueWriting() {
  const editor = $('#editor');
  const selection = window.getSelection();
  
  if (!selection.rangeCount || !editor.contains(selection.anchorNode)) {
    showToast('⚠️', 'Click in Editor', 'Place cursor where you want to continue');
    return;
  }
  
  const range = selection.getRangeAt(0);
  const textBeforeCursor = getTextBeforeCursor(editor, range);
  
  if (textBeforeCursor.length < 50) {
    showToast('⚠️', 'Write More First', 'Need at least 50 characters');
    return;
  }

  const wordGoalInput = $('#wordGoal');
  const wordGoal = wordGoalInput ? parseInt(wordGoalInput.value) || 0 : 0;
  const currentWords = getEditorText().split(/\s+/).filter(Boolean).length;
  const wordsToGenerate = wordGoal > 0 ? Math.max(wordGoal - currentWords, 50) : 200;
  const minWords = wordGoal > 0 ? Math.floor(wordsToGenerate * 0.95) : wordsToGenerate;
  const maxWords = wordGoal > 0 ? Math.floor(wordsToGenerate * 1.05) : wordsToGenerate;

  const showStreaming = document.getElementById('showStreamingToggle')?.checked ?? true;
  const progressBar = $('#generationProgress');
  const liveWordCount = $('#liveWordCount');
  
  if (showStreaming) {
    progressBar.style.display = 'block';
    liveWordCount.textContent = '0';
  } else {
    showLoading('AI continuing...');
  }
  
  try {
    const context = textBeforeCursor.slice(-500);
    const tone = state.currentTone;
    
    const wordGoalText = wordGoal > 0 ? `Write approximately ${wordsToGenerate} words (range: ${minWords}-${maxWords}). As you approach this length, wrap up naturally.` : `Write approximately ${wordsToGenerate} words.`;
    
    const prompt = `Continue writing from here. ${wordGoalText} NO asterisks, NO hash symbols. Use <strong> for emphasis only:\n\n"${context}"\n\nContinue:`;
    
    const stream = state.aiSessions.prompt.promptStreaming(prompt);
    
    let newText = '';
    const container = document.createElement('span');
    container.style.cssText = 'font-size:17px;line-height:1.8;';
    container.className = 'ai-generated-live';
    
    range.deleteContents();
    range.insertNode(container);
    
    if (showStreaming) {
      const cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      container.appendChild(cursor);
      
      let wordCount = 0;
      
      for await (const chunk of stream) {
        newText += chunk;
        const cleaned = cleanAIOutput(newText);
        container.innerHTML = cleaned;
        container.appendChild(cursor);
        
        wordCount = cleaned.split(/\s+/).filter(Boolean).length;
        liveWordCount.textContent = wordCount;
        
        editor.scrollTop = editor.scrollHeight;
        
        // Smart stop with sentence completion
        if (wordGoal > 0) {
          if (wordCount >= minWords) {
            const lastChar = chunk.trim().slice(-1);
            if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
              break;
            }
          }
          if (wordCount >= maxWords + 10) {
            break;
          }
        } else if (wordCount >= wordsToGenerate) {
          break;
        }
      }
      
      cursor.remove();
      setTimeout(() => progressBar.style.display = 'none', 1000);
    } else {
      let wordCount = 0;
      
      for await (const chunk of stream) {
        newText += chunk;
        const cleaned = cleanAIOutput(newText);
        wordCount = cleaned.split(/\s+/).filter(Boolean).length;
        
        // Smart stop with sentence completion
        if (wordGoal > 0) {
          if (wordCount >= minWords) {
            const lastChar = chunk.trim().slice(-1);
            if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
              break;
            }
          }
          if (wordCount >= maxWords + 10) {
            break;
          }
        } else if (wordCount >= wordsToGenerate) {
          break;
        }
      }
      
      const cleaned = cleanAIOutput(newText);
      container.innerHTML = cleaned;
      hideLoading();
    }
    
    highlightChange(container);
    updateStats();
    updateWordGoal();
    await saveDocument();
    
    showToast('✅', 'Continued!', 'Added from cursor');
    
  } catch (error) {
    progressBar.style.display = 'none';
    hideLoading();
    showToast('❌', 'Failed', error.message);
  }
}

function getTextBeforeCursor(editor, range) {
  const tempRange = document.createRange();
  tempRange.selectNodeContents(editor);
  tempRange.setEnd(range.startContainer, range.startOffset);
  return tempRange.toString();
}

// ========================================
// TRANSFORM TEXT WITH REWRITER API
// ========================================

async function transformText(action) {
  if (state.showPreview) {
    showToast('⚠️', 'Edit Mode Only', 'Exit preview first');
    return;
  }
  
  const selection = window.getSelection();
  if (!selection.rangeCount) {
    showToast('⚠️', 'Select Text', 'Highlight text first');
    return;
  }
  
  const selectedText = selection.toString().trim();
  
  if (!selectedText || selectedText.length < 10) {
    showToast('⚠️', 'Select More Text', 'Highlight at least 10 characters');
    return;
  }

  $('#floatingToolbar').style.display = 'none';
  
  // Determine which API will ACTUALLY be used (honest messaging)
  let apiName = 'Prompt API'; // default for most actions
  if (state.aiSessions.rewriter && ['paraphrase', 'formal', 'casual'].includes(action)) {
    apiName = 'Rewriter API';
  }
  
  showLoading(`Applying ${action} with ${apiName}...`);
  
  try {
    let result;
    
    // Use Rewriter API if available
    if (state.aiSessions.rewriter && ['paraphrase', 'formal', 'casual'].includes(action)) {
      console.log('✨ Using Rewriter API for:', action);
      
      const contexts = {
        paraphrase: 'Rewrite this in different words while keeping the same meaning',
        formal: 'Make this very formal and professional',
        casual: 'Make this casual and conversational'
      };
      
      result = await state.aiSessions.rewriter.rewrite(selectedText, {
        context: contexts[action]
      });
      
    } else if (action === 'grammar' || action === 'proofread') {
      // Use Prompt API for grammar check
      console.log('📝 Using Prompt API for grammar check');
      
      const prompts = {
        grammar: `Fix any grammar errors in this text. Return ONLY the corrected text, no explanations:\n\n"${selectedText}"\n\nCorrected:`,
        proofread: `Proofread this text for grammar, spelling, and clarity. Return ONLY the improved text:\n\n"${selectedText}"\n\nProofread:`
      };
      
      result = await state.aiSessions.prompt.prompt(prompts[action]);
      
    } else {
      // Fallback to Prompt API
      console.log('📝 Using Prompt API for:', action);
      
      const prompts = {
        paraphrase: `Rewrite this in different words, same meaning:\n\n"${selectedText}"\n\nRewritten:`,
        expand: `Expand this with more detail (2-3x longer):\n\n"${selectedText}"\n\nExpanded:`,
        shorten: `Make this much shorter (50% length):\n\n"${selectedText}"\n\nShortened:`,
        formal: `Rewrite in formal, professional tone:\n\n"${selectedText}"\n\nFormal:`,
        casual: `Rewrite in casual, friendly tone:\n\n"${selectedText}"\n\nCasual:`
      };

      result = await state.aiSessions.prompt.prompt(prompts[action]);
    }
    
    const cleaned = cleanAIOutput(result);
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    const span = document.createElement('span');
    span.innerHTML = cleaned;
    span.className = 'ai-generated';
    span.style.cssText = 'background:rgba(102, 126, 234, 0.1);padding:2px 0;border-radius:3px;';
    
    range.insertNode(span);
    
    setTimeout(() => {
      span.style.background = 'transparent';
    }, 2000);
    
    hideLoading();
    updateStats();
    updateWordGoal();
    await saveDocument();
    
    showToast('✅', 'Updated!', `Text ${action}ed`);
    
  } catch (error) {
    hideLoading();
    showToast('❌', 'Failed', error.message);
  }
}

// ========================================
// FLOATING TOOLBAR
// ========================================

function showFloatingToolbar() {
  if (state.showPreview) {
    $('#floatingToolbar').style.display = 'none';
    return;
  }
  
  const toolbar = $('#floatingToolbar');
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text && text.length > 5) {
    try {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // Check if selection is inside the main editor
      const editor = $('#editor');
      const isInsideEditor = editor && (editor.contains(container) || editor === container);
      
      if (!isInsideEditor) {
        // Selection is outside editor (sidebar, etc.) - don't show toolbar
        toolbar.style.display = 'none';
        return;
      }
      
      const rect = range.getBoundingClientRect();
      
      toolbar.style.display = 'flex';
      toolbar.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
      toolbar.style.top = `${rect.top + window.scrollY - 60}px`;
    } catch (e) {
      toolbar.style.display = 'none';
    }
  } else {
    toolbar.style.display = 'none';
  }
}

// ========================================
// TRANSLATION WITH TRANSLATOR API
// ========================================

async function translateDocument(languageCode) {
  const content = getEditorText();
  const title = $('#articleTitle').value;
  
  if (!content && !title) {
    showToast('⚠️', 'Nothing to Translate', 'Write first');
    return;
  }
  
  const languages = {
    en: 'English',
    es: 'Spanish', 
    fr: 'French', 
    de: 'German', 
    zh: 'Chinese', 
    ja: 'Japanese', 
    ar: 'Arabic'
  };
  
  showLoading(`Translating to ${languages[languageCode]}...`);
  
  try {
    let translatedContent = '';
    let translatedTitle = '';
    
    // Use Translator API if available
    if (state.aiSessions.translator) {
      console.log('🌐 Using Translator API');
      
      translatedTitle = await state.aiSessions.translator.translate(title, {
        targetLanguage: languageCode
      });
      
      translatedContent = await state.aiSessions.translator.translate(content.slice(0, 5000), {
        targetLanguage: languageCode
      });
      
    } else {
      console.log('📝 Using Prompt API for translation');
      
      const prompt = `Translate the following text to ${languages[languageCode]}. Return ONLY the translated text with NO labels, NO "Title:", NO "Content:", NO asterisks, NO symbols. Just translate and return the text directly.

${title}

${content.slice(0, 3000)}`;
      
      const result = await state.aiSessions.prompt.prompt(prompt);
      const cleaned = cleanAIOutput(result);
      
      const lines = cleaned.split('\n').filter(l => l.trim());
      if (lines[0].length < 150) {
        translatedTitle = lines[0].trim();
        translatedContent = lines.slice(1).join('\n').trim();
      } else {
        translatedTitle = title;
        translatedContent = cleaned;
      }
    }
    
    $('#articleTitle').value = translatedTitle;
    $('#editor').innerText = translatedContent;
    highlightChange($('#editor'));
    
    hideLoading();
    updateStats();
    updateWordGoal();
    await saveDocument();
    
    showToast('✅', 'Translated!', `Now in ${languages[languageCode]}`);
    
  } catch (error) {
    hideLoading();
    showToast('❌', 'Translation Failed', error.message);
  }
}

// ========================================
// GENERATE CITATION
// ========================================

async function generateCitation(sourceIndex) {
  const source = state.sources[sourceIndex];
  if (!source) return;
  
  showLoading('Generating citation...');
  
  try {
    const citationNumber = state.citations.length + 1;
    
    // Parse author from source if available
    const author = source.author || 'Author Unknown';
    const year = new Date(source.capturedAt).getFullYear();
    const title = source.title;
    const url = source.url;
    
    let citation = '';
    
    switch (state.citationStyle) {
      case 'apa':
        citation = `[${citationNumber}] ${author}. (${year}). ${title}. Retrieved from ${url}`;
        break;
      case 'mla':
        citation = `[${citationNumber}] ${author}. "${title}." Web. ${year}. <${url}>.`;
        break;
      case 'chicago':
        citation = `[${citationNumber}] ${author}. "${title}." Accessed ${year}. ${url}.`;
        break;
      case 'harvard':
        citation = `[${citationNumber}] ${author} (${year}) ${title}. Available at: ${url}.`;
        break;
    }
    
    const citationObj = {
      number: citationNumber,
      sourceId: source.id,
      citation: citation,
      style: state.citationStyle
    };
    
    state.citations.push(citationObj);
    
    // Add citation to editor
    const editor = $('#editor');
    const citationDiv = document.createElement('div');
    citationDiv.className = 'citation-entry';
    citationDiv.style.cssText = 'margin:8px 0;padding:8px;background:#f7fafc;border-left:3px solid #667eea;font-size:14px;';
    citationDiv.innerHTML = citation;
    
    // Add to end of document
    editor.appendChild(citationDiv);
    editor.scrollTop = editor.scrollHeight;
    
    await saveDocument();
    hideLoading();
    
    showToast('✅', 'Citation Added!', `[${citationNumber}] in ${state.citationStyle.toUpperCase()} format`);
    
  } catch (error) {
    hideLoading();
    showToast('❌', 'Failed', error.message);
  }
}

// ========================================
// WRITING ANALYZER
// ========================================

async function analyzeWriting() {
  const content = getEditorText();
  
  if (!content || content.length < 100) {
    showToast('⚠️', 'Need More Content', 'Write at least 100 words to analyze');
    return;
  }
  
  if (!state.isAIReady) {
    showToast('⚠️', 'AI Not Ready', 'Wait for AI to initialize');
    return;
  }
  
  showLoading('Analyzing your writing...');
  
  try {
    const analysisPrompt = `Analyze this writing and provide specific suggestions for improvement. Focus on:

1. Grammar and spelling errors
2. Clarity and readability
3. Tone consistency
4. Structure and flow
5. Word choice improvements

Text to analyze:
${content.slice(0, 3000)}

Provide your analysis in this format:
**Grammar Issues:** [list specific fixes needed]
**Clarity:** [suggestions for clearer expression]
**Tone:** [tone assessment and suggestions]
**Structure:** [organization suggestions]
**Word Choice:** [vocabulary improvements]
**Overall Score:** [rate 1-10 with explanation]

Analysis:`;

    const analysis = await state.aiSessions.prompt.prompt(analysisPrompt);
    const cleaned = cleanAIOutput(analysis);
    
    const resultsDiv = $('#analysisResults');
    resultsDiv.innerHTML = cleaned.replace(/\n/g, '<br>');
    resultsDiv.style.display = 'block';
    
    hideLoading();
    showToast('✅', 'Analysis Complete!', 'Check the Writing Analysis section');
    
    // Auto-scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
  } catch (error) {
    hideLoading();
    showToast('❌', 'Analysis Failed', error.message);
  }
}

// ========================================
// QUICK SUGGESTIONS
// ========================================

async function getQuickSuggestions() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (!selectedText || selectedText.length < 20) {
    showToast('⚠️', 'Select Text', 'Highlight at least 20 characters');
    return;
  }
  
  showLoading('Getting suggestions...');
  
  try {
    const suggestionPrompt = `Provide 3 quick improvement suggestions for this text:

"${selectedText}"

Return in format:
1. [specific suggestion]
2. [specific suggestion]  
3. [specific suggestion]

Suggestions:`;

    const suggestions = await state.aiSessions.prompt.prompt(suggestionPrompt);
    const cleaned = cleanAIOutput(suggestions);
    
    // Show suggestions in a popup near the selection
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const popup = document.createElement('div');
    popup.id = 'suggestionsPopup';
    popup.className = 'suggestions-popup';
    
    // Calculate popup dimensions and position (zoom-aware)
    const popupMaxWidth = 350;
    const popupMaxHeight = 400;
    const margin = 10;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate left position (keep within viewport)
    let leftPosition = rect.left;
    if (leftPosition + popupMaxWidth > viewportWidth - margin) {
      leftPosition = viewportWidth - popupMaxWidth - margin;
    }
    if (leftPosition < margin) {
      leftPosition = margin;
    }
    
    // Calculate vertical position (show above if near bottom)
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    let topPosition;
    if (spaceBelow < popupMaxHeight + margin && spaceAbove > spaceBelow) {
      // Show above text
      topPosition = Math.max(margin, rect.top - popupMaxHeight - margin);
    } else {
      // Show below text
      topPosition = rect.bottom + margin;
    }
    
    // Keep within viewport
    topPosition = Math.max(margin, Math.min(topPosition, viewportHeight - popupMaxHeight - margin));
    
    popup.style.cssText = `
      position: fixed;
      left: ${leftPosition}px;
      top: ${topPosition}px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      max-width: ${popupMaxWidth}px;
      max-height: ${popupMaxHeight}px;
      overflow-y: auto;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      z-index: 10000;
      font-size: 13px;
      line-height: 1.5;
    `;
    
    // Add custom scrollbar styling
    const styleId = 'suggestions-scrollbar-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .suggestions-popup::-webkit-scrollbar {
          width: 6px;
        }
        .suggestions-popup::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .suggestions-popup::-webkit-scrollbar-thumb {
          background: #8b5cf6;
          border-radius: 3px;
        }
        .suggestions-popup::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }
      `;
      document.head.appendChild(style);
    }
    
    popup.innerHTML = `
      <div style="position:relative;">
        <button class="suggestions-close-btn" 
                style="position:absolute;top:-8px;right:-8px;width:28px;height:28px;border:none;background:#8b5cf6;color:white;border-radius:50%;cursor:pointer;font-size:18px;font-weight:bold;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(139,92,246,0.4);transition:all 0.2s;line-height:1;">
          ×
        </button>
        <div style="font-weight:700;margin-bottom:8px;color:#667eea;">💡 Writing Suggestions</div>
        ${cleaned.replace(/\n/g, '<br>')}
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Add click handler (CSP-compliant)
    const closeBtn = popup.querySelector('.suggestions-close-btn');
    closeBtn.addEventListener('click', () => popup.remove());
    
    // Add hover effects (CSP-compliant)
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = '#7c3aed';
      closeBtn.style.transform = 'scale(1.1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = '#8b5cf6';
      closeBtn.style.transform = 'scale(1)';
    });
    
    hideLoading();
    
  } catch (error) {
    hideLoading();
    showToast('❌', 'Failed', error.message);
  }
}

// ========================================
// USE SOURCE IN WRITING
// ========================================

async function useSourceInWriting(index) {
  const source = state.sources[index];
  const current = getEditorText();
  const format = $('#writingFormat').value;
  
  showLoading('Integrating source with AI...');
  
  try {
    let prompt = '';
    
    if (format === 'research') {
      prompt = `You are writing a research paper. Use this source to write 1-2 academic paragraphs.

Source: ${source.title}
Summary: ${source.summary}
Key Points: ${source.keyPoints ? source.keyPoints.join('; ') : 'None'}

Current context: ${current.slice(-300)}

Write 1-2 formal paragraphs referencing this source. Include citation [${state.sources.indexOf(source) + 1}] at the end. Use ${state.citationStyle.toUpperCase()} style. NO asterisks, NO symbols.

Paragraphs:`;
    } else if (format === 'blog') {
      prompt = `You are writing a blog post. Use insights from this source naturally.

Source: ${source.title}
Summary: ${source.summary}

Current context: ${current.slice(-300)}

Write 1-2 casual paragraphs mentioning this source conversationally. NO asterisks, NO symbols.

Paragraphs:`;
    } else {
      prompt = `You are writing an article. Reference this source to support your point.

Source: ${source.title}
Summary: ${source.summary}

Current context: ${current.slice(-300)}

Write 1-2 informative paragraphs incorporating insights from this source. NO asterisks, NO symbols.

Paragraphs:`;
    }
    
    const result = await state.aiSessions.prompt.prompt(prompt);
    const cleaned = cleanAIOutput(result);
    
    const editor = $('#editor');
    
    const sourceNumber = state.sources.indexOf(source) + 1;
    const sourceTag = `<span style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;margin-right:6px;" title="${escapeHtml(source.title)}">📄 Source ${sourceNumber}</span>`;
    
    const newContent = document.createElement('div');
    newContent.className = 'ai-generated-live';
    newContent.style.cssText = 'margin:16px 0;padding:12px;background:rgba(102,126,234,0.05);border-left:3px solid #667eea;border-radius:6px;';
    newContent.innerHTML = `${sourceTag}${cleaned}`;
    
    editor.appendChild(newContent);
    editor.scrollTop = editor.scrollHeight;
    
    highlightChange(newContent);
    hideLoading();
    updateStats();
    updateWordGoal();
    await saveDocument();
    
    showToast('✅', 'Source Added!', `Content from "${source.title.slice(0, 30)}..."`);
    
  } catch (error) {
    hideLoading();
    showToast('❌', 'Failed', error.message);
  }
}

// ========================================
// WORD GOAL TRACKER
// ========================================

function updateWordGoal() {
  const goalInput = $('#wordGoal');
  const goal = parseInt(goalInput?.value) || 0;
  
  if (goal <= 0) {
    $('#wordGoalText').textContent = 'No goal set';
    $('#wordGoalBar').style.width = '0%';
    return;
  }
  
  const currentWords = parseInt($('#wordCount')?.textContent) || 0;
  const percentage = Math.min((currentWords / goal) * 100, 100);
  
  $('#wordGoalBar').style.width = `${percentage}%`;
  
  if (currentWords >= goal) {
    $('#wordGoalText').textContent = `🎉 Goal reached! ${currentWords}/${goal} words`;
    $('#wordGoalText').style.color = '#10b981';
  } else {
    $('#wordGoalText').textContent = `${currentWords}/${goal} words (${Math.round(percentage)}%)`;
    $('#wordGoalText').style.color = '#6b7280';
  }
}

// ========================================
// PREVIEW MODE
// ========================================

function togglePreview() {
  state.showPreview = !state.showPreview;
  const previewBtn = $('#previewBtn');
  const editor = $('#editor');
  const titleInput = $('#articleTitle');
  
  if (state.showPreview) {
    originalContent = editor.innerHTML;
    
    previewBtn.textContent = '✏️ Edit';
    editor.innerHTML = generatePreviewHTML();
    editor.contentEditable = 'false';
    editor.style.background = '#f9fafb';
    titleInput.disabled = true;
  } else {
    previewBtn.textContent = '📄 Preview';
    editor.innerHTML = originalContent;
    editor.contentEditable = 'true';
    editor.style.background = 'white';
    titleInput.disabled = false;
  }
}

function generatePreviewHTML() {
  const title = $('#articleTitle').value || 'Untitled';
  const content = $('#editor').innerHTML || $('#editor').innerText;
  
  return `<div style="max-width:800px;margin:0 auto;padding:40px;">
    <h1 style="font-size:32px;font-weight:800;margin-bottom:24px;">${escapeHtml(title)}</h1>
    <div style="font-size:17px;line-height:1.8;color:#1a202c;">
      ${content}
    </div>
  </div>`;
}

// ========================================
// CHATBOT
// ========================================

async function sendChatMessage() {
  const input = $('#chatInput');
  const question = input.value.trim();
  
  if (!question || !state.isAIReady) return;

  addChatMessage('user', question);
  input.value = '';
  
  const thinkingId = Date.now();
  addChatMessage('assistant', '🤔 Thinking...', thinkingId);
  
  try {
    const context = getEditorText().slice(-2000);
    const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nRespond naturally. Use <strong> for emphasis. NO asterisks, NO symbols.\n\nAnswer:`;
    
    const answer = await state.aiSessions.prompt.prompt(prompt);
    const cleaned = cleanAIOutput(answer).replace(/\n/g, '<br>');
    
    updateChatMessage(thinkingId, cleaned, true);
  } catch (error) {
    updateChatMessage(thinkingId, '❌ Error', false);
  }
}

function addChatMessage(role, content, id = Date.now()) {
  const container = $('#chatMessages');
  
  // Remove welcome message if it exists
  const welcome = container.querySelector('.chat-welcome');
  if (welcome) welcome.remove();
  
  // Create message wrapper
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}`;
  messageDiv.dataset.id = id;
  
  // Create bubble
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  
  if (role === 'user') {
    bubble.textContent = content;
  } else {
    bubble.innerHTML = content;
  }
  
  messageDiv.appendChild(bubble);
  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;
}

function updateChatMessage(id, content, isHtml) {
  const msg = document.querySelector(`[data-id="${id}"]`);
  if (msg) {
    const bubble = msg.querySelector('.chat-bubble');
    if (bubble) {
      if (isHtml) bubble.innerHTML = content;
      else bubble.textContent = content;
    }
  }
}

// ========================================
// EXPORT - UPDATED (Copy to Clipboard, HTML, Word)
// ========================================

async function exportDocument(format) {
  const title = $('#articleTitle').value || 'Untitled';
  const content = $('#editor').innerHTML;
  const text = $('#editor').innerText;
  
  switch(format) {
    case 'clipboard':
      await copyToClipboard(text);
      break;
    case 'html':
      exportAsHTML(title, content);
      break;
    case 'docx':
      await exportAsWord(title, content);
      break;
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('✅', 'Copied!', 'Content copied to clipboard');
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      showToast('✅', 'Copied!', 'Content copied to clipboard');
    } catch (err) {
      showToast('❌', 'Failed', 'Could not copy to clipboard');
    }
    
    document.body.removeChild(textarea);
  }
}

function exportAsHTML(title, content) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      max-width: 800px;
      margin: 60px auto;
      padding: 40px;
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.8;
      color: #1a202c;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 24px;
    }
    h2 { font-size: 24px; margin: 20px 0 10px; }
    h3 { font-size: 20px; margin: 16px 0 8px; }
    p {
      margin: 16px 0;
      font-size: 17px;
    }
    strong {
      font-weight: 700;
      color: #2d3748;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${content}
</body>
</html>`;
  
  downloadFile(html, `${sanitizeFilename(title)}.html`, 'text/html');
  showToast('✅', 'Exported!', 'HTML file downloaded');
}

async function exportAsWord(title, content) {
  try {
    showLoading('Generating Word document...');
    
    // Create a basic Word document structure using HTML
    const wordHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
          }
          h1 {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 12pt;
          }
          h2 {
            font-size: 18pt;
            font-weight: bold;
            margin-top: 12pt;
            margin-bottom: 6pt;
          }
          h3 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 10pt;
            margin-bottom: 4pt;
          }
          p {
            margin-top: 0;
            margin-bottom: 10pt;
          }
          strong {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        ${content}
      </body>
      </html>
    `;
    
    // Convert to blob with proper Word MIME type
    const blob = new Blob(['\ufeff', wordHTML], {
      type: 'application/msword'
    });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFilename(title)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    hideLoading();
    showToast('✅', 'Exported!', 'Word document downloaded');
    
  } catch (error) {
    hideLoading();
    console.error('Word export error:', error);
    showToast('❌', 'Export Failed', 'Could not generate Word document');
  }
}

// ========================================
// STATS UPDATE
// ========================================

function updateStats() {
  const text = getEditorText();
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  $('#wordCount').textContent = words;
  $('#charCount').textContent = text.length;
}

function getEditorText() {
  return $('#editor')?.innerText || '';
}

// ========================================
// UI HELPERS
// ========================================

function highlightChange(element) {
  if (!element) return;
  const orig = element.style.background;
  element.style.background = 'linear-gradient(90deg, #fef3c7, #fde68a)';
  element.style.transition = 'background 0.5s';
  setTimeout(() => {
    element.style.background = orig;
    setTimeout(() => element.style.transition = '', 500);
  }, 2000);
}

function showLoading(text) {
  const overlay = $('#loadingOverlay');
  if (overlay) {
    overlay.querySelector('.loading-text').textContent = text;
    overlay.style.display = 'flex';
  }
}

function hideLoading() {
  const overlay = $('#loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}

function showToast(icon, title, message) {
  const toast = $('#toast');
  if (!toast) return;
  
  $('#toastIcon').textContent = icon;
  $('#toastTitle').textContent = title;
  $('#toastMessage').textContent = message;
  
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getTimeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 50);
}

// ========================================
// DOCUMENT MANAGEMENT - RENAME, DELETE, SAVE
// ========================================

function showModal(title, contentHTML, onConfirm) {
  const overlay = $('#modalOverlay');
  const modalHeader = $('#modalHeader');
  const modalContent = $('#modalContent');
  
  modalHeader.textContent = title;
  modalContent.innerHTML = contentHTML;
  overlay.classList.add('show');
  
  // Handle confirm button
  const confirmBtn = modalContent.querySelector('.modal-confirm');
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      const result = await onConfirm();
      if (result !== false) {
        hideModal();
      }
    };
  }
  
  // Handle cancel button
  const cancelBtn = modalContent.querySelector('.modal-cancel');
  if (cancelBtn) {
    cancelBtn.onclick = hideModal;
  }
  
  // Focus on input if exists
  const input = modalContent.querySelector('input');
  if (input) {
    setTimeout(() => input.focus(), 100);
    
    // Allow Enter key to confirm
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        confirmBtn?.click();
      } else if (e.key === 'Escape') {
        hideModal();
      }
    };
  }
  
  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      hideModal();
    }
  };
}

function hideModal() {
  const overlay = $('#modalOverlay');
  overlay.classList.remove('show');
}

async function renameDocument() {
  const currentName = state.currentDocName || 'Untitled Document';  // FIXED: Use document name
  
  showModal(
    '✏️ Rename Document',
    `
      <input 
        type="text" 
        class="modal-input" 
        id="renameInput" 
        value="${escapeHtml(currentName)}"
        placeholder="Enter new document name"
      />
      <div class="modal-actions">
        <button class="modal-btn cancel modal-cancel">Cancel</button>
        <button class="modal-btn primary modal-confirm">Rename</button>
      </div>
    `,
    async () => {
      const newName = $('#renameInput').value.trim();
      
      if (!newName) {
        showToast('⚠️', 'Invalid Name', 'Document name cannot be empty');
        return false;
      }
      
      if (newName === currentName) {
        return true;
      }
      
      try {
        // FIXED: Update document NAME (not article title!)
        state.currentDocName = newName;
        
        // Save document with new name
        await saveDocument();
        
        // Reload documents list
        await loadDocumentsList();
        
        showToast('✅', 'Renamed!', `Document renamed to "${newName}"`);
        return true;
        
      } catch (error) {
        console.error('Rename error:', error);
        showToast('❌', 'Error', 'Could not rename document');
        return false;
      }
    }
  );
}

async function deleteDocument() {
  const currentTitle = $('#articleTitle').value || 'Untitled';
  const docIdToDelete = state.currentDocId; // Store this BEFORE modal
  
  console.log('🗑️ DELETE INITIATED - Document ID:', docIdToDelete);
  console.log('📄 Document Title:', currentTitle);
  
  showModal(
    '🗑️ Delete Document',
    `
      <div class="modal-message">
        Are you sure you want to delete "<strong>${escapeHtml(currentTitle)}</strong>"?
        <br><br>
        This action cannot be undone.
      </div>
      <div class="modal-actions">
        <button class="modal-btn cancel modal-cancel">Cancel</button>
        <button class="modal-btn danger modal-confirm">Delete</button>
      </div>
    `,
    async () => {
      try {
        console.log('🔄 Starting deletion process...');
        
        // Get current documents from storage
        const storage = await chrome.storage.local.get(['documents']);
        let documents = storage.documents || [];
        
        console.log('📊 Documents BEFORE delete:', documents.length);
        console.log('📋 Document IDs BEFORE:', documents.map(d => d.id));
        
        // Filter out the document to delete
        const filteredDocuments = documents.filter(d => d.id !== docIdToDelete);
        
        console.log('📊 Documents AFTER filter:', filteredDocuments.length);
        console.log('📋 Document IDs AFTER:', filteredDocuments.map(d => d.id));
        
        // Save the filtered list back to storage
        await chrome.storage.local.set({ documents: filteredDocuments });
        
        console.log('✅ Storage updated successfully');
        
        // Verify the deletion
        const verifyStorage = await chrome.storage.local.get(['documents']);
        console.log('🔍 VERIFY - Documents in storage:', verifyStorage.documents?.length || 0);
        
        // Now switch to another document or create new
        if (filteredDocuments.length > 0) {
          // Switch to most recent document
          filteredDocuments.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          const nextDoc = filteredDocuments[0];
          
          console.log('➡️ Switching to document:', nextDoc.id, nextDoc.title);
          
          // Update current doc ID BEFORE switching
          state.currentDocId = nextDoc.id;
          await chrome.storage.local.set({ currentDocId: nextDoc.id });
          
          // Load the document content
          $('#articleTitle').value = nextDoc.title;
          $('#editor').innerHTML = nextDoc.content;
          $('#writingFormat').value = nextDoc.format || 'article';
          state.currentTone = nextDoc.tone || 'professional';
          state.citations = nextDoc.citations || [];
          
          // Update UI
          updateStats();
          updateWordGoal();
          
          // Reload the dropdown list
          await loadDocumentsList();
          
        } else {
          console.log('📝 No documents left - creating new one');
          // No documents left - create new document
          await createNewDocument();
        }
        
        showToast('🗑️', 'Deleted!', `"${currentTitle}" has been deleted`);
        
        return true;
        
      } catch (error) {
        console.error('❌ Delete error:', error);
        showToast('❌', 'Error', 'Could not delete document: ' + error.message);
        return false;
      }
    }
  );
}
async function manualSave() {
  const saveBtn = $('#saveDocBtn');
  const originalText = saveBtn?.textContent;
  
  try {
    if (saveBtn) {
      saveBtn.textContent = '⏳ Saving...';
      saveBtn.disabled = true;
    }
    
    await saveDocument();
    
    if (saveBtn) {
      saveBtn.textContent = '✅ Saved!';
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }, 2000);
    }
    
    showToast('✅', 'Saved!', 'Document saved successfully');
    
  } catch (error) {
    console.error('Manual save error:', error);
    
    if (saveBtn) {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
    
    showToast('❌', 'Save Failed', error.message);
  }
}

// ========================================
// EVENT LISTENERS - COMPLETE WITH DOCUMENT MANAGEMENT
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
  await initAI();
  await loadDocument();
  await loadSources();
  
  
  // Title and editor input handlers
  $('#articleTitle')?.addEventListener('input', () => {
    updateStats();
    updateWordGoal();
    updateDocumentTitle();
  });
  
  $('#editor')?.addEventListener('input', () => {
    updateStats();
    updateWordGoal();
  });
  
  // Document selector
  $('#documentSelector')?.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    if (selectedId !== state.currentDocId.toString()) {
      switchDocument(selectedId);
    }
  });
  
  // Document management buttons
  $('#renameDocBtn')?.addEventListener('click', renameDocument);
  $('#deleteDocBtn')?.addEventListener('click', deleteDocument);
  $('#saveDocBtn')?.addEventListener('click', manualSave);
  
  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      manualSave();
    }
  });
  
  // Generate buttons
  $('#generateTitleBtn')?.addEventListener('click', generateTitle);
  $('#generateArticleBtn')?.addEventListener('click', generateArticle);
  $('#continueBtn')?.addEventListener('click', continueWriting);
  
  // Writing analysis
  $('#analyzeWritingBtn')?.addEventListener('click', analyzeWriting);
  
  // Preview
  $('#previewBtn')?.addEventListener('click', togglePreview);
  
  // Translation
  $('#translateSelect')?.addEventListener('change', (e) => {
    const lang = e.target.value;
    if (lang) {
      translateDocument(lang);
      setTimeout(() => e.target.value = '', 100);
    }
  });
  
  // Export
  $('#exportSelect')?.addEventListener('change', (e) => {
    const format = e.target.value;
    if (format) {
      exportDocument(format);
      setTimeout(() => e.target.value = '', 100);
    }
  });
  
  // Format and style controls
  $('#writingFormat')?.addEventListener('change', (e) => {
    const format = e.target.value;
    const citationPanel = $('#citationPanel');
    if (citationPanel) {
      citationPanel.style.display = format === 'research' ? 'block' : 'none';
    }
  });
  
  $('#writingTone')?.addEventListener('change', (e) => {
    state.currentTone = e.target.value;
    showToast('✅', 'Tone Changed', `Now using ${e.target.value} tone`);
  });
  
  $('#citationFormat')?.addEventListener('change', (e) => {
    state.citationStyle = e.target.value;
    showToast('✅', 'Citation Style', `Now using ${e.target.value.toUpperCase()}`);
  });
  
  // Word goal
  $('#wordGoal')?.addEventListener('input', updateWordGoal);
  
  // Chat
  $('#chatSendBtn')?.addEventListener('click', sendChatMessage);
  $('#chatInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
  
  // Floating toolbar
  document.addEventListener('selectionchange', showFloatingToolbar);
  
  $$('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'suggest') {
        getQuickSuggestions();
      } else {
        transformText(action);
      }
      $('#floatingToolbar').style.display = 'none';
    });
  });
  
  console.log('✅ Parallel Editor loaded with ALL Chrome AI APIs and Document Management!');
});