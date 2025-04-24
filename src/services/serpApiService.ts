import { Keyword, Reference } from "@/lib/types";
// We no longer need getAPIKey here as Vite proxy handles it
// import { getAPIKey } from './apiKeyService';

// Define the base path for our API calls proxied by Vite
const API_BASE_PATH = '/api/serp';

// Define SERP API base URL
const SERP_API_BASE_URL = 'https://serpapi.com/search';

// Remove MOCK_PROXY_URL constant
// const MOCK_PROXY_URL = 'http://localhost:3333/proxy';

interface SearchParams {
  q: string;
  engine?: string;
  gl?: string;
  hl?: string;
  num?: number;
  // api_key is added by the Vite proxy, not needed here
}

// Define types for SerpAPI response
interface SerpApiResponse {
  organic_results?: Array<{
    title?: string;
    link?: string;
    displayed_link?: string;
    source?: string;
  }>;
  related_searches?: Array<{ query: string }>;
  related_questions?: Array<{ question: string }>;
  suggestions?: string[];
  // Add fields for error handling
  search_metadata?: {
    status?: string;
    error?: string;
  };
  error?: string;
}

// Helper function to simplify long topics for keyword searches
function simplifyTopicForKeywords(topic: string): string {
  if (!topic) return '';
  
  // If topic has a colon, try taking the part after it
  const colonIndex = topic.indexOf(':');
  if (colonIndex !== -1 && topic.length > colonIndex + 1) {
    const simplified = topic.substring(colonIndex + 1).trim();
    // Use the simplified part only if it's reasonably long
    if (simplified.length > 5) {
      console.log(`[API Service] Simplifying topic "${topic}" to "${simplified}" for keyword search.`);
      return simplified;
    }
  }

  // If topic is very long, take the first ~7 words as a guess
  const words = topic.split(' ');
  if (words.length > 10) {
    const simplified = words.slice(0, 7).join(' ');
    console.log(`[API Service] Simplifying topic "${topic}" to "${simplified}" for keyword search.`);
    return simplified;
  }
  
  // Otherwise, use the original topic
  return topic;
}

// Updated fetch function to use Vite's proxy
const fetchWithViteProxy = async (searchParams: SearchParams): Promise<SerpApiResponse> => {
  try {
    // Log the API call that would have been made
    const url = new URL(API_BASE_PATH, window.location.origin);
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });

    console.log(`[API Service] Making API request via SERP API: ${url.pathname}${url.search}`);
    
    // Make the actual API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`[API Service] API returned status ${response.status}`);
      throw new Error(`API returned status ${response.status}`);
    }
    
    // Parse and return the data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[API Service] Error in fetchWithViteProxy:', error);
    // Return an empty response
    return {
      organic_results: [],
      related_searches: [],
      related_questions: []
    };
  }
};

