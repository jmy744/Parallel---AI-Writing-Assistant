
// Extracts text content from any webpage reliably

console.log('🔧 Parallel content script loaded');

// ========================================
// SMART TEXT EXTRACTION
// ========================================

function extractMainText() {
  try {
    console.log('📄 Starting text extraction...');
    
    // Strategy 1: Try article/main content areas
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.main-content',
      '.content',
      '#content',
      '.story-body',
      '.article-body',
      '.post-body',
      '.entry',
      '[itemprop="articleBody"]'
    ];
    
    let contentElement = null;
    
    // Find first matching element with substantial content
    for (const selector of contentSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        const text = el.innerText || el.textContent || '';
        if (text.length > 200) {
          contentElement = el;
          console.log('✅ Found content in:', selector, '(' + text.length + ' chars)');
          break;
        }
      }
    }
    
    // Strategy 2: If no content area found, use body but be smart about it
    if (!contentElement) {
      contentElement = document.body;
      console.log('⚠️ Using body as fallback');
    }
    
    // Clone to avoid modifying the actual page
    const clone = contentElement.cloneNode(true);
    
    // Remove unwanted elements
    const unwantedSelectors = [
      'script',
      'style',
      'nav',
      'aside',
      'footer',
      'header',
      'iframe',
      'noscript',
      'svg',
      '.sidebar',
      '.comments',
      '.comment',
      '.advertisement',
      '.ad',
      '.ads',
      '[class*="social"]',
      '[class*="share"]',
      '[class*="cookie"]',
      '[class*="newsletter"]',
      '[class*="popup"]',
      '[class*="modal"]',
      '[id*="cookie"]',
      '[id*="banner"]'
    ];
    
    unwantedSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Get clean text
    let text = clone.innerText || clone.textContent || '';
    
    // Clean up whitespace
    text = text
      .replace(/\s+\n/g, '\n')           // Remove trailing spaces before newlines
      .replace(/\n{3,}/g, '\n\n')        // Max 2 consecutive newlines
      .replace(/[ \t]{2,}/g, ' ')        // Multiple spaces to single space
      .replace(/^\s+|\s+$/gm, '')        // Trim each line
      .trim();
    
    // Validate
    if (!text || text.length < 50) {
      console.warn('⚠️ Extracted text too short, trying body fallback');
      text = document.body.innerText || document.body.textContent || '';
      text = text.slice(0, 10000); // Limit to prevent too much data
    }
    
    console.log('✅ Extracted', text.length, 'characters');
    return text;
    
  } catch (error) {
    console.error('❌ Extraction error:', error);
    
    // Last resort: just grab all visible text
    try {
      const bodyText = document.body.innerText || document.body.textContent || '';
      return bodyText.slice(0, 10000) || 'Could not extract content';
    } catch (finalError) {
      return 'Error: Could not extract page content';
    }
  }
}

// ========================================
// GET PAGE METADATA
// ========================================

function getPageMetadata() {
  try {
    // Try to get better title
    const title = 
      document.querySelector('h1')?.innerText ||
      document.querySelector('.title')?.innerText ||
      document.querySelector('.headline')?.innerText ||
      document.querySelector('[class*="headline"]')?.innerText ||
      document.querySelector('meta[property="og:title"]')?.content ||
      document.title ||
      'Untitled Page';
    
    // Try to get description
    const description = 
      document.querySelector('meta[name="description"]')?.content ||
      document.querySelector('meta[property="og:description"]')?.content ||
      document.querySelector('meta[name="twitter:description"]')?.content ||
      '';
    
    // Try to get author
    const author = 
      document.querySelector('meta[name="author"]')?.content ||
      document.querySelector('[rel="author"]')?.innerText ||
      document.querySelector('.author')?.innerText ||
      document.querySelector('[class*="author"]')?.innerText ||
      '';
    
    // Try to get published date
    const published = 
      document.querySelector('meta[property="article:published_time"]')?.content ||
      document.querySelector('time')?.getAttribute('datetime') ||
      document.querySelector('.date')?.innerText ||
      document.querySelector('[class*="date"]')?.innerText ||
      '';
    
    return {
      title: title.trim().slice(0, 200),
      description: description.slice(0, 300),
      author: author.slice(0, 100),
      published: published
    };
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return {
      title: document.title || 'Untitled',
      description: '',
      author: '',
      published: ''
    };
  }
}

// ========================================
// MESSAGE LISTENER
// ========================================

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('📨 Received message:', msg?.type);
  
  // Handle ping (for checking if script is loaded)
  if (msg?.type === 'ping') {
    sendResponse({ status: 'alive' });
    return true;
  }
  
  // Handle content extraction
  if (msg?.type === 'parallel:getPageContent') {
    try {
      console.log('🔍 Extracting page content...');
      
      const content = extractMainText();
      const metadata = getPageMetadata();
      
      const response = {
        url: location.href,
        title: metadata.title,
        content: content,
        description: metadata.description,
        author: metadata.author,
        published: metadata.published,
        type: 'webpage',
        extractedAt: new Date().toISOString()
      };
      
      console.log('✅ Sending response:', {
        title: response.title,
        contentLength: response.content.length,
        hasDescription: !!response.description
      });
      
      sendResponse(response);
      
    } catch (error) {
      console.error('❌ Content extraction failed:', error);
      
      // Send minimal response even on error
      sendResponse({
        url: location.href,
        title: document.title || 'Untitled',
        content: 'Content extraction encountered an error. Page structure may not be supported.',
        type: 'webpage',
        error: error.message
      });
    }
  }
  
  return true; 
});

// ========================================
// INITIALIZATION
// ========================================

console.log('✅ Parallel content script ready on:', location.href);
