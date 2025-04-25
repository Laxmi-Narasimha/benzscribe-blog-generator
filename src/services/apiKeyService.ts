// apiKeyService.ts - A service to manage API keys
// For simplicity, this uses localStorage, but can be enhanced with server-side storage

// Default key to use if no custom key is found
const DEFAULT_API_KEY = "68112bfd05d0c4991f37cb9953f25811d5d345aa142beac859f22e031865fdb7";

/**
 * Get the API key - first tries to get from localStorage, otherwise returns default
 */
export function getAPIKey(): string {
  try {
    // In a browser environment, try to get from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedKey = localStorage.getItem('serpapi_key');
      if (storedKey) return storedKey;
    }
  } catch (error) {
    console.warn('Error accessing localStorage:', error);
  }
  
  // Return default key if no custom key found
  return DEFAULT_API_KEY;
}

/**
 * Save an API key to localStorage
 */
export function saveAPIKey(key: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('serpapi_key', key);
      return true;
    }
  } catch (error) {
    console.error('Error saving API key:', error);
  }
  return false;
}

/**
 * Clear the stored API key and revert to default
 */
export function clearAPIKey(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('serpapi_key');
    }
  } catch (error) {
    console.error('Error clearing API key:', error);
  }
} 