export const serpApiService = {
  /**
   * Get competitor articles based on a topic
   * @param topic The topic to search for
   * @returns Array of Reference objects
   */
  async getCompetitorArticles(topic: string): Promise<Reference[]> {
    try {
      console.log(`[API Service] Starting search for competitor articles for topic: "${topic}"`);
      
      // Use the topic directly as the query
      const query = topic; 

      const searchParams: SearchParams = {
        q: query,
        engine: 'google',
        num: 10,
        gl: 'us',
        hl: 'en',
      };

      const data = await fetchWithViteProxy(searchParams);
      console.log('[API Service] Response received for competitor articles');

      const organicResults = data.organic_results || [];
      console.log(`[API Service] Found ${organicResults.length} organic results`);

      // Convert organic results to references
      const references = organicResults
        .filter(result => result.title && result.link)
        .slice(0, 5)
        .map((result, index) => ({
          id: `serp-${index}`,
          title: result.title || 'Unknown Title',
          url: result.link || 'https://example.com',
          source: result.displayed_link || result.source || 'Unknown Source',
        }));

      // If no references found, throw an error to be handled by the caller
      if (references.length === 0) {
        throw new Error('No references found from API');
      }

      return references;
    } catch (error) {
      console.error('[API Service] Error fetching competitor articles:', error);
      // Re-throw the error to be handled by the caller
      throw error;
    }
  },

  /**
   * Get mock references when API fails
   * @param topic The topic to create mock references for
   * @returns Array of mock Reference objects
   */
  getMockReferences(topic: string): Reference[] {
    return [
      {
        id: 'mock-serp-1',
        title: `${topic} - The Ultimate Guide (2023)`,
        url: 'https://example.com/guide',
        source: 'example.com'
      },
      {
        id: 'mock-serp-2',
        title: `How to Understand ${topic} - Complete Tutorial`,
        url: 'https://example.com/tutorial',
        source: 'example.com'
      },
      {
        id: 'mock-serp-3',
        title: `${topic}: Everything You Need to Know in 2023`,
        url: 'https://example.com/complete-guide',
        source: 'example.com'
      },
      {
        id: 'mock-serp-4',
        title: `The Complete ${topic} Handbook for Beginners`,
        url: 'https://example.com/handbook',
        source: 'example.com'
      },
      {
        id: 'mock-serp-5',
        title: `${topic} Trends and Future Outlook`,
        url: 'https://example.com/trends',
        source: 'example.com'
      }
    ];
  },

  /**
   * Get primary keywords for a topic with volume data
   * @param topic The main topic
   * @returns Array of Keyword objects
   */
  async getPrimaryKeywords(topic: string): Promise<Keyword[]> {
    try {
      // Simplify the topic for a better keyword query
      const keywordQuery = simplifyTopicForKeywords(topic);
      if (!keywordQuery) {
        console.warn("[API Service] Topic is empty, cannot fetch primary keywords.");
        throw new Error("Empty topic provided");
      }
      
      console.log(`[API Service] Starting search for primary keywords using query: "${keywordQuery}" (Original topic: "${topic}")`);

      const searchParams: SearchParams = {
        q: keywordQuery, // Use the potentially simplified query
        engine: 'google',
        gl: 'us',
        hl: 'en',
      };

      const data = await fetchWithViteProxy(searchParams);
      console.log('[API Service] Response received for primary keywords');

      const relatedSearches = data.related_searches || [];
      const relatedQuestions = data.related_questions || [];
      console.log(`[API Service] Found ${relatedSearches.length} related searches and ${relatedQuestions.length} related questions`);

      const keywords = [
        ...relatedSearches.map(search => search.query),
        ...relatedQuestions.map(question => question.question),
      ].filter(Boolean);

      console.log(`[API Service] Total of ${keywords.length} combined keywords before filtering`);

      // --- Keyword Volume Simulation --- 
      const keywordObjects = keywords
        .filter(keyword => keyword && keyword.length > 0)
        .slice(0, 10)
        .map((keyword, index) => {
          const volumeBase = 10000 - index * 500;
          const volumeVariance = Math.floor(Math.random() * 1000);
          const volume = Math.max(volumeBase + volumeVariance, 200);
          const difficultyBase = 30 + index * 2;
          const difficultyVariance = Math.floor(Math.random() * 10);
          const difficulty = Math.min(difficultyBase + difficultyVariance, 70);
          return {
            id: `keyword-${index}`,
            text: keyword,
            volume,
            difficulty,
          };
        });
      // --- End Simulation --- 

      const mainKeywordExists = keywordObjects.some(k => 
        k.text.toLowerCase() === topic.toLowerCase() || k.text.toLowerCase() === keywordQuery.toLowerCase()
      );
      if (!mainKeywordExists) {
        // Add the original topic back if it wasn't found
        keywordObjects.unshift({
          id: 'k-main',
          text: topic, 
          volume: Math.floor(Math.random() * 20000) + 15000, 
          difficulty: Math.floor(Math.random() * 20) + 50, 
        });
      }

      return keywordObjects;
    } catch (error) {
      console.error('[API Service] Error in getPrimaryKeywords:', error);
      throw error;
    }
  },

  /**
   * Get secondary keywords for a topic
   * @param topic The main topic
   * @param primaryKeyword Optional primary keyword to find related secondary keywords
   * @returns Array of Keyword objects
   */
  async getSecondaryKeywords(topic: string, primaryKeyword?: string): Promise<Keyword[]> {
    try {
      // Simplify the base topic for a better keyword query
      const simplifiedTopic = simplifyTopicForKeywords(topic);
      const baseQuery = primaryKeyword ? `${simplifiedTopic} ${primaryKeyword}` : simplifiedTopic;
      
      if (!baseQuery) {
          console.warn("[API Service] Base query is empty, cannot fetch secondary keywords.");
          throw new Error("Empty base query for secondary keywords");
      }

      console.log(`[API Service] Starting search for secondary keywords using query: "${baseQuery}" (Original topic: "${topic}")`);

      const searchParams: SearchParams = {
        q: baseQuery, // Use the potentially simplified query
        engine: 'google',
        gl: 'us',
        hl: 'en',
      };

      const data = await fetchWithViteProxy(searchParams);
      console.log('[API Service] Response received for secondary keywords');

      const relatedSearches = data.related_searches || [];
      const relatedQuestions = data.related_questions || [];
      const suggestions = data.suggestions || []; 
      console.log(`[API Service] Found ${relatedSearches.length} related searches, ${relatedQuestions.length} questions, ${suggestions.length} suggestions`);

      const keywords = [
        ...relatedSearches.map(search => search.query),
        ...relatedQuestions.map(question => question.question),
        ...suggestions,
      ].filter(Boolean);

      const uniqueKeywords = [...new Set(keywords)].filter(keyword => {
        if (!keyword) return false;
        // Filter out the primary topic/keyword itself
        if (primaryKeyword && keyword.toLowerCase().includes(primaryKeyword.toLowerCase())) return false;
        if (keyword.toLowerCase() === topic.toLowerCase()) return false; 
        if (keyword.toLowerCase() === simplifiedTopic.toLowerCase()) return false; // Also filter simplified
        return true;
      });

      console.log(`[API Service] ${uniqueKeywords.length} unique secondary keywords after filtering`);

      // --- Keyword Volume Simulation --- 
      const keywordObjects = uniqueKeywords
        .slice(0, 12)
        .map((keyword, index) => {
          const volumeBase = 5000 - index * 400;
          const volumeVariance = Math.floor(Math.random() * 800);
          const volume = Math.max(volumeBase + volumeVariance, 100);
          const difficultyBase = 20 + index * 2;
          const difficultyVariance = Math.floor(Math.random() * 10);
          const difficulty = Math.min(difficultyBase + difficultyVariance, 60);
          return {
            id: `secondary-${index}`,
            text: keyword,
            volume,
            difficulty,
          };
        });
      // --- End Simulation --- 

      return keywordObjects;
    } catch (error) {
      console.error('[API Service] Error in getSecondaryKeywords:', error);
      throw error;
    }
  }
};

