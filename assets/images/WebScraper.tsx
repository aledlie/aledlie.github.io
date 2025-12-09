import React, { useState, useEffect } from 'react';
import { Search, Globe, Download, ExternalLink, Image, FileText, Link, AlertCircle, CheckCircle, Loader2, Filter, RefreshCw, Shield, Clock } from 'lucide-react';

interface ScrapedData {
  title: string;
  description: string;
  links: Array<{ text: string; url: string }>;
  images: Array<{ src: string; alt: string }>;
  text: string[];
  metadata: Record<string, string>;
  status: {
    success: boolean;
    statusCode?: number;
    contentLength?: number;
    contentType?: string;
    responseTime?: number;
    proxyUsed?: string;
  };
}

interface ScrapeOptions {
  includeText: boolean;
  includeLinks: boolean;
  includeImages: boolean;
  includeMetadata: boolean;
  maxLinks: number;
  maxImages: number;
  maxTextElements: number;
  timeout: number;
  retryAttempts: number;
}

const WebScraper: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [options, setOptions] = useState<ScrapeOptions>({
    includeText: true,
    includeLinks: true,
    includeImages: true,
    includeMetadata: true,
    maxLinks: 100,
    maxImages: 50,
    maxTextElements: 200,
    timeout: 30000,
    retryAttempts: 3,
  });
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'links' | 'images' | 'metadata'>('text');
  const [scrapingProgress, setScrapingProgress] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const normalizeUrl = (inputUrl: string): string => {
    let normalized = inputUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    return normalized;
  };

  const makeAbsoluteUrl = (relativeUrl: string, baseUrl: string): string => {
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return relativeUrl;
    }
  };

  const cleanText = (text: string): string => {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Remove non-printable characters
      .trim();
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const scrapeWebsite = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    
    if (!validateUrl(normalizedUrl)) {
      setError('Please enter a valid URL (must include http:// or https://)');
      return;
    }

    setIsLoading(true);
    setError('');
    setScrapedData(null);
    setScrapingProgress('Initializing...');

    const startTime = Date.now();

    try {
      // Enhanced proxy services with better reliability
      const proxyServices = [
        {
          name: 'AllOrigins',
          url: `https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        },
        {
          name: 'CORS Proxy',
          url: `https://corsproxy.io/?${encodeURIComponent(normalizedUrl)}`,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache'
          }
        },
        {
          name: 'Proxy6',
          url: `https://proxy6.workers.dev/?url=${encodeURIComponent(normalizedUrl)}`,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        },
        {
          name: 'ThingProxy',
          url: `https://thingproxy.freeboard.io/fetch/${normalizedUrl}`,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }
      ];

      let response: Response | null = null;
      let responseData: any = null;
      let lastError: Error | null = null;
      let proxyUsed = '';

      // Try each proxy service with retry logic
      for (let proxyIndex = 0; proxyIndex < proxyServices.length; proxyIndex++) {
        const proxy = proxyServices[proxyIndex];
        setScrapingProgress(`Trying ${proxy.name} proxy...`);

        for (let attempt = 1; attempt <= options.retryAttempts; attempt++) {
          try {
            console.log(`Attempt ${attempt}/${options.retryAttempts} with ${proxy.name}: ${proxy.url}`);
            
            const fetchResponse = await fetchWithTimeout(proxy.url, {
              method: 'GET',
              headers: proxy.headers,
              mode: 'cors',
              credentials: 'omit',
              redirect: 'follow'
            }, options.timeout);

            if (!fetchResponse.ok) {
              throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
            }

            response = fetchResponse;
            proxyUsed = proxy.name;
            
            // Handle different proxy response formats
            if (proxy.name === 'AllOrigins') {
              const jsonData = await fetchResponse.json();
              if (jsonData.status && jsonData.status.http_code && jsonData.status.http_code !== 200) {
                throw new Error(`Target server returned HTTP ${jsonData.status.http_code}`);
              }
              responseData = jsonData.contents || jsonData.data || jsonData;
            } else {
              responseData = await fetchResponse.text();
            }
            
            // Validate response data
            if (!responseData || (typeof responseData === 'string' && responseData.trim().length === 0)) {
              throw new Error('Empty response received');
            }

            // Check if response looks like HTML
            const htmlCheck = typeof responseData === 'string' ? responseData.trim().toLowerCase() : '';
            if (!htmlCheck.includes('<html') && !htmlCheck.includes('<!doctype') && !htmlCheck.includes('<head')) {
              // Try to parse as JSON in case it's wrapped
              try {
                const parsed = JSON.parse(responseData);
                if (parsed.contents || parsed.data) {
                  responseData = parsed.contents || parsed.data;
                }
              } catch {
                // If it's not JSON and doesn't look like HTML, it might still be valid content
                if (htmlCheck.length < 100) {
                  throw new Error('Response does not appear to contain valid HTML content');
                }
              }
            }
            
            break; // Success, exit retry loop
          } catch (err) {
            console.warn(`${proxy.name} attempt ${attempt} failed:`, err);
            lastError = err instanceof Error ? err : new Error('Unknown error');
            
            if (attempt < options.retryAttempts) {
              setScrapingProgress(`${proxy.name} failed, retrying in ${attempt}s...`);
              await sleep(attempt * 1000); // Progressive delay
            }
          }
        }

        if (response && responseData) {
          break; // Success, exit proxy loop
        }
      }

      if (!response || !responseData) {
        throw new Error(`All proxy services failed after ${options.retryAttempts} attempts each. ${lastError?.message || 'The website might be blocking requests or temporarily unavailable.'}`);
      }

      setScrapingProgress('Parsing HTML content...');

      // Parse the HTML content with enhanced error handling
      const parser = new DOMParser();
      let doc: Document;
      
      try {
        // Clean the HTML before parsing
        let cleanHtml = typeof responseData === 'string' ? responseData : String(responseData);
        
        // Remove problematic elements that might cause parsing issues
        cleanHtml = cleanHtml
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
          .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
          .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, ''); // Remove CDATA sections

        doc = parser.parseFromString(cleanHtml, 'text/html');
        
        // Check if parsing was successful
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
          console.warn('Parser error detected, attempting alternative parsing...');
          // Try parsing as XML
          doc = parser.parseFromString(cleanHtml, 'application/xml');
          const xmlParserError = doc.querySelector('parsererror');
          if (xmlParserError) {
            throw new Error('Failed to parse HTML content - invalid markup detected');
          }
        }
      } catch (parseError) {
        console.error('HTML parsing error:', parseError);
        throw new Error('The webpage content could not be parsed. It might contain invalid HTML or be corrupted.');
      }

      setScrapingProgress('Extracting content...');

      // Extract data based on options
      const extractedData: ScrapedData = {
        title: '',
        description: '',
        links: [],
        images: [],
        text: [],
        metadata: {},
        status: {
          success: true,
          statusCode: response.status,
          contentType: response.headers.get('content-type') || 'unknown',
          responseTime: Date.now() - startTime,
          proxyUsed
        }
      };

      // Extract title with multiple fallbacks
      const titleSelectors = [
        'title',
        'h1',
        '[property="og:title"]',
        '[name="twitter:title"]',
        '.title',
        '#title',
        'header h1',
        'article h1'
      ];

      for (const selector of titleSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          const titleText = (element.textContent || element.getAttribute('content') || '').trim();
          if (titleText && titleText.length > 0) {
            extractedData.title = cleanText(titleText);
            break;
          }
        }
      }

      if (!extractedData.title) {
        extractedData.title = 'No title found';
      }

      // Extract description with multiple fallbacks
      const descriptionSelectors = [
        'meta[name="description"]',
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
        '.description',
        '#description',
        'article p:first-of-type',
        '.summary',
        '.excerpt'
      ];

      for (const selector of descriptionSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          const descText = (element.getAttribute('content') || element.textContent || '').trim();
          if (descText && descText.length > 0) {
            extractedData.description = cleanText(descText);
            break;
          }
        }
      }

      if (!extractedData.description) {
        extractedData.description = 'No description found';
      }

      if (options.includeLinks) {
        try {
          const linkElements = Array.from(doc.querySelectorAll('a[href]'));
          const processedLinks = new Set<string>();
          
          extractedData.links = linkElements
            .slice(0, options.maxLinks * 2) // Get more initially to account for filtering
            .map(link => {
              const href = (link.getAttribute('href') || '').trim();
              const text = cleanText(link.textContent || link.getAttribute('title') || link.getAttribute('aria-label') || '');
              
              if (!href) return null;
              
              const absoluteUrl = makeAbsoluteUrl(href, normalizedUrl);
              return { text: text || 'Link', url: absoluteUrl };
            })
            .filter((link): link is { text: string; url: string } => {
              if (!link || !link.url || link.url === normalizedUrl || processedLinks.has(link.url)) {
                return false;
              }
              
              // Filter out unwanted link types
              const url = link.url.toLowerCase();
              if (url.startsWith('javascript:') || 
                  url.startsWith('mailto:') || 
                  url.startsWith('tel:') ||
                  url.startsWith('#') ||
                  url.includes('void(0)')) {
                return false;
              }
              
              processedLinks.add(link.url);
              return link.text.length > 0 && link.text.length < 200;
            })
            .slice(0, options.maxLinks);
        } catch (linkError) {
          console.warn('Error extracting links:', linkError);
        }
      }

      if (options.includeImages) {
        try {
          const imageSelectors = ['img[src]', 'img[data-src]', 'img[data-lazy-src]', '[style*="background-image"]'];
          const imageElements = Array.from(doc.querySelectorAll(imageSelectors.join(', ')));
          const processedImages = new Set<string>();
          
          extractedData.images = imageElements
            .slice(0, options.maxImages * 2)
            .map(img => {
              let src = '';
              let alt = '';
              
              if (img.tagName.toLowerCase() === 'img') {
                src = img.getAttribute('src') || 
                      img.getAttribute('data-src') || 
                      img.getAttribute('data-lazy-src') || '';
                alt = cleanText(img.getAttribute('alt') || img.getAttribute('title') || '');
              } else {
                // Handle background images
                const style = img.getAttribute('style') || '';
                const bgMatch = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
                if (bgMatch) {
                  src = bgMatch[1];
                  alt = cleanText(img.getAttribute('aria-label') || img.getAttribute('title') || '');
                }
              }
              
              if (!src) return null;
              
              const absoluteSrc = makeAbsoluteUrl(src, normalizedUrl);
              return { src: absoluteSrc, alt: alt || 'Image' };
            })
            .filter((img): img is { src: string; alt: string } => {
              if (!img || !img.src || img.src.startsWith('data:') || processedImages.has(img.src)) {
                return false;
              }
              
              // Filter out tracking pixels and tiny images
              const url = img.src.toLowerCase();
              if (url.includes('1x1') || 
                  url.includes('pixel') || 
                  url.includes('tracking') ||
                  url.includes('analytics')) {
                return false;
              }
              
              processedImages.add(img.src);
              return true;
            })
            .slice(0, options.maxImages);
        } catch (imageError) {
          console.warn('Error extracting images:', imageError);
        }
      }

      if (options.includeText) {
        try {
          // Enhanced text extraction with better selectors
          const textSelectors = [
            'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'article', 'section', 'main',
            '.content', '.text', '.description', '.summary',
            'li', 'blockquote', 'pre', 'code',
            'td', 'th', 'caption',
            '.post', '.entry', '.article-content'
          ];
          
          const textElements = Array.from(doc.querySelectorAll(textSelectors.join(', ')));
          const processedTexts = new Set<string>();
          
          extractedData.text = textElements
            .slice(0, options.maxTextElements * 2)
            .map(el => {
              // Skip elements that are likely navigation or UI
              const classList = Array.from(el.classList);
              const skipClasses = ['nav', 'menu', 'header', 'footer', 'sidebar', 'ad', 'advertisement', 'cookie', 'popup'];
              if (skipClasses.some(skipClass => classList.some(cls => cls.toLowerCase().includes(skipClass)))) {
                return '';
              }
              
              return cleanText(el.textContent || '');
            })
            .filter(text => {
              if (text.length < 15 || text.length > 1000 || processedTexts.has(text)) {
                return false;
              }
              
              // Skip common UI text patterns
              const lowerText = text.toLowerCase();
              const skipPatterns = [
                /^(menu|nav|footer|header|sidebar|skip to|click here|read more|learn more|home|about|contact|privacy|terms)$/i,
                /^(loading|please wait|error|404|not found)$/i,
                /^[\d\s\-\.\,\(\)]+$/, // Only numbers and punctuation
                /^[^\w]*$/ // Only non-word characters
              ];
              
              if (skipPatterns.some(pattern => pattern.test(text))) {
                return false;
              }
              
              processedTexts.add(text);
              return true;
            })
            .slice(0, options.maxTextElements);
        } catch (textError) {
          console.warn('Error extracting text:', textError);
        }
      }

      if (options.includeMetadata) {
        try {
          const metaSelectors = [
            'meta[name]',
            'meta[property]',
            'meta[http-equiv]',
            'link[rel="canonical"]',
            'link[rel="alternate"]',
            'link[rel="icon"]'
          ];
          
          const metaElements = Array.from(doc.querySelectorAll(metaSelectors.join(', ')));
          
          metaElements.forEach(meta => {
            const name = meta.getAttribute('name') || 
                        meta.getAttribute('property') || 
                        meta.getAttribute('http-equiv') ||
                        meta.getAttribute('rel');
            const content = meta.getAttribute('content') || 
                          meta.getAttribute('href');
            
            if (name && content && content.trim().length > 0) {
              extractedData.metadata[name] = cleanText(content);
            }
          });

          // Add additional useful metadata
          extractedData.metadata['scraped-url'] = normalizedUrl;
          extractedData.metadata['scraped-date'] = new Date().toISOString();
          extractedData.metadata['content-length'] = (typeof responseData === 'string' ? responseData.length : 0).toString();
          extractedData.metadata['proxy-used'] = proxyUsed;
          extractedData.metadata['response-time'] = `${Date.now() - startTime}ms`;
          
          // Extract additional page info
          const lang = doc.documentElement.getAttribute('lang');
          if (lang) extractedData.metadata['language'] = lang;
          
          const charset = doc.querySelector('meta[charset]')?.getAttribute('charset');
          if (charset) extractedData.metadata['charset'] = charset;
          
        } catch (metaError) {
          console.warn('Error extracting metadata:', metaError);
        }
      }

      setScrapingProgress('Finalizing results...');
      setScrapedData(extractedData);
      setUrl(normalizedUrl);

    } catch (err) {
      console.error('Scraping error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while scraping';
      setError(`Failed to scrape website: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setScrapingProgress('');
    }
  };

  const exportData = () => {
    if (!scrapedData) return;

    const exportData = {
      ...scrapedData,
      exportedAt: new Date().toISOString(),
      originalUrl: url,
      scrapingOptions: options
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `scraped-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const filteredData = scrapedData ? {
    ...scrapedData,
    links: scrapedData.links.filter(link => 
      link.text.toLowerCase().includes(filter.toLowerCase()) ||
      link.url.toLowerCase().includes(filter.toLowerCase())
    ),
    images: scrapedData.images.filter(img => 
      img.alt.toLowerCase().includes(filter.toLowerCase()) ||
      img.src.toLowerCase().includes(filter.toLowerCase())
    ),
    text: scrapedData.text.filter(text => 
      text.toLowerCase().includes(filter.toLowerCase())
    )
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Web Scraper Pro</h1>
          <p className="text-lg text-gray-600">Extract valuable data from any website with enhanced reliability and error handling</p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Input Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://traviscad.org or traviscad.org"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    onKeyPress={(e) => e.key === 'Enter' && scrapeWebsite()}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter any website URL. HTTPS will be added automatically if not specified.
                </p>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  onClick={scrapeWebsite}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Scrape Website
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            {isLoading && scrapingProgress && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">{scrapingProgress}</span>
                </div>
              </div>
            )}

            {/* Advanced Options */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Scraping Options</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">Content Types</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'includeText', label: 'Text Content' },
                      { key: 'includeLinks', label: 'Links' },
                      { key: 'includeImages', label: 'Images' },
                      { key: 'includeMetadata', label: 'Metadata' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={options[key as keyof ScrapeOptions] as boolean}
                          onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">Content Limits</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { key: 'maxLinks', label: 'Max Links', max: 500 },
                      { key: 'maxImages', label: 'Max Images', max: 200 },
                      { key: 'maxTextElements', label: 'Max Text', max: 1000 }
                    ].map(({ key, label, max }) => (
                      <div key={key}>
                        <label className="block text-xs text-gray-600 mb-1">{label}</label>
                        <input
                          type="number"
                          min="1"
                          max={max}
                          value={options[key as keyof ScrapeOptions] as number}
                          onChange={(e) => setOptions(prev => ({ 
                            ...prev, 
                            [key]: Math.min(max, Math.max(1, parseInt(e.target.value) || 1))
                          }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-2">Request Settings</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Timeout (seconds)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={options.timeout / 1000}
                        onChange={(e) => setOptions(prev => ({ 
                          ...prev, 
                          timeout: Math.min(120000, Math.max(5000, (parseInt(e.target.value) || 30) * 1000))
                        }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Retry Attempts</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={options.retryAttempts}
                        onChange={(e) => setOptions(prev => ({ 
                          ...prev, 
                          retryAttempts: Math.min(5, Math.max(1, parseInt(e.target.value) || 3))
                        }))}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">Scraping Failed</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <div className="mt-3 text-xs text-red-500">
                  <p className="font-medium">Troubleshooting tips for Travis CAD and similar sites:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>The website may have strict CORS policies or anti-bot protection</li>
                    <li>Try increasing the timeout and retry attempts in settings</li>
                    <li>Some government/emergency services sites block automated requests</li>
                    <li>Check if the URL is correct and the site is accessible in your browser</li>
                    <li>The site may be temporarily down or experiencing high traffic</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {scrapedData && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              {/* Results Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div className="flex items-center gap-2 mb-4 lg:mb-0">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Scraping Results</h2>
                  <div className="flex items-center gap-2">
                    {scrapedData.status.statusCode && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        HTTP {scrapedData.status.statusCode}
                      </span>
                    )}
                    {scrapedData.status.proxyUsed && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {scrapedData.status.proxyUsed}
                      </span>
                    )}
                    {scrapedData.status.responseTime && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {scrapedData.status.responseTime}ms
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Filter results..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                    />
                  </div>
                  <button
                    onClick={exportData}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 flex items-center gap-2 justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Website Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{filteredData.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{filteredData.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <span className="truncate max-w-md">{url}</span>
                  </div>
                  {scrapedData.status.contentType && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{scrapedData.status.contentType}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8 overflow-x-auto">
                  {[
                    { key: 'text', label: 'Text Content', icon: FileText, count: filteredData.text.length },
                    { key: 'links', label: 'Links', icon: Link, count: filteredData.links.length },
                    { key: 'images', label: 'Images', icon: Image, count: filteredData.images.length },
                    { key: 'metadata', label: 'Metadata', icon: Globe, count: Object.keys(filteredData.metadata).length }
                  ].map(({ key, label, icon: Icon, count }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as any)}
                      className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                        activeTab === key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === 'text' && (
                  <div className="space-y-4">
                    {filteredData.text.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No text content found or text extraction was disabled.</p>
                      </div>
                    ) : (
                      filteredData.text.map((text, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                          <p className="text-gray-800 leading-relaxed">{text}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'links' && (
                  <div className="space-y-3">
                    {filteredData.links.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Link className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No links found or link extraction was disabled.</p>
                      </div>
                    ) : (
                      filteredData.links.map((link, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{link.text}</p>
                            <p className="text-sm text-blue-600 truncate hover:text-blue-800">
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                {link.url}
                              </a>
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0" />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'images' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.images.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No images found or image extraction was disabled.</p>
                      </div>
                    ) : (
                      filteredData.images.map((image, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                          <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                }
                              }}
                            />
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">{image.alt}</p>
                          <p className="text-xs text-blue-600 truncate">
                            <a href={image.src} target="_blank" rel="noopener noreferrer">
                              {image.src}
                            </a>
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <div className="space-y-3">
                    {Object.keys(filteredData.metadata).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No metadata found or metadata extraction was disabled.</p>
                      </div>
                    ) : (
                      Object.entries(filteredData.metadata).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                            <span className="font-medium text-gray-900 sm:w-1/3 break-words">{key}:</span>
                            <span className="text-gray-700 flex-1 break-words">{value}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebScraper;