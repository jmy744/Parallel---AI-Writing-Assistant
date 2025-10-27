// Parallel Service Worker

let isInitialized = false;
let sessions = {
  prompt: null,
  summarizer: null,
  writer: null,
  rewriter: null,
  translator: null
};

// ========================================
// AI INITIALIZATION (ALL APIs)
// ========================================

async function initAI() {
  if (isInitialized && sessions.prompt) {
    return { success: true };
  }
  
  try {
    console.log('🔍 Checking Chrome AI APIs...');
    
    // Prompt API
    if (typeof LanguageModel !== 'undefined') {
      const availability = await LanguageModel.availability();
      console.log('📊 Prompt API availability:', availability);

      if (availability !== "no") {
        console.log('🤖 Creating Prompt API session...');
        sessions.prompt = await LanguageModel.create({
          initialPrompts: [
            { 
              role: 'system', 
              content: 'You are Parallel, an offline research assistant. Be concise and helpful.' 
            }
          ],
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
          sessions.summarizer = await Summarizer.create();
          console.log('✅ Summarizer API ready');
        }
      } catch (e) {
        console.warn('⚠️ Summarizer API not available:', e);
      }
    }

    // Writer API
    if (typeof Writer !== 'undefined') {
      try {
        const writerAvail = await Writer.availability();
        if (writerAvail !== 'no') {
          sessions.writer = await Writer.create();
          console.log('✅ Writer API ready');
        }
      } catch (e) {
        console.warn('⚠️ Writer API not available:', e);
      }
    }

    // Rewriter API
    if (typeof Rewriter !== 'undefined') {
      try {
        const rewriterAvail = await Rewriter.availability();
        if (rewriterAvail !== 'no') {
          sessions.rewriter = await Rewriter.create();
          console.log('✅ Rewriter API ready');
        }
      } catch (e) {
        console.warn('⚠️ Rewriter API not available:', e);
      }
    }

    // Translator API
    if (typeof Translator !== 'undefined') {
      try {
        const translatorAvail = await Translator.availability();
        if (translatorAvail !== 'no') {
          sessions.translator = await Translator.create();
          console.log('✅ Translator API ready');
        }
      } catch (e) {
        console.warn('⚠️ Translator API not available:', e);
      }
    }

    isInitialized = true;
    console.log('✅ AI initialized successfully');
    console.log('📊 Available APIs:', {
      prompt: !!sessions.prompt,
      summarizer: !!sessions.summarizer,
      writer: !!sessions.writer,
      rewriter: !!sessions.rewriter,
      translator: !!sessions.translator
    });

    return { 
      success: true,
      apis: {
        prompt: !!sessions.prompt,
        summarizer: !!sessions.summarizer,
        writer: !!sessions.writer,
        rewriter: !!sessions.rewriter,
        translator: !!sessions.translator
      }
    };
    
  } catch (error) {
    console.error("❌ AI init error:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

async function getSession(type = 'prompt') {
  if (!isInitialized || !sessions[type]) {
    await initAI();
  }
  return sessions[type];
}

// ========================================
// STORAGE HELPERS
// ========================================

async function getAllStorage() {
  return await chrome.storage.local.get({
    sources: [],
    researchGoal: '',
    documents: [],
    currentDocId: null
  });
}

async function setStorage(obj) {
  return await chrome.storage.local.set(obj);
}

async function addSource(source) {
  const data = await getAllStorage();
  data.sources.push(source);
  await setStorage({ sources: data.sources });
  return source;
}

// ========================================
// ANALYZE PAGE (with Summarizer API)
// ========================================

async function analyzePage(data) {
  try {
    console.log('📄 Analyzing:', data.title);
    
    const { url, title, content, type, researchGoal } = data;
    
    let summary = '';
    let keyPoints = [];

    // Try Summarizer API first
    const summarizerSession = await getSession('summarizer');
    
    if (summarizerSession) {
      try {
        console.log('📝 Using Summarizer API...');
        summary = await summarizerSession.summarize(content.slice(0, 4000));
        summary = summary.trim();  // FIXED: No character limit
        console.log('✅ Summary created with Summarizer API');
      } catch (e) {
        console.warn('⚠️ Summarizer failed, using Prompt API:', e);
        const promptSession = await getSession('prompt');
        if (promptSession) {
          const summaryPrompt = `Summarize this in 2-3 sentences:\n\n${content.slice(0, 3000)}`;
          summary = await promptSession.prompt(summaryPrompt);
          summary = summary.trim();  // FIXED: No character limit
        }
      }
    } else {
      // Fallback to Prompt API
      const promptSession = await getSession('prompt');
      if (promptSession) {
        const summaryPrompt = `Summarize this in 2-3 sentences:\n\n${content.slice(0, 3000)}`;
        summary = await promptSession.prompt(summaryPrompt);
        summary = summary.trim();  // FIXED: No character limit
      }
    }

    // Extract key points with Writer API
    const writerSession = await getSession('writer');
    if (writerSession) {
      try {
        const pointsPrompt = `Extract 3-5 key points from this text as a JSON array:\n\n${content.slice(0, 3500)}`;
        const pointsRaw = await writerSession.write(pointsPrompt);
        const jsonMatch = pointsRaw.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          keyPoints = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('Key points extraction failed:', e);
      }
    }

    // Fallback summary
    if (!summary) {
      summary = content.slice(0, 200) + '...';
    }

    // Create source object
    const source = {
      id: Date.now(),
      url,
      title,
      type,
      summary,
      keyPoints: Array.isArray(keyPoints) ? keyPoints.slice(0, 5) : [],
      capturedAt: new Date().toISOString()
    };

    // Check relevance if goal is set
    if (researchGoal) {
      try {
        const relevanceResult = await checkRelevance({
          goal: researchGoal,
          source
        });
        if (relevanceResult.success) {
          source.relevance = relevanceResult.relevance;
        }
      } catch (e) {
        source.relevance = simpleRelevanceCheck(title, summary, researchGoal);
      }
    }

    await addSource(source);
    console.log('✅ Page analyzed and saved');

    return { success: true, source };
    
  } catch (error) {
    console.error('❌ analyzePage error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// ========================================
// CHECK RELEVANCE
// ========================================

async function checkRelevance(data) {
  const { goal, source } = data;
  
  try {
    const session = await getSession('prompt');
    
    const prompt = `Research Goal: "${goal}"

Source Title: ${source.title}
Source Summary: ${source.summary}

Is this source relevant to the research goal?

Respond with ONLY a JSON object (no markdown, no other text):
{"score": "high", "reason": "brief explanation"}

Scores: "high" = directly relevant, "medium" = somewhat relevant, "low" = not relevant

JSON:`;

    const response = await session.prompt(prompt);
    
    const jsonMatch = response.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (['high', 'medium', 'low'].includes(parsed.score)) {
        return { 
          success: true, 
          relevance: { 
            score: parsed.score, 
            reason: (parsed.reason || '').slice(0, 50) 
          } 
        };
      }
    }
    
    throw new Error('Could not parse AI response');
    
  } catch (error) {
    return { 
      success: true, 
      relevance: simpleRelevanceCheck(source.title, source.summary, goal)
    };
  }
}

function simpleRelevanceCheck(title, summary, goal) {
  if (!goal) return { score: 'unknown', reason: 'No research goal set' };
  
  const goalWords = goal.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const sourceText = `${title} ${summary}`.toLowerCase();
  const matches = goalWords.filter(word => sourceText.includes(word)).length;
  const matchPercent = goalWords.length > 0 ? (matches / goalWords.length) * 100 : 0;
  
  if (matchPercent >= 60) {
    return { score: 'high', reason: `${matches}/${goalWords.length} key terms match` };
  } else if (matchPercent >= 30) {
    return { score: 'medium', reason: `${matches}/${goalWords.length} terms match` };
  } else {
    return { score: 'low', reason: `Only ${matches}/${goalWords.length} terms match` };
  }
}

// ========================================
// SUMMARIZE SOURCE
// ========================================

async function summarizeSource(data) {
  const { sourceId } = data;
  
  try {
    const storage = await getAllStorage();
    const source = storage.sources.find(s => s.id === sourceId);
    
    if (!source) {
      return { success: false, error: 'Source not found' };
    }

    // Use Summarizer API
    const summarizerSession = await getSession('summarizer');
    
    if (summarizerSession) {
      const summary = await summarizerSession.summarize(source.summary);
      return { success: true, summary };
    } else {
      return { success: false, error: 'Summarizer API not available' };
    }
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ========================================
// MESSAGE ROUTER
// ========================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      console.log('📨 Received:', request.action);
      
      switch (request.action) {
        case "checkAI":
          return sendResponse(await initAI());
          
        case "analyzePage":
          return sendResponse(await analyzePage(request.payload));
          
        case "checkRelevance":
          return sendResponse(await checkRelevance(request.payload));
          
        case "summarizeSource":
          return sendResponse(await summarizeSource(request.payload));
          
        default:
          return sendResponse({ 
            success: false, 
            error: "Unknown action: " + request.action 
          });
      }
      
    } catch (error) {
      console.error('❌ Message handler error:', error);
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    }
  })();
  
  return true;
});

// ========================================
// KEEP-ALIVE
// ========================================

setInterval(() => {
  chrome.storage.local.get("keepAlive");
}, 20000);

console.log("✅ Parallel service worker loaded (Chrome 138+ API)!");