// Add a mock function for development/testing
function getMockReferences(topic: string): Reference[] {
  console.log('Generating mock references for topic:', topic);
  
  // Create more realistic mock references based on the topic
  return [
    {
      id: 'mock-ref-1',
      title: `Latest Research on ${topic} - Harvard Business Review`,
      url: 'https://hbr.org/research',
      source: 'hbr.org'
    },
    {
      id: 'mock-ref-2',
      title: `The Complete Guide to Understanding ${topic} - Research Gate`,
      url: 'https://www.researchgate.net',
      source: 'researchgate.net'
    },
    {
      id: 'mock-ref-3',
      title: `${topic}: A Comprehensive Analysis - Journal of Applied Research`,
      url: 'https://www.journals.elsevier.com/applied-research',
      source: 'elsevier.com'
    },
    {
      id: 'mock-ref-4',
      title: `Latest Developments in ${topic} - MIT Technology Review`,
      url: 'https://www.technologyreview.com',
      source: 'technologyreview.com'
    },
    {
      id: 'mock-ref-5',
      title: `${topic} Industry Insights - McKinsey Quarterly`,
      url: 'https://www.mckinsey.com/quarterly',
      source: 'mckinsey.com'
    }
  ];
}

// Fallback functions to ensure we always return something - only used in case of API failures

function getFallbackReferences(topic: string): Reference[] {
  console.warn('Using fallback references due to API error');
  return [
    {
      id: 'fallback-ref-1',
      title: `${topic} - A Comprehensive Guide`,
      url: 'https://example.com/comprehensive-guide',
      source: 'example.com'
    },
    {
      id: 'fallback-ref-2',
      title: `The Ultimate Guide to ${topic}`,
      url: 'https://example.com/ultimate-guide',
      source: 'example.com'
    },
    {
      id: 'fallback-ref-3',
      title: `${topic}: Everything You Need to Know`,
      url: 'https://example.com/everything-to-know',
      source: 'example.com'
    }
  ];
}

function getFallbackKeywords(topic: string): Keyword[] {
  console.warn('Using fallback keywords due to API error');
  return [
    {
      id: 'fallback-k-1',
      text: topic,
      volume: 5000,
      difficulty: 45
    },
    {
      id: 'fallback-k-2',
      text: `benefits of ${topic}`,
      volume: 3500,
      difficulty: 35
    },
    {
      id: 'fallback-k-3',
      text: `types of ${topic}`,
      volume: 4200,
      difficulty: 30
    },
    {
      id: 'fallback-k-4',
      text: `how to use ${topic}`,
      volume: 2800,
      difficulty: 25
    },
    {
      id: 'fallback-k-5',
      text: `best ${topic}`,
      volume: 6500,
      difficulty: 55
    }
  ];
}

function getFallbackSecondaryKeywords(topic: string, primaryKeyword?: string): Keyword[] {
  console.warn('Using fallback secondary keywords due to API error');
  const baseKeyword = primaryKeyword || topic;
  return [
    {
      id: 'fallback-sk-1',
      text: `${baseKeyword} examples`,
      volume: 1200,
      difficulty: 20
    },
    {
      id: 'fallback-sk-2',
      text: `compare ${baseKeyword}`,
      volume: 800,
      difficulty: 15
    },
    {
      id: 'fallback-sk-3',
      text: `${baseKeyword} alternatives`,
      volume: 1500,
      difficulty: 25
    },
    {
      id: 'fallback-sk-4',
      text: `${baseKeyword} advantages`,
      volume: 900,
      difficulty: 18
    },
    {
      id: 'fallback-sk-5',
      text: `${baseKeyword} disadvantages`,
      volume: 850,
      difficulty: 17
    }
  ];
}

// Remove searchOnGoogle function as it's no longer the primary way and uses old proxy logic
/*
export async function searchOnGoogle(query: string, limit: number = 10) {
  // ... old implementation ...
}
*/